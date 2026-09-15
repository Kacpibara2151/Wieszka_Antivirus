import { SeverityLevel, ThreatCategory } from '../types';

export interface VirusDefinition {
  id: string;
  signatureHash: string;
  threatName: string;
  threatType: ThreatCategory;
  severity: SeverityLevel;
  description: string;
  riskScore: number;
  discoveredDate: string;
  targetPattern: string;
  indicators: string[];
  recommendedAction: string;
  isNewlyDownloaded?: boolean;
}

export const INITIAL_VIRUS_DEFINITIONS: VirusDefinition[] = [
  {
    id: 'vdef-1',
    signatureHash: '8f2d1e0a811c76251b3a8d9f000122ff',
    threatName: 'Trojan.Win32.Wieszka.Gen.A',
    threatType: 'Trojan',
    severity: 'Krytyczne',
    description: 'Złośliwy trojan podszywający się pod dokument PDF (.pdf.exe). Nawiązuje połączenie z serwerem C2.',
    riskScore: 98,
    discoveredDate: '2026-07-28',
    targetPattern: '*.pdf.exe',
    indicators: ['Podwójne rozszerzenie .pdf.exe', 'Nieznana sygnatura cyfrowa', 'Autostart HKCU\\Run'],
    recommendedAction: 'Kwarantanna i natychmiastowe usunięcie kluczy rejestru.',
  },
  {
    id: 'vdef-2',
    signatureHash: 'a11223344556677889900aabbccddeeff',
    threatName: 'Ransomware.Cryptor.Wieszka.X',
    threatType: 'Ransomware',
    severity: 'Krytyczne',
    description: 'Szyfruje pliki użytkownika algorytmem AES-256 z rozszerzeniem .wieszkalocked i usuwa kopie VSS.',
    riskScore: 100,
    discoveredDate: '2026-07-27',
    targetPattern: '*.wieszkalocked / win_system_patch_v2.ps1',
    indicators: ['Modyfikacja vssadmin.exe', 'Masowe szyfrowanie dokumentów', 'Żądanie okupu BTC'],
    recommendedAction: 'Zablokuj proces PowerShell i przywróć pliki z kopii zapasowej.',
  },
  {
    id: 'vdef-3',
    signatureHash: '556677889900aabbccddeeff11223344',
    threatName: 'Adware.PUP.BrowserInjector',
    threatType: 'Adware',
    severity: 'Średnie',
    description: 'Potencjalnie niechciany program (PUP) wstrzykujący reklamy do przeglądarek i podmieniający stronę startową.',
    riskScore: 65,
    discoveredDate: '2026-07-20',
    targetPattern: 'chrome_speed_booster.dll',
    indicators: ['Skrypty trackingowe ad-network.xyz', 'Modyfikacja skrótów przeglądarki'],
    recommendedAction: 'Usuń bibliotekę DLL z folderu programu i wyczyść pamięć podręczną przeglądarki.',
  },
  {
    id: 'vdef-4',
    signatureHash: '9900aabbccddeeff1122334455667788',
    threatName: 'CoinMiner.JS.Monero.Gen',
    threatType: 'Spyware',
    severity: 'Wysokie',
    description: 'Cichy kopacz kryptowaluty Monero wykorzystujący 100% mocy obliczeniowej CPU bez wiedzy użytkownika.',
    riskScore: 88,
    discoveredDate: '2026-07-25',
    targetPattern: 'crypto_miner_svc.js',
    indicators: ['Połączenie stratum+tcp://pool.monero.org:3333', '100% obciążenia rdzeni CPU'],
    recommendedAction: 'Zakończ proces Node/JS i usuń plik z AppData\\Roaming.',
  },
  {
    id: 'vdef-5',
    signatureHash: 'feebda112233445566778899aabbccdd',
    threatName: 'Spyware.KeyLogger.DriverHook',
    threatType: 'Keylogger',
    severity: 'Krytyczne',
    description: 'Sterownik jądra systemu przechwytujący uderzenia klawiszy, hasła do bankowości i dane kart płatniczych.',
    riskScore: 96,
    discoveredDate: '2026-07-28',
    targetPattern: 'keylogger_driver.sys',
    indicators: ['Funkcja SetWindowsHookExW', 'Zapis do ukrytego pliku keys.dat'],
    recommendedAction: 'Odinstaluj złośliwy sterownik systemowy w trybie awaryjnym.',
  },
  {
    id: 'vdef-malware-1',
    signatureHash: '778899aabbccddeeff00112233445566',
    threatName: 'Malware.Win32.Stealer.Generic',
    threatType: 'Malware',
    severity: 'Krytyczne',
    description: 'Złośliwe oprogramowanie typu Malware (Infostealer) wykradające pliki sesyjne, zapisane loginy i portfele kryptowalutowe.',
    riskScore: 97,
    discoveredDate: '2026-07-28',
    targetPattern: 'system_optimizer_crack.exe',
    indicators: ['Odczyt Login Data w Chrome/Edge', 'Wykradanie portfela MetaMask', 'Wysyłanie danych na serwer C2'],
    recommendedAction: 'Natychmiast poddaj plik kwarantannie i wyczyść pliki tymczasowe.',
  },
];

