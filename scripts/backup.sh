#!/bin/sh
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
export DOCKER_HOST=unix:///var/run/docker.sock
unset DOCKER_CONTEXT
folder=".local/backups/$(date +%Y%m%d-%H%M%S)-wsl"
mkdir -p "$folder"
docker compose exec -T mysql sh -c 'MYSQL_PWD=$(cat /run/secrets/db_root_password) exec mysqldump -uroot --single-transaction --no-tablespaces --set-gtid-purged=OFF linkme' > "$folder/database.sql"
docker compose exec -T app tar czf - -C /data/uploads . > "$folder/uploads.tar.gz"
sql_hash=$(sha256sum "$folder/database.sql" | cut -d' ' -f1)
image_hash=$(sha256sum "$folder/uploads.tar.gz" | cut -d' ' -f1)
printf '{"project":"linkme13","created":"%s","sha256":{"database.sql":"%s","uploads.tar.gz":"%s"}}\n' "$(date -u +%FT%TZ)" "$sql_hash" "$image_hash" > "$folder/manifest.json"
echo "Backup complete: $folder"
