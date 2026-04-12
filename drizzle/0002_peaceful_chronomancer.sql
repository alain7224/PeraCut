CREATE TABLE `presets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100) DEFAULT 'custom',
	`settings` text NOT NULL,
	`isDefault` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `presets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `presets` ADD CONSTRAINT `presets_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;