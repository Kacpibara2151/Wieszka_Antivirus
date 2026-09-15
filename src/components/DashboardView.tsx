import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Zap,
  FolderSearch,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Biohazard,
  Activity,
  Globe,
  Trophy,
  BarChart3,
  Check,
  X,
  Sparkles,
  Users,
  Crown,
  Bot
} from 'lucide-react';
import { SystemHealthStats, ProtectionShield, ThreatItem } from '../types';
import { LanguageCode, getText, t } from '../i18n';
import { CloudUserAccount } from '../lib/firebase';

interface DashboardViewProps {
  stats: SystemHealthStats;
  shields: ProtectionShield[];
  threats: ThreatItem[];
  currentLang?: LanguageCode;
  onStartScan: (scanType: 'quick' | 'full' | 'custom') => void;
  onToggleShield: (shieldId: string) => void;
  onGoToQuarantine: () => void;
  onGoToWebScanner?: () => void;
  onOpenFileExplorer?: () => void;
  onOpenAiChat?: () => void;
  isAdminMode?: boolean;
  registeredUsersCount?: number;
  registeredUsersList?: CloudUserAccount[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  shields = [],
  threats = [],
  currentLang = 'pl',
  onStartScan,
  onToggleShield,
  onGoToQuarantine,
  onGoToWebScanner,
  onOpenFileExplorer,
  onOpenAiChat,
  isAdminMode = false,
  registeredUsersCount = 0,
  registeredUsersList = [],
}) => {
  const safeThreats = threats || [];
  const safeShields = shields || [];
  const isHealthy = safeThreats.length === 0;

  return (
    <div className="space-y-6 p-8">
      {/* Bento Grid Top Row */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Main Scan Hero Status Card */}
        <div className={`col-span-12 lg:col-span-8 bg-[#121217] rounded-3xl border transition-all duration-300 p-8 flex flex-col relative overflow-hidden ${
          isHealthy
            ? 'border-slate-800'
            : 'border-rose-500/30 bg-gradient-to-br from-[#121217] via-[#121217] to-rose-950/20'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              {getText(currentLang, 'Głębokie Skanowanie i Analiza Plików', 'Deep Scanning & File Analysis')}
            </span>
            <div className="bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-400' : 'bg-rose-500 animate-pulse'}`} />
              <span className={`text-[10px] font-semibold uppercase tracking-widest ${isHealthy ? 'text-indigo-400' : 'text-rose-400'}`}>
                {isHealthy 
                  ? getText(currentLang, 'System Bezpieczny', 'System Secure')
                  : getText(currentLang, 'Wycofaj Zagrożenia!', 'Neutralize Threats!')}
              </span>
            </div>
          </div>

          <p className="text-3xl font-semibold text-white mb-6">
            {isHealthy 
              ? getText(currentLang, 'System Operacyjny Działa Stabilnie', 'Operating System Running Stably')
              : `${getText(currentLang, 'Wykryto', 'Detected')} ${safeThreats.length} ${getText(currentLang, 'Bezpośrednie Zagrożenia!', 'Direct Threats!')}`}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-8 mt-2">
            {/* Live Sonar Radar Visualizer (like in scanning view) */}
            <div className="flex flex-col items-center justify-center p-3 bg-[#16161D]/80 rounded-2xl border border-slate-800 shrink-0">
              <div className="relative w-40 h-40 flex items-center justify-center">
                {/* Concentric Radar Circles */}
                <div className={`absolute inset-0 rounded-full border ${isHealthy ? 'border-indigo-500/25' : 'border-rose-500/30'}`} />
                <div className={`absolute inset-3 rounded-full border ${isHealthy ? 'border-indigo-500/35' : 'border-rose-500/40'}`} />
                <div className={`absolute inset-7 rounded-full border ${isHealthy ? 'border-indigo-500/45' : 'border-rose-500/50'}`} />
                <div className={`absolute inset-12 rounded-full border ${isHealthy ? 'border-indigo-500/55' : 'border-rose-500/60'}`} />
                
                {/* Radar Crosshairs */}
                <div className={`absolute inset-x-0 top-1/2 h-[1px] ${isHealthy ? 'bg-indigo-500/30' : 'bg-rose-500/35'}`} />
                <div className={`absolute inset-y-0 left-1/2 w-[1px] ${isHealthy ? 'bg-indigo-500/30' : 'bg-rose-500/35'}`} />
                
                {/* Rotating Sonar Scan Beam */}
                <div className="absolute inset-0 rounded-full overflow-hidden animate-[spin_3s_linear_infinite]">
                  <div className={`w-1/2 h-1/2 bg-gradient-to-br ${
                    isHealthy
                      ? 'from-indigo-500/50 via-indigo-500/10 to-transparent'
                      : 'from-rose-500/50 via-rose-500/10 to-transparent'
                  } transform origin-bottom-right`} />
                </div>

                {/* Center Radar Node */}
                <div className={`relative z-10 w-14 h-14 rounded-full bg-slate-950 border ${
                  isHealthy ? 'border-indigo-500/60 shadow-indigo-950/60' : 'border-rose-500/60 shadow-rose-950/60'
                } flex flex-col items-center justify-center shadow-lg`}>
                  {isHealthy ? (
                    <ShieldCheck className="w-7 h-7 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="w-7 h-7 text-rose-400 animate-pulse" />
                  )}
                </div>
              </div>

              <div className="text-center mt-2 space-y-0.5">
                <div className="text-xs font-bold font-mono text-white flex items-center justify-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-400' : 'bg-rose-500 animate-ping'}`} />
                  <span className={isHealthy ? 'text-indigo-300' : 'text-rose-300'}>
                    {isHealthy
                      ? getText(currentLang, 'OCHRONA AKTYWNA', 'PROTECTION ACTIVE')
                      : getText(currentLang, 'WYKRYTO ZAGROŻENIE', 'THREAT DETECTED')}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  {stats.healthScore}% {getText(currentLang, 'Stan Bezpieczeństwa', 'Security State')}
                </p>
              </div>
            </div>

            <div className="flex-grow space-y-4 w-full">
              <div>
                <p className="text-[10px] text-slate-500 mb-1 uppercase font-bold tracking-wider">
                  {getText(currentLang, 'Ostatnia Aktywność', 'Last Activity')}
                </p>
                <p className="text-xs font-mono text-indigo-300 truncate bg-[#1A1A21] px-3 py-2 rounded-xl border border-slate-800/80">
                  C:/Windows/System32/drivers/etc/secure_kernel.sys
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1A1A21] p-4 rounded-xl border border-slate-800/80">
                  <p className="text-xl font-bold text-white">{stats.totalFilesProtected.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{getText(currentLang, 'Skanowanych Plików', 'Scanned Files')}</p>
                </div>
                <div className="bg-[#1A1A21] p-4 rounded-xl border border-slate-800/80">
                  <p className={`text-xl font-bold ${isHealthy ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {safeThreats.length}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{getText(currentLang, 'Wykrytych Zagrożeń', 'Detected Threats')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3.5 pt-2">
            <button
              onClick={() => onStartScan('full')}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 hover:from-emerald-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xl shadow-indigo-950/40 flex items-center gap-2.5 border border-emerald-400/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
              <span>{getText(currentLang, 'Skanuj', 'Scan')}</span>
            </button>

            <button
              onClick={() => onStartScan('custom')}
              className="px-5 py-3 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-md cursor-pointer"
            >
              <FolderSearch className="w-4 h-4 text-emerald-400" />
              <span>{getText(currentLang, 'Wybierz Folder', 'Select Folder')}</span>
            </button>

            {onGoToWebScanner && (
              <button
                onClick={onGoToWebScanner}
                className="px-6 py-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/40 font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-md"
              >
                <Globe className="w-4 h-4 text-indigo-400" />
                <span>{getText(currentLang, 'Skaner Stron WWW & JS', 'Web & JS Scanner')}</span>
              </button>
            )}

            {onOpenAiChat && (
              <button
                onClick={onOpenAiChat}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-indigo-900/30 group"
              >
                <Bot className="w-4 h-4 text-indigo-200 group-hover:scale-110 transition" />
                <span>{getText(currentLang, 'Rozmawiaj', 'Talk')}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            )}

            {!isHealthy && (
              <button
                onClick={onGoToQuarantine}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-rose-900/20 flex items-center gap-2"
              >
                <Biohazard className="w-4 h-4" />
                <span>{`${getText(currentLang, 'Rozwiąż Zagrożenia', 'Resolve Threats')} (${safeThreats.length})`}</span>
              </button>
            )}

            <button
              onClick={() => onStartScan('quick')}
              className="px-6 py-3 bg-[#1A1A21] hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold rounded-xl text-xs transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>{getText(currentLang, 'Szybki Skan', 'Quick Scan')}</span>
            </button>
          </div>
        </div>

        {/* Protection Stats Card */}
        <div className="col-span-12 lg:col-span-4 bg-[#121217] rounded-3xl border border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                {getText(currentLang, 'Tarcza Ochronna', 'Protection Shields')}
              </h3>
              <div className="w-8 h-4 bg-emerald-500/20 rounded-full relative">
                <div className="absolute right-1 top-1 w-2 h-2 bg-emerald-400 rounded-full"></div>
              </div>
            </div>

            <div className="space-y-3">
              {safeShields.slice(0, 3).map((shield) => (
                <div key={shield.id} className="flex justify-between items-center p-3.5 bg-[#1A1A21] rounded-xl border border-slate-800/50">
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-slate-200 block">
                      {getText(currentLang, shield.namePl || shield.name, shield.name)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {`${getText(currentLang, 'Czułość:', 'Sensitivity:')} ${shield.sensitivity}`}
                    </span>
                  </div>
                  <button
                    onClick={() => onToggleShield(shield.id)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition ${
                      shield.active
                        ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                        : 'text-slate-500 bg-slate-800'
                    }`}
                  >
                    {shield.active 
                      ? getText(currentLang, 'AKTYWNA', 'ACTIVE') 
                      : getText(currentLang, 'WYŁĄCZONA', 'DISABLED')}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/60">
            <div className="h-1.5 w-full bg-[#1A1A21] rounded-full overflow-hidden">
              <div className="h-full w-[94%] bg-indigo-500 rounded-full"></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-mono">
              {`${getText(currentLang, 'Baza zaktualizowana 14 minut temu. Wersja', 'Database updated 14 mins ago. Version')} ${stats.virusDatabaseVersion}`}
            </p>
          </div>
        </div>
      </div>

      {/* Bento Grid Middle Row - Scanning Option Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#121217] rounded-3xl border border-slate-800 p-6 flex flex-col justify-between hover:border-indigo-500/40 transition group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base">{getText(currentLang, 'Skan Szybki', 'Quick Scan')}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {getText(currentLang, 'Kluczowe pliki systemowe, autostart oraz sektory MBR.', 'Critical system files, startup items, and MBR sectors.')}
            </p>
          </div>
          <button
            onClick={() => onStartScan('quick')}
            className="w-full py-2.5 bg-[#1A1A21] hover:bg-slate-800 text-indigo-300 rounded-xl text-xs font-semibold border border-slate-800 mt-6 transition"
          >
            {getText(currentLang, 'Uruchom Skan', 'Run Scan')}
          </button>
        </div>

        <div className="bg-[#121217] rounded-3xl border border-indigo-500/30 p-6 flex flex-col justify-between hover:border-indigo-400 transition group relative">
          <span className="absolute top-4 right-4 text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
            {getText(currentLang, 'REKOMENDACJA', 'RECOMMENDED')}
          </span>
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base">{getText(currentLang, 'Pełny Skan Dysku', 'Full Disk Scan')}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {getText(currentLang, 'Głęboka analiza heurystyczna każdego pliku.', 'Deep heuristic analysis of every file.')}
            </p>
          </div>
          <button
            onClick={() => onStartScan('full')}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md mt-6 transition"
          >
            {getText(currentLang, 'Skanuj Całość', 'Scan All')}
          </button>
        </div>

        <div className="bg-[#121217] rounded-3xl border border-slate-800 p-6 flex flex-col justify-between hover:border-indigo-500/40 transition group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition">
              <FolderSearch className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base">{getText(currentLang, 'Eksplorator Plików', 'File Explorer')}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {getText(currentLang, 'Wybierz konkretne pliki i foldery w Eksploratorze Windows.', 'Select specific files & folders in Windows Explorer.')}
            </p>
          </div>
          <button
            onClick={() => {
              if (onOpenFileExplorer) {
                onOpenFileExplorer();
              } else {
                onStartScan('custom');
              }
            }}
            className="w-full py-2.5 bg-[#1A1A21] hover:bg-slate-800 text-purple-300 rounded-xl text-xs font-semibold border border-slate-800 mt-6 transition"
          >
            {getText(currentLang, 'Otwórz Eksplorator 📁', 'Open Explorer 📁')}
          </button>
        </div>
      </div>

      {/* Rozmawiaj z Wieszka AI i Udostępniaj Ekran Dedicated Card */}
      <div className="bg-[#121217] border border-indigo-500/30 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden group hover:border-indigo-500/50 transition">
        <div className="flex items-start sm:items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 shadow-lg shadow-indigo-950/40 group-hover:scale-105 transition">
            <Bot className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                {getText(currentLang, 'Sztuczna Inteligencja Wieszka AI • Vision & Voice', 'Wieszka AI Intelligence • Vision & Voice')}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                {getText(currentLang, 'EKRAN NA ŻYWO', 'LIVE SCREEN')}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {getText(
                currentLang,
                'Rozmawiaj z Wieszka AI – Rozpoznaj Zagrożenia i Usuń Wirusy',
                'Talk with Wieszka AI – Spot Threats and Remove Viruses'
              )}
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {getText(
                currentLang,
                'Możesz rozmawiać z Wieszka AI głosem lub tekstem, aby sztuczna inteligencja na bieżąco pomogła Ci krok po kroku w usunięciu wirusów, blokad i błędów!',
                'You can talk with Wieszka AI via voice or text so AI can guide you step-by-step in removing viruses, lockouts, and errors!'
              )}
            </p>
          </div>
        </div>

        {onOpenAiChat && (
          <button
            onClick={onOpenAiChat}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs transition-all shadow-lg shadow-indigo-900/30 flex items-center gap-2.5 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <span>{getText(currentLang, 'Rozmawiaj →', 'Talk →')}</span>
          </button>
        )}
      </div>

      {/* All Shields Status Bottom Grid */}
      <div className="bg-[#121217] p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>{getText(currentLang, 'Pełny Status Ochrony w Czasie Rzeczywistym', 'Full Real-Time Protection Status')}</span>
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">
            {`${safeShields.length} ${getText(currentLang, 'Osłon Aktywnych w Tle', 'Shields Active in Background')}`}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {safeShields.map((shield) => (
            <div
              key={shield.id}
              className="p-3.5 rounded-2xl bg-[#1A1A21] border border-slate-800/60 flex items-center justify-between gap-3"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${shield.active ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  <h4 className="text-xs font-bold text-slate-200 truncate">
                    {getText(currentLang, shield.namePl || shield.name, shield.name)}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{shield.description}</p>
              </div>

              <button
                onClick={() => onToggleShield(shield.id)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold shrink-0 transition ${
                  shield.active
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {shield.active 
                  ? getText(currentLang, 'WŁĄCZONA', 'ACTIVE') 
                  : getText(currentLang, 'WYŁĄCZONA', 'OFF')}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Panel: Registered Users Display */}
      {isAdminMode && (
        <div className="bg-gradient-to-br from-[#121217] via-[#161622] to-amber-950/20 border border-amber-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Crown className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm tracking-wide flex items-center gap-2">
                  <span>{t(currentLang, 'adminUsersTitle')}</span>
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded">ADMIN</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {getText(currentLang, 'Statystyki zarejestrowanych kont użytkowników w bazie Firestore i pamięci lokalnej', 'Statistics of registered user accounts in Firestore database and local storage')}
                </p>
              </div>
            </div>

            <div className="bg-[#1A1A24] border border-amber-500/40 px-4 py-2 rounded-2xl flex items-center space-x-3">
              <Users className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">{t(currentLang, 'registeredUsersCount')}</p>
                <p className="text-xl font-black text-amber-300 font-mono">{registeredUsersCount}</p>
              </div>
            </div>
          </div>

          {registeredUsersList && registeredUsersList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {registeredUsersList.map((user, idx) => (
                <div key={user.email || idx} className="bg-[#181822] border border-slate-800 p-3.5 rounded-2xl space-y-1.5 hover:border-amber-500/40 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 truncate">{user.name || user.email.split('@')[0]}</span>
                    <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono font-bold">USER #{idx + 1}</span>
                  </div>
                  <p className="text-xs font-mono text-amber-300/90 truncate">{user.email}</p>
                  <p className="text-[10px] text-slate-500">
                    {getText(currentLang, 'Ostatnie logowanie:', 'Last login:')} {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '-'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#181822] border border-slate-800 text-xs text-slate-400 text-center">
              {getText(currentLang, `Liczba zarejestrowanych użytkowników: ${registeredUsersCount}. Brak szczegółowych profili w widoku.`, `Registered users count: ${registeredUsersCount}. No detailed profiles in current view.`)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
