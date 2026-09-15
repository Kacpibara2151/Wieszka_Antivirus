const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { exec, spawn, execSync } = require('child_process');

function createWindow() {
    const win = new BrowserWindow({
        width: 1100,
        height: 800,
        title: "Wieszka Antivirus",
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
}

// OBSŁUGA KOMUNIKACJI INTERFEJSU Z SYSTEMEM (IPC)
// Głębokie skanowanie dysków przez cmd
ipcMain.on('uruchom-skanowanie', async (event) => {
    try {
        const stdout = execSync('wmic logicaldisk get name').toString();
        const dyski = stdout.split('\r\r\n').map(v => v.trim()).filter(v => /[A-Z]:/.test(v)).map(d => `${d}\\`);
        
        for (const d of dyski) {
            const skanerProcess = spawn('cmd.exe', ['/c', `dir "${d}" /a /s /b`], { windowsHide: true });
            let buffer = '';
            for await (const chunk of skanerProcess.stdout) {
                buffer += chunk.toString();
                const linie = buffer.split('\r\n');
                buffer = linie.pop() || '';
                for (const linia of linie) {
                    if (linia.trim()) event.reply('skanowany-plik', linia);
                }
            }
        }
        event.reply('skanowanie-zakonczone');
    } catch (err) {
        event.reply('skanowanie-blad', err.message);
    }
});

// Monitor systemu CPU i RAM
ipcMain.on('pobierz-system-info', (event) => {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
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
        
        event.reply('odpowiedz-system-info', {
            cpu: cpuUsage,
            ram: { total: Math.round(totalMem / 1024**3), used: Math.round(usedMem / 1024**3), procent: Math.round((usedMem / totalMem) * 100) }
        });
    }, 500);
});

// Menedżer zadań
ipcMain.on('pobierz-procesy', (event) => {
    exec('tasklist /FO CSV /NH', { maxBuffer: 1024 * 1024 * 10 }, (err, stdout) => {
        if (err) return;
        const lista = [];
        stdout.split('\r\n').forEach(linia => {
            const czesci = linia.split('","');
            if (czesci.length > 1) {
                lista.push({ name: czesci[0].replace(/"/g, ''), pid: czesci[1].replace(/"/g, '') });
            }
        });
        event.reply('odpowiedz-procesy', lista);
    });
});

ipcMain.on('kill-proces', (event, pid) => {
    exec(`taskkill /F /PID ${pid}`);
});

// Skanowanie strony WWW pod kątem złośliwego kodu
ipcMain.on('skanuj-url', async (event, url) => {
    try {
        if (!url) return event.reply('odpowiedz-skanuj-url', { error: 'Brak adresu URL' });
        let target = url.trim();
        if (!/^https?:\/\//i.test(target)) target = 'https://' + target;

        const response = await fetch(target, { headers: { 'User-Agent': 'WieszkaAntivirus-Electron/4.8' } });
        const html = await response.text();
        const hasCoinMiner = /coinhive|cryptonight|miner\.start/i.test(html);
        const hasEval = /eval\s*\(function\(p,a,c,k,e,d\)|eval\s*\(atob\(/i.test(html);
        const isThreat = hasCoinMiner || hasEval;

        event.reply('odpowiedz-skanuj-url', {
            success: true,
            url: target,
            isThreat,
            threatType: isThreat ? 'Złośliwy skrypt WWW' : 'Bezpieczna witryna',
            hasCoinMiner,
            hasEval
        });
    } catch (e) {
        event.reply('odpowiedz-skanuj-url', { error: e.message });
    }
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
