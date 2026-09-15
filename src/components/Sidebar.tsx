import React from 'react';
import {
  LayoutDashboard,
  Search,
  Cpu,
  Shield,
  ShieldCheck,
  Biohazard,
  Activity,
  Database,
  Bot,
  Calendar,
  Gift,
  Sparkles,
  Globe
} from 'lucide-react';
import { PlanTier } from '../types';
import { LanguageCode, t } from '../i18n';
import { WieszkaLogo } from './WieszkaLogo';

export type NavTab = 'pulpit' | 'skaner' | 'skaner_www' | 'harmonogram' | 'ai_inspector' | 'ai_chat' | 'subskrypcja' | 'ochrona' | 'kwarantanna' | 'baza_logi';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  quarantineCount: number;
  threatsCount: number;
  activePlan: PlanTier;
  currentLang: LanguageCode;
  customLogoUrl?: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  quarantineCount,
  threatsCount,
  activePlan,
  currentLang,
  customLogoUrl = null,
}) => {
  const menuItems: { id: NavTab; label: string; icon: React.ComponentType<any>; badge?: string | number; badgeColor?: string; isHighlight?: boolean }[] = [
    { id: 'pulpit', label: t(currentLang, 'dashboard'), icon: LayoutDashboard },
    { id: 'ai_chat', label: currentLang === 'pl' ? 'Rozmawiaj' : t(currentLang, 'aiAssistant'), icon: Bot, badge: 'VISION', badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold', isHighlight: true },
    { id: 'skaner', label: t(currentLang, 'thoroughScan'), icon: Search, badge: threatsCount > 0 ? threatsCount : undefined, badgeColor: 'bg-rose-500 text-white' },
    { id: 'skaner_www', label: t(currentLang, 'webScanner'), icon: Globe, badge: 'WWW', badgeColor: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold' },
    { id: 'harmonogram', label: t(currentLang, 'scanSchedule'), icon: Calendar },
    { id: 'ai_inspector', label: t(currentLang, 'heuristicAi'), icon: Cpu },
    { id: 'ochrona', label: t(currentLang, 'realtimeProtection'), icon: Shield },
    { id: 'kwarantanna', label: t(currentLang, 'quarantine'), icon: Biohazard, badge: quarantineCount > 0 ? quarantineCount : undefined, badgeColor: 'bg-amber-500 text-slate-950 font-bold' },
    { id: 'baza_logi', label: t(currentLang, 'virusDbLogs'), icon: Database },
    { id: 'subskrypcja', label: t(currentLang, 'licenseInfo'), icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-[#09090B] border-r border-slate-800 flex flex-col justify-between p-4 select-none shrink-0">
      <div className="space-y-6">
        <div className="px-3 pt-2 flex items-center space-x-2.5 pb-2 border-b border-slate-800/60">
          <WieszkaLogo className="w-7 h-7" customLogoUrl={customLogoUrl} showGlow={false} />
          <div>
            <div className="flex items-center space-x-1">
              <h2 className="text-xs font-bold text-white tracking-wider font-mono">WIESZKA GUARD</h2>
            </div>
          </div>
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition duration-150 group ${
                  isActive
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.15)] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#121217] border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 transition ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span className={item.isHighlight ? 'font-semibold text-slate-100' : ''}>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="p-4 bg-[#121217] rounded-2xl border border-slate-800 space-y-2.5">
        <div className="flex items-center space-x-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="font-semibold text-slate-200">Wieszka Guard v4.8</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          {t(currentLang, 'systemClean')}
        </p>

        <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-slate-800/80">
          <span>{t(currentLang, 'licenseInfo')}: <strong className="text-slate-200 font-bold">WSK-OK</strong></span>
          <span className="text-emerald-400 font-bold">{t(currentLang, 'active')}</span>
        </div>
      </div>
    </aside>
  );
};
