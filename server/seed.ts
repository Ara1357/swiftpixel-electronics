import { categories as categoryContent, products as productContent } from "@shared/catalog";
import { categories, coupons, productsTable, reviews, sellers, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { getDb } from "./db";

async function seed() {
  const db = await getDb();
  if (!db) { console.warn("[Seed] DATABASE_URL is unavailable; nothing to seed."); return; }
  try {
    for (const [sortOrder, category] of categoryContent.entries()) {
      await db.insert(categories).values({ name: category.name, slug: category.slug, description: `${category.name} selected for curious buyers and practical builders.`, image: null, sortOrder, active: 1 }).onDuplicateKeyUpdate({ set: { name: category.name, description: `${category.name} selected for curious buyers and practical builders.` } });
    }
    const categoryRows = await db.select({ id: categories.id, slug: categories.slug }).from(categories);
    const categoryBySlug = new Map(categoryRows.map(row => [row.slug, row.id]));

    const sellerSeeds = [
      { openId: "seed-seller-swiftpixel", name: "SwiftPixel Official", companyName: "SwiftPixel Official", email: "alliridwan36@gmail.com", phone: "07077106232", rating: "4.90" },
      { openId: "seed-seller-protoparts", name: "ProtoParts NG", companyName: "ProtoParts NG", email: "sellers@protoparts.example", phone: "08000000001", rating: "4.80" },
      { openId: "seed-seller-circuit", name: "Circuit House", companyName: "Circuit House", email: "sellers@circuithouse.example", phone: "08000000002", rating: "4.70" },
      { openId: "seed-seller-sound", name: "Sound Select", companyName: "Sound Select", email: "sellers@soundselect.example", phone: "08000000003", rating: "4.60" },
    ];
    const sellerIds = new Map<string, number>();
    for (const seller of sellerSeeds) {
      await db.insert(users).values({ openId: seller.openId, name: seller.name, email: seller.email, phone: seller.phone, role: "seller", status: "active", lastSignedIn: new Date() }).onDuplicateKeyUpdate({ set: { name: seller.name, email: seller.email, phone: seller.phone, role: "seller" } });
      const [sellerUser] = await db.select({ id: users.id }).from(users).where(eq(users.openId, seller.openId)).limit(1);
      if (!sellerUser) continue;
      await db.insert(sellers).values({ userId: sellerUser.id, companyName: seller.companyName, email: seller.email, phone: seller.phone, address: "Lagos, Nigeria", bankDetails: "verified_reference_only", rating: seller.rating, status: "verified" }).onDuplicateKeyUpdate({ set: { companyName: seller.companyName, rating: seller.rating, status: "verified" } });
      const [sellerRow] = await db.select({ id: sellers.id }).from(sellers).where(eq(sellers.userId, sellerUser.id)).limit(1);
      if (sellerRow) sellerIds.set(seller.companyName, sellerRow.id);
    }

    for (const product of productContent) {
      await db.insert(productsTable).values({ name: product.name, slug: product.slug, sku: product.sku, categoryId: categoryBySlug.get(product.categorySlug) ?? null, brand: product.brand, description: product.description, specifications: JSON.stringify(product.specs), price: product.price.toString(), discountPercentage: product.compareAt ? ((1 - product.price / product.compareAt) * 100).toFixed(2) : "0", stockQuantity: product.stock, images: JSON.stringify(product.images), sellerId: sellerIds.get(product.seller) ?? null, warranty: product.warranty, shippingProfile: "standard_ng", rating: product.rating.toFixed(2), reviewCount: product.reviews, status: "approved" }).onDuplicateKeyUpdate({ set: { name: product.name, categoryId: categoryBySlug.get(product.categorySlug) ?? null, sellerId: sellerIds.get(product.seller) ?? null, price: product.price.toString(), stockQuantity: product.stock, rating: product.rating.toFixed(2), reviewCount: product.reviews, status: "approved" } });
    }

    await db.insert(users).values({ openId: "seed-buyer-community", name: "SwiftPixel Community", email: "community@swiftpixel.example", role: "customer", status: "active", lastSignedIn: new Date() }).onDuplicateKeyUpdate({ set: { name: "SwiftPixel Community" } });
    const [buyer] = await db.select({ id: users.id }).from(users).where(eq(users.openId, "seed-buyer-community")).limit(1);
    const productRows = await db.select({ id: productsTable.id, slug: productsTable.slug }).from(productsTable);
    const productIds = new Map(productRows.map(row => [row.slug, row.id]));
    if (buyer) {
      for (const [index, product] of productContent.slice(0, 4).entries()) {
        const productId = productIds.get(product.slug);
        if (!productId) continue;
        await db.insert(reviews).values({ productId, userId: buyer.id, rating: index === 1 ? 4 : 5, comment: index === 1 ? "Good value and clear delivery updates." : "Exactly as described and carefully packed.", verifiedPurchase: 1, status: "approved" }).onDuplicateKeyUpdate({ set: { rating: index === 1 ? 4 : 5, comment: index === 1 ? "Good value and clear delivery updates." : "Exactly as described and carefully packed.", status: "approved" } });
      }
    }
    await db.insert(coupons).values({ code: "SIGNAL10", discountPercentage: "10", usageLimit: 1000, status: "active" }).onDuplicateKeyUpdate({ set: { discountPercentage: "10", usageLimit: 1000, status: "active" } });
    await db.insert(coupons).values({ code: "BUILD25", discountPercentage: "25", usageLimit: 250, status: "active" }).onDuplicateKeyUpdate({ set: { discountPercentage: "25", usageLimit: 250, status: "active" } });
    console.log(`[Seed] Seeded ${categoryContent.length} categories, ${sellerSeeds.length} sellers, ${productContent.length} products, reviews, and coupons.`);
  } finally {
    const client = (db as unknown as { $client?: { end?: () => Promise<void> } }).$client;
    if (client?.end) await client.end();
  }
}

seed().catch(error => { console.error("[Seed] Failed", error); process.exitCode = 1; });
