CREATE TABLE `behavioralSignals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`referenceId` int,
	`scoreContribution` int DEFAULT 1,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `behavioralSignals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `investments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`investorId` int NOT NULL,
	`ventureId` int NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'USD',
	`investmentType` enum('equity','debt','grant','convertible','revenue_share','other') NOT NULL DEFAULT 'equity',
	`valuation` decimal(15,2),
	`equityPercentage` decimal(5,2),
	`status` enum('pending','active','exited','written_off') NOT NULL DEFAULT 'pending',
	`notes` text,
	`investmentDate` timestamp,
	`exitDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `investments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ventureHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ventureId` int NOT NULL,
	`previousStatus` varchar(50),
	`newStatus` varchar(50) NOT NULL,
	`changedBy` int,
	`reason` text,
	`changedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ventureHistory_id` PRIMARY KEY(`id`)
);
