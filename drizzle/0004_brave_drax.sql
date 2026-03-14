CREATE TABLE `engagementNotificationLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ruleId` int NOT NULL,
	`founderId` int NOT NULL,
	`engagementScoreAtTime` int,
	`daysSinceLastActivity` int,
	`message` text,
	`sentSuccessfully` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `engagementNotificationLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `engagementNotificationRules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`ventureId` int NOT NULL,
	`engagementThreshold` int NOT NULL DEFAULT 30,
	`inactivityDays` int NOT NULL DEFAULT 14,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastNotificationAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `engagementNotificationRules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fundingRounds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ventureId` int NOT NULL,
	`roundType` varchar(50) NOT NULL,
	`amountRaised` decimal(15,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'USD',
	`postMoneyValuation` decimal(15,2),
	`leadInvestor` varchar(255),
	`investorCount` int,
	`status` enum('planned','active','closed','cancelled') NOT NULL DEFAULT 'planned',
	`announcementDate` timestamp,
	`closureDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fundingRounds_id` PRIMARY KEY(`id`)
);
