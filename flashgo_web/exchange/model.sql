create table`coupon_sku` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sku_type` int(11) NOT NULL,
  `deal_id` int(11) NOT NULL DEFAULT 0,
  `price` int(11) NOT NULL,
  `title` varchar(128),
  `description` varchar(512),
  `rule` varchar(512),
  `thumb_url` varchar(128),
  `auto_approval` tinyint NOT NULL,
  `stock` int(11),
  `sales` int(11),
  `status` tinyint,

  `validity_duration_seconds` int(11),

  `jump_url` varchar(128),
  `store_name` varchar(128),
  `audit_days` int(11),

  `created_time` TIMESTAMP,
  `updated_time` TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=100001 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

create table `coupons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sku_id` int(11) NOT NULL,
  `user_id` varchar(256),
  `unique_id` varchar(512),
  `code` varchar(256),

  `expiry_timestamp`  int(11),
  `exchange_timestamp`  int(11),

  `status` tinyint NOT NULL DEFAULT 0,

  `created_time` TIMESTAMP,
  `updated_time` TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_id` (`unique_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

create table `coupon_sku_histories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sku_id` int(11) NOT NULL,
  `user_id` varchar(256),
  `sales` int(11),
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id_sku_id` (`user_id`, `sku_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
