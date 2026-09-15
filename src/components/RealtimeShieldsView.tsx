import React from 'react';
import {
  ShieldAlert,
  Activity,
  Lock,
  Globe,
  Cpu,
  CheckCircle2,
  Sliders,
  Zap
} from 'lucide-react';
import { ProtectionShield } from '../types';
import { LanguageCode, t, getText } from '../i18n';

interface RealtimeShieldsViewProps {
  shields: ProtectionShield[];
  currentLang?: LanguageCode;
  onToggleShield: (shieldId: string) => void;
  onChangeSensitivity: (shieldId: string, level: 'Niska' | 'Zalecana' | 'Maksymalna (AI)') => void;
  onGoToWebScanner?: () => void;
}

export const RealtimeShieldsView: React.FC<RealtimeShieldsViewProps> = ({
  shields = [],
  currentLang = 'en',
  onToggleShield,
  onChangeSensitivity,
  onGoToWebScanner,
}) => {
  const safeShields = shields || [];

  return (
    <div className="p-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#121217] p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3">
            <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {t(currentLang, 'realtimeShields')}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            {getText(
              currentLang,
              'Tarcze ochronne Wieszka działają nieprzerwanie w tle systemu, analizując wejścia/wyjścia dyskowe, zapytania DNS, rejestr oraz uruchamiane procesy.',
              'Wieszka protection shields run continuously in the system background, analyzing disk I/O, DNS queries, registry, and active processes.'
            )}
          </p>
        </div>

        {onGoToWebScanner && (
          <button
            onClick={onGoToWebScanner}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-bold transition flex items-center gap-2 shrink-0 shadow-lg"
          >
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>{getText(currentLang, 'Skaner Stron WWW (URL)', 'Web & URL Scanner')}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {safeShields.map((shield) => (
          <div
            key={shield.id}
            className={`p-6 rounded-3xl border transition-all duration-200 space-y-4 ${
              shield.active
                ? 'bg-[#121217] border-slate-800 shadow-xl'
                : 'bg-[#121217]/50 border-slate-900 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${shield.active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                  <h3 className="font-bold text-white text-sm">
                    {getText(currentLang, shield.namePl || shield.name, shield.name)}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{shield.description}</p>
              </div>

              <button
                onClick={() => onToggleShield(shield.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  shield.active
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-[#1A1A21] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {shield.active ? t(currentLang, 'active') : t(currentLang, 'disabled')}
              </button>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-2 text-slate-400">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>{getText(currentLang, 'Czułość:', 'Sensitivity:')}</span>
                <select
                  value={shield.sensitivity}
                  onChange={(e) => onChangeSensitivity(shield.id, e.target.value as any)}
                  className="bg-[#1A1A21] border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-indigo-300 focus:outline-none"
                >
                  <option value="Niska">{getText(currentLang, 'Niska', 'Low')}</option>
                  <option value="Zalecana">{getText(currentLang, 'Zalecana', 'Recommended')}</option>
                  <option value="Maksymalna (AI)">{getText(currentLang, 'Maksymalna (AI)', 'Maximum (AI)')}</option>
                </select>
              </div>

              <span className="text-slate-400">
                {getText(currentLang, 'Zablokowano dziś:', 'Blocked today:')} <strong className="text-emerald-400">{shield.threatsBlockedToday}</strong>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

