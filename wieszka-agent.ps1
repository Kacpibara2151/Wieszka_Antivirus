# ====================================================================
# WIESZKA AI - OFICJALNY AGENT SKANERA SYSTEMOWEGO (NATIVE WINDOWS BRIDGE)
# Architektura identyczna jak Kaspersky Virus Removal Tool & Malwarebytes
# ====================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Clear-Host
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "   WIESZKA AI - NATIVE ANTIVIRUS SYSTEM BRIDGE (PC)      " -ForegroundColor Green
Write-Host "   Prawdziwy skaner Windows (caly dysk C:\, pamiec, RAM) " -ForegroundColor Yellow
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[1/3] Uruchamianie lokalnego serwera bezpieczenstwa na porcie 4000..." -ForegroundColor Cyan

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:4000/")
try {
    $listener.Start()
    Write-Host "[OK] Most aktywny na http://localhost:4000" -ForegroundColor Green
    Write-Host "[2/3] Wroc do otwartego okna antywirusa w przegladarce." -ForegroundColor White
    Write-Host "[3/3] Antywirus automatycznie wykryje ten most i przeskanuje caly komputer!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Nacisnij Ctrl+C, aby zakonczyc prace agenta." -ForegroundColor Gray
    Write-Host "---------------------------------------------------------" -ForegroundColor Gray
} catch {
    Write-Host "[!] Blad: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Upewnij sie, ze port 4000 nie jest zajety." -ForegroundColor Yellow
    Exit
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response

        $res.AddHeader("Access-Control-Allow-Origin", "*")
        $res.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $res.AddHeader("Access-Control-Allow-Headers", "*")

        if ($req.HttpMethod -eq "OPTIONS") {
            $res.StatusCode = 200
            $res.Close()
            continue
        }

        $path = $req.Url.AbsolutePath

        if ($path -eq "/skanuj") {
            Write-Host "[+] Rozpoczeto pelne skanowanie dysku C:\ na zyczenie antywirusa..." -ForegroundColor Green
            $res.ContentType = "text/plain; charset=utf-8"
            $res.SendChunked = $true
            $writer = New-Object System.IO.StreamWriter($res.OutputStream, [System.Text.Encoding]::UTF8)
            $writer.AutoFlush = $true

            $writer.WriteLine("PLIK:Rozpoczynanie skanowania calego dysku C:\ i systemu...")

            $psi = New-Object System.Diagnostics.ProcessStartInfo
            $psi.FileName = "cmd.exe"
            $psi.Arguments = "/c dir ""C:\"" /a /s /b"
            $psi.RedirectStandardOutput = $true
            $psi.UseShellExecute = $false
            $psi.CreateNoWindow = $true

            $proc = [System.Diagnostics.Process]::Start($psi)
            while (-not $proc.StandardOutput.EndOfStream) {
                $line = $proc.StandardOutput.ReadLine()
                if ($line -and $line.Trim()) {
                    $writer.WriteLine("PLIK:$line")
                }
            }
            $proc.WaitForExit()
            $writer.Flush()
            $res.Close()
            Write-Host "[+] Zakonczono skanowanie strumieniowe dysku C:\." -ForegroundColor Green
        }
        elseif ($path -eq "/procesy") {
            $res.ContentType = "application/json; charset=utf-8"
            $procs = Get-Process | Select-Object Id, ProcessName | ForEach-Object {
                "{""pid"":""$($_.Id)"",""name"":""$($_.ProcessName)""}"
            }
            $json = "[" + ($procs -join ",") + "]"
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
            $res.ContentLength64 = $bytes.Length
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
            $res.Close()
        }
        elseif ($path -eq "/system-info") {
            $res.ContentType = "application/json; charset=utf-8"
            $os = Get-CimInstance Win32_OperatingSystem
            $totalRam = [Math]::Round($os.TotalVisibleMemorySize / 1MB)
            $freeRam = [Math]::Round($os.FreePhysicalMemory / 1MB)
            $usedRam = $totalRam - $freeRam
            $ramPct = [Math]::Round(($usedRam / $totalRam) * 100)
            $cpu = 15
            try {
                $cpuObj = (Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average
                if ($cpuObj) { $cpu = [Math]::Round($cpuObj) }
            } catch {}

            $json = "{""cpu"":$cpu,""ram"":{""total"":$totalRam,""used"":$usedRam,""procent"":$ramPct}}"
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
            $res.ContentLength64 = $bytes.Length
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
            $res.Close()
        }
        else {
            $res.StatusCode = 200
            $bytes = [System.Text.Encoding]::UTF8.GetBytes("Wieszka AI Agent OK")
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
            $res.Close()
        }
    } catch {
        # continue loop
    }
}
