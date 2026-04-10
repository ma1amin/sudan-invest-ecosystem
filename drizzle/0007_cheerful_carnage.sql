ALTER TABLE `lpFunds` MODIFY COLUMN `currentSize` decimal(15,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `lpInvestors` MODIFY COLUMN `capitalCalled` decimal(15,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `lpInvestors` MODIFY COLUMN `distributionsReceived` decimal(15,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `lpInvestors` MODIFY COLUMN `currentNAV` decimal(15,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `lpInvestors` MODIFY COLUMN `irrToDate` decimal(5,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `lpInvestors` MODIFY COLUMN `moic` decimal(5,2) DEFAULT '0';