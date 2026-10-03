import { int, index, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, uniqueIndex } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  password: text("password"),
  role: mysqlEnum("role", ["user", "customer", "seller", "admin"]).default("user").notNull(),
  address: text("address"),
  status: mysqlEnum("status", ["active", "inactive", "pending"]).default("active").notNull(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, table => ({ emailIdx: index("users_email_idx").on(table.email), roleIdx: index("users_role_idx").on(table.role) }));

export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  parentId: int("parentId"),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull(),
  description: text("description"),
  image: text("image"),
  active: int("active").default(1).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ slugIdx: uniqueIndex("categories_slug_idx").on(table.slug) }));

export const sellers = mysqlTable("sellers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  companyName: varchar("companyName", { length: 180 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  address: text("address"),
  bankDetails: text("bankDetails"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0").notNull(),
  status: mysqlEnum("status", ["pending", "verified", "suspended"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ userIdx: uniqueIndex("sellers_user_idx").on(table.userId), statusIdx: index("sellers_status_idx").on(table.status) }));

export const productsTable = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 240 }).notNull(),
  slug: varchar("slug", { length: 260 }).notNull(),
  sku: varchar("sku", { length: 80 }).notNull(),
  categoryId: int("categoryId"),
  brand: varchar("brand", { length: 120 }),
  description: text("description"),
  specifications: text("specifications"),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  discountPercentage: decimal("discountPercentage", { precision: 5, scale: 2 }).default("0").notNull(),
  stockQuantity: int("stockQuantity").default(0).notNull(),
  images: text("images"),
  sellerId: int("sellerId"),
  warranty: varchar("warranty", { length: 80 }),
  shippingProfile: varchar("shippingProfile", { length: 120 }),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0").notNull(),
  reviewCount: int("reviewCount").default(0).notNull(),
  status: mysqlEnum("status", ["draft", "pending", "approved", "rejected", "archived"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ slugIdx: uniqueIndex("products_slug_idx").on(table.slug), skuIdx: uniqueIndex("products_sku_idx").on(table.sku), categoryIdx: index("products_category_idx").on(table.categoryId), sellerIdx: index("products_seller_idx").on(table.sellerId), statusIdx: index("products_status_idx").on(table.status) }));

export const cartItems = mysqlTable("shopping_cart", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  guestToken: varchar("guestToken", { length: 128 }),
  productId: int("productId").notNull(),
  quantity: int("quantity").default(1).notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ userProductIdx: index("cart_user_product_idx").on(table.userId, table.productId), guestIdx: index("cart_guest_idx").on(table.guestToken) }));

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  orderNumber: varchar("orderNumber", { length: 40 }).notNull(),
  products: text("products"),
  totalPrice: decimal("totalPrice", { precision: 12, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  shippingCost: decimal("shippingCost", { precision: 12, scale: 2 }).default("0").notNull(),
  tax: decimal("tax", { precision: 12, scale: 2 }).default("0").notNull(),
  shippingAddress: text("shippingAddress").notNull(),
  shippingMethod: varchar("shippingMethod", { length: 80 }),
  paymentMethod: varchar("paymentMethod", { length: 80 }).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed", "refunded", "manual_review"]).default("pending").notNull(),
  orderStatus: mysqlEnum("orderStatus", ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"]).default("Pending").notNull(),
  trackingNumber: varchar("trackingNumber", { length: 80 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ orderNumberIdx: uniqueIndex("orders_order_number_idx").on(table.orderNumber), userIdx: index("orders_user_idx").on(table.userId), statusIdx: index("orders_status_idx").on(table.orderStatus) }));

export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  sellerId: int("sellerId"),
  productSnapshot: text("productSnapshot"),
  quantity: int("quantity").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 12, scale: 2 }).default("0").notNull(),
  lineTotal: decimal("lineTotal", { precision: 12, scale: 2 }).notNull(),
});

export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  userId: int("userId").notNull(),
  rating: int("rating").notNull(),
  comment: text("comment"),
  verifiedPurchase: int("verifiedPurchase").default(0).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ productIdx: index("reviews_product_idx").on(table.productId), ratingIdx: index("reviews_rating_idx").on(table.rating), uniqueReviewIdx: uniqueIndex("reviews_product_user_idx").on(table.productId, table.userId) }));

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 8 }).default("NGN").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 80 }).notNull(),
  status: mysqlEnum("status", ["pending", "paid", "failed", "refunded", "manual_review"]).default("pending").notNull(),
  stripeSessionId: varchar("stripeSessionId", { length: 180 }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 180 }),
  processedEventId: varchar("processedEventId", { length: 180 }),
  transactionDate: timestamp("transactionDate").defaultNow().notNull(),
}, table => ({ orderIdx: index("payments_order_idx").on(table.orderId), eventIdx: uniqueIndex("payments_event_idx").on(table.processedEventId) }));

export const coupons = mysqlTable("coupons", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 48 }).notNull(),
  discountPercentage: decimal("discountPercentage", { precision: 5, scale: 2 }).notNull(),
  expiryDate: timestamp("expiryDate"),
  usageLimit: int("usageLimit"),
  usageCount: int("usageCount").default(0).notNull(),
  status: mysqlEnum("status", ["active", "inactive", "expired"]).default("active").notNull(),
}, table => ({ codeIdx: uniqueIndex("coupons_code_idx").on(table.code) }));

export const addresses = mysqlTable("addresses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fullAddress: text("fullAddress").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  isDefault: int("isDefault").default(0).notNull(),
});

export const wishlists = mysqlTable("wishlists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ uniqueItemIdx: uniqueIndex("wishlist_user_product_idx").on(table.userId, table.productId) }));

export const newsletterSubscriptions = mysqlTable("newsletter_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  status: mysqlEnum("status", ["active", "unsubscribed"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: varchar("type", { length: 80 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  message: text("message"),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ userIdx: index("notifications_user_idx").on(table.userId) }));

export const sellerPayouts = mysqlTable("seller_payouts", {
  id: int("id").autoincrement().primaryKey(),
  sellerId: int("sellerId").notNull(),
  orderId: int("orderId"),
  grossAmount: decimal("grossAmount", { precision: 12, scale: 2 }).notNull(),
  commissionAmount: decimal("commissionAmount", { precision: 12, scale: 2 }).notNull(),
  payoutAmount: decimal("payoutAmount", { precision: 12, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "processing", "paid", "held"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type ProductRow = typeof productsTable.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
export type SellerRow = typeof sellers.$inferSelect;
