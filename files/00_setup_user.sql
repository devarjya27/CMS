-- ============================================================
-- CMS PROJECT: SETUP USER & DATABASE (MySQL 8.0)
-- ============================================================

DROP DATABASE IF EXISTS cms_db;
CREATE DATABASE cms_db;

DROP USER IF EXISTS 'cms_user'@'localhost';
CREATE USER 'cms_user'@'localhost' IDENTIFIED BY 'cms_pass';

GRANT ALL PRIVILEGES ON cms_db.* TO 'cms_user'@'localhost';
FLUSH PRIVILEGES;

SELECT user, host FROM mysql.user WHERE user = 'cms_user';
