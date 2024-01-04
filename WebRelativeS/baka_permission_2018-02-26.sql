# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: 127.0.0.1 (MySQL 5.6.35)
# Database: baka_permission
# Generation Time: 2018-02-26 06:14:35 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table jagadiri_users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `jagadiri_users`;

CREATE TABLE `jagadiri_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `birthdate` varchar(100) NOT NULL,
  `phone` varchar(100) NOT NULL,
  `city` varchar(1000) DEFAULT NULL,
  `sex` varchar(10) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `card` int(11) NOT NULL,
  `addtime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `platform` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `jagadiri_users` WRITE;
/*!40000 ALTER TABLE `jagadiri_users` DISABLE KEYS */;

INSERT INTO `jagadiri_users` (`id`, `name`, `birthdate`, `phone`, `city`, `sex`, `email`, `card`, `addtime`, `platform`)
VALUES
	(1,'123','12122012','123123','Gorontalo','0','',0,'2017-08-16 16:53:47','baca');

/*!40000 ALTER TABLE `jagadiri_users` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table role
# ------------------------------------------------------------

DROP TABLE IF EXISTS `role`;

CREATE TABLE `role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `desc` varchar(500) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;

INSERT INTO `role` (`id`, `name`, `desc`)
VALUES
	(1,'管理员','拥有所有权限'),
	(3,'keyword and trending','搜索词和trending'),
	(4,'日报－抓取频率','只能看抓取频率'),
	(5,'日报-dashboard','只能看dashboard'),
	(6,'InFeedBannerManagement','只有日报-banner的权限'),
	(7,'AdvertorialManagement','只有日报-Advertorial的权限'),
	(8,'日报-用户数据','只能看用户数据的权限'),
	(9,'新闻管理','具有CMS新闻的查询删除'),
	(10,'MagicAds','广告管理后台');

/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table rolesys
# ------------------------------------------------------------

DROP TABLE IF EXISTS `rolesys`;

CREATE TABLE `rolesys` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `roleid` int(11) NOT NULL,
  `sysid` int(11) NOT NULL,
  `sysinfoid` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `rolesys` WRITE;
/*!40000 ALTER TABLE `rolesys` DISABLE KEYS */;

INSERT INTO `rolesys` (`id`, `roleid`, `sysid`, `sysinfoid`)
VALUES
	(12,1,2,1),
	(13,1,2,2),
	(14,1,2,3),
	(25,1,1,4),
	(26,1,1,5),
	(30,1,1,6),
	(31,1,1,7),
	(37,1,1,8),
	(45,2,1,4),
	(46,2,1,5),
	(81,1,3,9),
	(82,1,3,10),
	(83,1,3,11),
	(84,3,1,7),
	(87,3,3,9),
	(88,3,3,10),
	(89,3,3,11),
	(90,1,1,12),
	(102,4,1,12),
	(103,1,1,13),
	(116,1,1,14),
	(117,5,1,4),
	(118,1,1,15),
	(133,6,1,13),
	(134,7,1,16),
	(135,1,1,16),
	(151,5,1,6),
	(153,5,1,5),
	(154,8,1,6),
	(171,1,4,17),
	(172,1,4,18),
	(173,9,4,17),
	(174,6,1,19),
	(176,1,1,19),
	(214,1,5,20),
	(215,10,5,20);

/*!40000 ALTER TABLE `rolesys` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table sys
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sys`;

CREATE TABLE `sys` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `testurl` varchar(100) NOT NULL,
  `url` varchar(100) NOT NULL,
  `status` int(11) NOT NULL COMMENT '系统状态［-1关闭，0打开］',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `sys` WRITE;
/*!40000 ALTER TABLE `sys` DISABLE KEYS */;

INSERT INTO `sys` (`id`, `name`, `testurl`, `url`, `status`)
VALUES
	(1,'日报','http://dr.t.ymark.cc','http://idcrawler.vm.newsinpalm.net/dailyreport/index.html',0),
	(2,'权限管理系统','https://www.baidu.com/','',0),
	(3,'CrawlerAdmin','','http://idcrawler.vm.newsinpalm.net/#!/dashboard/',0),
	(4,'CMS','','http://idcrawler.vm.newsinpalm.net/cms/index.html#!/',0),
	(5,'MagicAdSystem','','http://idcrawler.vm.newsinpalm.net/magicad/#/offer',0);

