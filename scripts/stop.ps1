$ErrorActionPreference='Stop'
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
$env:DOCKER_CONTEXT='desktop-linux'
docker compose down
if($LASTEXITCODE -ne 0){throw 'Stop failed'}
