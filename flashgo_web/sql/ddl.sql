-- Create syntax for TABLE 'coin_users'
CREATE TABLE `coin_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(128) NOT NULL,
  `invite_code` varchar(128) DEFAULT NULL,
  `facebook_token` varchar(128) DEFAULT NULL,
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'common_categories'
CREATE TABLE `common_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parentid` int(11) NOT NULL,
  `en_name` varchar(100) NOT NULL,
  `id_name` varchar(100) NOT NULL,
  `level` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'common_channels'
CREATE TABLE `common_channels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(300) NOT NULL,
  `image_one` varchar(2000) NOT NULL,
  `image_two` varchar(2000) NOT NULL,
  `status` int(11) NOT NULL,
  `createdtime` datetime(6) NOT NULL,
  `image_logo` varchar(2000) DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'common_ecommerces'
CREATE TABLE `common_ecommerces` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `logo` longtext,
  `domain` varchar(300) DEFAULT NULL,
  `description` longtext NOT NULL,
  `created_time` datetime(6) NOT NULL,
  `updated_time` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'deals_dealarticleimages'
CREATE TABLE `deals_dealarticleimages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `deal_id` int(11) NOT NULL,
  `order` int(11) NOT NULL,
  `image` varchar(2000) NOT NULL,
  `createdtime` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `common_dealarticleimages_deal_id_order_8f0c3e24_uniq` (`deal_id`,`order`),
  KEY `deals_dealarticleimages_deal_id_index` (`deal_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'deals_dealarticles'
CREATE TABLE `deals_dealarticles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `deal_id` int(11) NOT NULL,
  `article` longtext NOT NULL,
  `createdtime` datetime(6) NOT NULL,
  `updatedtime` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `deals_dealarticles_deal_id_uindex` (`deal_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'deals_dealcategories'
CREATE TABLE `deals_dealcategories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `deal_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `level` int(11) NOT NULL,
  `createdtime` datetime(6) NOT NULL,
  `updatedtime` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `deals_dealcategories_deal_id_category_id_uindex` (`deal_id`,`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'deals_deals'
CREATE TABLE `deals_deals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ecommerce_id` int(11) NOT NULL,
  `title` varchar(500) NOT NULL,
  `description` longtext NOT NULL,
  `type` varchar(1) NOT NULL,
  `off` double NOT NULL,
  `original_price` double NOT NULL,
  `current_price` double NOT NULL,
  `sales` int(11) NOT NULL,
  `stock` int(11) NOT NULL,
  `comments` int(11) NOT NULL,
  `stars` double NOT NULL,
  `valid` smallint(6) NOT NULL,
  `trackinglink` varchar(1000) NOT NULL,
  `deeplink` varchar(1000) NOT NULL,
  `weblink` varchar(1000) NOT NULL,
  `createdtime` datetime(6) NOT NULL,
  `crawledtime` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'deals_flashdeals'
CREATE TABLE `deals_flashdeals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `deal_id` int(11) NOT NULL,
  `starttime` datetime(6) NOT NULL,
  `endtime` datetime(6) NOT NULL,
  `createdtime` datetime(6) NOT NULL,
  `updatedtime` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `deals_flashdeals_deal_id_uindex` (`deal_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'favorite_interests'
CREATE TABLE `favorite_interests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `en_name` varchar(200) NOT NULL,
  `category_id` int(11) NOT NULL,
  `createdtime` datetime(6) NOT NULL,
  `id_name` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'favorite_userfavorite'
CREATE TABLE `favorite_userfavorite` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(100) NOT NULL,
  `deal_id` int(11) NOT NULL,
  `created_time` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `favorite_userfavorite_user_id_deal_id_uindex` (`user_id`,`deal_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'favorite_userflashremind'
CREATE TABLE `favorite_userflashremind` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(100) NOT NULL,
  `deal_id` int(11) NOT NULL,
  `createdtime` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `favorite_userflashremind_user_id_deal_id_uindex` (`user_id`,`deal_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'favorite_userinterests'
CREATE TABLE `favorite_userinterests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(100) NOT NULL,
  `interest_id` int(11) NOT NULL,
  `createdtime` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `favorite_userinterests_user_id_interest_id_uindex` (`user_id`,`interest_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'favorite_userreportdealerrors'
CREATE TABLE `favorite_userreportdealerrors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(1000) NOT NULL,
  `deal_id` int(11) NOT NULL,
  `error` varchar(1000) NOT NULL,
  `createdtime` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'qas'
CREATE TABLE `qas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question` varchar(2048) DEFAULT NULL,
  `answer` varchar(4096) DEFAULT NULL,
  `status` int(11) DEFAULT '0',
  `category` varchar(64) DEFAULT NULL,
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'users'
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(128) NOT NULL,
  `firebase_user_id` varchar(128) NOT NULL,
  `fcm_token` varchar(512) DEFAULT NULL,
  `gender` varchar(8) DEFAULT NULL,
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `name` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `firebase_user_id` (`firebase_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;