# Dump of table RechargeInfo
# ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `RechargeInfo` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `userId` bigint(20) unsigned NOT NULL DEFAULT '0',
  `playerName` varchar(50) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `playerId` bigint(20) unsigned NOT NULL DEFAULT '0',
  `buyId` int unsigned NOT NULL DEFAULT '0',
  `rmb` int unsigned NOT NULL DEFAULT '0',
  `recordTime` bigint(20) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `INDEX_PLAYER_ID` (`playerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# Dump of table VipInfo
# ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `VipInfo` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `playerId` bigint(20) unsigned NOT NULL DEFAULT '0' unique,
  `rmb` bigint(20) unsigned NOT NULL DEFAULT '0',
  `giftMask` bigint(20) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `INDEX_PLAYER_ID` (`playerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# Dump of table MyBoss
# ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `MyBoss` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `playerId` bigint(20) unsigned NOT NULL DEFAULT '0' unique,
  `recordTime` bigint(20) unsigned NOT NULL DEFAULT '0',
  `times1` int unsigned NOT NULL DEFAULT '0',
  `times2` int unsigned NOT NULL DEFAULT '0',
  `times3` int unsigned NOT NULL DEFAULT '0',
  `times4` int unsigned NOT NULL DEFAULT '0',
  `times5` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `INDEX_PLAYER_ID` (`playerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# Dump of table Item
# ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Item` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `playerId` bigint(20) unsigned NOT NULL DEFAULT '0',
  `kindId` smallint(6) unsigned NOT NULL DEFAULT '0',
  `position` int unsigned NOT NULL DEFAULT '0',
  `count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `INDEX_PLAYER_ID` (`playerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# Dump of table MarketItem
# ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `MarketItem` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `playerId` bigint(20) unsigned NOT NULL DEFAULT '0',
  `kindId` smallint(6) unsigned NOT NULL DEFAULT '0',
  `name` varchar(50) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `INDEX_PLAYER_ID` (`playerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# Dump of table MarketBuyItem
# ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `MarketBuyItem` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `state` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `playerId` bigint(20) unsigned NOT NULL DEFAULT '0',
  `kindId` smallint(6) unsigned NOT NULL DEFAULT '0',
  `name` varchar(50) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `price` int unsigned NOT NULL DEFAULT '0',
  `caoCoin` int unsigned NOT NULL DEFAULT '0',
  `buyCount` int unsigned NOT NULL DEFAULT '0',
  `getCount` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `INDEX_PLAYER_ID` (`playerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# Dump of table MarketSellItem
# ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `MarketSellItem` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `state` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `playerId` bigint(20) unsigned NOT NULL DEFAULT '0',
  `kindId` smallint(6) unsigned NOT NULL DEFAULT '0',
  `name` varchar(50) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `caoCoin` int unsigned NOT NULL DEFAULT '0',
  `price` int unsigned NOT NULL DEFAULT '0',
  `count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `INDEX_PLAYER_ID` (`playerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# Dump of table PlayerBank
# ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `PlayerBank` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `playerId` bigint(20) unsigned NOT NULL DEFAULT '0' unique,
  `inCaoCoin` bigint(20) unsigned NOT NULL DEFAULT '0',
  `outCaoCoin` bigint(20) unsigned NOT NULL DEFAULT '0',
  `caoCoin` bigint(20) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `INDEX_PLAYER_ID` (`playerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


# Dump of table Federation
# ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Federation` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `doCaoCoin` bigint(20) unsigned NOT NULL DEFAULT '0',
  `voteCaoCoin` bigint(20) NOT NULL DEFAULT '0',
  `voteYCaoCoin` bigint(20) unsigned NOT NULL DEFAULT '0',
  `voteTCaoCoin` bigint(20) unsigned NOT NULL DEFAULT '0',
  `dailyCaoCoin` bigint(20) unsigned NOT NULL DEFAULT '0',
  `recordTime` bigint(20) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `Federation`(`id`) VALUES (1);

# Dump of table PlayerFederate
# ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `PlayerFederate` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `playerId` bigint(20) unsigned NOT NULL DEFAULT '0' unique,
  `name` varchar(50) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `kindId` smallint(6) unsigned NOT NULL DEFAULT '0',
  `caoCoin` bigint(20) unsigned NOT NULL DEFAULT '0',
  `voteCount` int unsigned NOT NULL DEFAULT '0',
  `receiveTime` bigint(20) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `INDEX_PLAYER_ID` (`playerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# Dump of table Office
# ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Office` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `time` bigint(20) unsigned NOT NULL DEFAULT '0',
  `playerId` bigint(20) unsigned NOT NULL DEFAULT '0',
  `name` varchar(50) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `kindId` smallint(6) unsigned NOT NULL DEFAULT '0',
  `state` smallint(6) unsigned NOT NULL DEFAULT '0',
  `support` bigint(20) unsigned NOT NULL DEFAULT '0',
  `oppose` bigint(20) unsigned NOT NULL DEFAULT '0',
  `startTime` bigint(20) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `INDEX_PLAYER_ID` (`playerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `Office`(`id`) VALUES (1);
INSERT INTO `Office`(`id`) VALUES (2);
INSERT INTO `Office`(`id`) VALUES (3);
INSERT INTO `Office`(`id`) VALUES (4);
INSERT INTO `Office`(`id`) VALUES (5);
INSERT INTO `Office`(`id`) VALUES (6);
INSERT INTO `Office`(`id`) VALUES (7);
INSERT INTO `Office`(`id`) VALUES (8);
INSERT INTO `Office`(`id`) VALUES (9);

# Dump of table Candidate
# ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Candidate` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `playerId` bigint(20) unsigned NOT NULL DEFAULT '0',
  `name` varchar(50) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `kindId` smallint(6) unsigned NOT NULL DEFAULT '0',
  `voteCount` int unsigned NOT NULL DEFAULT '0',
  `officeId` smallint(6) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `INDEX_PLAYER_ID` (`playerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# Dump of table Guild
# ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Guild` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8_unicode_ci NOT NULL DEFAULT '' unique,
  `level` smallint(6) unsigned NOT NULL DEFAULT '0',
  `caoCoin` bigint(20) NOT NULL DEFAULT '0',
  `capacity` smallint(6) unsigned NOT NULL DEFAULT '0',
  `salary` int unsigned NOT NULL DEFAULT '0',
  `captainId` bigint(20) unsigned NOT NULL DEFAULT '0' unique,
  `stockCount` bigint(20) unsigned NOT NULL DEFAULT '0',
  `captainName` varchar(50) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `desc` varchar(256) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# Dump of table Domain
#`guildName` varchar(50) COLLATE utf8_unicode_ci NOT NULL DEFAULT '' unique,
# ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Domain` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `level` smallint(6) unsigned NOT NULL DEFAULT '0',
  `areaId` int unsigned NOT NULL DEFAULT '0',
  `guildId` bigint(20) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
INSERT INTO `Domain`(`id`,`areaId`) VALUES (1,3001);
INSERT INTO `Domain`(`id`,`areaId`) VALUES (2,3002);
INSERT INTO `Domain`(`id`,`areaId`) VALUES (3,3003);
INSERT INTO `Domain`(`id`,`areaId`) VALUES (4,3004);
INSERT INTO `Domain`(`id`,`areaId`) VALUES (5,3005);

# Dump of table GuildMember
# ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `GuildMember` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `guildId` bigint(20) unsigned NOT NULL DEFAULT '0',
  `name` varchar(50) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `playerId` bigint(20) unsigned NOT NULL DEFAULT '0' unique,
  `level` tinyint(4) unsigned NOT NULL DEFAULT '1',
  `jobId` smallint(6) unsigned NOT NULL DEFAULT '0',
  `loginTime` bigint(20) unsigned NOT NULL DEFAULT '0',
  `caoCoin` bigint(20) unsigned NOT NULL DEFAULT '0',
  `build` bigint(20) unsigned NOT NULL DEFAULT '0',
  `salaryTime` bigint(20) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `INDEX_GUILD_ID` (`guildId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# Dump of table GuildInvestor
# ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `GuildInvestor` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `playerId` bigint(20) unsigned NOT NULL DEFAULT '0',
  `stockId` bigint(20) unsigned NOT NULL DEFAULT '0',
  `stockCount` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# Dump of table GuildEquip
# ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `GuildEquip` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `guildId` bigint(20) unsigned NOT NULL DEFAULT '0',
  `itemId` bigint(20) unsigned NOT NULL DEFAULT '0' unique,
  `kindId` smallint(6) unsigned NOT NULL DEFAULT '0',
  `kind` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `baseValue` int unsigned NOT NULL DEFAULT '0',
  `potential` int unsigned NOT NULL DEFAULT '0',
  `percent` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `totalStar` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `star1` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `star2` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `star3` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `star4` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `star5` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `star6` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `star7` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `star8` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `star9` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `star10` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `star11` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `star12` tinyint(4) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `INDEX_GUILD_ID` (`guildId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# Dump of table Equipment
# ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Equipment` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `playerId` bigint(20) unsigned NOT NULL DEFAULT '0',
  `kindId` smallint(6) unsigned NOT NULL DEFAULT '0',
  `position` int unsigned NOT NULL DEFAULT '0',
  `jobId` int unsigned NOT NULL DEFAULT '0',
  `bind` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `kind` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `baseValue` int unsigned NOT NULL DEFAULT '0',
  `potential` int unsigned NOT NULL DEFAULT '0',
  `percent` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `totalStar` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `star1` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `star2` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `star3` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `star4` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `star5` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `star6` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `star7` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `star8` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `star9` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `star10` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `star11` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `star12` tinyint(4) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `INDEX_PLAYER_ID` (`playerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# Dump of table FightSkill
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `FightSkill` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `playerId` bigint(20) unsigned NOT NULL DEFAULT '0' unique,
  `skillId` smallint(6) unsigned NOT NULL DEFAULT '0',
  `level` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `position` tinyint(4) unsigned NOT NULL DEFAULT '10',
  `type` tinyint(4) unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `INDEX_PLAYER_ID` (`playerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# Dump of table Property
# ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Property` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `playerId` bigint(20) unsigned NOT NULL DEFAULT '0',
  `hpLevel` bigint(20) unsigned NOT NULL DEFAULT '0',
  `mpLevel` bigint(20) unsigned NOT NULL DEFAULT '0',
  `hpCount` bigint(20) unsigned NOT NULL DEFAULT '0',
  `mpCount` bigint(20) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `INDEX_PLAYER_ID` (`playerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# Dump of table Fight
# ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Fight` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `playerId` bigint(20) unsigned NOT NULL DEFAULT '0',
  `kindId` smallint(6) unsigned NOT NULL DEFAULT '0',
  `name` varchar(50) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `time` bigint(20) unsigned NOT NULL DEFAULT '0',
  `count` bigint(20) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `INDEX_PLAYER_ID` (`playerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# Dump of table Player
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `Player` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `userId` bigint(20) unsigned NOT NULL DEFAULT '0',
  `kindId` smallint(6) unsigned NOT NULL DEFAULT '0',
  `skinId` smallint(6) unsigned NOT NULL DEFAULT '0',
  `vip` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `caoCoin` bigint(20) unsigned NOT NULL DEFAULT '0',
  `crystal` int unsigned NOT NULL DEFAULT '0',
  `name` varchar(50) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `online` smallint(6) unsigned DEFAULT '0',
  `guildId` bigint(20) unsigned DEFAULT '0',
  `fightMode` bigint(20) unsigned DEFAULT '1',
  `redPoint` int unsigned DEFAULT '0',
  `rank` int unsigned NOT NULL DEFAULT '1',
  `level` tinyint(4) unsigned NOT NULL DEFAULT '1',
  `experience` int unsigned NOT NULL DEFAULT '0',
  `hp` int unsigned NOT NULL DEFAULT '0',
  `mp` int unsigned NOT NULL DEFAULT '0',
  `maxHp` int unsigned NOT NULL DEFAULT '0',
  `maxMp` int unsigned NOT NULL DEFAULT '0',
  `hpLevel` bigint(20) unsigned NOT NULL DEFAULT '0',
  `mpLevel` bigint(20) unsigned NOT NULL DEFAULT '0',
  `hpCount` bigint(20) unsigned NOT NULL DEFAULT '0',
  `mpCount` bigint(20) unsigned NOT NULL DEFAULT '0',
  `areaId` smallint(6) unsigned NOT NULL DEFAULT '1',
  `x` int unsigned NOT NULL DEFAULT '0',
  `y` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `INDEX_GAME_NAME` (`name`),
  KEY `INDEX_PALYER_USER_ID` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


# Dump of table Task
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `Task` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `playerId` bigint(20) unsigned NOT NULL DEFAULT '0',
  `kindId` smallint(6) unsigned NOT NULL DEFAULT '0',
  `taskState` smallint(6) unsigned NOT NULL DEFAULT '0',
  `startTime` bigint(20) unsigned NOT NULL DEFAULT '0',
  `targetCount` smallint(6) unsigned NOT NULL DEFAULT '0',
  `taskData` varchar(1000) COLLATE utf8_unicode_ci NOT NULL DEFAULT '{}',
  PRIMARY KEY (`id`),
  KEY `INDEX_TASK_ID` (`playerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# Dump of table MainTask
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `MainTask` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `playerId` bigint(20) unsigned NOT NULL DEFAULT '0' unique,
  `kindId` smallint(6) unsigned NOT NULL DEFAULT '0',
  `finishAll` smallint(6) unsigned NOT NULL DEFAULT '0',
  `taskState` smallint(6) unsigned NOT NULL DEFAULT '0',
  `startTime` bigint(20) unsigned NOT NULL DEFAULT '0',
  `targetCount` smallint(6) unsigned NOT NULL DEFAULT '0',
  `taskData` varchar(1000) COLLATE utf8_unicode_ci NOT NULL DEFAULT '{}',
  PRIMARY KEY (`id`),
  KEY `INDEX_TASK_ID` (`playerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# Dump of table User
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `User` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8_unicode_ci NOT NULL DEFAULT '' unique,
  `password` varchar(50) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `model` varchar(50) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `channel` int unsigned NOT NULL DEFAULT '0',
  `loginCount` smallint(6) unsigned NOT NULL DEFAULT '0',
  `lastKindId` smallint(6) unsigned NOT NULL DEFAULT '0',
  `from` varchar(25) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `registerTime` bigint(20) unsigned NOT NULL DEFAULT '0',
  `lastLoginTime` bigint(20) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `INDEX_ACCOUNT_NAME` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

