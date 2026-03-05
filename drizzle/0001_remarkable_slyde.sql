CREATE TABLE `analyticsEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`eventType` varchar(100) NOT NULL,
	`referenceId` int,
	`referenceType` varchar(50),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analyticsEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `connectionRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`senderId` int NOT NULL,
	`receiverId` int NOT NULL,
	`ventureId` int,
	`message` text,
	`status` enum('pending','accepted','declined') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `connectionRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `diasporaEngagements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`ventureId` int,
	`type` enum('investment','mentorship','partnership','sponsorship','donation') NOT NULL DEFAULT 'mentorship',
	`amount` decimal(15,2),
	`currency` varchar(10) DEFAULT 'USD',
	`notes` text,
	`status` enum('pending','active','completed','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `diasporaEngagements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`uploaderId` int NOT NULL,
	`ventureId` int,
	`type` enum('pitch_deck','business_plan','financial_projection','legal_document','due_diligence','other') NOT NULL DEFAULT 'other',
	`name` varchar(255) NOT NULL,
	`fileKey` varchar(1000) NOT NULL,
	`fileUrl` varchar(1000) NOT NULL,
	`mimeType` varchar(100),
	`fileSize` int,
	`accessLevel` enum('public','verified_investors','connected_only','private') NOT NULL DEFAULT 'private',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `investorPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`preferredSectors` json,
	`preferredStages` json,
	`preferredGeographies` json,
	`minInvestment` decimal(15,2),
	`maxInvestment` decimal(15,2),
	`investmentThesis` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `investorPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `investorPreferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `matches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ventureId` int NOT NULL,
	`investorId` int NOT NULL,
	`compatibilityScore` int,
	`matchRationale` text,
	`matchFactors` json,
	`status` enum('suggested','viewed','interested','connected','declined','invested') NOT NULL DEFAULT 'suggested',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `matches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`senderId` int NOT NULL,
	`receiverId` int NOT NULL,
	`connectionId` int,
	`content` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('new_match','connection_request','message','project_update','funding_request','moderation_update','system') NOT NULL DEFAULT 'system',
	`title` varchar(255) NOT NULL,
	`titleAr` varchar(255),
	`body` text,
	`bodyAr` text,
	`referenceId` int,
	`referenceType` varchar(50),
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sectors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`nameAr` varchar(100),
	`slug` varchar(100) NOT NULL,
	`description` text,
	`descriptionAr` text,
	`parentId` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sectors_id` PRIMARY KEY(`id`),
	CONSTRAINT `sectors_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `ventures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`founderId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`titleAr` varchar(255),
	`tagline` varchar(500),
	`taglineAr` varchar(500),
	`description` text NOT NULL,
	`descriptionAr` text,
	`sectorId` int,
	`subsectors` json,
	`stage` enum('idea','prototype','mvp','early_traction','growth','scaling') NOT NULL DEFAULT 'idea',
	`fundingTarget` decimal(15,2),
	`fundingRaised` decimal(15,2) DEFAULT '0',
	`currency` varchar(10) DEFAULT 'USD',
	`country` varchar(100),
	`teamSize` int DEFAULT 1,
	`website` varchar(500),
	`pitchDeckUrl` varchar(1000),
	`aiReadinessScore` int,
	`aiAnalysis` json,
	`moderationStatus` enum('draft','submitted','ai_reviewed','under_review','published','rejected','incubation') NOT NULL DEFAULT 'draft',
	`moderationNotes` text,
	`isPublic` boolean NOT NULL DEFAULT false,
	`viewCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ventures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `waitlist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`role` enum('founder','investor','mentor','diaspora','other') NOT NULL DEFAULT 'founder',
	`country` varchar(100),
	`message` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `waitlist_id` PRIMARY KEY(`id`),
	CONSTRAINT `waitlist_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `platformRole` enum('founder','investor','mentor','diaspora','admin','pending') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `verificationStatus` enum('unverified','pending','verified','rejected') DEFAULT 'unverified' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `profileData` json;--> statement-breakpoint
ALTER TABLE `users` ADD `preferredLanguage` enum('en','ar') DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `isProfileComplete` boolean DEFAULT false NOT NULL;