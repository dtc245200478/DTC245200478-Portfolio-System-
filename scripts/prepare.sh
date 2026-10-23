#!/bin/sh
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
mkdir -p .local/secrets
chmod 700 .local .local/secrets
for n in db_root_password db_app_password db_migrate_password db_admin_password db_exporter_password admin_password session_secret grafana_password; do
 if [ ! -f ".local/secrets/$n" ]; then openssl rand -hex 24 | tr -d '\n' > ".local/secrets/$n"; fi
 chmod 644 ".local/secrets/$n"
done
printf '[client]\nuser=linkme_exporter\npassword=%s\nhost=mysql\nport=3306\n' "$(cat .local/secrets/db_exporter_password)" > .local/secrets/mysqld_exporter.cnf
chmod 644 .local/secrets/mysqld_exporter.cnf
[ -f .env ] || cp .env.example .env
files=compose.yaml
if [ "${1:-}" != '--base-only' ]; then for f in compose.monitoring.yaml compose.logging.yaml; do [ ! -f "$f" ] || files="$files,$f"; done; fi
sed '/^COMPOSE_FILE=/d; /^COMPOSE_PATH_SEPARATOR=/d; /^COMPOSE_PROJECT_NAME=/d' .env > .local/env.new
printf 'COMPOSE_PROJECT_NAME=linkme13\nCOMPOSE_PATH_SEPARATOR=,\nCOMPOSE_FILE=%s\n' "$files" >> .local/env.new
mv .local/env.new .env
echo 'Link Me: configuration ready; secrets remain local.'
