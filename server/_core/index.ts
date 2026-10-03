import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { publicPlatformScript } from "./publicConfig";
import { appRouter } from "../routers";
import * as db from "../db";
import { products as demoProducts } from "@shared/catalog";
import { verifyStripeSignature } from "./stripeWebhook";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

const processedStripeEvents = new Set<string>();

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Stripe needs the exact unparsed request bytes for signature verification.
  // Keep this route ahead of the JSON parser and acknowledge only verified events.
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), (req, res) => {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(String(req.body ?? ""));
    const signature = req.header("stripe-signature");
    const configuredSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!configuredSecret) {
      res.status(503).json({ received: false, error: "Stripe webhook is not configured" });
      return;
    }
    if (!signature || !verifyStripeSignature(rawBody, signature, configuredSecret)) {
      res.status(400).json({ received: false, error: "Invalid Stripe signature" });
      return;
    }
    try {
      const event = rawBody.length ? JSON.parse(rawBody.toString("utf8")) as { id?: string; type?: string } : {};
      if (!event.id) { res.status(400).json({ received: false, error: "Stripe event id is required" }); return; }
      if (processedStripeEvents.has(event.id)) { res.json({ received: true, deduplicated: true }); return; }
      processedStripeEvents.add(event.id);
      console.info("[Stripe] webhook received", { eventId: event.id ?? "unknown", type: event.type ?? "unknown" });
      res.json({ received: true });
    } catch {
      res.status(400).json({ received: false, error: "Invalid webhook payload" });
    }
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "swiftpixel" }));
  app.get("/api/platform/config.js", (_req, res) => {
    res.set("Cache-Control", "no-store").type("application/javascript").send(publicPlatformScript());
  });
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  app.get("/products/:slug", async (req, res, next) => {
    let existsInDatabase = null;
    try { existsInDatabase = await db.getCatalogProduct(req.params.slug); } catch (error) { console.warn("[Catalog] Product lookup unavailable:", error instanceof Error ? error.message : "unknown error"); }
    const existsInDemoCatalog = demoProducts.some(product => product.slug === req.params.slug);
    if (!existsInDatabase && !existsInDemoCatalog) { res.status(404).type("text/plain").send("Product not found"); return; }
    next();
  });
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api/") || req.path.includes(".")) { next(); return; }
    const path = req.path;
    const known = path === "/" || ["/products", "/cart", "/account", "/contact", "/seller", "/admin", "/404"].includes(path) || path.startsWith("/products/") || path.startsWith("/orders/");
    if (!known) { res.status(404).type("text/plain").send("Page not found"); return; }
    next();
  });
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = Number(process.env.PORT || "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");
  server.on("error", error => { console.error("Server failed:", error.message); process.exit(1); });
  server.listen(port, "0.0.0.0", () => console.log(`Server listening on port ${port}`));
}

startServer().catch(error => { console.error(error); process.exit(1); });
