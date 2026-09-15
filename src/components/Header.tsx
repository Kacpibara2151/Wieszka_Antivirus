import React from 'react';
import { ShieldCheck, ShieldAlert, Zap, RefreshCw, Bot, UserCheck, UserPlus, LogOut, Globe, Gift, Settings, Sun, Moon, Crown, Shield } from 'lucide-react';
import { SystemHealthStats, UserProfile, PlanTier } from '../types';
import { LANGUAGES, LanguageCode, t, getText } from '../i18n';
import { WieszkaLogo } from './WieszkaLogo';

interface HeaderProps {
  stats: SystemHealthStats;
  userProfile: UserProfile;
  activePlan: PlanTier;
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onOpenLangModal?: () => void;
  onOpenSettings?: () => void;
  onQuickScan: () => void;
  onUpdateDb: () => void;
  onOpenAiChat?: () => void;
  onOpenSubscription?: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  isScanning: boolean;
  customLogoUrl?: string | null;
  themeMode?: 'dark' | 'light';
  onToggleTheme?: () => void;
  isAdminEligible?: boolean;
  isAdminMode?: boolean;
  onToggleAdminMode?: () => void;
  registeredUsersCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  userProfile,
  activePlan,
  currentLang,
  onLanguageChange,
  onOpenLangModal,
  onOpenSettings,
  onQuickScan,
  onUpdateDb,
  onOpenAiChat,
  onOpenSubscription,
  onOpenAuth,
  onLogout,
  isScanning,
  customLogoUrl = null,
  themeMode = 'dark',
  onToggleTheme,
  isAdminEligible = false,
  isAdminMode = false,
  onToggleAdminMode,
  registeredUsersCount = 0,
}) => {
  const isProtected = stats.healthScore >= 90;
  const selectedLangOption = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <header className="bg-[#09090B] border-b border-slate-800 text-slate-100 select-none">
      {/* Desktop OS Title Bar simulation */}
      <div className="flex items-center justify-between px-6 py-2 bg-[#09090B] text-xs text-slate-400 border-b border-slate-800/60">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></div>
          <span className="font-semibold text-slate-200 tracking-wide">WIESZKA <span className="text-indigo-400 font-bold">SECURITY</span> v4.8.1</span>
        </div>
        <div className="flex items-center space-x-5 font-mono text-[11px]">
          <span className="text-slate-400">
            {t(currentLang, 'databaseVersion')}{' '}
            <strong className="text-indigo-400">{stats.virusDatabaseVersion}</strong>
          </span>
          <div className="flex items-center space-x-1.5 ml-2">
            <button className="w-3 h-3 rounded-full bg-slate-700 hover:bg-yellow-500/80 transition" title={t(currentLang, 'close')} />
            <button className="w-3 h-3 rounded-full bg-slate-700 hover:bg-emerald-500/80 transition" title={t(currentLang, 'close')} />
            <button className="w-3 h-3 rounded-full bg-slate-700 hover:bg-rose-500/80 transition" title={t(currentLang, 'close')} />
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-8 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#09090B]">
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <WieszkaLogo className="w-13 h-13" customLogoUrl={customLogoUrl} showGlow={isProtected} />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                WIESZKA <span className="text-emerald-400 font-bold">ANTIVIRUS</span>
              </h1>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Permanent Admin Mode Switch (Only for kacpi2151@gmail.com) */}
          {isAdminEligible && onToggleAdminMode && (
            <div
              className={`flex items-center space-x-2.5 p-1.5 px-3 rounded-xl border text-xs transition ${
                isAdminMode
                  ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-[#121217] border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center space-x-1.5 font-bold">
                <Crown className={`w-4 h-4 ${isAdminMode ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
                <span className={isAdminMode ? 'text-amber-300 font-extrabold' : 'text-slate-300'}>
                  {t(currentLang, 'adminMode')}
                </span>
              </div>
              <button
                type="button"
                onClick={onToggleAdminMode}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isAdminMode ? 'bg-amber-500' : 'bg-slate-700'
                }`}
                title={isAdminMode ? getText(currentLang, 'Wyłącz Tryb Administratora', 'Disable Admin Mode') : getText(currentLang, 'Włącz Tryb Administratora', 'Enable Admin Mode')}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isAdminMode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
              <span
                className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded uppercase ${
                  isAdminMode ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {isAdminMode ? 'ON' : 'OFF'}
              </span>
            </div>
          )}

          {/* Admin Registered Users Count Badge */}
          {(isAdminEligible || isAdminMode) && (
            <div className="flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-xs text-indigo-300 font-bold shadow-sm" title={getText(currentLang, 'Liczba zarejestrowanych użytkowników w aplikacji', 'Number of registered users in the app')}>
              <span className="text-sm">👥</span>
              <span>{t(currentLang, 'registeredUsers')} <strong className="text-white font-mono text-sm">{registeredUsersCount}</strong></span>
            </div>
          )}

          {/* Theme Quick Toggle Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              title={themeMode === 'light' ? getText(currentLang, 'Przełącz na Tryb Ciemny (Dark Mode)', 'Switch to Dark Mode') : getText(currentLang, 'Przełącz na Tryb Jasny (Light Mode)', 'Switch to Light Mode')}
              className="p-2.5 rounded-xl bg-[#121217] hover:bg-[#1A1A21] text-slate-300 border border-slate-800 transition flex items-center justify-center"
            >
              {themeMode === 'light' ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>
          )}

          {/* Auth Button / User Status */}
          {userProfile.isLoggedIn ? (
            <div className="flex items-center gap-2 bg-[#121217] border border-slate-800 p-1.5 pl-3 rounded-xl text-xs">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-200 font-bold max-w-[140px] truncate">{userProfile.name}</span>
              {isAdminEligible && isAdminMode && (
                <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded shadow-sm">
                  ADMIN
                </span>
              )}
              {onOpenSettings && (
                <button
                  onClick={onOpenSettings}
                  title={getText(currentLang, 'Ustawienia Konta i Antywirusa', 'Account & Protection Settings')}
                  className="p-1.5 rounded-lg bg-[#1A1A21] hover:bg-indigo-500/20 hover:text-indigo-300 text-slate-300 transition border border-slate-800"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={onLogout}
                title={t(currentLang, 'logout')}
                className="p-1.5 rounded-lg bg-[#1A1A21] hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>{t(currentLang, 'loginRegister')}</span>
              </button>
            </div>
          )}

          {onOpenAiChat && (
            <button
              onClick={onOpenAiChat}
              className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm transition group"
              title={getText(currentLang, 'Rozmawiaj z Wieszka AI', 'Chat with Wieszka AI')}
            >
              <Bot className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition" />
              <span>{getText(currentLang, 'Rozmawiaj', 'AI Chat')}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          )}

          <button
            onClick={onUpdateDb}
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-medium bg-[#121217] hover:bg-[#1A1A21] text-slate-300 border border-slate-800 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t(currentLang, 'updateDb')}</span>
          </button>

          <button
            onClick={onQuickScan}
            disabled={isScanning}
            className={`flex-1 md:flex-initial flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition shadow-lg ${
              isScanning
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30'
            }`}
          >
            <Zap className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? '...' : t(currentLang, 'quickScan')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