// Newly discovered viruses added when user downloads the updated virus database!
export const DOWNLOADABLE_NEW_VIRUS_DEFINITIONS: VirusDefinition[] = [
  {
    id: 'vdef-6',
    signatureHash: 'e7c123498ab011223344556677889900',
    threatName: 'Trojan.Win32.AgentTesla.v9',
    threatType: 'Trojan',
    severity: 'Krytyczne',
    description: 'Odkryty w najnowszej bazie: Zaawansowany stealer wyłudzający zapisane hasła z przeglądarek oraz klientów FTP/SMTP.',
    riskScore: 97,
    discoveredDate: '2026-07-29',
    targetPattern: 'agent_tesla_update.exe',
    indicators: ['Wyciąganie haseł z Chrome/Edge/Firefox', 'Wysyłanie danych wykradzionych przez serwer SMTP'],
    recommendedAction: 'Natychmiast poddaj kwarantannie i zmień hasła w przeglądarkach.',
    isNewlyDownloaded: true,
  },
  {
    id: 'vdef-7',
    signatureHash: 'f88192aaccbb11223344556677889911',
    threatName: 'Ransom.LockBit.v4.Payload',
    threatType: 'Ransomware',
    severity: 'Krytyczne',
    description: 'Odkryty w najnowszej bazie: Zagrożenie Ransomware 4. generacji paraliżujące pliki systemowe i sieciowe.',
    riskScore: 99,
    discoveredDate: '2026-07-29',
    targetPattern: 'lockbit_v4_payload.vbs',
    indicators: ['Szyfrowanie macierzy RAID i dysków sieciowych', 'Blokowanie sesji RDP'],
    recommendedAction: 'Izolacja komputera od sieci i zatrzymanie usługa VBScript.',
    isNewlyDownloaded: true,
  },
  {
    id: 'vdef-8',
    signatureHash: '77bb112233445566778899aabbccdd12',
    threatName: 'Spyware.Pegasus.x64.Hook',
    threatType: 'Spyware',
    severity: 'Krytyczne',
    description: 'Odkryty w najnowszej bazie: Zero-day spyware podglądający kamerę, mikrofon oraz schowek systemowy.',
    riskScore: 95,
    discoveredDate: '2026-07-29',
    targetPattern: 'system_driver_hook.dll',
    indicators: ['Przechwytywanie obrazu z kamerki web', 'Monitoring bufora schowka Windows'],
    recommendedAction: 'Zablokuj dostęp DLL w rejestrze i uaktywnij Ochronę w Czasie Rzeczywistym.',
    isNewlyDownloaded: true,
  },
  {
    id: 'vdef-9',
    signatureHash: '112233445566778899aabbccddeeff99',
    threatName: 'Worm.Stuxnet.Variant.C',
    threatType: 'Rootkit',
    severity: 'Wysokie',
    description: 'Odkryty w najnowszej bazie: Robak infekujący urządzenia USB oraz wywołujący modyfikacje procesów systemowych.',
    riskScore: 91,
    discoveredDate: '2026-07-29',
    targetPattern: 'temp_service_host.vbs',
    indicators: ['Rozprzestrzenianie przez urządzenia przenośne', 'Modyfikacja rejestru Windows autorun.inf'],
    recommendedAction: 'Wyłącz automatyczne odtwarzanie nośników USB.',
    isNewlyDownloaded: true,
  },
  {
    id: 'vdef-10',
    signatureHash: '44556677889900aabbccddeeff112233',
    threatName: 'Backdoor.ShadowGrid.Stealer',
    threatType: 'Trojan',
    severity: 'Krytyczne',
    description: 'Odkryty w najnowszej bazie: Złośliwy konik trojański otwierający niewidoczną furtkę RDP na porcie 4444.',
    riskScore: 96,
    discoveredDate: '2026-07-29',
    targetPattern: 'invoice_scan.zip.exe',
    indicators: ['Otwieranie portów TCP 4444 i 8080', 'Nawiązywanie połączenia z siecią TOR'],
    recommendedAction: 'Zablokuj ruch na porcie 4444 w zaporze firewall.',
    isNewlyDownloaded: true,
  },
];
