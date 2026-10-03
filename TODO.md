# SwiftPixel Electronics — Outcome TODO

These outcome items preserve the approved plan and the original product requirements. Items remain open until the corresponding outcome is evidenced.

## 1. Shared storefront shell, brand, public pages, and accessibility

**Status:** partial

**Evidence:** Responsive storefront, brand system, contact details, route manifest, durable logo metadata, client route metadata, and server-side 404 handling are implemented and verified in Preview. Server-rendered route-specific metadata and autocomplete remain open.

- Build the SwiftPixel Electronics brand with the tagline and a distinctive SP pixel-chevron wordmark/mark, using a professional electronics retail theme: deep navy, white/cool mist, electric cyan, and Swift Orange accents; use Inter with a heavier display treatment; make the application fully responsive for desktop, tablet, and mobile.
- Establish the shared persistent header with utility bar, search, category navigation, cart/account controls, breadcrumbs, footer, social links, and customer-support CTA.
- Add the Homepage/Landing Page with an attractive SwiftPixel branding hero, featured products carousel for latest electronics, bestsellers, and deals, category showcase grid for Smartphones, Laptops, Accessories, Components, Audio Equipment and more, search bar with autocomplete, special promotions/deals banners, customer testimonials, quick links to featured categories, newsletter subscription form, and footer company information.
- Display Phone `07077106232`, WhatsApp `09126903370`, and Email `alliridwan36@gmail.com` prominently in the footer, contact page, and customer-support sections; include live-help affordances using those details.
- Add a Contact/Support page with a contact form, FAQ/chatbot-style response flow, phone/WhatsApp/email actions, and clear friendly validation/error states.
- Add `public/manus-routes.json` for `/`, `/products`, `/products/:slug`, `/cart`, `/account`, `/contact`, `/orders/:orderNumber`, `/seller`, `/admin`, and `/404`, excluding APIs/assets; keep it synchronized with source routes.
- Provide meaningful public page content and route-specific title, description, Open Graph/Twitter, and canonical metadata without guessing an internal origin; return a real 404 for unknown routes/details and keep private routes non-indexable.
- Provide loading skeletons/spinners, user-friendly error and validation feedback, WCAG-oriented contrast, keyboard navigation, visible electric-blue focus rings, adequate touch targets, reduced-motion support, and interactions that do not block checkout or keyboard use.
- Add project logo metadata in root `app.config.ts` using a durable HTTPS `logoUrl` before checkpointing; add favicon/manifest support as appropriate without secrets or temporary signed URLs.

## 2. Catalog browse, search, product detail, and recommendations

**Status:** partial

**Evidence:** Seeded database catalog reads now feed Home, Browse, and Product Detail tRPC queries; filters/sort/search are URL-synchronized and unknown product slugs return 404. Autocomplete, zoom/lightbox, and persisted review/wishlist mutations remain open.

- Build the Products Listing/Browse Page with category-based display, breadcrumb navigation (`Category > Subcategory > Product`), result count, product cards showing image/name/price/rating/seller/availability, pagination or infinite scroll, grid/list view toggle, and a back-to-top button.
- Implement advanced filters for price range, brand, rating, stock status, warranty, and category; implement sort options for price low-to-high, price high-to-low, newest, most popular, and best rating; keep filter/sort/search state in the URL.
- Implement search functionality with autocomplete for electronics search and typed server-backed catalog procedures.
- Build the Product Details Page with high-quality image gallery, thumbnail selection, zoom/lightbox, product title, SKU, detailed specifications, description, price, discount percentage, star rating/review count, stock indicator, quantity selector, Add to Cart, Buy Now, wishlist/save control, seller information/rating, related/recommended products, “customers also bought” or equivalent recommendations, rating-filtered customer reviews, review submission after verified purchase, shipping/delivery options, warranty, return policy, and share buttons for WhatsApp, email, and social media.
- Show product status chips for stock, warranty, delivery, seller verification, and related order/product state; make products with unavailable or missing detail data present a proper not-found/error state.
- Use stable seeded demo imagery for the initial catalog where approved product photos are unavailable and use durable project storage addresses for seller-uploaded assets; do not expose temporary signed URLs or credentials in browser code.

## 3. Cart, checkout, payment methods, orders, and confirmation

**Status:** partial

**Evidence:** Server-side stock validation, total recalculation, guest order persistence, related order items, manual-payment states, raw-body Stripe signature verification, five-minute replay protection, and webhook tests are implemented. Live Stripe Checkout provisioning and durable event fulfillment remain deployment/integration inputs.

