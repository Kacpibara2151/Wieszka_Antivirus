import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Bot,
  Check,
  HeartHandshake
} from 'lucide-react';
import { UserSubscription } from '../types';
import { LanguageCode, t, getText } from '../i18n';

interface SubscriptionViewProps {
  subscription?: UserSubscription;
  currentLang?: LanguageCode;
  onUpdateSubscription?: (newSub: UserSubscription) => void;
  onShowNotification?: (msg: string) => void;
}

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({
  currentLang = 'en',
}) => {
  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto select-none">
      {/* Hero License Status Header */}
      <div className="relative overflow-hidden bg-[#121217] p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-xl space-y-4 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
          {t(currentLang, 'licenseSuite')}
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {getText(
            currentLang,
            'Każdy użytkownik posiada pełen dostęp do silnika sztucznej inteligencji, skanera heurystycznego oraz 7 tarcz ochrony.',
            'Every user has full access to the AI engine, heuristic detection, and 7 protection shields.'
          )}
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-300">
          <div className="flex items-center space-x-2 bg-[#1A1A21] px-4 py-2 rounded-xl border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Status: {t(currentLang, 'active')}</span>
          </div>
          <div className="flex items-center space-x-2 bg-[#1A1A21] px-4 py-2 rounded-xl border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{t(currentLang, 'noAds')}</span>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#121217] p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <Bot className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-base font-bold text-white">
            {t(currentLang, 'aiAssistant')}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {getText(
              currentLang,
              'Autorski silnik Wieszka AI umożliwia zaawansowane analizowanie podejrzanych plików, skanowanie skryptów oraz udzielanie porad dotyczących cyber-bezpieczeństwa.',
              'Proprietary Wieszka AI security engine analyzes suspicious files and scripts while providing security recommendations.'
            )}
          </p>
          <ul className="space-y-2 text-xs text-slate-300 pt-2 font-mono">
            <li className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t(currentLang, 'aiScan')}</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t(currentLang, 'unlimitedChat')}</span>
            </li>
          </ul>
        </div>

        <div className="bg-[#121217] p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-base font-bold text-white">
            {t(currentLang, 'activeShields')}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {getText(
              currentLang,
              'Ochrona przed ransomware, trojanami, keyloggerami i złośliwymi pobraniami w czasie rzeczywistym działa automatycznie w tle.',
              'Full real-time protection against ransomware, trojans, keyloggers, and malware.'
            )}
          </p>
          <ul className="space-y-2 text-xs text-slate-300 pt-2 font-mono">
            <li className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{getText(currentLang, 'Skaner heurystyczny Zero-Day', 'Zero-Day Heuristic Scanner')}</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t(currentLang, 'autoQuarantine')}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Thank You Note */}
      <div className="bg-[#121217] p-6 rounded-3xl border border-slate-800 text-center space-y-3">
        <HeartHandshake className="w-8 h-8 text-emerald-400 mx-auto" />
        <h4 className="font-bold text-white text-sm">
          {t(currentLang, 'thankYou')}
        </h4>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          {t(currentLang, 'pcProtected')}
        </p>
      </div>
    </div>
  );
};

