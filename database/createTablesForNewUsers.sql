-- Create the the table that holds the files
CREATE TABLE IF NOT EXISTS `cdn`.`${organizationName}` (
    `uuid` VARCHAR(36) NOT NULL,
    `mimetype` VARCHAR(64) NOT NULL,
    `file` LONGBLOB NOT NULL,
    PRIMARY KEY (`uuid`),
    UNIQUE INDEX `uuid${organizationName}_UNIQUE` (`uuid` ASC) VISIBLE
) COMMENT = 'This table holds all files for the organization ${organizationName}';


-- Create the the table that holds the chunks
CREATE TABLE IF NOT EXISTS `chunks`.`${organizationName}` (
	`id` INT NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(36) NOT NULL,
    `chunkIndex` INT NOT NULL,
    `chunk` LONGBLOB NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `id${organizationName}_chunks_UNIQUE` (`id` ASC) VISIBLE
) COMMENT = 'This table holds all chunked files for the organization ${organizationName}';