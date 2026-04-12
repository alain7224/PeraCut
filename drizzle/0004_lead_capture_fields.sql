ALTER TABLE `users` ADD `ageRange` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `consentAge` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `consentMarketing` tinyint DEFAULT 0;
