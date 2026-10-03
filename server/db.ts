import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { categories, InsertUser, newsletterSubscriptions, orderItems, orders, productsTable, sellers, users } from "../drizzle/schema";
import { products as demoProducts, type Product } from "@shared/catalog";
import { ENV } from "./_core/env";

type Db = ReturnType<typeof drizzle>;
let _db: Db | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "phone", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    for (const field of textFields) {
      const value = user[field];
      if (value !== undefined) { values[field] = value ?? null; updateSet[field] = value ?? null; }
    }
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

function normalizeProduct(row: { product: typeof productsTable.$inferSelect; category?: typeof categories.$inferSelect | null; seller?: typeof sellers.$inferSelect | null }): Product {
  const product = row.product;
  const specs = parseJson<Product["specs"]>(product.specifications, []);
  const images = parseJson<string[]>(product.images, []);
  const price = Number(product.price);
  const discount = Number(product.discountPercentage ?? 0);
  const compareAt = discount > 0 ? Math.round(price / (1 - discount / 100)) : undefined;
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: row.category?.name ?? "Electronics",
    categorySlug: row.category?.slug ?? "electronics",
    brand: product.brand ?? "SwiftPixel",
    sku: product.sku,
    price,
    compareAt,
    rating: Number(product.rating ?? 0),
    reviews: product.reviewCount ?? 0,
    stock: product.stockQuantity,
    warranty: product.warranty ?? "12 months",
    seller: row.seller?.companyName ?? "SwiftPixel Official",
    sellerRating: Number(row.seller?.rating ?? 4.8),
    description: product.description ?? "",
    specs,
    images: images.length ? images : demoProducts.find(item => item.slug === product.slug)?.images ?? [],
    tags: [row.category?.slug ?? "electronics"],
  };
}

export async function listCatalogProducts(): Promise<Product[] | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select({ product: productsTable, category: categories, seller: sellers })
    .from(productsTable)
    .leftJoin(categories, eq(productsTable.categoryId, categories.id))
    .leftJoin(sellers, eq(productsTable.sellerId, sellers.id))
    .where(eq(productsTable.status, "approved"));
  return rows.map(normalizeProduct);
}

export async function getCatalogProduct(slug: string): Promise<Product | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select({ product: productsTable, category: categories, seller: sellers })
    .from(productsTable)
    .leftJoin(categories, eq(productsTable.categoryId, categories.id))
    .leftJoin(sellers, eq(productsTable.sellerId, sellers.id))
    .where(and(eq(productsTable.slug, slug), eq(productsTable.status, "approved")))
    .limit(1);
  return rows[0] ? normalizeProduct(rows[0]) : null;
}

export type CreateOrderInput = {
  userId?: number | null;
  orderNumber: string;
  items: Array<{ productId: number; quantity: number; price: number; name: string }>;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingAddress: string;
  paymentMethod: string;
};

export async function createOrderRecord(input: CreateOrderInput): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db.insert(orders).values({
    userId: input.userId ?? null,
    orderNumber: input.orderNumber,
    products: JSON.stringify(input.items),
    subtotal: input.subtotal.toString(),
    shippingCost: input.shippingCost.toString(),
    tax: input.tax.toString(),
    totalPrice: input.total.toString(),
    shippingAddress: input.shippingAddress,
    shippingMethod: "standard",
    paymentMethod: input.paymentMethod,
    paymentStatus: input.paymentMethod === "cod" ? "manual_review" : "pending",
    orderStatus: "Pending",
  });
  const orderId = Number((result as unknown as Array<{ insertId?: number }>)[0]?.insertId ?? 0);
  if (orderId) {
    await db.insert(orderItems).values(input.items.map(item => ({
      orderId,
      productId: item.productId,
      sellerId: null,
      productSnapshot: JSON.stringify({ name: item.name, price: item.price }),
      quantity: item.quantity,
      price: item.price.toString(),
      discount: "0",
      lineTotal: (item.price * item.quantity).toString(),
    })));
  }
  return true;
}

export async function subscribeNewsletter(email: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  await db.insert(newsletterSubscriptions).values({ email: email.toLowerCase() }).onDuplicateKeyUpdate({ set: { status: "active" } });
  return true;
}
