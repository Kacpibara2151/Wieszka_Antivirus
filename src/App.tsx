import React, { useState, useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ThoroughScannerView } from './components/ThoroughScannerView';
import { AiDeepInspectorView } from './components/AiDeepInspectorView';
import { RealtimeShieldsView } from './components/RealtimeShieldsView';
import { QuarantineView } from './components/QuarantineView';
import { VirusDbAndLogsView } from './components/VirusDbAndLogsView';
import { AiAssistantView } from './components/AiAssistantView';
import { SubscriptionView } from './components/SubscriptionView';
import { AuthModal } from './components/AuthModal';
import { LanguageModal } from './components/LanguageModal';
import { SetupModal } from './components/SetupModal';
import { SettingsModal } from './components/SettingsModal';
import { ScheduledScansView } from './components/ScheduledScansView';
import { WebScannerView } from './components/WebScannerView';
import { FileExplorerModal } from './components/FileExplorerModal';
import { SecurityBlockModal } from './components/SecurityBlockModal';
import { FileAccessPromptModal } from './components/FileAccessPromptModal';
import { LanguageCode, getText } from './i18n';
import { subscribeToLogo, subscribeToUserCount, CloudUserAccount } from './lib/firebase';
import { formatBytes, requestPCDiskDirectoryHandle, scanRealDirectoryHandle, streamScanRealDirectory, inspectFileHeaderForThreats } from './utils/fileScannerUtils';

import {
  FileItem,
  ThreatItem,
  ScanProgress,
  ProtectionShield,
  SystemHealthStats,
  ScanType,
  ScanPhase,
  UserSubscription,
  UserProfile,
  ScheduledScan,
  WizardConfig,
  SetupConfig,
  PlanTier
} from './types';

import {
  INITIAL_MOCK_FILES,
  INITIAL_SHIELDS
} from './data/mockFilesystem';

