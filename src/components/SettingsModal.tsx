import React, { useState } from 'react';
import {
  X,
  Settings,
  Globe,
  Shield,
  Laptop,
  Clock,
  UserCheck,
  LogOut,
  Sparkles,
  Zap,
  Check,
  RefreshCw,
  Bell,
  Trash2,
  Sun,
  Moon,
  HardDrive
} from 'lucide-react';
import { UserProfile, WizardConfig, PlanTier } from '../types';
import { LANGUAGES, LanguageCode, getText } from '../i18n';
import { clearAllCloudAccounts } from '../lib/firebase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  activePlan: PlanTier;
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  config: WizardConfig | null;
  onSaveConfig: (config: WizardConfig) => void;
  onLogout: () => void;
  onOpenSubscription?: () => void;
  onShowNotification: (msg: string) => void;
  themeMode?: 'dark' | 'light';
  onThemeChange?: (theme: 'dark' | 'light') => void;
  onOpenFileExplorer?: (initialPath?: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  activePlan,
  currentLang,
  onLanguageChange,
  config,
  onSaveConfig,
  onLogout,
  onOpenSubscription,
  onShowNotification,
  themeMode = 'dark',
  onThemeChange,
  onOpenFileExplorer,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'protection' | 'background' | 'account'>('general');

  // Local settings state
  const [scannedDrives, setScannedDrives] = useState<string[]>(config?.scannedDrives || ['C:', 'D:']);
  const [preset, setPreset] = useState<'max_ai' | 'balanced' | 'gamer_light'>(config?.protectionPreset || 'max_ai');
  const [bgEnabled, setBgEnabled] = useState<boolean>(config?.backgroundEnabled ?? true);
  const [trayMinimize, setTrayMinimize] = useState<boolean>(config?.trayMinimize ?? true);
  const [dailyScan, setDailyScan] = useState<boolean>(config?.quickScanDaily ?? true);
  const [scanTime, setScanTime] = useState<string>(config?.scanTime || '14:00');

  if (!isOpen) return null;

  const toggleDrive = (driveId: string) => {
    setScannedDrives((prev) => {
      if (prev.includes(driveId)) {
        if (prev.length <= 1) return prev; // Keep at least one drive selected
        return prev.filter((d) => d !== driveId);
      } else {
        return [...prev, driveId];
      }
    });
  };

  const driveTargets = [
    {
      id: 'C:',
      letter: 'C:\\',
      namePl: 'Dysk Systemowy C:\\ (Windows, AppData & System32)',
      nameEn: 'System Drive C:\\ (Windows, AppData & System32)',
      descPl: 'Główny dysk systemowy z plikami powłoki Windows, autostartu i rejestru.',
      descEn: 'Primary OS drive with Windows system files, autostart and registry.',
      badge: 'System OS',
    },
    {
      id: 'D:',
      letter: 'D:\\',
      namePl: 'Dysk Danych D:\\ (Gry, Dokumenty & Programy)',
      nameEn: 'Data Drive D:\\ (Games, Documents & Apps)',
      descPl: 'Partycja danych przechowująca pliki osobiste, dokumenty i gry.',
      descEn: 'Data partition storing personal files, documents and games.',
      badge: 'Data & Games',
    },
    {
      id: 'E:',
      letter: 'E:\\',
      namePl: 'Pamięć Zewnętrzna E:\\ (USB Pendrive & SD)',
      nameEn: 'External Storage E:\\ (USB Flash Drive & SD)',
      descPl: 'Nośniki przenośne podłączane przez USB - skan chroni przed robakami autorun.',
      descEn: 'Removable USB media - scanning guards against autorun worms.',
      badge: 'USB / External',
    },
    {
      id: 'F:',
      letter: 'F:\\',
      namePl: 'Dysk Sieciowy F:\\ (NAS & Udziały Udostępnione)',
      nameEn: 'Network Storage F:\\ (NAS & Shared Drives)',
      descPl: 'Partycia w sieci lokalnej - skanowanie udziałów SMB/CIFS w sieci NAS.',
      descEn: 'Network drive & NAS storage - protects shared network directories.',
      badge: 'Network NAS',
    },
  ];

  const handleSaveAll = () => {
    const updatedConfig: WizardConfig = {
      isCompleted: true,
      protectionPreset: preset,
      backgroundEnabled: bgEnabled,
      trayMinimize,
      quickScanDaily: dailyScan,
      scanTime,
      language: currentLang,
      scannedDrives,
    };
    onSaveConfig(updatedConfig);
    onShowNotification(
      currentLang === 'pl'
        ? '✅ Ustawienia antywirusa oraz lista skanowanych dysków zostały pomyślnie zaktualizowane!'
        : '✅ Antivirus settings and scanned drives updated successfully!'
    );
    onClose();
  };

  const handleClearAccounts = async () => {
    await clearAllCloudAccounts();
    onShowNotification(
      currentLang === 'pl'
        ? 'Usunięto wszystkie zapamiętane konta z urządzenia.'
        : 'Cleared all stored cloud accounts from device.'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className="bg-[#121217] border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-[#1A1A21] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Settings className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {getText(currentLang, 'Ustawienia Konta i Antywirusa', 'Account & Antivirus Settings')}
            </h2>
            <p className="text-xs text-slate-400">
              {getText(
                currentLang,
                'Dostosuj język, skanowane dyski, tryb ochrony, pracę w tle oraz zarządzaj swoim kontem',
                'Adjust language, scanned drives, protection mode, background daemon and manage account'
              )}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-[#1A1A21] p-1 rounded-2xl border border-slate-800 text-xs font-semibold overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-2 px-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === 'general' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{getText(currentLang, 'Język i Ogólne', 'General')}</span>
          </button>
          <button
            onClick={() => setActiveTab('protection')}
            className={`flex-1 py-2 px-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === 'protection' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{getText(currentLang, 'Tryb Ochrony', 'Protection Mode')}</span>
          </button>
          <button
            onClick={() => setActiveTab('background')}
            className={`flex-1 py-2 px-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === 'background' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>{getText(currentLang, 'Praca w Tle', 'Background')}</span>
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`flex-1 py-2 px-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === 'account' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{getText(currentLang, 'Konto', 'Account')}</span>
          </button>
        </div>

        {/* TAB 1: General & Language */}
        {activeTab === 'general' && (
          <div className="space-y-5 animate-fade-in text-xs">
            {/* Language selection */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-200">
                {getText(currentLang, 'Wybór Języka Interfejsu:', 'Interface Language Selection:')}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[160px] overflow-y-auto pr-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => onLanguageChange(lang.code)}
                    className={`p-3 rounded-2xl border text-left transition flex items-center space-x-2.5 ${
                      currentLang === lang.code
                        ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                        : 'bg-[#1A1A21] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="truncate text-xs">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme selection toggle */}
            <div className="pt-3 border-t border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-200">
                  {getText(currentLang, 'Motyw Kolorystyczny Aplikacji:', 'Application Color Theme:')}
                </h3>
                <span className="text-[11px] font-mono font-semibold text-indigo-400">
                  {themeMode === 'light'
                    ? getText(currentLang, 'Tryb Jasny (Light)', 'Light Mode')
                    : getText(currentLang, 'Tryb Ciemny (Dark)', 'Dark Mode')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onThemeChange?.('dark')}
                  className={`p-3.5 rounded-2xl border text-left transition flex items-center space-x-3 ${
                    themeMode === 'dark'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                      : 'bg-[#1A1A21] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-indigo-400 shrink-0">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">
                      {getText(currentLang, 'Tryb Ciemny (Dark)', 'Dark Mode')}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {getText(currentLang, 'Ochrona oczu w nocy', 'Eye protection in dark')}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onThemeChange?.('light')}
                  className={`p-3.5 rounded-2xl border text-left transition flex items-center space-x-3 ${
                    themeMode === 'light'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                      : 'bg-[#1A1A21] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">
                      {getText(currentLang, 'Tryb Jasny (Light)', 'Light Mode')}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {getText(currentLang, 'Wysoki kontrast w dzień', 'High contrast light theme')}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Protection Presets */}
        {activeTab === 'protection' && (
          <div className="space-y-3 animate-fade-in text-xs">
            <div
              onClick={() => setPreset('max_ai')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3.5 ${
                preset === 'max_ai'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                  : 'bg-[#1A1A21] border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Sparkles className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white">
                    {getText(currentLang, 'Maksymalna Ochrona Wieszka AI (Zalecane)', 'Maximum Wieszka AI Protection (Recommended)')}
                  </h4>
                  {preset === 'max_ai' && <Check className="w-4 h-4 text-indigo-400" />}
                </div>
                <p className="text-[11px] text-slate-400">
                  {getText(currentLang, 'Głęboka analiza heurystyczna Wieszka AI, skanowanie plików oraz strażnik zerowego dnia.', 'Deep Wieszka AI heuristic analysis, file scanning and zero-day guard.')}
                </p>
              </div>
            </div>

            <div
              onClick={() => setPreset('balanced')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3.5 ${
                preset === 'balanced'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                  : 'bg-[#1A1A21] border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Shield className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white">
                    {getText(currentLang, 'Standardowa Ochrona Zbalansowana', 'Standard Balanced Protection')}
                  </h4>
                  {preset === 'balanced' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-400">
                  {getText(currentLang, 'Kompleksowe skanowanie w czasie rzeczywistym z minimalnym obciążeniem zasobów.', 'Comprehensive real-time scanning with minimal system impact.')}
                </p>
              </div>
            </div>

            <div
              onClick={() => setPreset('gamer_light')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3.5 ${
                preset === 'gamer_light'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                  : 'bg-[#1A1A21] border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Zap className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white">
                    {getText(currentLang, 'Tryb Gracza / Ultra Wydajny', 'Gamer Mode / Ultra Performance')}
                  </h4>
                  {preset === 'gamer_light' && <Check className="w-4 h-4 text-purple-400" />}
                </div>
                <p className="text-[11px] text-slate-400">
                  {getText(currentLang, 'Zero wyskakujących okienek podczas gier, praca w trybie cichym.', 'Zero popups during gaming, silent background mode.')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Background execution */}
        {activeTab === 'background' && (
          <div className="space-y-3 animate-fade-in text-xs">
            <div className="p-4 bg-[#1A1A21] rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white">
                  {getText(currentLang, 'Działaj w tle po zamknięciu okna', 'Run in background when closed')}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {getText(currentLang, 'Minimalizacja do zasobnika systemowego (System Tray)', 'Minimize to System Tray')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBgEnabled(!bgEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                  bgEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${bgEnabled ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className="p-4 bg-[#1A1A21] rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white">
                  {getText(currentLang, 'Uruchamiaj automatycznie przy starcie OS', 'Start automatically with OS')}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {getText(currentLang, 'Ochrona aktywuje się podczas uruchamiania systemu Windows', 'Protection activates on Windows startup')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTrayMinimize(!trayMinimize)}
                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                  trayMinimize ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${trayMinimize ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className="p-4 bg-[#1A1A21] rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white">
                  {getText(currentLang, 'Codzienny Szybki Skan o wyznaczonej porze', 'Daily Quick Scan at scheduled time')}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {getText(currentLang, 'Automatyczny skan w tle raz na dobę', 'Automatic background scan once a day')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {dailyScan && (
                  <input
                    type="time"
                    value={scanTime}
                    onChange={(e) => setScanTime(e.target.value)}
                    className="bg-[#121217] border border-slate-700 rounded-xl px-2 py-1 text-white font-mono"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setDailyScan(!dailyScan)}
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                    dailyScan ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${dailyScan ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Account & Subscription */}
        {activeTab === 'account' && (
          <div className="space-y-4 animate-fade-in text-xs">
            <div className="bg-[#1A1A21] p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-slate-500 font-mono text-[11px]">
                    {getText(currentLang, 'Zalogowany Użytkownik:', 'Logged in User:')}
                  </span>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm">{userProfile.name}</h4>
                    {userProfile.email.toLowerCase().trim() === 'kacpi2151@gmail.com' && (
                      <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[10px] rounded shadow-sm">
                        PERMANENT ADMIN
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 font-mono text-[11px]">{userProfile.email}</p>
                </div>
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl font-mono text-[11px] font-bold uppercase">
                  PLAN {activePlan}
                </span>
              </div>

              {userProfile.isLoggedIn && (
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleClearAccounts}
                    className="text-slate-400 hover:text-rose-400 font-mono text-[11px] flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{getText(currentLang, 'Wyczyść zapamiętane konta', 'Clear saved accounts')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="px-4 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 font-bold rounded-xl border border-rose-500/30 transition flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{getText(currentLang, 'Wyloguj Się', 'Log Out')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Save Action */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Wieszka Security Guard v4.8.1 Settings Engine
          </span>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-[#1A1A21] text-slate-300 hover:text-white rounded-xl font-bold border border-slate-800 text-xs"
            >
              {getText(currentLang, 'Anuluj', 'Cancel')}
            </button>
            <button
              onClick={handleSaveAll}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-900/40"
            >
              {getText(currentLang, 'Zapisz Wszystkie Ustawienia', 'Save All Settings')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
