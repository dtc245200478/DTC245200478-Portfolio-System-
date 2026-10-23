param([switch]$BaseOnly)
$ErrorActionPreference='Stop'
$projectDir=Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectDir
$secretDir=Join-Path $projectDir '.local/secrets'
New-Item -ItemType Directory -Force -Path $secretDir | Out-Null
foreach($n in @('db_root_password','db_app_password','db_migrate_password','db_admin_password','db_exporter_password','admin_password','session_secret','grafana_password')) {
 $p=Join-Path $secretDir $n
 if(-not(Test-Path -LiteralPath $p)) {$b=New-Object byte[] 24;$g=[Security.Cryptography.RandomNumberGenerator]::Create();$g.GetBytes($b);$g.Dispose();[IO.File]::WriteAllText($p,(-join($b|ForEach-Object{$_.ToString('x2')})),[Text.UTF8Encoding]::new($false))}
}
$ep=[IO.File]::ReadAllText((Join-Path $secretDir 'db_exporter_password')).Trim()
[IO.File]::WriteAllText((Join-Path $secretDir 'mysqld_exporter.cnf'),"[client]`nuser=linkme_exporter`npassword=$ep`nhost=mysql`nport=3306`n",[Text.UTF8Encoding]::new($false))
if(-not(Test-Path -LiteralPath '.env')) {Copy-Item -LiteralPath '.env.example' -Destination '.env'}
$lines=@(Get-Content -LiteralPath '.env'|Where-Object{$_ -notmatch '^COMPOSE_(FILE|PATH_SEPARATOR|PROJECT_NAME)='})
$files=@('compose.yaml');if(-not $BaseOnly){foreach($f in @('compose.monitoring.yaml','compose.logging.yaml')){if(Test-Path -LiteralPath $f){$files+=$f}}}
$lines+=@('COMPOSE_PROJECT_NAME=linkme13','COMPOSE_PATH_SEPARATOR=,',"COMPOSE_FILE=$($files -join ',')")
[IO.File]::WriteAllText((Join-Path $projectDir '.env'),($lines -join "`n")+"`n",[Text.UTF8Encoding]::new($false))
Write-Host 'Link Me: cau hinh san sang; mat khau trong .local/secrets, khong dua len Git.'
