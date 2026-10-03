CREATE TABLE `addresses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fullAddress` text NOT NULL,
	`city` varchar(100) NOT NULL,
	`state` varchar(100) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`isDefault` int NOT NULL DEFAULT 0,
	CONSTRAINT `addresses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shopping_cart` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`guestToken` varchar(128),
	`productId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shopping_cart_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`parentId` int,
	`name` varchar(120) NOT NULL,
	`slug` varchar(160) NOT NULL,
	`description` text,
	`image` text,
	`active` int NOT NULL DEFAULT 1,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_idx` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(48) NOT NULL,
	`discountPercentage` decimal(5,2) NOT NULL,
	`expiryDate` timestamp,
	`usageLimit` int,
	`usageCount` int NOT NULL DEFAULT 0,
	`status` enum('active','inactive','expired') NOT NULL DEFAULT 'active',
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupons_code_idx` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `newsletter_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`status` enum('active','unsubscribed') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `newsletter_subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletter_subscriptions_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(80) NOT NULL,
	`title` varchar(180) NOT NULL,
	`message` text,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`sellerId` int,
	`productSnapshot` text,
	`quantity` int NOT NULL,
	`price` decimal(12,2) NOT NULL,
	`discount` decimal(12,2) NOT NULL DEFAULT '0',
	`lineTotal` decimal(12,2) NOT NULL,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`orderNumber` varchar(40) NOT NULL,
	`products` text,
	`totalPrice` decimal(12,2) NOT NULL,
	`subtotal` decimal(12,2) NOT NULL,
	`shippingCost` decimal(12,2) NOT NULL DEFAULT '0',
	`tax` decimal(12,2) NOT NULL DEFAULT '0',
	`shippingAddress` text NOT NULL,
	`shippingMethod` varchar(80),
	`paymentMethod` varchar(80) NOT NULL,
	`paymentStatus` enum('pending','paid','failed','refunded','manual_review') NOT NULL DEFAULT 'pending',
	`orderStatus` enum('Pending','Confirmed','Shipped','Delivered','Cancelled') NOT NULL DEFAULT 'Pending',
	`trackingNumber` varchar(80),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_order_number_idx` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'NGN',
	`paymentMethod` varchar(80) NOT NULL,
	`status` enum('pending','paid','failed','refunded','manual_review') NOT NULL DEFAULT 'pending',
	`stripeSessionId` varchar(180),
	`stripePaymentIntentId` varchar(180),
	`processedEventId` varchar(180),
	`transactionDate` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_event_idx` UNIQUE(`processedEventId`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(240) NOT NULL,
	`slug` varchar(260) NOT NULL,
	`sku` varchar(80) NOT NULL,
	`categoryId` int,
	`brand` varchar(120),
	`description` text,
	`specifications` text,
	`price` decimal(12,2) NOT NULL,
	`discountPercentage` decimal(5,2) NOT NULL DEFAULT '0',
	`stockQuantity` int NOT NULL DEFAULT 0,
	`images` text,
	`sellerId` int,
	`warranty` varchar(80),
	`shippingProfile` varchar(120),
	`rating` decimal(3,2) NOT NULL DEFAULT '0',
	`reviewCount` int NOT NULL DEFAULT 0,
	`status` enum('draft','pending','approved','rejected','archived') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_idx` UNIQUE(`slug`),
	CONSTRAINT `products_sku_idx` UNIQUE(`sku`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`userId` int NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`verifiedPurchase` int NOT NULL DEFAULT 0,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seller_payouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sellerId` int NOT NULL,
	`orderId` int,
	`grossAmount` decimal(12,2) NOT NULL,
	`commissionAmount` decimal(12,2) NOT NULL,
	`payoutAmount` decimal(12,2) NOT NULL,
	`status` enum('pending','processing','paid','held') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `seller_payouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sellers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyName` varchar(180) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`address` text,
	`bankDetails` text,
	`rating` decimal(3,2) NOT NULL DEFAULT '0',
	`status` enum('pending','verified','suspended') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sellers_id` PRIMARY KEY(`id`),
	CONSTRAINT `sellers_user_idx` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `wishlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wishlists_id` PRIMARY KEY(`id`),
	CONSTRAINT `wishlist_user_product_idx` UNIQUE(`userId`,`productId`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','customer','seller','admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `password` text;--> statement-breakpoint
ALTER TABLE `users` ADD `address` text;--> statement-breakpoint
ALTER TABLE `users` ADD `status` enum('active','inactive','pending') DEFAULT 'active' NOT NULL;--> statement-breakpoint
CREATE INDEX `cart_user_product_idx` ON `shopping_cart` (`userId`,`productId`);--> statement-breakpoint
CREATE INDEX `cart_guest_idx` ON `shopping_cart` (`guestToken`);--> statement-breakpoint
CREATE INDEX `notifications_user_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `orders_user_idx` ON `orders` (`userId`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`orderStatus`);--> statement-breakpoint
CREATE INDEX `payments_order_idx` ON `payments` (`orderId`);--> statement-breakpoint
CREATE INDEX `products_category_idx` ON `products` (`categoryId`);--> statement-breakpoint
CREATE INDEX `products_seller_idx` ON `products` (`sellerId`);--> statement-breakpoint
CREATE INDEX `products_status_idx` ON `products` (`status`);--> statement-breakpoint
CREATE INDEX `reviews_product_idx` ON `reviews` (`productId`);--> statement-breakpoint
CREATE INDEX `reviews_rating_idx` ON `reviews` (`rating`);--> statement-breakpoint
CREATE INDEX `sellers_status_idx` ON `sellers` (`status`);--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);