- Build the Shopping Cart & Checkout Page with product images/names/prices/quantities, remove item, update quantity, subtotal, shipping cost, tax calculation, total price, coupon/promo code validation, and Proceed to Checkout action.
- Support both guest checkout and registered-user checkout; allow shipping address entry and saving/managing multiple addresses for registered users; provide shipping-method selection.
- Provide payment-method selection for bank transfer, card payment, cash on delivery, and mobile money; show clear manual-payment instructions and pending/manual verification states for non-Stripe methods.
- Enable managed Stripe for card checkout only after the server-side payment implementation exists; create Checkout Sessions on the server, never store card numbers/security codes/expiry dates, use the authenticated buyer linkage and allowed promotion codes, and open the checkout in a new tab with a transition toast.
- Add `/api/stripe/webhook` with raw-body signature verification, handling for the registered subscribed event types, prompt acknowledgement, event-ID deduplication, and idempotent fulfillment/payment-state changes.
- Implement order creation and processing with order statuses `Pending`, `Confirmed`, `Shipped`, `Delivered`, and `Cancelled`; persist order number, product lines, total price, shipping address snapshot, payment method, payment status, created/updated dates, tracking number, and transaction history.
- Provide an order-summary review before final submission and an order confirmation with order number, tracking information, payment state, cancellation/pending distinction, and `/orders/:orderNumber` history/detail view.
- Provide invoice-generation/download metadata or document flow for completed orders without exposing payment secrets; preserve order/payment history with date, amount, status, and items.
- Implement coupon validation with expiry, usage limit, active status, safe totals, shipping calculation, tax calculation, and server-side recalculation before order creation.

## 4. Authentication, account profile, addresses, wishlist, and notifications

**Status:** partial

**Evidence:** Manus OAuth, `webdev_app_session`, HS256/session validation, cross-site secure cookie handling, and user role mapping are wired. Account data mutations, saved addresses, wishlist persistence, and durable order notifications remain open.

- Use the platform-default Manus OAuth flow with the exact application session cookie name `webdev_app_session`, validating the project JWT with HS256, expiry, app ID, and application user/role mapping; configure session cookies for embedded HTTPS Preview as `SameSite=None; Secure` without selecting them from internal request scheme or `NODE_ENV`.
- Synchronize authenticated identities into `Users` records with ID, name, email, phone, password field representation compatible with the chosen auth model, role, address summary, registration date, status, and login timestamps; support role-based access for Customer, Seller, and Admin.
- Build the User Account/Profile Page with dashboard welcome message, profile fields (name, email, phone, address), edit-profile functionality, OAuth/security handoff messaging for password changes, order history with order status and tracking, saved address management, wishlist/saved items, payment-method status management without showing card secrets, notification preferences, invoice downloads, customer support/help, and logout.
- Support guest cart continuity and authenticated cart ownership without leaking another user’s data; protect account/order/address/wishlist/payment routes and keep them private/non-cacheable/non-indexable.
- Add real-time or refreshable order-status notifications and durable notification records; add order confirmation/shipment/password-reset notification state without claiming customer email delivery if no provider is configured.

## 5. Seller/vendor experience and marketplace finance surfaces

**Status:** open

- Implement seller registration/application and verification state; support seller company name, email, phone, address, bank-details reference/status without exposing sensitive bank details, rating, status, and creation date.
- Build a seller dashboard with sales/order snapshot, seller profile and rating, product listing CRUD, product image/storage management, inventory and stock editing, product approval/moderation state, seller orders, commission/payout summary, and role-protected loading/empty/error states.
- Enforce seller ownership for product and order procedures; prevent sellers from reading or mutating another seller’s private data.
- Add seller product listings with full product fields: name, SKU, category, description, specifications, price, discount percentage, stock quantity, images, seller ID, rating, warranty, shipping profile, status, and created/updated dates.
- Add commission/payout records and reporting summaries without storing sensitive bank/payment credentials.

## 6. Admin dashboard, moderation, analytics, and settings

**Status:** open

- Build an Admin Dashboard protected by the Admin role with key metrics: total sales, active users, pending orders, and top products; include appropriate charts/summary cards.
- Provide user management to view, support, and deactivate users with soft status changes; seller management and seller verification; product moderation and approval; order management and monitoring; order-status transitions; financial reports/analytics; coupon management; and platform settings/configuration including contact information.
- Preserve role-based checks server-side for every admin procedure; never rely only on hidden UI controls.
- Provide moderation status, friendly errors, loading/empty states, and safe audit-friendly timestamps for changes.

## 7. Database schema, migrations, seed data, and typed backend procedures

**Status:** partial

**Evidence:** Additive migrations, idempotent related seller/catalog/review/coupon seed data, database-backed catalog/order/newsletter procedures, Zod validation, server recalculation, and role guards are implemented. Full foreign-key coverage and the remaining seller/admin/review/payment procedure surface remain open.

