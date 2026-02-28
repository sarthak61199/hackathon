CREATE TABLE `categories`
(
    `id`             int unsigned                            NOT NULL AUTO_INCREMENT,
    `name`           varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
    `code`           varchar(255) COLLATE utf8mb3_unicode_ci          DEFAULT NULL,
    `icon`           varchar(255) COLLATE utf8mb3_unicode_ci          DEFAULT NULL,
    `last_update_by` int unsigned                                     DEFAULT NULL,
    `created_at`     timestamp                               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`     timestamp                               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `categories_name_unique` (`name`),
    UNIQUE KEY `categories_code_unique` (`code`),
    KEY `categories_last_update_by_foreign` (`last_update_by`),
    CONSTRAINT `categories_last_update_by_foreign` FOREIGN KEY (`last_update_by`) REFERENCES `employees` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB
  AUTO_INCREMENT = 15
  DEFAULT CHARSET = utf8mb3
  COLLATE = utf8mb3_unicode_ci

