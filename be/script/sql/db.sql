-- 创建
CREATE SCHEMA `fun_api` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;

-- 成语表
CREATE TABLE `idiom` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增id',
  `word` varchar(100) NOT NULL DEFAULT '""' COMMENT '成语',
  `pinyin` varchar(100) NOT NULL DEFAULT '""' COMMENT '拼音',
  `abbr` varchar(45) NOT NULL DEFAULT '""' COMMENT '拼音缩写',
  `derivation` varchar(2000) NOT NULL DEFAULT '""' COMMENT '出处',
  `example` varchar(2000) NOT NULL DEFAULT '""' COMMENT '示例',
  `explanation` varchar(2000) NOT NULL DEFAULT '""' COMMENT '释义',
  `next_id_str` varchar(10000) CHARACTER SET utf8mb4 DEFAULT '""',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30896 DEFAULT CHARSET=utf8;
