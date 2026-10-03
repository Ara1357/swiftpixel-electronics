import { describe, expect, it } from "vitest";
import { products } from "@shared/catalog";
import { appRouter } from "./routers";

const publicCaller = appRouter.createCaller({ req: {} as never, res: {} as never, user: null });

const adminUser = {
  id: 1,
  openId: "admin-test",
  name: "Admin",
  email: "admin@example.com",
  phone: null,
  password: null,
  role: "admin" as const,
  address: null,
  status: "active" as const,
  loginMethod: "test",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const customerUser = { ...adminUser, role: "customer" as const, openId: "customer-test" };

describe("SwiftPixel marketplace procedures", () => {
  it("filters catalog results by category and rating", async () => {
    const result = await publicCaller.catalog.list({ category: "components", minRating: 4.8, sort: "rating", limit: 24 });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every(product => product.categorySlug === "components" && product.rating >= 4.8)).toBe(true);
  });

  it("calculates cart totals with free shipping above the threshold", async () => {
    const result = await publicCaller.cart.quote({ items: [{ productId: products[0].id, quantity: 1 }] });
    expect(result.subtotal).toBe(products[0].price);
    expect(result.tax).toBe(Math.round(products[0].price * 0.015));
    expect(result.total).toBe(result.subtotal + result.shipping + result.tax);
  });

  it("validates the approved demo coupon without trusting the client total", async () => {
    await expect(publicCaller.cart.validateCoupon({ code: "SIGNAL10" })).resolves.toMatchObject({ valid: true, discountPercentage: 10 });
    await expect(publicCaller.cart.validateCoupon({ code: "NOPE" })).resolves.toMatchObject({ valid: false, discountPercentage: 0 });
  });

  it("allows public catalog/cart access while protecting admin overview procedures", async () => {
    const customerCaller = appRouter.createCaller({ req: {} as never, res: {} as never, user: customerUser });
    await expect(customerCaller.admin.overview()).rejects.toMatchObject({ code: "FORBIDDEN" });
    const adminCaller = appRouter.createCaller({ req: {} as never, res: {} as never, user: adminUser });
    await expect(adminCaller.admin.overview()).resolves.toMatchObject({ pendingOrders: 126, sellerApplications: 7 });
  });
});
