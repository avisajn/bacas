/*
 Navicat MySQL Data Transfer

 Source Server         : localhost
 Source Server Version : 50633
 Source Host           : localhost
 Source Database       : baka_permission

 Target Server Version : 50633
 File Encoding         : utf-8

 Date: 01/26/2017 12:38:29 PM
*/

SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
--  Table structure for `role`
-- ----------------------------
DROP TABLE IF EXISTS `role`;
CREATE TABLE `role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `desc` varchar(500) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Records of `role`
-- ----------------------------
BEGIN;
INSERT INTO `role` VALUES ('1', '管理员', '拥有所有权限'), ('2', '测试人员', '');
COMMIT;

-- ----------------------------
--  Table structure for `rolesys`
-- ----------------------------
DROP TABLE IF EXISTS `rolesys`;
CREATE TABLE `rolesys` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `roleid` int(11) NOT NULL,
  `sysid` int(11) NOT NULL,
  `sysinfoid` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Records of `rolesys`
-- ----------------------------
BEGIN;
INSERT INTO `rolesys` VALUES ('12', '1', '2', '1'), ('13', '1', '2', '2'), ('14', '1', '2', '3'), ('25', '1', '1', '4'), ('26', '1', '1', '5'), ('30', '1', '1', '6'), ('31', '1', '1', '7'), ('37', '1', '1', '8'), ('45', '2', '1', '4'), ('46', '2', '1', '5');
COMMIT;

-- ----------------------------
--  Table structure for `sys`
-- ----------------------------
DROP TABLE IF EXISTS `sys`;
CREATE TABLE `sys` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `testurl` varchar(100) NOT NULL,
  `url` varchar(100) NOT NULL,
  `status` int(11) NOT NULL COMMENT '系统状态［-1关闭，0打开］',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Records of `sys`
-- ----------------------------
BEGIN;
INSERT INTO `sys` VALUES ('1', '日报广告1', 'http://www.baidu.com', '', '0'), ('2', '权限管理系统', 'http://localhost:8080/#!/sys', '', '0');
COMMIT;

-- ----------------------------
--  Table structure for `sysinfo`
-- ----------------------------
DROP TABLE IF EXISTS `sysinfo`;
CREATE TABLE `sysinfo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sysid` int(11) NOT NULL,
  `type` int(11) NOT NULL COMMENT 'type 		权限类型：［1页面，2功能］',
  `key` varchar(100) NOT NULL,
  `desc` varchar(500) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Records of `sysinfo`
-- ----------------------------
BEGIN;
INSERT INTO `sysinfo` VALUES ('1', '2', '1', 'user', '用户管理权限'), ('2', '2', '1', 'role', '角色管理'), ('3', '2', '1', 'system', '系统管理'), ('4', '1', '1', 'page1', '测试页面1'), ('5', '1', '1', 'page2', '页面测试2'), ('6', '1', '1', 'page3', '页面测试3'), ('7', '1', '1', 'page4', '页面测试5'), ('8', '1', '2', 'page1-add', '第一个页面的增加功能');
COMMIT;

-- ----------------------------
--  Table structure for `user`
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `roleids` varchar(100) NOT NULL,
  `status` int(11) NOT NULL DEFAULT '0' COMMENT '状态：［0未审核，1已审核，2已禁用］',
  `addtime` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Records of `user`
-- ----------------------------
BEGIN;
INSERT INTO `user` VALUES ('1', 'ymark', 'c6b49056b770f629f4acaecb61cbe609', '1,2', '0', '2017-01-24 05:29:00'), ('2', '测试1', 'c6b49056b770f629f4acaecb61cbe609', '2', '0', '2017-01-25 10:38:24'), ('3', 'admin', 'e00cf25ad42683b3df678c61f42c6bda', '1', '0', '2017-01-25 03:21:33'), ('4', 'user', 'e00cf25ad42683b3df678c61f42c6bda', '2', '0', '2017-01-25 04:18:03');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
