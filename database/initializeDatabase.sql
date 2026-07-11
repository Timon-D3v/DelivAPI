-- MySQL script to initialize the database for DelivAPI
CREATE SCHEMA `cdn`;
CREATE SCHEMA `chunks`;
CREATE SCHEMA `delivapi`;


-- Create the user table in the delivapi database
CREATE TABLE `delivapi`.`user` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(256) NOT NULL,
  `key` VARCHAR(128) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `iduser_UNIQUE` (`id` ASC) VISIBLE
) COMMENT = 'This table holds all the users and api keys for DelivAPI.';