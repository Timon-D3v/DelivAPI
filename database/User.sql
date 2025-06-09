CREATE TABLE `cdn`.`user` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(256) NOT NULL,
  `key` VARCHAR(512) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `iduser_UNIQUE` (`id` ASC) VISIBLE)
COMMENT = 'This table holds all the users and api keys for DelivAPI.';

ALTER TABLE `cdn`.`user` 
CHANGE COLUMN `key` `key` VARCHAR(128) NOT NULL ;