/*!40000 ALTER TABLE `sys` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table sysinfo
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sysinfo`;

CREATE TABLE `sysinfo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sysid` int(11) NOT NULL,
  `type` int(11) NOT NULL COMMENT 'type 		权限类型：［1页面，2功能］',
  `key` varchar(100) NOT NULL,
  `desc` varchar(500) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `sysinfo` WRITE;
/*!40000 ALTER TABLE `sysinfo` DISABLE KEYS */;

INSERT INTO `sysinfo` (`id`, `sysid`, `type`, `key`, `desc`)
VALUES
	(1,2,1,'user','用户管理权限'),
	(2,2,1,'role','角色管理'),
	(3,2,1,'system','系统管理'),
	(4,1,1,'dashboard','首页－dashboard'),
	(5,1,1,'dashboard-chart','dashboard统计 - 图表'),
	(6,1,1,'user-table','用户数据统计 - 表格\n'),
	(7,1,1,'key','关键字统计'),
	(8,1,1,'newuserpushnews-chart','新客户端推送新闻统计－图表'),
	(9,3,1,'trending-draft','Trending Channel Draft'),
	(10,3,1,'trending-history','Trending Channel History'),
	(11,3,1,'trending-report','Trending Topic Report'),
	(12,1,1,'crawl-frequency-chart','抓取频率趋势图'),
	(13,1,1,'InFeedBanner','InFeedBanner'),
	(14,1,1,'crawl-status','任务状态'),
	(15,1,1,'searchpushtable','searchpushtable'),
	(16,1,1,'Advertorial','Advertorial （目前只针对印尼）'),
	(17,4,1,'news','新闻查询页面'),
	(18,4,2,'test','测试'),
	(19,1,1,'InFeedBannerChart','InFeedBannerChart'),
	(20,5,1,'offer','offer的管理功能');

/*!40000 ALTER TABLE `sysinfo` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table temp_users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `temp_users`;

CREATE TABLE `temp_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `birthdate` varchar(100) NOT NULL,
  `phone` varchar(100) NOT NULL,
  `card` int(11) NOT NULL,
  `addtime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `city` varchar(1000) DEFAULT NULL,
  `sex` varchar(10) DEFAULT NULL,
  `platform` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `temp_users` WRITE;
/*!40000 ALTER TABLE `temp_users` DISABLE KEYS */;

