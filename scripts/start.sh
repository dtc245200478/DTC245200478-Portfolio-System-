#!/bin/sh
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
sh scripts/prepare.sh "${1:-}"
export DOCKER_HOST=unix:///var/run/docker.sock
unset DOCKER_CONTEXT
command -v docker >/dev/null || { echo 'Install Docker Engine and Compose plugin in Ubuntu.'; exit 1; }
docker info --format '{{.Name}} {{.OperatingSystem}}'
for port in $(sed -n 's/^\(WEB_PORT\|DB_TOOL_PORT\|GRAFANA_PORT\|PROMETHEUS_PORT\)=//p' .env); do
 if ss -ltnH "sport = :$port" | grep -q . && [ -z "$(docker compose ps -q)" ]; then echo "Port $port is busy. Edit .env."; exit 1; fi
done
docker compose config --quiet
docker compose build
docker compose up -d --wait --wait-timeout 240
echo 'Link Me is ready. Ports are configured in .env.'
