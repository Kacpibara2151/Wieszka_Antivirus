import express from 'express';
import cors from 'cors';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exec, spawn, execSync } from 'child_process';

const app = express();
app.use(cors());
app.use(express.json());

// 1. SILNIK GŁĘBOKIEGO SKANOWANIA DYSKÓW
function getWindowsDrives(): string[] {
    try {
        const stdout = execSync('wmic logicaldisk get name').toString();
        return stdout.split('\r\r\n').map(v => v.trim()).filter(v => /[A-Z]:/.test(v)).map(d => `${d}\\`);
    } catch { return ['C:\\']; }
}

app.get('/skanuj', async (req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    if (process.platform !== 'win32') {
        res.write("Głębokie skanowanie działa tylko na systemie Windows!\n");
        res.end();
        return;
    }
    const dyski = getWindowsDrives();
    for (const d of dyski) {
        const skanerProcess = spawn('cmd.exe', ['/c', `dir "${d}" /a /s /b`], { windowsHide: true });
        let buffer = '';
        for await (const chunk of skanerProcess.stdout) {
            buffer += chunk.toString();
            const linie = buffer.split('\r\n');
            buffer = linie.pop() || '';
            for (const linia of linie) {
                if (linia.trim()) res.write(`PLIK:${linia}\n`);
            }
        }
        await new Promise((resolve) => skanerProcess.on('close', resolve));
    }
    res.end();
});

// 2. KOD NA WYKRYWANIE RAMU I ZUŻYCIA CPU (MONITOR SYSTEMU)
app.get('/system-info', async (req, res) => {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    // Algorytm pobierający czas rdzeni procesora (CPU delta)
    const cpusStart = os.cpus();
    setTimeout(() => {
        const cpusEnd = os.cpus();
        let idleDifference = 0, totalDifference = 0;
        
        for (let i = 0; i < cpusStart.length; i++) {
            const start = cpusStart[i].times;
            const end = cpusEnd[i].times;
            const startTotal = start.user + start.nice + start.sys + start.idle + start.irq;
            const endTotal = end.user + end.nice + end.sys + end.idle + end.irq;
            idleDifference += end.idle - start.idle;
            totalDifference += endTotal - startTotal;
        }
        
        const cpuUsage = totalDifference === 0 ? 0 : 100 - Math.floor((100 * idleDifference) / totalDifference);
        
        // Zwracamy czyste statystyki do frontendu strony
        res.json({
            cpu: cpuUsage,
            ram: {
                total: Math.round(totalMem / (1024 * 1024 * 1024)), // Wynik w GB
                used: Math.round(usedMem / (1024 * 1024 * 1024)),   // Wynik w GB
                procent: Math.round((usedMem / totalMem) * 100)
            }
        });
    }, 500); // Próbkowanie procesora w czasie pół sekundy
});

// 3. KOD NA MENEDŻER ZADAŃ (POBIERANIE PROCESÓW SYSTEMOWYCH WINDOWS)
app.get('/procesy', (req, res) => {
    // Pobieramy procesy w bezpiecznym formacie CSV, pomijając nagłówki systemu Windows
    const cmd = 'tasklist /FO CSV /NH';
    exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const listaProcesow: { pid: string, name: string }[] = [];
        const linie = stdout.split('\r\n');
        
        linie.forEach(linia => {
            // Rozbijamy format CSV: "nazwa","pid","sesja"
            const czesci = linia.split('","');
            if (czesci.length > 1) {
                listaProcesow.push({ 
                    name: czesci[0].replace(/"/g, ''), // oczyszczanie cudzysłowów z nazwy programu
                    pid: czesci[1].replace(/"/g, '')   // oczyszczanie cudzysłowów z numeru PID
                });
            }
        });
        
        // Zwracamy tablicę obiektów z procesami do Menedżera zadań na stronie
        res.json(listaProcesow);
    });
});

// Opcjonalny włącznik kill-process (do zamykania z poziomu strony)
app.post('/kill', (req, res) => {
    const { pid } = req.body;
    if (!pid) return res.status(400).json({ error: "Brak PID" });
    exec(`taskkill /F /PID ${pid}`, (err) => {
        if (err) return res.status(500).json({ error: "Błąd zamykania procesu" });
        res.json({ success: true });
    });
});

app.listen(4000, () => console.log('Zaktualizowany silnik (Skaner + RAM + CPU + Procesy) działa na porcie 4000!'));