INSERT INTO `temp_users` (`id`, `email`, `name`, `birthdate`, `phone`, `card`, `addtime`, `city`, `sex`, `platform`)
VALUES
	(11,'123','123','123','123',1,'2017-04-14 02:39:27',NULL,NULL,NULL),
	(12,'ijhwbb@jjs.dj','kdbnd','12122012','19384',1,'2017-04-17 07:23:23',NULL,NULL,NULL),
	(13,'ksns@dknx.ckkd','jajbs','12122012','383999',1,'2017-04-17 07:24:15',NULL,NULL,NULL),
	(14,'yulanda@newsinpalm.com','YULANDA SAVITRI','16071988','081808616788',1,'2017-04-17 07:35:47',NULL,NULL,NULL),
	(15,'fiqidap@gmail.com','Fiqi Dwi Anugri Putri','15101991','08111719901',1,'2017-04-17 07:49:20',NULL,NULL,NULL),
	(16,'adimas@newsinpalm.com','Adimas andrianto','03121988','081289703383',1,'2017-04-17 08:16:31',NULL,NULL,NULL),
	(17,'cut.andina@gmail.com','cut andina damayanti','29101986','081908199547',1,'2017-04-17 08:18:42',NULL,NULL,NULL),
	(18,'123@qq.c1','123','12122012','123',1,'2017-04-17 13:32:45',NULL,NULL,NULL),
	(19,'123@123.com','123','12122012','123',1,'2017-04-17 13:37:49',NULL,NULL,NULL),
	(20,'hsbb@sk.x','sjbs','12122012','djd',1,'2017-04-17 13:40:27',NULL,NULL,NULL),
	(21,'123@11.c','123','12122012','123',1,'2017-04-17 13:49:13',NULL,NULL,NULL),
	(22,'1233@11.com','123','12122012','123',1,'2017-04-18 02:24:04',NULL,NULL,NULL),
	(23,'12@12.1','1212','12122012','1212',1,'2017-04-18 02:26:04',NULL,NULL,NULL),
	(24,'123@123.123','123','12122012','123',1,'2017-04-18 02:28:15',NULL,NULL,NULL),
	(25,'Adimas@newsinpalm.com','Adimas andrianto@yahoo.com','03121988','081289703383',1,'2017-04-18 02:38:56',NULL,NULL,NULL),
	(26,'12312@11.cc','123123123','12122012','123',1,'2017-04-18 05:33:39',NULL,NULL,NULL),
	(27,'ferninda_alfitri@yahoo.co.id','ferninda alfitri','17021970','082169526959',1,'2017-05-03 09:55:25',NULL,NULL,NULL),
	(28,'yulijatirahayu@gmail.com','yuli ','21051972','081280062164',1,'2017-05-03 09:59:13',NULL,NULL,NULL),
	(29,'niarengganis23@gmail.com','Nia fatmawati dj','14121988','089527744363',1,'2017-05-03 13:16:07',NULL,NULL,NULL),
	(30,'ramonsaputra88@gmail.com','Risqi olimpiado','23091988','08561486974',1,'2017-05-04 08:33:03',NULL,NULL,NULL),
	(31,'mya.sitanggang@gmail.com','Mindo yuliarta sitanggang','25071981','081293934281',1,'2017-05-04 08:33:31',NULL,NULL,NULL),
	(32,'Dwiastutik385@gmail.com','Dwi Astuti','20071996','085943148244',1,'2017-05-04 09:51:58',NULL,NULL,NULL),
	(33,'asiatilawati.1234@gmail.com','asia tilawati','10051978','081284794282',1,'2017-05-04 18:06:24',NULL,NULL,NULL),
	(34,'aiidwi87@gmail.com','Dwi setiawan','09031987','082260205599',1,'2017-05-10 09:17:24',NULL,NULL,NULL),
	(35,'123@1.aa','asdf','12121996','0812 123 123132',1,'2017-05-12 10:27:27',NULL,NULL,NULL),
	(36,'my@ymark.co','12312312','12121222','08122 88 88 ',0,'2017-05-12 10:42:45',NULL,NULL,NULL),
	(37,'mytest@yma.123','123','12122012','0812838881',0,'2017-05-12 10:51:36','lkasdfj','1',NULL),
	(38,'123@11.com','123','12121212','0888877777',0,'2017-05-12 10:54:32','lakjsdf','0',NULL),
	(39,'arimaulana@yahoo.com','Ari Maulana','15111992','082221299087',1,'2017-05-15 05:13:36','Jakarta','1',NULL),
	(40,'123@123.com','123','12121212','1231231',0,'2017-05-15 06:13:55','123123','0',NULL),
	(41,'aulialrizal@gmail.com','Aulia Laratika Rizal','15031990','085294810339',0,'2017-05-15 08:29:52','Jakarta','0',NULL),
	(42,'Blue_via22@yahoo.com','Sylvia','22051989','081212981998',1,'2017-05-15 08:30:28','Jakarta','0',NULL),
	(43,'Debby.ayunita@yahoo.com','Debby Ayunita Syani','11061990','081284008461',1,'2017-05-15 08:31:12','Medan','0',NULL),
	(44,'anton@newsinpalm.com','Anton Supriadi','22031974','087882962965',0,'2017-05-15 08:32:18','Jakarta','1',NULL),
	(45,'blackrainfrogs@gmail.com','Hadi ism','22021988','0812101010101',1,'2017-05-15 08:32:30','jakarta','1',NULL),
	(46,'Vea.agnesia@gmail.com','Agnesia Vera W ','11091991','081286379563',0,'2017-05-15 08:34:14','Jakarta','0',NULL),
	(47,'fiameta@newsinpalm.com','FIAMETA RIZKI APRIANINGTYAS','03041988','087725831495',1,'2017-05-15 08:34:26','JAKARTA','0',NULL),
	(48,'shella@newsinpalm.com','shella elins fiorentina','12091988','087868776778',1,'2017-05-15 08:35:20','tjbalai asahan','0',NULL),
	(49,'12312@qq.com','ABASD','12121992','1213',0,'2017-05-15 16:53:53','123','0',NULL),
	(50,'abc@1.com','ABC','12121992','123123123123',0,'2017-05-15 16:58:05','12313','0',NULL),
	(51,'123123123@1123.com','123','12121992','088888888',0,'2017-08-14 22:35:00','DKI Jakarta','0','baca');

