$ErrorActionPreference='Stop'
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
. "$PSScriptRoot/docker-stream.ps1"
$backupDir=Join-Path (Get-Location) ('.local/backups/'+((Get-Date -Format 'yyyyMMdd-HHmmss')+'-desktop'))
New-Item -ItemType Directory -Force -Path $backupDir|Out-Null
Invoke-DockerStream -Arguments 'compose exec -T mysql sh -c "MYSQL_PWD=$(cat /run/secrets/db_root_password) exec mysqldump -uroot --single-transaction --no-tablespaces --set-gtid-purged=OFF linkme"' -OutputFile (Join-Path $backupDir 'database.sql')
Invoke-DockerStream -Arguments 'compose exec -T app tar czf - -C /data/uploads .' -OutputFile (Join-Path $backupDir 'uploads.tar.gz')
$checks=@{};foreach($n in @('database.sql','uploads.tar.gz')){$checks[$n]=(Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $backupDir $n)).Hash.ToLower()}
$manifest=@{project='linkme13';created=(Get-Date).ToString('o');sha256=$checks}|ConvertTo-Json -Depth 4
[IO.File]::WriteAllText((Join-Path $backupDir 'manifest.json'),$manifest,[Text.UTF8Encoding]::new($false))
Write-Host "Backup complete: $backupDir"
