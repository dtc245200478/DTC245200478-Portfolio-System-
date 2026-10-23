#!/bin/sh
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
export DOCKER_HOST=unix:///var/run/docker.sock
unset DOCKER_CONTEXT
folder="${1:?Usage: sh scripts/restore.sh BACKUP_DIRECTORY [--confirm]}"
metadata=$(docker compose exec -T app node -e "let s='';process.stdin.on('data',c=>s+=c);process.stdin.on('end',()=>{const m=JSON.parse(s);console.log(m.project);console.log(m.sha256['database.sql']);console.log(m.sha256['uploads.tar.gz']);});" < "$folder/manifest.json")
[ "$(printf '%s' "$metadata" | sed -n '1p')" = 'linkme13' ] || { echo 'Wrong project'; exit 1; }
[ "$(sha256sum "$folder/database.sql" | cut -d' ' -f1)" = "$(printf '%s' "$metadata" | sed -n '2p')" ] || { echo 'SQL checksum failed'; exit 1; }
[ "$(sha256sum "$folder/uploads.tar.gz" | cut -d' ' -f1)" = "$(printf '%s' "$metadata" | sed -n '3p')" ] || { echo 'Image checksum failed'; exit 1; }
if [ "${2:-}" != '--confirm' ]; then printf 'This replaces Link Me data. Type PHUC HOI LINK ME: '; read -r reply; [ "$reply" = 'PHUC HOI LINK ME' ] || exit 1; fi
docker compose stop nginx app
docker compose exec -T mysql sh -c 'MYSQL_PWD=$(cat /run/secrets/db_root_password) exec mysql -uroot linkme' < "$folder/database.sql"
docker compose run --rm --no-deps -T app tar xzf - -C /data/uploads < "$folder/uploads.tar.gz"
docker compose up -d --wait --wait-timeout 180 app nginx
echo 'Database and uploads restored; unreferenced old image files are retained.'