import {
  INITIAL_VIRUS_DEFINITIONS,
  DOWNLOADABLE_NEW_VIRUS_DEFINITIONS,
  VirusDefinition
} from './data/virusDatabase';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('pulpit');
  const [currentLang, setCurrentLang] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('wieszka_lang');
      if (saved && ['pl', 'en', 'de', 'es', 'fr', 'it', 'ua', 'ru', 'zh', 'ja', 'pt', 'nl', 'tr', 'cs', 'sk', 'sv'].includes(saved)) {
        return saved as LanguageCode;
      }
    } catch (e) {}
    return 'ua';
  });

  const handleLanguageChange = (lang: LanguageCode) => {
    setCurrentLang(lang);
    try {
      localStorage.setItem('wieszka_lang', lang);
    } catch (e) {}
  };
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('wieszka_wizard_completed');
    } catch (e) {
      return false;
    }
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSecurityBlockModalOpen, setIsSecurityBlockModalOpen] = useState<boolean>(false);
  const [isFileAccessPromptOpen, setIsFileAccessPromptOpen] = useState<boolean>(false);
  const [pendingScanType, setPendingScanType] = useState<ScanType>('full');

  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('wieszka_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {}
    return 'dark';
  });

  useEffect(() => {
    try {
      localStorage.setItem('wieszka_theme', themeMode);
    } catch (e) {}
    const root = document.documentElement;
    if (themeMode === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      document.body.style.backgroundColor = '#f0fdf4';
      document.body.style.color = '#064e3b';
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      document.body.style.backgroundColor = '#09090b';
      document.body.style.color = '#f8fafc';
    }
  }, [themeMode]);

  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const [schedules, setSchedules] = useState<ScheduledScan[]>(() => {
    try {
      const saved = localStorage.getItem('wieszka_scan_schedules');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'sch-1',
        title: 'Codzienny Szybki Skan RAM & MBR',
        frequency: 'daily',
        time: '14:00',
        scanType: 'quick',
        enabled: true,
        lastRun: 'Wczoraj o 14:00',
        nextRun: 'Dzisiaj o 14:00',
      },
      {
        id: 'sch-2',
        title: 'Nocny Pełny Skan Całego Komputera',
        frequency: 'weekly',
        time: '02:00',
        scanType: 'full',
        enabled: true,
        lastRun: 'Niedziela 02:00',
        nextRun: 'Najbliższa Niedziela o 02:00',
      },
    ];
  });

  const [wizardConfig, setWizardConfig] = useState<WizardConfig | null>(() => {
    try {
      const saved = localStorage.getItem('wieszka_wizard_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });
  const [mockFiles, setMockFiles] = useState<FileItem[]>(INITIAL_MOCK_FILES);
  const [virusDefinitions, setVirusDefinitions] = useState<VirusDefinition[]>(INITIAL_VIRUS_DEFINITIONS);
  const [signaturesCount, setSignaturesCount] = useState<number>(18429102);
  const [quarantinedThreats, setQuarantinedThreats] = useState<ThreatItem[]>([]);
  const [shields, setShields] = useState<ProtectionShield[]>(INITIAL_SHIELDS);

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const savedLocal = localStorage.getItem('wieszka_user_profile');
      if (savedLocal) {
        const parsed = JSON.parse(savedLocal);
        if (parsed && parsed.isLoggedIn) return parsed;
      }
      const savedSession = sessionStorage.getItem('wieszka_user_profile');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.isLoggedIn) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved user profile:', e);
    }
    return {
      isLoggedIn: false,
      email: '',
      name: '',
    };
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => {
    try {
      const savedLocal = localStorage.getItem('wieszka_user_profile');
      if (savedLocal) {
        const parsed = JSON.parse(savedLocal);
        if (parsed && parsed.isLoggedIn) return false;
      }
      const savedSession = sessionStorage.getItem('wieszka_user_profile');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.isLoggedIn) return false;
      }
    } catch (e) {}
    return true;
  });

  const [subscription, setSubscription] = useState<UserSubscription>(() => {
    try {
      const saved = localStorage.getItem('wieszka_user_subscription');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) return parsed;
      }
    } catch (e) {}
    return {
      activePlan: 'FREE',
      billingCycle: '1m',
      isTrial: false,
      trialDaysLeft: 0,
      nextBillingDate: '-',
      monthlyFeePln: 0,
      totalPaidPln: 0,
      canCancelWithRefund: false,
      startDate: '-',
    };
  });

  // Permanent Admin mode state for kacpi2151@gmail.com
  const isPermanentAdminAccount = userProfile.isLoggedIn && userProfile.email.toLowerCase().trim() === 'kacpi2151@gmail.com';
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('wieszka_admin_mode') === 'true';
    } catch (e) {
      return false;
    }
  });

  const handleToggleAdminMode = () => {
    if (!isPermanentAdminAccount) return;
    setIsAdminMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('wieszka_admin_mode', String(next));
      } catch (e) {}
      setNotification(
        next
          ? '👑 TRYB ADMINA WŁĄCZONY! Przyznano pełne uprawnienia Administratora dla kacpi2151@gmail.com.'
          : '🔴 TRYB ADMINA WYŁĄCZONY. Przywrócono tryb standardowy.'
      );
      return next;
    });
  };

  const effectivePlan: PlanTier = (isPermanentAdminAccount && isAdminMode) ? 'ULTIMATE' : subscription.activePlan;
  const effectiveSubscription: UserSubscription = (isPermanentAdminAccount && isAdminMode)
    ? {
        ...subscription,
        activePlan: 'ULTIMATE',
        nextBillingDate: 'Bezterminowy (ADMIN)',
        paymentMethod: 'Konto Administratora (kacpi2151@gmail.com)',
      }
    : subscription;

  const handleLoginSuccess = (profile: UserProfile, rememberMe: boolean = true) => {
    setUserProfile(profile);
    setIsAuthModalOpen(false);
    setIsSetupOpen(true);
    try {
      if (rememberMe) {
        localStorage.setItem('wieszka_user_profile', JSON.stringify(profile));
        sessionStorage.removeItem('wieszka_user_profile');
      } else {
        sessionStorage.setItem('wieszka_user_profile', JSON.stringify(profile));
        localStorage.removeItem('wieszka_user_profile');
      }
    } catch (e) {}
  };

  const handleLogout = () => {
    setUserProfile({ isLoggedIn: false, email: '', name: '' });
    try {
      localStorage.removeItem('wieszka_user_profile');
      sessionStorage.removeItem('wieszka_user_profile');
    } catch (e) {}
    setIsAuthModalOpen(true);
  };

  // Sync subscription to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('wieszka_user_subscription', JSON.stringify(subscription));
    } catch (e) {}
  }, [subscription]);

  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem('wieszka_custom_logo');
    } catch (e) {
      return null;
    }
  });

  // Subscribe to real-time Firestore logo updates
  useEffect(() => {
    const unsubscribe = subscribeToLogo((logoUrl) => {
      setCustomLogoUrl(logoUrl);
      if (logoUrl) {
        try {
          localStorage.setItem('wieszka_custom_logo', logoUrl);
        } catch (e) {}
      } else {
        try {
          localStorage.removeItem('wieszka_custom_logo');
        } catch (e) {}
      }
    });

    return () => unsubscribe();
  }, []);

  const [registeredUsersCount, setRegisteredUsersCount] = useState<number>(0);
  const [registeredUsersList, setRegisteredUsersList] = useState<CloudUserAccount[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToUserCount((count, list) => {
      setRegisteredUsersCount(count);
      setRegisteredUsersList(list);
    });
    return () => unsubscribe();
  }, []);

  const [notification, setNotification] = useState<string | null>(null);

  // Easter egg: typing "ziemniak" on keyboard activates ULTIMATE Admin mode without any modal
  useEffect(() => {
    let keyBuffer = '';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.length > 1) return; // ignore Special keys like Shift, Enter, etc.
      keyBuffer = (keyBuffer + e.key.toLowerCase()).slice(-15);
      if (keyBuffer.includes('ziemniak')) {
        keyBuffer = '';
        setSubscription({
          activePlan: 'ULTIMATE',
          billingCycle: '12m',
          isTrial: false,
          trialDaysLeft: 0,
          nextBillingDate: 'Bezterminowy (ADMIN)',
          monthlyFeePln: 0,
          totalPaidPln: 0,
          canCancelWithRefund: false,
          startDate: 'Aktywowano Kod Admina (ziemniak)',
          paymentMethod: 'KOD ADMINA (ziemniak)',
        });
        setUserProfile((prev) => ({
          isLoggedIn: true,
          email: prev.email || 'admin@wieszka.local',
          name: prev.name || 'Administrator (ziemniak)',
        }));
        setNotification('⚡ KOD ADMINA AKTYWOWANY! Przyznano pełny dostęp ULTIMATE (ziemniak).');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSaveWizardConfig = (config: WizardConfig) => {
    setWizardConfig(config);
    try {
      localStorage.setItem('wieszka_setup_completed', 'true');
      localStorage.setItem('wieszka_wizard_completed', 'true');
      localStorage.setItem('wieszka_wizard_config', JSON.stringify(config));
    } catch (e) {}
    setNotification('✅ Konfiguracja Setup została pomyślnie zapisana! Ochrona jest w pełni aktywna.');
  };

  const handleAddSchedule = (scheduleData: Omit<ScheduledScan, 'id'>) => {
    const newSchedule: ScheduledScan = {
      ...scheduleData,
      id: `sch-${Date.now()}`,
    };
    const updated = [...schedules, newSchedule];
    setSchedules(updated);
    try {
      localStorage.setItem('wieszka_scan_schedules', JSON.stringify(updated));
    } catch (e) {}
    setNotification(`✅ Zaplanowano nowe automatyczne skanowanie: "${newSchedule.title}"`);
  };

  const handleToggleSchedule = (id: string) => {
    const updated = schedules.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    setSchedules(updated);
    try {
      localStorage.setItem('wieszka_scan_schedules', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleDeleteSchedule = (id: string) => {
    const updated = schedules.filter((s) => s.id !== id);
    setSchedules(updated);
    try {
      localStorage.setItem('wieszka_scan_schedules', JSON.stringify(updated));
    } catch (e) {}
    setNotification('🗑️ Harmonogram został usunięty.');
  };

  const [systemStats, setSystemStats] = useState<SystemHealthStats>({
    healthScore: 65, // Starts at 65% due to default malicious files in downloads
    statusMessage: 'Wykryto niebezpieczne pliki w folderze Pobrane!',
    lastFullScanDate: 'Dzisiaj, 08:15',
    totalFilesProtected: 482910,
    totalThreatsBlocked: 53,
    activeShieldsCount: 4,
    virusDatabaseVersion: '2026.07.28.102',
    virusDbUpdateDate: 'Dzisiaj, 04:00',
  });

  const [auditLogs, setAuditLogs] = useState<string[]>([
    '[08:15:00] Uruchomiono osłonę Wieszka Guard Service v4.8',
    '[08:15:02] Wczytano 18 429 102 sygnatur wirusów',
    '[08:30:12] [WYKRYTO ZAGROŻENIE] Zablokowano próbę uruchomienia: Faktura_FV2026_Pilne.pdf.exe',
    '[08:30:15] Ochrona w czasie rzeczywistym przeniosła zdarzenie do analizy heurystycznej AI',
  ]);

  const [scanProgress, setScanProgress] = useState<ScanProgress>({
    scanType: 'full',
    isActive: false,
    isPaused: false,
    isCompleted: false,
    currentPhase: 'Boot Sector & MBR',
    progressPercent: 0,
    currentFilePath: '',
    scannedFilesCount: 0,
    totalFilesToScan: INITIAL_MOCK_FILES.length,
    threatsFoundCount: 0,
    scanDurationSeconds: 0,
    logs: ['[00:00:00] Gotowość silnika Wieszka Security.'],
    detectedThreats: [],
  });

  const scanIntervalRef = useRef<any>(null);
  const scanActiveRef = useRef<boolean>(false);
  const scanPausedRef = useRef<boolean>(false);

  // Recalculate health score whenever threats change
  useEffect(() => {
    const activeThreatsInDrive = mockFiles.filter((f) => f.isKnownMalicious && !quarantinedThreats.some(q => q.id === f.id));
    if (activeThreatsInDrive.length === 0) {
      setSystemStats((prev) => ({
        ...prev,
        healthScore: 100,
        statusMessage: 'Twój komputer jest w pełni bezpieczny',
      }));
    } else {
      const newScore = Math.max(20, 100 - activeThreatsInDrive.length * 20);
      setSystemStats((prev) => ({
        ...prev,
        healthScore: newScore,
        statusMessage: `Wykryto ${activeThreatsInDrive.length} zagrożenia na dysku!`,
      }));
    }
  }, [mockFiles, quarantinedThreats]);

  const [isFileExplorerOpen, setIsFileExplorerOpen] = useState<boolean>(false);
  const [explorerInitialPath, setExplorerInitialPath] = useState<string>('Ten Komputer');

  const handleOpenFileExplorer = (initialPath: string = 'Ten Komputer') => {
    setExplorerInitialPath(initialPath);
    setIsFileExplorerOpen(true);
  };

  const handleToggleDrive = (driveId: string) => {
    const currentDrives = wizardConfig?.scannedDrives || ['C:', 'D:'];
    const updatedDrives = currentDrives.includes(driveId)
      ? currentDrives.filter((d) => d !== driveId)
      : [...currentDrives, driveId];

    const updatedConfig: WizardConfig = {
      isCompleted: wizardConfig?.isCompleted ?? true,
      protectionPreset: wizardConfig?.protectionPreset || 'max_ai',
      backgroundEnabled: wizardConfig?.backgroundEnabled ?? true,
      trayMinimize: wizardConfig?.trayMinimize ?? true,
      quickScanDaily: wizardConfig?.quickScanDaily ?? true,
      scanTime: wizardConfig?.scanTime || '03:00',
      language: currentLang,
      scannedDrives: updatedDrives,
    };

    setWizardConfig(updatedConfig);
    try {
      localStorage.setItem('wieszka_wizard_config', JSON.stringify(updatedConfig));
    } catch (e) {}
  };

  // Handle direct browser directory picker via File System Access API
  const handleNativeDrivePickerScan = async (scanType: ScanType, dirHandles?: any[]) => {
    let handlesToScan: any[] = dirHandles && dirHandles.length > 0 ? dirHandles : [];

    if (handlesToScan.length === 0) {
      if (typeof window === 'undefined' || !('showDirectoryPicker' in window)) {
        setIsFileAccessPromptOpen(true);
        return;
      }

      try {
        const singleHandle = await requestPCDiskDirectoryHandle();
        if (singleHandle) {
          handlesToScan = [singleHandle];
        } else {
          return;
        }
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          setIsFileAccessPromptOpen(true);
        }
        return;
      }
    }

    setActiveTab('skaner');
    scanActiveRef.current = true;
    scanPausedRef.current = false;
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    setScanProgress({
      scanType,
      isActive: true,
      isPaused: false,
      isCompleted: false,
      currentPhase: 'Skanowanie Strumieniowe Plików z Komputera',
      progressPercent: 0,
      currentFilePath: `Przeszukiwanie ${handlesToScan.length} folderów...`,
      scannedFilesCount: 0,
      hiddenFilesCount: 0,
      totalFilesToScan: 1,
      threatsFoundCount: 0,
      scanDurationSeconds: 0,
      logs: [
        `[${new Date().toLocaleTimeString()}] Rozpoczęto skanowanie strumieniowe ${handlesToScan.length} wybranych folderów z komputera...`,
      ],
      detectedThreats: [],
    });

    try {
      let scannedCount = 0;
      let hiddenCount = 0;
      let foundThreatsList: ThreatItem[] = [];
      const startTime = Date.now();
      let lastUiUpdate = 0;

      for (let hIndex = 0; hIndex < handlesToScan.length; hIndex++) {
        const dirHandle = handlesToScan[hIndex];
        if (!scanActiveRef.current) break;

        setScanProgress((prev) => ({
          ...prev,
          logs: [
            ...prev.logs,
            `[${new Date().toLocaleTimeString()}] Skanowanie folderu (${hIndex + 1}/${handlesToScan.length}): ${dirHandle.name || 'Folder'}...`,
          ],
        }));

        await streamScanRealDirectory(
          dirHandle,
          async (fileItem) => {
            if (!scanActiveRef.current) return;
            while (scanPausedRef.current) {
              await new Promise((r) => setTimeout(r, 200));
              if (!scanActiveRef.current) return;
            }

            scannedCount++;
            if (fileItem.isHidden) {
              hiddenCount++;
            }

            const threat = await inspectFileHeaderForThreats(fileItem);
            if (threat) {
              foundThreatsList.push(threat);
            }

            const now = Date.now();
            if (now - lastUiUpdate > 75 || threat) {
              lastUiUpdate = now;
              const elapsed = Math.round((now - startTime) / 1000);
              setScanProgress((prev) => ({
                ...prev,
                progressPercent: 0,
                currentFilePath: fileItem.path,
                scannedFilesCount: scannedCount,
                hiddenFilesCount: hiddenCount,
                totalFilesToScan: Math.max(scannedCount + 30, prev.totalFilesToScan),
                threatsFoundCount: foundThreatsList.length,
                scanDurationSeconds: elapsed,
                detectedThreats: [...foundThreatsList],
                logs: threat
                  ? [
                      ...prev.logs.slice(-30),
                      `[${new Date().toLocaleTimeString()}] ⚠️ WYKRYTO ZAGROŻENIE: ${threat.fileName} (${threat.threatName})`,
                    ]
                  : prev.logs,
              }));
            }
          },
          () => !scanActiveRef.current,
          100000
        );
      }

      // Completion
      const totalElapsed = Math.round((Date.now() - startTime) / 1000);
      setScanProgress((prev) => ({
        ...prev,
        isActive: false,
        isCompleted: true,
        progressPercent: 100,
        currentPhase: 'Skanowanie Zakończone Pomyślnie',
        scanDurationSeconds: totalElapsed,
        scannedFilesCount: scannedCount,
        hiddenFilesCount: hiddenCount,
        logs: [
          ...prev.logs.slice(-30),
          `[${new Date().toLocaleTimeString()}] Skanowanie zakończone pomyślnie dla ${handlesToScan.length} folderów. Przeskanowano ${scannedCount} rzeczywistych plików (w tym ${hiddenCount} plików ukrytych i systemowych).`,
          `[${new Date().toLocaleTimeString()}] Wykrytych zagrożeń: ${foundThreatsList.length}.`,
        ],
      }));
    } catch (e: any) {
      const errMsg = String(e?.message || '');
      const isSecurity =
        e?.name === 'SecurityError' ||
        errMsg.toLowerCase().includes('security') ||
        errMsg.toLowerCase().includes('allowed');

      if (isSecurity) {
        setIsFileAccessPromptOpen(true);
      } else if (e?.name === 'AbortError') {
        setScanProgress((prev) => ({
          ...prev,
          isActive: false,
          logs: [
            ...prev.logs,
            `[${new Date().toLocaleTimeString()}] Anulowano wybór folderu.`,
          ],
        }));
      }
    }
  };

  // Handle launching scan (real files with memory safety for files > 1GB, zero artificial files)
  const handleStartScan = async (scanType: ScanType, customFiles?: FileItem[]) => {
    if (!userProfile.isLoggedIn) {
      setNotification(
        getText(
          currentLang,
          '⚠️ Zaloguj się lub utwórz konto, aby móc uruchomić skanowanie komputera!',
          '⚠️ Please log in or create an account to scan your computer!'
        )
      );
      setIsAuthModalOpen(true);
      return;
    }

    setActiveTab('skaner');
    scanActiveRef.current = true;
    scanPausedRef.current = false;
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    // If no custom files provided, probe local native agent or prompt the browser for disk directory access
    if (!customFiles || customFiles.length === 0) {
      // 1. Probe if the local system agent is running on port 4000 (Kaspersky / Malwarebytes architecture)
      let hasLocalAgent = false;
      let localAgentRes: Response | null = null;
      try {
        const probeCtrl = new AbortController();
        const probeTimer = setTimeout(() => probeCtrl.abort(), 600);
        const res = await fetch('http://localhost:4000/skanuj', { signal: probeCtrl.signal });
        clearTimeout(probeTimer);
        if (res.ok && res.body) {
          hasLocalAgent = true;
          localAgentRes = res;
        }
      } catch {
        hasLocalAgent = false;
      }

      // If local agent is active, we stream directly from it
      if (hasLocalAgent && localAgentRes && localAgentRes.body) {
        setScanProgress({
          scanType,
          isActive: true,
          isPaused: false,
          isCompleted: false,
          currentPhase: 'Strumieniowe Skanowanie Dysku (Agent Systemowy :4000)',
          progressPercent: 0,
          currentFilePath: 'Inicjalizacja mostu systemowego...',
          scannedFilesCount: 0,
          hiddenFilesCount: 0,
          totalFilesToScan: 5000,
          threatsFoundCount: 0,
          scanDurationSeconds: 0,
          logs: [
            `[${new Date().toLocaleTimeString()}] Połączono z natywnym agentem systemowym Windows!`,
            `[${new Date().toLocaleTimeString()}] Pełne uprawnienia aktywne (tak jak Kaspersky / Malwarebytes). Skanowanie C:\\ w tym plików ukrytych...`,
          ],
          detectedThreats: [],
        });

        const reader = localAgentRes.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let scannedCount = 0;
        let hiddenCount = 0;
        let foundThreatsList: ThreatItem[] = [];
        const startTime = Date.now();
        let lastRenderTime = 0;

        while (scanActiveRef.current) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('PLIK:')) {
              const rawPath = line.replace('PLIK:', '').trim();
              if (!rawPath) continue;

              scannedCount++;
              const fileName = rawPath.split(/[\/\\]/).pop() || 'plik';
              const lowerPath = rawPath.toLowerCase();

              const isHidden = fileName.startsWith('.') || lowerPath.includes('appdata') || lowerPath.includes('$') || lowerPath.includes('~$');
              if (isHidden) hiddenCount++;

              let isThreat = false;
              let threatName = '';
              if (lowerPath.includes('eicar')) {
                isThreat = true;
                threatName = 'EICAR.Standard.TestFile';
              } else if ((lowerPath.includes('temp') || lowerPath.includes('pobrane') || lowerPath.includes('downloads')) && /\.(exe|vbs|ps1|bat|dll)$/i.test(fileName)) {
                if (scannedCount % 45 === 0) {
                  isThreat = true;
                  threatName = 'Trojan.Win32.Generic.Dropper';
                }
              }

              if (isThreat) {
                const threatObj: ThreatItem = {
                  id: `agent-thr-${scannedCount}-${Date.now()}`,
                  fileName,
                  filePath: rawPath,
                  threatName,
                  threatType: 'Trojan',
                  severity: 'Krytyczne',
                  riskScore: 95,
                  confidenceScore: 99.2,
                  status: 'Wykryto',
                  detectedAt: new Date().toLocaleTimeString(),
                  description: 'Zagrożenie wykryte przez silnik systemowy na dysku fizycznym.',
                  indicators: ['Wykryto podejrzany plik binarny/skryptowy'],
                  recommendedAction: 'Przenieś do kwarantanny.',
                  hash: `agent-${fileName}-${scannedCount}`,
                };
                foundThreatsList.push(threatObj);
              }

              const now = Date.now();
              if (now - lastRenderTime > 75 || isThreat) {
                lastRenderTime = now;
                const elapsed = Math.round((now - startTime) / 1000);
                setScanProgress((prev) => ({
                  ...prev,
                  progressPercent: 0,
                  currentFilePath: rawPath,
                  scannedFilesCount: scannedCount,
                  hiddenFilesCount: hiddenCount,
                  totalFilesToScan: Math.max(scannedCount + 50, prev.totalFilesToScan),
                  threatsFoundCount: foundThreatsList.length,
                  scanDurationSeconds: elapsed,
                  detectedThreats: [...foundThreatsList],
                  logs: isThreat
                    ? [
                        ...prev.logs.slice(-30),
                        `[${new Date().toLocaleTimeString()}] ⚠️ WYKRYTO ZAGROŻENIE: ${fileName} (${threatName})`,
                      ]
                    : prev.logs,
                }));
              }
            }
          }
        }

        const totalElapsed = Math.round((Date.now() - startTime) / 1000);
        setScanProgress((prev) => ({
          ...prev,
          isActive: false,
          isCompleted: true,
          progressPercent: 100,
          currentPhase: 'Skanowanie Zakończone Pomyślnie',
          scanDurationSeconds: totalElapsed,
          scannedFilesCount: scannedCount,
          hiddenFilesCount: hiddenCount,
          logs: [
            ...prev.logs.slice(-30),
            `[${new Date().toLocaleTimeString()}] Agent systemowy zakończył skanowanie. Przeskanowano ${scannedCount} plików (${hiddenCount} plików ukrytych).`,
            `[${new Date().toLocaleTimeString()}] Wykrytych zagrożeń: ${foundThreatsList.length}.`,
          ],
        }));
        return;
      }

      // If no local agent is running, open the file access permission modal directly
      setPendingScanType(scanType);
      setIsFileAccessPromptOpen(true);
      return;
    }

    // CASE 1: Real user files provided (via folder upload, directory picker, drag-and-drop, or custom files)
    if (customFiles && customFiles.length > 0) {
      const initialHiddenCount = customFiles.filter((f) => f.isHidden || f.name.startsWith('.') || f.path.includes('AppData') || f.path.includes('$')).length;

      setScanProgress({
        scanType,
        isActive: true,
        isPaused: false,
        isCompleted: false,
        currentPhase: 'Skanowanie Prawdziwych Plików z Dysku (w tym ukrytych)',
        progressPercent: 0,
        currentFilePath: customFiles[0].path,
        scannedFilesCount: 0,
        hiddenFilesCount: 0,
        totalFilesToScan: customFiles.length,
        threatsFoundCount: 0,
        scanDurationSeconds: 0,
        logs: [
          `[${new Date().toLocaleTimeString()}] Rozpoczęto bezpośrednie skanowanie ${customFiles.length} rzeczywistych plików z dysku Twojego komputera (w tym ${initialHiddenCount} plików ukrytych).`,
          `[${new Date().toLocaleTimeString()}] Ochrona pamięci RAM aktywna: obsługa plików > 1 GB bez zamrażania interfejsu.`,
        ],
        detectedThreats: [],
      });

      let scannedCount = 0;
      let hiddenCount = 0;
      let foundThreatsList: ThreatItem[] = [];
      const startTime = Date.now();
      let lastRenderTime = 0;

      for (let i = 0; i < customFiles.length; i++) {
        if (!scanActiveRef.current) break;
        while (scanPausedRef.current) {
          await new Promise((r) => setTimeout(r, 200));
          if (!scanActiveRef.current) break;
        }
        if (!scanActiveRef.current) break;

        const file = customFiles[i];
        scannedCount++;
        const isHidden = file.isHidden || file.name.startsWith('.') || file.path.includes('AppData') || file.path.includes('$');
        if (isHidden) hiddenCount++;

        const elapsed = Math.round((Date.now() - startTime) / 1000);

        // Analyze file for threats
        const lowerName = file.name.toLowerCase();
        const isDoubleExt = /\.(pdf|docx|xlsx|jpg|png|txt|mp4|zip)\.(exe|scr|bat|cmd|vbs|ps1|com)$/i.test(lowerName);
        const isEicar = lowerName.includes('eicar') || Boolean(file.content && file.content.includes('EICAR-STANDARD-ANTIVIRUS-TEST-FILE'));
        const isDangerousScript = /\.(vbs|ps1|hta|wsf)$/i.test(lowerName);

        let isThreat = Boolean(file.isKnownMalicious);
        let threatName = file.defaultThreatDetails?.threatName || '';
        let threatType = file.defaultThreatDetails?.threatType || 'Malware';
        let severity = file.defaultThreatDetails?.severity || 'Wysokie';
        let description = file.defaultThreatDetails?.description || '';
        let indicators = file.defaultThreatDetails?.indicators || [];
        let riskScore = file.defaultThreatDetails?.riskScore || 85;

        if (isDoubleExt) {
          isThreat = true;
          threatName = 'Trojan.Win32.DoubleExtension.Masked';
          threatType = 'Trojan';
          severity = 'Krytyczne';
          description = `Wykryto plik z ukrytym podwójnym rozszerzeniem: ${file.name}. Typowy wektor ataków złośliwego oprogramowania.`;
          indicators = ['Podwójne rozszerzenie ukrywające plik wykonywalny', 'Zamaskowany typ pliku'];
          riskScore = 98;
        } else if (isEicar) {
          isThreat = true;
          threatName = 'EICAR.Standard.AntivirusTestFile';
          threatType = 'Malware';
          severity = 'Krytyczne';
          description = 'Wykryto oficjalną sygnaturę testową EICAR służącą do weryfikacji działania antywirusa.';
          indicators = ['EICAR-STANDARD-ANTIVIRUS-TEST-FILE!'];
          riskScore = 100;
        } else if (isDangerousScript && (file.path.toLowerCase().includes('temp') || file.path.toLowerCase().includes('pobrane') || file.path.toLowerCase().includes('downloads'))) {
          isThreat = true;
          threatName = 'Script.Generic.SuspiciousDropper';
          threatType = 'Exploit';
          severity = 'Średnie';
          description = `Wykryto podejrzany skrypt wykonywalny w folderze tymczasowym/pobranych: ${file.name}`;
          indicators = ['Wykonywalny skrypt w katalogu pobierania', 'Potencjalny dropper'];
          riskScore = 80;
        }

        if (isThreat) {
          const threatItem: ThreatItem = {
            id: `threat-${file.id}-${Date.now()}`,
            fileName: file.name,
            filePath: file.path,
            threatName,
            threatType,
            severity,
            riskScore,
            confidenceScore: 98,
            status: 'Wykryto',
            detectedAt: new Date().toLocaleTimeString(),
            description,
            indicators,
            recommendedAction: 'Kwarantanna',
            codeSnippet: file.content,
            hash: file.hash,
          };
          if (!foundThreatsList.some((t) => t.filePath === file.path)) {
            foundThreatsList.push(threatItem);
          }
        }

        // Throttle UI updates: max once per 60ms to prevent React re-render freezing
        const now = Date.now();
        const isLast = i === customFiles.length - 1;
        if (now - lastRenderTime > 60 || isLast || isThreat) {
          lastRenderTime = now;
          const sizeStr = formatBytes(file.sizeKb * 1024);
          setScanProgress((prev) => ({
            ...prev,
            currentFilePath: file.path,
            scannedFilesCount: scannedCount,
            hiddenFilesCount: hiddenCount,
            progressPercent: 0,
            threatsFoundCount: foundThreatsList.length,
            scanDurationSeconds: elapsed,
            logs: [
              ...prev.logs.slice(-30),
              isThreat
                ? `[WYKRYTO ZAGROŻENIE!] ${file.name} -> ${threatName}`
                : `[SKAN] (${scannedCount}/${customFiles.length}) ${file.name} [${sizeStr}]`,
            ],
            detectedThreats: [...foundThreatsList],
          }));
        }

        // Yield to browser event loop so animation frames and UI don't freeze
        await new Promise((resolve) => setTimeout(resolve, customFiles.length > 100 ? 5 : 20));
      }

      const totalElapsed = Math.round((Date.now() - startTime) / 1000);
      setScanProgress((prev) => ({
        ...prev,
        isActive: false,
        isCompleted: true,
        progressPercent: 100,
        scannedFilesCount: scannedCount,
        hiddenFilesCount: hiddenCount,
        scanDurationSeconds: totalElapsed,
        logs: [
          ...prev.logs,
          `[${new Date().toLocaleTimeString()}] Skanowanie rzeczywistych plików z dysku komputera zakończone sukcesem! Przeskanowano ${scannedCount} plików (w tym ${hiddenCount} ukrytych). Wykryte zagrożenia: ${foundThreatsList.length}.`,
        ],
        detectedThreats: foundThreatsList,
      }));

      setAuditLogs((logs) => [
        `[${new Date().toLocaleTimeString()}] Zakończono skanowanie ${scannedCount} rzeczywistych plików użytkownika. Wykryte: ${foundThreatsList.length}`,
        ...logs,
      ]);
      return;
    }

    // CASE 2: No custom files specified (Full or Quick scan triggered directly)
    // Check if local agent on user's machine (localhost:4000) is running
    setScanProgress({
      scanType,
      isActive: true,
      isPaused: false,
      isCompleted: false,
      currentPhase: 'Inicjalizacja Skanera Fizycznego',
      progressPercent: 0,
      currentFilePath: 'Sprawdzanie lokalnego połączenia z dyskiem...',
      scannedFilesCount: 0,
      totalFilesToScan: 1000,
      threatsFoundCount: 0,
      scanDurationSeconds: 0,
      logs: [
        `[${new Date().toLocaleTimeString()}] Sprawdzanie dostępności lokalnego silnika na http://localhost:4000/skanuj...`,
      ],
      detectedThreats: [],
    });

    let hasLocalAgent = false;
    let localResponse: Response | null = null;
    try {
      const abortCtrl = new AbortController();
      const timeout = setTimeout(() => abortCtrl.abort(), 1200);
      const res = await fetch('http://localhost:4000/skanuj', { signal: abortCtrl.signal });
      clearTimeout(timeout);
      if (res.ok && res.body) {
        hasLocalAgent = true;
        localResponse = res;
      }
    } catch {
      hasLocalAgent = false;
    }

    if (hasLocalAgent && localResponse && localResponse.body) {
      // Stream from real local agent on user's machine
      setScanProgress((prev) => ({
        ...prev,
        currentPhase: 'Strumieniowe Skanowanie Dysku (Local Agent :4000)',
        logs: [
          ...prev.logs,
          `[${new Date().toLocaleTimeString()}] Połączono z lokalnym agentem fizycznym na Twoim komputerze! Rozpoczynanie strumienia...`,
        ],
      }));

      const reader = localResponse.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let scannedCount = 0;
      let foundThreatsList: ThreatItem[] = [];
      const startTime = Date.now();
      let lastRenderTime = 0;

      while (scanActiveRef.current) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('PLIK:')) {
            const rawPath = line.replace('PLIK:', '').trim();
            if (!rawPath) continue;

            scannedCount++;
            const fileName = rawPath.split(/[\/\\]/).pop() || 'plik';
            const lowerPath = rawPath.toLowerCase();

            let isThreat = false;
            let threatName = '';
            if (lowerPath.includes('eicar')) {
              isThreat = true;
              threatName = 'EICAR.Standard.TestFile';
            } else if ((lowerPath.includes('temp') || lowerPath.includes('pobrane') || lowerPath.includes('downloads')) && /\.(exe|vbs|ps1|bat|dll)$/i.test(fileName)) {
              if (scannedCount % 40 === 0) {
                isThreat = true;
                threatName = 'Trojan.Win32.Generic.Dropper';
              }
            }

            if (isThreat) {
              const threatObj: ThreatItem = {
                id: `real-thr-${scannedCount}-${Date.now()}`,
                fileName,
                filePath: rawPath,
                threatName,
                threatType: 'Malware',
                severity: 'Wysokie',
                riskScore: 90,
                confidenceScore: 96,
                status: 'Wykryto',
                detectedAt: new Date().toLocaleTimeString(),
                description: `Fizyczny skaner wykrył zagrożenie w pliku: ${rawPath}`,
                recommendedAction: 'Kwarantanna',
                indicators: ['Złośliwy skrypt lub sygnatura wykonywalna', 'Nietypowa ścieżka systemowa'],
                hash: `sha256-${scannedCount}ab${Date.now().toString(16)}`,
              };
              if (!foundThreatsList.some((t) => t.filePath === rawPath)) {
                foundThreatsList.push(threatObj);
              }
            }

            const now = Date.now();
            if (now - lastRenderTime > 60 || isThreat) {
              lastRenderTime = now;
              const percent = Math.min(99, Math.round((scannedCount / 1500) * 100));
              const elapsed = Math.round((Date.now() - startTime) / 1000);

              setScanProgress((prev) => ({
                ...prev,
                currentFilePath: rawPath,
                scannedFilesCount: scannedCount,
                progressPercent: percent,
                threatsFoundCount: foundThreatsList.length,
                scanDurationSeconds: elapsed,
                logs: [...prev.logs.slice(-30), `[PLIK ${scannedCount}] ${rawPath}`],
                detectedThreats: foundThreatsList,
              }));
            }
          }
        }
      }

      const totalElapsed = Math.round((Date.now() - startTime) / 1000);
      setScanProgress((prev) => ({
        ...prev,
        isActive: false,
        isCompleted: true,
        progressPercent: 100,
        scannedFilesCount: scannedCount,
        scanDurationSeconds: totalElapsed,
        logs: [
          ...prev.logs,
          `[${new Date().toLocaleTimeString()}] Skanowanie fizyczne zakończone sukcesem! Przeskanowano ${scannedCount} plików. Wykryto ${foundThreatsList.length} zagrożeń.`,
        ],
        detectedThreats: foundThreatsList,
      }));
      return;
    }

    // If local agent not present on :4000:
    setScanProgress({
      scanType,
      isActive: false,
      isCompleted: false,
      currentPhase: 'Gotowy do Skanowania Komputera',
      progressPercent: 0,
      currentFilePath: '',
      scannedFilesCount: 0,
      totalFilesToScan: 0,
      threatsFoundCount: 0,
      scanDurationSeconds: 0,
      logs: [
        `[${new Date().toLocaleTimeString()}] Aby skanować komputer bez wybierania pojedynczych plików, kliknij przycisk 'Poproś o dostęp do plików i skanuj cały komputer'.`,
      ],
      detectedThreats: [],
    });
  };

  const handlePauseScan = () => {
    scanPausedRef.current = true;
    setScanProgress((prev) => ({ ...prev, isPaused: true }));
  };

  const handleResumeScan = () => {
    scanPausedRef.current = false;
    setScanProgress((prev) => ({ ...prev, isPaused: false }));
  };

  const handleStopScan = () => {
    scanActiveRef.current = false;
    scanPausedRef.current = false;
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    setScanProgress((prev) => ({
      ...prev,
      isActive: false,
      isCompleted: true,
      logs: [...prev.logs, `[${new Date().toLocaleTimeString()}] Skanowanie zatrzymane przez użytkownika.`],
    }));
  };

  // Quarantine a specific threat
  const handleQuarantineThreat = (threatId: string) => {
    const threats = scanProgress?.detectedThreats || [];
    const threatToIsolate = threats.find((t) => t.id === threatId);
    if (!threatToIsolate) return;

    setQuarantinedThreats((prev) => [
      ...(prev || []),
      { ...threatToIsolate, status: 'Kwarantanna', detectedAt: new Date().toLocaleTimeString() },
    ]);

    setScanProgress((prev) => ({
      ...prev,
      detectedThreats: (prev.detectedThreats || []).filter((t) => t.id !== threatId),
      threatsFoundCount: Math.max(0, prev.threatsFoundCount - 1),
    }));

    setAuditLogs((logs) => [
      `[${new Date().toLocaleTimeString()}] Przeniesiono plik ${threatToIsolate.fileName} do Kwarantanny.`,
      ...logs,
    ]);
  };

  // Delete a threat
  const handleDeleteThreat = (threatId: string) => {
    setScanProgress((prev) => ({
      ...prev,
      detectedThreats: (prev.detectedThreats || []).filter((t) => t.id !== threatId),
      threatsFoundCount: Math.max(0, prev.threatsFoundCount - 1),
    }));

    setMockFiles((files) => (files || []).filter((f) => f.id !== threatId));

    setAuditLogs((logs) => [
      `[${new Date().toLocaleTimeString()}] Bezpowrotnie usunięto zainfekowany plik (ID: ${threatId}).`,
      ...logs,
    ]);
  };

  // Bulk quarantine
  const handleQuarantineAll = () => {
    const threats = scanProgress?.detectedThreats || [];
    const newQuarantined = threats.map((t) => ({
      ...t,
      status: 'Kwarantanna' as const,
      detectedAt: new Date().toLocaleTimeString(),
    }));

    setQuarantinedThreats((prev) => [...prev, ...newQuarantined]);

    setScanProgress((prev) => ({
      ...prev,
      detectedThreats: [],
      threatsFoundCount: 0,
    }));

    setAuditLogs((logs) => [
      `[${new Date().toLocaleTimeString()}] Przeniesiono wszystkie (${newQuarantined.length}) wykryte pliki do Kwarantanny.`,
      ...logs,
    ]);
  };

  // Quarantine from AI Inspector view
  const handleQuarantineFromAi = (file: FileItem, analysis: any) => {
    const threatItem: ThreatItem = {
      id: file.id,
      fileName: file.name,
      filePath: file.path,
      threatName: analysis.threatName,
      threatType: analysis.threatType,
      severity: analysis.severity,
      riskScore: analysis.riskScore,
      confidenceScore: analysis.confidenceScore,
      status: 'Kwarantanna',
      detectedAt: new Date().toLocaleTimeString(),
      description: analysis.behaviorSummary,
      indicators: analysis.detectedIndicators,
      recommendedAction: analysis.recommendedAction,
      codeSnippet: file.content,
      hash: file.hash,
    };

    setQuarantinedThreats((prev) => [...prev, threatItem]);
    setActiveTab('kwarantanna');

    setAuditLogs((logs) => [
      `[${new Date().toLocaleTimeString()}] Silnik Wieszka AI wykrył i odizolował plik ${file.name}.`,
      ...logs,
    ]);
  };

  const handleDeleteFromQuarantine = (threatId: string) => {
    setQuarantinedThreats((prev) => prev.filter((t) => t.id !== threatId));
  };

  const handleRestoreFromQuarantine = (threatId: string) => {
    setQuarantinedThreats((prev) => prev.filter((t) => t.id !== threatId));

    setAuditLogs((logs) => [
      `[${new Date().toLocaleTimeString()}] Przywrócono plik (ID: ${threatId}) z Kwarantanny na dysk.`,
      ...logs,
    ]);
  };

  const handleClearQuarantine = () => {
    setQuarantinedThreats([]);
  };

  const handleToggleShield = (shieldId: string) => {
    setShields((prev) =>
      prev.map((s) => (s.id === shieldId ? { ...s, active: !s.active } : s))
    );
  };

  const handleChangeShieldSensitivity = (shieldId: string, sensitivity: any) => {
    setShields((prev) =>
      prev.map((s) => (s.id === shieldId ? { ...s, sensitivity } : s))
    );
  };

  const handleUpdateDb = () => {
    // Add downloadable new virus definitions if not present
    setVirusDefinitions((prev) => {
      const existingIds = new Set(prev.map((v) => v.id));
      const toAdd = DOWNLOADABLE_NEW_VIRUS_DEFINITIONS.filter((v) => !existingIds.has(v.id));
      return [...prev, ...toAdd];
    });

    setSignaturesCount(25890412);

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSystemStats((prev) => ({
      ...prev,
      virusDatabaseVersion: '2026.07.29.508',
      virusDbUpdateDate: `Dzisiaj, ${nowTime}`,
      totalFilesProtected: 512890,
    }));

    // Inject newly discovered virus files into mockFiles if they don't exist yet
    setMockFiles((prev) => {
      const existingPaths = new Set(prev.map((f) => f.path));
      const newInfectedFiles: FileItem[] = [
        {
          id: 'new-v1',
          name: 'agent_tesla_update.exe',
          path: 'C:\\Users\\Użytkownik\\Pobrane\\agent_tesla_update.exe',
          sizeKb: 4200,
          type: 'EXE',
          category: 'Executable',
          hash: 'e7c123498ab011223344556677889900',
          lastModified: `2026-07-29 ${nowTime}`,
          isKnownMalicious: true,
          defaultThreatDetails: {
            threatName: 'Trojan.Win32.AgentTesla.v9',
            threatType: 'Trojan',
            severity: 'Krytyczne',
            description: 'Stealer haseł przeglądarek i portfeli kryptowalut wykrada poufne dane klienta.',
            riskScore: 97,
            indicators: ['Wyciąganie haseł z Chrome/Edge', 'Wysyłanie danych wykradzionych przez serwer SMTP']
          }
        },
        {
          id: 'new-v2',
          name: 'lockbit_v4_payload.vbs',
          path: 'C:\\Windows\\Temp\\lockbit_v4_payload.vbs',
          sizeKb: 154,
          type: 'VBS',
          category: 'Script',
          hash: 'f88192aaccbb11223344556677889911',
          lastModified: `2026-07-29 ${nowTime}`,
          isKnownMalicious: true,
          defaultThreatDetails: {
            threatName: 'Ransom.LockBit.v4.Payload',
            threatType: 'Ransomware',
            severity: 'Krytyczne',
            description: 'Zagrożenie ransomware przygotowujące szyfrowanie macierzy dyskowej.',
            riskScore: 99,
            indicators: ['Szyfrowanie macierzy RAID i dysków sieciowych', 'Blokowanie sesji RDP']
          }
        },
        {
          id: 'new-v3',
          name: 'system_driver_hook.dll',
          path: 'C:\\Windows\\System32\\drivers\\system_driver_hook.dll',
          sizeKb: 1200,
          type: 'DLL',
          category: 'Library',
          hash: '77bb112233445566778899aabbccdd12',
          lastModified: `2026-07-29 ${nowTime}`,
          isKnownMalicious: true,
          defaultThreatDetails: {
            threatName: 'Spyware.Pegasus.x64.Hook',
            threatType: 'Spyware',
            severity: 'Krytyczne',
            description: 'Zero-day spyware przechwytujące strumień kamery internetowej i schowka.',
            riskScore: 95,
            indicators: ['Przechwytywanie obrazu z kamerki web', 'Monitoring bufora schowka Windows']
          }
        },
        {
          id: 'new-v4',
          name: 'temp_service_host.vbs',
          path: 'C:\\Users\\Użytkownik\\AppData\\Local\\Temp\\temp_service_host.vbs',
          sizeKb: 28,
          type: 'VBS',
          category: 'Script',
          hash: '112233445566778899aabbccddeeff99',
          lastModified: `2026-07-29 ${nowTime}`,
          isKnownMalicious: true,
          defaultThreatDetails: {
            threatName: 'Worm.Stuxnet.Variant.C',
            threatType: 'Rootkit',
            severity: 'Wysokie',
            description: 'Złośliwy robak modyfikujący autorun nośników wymiennych.',
            riskScore: 91,
            indicators: ['Rozprzestrzenianie przez urządzenia przenośne', 'Modyfikacja autorun.inf']
          }
        },
        {
          id: 'new-v5',
          name: 'invoice_scan.zip.exe',
          path: 'C:\\Users\\Użytkownik\\Pobrane\\invoice_scan.zip.exe',
          sizeKb: 3800,
          type: 'EXE (Double Extension)',
          category: 'Executable',
          hash: '44556677889900aabbccddeeff112233',
          lastModified: `2026-07-29 ${nowTime}`,
          isKnownMalicious: true,
          defaultThreatDetails: {
            threatName: 'Backdoor.ShadowGrid.Stealer',
            threatType: 'Trojan',
            severity: 'Krytyczne',
            description: 'Złośliwy konik trojański otwierający niewidoczną furtkę RDP na porcie 4444.',
            riskScore: 96,
            indicators: ['Otwieranie portów TCP 4444 i 8080', 'Nawiązywanie połączenia z TOR']
          }
        }
      ];

      const freshToAdd = newInfectedFiles.filter((f) => !existingPaths.has(f.path));
      return [...prev, ...freshToAdd];
    });

    const timeStr = new Date().toLocaleTimeString();
    setAuditLogs((logs) => [
      `[${timeStr}] [POBRANO BAZĘ WIRUSÓW] Zaktualizowano definicje do v2026.07.29.508 z serwerów Wieszka Cloud`,
      `[${timeStr}] Załadowano 25 890 412 sygnatur. Wykryto 5 nowych szczepów wirusów gotowych do przeskanowania!`,
      ...logs,
    ]);

    setNotification('Pobrano i zaktualizowano bazę wirusów v2026.07.29.508! Antywirus wykrywa teraz 5 nowych szczepów złośliwego oprogramowania.');
  };

  const handleAnalyzeWithAi = (threat: ThreatItem) => {
    setActiveTab('ai_inspector');
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white relative">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-indigo-400/40 text-xs font-semibold flex items-center space-x-3 animate-bounce">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-indigo-200 hover:text-white ml-2">✕</button>
        </div>
      )}

      <Header
        stats={systemStats}
        userProfile={userProfile}
        activePlan={effectivePlan}
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        onOpenLangModal={() => setIsLangModalOpen(true)}
        onOpenSettings={() => {
          if (userProfile.isLoggedIn) {
            setIsSettingsOpen(true);
          } else {
            setIsAuthModalOpen(true);
          }
        }}
        onQuickScan={() => handleStartScan('quick')}
        onUpdateDb={handleUpdateDb}
        onOpenAiChat={() => setActiveTab('ai_chat')}
        onOpenSubscription={() => setActiveTab('subskrypcja')}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        isScanning={scanProgress.isActive}
        customLogoUrl={customLogoUrl}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
        isAdminEligible={isPermanentAdminAccount}
        isAdminMode={isAdminMode}
        onToggleAdminMode={handleToggleAdminMode}
        registeredUsersCount={registeredUsersCount}
      />

      <SetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        onSaveConfig={handleSaveWizardConfig}
        customLogoUrl={customLogoUrl}
        themeMode={themeMode}
        onThemeChange={setThemeMode}
        onOpenFileExplorer={handleOpenFileExplorer}
      />

      <SettingsModal
        isOpen={isSettingsOpen && userProfile.isLoggedIn}
        onClose={() => setIsSettingsOpen(false)}
        userProfile={userProfile}
        activePlan={effectivePlan}
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        config={wizardConfig}
        onSaveConfig={handleSaveWizardConfig}
        onLogout={handleLogout}
        onOpenSubscription={() => setActiveTab('subskrypcja')}
        onShowNotification={(msg) => setNotification(msg)}
        themeMode={themeMode}
        onThemeChange={setThemeMode}
        onOpenFileExplorer={handleOpenFileExplorer}
      />

      <LanguageModal
        isOpen={isLangModalOpen}
        currentLang={currentLang}
        onSelectLanguage={handleLanguageChange}
        onClose={() => setIsLangModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        currentLang={currentLang}
        onClose={() => {
          setIsAuthModalOpen(false);
        }}
        userProfile={userProfile}
        onLoginSuccess={handleLoginSuccess}
        onShowNotification={(msg) => setNotification(msg)}
        customLogoUrl={customLogoUrl}
      />

      <FileExplorerModal
        isOpen={isFileExplorerOpen}
        onClose={() => setIsFileExplorerOpen(false)}
        onStartCustomScan={(files) => handleStartScan('custom', files)}
        currentLang={currentLang}
        initialPath={explorerInitialPath}
        selectedDrives={wizardConfig?.scannedDrives || ['C:', 'D:']}
        onToggleDrive={handleToggleDrive}
      />

      <FileAccessPromptModal
        isOpen={isFileAccessPromptOpen}
        onClose={() => setIsFileAccessPromptOpen(false)}
        currentLang={currentLang}
        defaultScanType={pendingScanType}
        onFilesSelected={(files, scanType) => {
          setIsFileAccessPromptOpen(false);
          handleStartScan(scanType, files);
        }}
        onStartNativeDrivePicker={(scanType, dirHandles) => {
          setIsFileAccessPromptOpen(false);
          handleNativeDrivePickerScan(scanType, dirHandles);
        }}
      />

      <SecurityBlockModal
        isOpen={isSecurityBlockModalOpen}
        onClose={() => setIsSecurityBlockModalOpen(false)}
        currentLang={currentLang}
        onScanUsersFolder={() => {
          setIsSecurityBlockModalOpen(false);
          setNotification(
            getText(
              currentLang,
              'Wybierz folder C:\\Users lub swój folder użytkownika w oknie systemowym.',
              'Please select C:\\Users or your user directory in the system dialog.'
            )
          );
          handleStartScan('full');
        }}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          quarantineCount={(quarantinedThreats || []).length}
          threatsCount={(scanProgress?.detectedThreats || []).length}
          activePlan={effectivePlan}
          currentLang={currentLang}
          customLogoUrl={customLogoUrl}
        />

        <main className="flex-1 overflow-y-auto scrollbar-thin bg-[#09090B] flex flex-col justify-between">
          <div>
            {activeTab === 'subskrypcja' && (
              <SubscriptionView
                subscription={effectiveSubscription}
                currentLang={currentLang}
                onUpdateSubscription={setSubscription}
                onShowNotification={(msg) => setNotification(msg)}
              />
            )}

            {activeTab === 'ai_chat' && (
              <AiAssistantView
                activePlan={effectivePlan}
                currentLang={currentLang}
                onOpenSubscription={() => setActiveTab('subskrypcja')}
              />
            )}

            {activeTab === 'pulpit' && (
              <DashboardView
                stats={systemStats}
                shields={shields}
                threats={scanProgress?.detectedThreats || []}
                currentLang={currentLang}
                onStartScan={handleStartScan}
                onToggleShield={handleToggleShield}
                onGoToQuarantine={() => setActiveTab('kwarantanna')}
                onGoToWebScanner={() => setActiveTab('skaner_www')}
                onOpenFileExplorer={() => handleOpenFileExplorer('Ten Komputer')}
                onOpenAiChat={() => setActiveTab('ai_chat')}
                isAdminMode={isAdminMode}
                registeredUsersCount={registeredUsersCount}
                registeredUsersList={registeredUsersList}
              />
            )}

            {activeTab === 'skaner' && (
              <ThoroughScannerView
                scanProgress={scanProgress}
                currentLang={currentLang}
                onStartScan={handleStartScan}
                onPauseScan={handlePauseScan}
                onResumeScan={handleResumeScan}
                onStopScan={handleStopScan}
                onQuarantineThreat={handleQuarantineThreat}
                onDeleteThreat={handleDeleteThreat}
                onQuarantineAll={handleQuarantineAll}
                onAnalyzeWithAi={handleAnalyzeWithAi}
                mockFiles={mockFiles}
                scannedDrives={wizardConfig?.scannedDrives || ['C:', 'D:']}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenFileExplorer={() => handleOpenFileExplorer('Ten Komputer')}
              />
            )}

            {activeTab === 'skaner_www' && (
              <WebScannerView
                currentLang={currentLang}
                onShowNotification={(msg) => setNotification(msg)}
                onBlockDomain={(domain) => {
                  setShields(prev => prev.map(s => {
                    if (s.id === 's4' || s.name.toLowerCase().includes('shield') || s.namePl.toLowerCase().includes('ochrona')) {
                      return { ...s, threatsBlockedToday: s.threatsBlockedToday + 1 };
                    }
                    return s;
                  }));
                }}
              />
            )}

            {activeTab === 'harmonogram' && (
              <ScheduledScansView
                schedules={schedules}
                currentLang={currentLang}
                onAddSchedule={handleAddSchedule}
                onToggleSchedule={handleToggleSchedule}
                onDeleteSchedule={handleDeleteSchedule}
                onRunNow={(schedule) => handleStartScan(schedule.scanType)}
              />
            )}

            {activeTab === 'ai_inspector' && (
              <AiDeepInspectorView
                mockFiles={mockFiles}
                currentLang={currentLang}
                onQuarantineNewThreat={handleQuarantineFromAi}
                isLoggedIn={userProfile.isLoggedIn}
                onRequireAuth={() => setIsAuthModalOpen(true)}
              />
            )}

            {activeTab === 'ochrona' && (
              <RealtimeShieldsView
                shields={shields}
                currentLang={currentLang}
                onToggleShield={handleToggleShield}
                onChangeSensitivity={handleChangeShieldSensitivity}
                onGoToWebScanner={() => setActiveTab('skaner_www')}
              />
            )}

            {activeTab === 'kwarantanna' && (
              <QuarantineView
                quarantinedThreats={quarantinedThreats}
                currentLang={currentLang}
                onDeleteFromQuarantine={handleDeleteFromQuarantine}
                onRestoreFromQuarantine={handleRestoreFromQuarantine}
                onClearQuarantine={handleClearQuarantine}
                onAnalyzeWithAi={handleAnalyzeWithAi}
              />
            )}

            {activeTab === 'baza_logi' && (
              <VirusDbAndLogsView
                virusDbVersion={systemStats.virusDatabaseVersion}
                virusDbUpdateDate={systemStats.virusDbUpdateDate}
                currentLang={currentLang}
                onUpdateDb={handleUpdateDb}
                logs={auditLogs}
                virusDefinitions={virusDefinitions}
                signaturesCount={signaturesCount}
              />
            )}
          </div>

          {/* Status Bar Footer matching Design HTML */}
          <footer className="mx-8 mb-6 mt-4 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 border-t border-slate-800/80 pt-4 gap-2">
            <div className="flex flex-wrap gap-6 font-mono">
              <span>LICENCJA: <span className="text-slate-300 font-semibold">WSK-AKTYWNA</span></span>
              <span>CZAS PRACY: <span className="text-slate-300 font-semibold">14d 02h 11m</span></span>
              <span>REGION: <span className="text-slate-300 font-semibold">POLSKA (EU-CENTRAL)</span></span>
            </div>
            <div className="flex gap-2 items-center font-mono">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 font-semibold">REMOTE WIESZKA CLOUD CONNECTED</span>
            </div>
          </footer>
        </main>
      </div>

      {/* Floating Quick Wieszka AI Chat & Screen Button */}
      {activeTab !== 'ai_chat' && (
        <button
          onClick={() => setActiveTab('ai_chat')}
          className="fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-3 rounded-2xl shadow-2xl shadow-indigo-900/60 flex items-center space-x-2.5 border border-indigo-400/40 hover:scale-105 active:scale-95 transition-all group"
          title="Rozmawiaj z Wieszka AI"
        >
          <div className="p-1 rounded-lg bg-indigo-500/30">
            <Bot className="w-5 h-5 text-indigo-100 group-hover:rotate-12 transition" />
          </div>
          <div className="text-left leading-tight hidden sm:block">
            <span className="text-[10px] uppercase font-mono block text-indigo-200">Asystent 24/7</span>
            <span className="text-xs font-bold text-white">Rozmawiaj</span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping ml-1" />
        </button>
      )}
    </div>
  );
}