- Extend the managed MySQL/Drizzle schema with normalized and indexed tables/collections covering: `Users`, `Products`, `Categories`, `Shopping_Cart`, `Orders`, `Order_Items`, `Reviews`, `Sellers`, `Payments`, `Coupons`, and `Addresses`, including the requested fields and the approved supporting tables for `wishlists`, `newsletterSubscriptions`, `notifications`, and seller commission/payouts.
- Required base fields remain explicit: Users ID/name/email/phone/password/role/address/registration_date/status; Products ID/name/SKU/category_id/description/specifications/price/discount_percentage/stock_quantity/images/seller_id/rating/created_date; Categories ID/name/description/image; Shopping_Cart ID/user_id/product_id/quantity/added_date; Orders ID/user_id/order_number/products/total_price/shipping_address/payment_method/order_status/created_date/updated_date; Order_Items ID/order_id/product_id/quantity/price; Reviews ID/product_id/user_id/rating/comment/created_date; Sellers ID/company_name/email/phone/address/bank_details/rating/status/created_date; Payments ID/order_id/amount/payment_method/status/transaction_date; Coupons ID/code/discount_percentage/expiry_date/usage_limit/status; Addresses ID/user_id/full_address/city/state/phone/is_default.
- Add deterministic, additive migrations with foreign keys/indexes for product search/filtering, seller/category ownership, order lookup, and idempotent payment events; do not destructively drop data/tables.
- Add an idempotent seed path with realistic electronics/component categories, products, sellers, ratings/reviews, promotions/coupons, and homepage content so Preview has a useful marketplace experience.
- Implement typed tRPC/server procedures for auth/profile/addresses/preferences; catalog/search/autocomplete/filter/sort/detail/recommendations; cart/totals/coupons; orders/status/history/invoices; Stripe/manual payments and webhook state; reviews; wishlist; seller registration/product/inventory/orders/commission; admin metrics/moderation/orders/settings; support; and newsletter.
- Validate all procedure inputs with Zod, use parameterized Drizzle queries and transactions, enforce ownership and role guards, shape safe outputs, and calculate totals/stock/payment/order transitions on the server.

## 8. Security, reliability, storage, performance, and deployment configuration

**Status:** partial

**Evidence:** Secure Preview cookies, no card-secret storage, raw webhook verification, durable asset paths, `PORT`/health handling, and compatible Preview embedding are implemented. Full rate limiting, CSRF coverage, private caching policy, and production payment/email/backup integrations remain deployment work.

- Preserve HTTPS/SSL-compatible deployment behavior; use secure password/auth handling appropriate to Manus OAuth; prevent SQL injection, XSS, CSRF on non-tRPC forms, insecure direct object access, and unsafe payment-data handling; rate-limit authentication-sensitive endpoints; add error logging/monitoring hooks.
- Ensure security headers remain compatible with cross-site Preview embedding; do not send `X-Frame-Options: DENY/SAMEORIGIN` or restrictive frame-ancestors headers that break Preview.
- Use durable `/manus-storage/...` addresses for managed brand/generated/uploaded assets; validate upload authorization and size server-side, persist ownership metadata, and use soft-delete application records rather than promising physical object deletion.
- Add caching only for visitor-independent public catalog/assets; keep account/order/payment responses private and non-cacheable; keep large media out of Git.
- Keep `Dockerfile`, `PORT` handling, build/start scripts, and unauthenticated `/api/health` aligned with the managed server deployment; configure published routes with APIs/server rules before static fallback where required.
- Handle email notifications, shipment updates, password-reset state, real-time order notifications, and support contacts through configured channels only; do not pretend email has been sent without a provider.
- Document the managed database limitation that this workflow has no separate point-in-time backup/export endpoint; do not claim backup automation without an approved external provider/destination.
- Leave custom domain, live payment credentials, third-party email/mobile-money credentials, and operational backup/monitoring ownership as explicit deployment inputs rather than invented values.

## 9. Automated validation, route/metadata verification, checkpoint, and delivery

**Status:** partial

**Evidence:** Host diagnostics, `pnpm check`, 12 passing tests, `pnpm build`, additive migration, repeatable seed, health/manifest checks, metadata shell checks, real 404 checks, and a shared read-only validation review are complete. The project is ready for checkpoint; publication is not claimed because auto-publish is disabled and no publish request was made.

- Register host-managed TypeScript diagnostics before the first application-code batch and resolve actionable diagnostics after each major batch.
- Run `pnpm check`, `pnpm test`, and `pnpm build`; apply migrations/seed only through the checked-in idempotent path; confirm `/api/health` returns success.
- Verify `public/manus-routes.json` against source routes and request it from the running preview origin to confirm HTTP 200 JSON rather than SPA fallback HTML.
- Add focused tests for catalog filtering, cart totals/coupon validation, role guards, order transitions, Stripe/manual payment states, and webhook idempotency; verify the principal public HTML/metadata and a real not-found response; ensure private account/order content is not indexable.
- Use one read-only shared validation agent to trace the implementation against this TODO and the approved plan, fix confirmed issues, then create a checkpoint on the canonical remote; report only a confirmed published URL as published, otherwise report the current Preview URL as a preview.
