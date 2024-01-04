# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: 127.0.0.1 (MySQL 5.6.35)
# Database: hadoop_fintech
# Generation Time: 2018-02-26 06:14:45 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table user
# ------------------------------------------------------------

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `status` int(11) NOT NULL DEFAULT '0' COMMENT '状态：［0未审核，1已审核，2已禁用］',
  `addtime` datetime NOT NULL,
  `email` varchar(100) NOT NULL,
  `demand` varchar(2000) DEFAULT '' COMMENT '需求',
  `apikey` varchar(300) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;

INSERT INTO `user` (`id`, `username`, `password`, `status`, `addtime`, `email`, `demand`, `apikey`)
VALUES
	(100001,'admin','e00cf25ad42683b3df678c61f42c6bda',0,'2017-02-10 09:38:25','','',NULL),
	(100002,'1-2','e00cf25ad42683b3df678c61f42c6bda',0,'0000-00-00 00:00:00','','',NULL),
	(100003,'1-3','e00cf25ad42683b3df678c61f42c6bda',0,'0000-00-00 00:00:00','','',NULL),
	(100004,'1-4','e00cf25ad42683b3df678c61f42c6bda',0,'0000-00-00 00:00:00','','',NULL),
	(100017,'myname','-',0,'2017-07-07 12:51:06','123@ymark.cc','123133alkdjfasdf',NULL),
	(100020,'muy@ymark.cc','f7e0ef389ac6133c88aedbd66b44a4e1',0,'2017-07-10 06:34:39','123123@ymark.cc','','843e0a61-c161-42b3-84d9-cd427e4a8aa1');

/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
