CREATE TABLE `lpFunds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fundName` varchar(255) NOT NULL,
	`managerId` int NOT NULL,
	`vintageYear` int NOT NULL,
	`targetSize` decimal(15,2) NOT NULL,
	`currentSize` decimal(15,2) DEFAULT 0,
	`status` enum('raising','active','closed') NOT NULL DEFAULT 'raising',
	`metrics` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lpFunds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lpInvestors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fundId` int NOT NULL,
	`userId` int NOT NULL,
	`commitmentAmount` decimal(15,2) NOT NULL,
	`capitalCalled` decimal(15,2) DEFAULT 0,
	`distributionsReceived` decimal(15,2) DEFAULT 0,
	`currentNAV` decimal(15,2) DEFAULT 0,
	`irrToDate` decimal(5,2) DEFAULT 0,
	`moic` decimal(5,2) DEFAULT 0,
	`status` enum('active','exited','pending') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lpInvestors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lpReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fundId` int NOT NULL,
	`reportType` enum('quarterly','annual','custom') NOT NULL,
	`reportPeriod` varchar(100) NOT NULL,
	`content` json NOT NULL,
	`pdfUrl` text,
	`status` enum('draft','generated','sent') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lpReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificationPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`ventureUpdates` boolean NOT NULL DEFAULT true,
	`investorMessages` boolean NOT NULL DEFAULT true,
	`dealAlerts` boolean NOT NULL DEFAULT true,
	`portfolioUpdates` boolean NOT NULL DEFAULT true,
	`digestFrequency` enum('immediate','daily','weekly') NOT NULL DEFAULT 'immediate',
	`quietHoursStart` varchar(5),
	`quietHoursEnd` varchar(5),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificationPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notificationPreferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `pushNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`notificationType` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`relatedEntityId` int,
	`relatedEntityType` varchar(100),
	`status` enum('pending','sent','failed','read') NOT NULL DEFAULT 'pending',
	`sentAt` timestamp,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pushNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `savedSearches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`searchName` varchar(255) NOT NULL,
	`filters` json NOT NULL,
	`resultCount` int DEFAULT 0,
	`lastRunAt` timestamp,
	`alertsEnabled` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `savedSearches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `searchAlerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`savedSearchId` int NOT NULL,
	`ventureId` int NOT NULL,
	`status` enum('pending','sent','dismissed') NOT NULL DEFAULT 'pending',
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `searchAlerts_id` PRIMARY KEY(`id`)
);
