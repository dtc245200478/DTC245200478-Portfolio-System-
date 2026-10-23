$ErrorActionPreference='Stop'
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
$env:DOCKER_CONTEXT='desktop-linux'
docker compose --profile test run --rm --no-deps tests
if($LASTEXITCODE -ne 0){throw 'Kiem thu that bai'}
