#!/bin/sh
set -eu
export MYSQL_PWD="$(cat /run/secrets/db_root_password)"
app_password=$(cat /run/secrets/db_app_password)
migrate_password=$(cat /run/secrets/db_migrate_password)
admin_password=$(cat /run/secrets/db_admin_password)
exporter_password=$(cat /run/secrets/db_exporter_password)
# prepare scripts generate only 48 hexadecimal characters, safe for SQL literals.
for p in "$app_password" "$migrate_password" "$admin_password" "$exporter_password"; do case "$p" in *[!a-f0-9]*|'') exit 1;; esac; done
mysql --protocol=socket -uroot <<SQL
CREATE DATABASE IF NOT EXISTS linkme CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER IF NOT EXISTS 'linkme_app'@'%' IDENTIFIED BY '${app_password}';
GRANT SELECT,INSERT,UPDATE,DELETE ON linkme.* TO 'linkme_app'@'%';
CREATE USER IF NOT EXISTS 'linkme_migrate'@'%' IDENTIFIED BY '${migrate_password}';
GRANT SELECT,INSERT,UPDATE,DELETE,CREATE,ALTER,DROP,INDEX,REFERENCES ON linkme.* TO 'linkme_migrate'@'%';
CREATE USER IF NOT EXISTS 'linkme_admin'@'%' IDENTIFIED BY '${admin_password}';
GRANT ALL PRIVILEGES ON linkme.* TO 'linkme_admin'@'%';
CREATE USER IF NOT EXISTS 'linkme_exporter'@'%' IDENTIFIED BY '${exporter_password}' WITH MAX_USER_CONNECTIONS 3;
GRANT PROCESS,REPLICATION CLIENT ON *.* TO 'linkme_exporter'@'%';
GRANT SELECT ON performance_schema.* TO 'linkme_exporter'@'%';
SQL
unset MYSQL_PWD app_password migrate_password admin_password exporter_password
