export type SeverityLevel = 'Krytyczne' | 'Wysokie' | 'Średnie' | 'Niskie' | 'Bezpieczny';
export type ThreatCategory = 'Ransomware' | 'Trojan' | 'Spyware' | 'Keylogger' | 'Adware' | 'Rootkit' | 'PUP' | 'Heuristic' | 'Safe' | 'Malware' | 'Exploit';
export type ThreatStatus = 'Wykryto' | 'Kwarantanna' | 'Usunięto' | 'Zignorowano';
export type ScanType = 'quick' | 'full' | 'custom' | 'ai';
export type ScanPhase = 'Boot Sector & MBR' | 'Pamięć Operacyjna RAM' | 'Sektory Plików Systemowych' | 'Baza Rejestru' | 'Pliki Programów' | 'Pobranie i Dokumenty' | 'Analiza Heurystyczna AI';

export interface FileItem {
  id: string;
  name: string;
  path: string;
  sizeKb: number;
  type: string;
  category: 'System' | 'Executable' | 'Script' | 'Document' | 'Archive' | 'Library';
  content?: string;
  hash: string;
  lastModified: string;
  isKnownMalicious?: boolean;
  defaultThreatDetails?: {
    threatName: string;
    threatType: ThreatCategory;
    severity: SeverityLevel;
    description: string;
    riskScore: number;
    indicators: string[];
  };
  originalFile?: File;
  isRealUserFile?: boolean;
  isHidden?: boolean;
}

export interface ThreatItem {
  id: string;
  fileName: string;
  filePath: string;
  threatName: string;
  threatType: ThreatCategory;
  severity: SeverityLevel;
  riskScore: number;
  confidenceScore: number;
  status: ThreatStatus;
  detectedAt: string;
  description: string;
  indicators: string[];
  recommendedAction: string;
  codeSnippet?: string;
  hash: string;
}

export interface ScanProgress {
  scanType: ScanType;
  isActive: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  currentPhase: ScanPhase;
  progressPercent: number;
  currentFilePath: string;
  scannedFilesCount: number;
  hiddenFilesCount?: number;
  totalFilesToScan: number;
  threatsFoundCount: number;
  scanDurationSeconds: number;
  logs: string[];
  detectedThreats: ThreatItem[];
}

export interface ProtectionShield {
  id: string;
  name: string;
  namePl: string;
  description: string;
  active: boolean;
  threatsBlockedToday: number;
  iconName: string;
  sensitivity: 'Niska' | 'Zalecana' | 'Maksymalna (AI)';
}

export interface ProcessItem {
  pid: number;
  name: string;
  memoryMb: number;
  cpuPercent: number;
  path: string;
  status: 'Bezpieczny' | 'Skandowany' | 'Podejrzany';
  sha256: string;
  threatName?: string;
}

export interface SystemHealthStats {
  healthScore: number; // 0-100
  statusMessage: string;
  lastFullScanDate: string;
  totalFilesProtected: number;
  totalThreatsBlocked: number;
  activeShieldsCount: number;
  virusDatabaseVersion: string;
  virusDbUpdateDate: string;
  cpuUsage?: number;
  ramUsageGb?: number;
  ramTotalGb?: number;
}

export type PlanTier = 'FREE' | 'PRO' | 'ULTIMATE';
export type BillingCycle = '1m' | '3m' | '12m';

export interface UserProfile {
  isLoggedIn: boolean;
  email: string;
  name: string;
}

export interface UserSubscription {
  activePlan: PlanTier;
  billingCycle: BillingCycle;
  isTrial: boolean;
  trialDaysLeft: number;
  nextBillingDate: string;
  monthlyFeePln: number;
  totalPaidPln: number;
  canCancelWithRefund: boolean;
  startDate: string;
  paymentMethod?: string;
}

export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'interval';

export interface ScheduledScan {
  id: string;
  title: string;
  frequency: ScheduleFrequency;
  time: string; // e.g. "14:30"
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, ...
  scanType: ScanType;
  targetPath?: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
}

export interface BackgroundModeSettings {
  runInBackground: boolean; // Minimize to system tray
  startWithSystem: boolean; // Autostart on OS boot
  silentNotifications: boolean; // Show quiet background notifications
  autoScheduledScans: boolean; // Execute schedule in background daemon
}

export interface SetupConfig {
  isCompleted: boolean;
  protectionPreset: 'max_ai' | 'balanced' | 'gamer_light';
  backgroundEnabled: boolean;
  trayMinimize: boolean;
  quickScanDaily: boolean;
  scanTime: string;
  language: string;
  scannedDrives?: string[];
}

export type WizardConfig = SetupConfig;

export interface DangerousWebsite {
  id: string;
  domain: string;
  urlPattern: string;
  threatType: 'Phishing' | 'Malware Distribution' | 'Cryptominer' | 'C2 Server' | 'Browser Exploit' | 'Fake Tech Support Scam' | 'Ransomware Host';
  severity: SeverityLevel;
  riskScore: number;
  addedDate: string;
  source: string;
  description: string;
  blockedCount: number;
  status: 'active' | 'blocked';
  isNewlyDownloaded?: boolean;
}

export interface WebScriptThreat {
  type: 'inline' | 'external';
  sourceOrUrl: string;
  isMalicious: boolean;
  threatType?: string;
  indicators: string[];
  snippet?: string;
}

export interface WebScanSecurityHeader {
  name: string;
  value: string | null;
  status: 'secure' | 'warning' | 'missing';
  recommendation: string;
}

export interface WebMaliciousSnippet {
  codeSnippet: string;
  explanation: string;
  threatType: string;
  severity: SeverityLevel | string;
  location?: string;
}

export interface WebAiCodeAnalysis {
  analyzed: boolean;
  maliciousCodeSnippets: WebMaliciousSnippet[];
  aiVerdict: string;
  suspiciousFunctionsDetected: string[];
  riskLevel: string;
}

export interface WebScanResult {
  url: string;
  normalizedUrl: string;
  domain: string;
  ip?: string;
  statusCode: number;
  responseTimeMs: number;
  isHttps: boolean;
  sslValid: boolean;
  isThreat: boolean;
  threatName?: string;
  threatType: string;
  severity: SeverityLevel;
  riskScore: number; // 0-100
  confidenceScore: number; // 0-100
  summary: string;
  indicators: string[];
  scriptsCount: number;
  maliciousScriptsCount: number;
  scripts: WebScriptThreat[];
  securityHeaders: WebScanSecurityHeader[];
  formsCount: number;
  hasInsecureForms: boolean;
  hiddenIframesCount: number;
  aiAnalyzed: boolean;
  isInstantDatabaseMatch?: boolean;
  aiCodeAnalysis?: WebAiCodeAnalysis;
  databaseMatch?: {
    domain: string;
    threatType: string;
    source: string;
    severity: string;
    description?: string;
    riskScore?: number;
  } | null;
  recommendedAction: string;
  scannedAt: string;
}

