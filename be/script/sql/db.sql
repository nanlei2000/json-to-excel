-- 创建
CREATE SCHEMA `fun_api` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;

-- 成语表
CREATE TABLE `fun_api`.`idiom` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增id',
  `word` VARCHAR(100) NOT NULL DEFAULT '\"\"' COMMENT '成语',
  `pinyin` VARCHAR(100) NOT NULL DEFAULT '\"\"' COMMENT '拼音',
  `abbr` VARCHAR(45) NOT NULL DEFAULT '\"\"' COMMENT '拼音缩写',
  `derivation` VARCHAR(2000) NOT NULL DEFAULT '\"\"' COMMENT '出处',
  `example` VARCHAR(2000) NOT NULL DEFAULT '\"\"' COMMENT '示例',
  `explanation` VARCHAR(2000) NOT NULL DEFAULT '\"\"' COMMENT '释义',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE);
