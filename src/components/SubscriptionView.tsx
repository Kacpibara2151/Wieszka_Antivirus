import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Bot,
  Check,
  HeartHandshake,
  Lock,
  Scale,
  ShieldAlert,
  FileText,
  AlertTriangle,
  Ban,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { UserSubscription } from '../types';
import { LanguageCode, getText } from '../i18n';

interface SubscriptionViewProps {
  subscription?: UserSubscription;
  currentLang?: LanguageCode;
  onUpdateSubscription?: (newSub: UserSubscription) => void;
  onShowNotification?: (msg: string) => void;
}

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({
  subscription,
  currentLang = 'pl',
}) => {
  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto select-none">
      {/* Hero License Status Header */}
      <div className="relative overflow-hidden bg-[#121217] p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-xl space-y-5 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
          <KeyRound className="w-3.5 h-3.5" />
          <span>{getText(currentLang, 'LICENCJA JEDNOSTAWISKOWA AKTYWNA', 'SINGLE-SEAT LICENSE ACTIVE')}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
          {getText(
            currentLang,
            'Pakiet Bezpieczeństwa & Licencja Wieszka Antivirus',
            'Wieszka Antivirus Security Suite & License'
          )}
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {getText(
            currentLang,
            'Każdy użytkownik posiada pełny dostęp do silnika sztucznej inteligencji Wieszka AI, skanera heurystycznego oraz aktywnych osłon ochrony w czasie rzeczywistym.',
            'Every user has full access to the Wieszka AI engine, heuristic scanning, and active real-time protection shields.'
          )}
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-300">
          <div className="flex items-center space-x-2 bg-[#1A1A21] px-4 py-2 rounded-xl border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {getText(currentLang, 'Status Licencji: AKTYWNA', 'License Status: ACTIVE')}
            </span>
          </div>
          <div className="flex items-center space-x-2 bg-[#1A1A21] px-4 py-2 rounded-xl border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {getText(currentLang, 'Zero Reklam & Pełna Prywatność', 'Zero Ads & Full Privacy')}
            </span>
          </div>
          <div className="flex items-center space-x-2 bg-[#1A1A21] px-4 py-2 rounded-xl border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              {getText(currentLang, 'Klucz: WSK-2026-ULTIMATE', 'Key: WSK-2026-ULTIMATE')}
            </span>
          </div>
        </div>
      </div>

      {/* DEDICATED LEGAL & NO-COPYING PROTECTION CARD */}
      <div className="bg-[#121217] p-7 rounded-3xl border border-amber-500/30 shadow-2xl relative overflow-hidden space-y-6">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>{getText(currentLang, 'Warunki Licencji & Prawa Autorskie', 'License Terms & Copyright Protection')}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {getText(currentLang, 'ZAKAZ KOPIOWANIA', 'NO COPYING')}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {getText(
                  currentLang,
                  'Wszelkie prawa zastrzeżone © 2026 Wieszka Security Systems. Obowiązuje ścisła ochrona prawna.',
                  'All rights reserved © 2026 Wieszka Security Systems. Strict legal protection applies.'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl self-stretch sm:self-auto justify-center">
            <Lock className="w-3.5 h-3.5" />
            <span>{getText(currentLang, 'Chronione Prawem Autorskim', 'Copyright Protected')}</span>
          </div>
        </div>

        {/* Warning banner */}
        <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3.5">
          <Ban className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-amber-200">
              {getText(
                currentLang,
                'KLAUZULA O ZAKAZIE KOPIOWANIA I POWIELANIA',
                'STRICT NON-DUPLICATION & ANTI-COPY CLAUSE'
              )}
            </h4>
            <p className="text-slate-300 leading-relaxed">
              {getText(
                currentLang,
                'Kopiowanie, powielanie, klonowanie, odsprzedaż, redystrybucja, publiczne udostępnianie oraz inżynieria wsteczna (dekompilacja) oprogramowania Wieszka Antivirus, jego kodu źródłowego, silnika Wieszka AI, bazy sygnatur wirusów oraz elementów graficznych są bezwzględnie zabronione bez uprzedniej, wyraźnej i pisemnej zgody autora.',
                'Copying, duplicating, cloning, reselling, redistributing, publicly sharing, and reverse engineering (decompilation) of Wieszka Antivirus software, its source code, Wieszka AI engine, virus signatures database, and graphical assets are strictly prohibited without prior express written permission from the author.'
              )}
            </p>
          </div>
        </div>

        {/* License clauses grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-[#1A1A21] p-4 rounded-2xl border border-slate-800/90 space-y-2">
            <div className="flex items-center space-x-2 text-white font-bold">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{getText(currentLang, '1. Zakaz Modyfikacji i Dekompilacji', '1. No Modification or Decompilation')}</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {getText(
                currentLang,
                'Zabrania się dezasemblacji, ingerencji w binaria, modyfikacji skryptów ochronnych oraz podejmowania prób odtworzenia kodu źródłowego silnika detekcji.',
                'Disassembling, tampering with binaries, modifying security scripts, or attempting to recreate the detection engine source code is prohibited.'
              )}
            </p>
          </div>

          <div className="bg-[#1A1A21] p-4 rounded-2xl border border-slate-800/90 space-y-2">
            <div className="flex items-center space-x-2 text-white font-bold">
              <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{getText(currentLang, '2. Wyłączna Własność Intelektualna', '2. Exclusive Intellectual Property')}</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {getText(
                currentLang,
                'Wszystkie logotypy, nazwy handlowe, wzory interfejsu graficznego oraz architektura heurystyczna stanowią wyłączną własność twórcy programu.',
                'All logos, brand names, user interface designs, and heuristic architecture remain the exclusive intellectual property of the author.'
              )}
            </p>
          </div>

          <div className="bg-[#1A1A21] p-4 rounded-2xl border border-slate-800/90 space-y-2">
            <div className="flex items-center space-x-2 text-white font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{getText(currentLang, '3. Zakaz Użytku Komercyjnego bez Zgody', '3. No Unauthorized Commercial Use')}</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {getText(
                currentLang,
                'Licencja uprawnia do ochrony stacji roboczej użytkownika. Oprogramowanie nie może być sprzedawane, sublicencjonowane ani dołączane do pakietów handlowych stron trzecich.',
                'This license entitles the user to protect their workstation. The software may not be sold, sublicensed, or bundled into third-party commercial packages.'
              )}
            </p>
          </div>

          <div className="bg-[#1A1A21] p-4 rounded-2xl border border-slate-800/90 space-y-2">
            <div className="flex items-center space-x-2 text-white font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{getText(currentLang, '4. Gwarancja Integralności Ochrony', '4. Protection Integrity Guarantee')}</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {getText(
                currentLang,
                'Stosowanie oryginalnej, niezmodyfikowanej wersji programu gwarantuje pełną odporność na złośliwe oprogramowanie i prawidłową weryfikację sygnatur.',
                'Running the original, unmodified software guarantees reliable protection against malware and accurate signature verification.'
              )}
            </p>
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
            {getText(currentLang, 'Asystent Bezpieczeństwa Wieszka AI', 'Wieszka AI Security Assistant')}
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
              <span>{getText(currentLang, 'Skanowanie Heurystyczne AI', 'AI Heuristic Scanning')}</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{getText(currentLang, 'Nielimitowane Konsultacje AI', 'Unlimited AI Consultations')}</span>
            </li>
          </ul>
        </div>

        <div className="bg-[#121217] p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-base font-bold text-white">
            {getText(currentLang, 'Aktywne Tarcze Ochronne', 'Active Protection Shields')}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {getText(
              currentLang,
              'Ochrona przed ransomware, trojanami, keyloggerami i złośliwymi pobraniami w czasie rzeczywistym działa automatycznie w tle.',
              'Full real-time protection against ransomware, trojans, keyloggers, and malware operating continuously in the background.'
            )}
          </p>
          <ul className="space-y-2 text-xs text-slate-300 pt-2 font-mono">
            <li className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{getText(currentLang, 'Skaner heurystyczny Zero-Day', 'Zero-Day Heuristic Scanner')}</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{getText(currentLang, 'Automatyczna Kwarantanna', 'Automatic Quarantine')}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Thank You Note / Status Summary */}
      <div className="bg-[#121217] p-6 rounded-3xl border border-slate-800 text-center space-y-3">
        <HeartHandshake className="w-8 h-8 text-emerald-400 mx-auto" />
        <h4 className="font-bold text-white text-sm">
          {getText(
            currentLang,
            'Dziękujemy za korzystanie z Wieszka Antivirus',
            'Thank you for choosing Wieszka Antivirus'
          )}
        </h4>
        <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
          {getText(
            currentLang,
            'Twój komputer jest pod stałą ochroną Wieszka AI. Wszystkie tarcze bezpieczeństwa działają w czasie rzeczywistym i dbają o bezpieczeństwo Twoich danych.',
            'Your computer is continuously protected by Wieszka AI. All security shields operate actively in real time to safeguard your data.'
          )}
        </p>
      </div>
    </div>
  );
};
