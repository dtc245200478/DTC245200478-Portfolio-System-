param([Parameter(Mandatory=$true)][string]$BackupDir,[switch]$ConfirmRestore)
$ErrorActionPreference='Stop'
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
. "$PSScriptRoot/docker-stream.ps1"
$backupPath=(Resolve-Path -LiteralPath $BackupDir).Path
$manifest=Get-Content -Raw -LiteralPath (Join-Path $backupPath 'manifest.json')|ConvertFrom-Json
if($manifest.project -ne 'linkme13'){throw 'Backup belongs to another project'}
foreach($n in @('database.sql','uploads.tar.gz')){if((Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $backupPath $n)).Hash.ToLower() -ne $manifest.sha256.$n){throw "Checksum failed: $n"}}
if(-not $ConfirmRestore){if((Read-Host 'This replaces Link Me data. Type PHUC HOI LINK ME') -cne 'PHUC HOI LINK ME'){throw 'Restore cancelled'}}
docker --context desktop-linux compose stop nginx app
if($LASTEXITCODE -ne 0){throw 'Cannot stop app'}
Invoke-DockerStream -Arguments 'compose exec -T mysql sh -c "MYSQL_PWD=$(cat /run/secrets/db_root_password) exec mysql -uroot linkme"' -InputFile (Join-Path $backupPath 'database.sql')
Invoke-DockerStream -Arguments 'compose run --rm --no-deps -T app tar xzf - -C /data/uploads' -InputFile (Join-Path $backupPath 'uploads.tar.gz')
docker --context desktop-linux compose up -d --wait --wait-timeout 180 app nginx
if($LASTEXITCODE -ne 0){throw 'App restart failed'}
Write-Host 'Link Me database and uploads restored. Unreferenced old image files are retained.'
