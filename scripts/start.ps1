param([switch]$BaseOnly)
$ErrorActionPreference='Stop'
& "$PSScriptRoot/prepare.ps1" -BaseOnly:$BaseOnly
$env:DOCKER_CONTEXT='desktop-linux'
docker info --format '{{.Name}}'
if($LASTEXITCODE -ne 0){throw 'Hay mo Docker Desktop o che do Linux containers.'}
foreach($line in Get-Content -LiteralPath '.env'){if($line -match '^(WEB_PORT|DB_TOOL_PORT|GRAFANA_PORT|PROMETHEUS_PORT)=(\d+)$'){$port=[int]$Matches[2];$own=docker compose ps --format json 2>$null;if((Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) -and -not $own){throw "Cong $port dang duoc su dung. Doi cong trong .env."}}}
docker compose config --quiet
if($LASTEXITCODE -ne 0){throw 'Compose khong hop le'}
docker compose build
if($LASTEXITCODE -ne 0){throw 'Build that bai'}
docker compose up -d --wait --wait-timeout 240
if($LASTEXITCODE -ne 0){throw 'Khoi dong that bai. Xem docker compose logs --tail 80.'}
Write-Host 'Link Me da san sang. Xem cac cong trong .env.'
