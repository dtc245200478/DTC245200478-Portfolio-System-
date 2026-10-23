function Invoke-DockerStream {
 param([string]$Arguments,[string]$InputFile,[string]$OutputFile)
 $psi=New-Object System.Diagnostics.ProcessStartInfo
 $psi.FileName='docker';$psi.Arguments='--context desktop-linux '+$Arguments
 $psi.WorkingDirectory=Split-Path -Parent $PSScriptRoot
 $psi.UseShellExecute=$false;$psi.CreateNoWindow=$true
 $psi.RedirectStandardOutput=$true;$psi.RedirectStandardError=$true;$psi.RedirectStandardInput=[bool]$InputFile
 $process=New-Object System.Diagnostics.Process;$process.StartInfo=$psi
 [void]$process.Start();$errorTask=$process.StandardError.ReadToEndAsync()
 if($InputFile){$inputStream=[IO.File]::OpenRead($InputFile);try{$inputStream.CopyTo($process.StandardInput.BaseStream)}finally{$inputStream.Dispose();$process.StandardInput.Close()}}
 if($OutputFile){$out=[IO.File]::Create($OutputFile);try{$process.StandardOutput.BaseStream.CopyTo($out)}finally{$out.Dispose()}}else{$output=$process.StandardOutput.ReadToEnd()}
 $process.WaitForExit();$errorText=$errorTask.GetAwaiter().GetResult();if($process.ExitCode -ne 0){throw "Docker command failed: $errorText"}
 if($output){Write-Host $output}
}