/*!40000 ALTER TABLE `temp_users` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table trending
# ------------------------------------------------------------

DROP TABLE IF EXISTS `trending`;

CREATE TABLE `trending` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `news_id` varchar(100) DEFAULT NULL,
  `new_news_id` varchar(100) DEFAULT NULL,
  `addtime` datetime DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `trending` WRITE;
/*!40000 ALTER TABLE `trending` DISABLE KEYS */;

INSERT INTO `trending` (`id`, `news_id`, `new_news_id`, `addtime`, `status`)
VALUES
	(91,'bfd9c9b660828dc16c240ddb2af48921','a445eeac0c6355032ccea4bb0a9c3ec0','2017-03-22 08:56:34',1),
	(92,'bfd9c9b660828dc16c240ddb2af48921','ed1891bcd2e8d6f3522c2eb8eb39ce74','2017-03-22 09:47:22',1),
	(93,'0184854df07c96ffd97f47b4dc4bb0ec','bcab07b1851514e4a35199559d247ff8','2017-03-23 03:58:06',1),
	(94,'e167bcdfaa3ba89a79edf9bb422ef51d','3e0e4e7c635da131832cf649758204b5','2017-03-23 04:26:19',1),
	(95,'a445eeac0c6355032ccea4bb0a9c3ec0','65c9e6ecebd0abccf4ca033874db0602','2017-03-23 04:37:31',1),
	(96,'42cf8e0a5fc79179116fc6d35e97b31a','b0eb92eed91e58e7209bfbad9ccbdab6','2017-03-23 04:44:42',1),
	(97,'143e64fa3358d8d005bc91f9580e8c40','cda68caf9fabd5499138078730b2cf5c','2017-03-23 04:47:40',1),
	(98,'50e907cc1a44c472418d0536307de8ee','fa617ff52233206fb9d00d89157ac3f8','2017-03-23 04:54:13',1),
	(99,'6ce14cd7bf9444b364eca73342bc4e68','c0e8de07097b75104c660b7ad48da888','2017-03-23 05:19:21',1),
	(100,'a804a97789c0d4699c99c386c6476d49','f48af921bdb21d049d8d6db0f5943237','2017-03-23 05:21:51',1),
	(101,'bcab07b1851514e4a35199559d247ff8','3d1f50d4c21c533f04e4fd6e032180ad','2017-03-23 06:39:31',1),
	(102,'3d1f50d4c21c533f04e4fd6e032180ad','f76c32efa74fa1c3bd08e1d47ffbb3cc','2017-03-23 06:52:17',1),
	(103,'f76c32efa74fa1c3bd08e1d47ffbb3cc','f6ca490b4d385147bb05ca1127516837','2017-03-23 07:08:12',1),
	(104,'b0eb92eed91e58e7209bfbad9ccbdab6','e8de6997d9fd8345066a45830a5cb32b','2017-03-24 02:24:26',1),
	(105,'3e0e4e7c635da131832cf649758204b5','487b4edd37620313628275e794784ad9','2017-03-24 02:37:52',1),
	(106,'65c9e6ecebd0abccf4ca033874db0602','82b4ade9691a0be0b2fb23eb5afab377','2017-03-24 02:59:16',1),
	(107,'fa617ff52233206fb9d00d89157ac3f8','8dd20d27fb9967dddd5d73606e3c40a8','2017-03-24 03:06:16',1),
	(108,'6473bd507e9e7b62bf386699b41f84e5','0893a06f24c157a81150e4389aff9091','2017-03-24 03:30:20',1),
	(109,'f48af921bdb21d049d8d6db0f5943237','b4964b112c0ef54c831deca081774ed0','2017-03-24 03:38:45',1),
	(110,'f6ca490b4d385147bb05ca1127516837','83259ec537d1bd1e13562e618499f9fc','2017-03-24 03:51:26',1),
	(111,'8c58b30a6555e8e3f983ef7b5eb815b2','56da3769f8db3503179a7ef395b1820c','2017-03-24 03:56:15',1),
	(112,'cda68caf9fabd5499138078730b2cf5c','d59a10bd9cdba6084f9a9af1d4fc560b','2017-03-24 04:18:13',1),
	(113,'82b4ade9691a0be0b2fb23eb5afab377','921c800f8e92959468e3653afdc3219d','2017-03-27 03:32:21',1),
	(114,'487b4edd37620313628275e794784ad9','d6f2b53c81abab285286de2d2deeadad','2017-03-27 03:37:44',1),
	(115,'d59a10bd9cdba6084f9a9af1d4fc560b','257869bfaf6b08ec0eece6915412f3b7','2017-03-27 04:51:09',1),
	(116,'0893a06f24c157a81150e4389aff9091','6491b11777b0e6d9c538f38d8dfb82c2','2017-03-27 04:59:07',1),
	(117,'b4964b112c0ef54c831deca081774ed0','1e7896009383cde04af457603a986557','2017-03-27 06:10:54',1),
	(118,'8dd20d27fb9967dddd5d73606e3c40a8','cadd231ddb5450a1f59b55b7af94a81b','2017-03-27 06:29:03',1),
	(119,'921c800f8e92959468e3653afdc3219d','6b97c0c148d25cc304b10e7f65ca06fb','2017-03-29 02:53:38',1),
	(120,'d6f2b53c81abab285286de2d2deeadad','70151d067230960e2cdbb5bf434e812b','2017-03-29 03:00:07',1),
	(121,'1cfb0fda18aadb7099ec74e4fda22a87','68c7eaf3d5d726abe540c69b5835a95d','2017-03-29 04:45:36',1),
	(122,'6491b11777b0e6d9c538f38d8dfb82c2','6445b61548f1bfacc17f892b770f92a7','2017-03-29 04:49:26',1),
	(123,'1e7896009383cde04af457603a986557','1d145f6af2439e80b66765a1574d9b25','2017-03-29 04:54:03',1),
	(124,'cadd231ddb5450a1f59b55b7af94a81b','099a7f7b5b7eac6a315157c303e1f2a0','2017-03-29 05:01:17',1),
	(125,'6b97c0c148d25cc304b10e7f65ca06fb','ca2a9618913766e71b417ca22f3ebe87','2017-03-30 03:44:36',1),
	(126,'70151d067230960e2cdbb5bf434e812b','831bd420d6166a417c39694f5a7e9de9','2017-03-30 03:53:16',1),
	(127,'d9ab4f6b42de18ff14a3ce0b78e9b757','8fe047e7f49a09167975e08d8bc417d3','2017-03-30 04:13:42',1),
	(128,'68c7eaf3d5d726abe540c69b5835a95d','81d6528474211083c0f9f2352a66b07d','2017-03-30 04:20:12',1),
	(129,'6445b61548f1bfacc17f892b770f92a7','65e0c53373ac483246a3f19d22141c82','2017-03-30 04:24:37',1),
	(130,'1d145f6af2439e80b66765a1574d9b25','f81472fa4143e49658f404fac6362c11','2017-03-30 04:28:00',1),
	(131,'099a7f7b5b7eac6a315157c303e1f2a0','e2247b207a1dc2b6c4e502f46a73679c','2017-03-30 04:33:18',1),
	(132,'ca2a9618913766e71b417ca22f3ebe87','eb80f75c5503c5900141b685433cda6c','2017-03-31 03:21:56',1),
	(133,'831bd420d6166a417c39694f5a7e9de9','816624b2e1d5ec15ebf1aadba8d1420d','2017-03-31 03:34:03',1),
	(134,'7728e424fc32f8021505296ab342e8ef','799aaddcddf08c62b65807ef80f39d11','2017-03-31 04:02:40',1),
	(135,'81d6528474211083c0f9f2352a66b07d','fb4f7aa784c00c37a0e5e74d76d0fa2f','2017-03-31 04:05:40',1),
	(136,'65e0c53373ac483246a3f19d22141c82','f521e18decedff683a35203c70605066','2017-03-31 04:13:10',1),
	(137,'f81472fa4143e49658f404fac6362c11','f1c0406b20e9888224de457c3d0de5bd','2017-03-31 04:23:58',1),
	(138,'e2247b207a1dc2b6c4e502f46a73679c','8ae7a26e0761ffa6f2c0b3b57feeee96','2017-03-31 04:35:22',1),
	(139,'eb80f75c5503c5900141b685433cda6c','330b13a5427d464df70a2d727645c385','2017-04-03 03:31:44',1),
	(140,'816624b2e1d5ec15ebf1aadba8d1420d','54069e15846b0017e5d8aee6add5a6e4','2017-04-03 03:35:59',1),
	(141,'799aaddcddf08c62b65807ef80f39d11','01dfd62bd127485c7723cf95e55ec948','2017-04-03 04:07:07',1),
	(142,'f521e18decedff683a35203c70605066','1ce95bf43f88c741f181c12f58e707d7','2017-04-03 04:15:32',1),
	(143,'f1c0406b20e9888224de457c3d0de5bd','297e0acf85c9f4e529c4e887429fc356','2017-04-03 04:22:57',1),
	(144,'8ae7a26e0761ffa6f2c0b3b57feeee96','31ee8576afa553003f02887bc147186a','2017-04-03 04:35:05',1),
	(145,'b7f78bc14123181f870567e2e0f0c19a','d772970fc1799ba1141f4b87d83e7f9d','2017-04-04 04:09:24',1),
	(146,'330b13a5427d464df70a2d727645c385','3917f5f3c93fbd526aa378742fcf4cc5','2017-04-04 04:11:25',1),
	(147,'54069e15846b0017e5d8aee6add5a6e4','d8db8e2a425c7c584c4fbf7f9cf02837','2017-04-04 04:16:05',1),
	(148,'01dfd62bd127485c7723cf95e55ec948','5ba04c9a9174cfe02eca8149982ee2e4','2017-04-04 04:39:33',1),
	(149,'1ce95bf43f88c741f181c12f58e707d7','1960c4d830bc3a9f684b95bf8b5d0c10','2017-04-04 04:47:54',1),
	(150,'297e0acf85c9f4e529c4e887429fc356','0683afe1e7a8d77e24e8de763f82f3cb','2017-04-04 04:54:42',1),
	(151,'31ee8576afa553003f02887bc147186a','b606bfdd8a17bc3fd9adb466b30214db','2017-04-04 05:04:20',1),
	(152,'3917f5f3c93fbd526aa378742fcf4cc5','0b9348cbf219b4be8a83fefcfe422de0','2017-04-05 03:35:06',1),
	(153,'48502281eda094e831ca7861a09e97cb','f94ae2a54527e82ff30b156613f6253b','2017-04-05 04:03:20',1),
	(154,'d8db8e2a425c7c584c4fbf7f9cf02837','9db7718978d0da52254eca1e54477afb','2017-04-05 04:12:40',1),
	(155,'5ba04c9a9174cfe02eca8149982ee2e4','f13226cb02d916f2fe224ce6d4578a69','2017-04-05 04:41:24',1),
	(156,'1960c4d830bc3a9f684b95bf8b5d0c10','64a5e3d23c9c75af7ddea13b3a309982','2017-04-05 04:52:37',1),
	(157,'0683afe1e7a8d77e24e8de763f82f3cb','0568d34929ecc9600cfc918c9294bf41','2017-04-05 05:05:06',1),
	(158,'b606bfdd8a17bc3fd9adb466b30214db','a9ac65fe076a629aacb603ee4790f7eb','2017-04-05 05:12:44',1),
	(159,'0b9348cbf219b4be8a83fefcfe422de0','a8e11a5e6d1a54fe28f629edf6910e35','2017-04-05 08:46:34',1),
	(160,'a8e11a5e6d1a54fe28f629edf6910e35','396a7921ec8d36e0fcceb8a4181cc77f','2017-04-05 09:49:41',1),
	(161,'9db7718978d0da52254eca1e54477afb','3ba2fe15dd313a03d7cc444aa52daf04','2017-04-06 03:23:33',1),
	(162,'396a7921ec8d36e0fcceb8a4181cc77f','be142db3a3c8d221517d061e66a978ba','2017-04-06 03:44:30',1),
	(163,'f94ae2a54527e82ff30b156613f6253b','5145f658887079e684b2ccef0864e1a0','2017-04-06 03:52:14',1),
	(164,'f13226cb02d916f2fe224ce6d4578a69','c863b1e16b2286b6b930e2443b44c2e9','2017-04-06 04:04:43',1),
	(165,'64a5e3d23c9c75af7ddea13b3a309982','0570c584fd6dd9a47a437da9f4a6c183','2017-04-06 04:15:53',1),
	(166,'0568d34929ecc9600cfc918c9294bf41','0332155db7ccf5afbae9109175701e95','2017-04-06 04:20:55',1),
	(167,'a9ac65fe076a629aacb603ee4790f7eb','5207046370101d9d331bb2146af28dba','2017-04-06 04:39:37',1),
	(168,'2ff7fd3f584c5c9213a4480bb5e641d3','a0ed34fe8183c91ca690cf49ffaf2ae2','2017-04-07 03:09:33',1),
	(169,'0332155db7ccf5afbae9109175701e95','fb5c22ad7ee24b826e1468afb3c9f168','2017-04-07 03:32:07',0),
	(170,'3ba2fe15dd313a03d7cc444aa52daf04','3ae87090083e258f2e07249d076d6818','2017-04-07 04:22:49',1),
	(171,'be142db3a3c8d221517d061e66a978ba','34b37b0fd87383be794ecfe41e878a02','2017-04-07 04:44:29',1),
	(172,'5145f658887079e684b2ccef0864e1a0','eebdafb0f9b251be7e1e17a5f8920681','2017-04-07 05:12:24',1),
	(173,'c863b1e16b2286b6b930e2443b44c2e9','563c565da4213f3e538c5fd42486517a','2017-04-07 06:34:25',1),
	(174,'0570c584fd6dd9a47a437da9f4a6c183','e4391ad22bdbcbeb1601eeb61ffc916f','2017-04-07 06:55:11',1),
	(175,'5207046370101d9d331bb2146af28dba','87a721c3ff04900168f23cbe08d33b2d','2017-04-07 07:03:46',1),
	(176,'3ae87090083e258f2e07249d076d6818','1bb799fa69e4b54949b38039975e34d9','2017-04-10 03:59:09',1),
	(177,'34b37b0fd87383be794ecfe41e878a02','baf3c51a0284d7ed5627270575d70a58','2017-04-10 04:24:14',1),
	(178,'39d3d08aef357161bd3f16466295dbfc','b8d1944374539d9512c1a5bdc2046ad8','2017-04-10 04:32:23',1),
	(179,'563c565da4213f3e538c5fd42486517a','8785d2395d2485fac96d9a6842383ca7','2017-04-10 04:55:27',1),
	(180,'e4391ad22bdbcbeb1601eeb61ffc916f','844a94eda56f3ca09a7d388fd09e6452','2017-04-10 05:10:43',1),
	(181,'87a721c3ff04900168f23cbe08d33b2d','825d251ec879afdd11720a4a9d357e95','2017-04-10 05:15:56',1),
	(182,'825d251ec879afdd11720a4a9d357e95','d20c76793beddb3c6d6d42c1a70be55b','2017-04-11 03:03:57',1),
	(183,'1bb799fa69e4b54949b38039975e34d9','0d4f8617d4345d998c23634e21eff411','2017-04-11 03:49:18',1),
	(184,'baf3c51a0284d7ed5627270575d70a58','6667952a26057a72a6f9bd50f91d1da8','2017-04-11 04:09:47',1),
	(185,'b8d1944374539d9512c1a5bdc2046ad8','2760dd549b29b04078b90c602b038c80','2017-04-11 04:19:30',1),
	(186,'077e09dfd061dff4369d7fb481691343','19fe6b323af0580faff0d0f0657ddb2c','2017-04-11 04:39:42',1),
	(187,'8785d2395d2485fac96d9a6842383ca7','2aed6233a0d63465ad1f33749d4593fa','2017-04-11 04:52:12',1),
	(188,'844a94eda56f3ca09a7d388fd09e6452','bd3c40222df92cd4d2e4638175a07f38','2017-04-11 05:01:40',1);

