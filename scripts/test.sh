#!/bin/sh
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
export DOCKER_HOST=unix:///var/run/docker.sock
unset DOCKER_CONTEXT
docker compose --profile test run --rm --no-deps tests
