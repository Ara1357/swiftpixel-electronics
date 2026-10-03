import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { categories, products } from "@shared/catalog";
import * as db from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME } from "@shared/const";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";

const memoryMessages: Array<{ email: string; name: string; topic: string; message: string; createdAt: string }> = [];
const memoryNewsletter = new Set<string>();
const memoryOrders: Array<{ orderNumber: string; userId: number; total: number; status: string; createdAt: string }> = [];

const productQuerySchema = z.object({
  query: z.string().trim().max(120).optional(),
  category: z.string().trim().max(80).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  minRating: z.number().min(0).max(5).optional(),
  inStock: z.boolean().optional(),
  sort: z.enum(["featured", "deal", "price-low", "price-high", "newest", "rating"]).default("featured"),
  limit: z.number().int().min(1).max(50).default(24),
});

export const appRouter = router({
  system: router({
    health: publicProcedure.query(() => ({ status: "ok", service: "swiftpixel" })),
  }),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    profile: protectedProcedure.query(({ ctx }) => ({
      id: ctx.user.id,
      name: ctx.user.name,
      email: ctx.user.email,
      phone: ctx.user.phone,
      role: ctx.user.role,
      status: ctx.user.status,
    })),
  }),
  catalog: router({
    categories: publicProcedure.query(() => categories),
    featured: publicProcedure.query(async () => { const source = (await db.listCatalogProducts()) ?? products; return { items: (source.length ? source : products).slice(0, 6), total: source.length || products.length }; }),
    autocomplete: publicProcedure.input(z.object({ query: z.string().trim().min(1).max(80) })).query(({ input }) => {
      const query = input.query.toLowerCase();
      return products.filter(product => `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(query)).slice(0, 6).map(product => ({ slug: product.slug, name: product.name, category: product.category, price: product.price }));
    }),
    list: publicProcedure.input(productQuerySchema.optional()).query(async ({ input }) => {
      const filters = input ?? { sort: "featured" as const, limit: 24 };
      const source = (await db.listCatalogProducts()) ?? products;
      let items = (source.length ? source : products).filter(product => {
        const searchable = `${product.name} ${product.brand} ${product.category} ${product.tags.join(" ")}`.toLowerCase();
        return (!filters.query || searchable.includes(filters.query.toLowerCase())) && (!filters.category || filters.category === "all" || product.categorySlug === filters.category) && (filters.minPrice === undefined || product.price >= filters.minPrice) && (filters.maxPrice === undefined || product.price <= filters.maxPrice) && (filters.minRating === undefined || product.rating >= filters.minRating) && (!filters.inStock || product.stock > 0);
      });
      if (filters.sort === "price-low") items = [...items].sort((a, b) => a.price - b.price);
      if (filters.sort === "price-high") items = [...items].sort((a, b) => b.price - a.price);
      if (filters.sort === "rating") items = [...items].sort((a, b) => b.rating - a.rating);
      if (filters.sort === "newest") items = [...items].reverse();
      if (filters.sort === "deal") items = [...items].sort((a, b) => (b.compareAt ? b.compareAt - b.price : 0) - (a.compareAt ? a.compareAt - a.price : 0));
      return { items: items.slice(0, filters.limit), total: items.length };
    }),
    bySlug: publicProcedure.input(z.object({ slug: z.string().min(1).max(260) })).query(async ({ input }) => {
      const source = (await db.listCatalogProducts()) ?? products;
      const catalog = source.length ? source : products;
      const product = catalog.find(item => item.slug === input.slug);
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      return { product, related: catalog.filter(item => item.id !== product.id && item.categorySlug === product.categorySlug).slice(0, 4) };
    }),
  }),
  cart: router({
    quote: publicProcedure.input(z.object({ items: z.array(z.object({ productId: z.number().int(), quantity: z.number().int().min(1).max(99) })) })).query(({ input }) => {
      const lines = input.items.map(line => {
        const product = products.find(item => item.id === line.productId);
        if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "A cart product is unavailable" });
        if (line.quantity > product.stock) throw new TRPCError({ code: "BAD_REQUEST", message: `${product.name} has limited stock` });
        return { product, quantity: line.quantity, lineTotal: product.price * line.quantity };
      });
      const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
      const shipping = subtotal > 250000 ? 0 : 3500;
      const tax = Math.round(subtotal * 0.015);
      return { lines, subtotal, shipping, tax, total: subtotal + shipping + tax };
    }),
    validateCoupon: publicProcedure.input(z.object({ code: z.string().trim().min(3).max(48) })).query(({ input }) => input.code.toUpperCase() === "SIGNAL10" ? { valid: true, discountPercentage: 10, message: "10% off applied" } : { valid: false, discountPercentage: 0, message: "That code is not active" }),
  }),
  orders: router({
    create: publicProcedure.input(z.object({ total: z.number().nonnegative().optional(), paymentMethod: z.enum(["card", "transfer", "cod", "mobile"]), shippingAddress: z.string().min(8).max(500), items: z.array(z.object({ productId: z.number().int(), quantity: z.number().int().min(1).max(99) })).min(1) })).mutation(async ({ input, ctx }) => {
      const source = (await db.listCatalogProducts()) ?? products;
      const catalog = source.length ? source : products;
      const lines = input.items.map(item => {
        const product = catalog.find(candidate => candidate.id === item.productId);
        if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "A cart product is unavailable" });
        if (item.quantity > product.stock) throw new TRPCError({ code: "BAD_REQUEST", message: `${product.name} has limited stock` });
        return { product, quantity: item.quantity, price: product.price, name: product.name };
      });
      const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
      const shippingCost = subtotal > 250000 ? 0 : 3500;
      const tax = Math.round(subtotal * 0.015);
      const total = subtotal + shippingCost + tax;
      const orderNumber = `SPX-${Date.now().toString().slice(-6)}`;
      const persisted = await db.createOrderRecord({ orderNumber, userId: ctx.user?.id ?? null, items: lines.map(line => ({ productId: line.product.id, quantity: line.quantity, price: line.price, name: line.name })), subtotal, shippingCost, tax, total, shippingAddress: input.shippingAddress, paymentMethod: input.paymentMethod });
      memoryOrders.push({ orderNumber, userId: ctx.user?.id ?? 0, total, status: "Pending", createdAt: new Date().toISOString() });
      return { orderNumber, status: "Pending", paymentMethod: input.paymentMethod, subtotal, shippingCost, tax, total, persisted };
    }),
    history: protectedProcedure.query(({ ctx }) => memoryOrders.filter(order => order.userId === ctx.user.id)),
  }),
  payments: router({
    createCheckout: protectedProcedure.input(z.object({ orderNumber: z.string().min(3), paymentMethod: z.enum(["card", "transfer", "cod", "mobile"]) })).mutation(({ input }) => ({ orderNumber: input.orderNumber, paymentMethod: input.paymentMethod, status: input.paymentMethod === "card" ? "requires_checkout" : "manual_review", checkoutUrl: input.paymentMethod === "card" ? null : undefined })),
  }),
  reviews: router({
    list: publicProcedure.input(z.object({ productId: z.number().int(), rating: z.number().int().min(1).max(5).optional() })).query(({ input }) => [{ id: 1, productId: input.productId, rating: 5, comment: "Exactly as described and carefully packed.", author: "Verified buyer", createdAt: "2026-10-01" }, { id: 2, productId: input.productId, rating: 4, comment: "Good value and clear delivery updates.", author: "Verified buyer", createdAt: "2026-09-26" }].filter(review => !input.rating || review.rating === input.rating)),
    submit: protectedProcedure.input(z.object({ productId: z.number().int(), rating: z.number().int().min(1).max(5), comment: z.string().min(10).max(1000) })).mutation(({ input }) => ({ ...input, status: "pending" as const, message: "Review submitted for moderation" })),
  }),
  wishlist: router({
    list: protectedProcedure.query(() => products.slice(2, 6)),
    toggle: protectedProcedure.input(z.object({ productId: z.number().int() })).mutation(({ input }) => ({ productId: input.productId, saved: true })),
  }),
  newsletter: router({
    subscribe: publicProcedure.input(z.object({ email: z.string().email() })).mutation(async ({ input }) => { memoryNewsletter.add(input.email.toLowerCase()); const persisted = await db.subscribeNewsletter(input.email); return { success: true, persisted, message: "You’re on the list" }; }),
  }),
  support: router({
    submit: publicProcedure.input(z.object({ name: z.string().min(2).max(120), email: z.string().email(), topic: z.string().min(2).max(120), message: z.string().min(10).max(2000) })).mutation(({ input }) => { memoryMessages.push({ ...input, createdAt: new Date().toISOString() }); return { success: true, message: "Message received" }; }),
  }),
  seller: router({
    snapshot: protectedProcedure.query(() => ({ status: "pending", views: 2438, ordersToDispatch: 14, rating: 4.8, products: products.slice(0, 4) })),
    submitApplication: protectedProcedure.input(z.object({ companyName: z.string().min(2).max(180), phone: z.string().min(7).max(32), address: z.string().min(8).max(500) })).mutation(({ input }) => ({ ...input, status: "pending" as const, message: "Seller application received" })),
  }),
  admin: router({
    overview: adminProcedure.query(() => ({ totalSales: 18400000, activeUsers: 8294, pendingOrders: 126, topProducts: 42, sellerApplications: 7, listingReviews: 12 })),
    moderation: adminProcedure.query(() => ({ ordersNeedingAttention: 18, sellerApplications: 7, listingsInReview: 12 })),
  }),
});

export type AppRouter = typeof appRouter;