/*!40000 ALTER TABLE `trending` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table user
# ------------------------------------------------------------

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `roleids` varchar(100) NOT NULL,
  `status` int(11) NOT NULL DEFAULT '0' COMMENT '状态：［0未审核，1已审核，2已禁用］',
  `addtime` datetime NOT NULL,
  `country` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;

INSERT INTO `user` (`id`, `username`, `password`, `roleids`, `status`, `addtime`, `country`)
VALUES
	(3,'admin','e00cf25ad42683b3df678c61f42c6bda','1,3',0,'2017-01-25 03:21:33','id,br'),
	(4,'Mings','e00cf25ad42683b3df678c61f42c6bda','3,4',0,'2017-01-25 04:18:03','id'),
	(5,'renning@newsinpalm.com','1d9f67a408d609a13089c324b079f4bc','1,5',0,'2017-02-06 09:27:46','id,br'),
	(6,'Livia','b113c43248de2a03cb110016de2ce08e','3',0,'2017-02-09 11:00:54','br'),
	(7,'BRkw','b113c43248de2a03cb110016de2ce08e','3',0,'2017-02-10 06:00:28','br'),
	(8,'temp','e00cf25ad42683b3df678c61f42c6bda','5',0,'2017-02-10 09:38:25','id'),
	(9,'chhuang@newsinpalm.com','0c216980dbdaa0e587f74a6f44e391d8','1',0,'2017-02-10 11:00:58','id,br'),
	(10,'dayang@newsinpalm.com','04b9a02dc897c41ed3ab15bcdc8a4705','1',0,'2017-02-17 09:52:00','id,br'),
	(11,'nadin','aba37da10ae6f58cbfb9838bb6ff2ca4','4,8,6,9',0,'2017-02-21 05:51:18','id,br'),
	(12,'v','c6b49056b770f629f4acaecb61cbe609','4,8,9',0,'2017-02-21 05:51:32','id,br'),
	(13,'shihe@newsinpalm.com','b78a1555d11011bcc9df3b4ded32f64f','5',0,'2017-02-27 07:36:09','id,br'),
	(14,'qiaolinan@newsinpalm.com','31cc9ca33d6a288098b9153b6efb5acd','1',0,'2017-03-01 16:58:50','id,br'),
	(15,'qiqi@newsinpalm.com','e10adc3949ba59abbe56e057f20f883e','6',0,'2017-03-02 06:26:24','id,br'),
	(16,'haibo@newsinpalm.com','51759c1101b6ee8fc1928642dd793074','6,3,5',0,'2017-03-07 06:52:17','br,id'),
	(17,'Mr Sun','c6b49056b770f629f4acaecb61cbe609','3,6,8,5',0,'2017-03-15 10:34:26','id'),
	(18,'xiansen@newsinpalm.com','c6b49056b770f629f4acaecb61cbe609','5,6,7',0,'2017-03-22 02:25:03','id,br'),
	(19,'raquel','c6b49056b770f629f4acaecb61cbe609','8',0,'2017-03-22 09:38:33','br,id'),
	(20,'pansh','c6b49056b770f629f4acaecb61cbe609','8,6,10',0,'2017-03-24 05:19:07','id,br');

/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
