CREATE TABLE `benchmarkComparisons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`investorId` int NOT NULL,
	`benchmarkId` int NOT NULL,
	`moicPercentile` decimal(5,2),
	`irrPercentile` decimal(5,2),
	`returnPercentile` decimal(5,2),
	`attribution` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `benchmarkComparisons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dealRoomDiscussions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dealRoomId` int NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`replyCount` int NOT NULL DEFAULT 0,
	`lastActivityAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dealRoomDiscussions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dealRoomDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dealRoomId` int NOT NULL,
	`uploadedById` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`documentType` varchar(50) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileSize` int,
	`mimeType` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dealRoomDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dealRooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fundingRoundId` int NOT NULL,
	`ventureId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` varchar(50) NOT NULL DEFAULT 'active',
	`accessLevel` varchar(50) NOT NULL DEFAULT 'investors',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dealRooms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `investorReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`investorId` int NOT NULL,
	`reportType` varchar(50) NOT NULL,
	`reportingPeriod` varchar(100) NOT NULL,
	`reportData` json NOT NULL,
	`totalPortfolioValue` decimal(15,2),
	`unrealizedValue` decimal(15,2),
	`realizedValue` decimal(15,2),
	`status` varchar(50) NOT NULL DEFAULT 'draft',
	`pdfUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `investorReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performanceBenchmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`benchmarkName` varchar(255) NOT NULL,
	`sector` varchar(100) NOT NULL DEFAULT 'all',
	`reportingPeriod` varchar(100) NOT NULL,
	`metrics` json NOT NULL,
	`fundCount` int,
	`totalAUM` decimal(15,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `performanceBenchmarks_id` PRIMARY KEY(`id`)
);
