import React, { useState } from 'react';
import {
  Shield,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  Globe,
  Laptop,
  Check,
  Settings,
  Info,
  Sun,
  Moon,
  HardDrive
} from 'lucide-react';
import { WizardConfig } from '../types';
import { LANGUAGES, LanguageCode, getText } from '../i18n';
import { WieszkaLogo } from './WieszkaLogo';

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onSaveConfig: (config: WizardConfig) => void;
  customLogoUrl?: string | null;
  themeMode?: 'dark' | 'light';
  onThemeChange?: (theme: 'dark' | 'light') => void;
  onOpenFileExplorer?: (initialPath?: string) => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onLanguageChange,
  onSaveConfig,
  customLogoUrl = null,
  themeMode = 'dark',
  onThemeChange,
  onOpenFileExplorer,
}) => {
  const [step, setStep] = useState<number>(1);

  // Form states
  const [scannedDrives, setScannedDrives] = useState<string[]>(['C:', 'D:']);
  const [protectionPreset, setProtectionPreset] = useState<'max_ai' | 'balanced' | 'gamer_light'>('max_ai');
  const [backgroundEnabled, setBackgroundEnabled] = useState<boolean>(true);
  const [trayMinimize, setTrayMinimize] = useState<boolean>(true);
  const [quickScanDaily, setQuickScanDaily] = useState<boolean>(true);
  const [scanTime, setScanTime] = useState<string>('14:00');

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

  // Available drive targets
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

  // Language dictionary for Setup modal
  const text = {
    pl: {
      setupTitle: 'SETUP SYSTEMOWY WIESZKA SECURITY',
      setupSubtitle: 'Dostosuj działanie antywirusa do swoich potrzeb w kilku prostych krokach',
      noteTitle: 'Możesz zmienić te opcje w dowolnym momencie w Ustawieniach Konta (ikona zębatki ⚙️ obok profilu).',
      stepStr: 'Krok',
      ofStr: 'z',

      // Step 1: Language
      step1Title: '1. Wybierz Język Aplikacji',
      step1Desc: 'Wybierz preferowany język interfejsu. Cały antywirus natychmiast dostosuje tłumaczenie.',

      // Step 2: Protection Preset
      step2Title: '2. Wybierz Tryb Ochrony i Heurystyki AI',
      step2Desc: 'Silnik Wieszka Antivirus oferuje profil wydajnościowy oraz intensywność ochrony dla całego komputera.',
      maxAiName: 'Maksymalna Ochrona Wieszka AI (Zalecana)',
      maxAiDesc: 'Pełna analiza heurystyczna Wieszka AI, głębokie skanowanie pamięci RAM, rejestru oraz ochrona Zero-Day.',
      balancedName: 'Standardowa Ochrona Zbalansowana',
      balancedDesc: 'Kompleksowe skanowanie w czasie rzeczywistym przy zminimalizowanym obciążeniu procesora.',
      gamerName: 'Tryb Gracza / Ultra Wydajny',
      gamerDesc: 'Zero wyskakujących okienek podczas gier, zminimalizowane zużycie RAM poniżej 100 MB.',

      // Step 3: Background & Tray
      step3Title: '3. Praca w Tle i Zasobnik Systemowy (System Tray)',
      step3Desc: 'Określ zachowanie antywirusa po zamknięciu okna oraz podczas uruchamiania systemu.',
      bgLabel: 'Działaj w tle po zamknięciu okna',
      bgDesc: 'Zamknięcie okna minimalizuje aplikację do ikony obok zegara systemowego bez przerywania ochrony.',
      trayLabel: 'Uruchamiaj automatycznie przy starcie systemu Windows/OS',
      trayDesc: 'Ochrona aktywuje się samoczynnie podczas bootowania komputera.',

      // Confirmation
      finishTitle: 'Konfiguracja Setup Zakończona Pomyślnie!',
      finishDesc: 'Twój system jest gotowy i w pełni chroniony przez silnik Wieszka Guard.',
      summaryDrives: 'Automatyczne Skanowanie:',
      summaryPreset: 'Tryb Ochrony:',
      summaryTray: 'Praca w tle (Tray):',
      summarySched: 'Harmonogram:',
      summaryActive: 'AKTYWNA',
      summaryInactive: 'WYŁĄCZONA',
      summaryDailyAt: 'Codziennie o',
      summaryManual: 'Ręczne skanowanie',

      // Buttons
      btnBack: 'Wstecz',
      btnNext: 'Dalej',
      btnFinish: 'Zapisz Setup & Uruchom Ochronę',
    },
    en: {
      setupTitle: 'WIESZKA SECURITY SYSTEM SETUP',
      setupSubtitle: 'Configure antivirus protection to your preferences in a few easy steps',
      noteTitle: 'You can change these options anytime later in Account Settings (gear icon ⚙️ next to profile).',
      stepStr: 'Step',
      ofStr: 'of',

      step1Title: '1. Select Application Language',
      step1Desc: 'Choose your preferred interface language. The entire antivirus will translate instantly.',

      step2Title: '2. Select Protection Mode & AI Heuristics',
      step2Desc: 'Wieszka Antivirus offers customizable performance profiles and protection intensity for your full PC.',
      maxAiName: 'Maximum Wieszka AI Protection (Recommended)',
      maxAiDesc: 'Full Wieszka AI heuristic analysis, deep RAM scanning, registry inspection and Zero-Day defense.',
      balancedName: 'Standard Balanced Protection',
      balancedDesc: 'Comprehensive real-time scanning with minimal CPU resource impact.',
      gamerName: 'Gamer Mode / Ultra Performance',
      gamerDesc: 'Zero popups during games, minimized RAM usage under 100 MB.',

      step3Title: '3. Background Execution & System Tray',
      step3Desc: 'Define antivirus behavior when closing windows and on OS boot.',
      bgLabel: 'Run in background on window close',
      bgDesc: 'Closing the app window minimizes it to the system tray clock icon keeping protection active.',
      trayLabel: 'Autostart on Windows / OS boot',
      trayDesc: 'Protection automatically starts when your computer boots up.',

      finishTitle: 'Setup Configuration Completed Successfully!',
      finishDesc: 'Your system is configured and fully protected by the Wieszka Guard engine.',
      summaryDrives: 'Auto Scan Target:',
      summaryPreset: 'Protection Mode:',
      summaryTray: 'Background Tray:',
      summarySched: 'Schedule:',
      summaryActive: 'ACTIVE',
      summaryInactive: 'DISABLED',
      summaryDailyAt: 'Daily at',
      summaryManual: 'Manual scan only',

      btnBack: 'Back',
      btnNext: 'Next',
      btnFinish: 'Save Setup & Enable Protection',
    },
    de: {
      setupTitle: 'WIESZKA SECURITY SYSTEM SETUP',
      setupSubtitle: 'Konfigurieren Sie den Antivirenschutz in wenigen einfachen Schritten',
      noteTitle: 'Sie können diese Einstellungen jederzeit in den Kontoeinstellungen (Zahnrad ⚙️) ändern.',
      stepStr: 'Schritt',
      ofStr: 'von',

      step1Title: '1. Sprache auswählen',
      step1Desc: 'Wählen Sie Ihre bevorzugte Benutzeroberflächensprache.',

      step2Title: '2. Laufwerke zum Scannen auswählen',
      step2Desc: 'Legen Sie fest, welche Laufwerke gescannt werden sollen.',

      step3Title: '3. Schutzmodus wählen',
      step3Desc: 'Wählen Sie das Leistungsprofil für Ihren Virenscanner.',
      maxAiName: 'Maximaler Wieszka KI-Schutz (Empfohlen)',
      maxAiDesc: 'Vollständige Wieszka-KI-Analyse und Deep RAM-Scan.',
      balancedName: 'Standard Ausgewogen',
      balancedDesc: 'Echtzeitschutz mit geringer CPU-Belastung.',
      gamerName: 'Gamer-Modus / Ultra Leistung',
      gamerDesc: 'Keine Popups beim Spielen, RAM-Verbrauch unter 100 MB.',

      step4Title: '4. Hintergrundbetrieb & System Tray',
      step4Desc: 'Legen Sie das Verhalten beim Schließen fest.',
      bgLabel: 'Im Hintergrund ausführen',
      bgDesc: 'Beim Schließen des Fensters in die Taskleiste minimieren.',
      trayLabel: 'Autostart beim Systemstart',
      trayDesc: 'Der Schutz startet automatisch mit dem PC.',

      finishTitle: 'Setup erfolgreich abgeschlossen!',
      finishDesc: 'Ihr System ist geschützt.',
      summaryDrives: 'Gescannte Laufwerke:',
      summaryPreset: 'Schutzmodus:',
      summaryTray: 'Hintergrundbetrieb:',
      summarySched: 'Zeitplan:',
      summaryActive: 'AKTIV',
      summaryInactive: 'DEAKTIVIERT',
      summaryDailyAt: 'Täglich um',
      summaryManual: 'Manuell',

      btnBack: 'Zurück',
      btnNext: 'Weiter',
      btnFinish: 'Einstellungen Speichern',
    },
    fr: {
      setupTitle: 'CONFIGURATION DU SYSTÈME WIESZKA',
      setupSubtitle: 'Configurez votre protection antivirus en quelques étapes simples',
      noteTitle: 'Vous pouvez modifier ces options à tout moment dans les Paramètres du Compte (icône ⚙️).',
      stepStr: 'Étape',
      ofStr: 'sur',

      step1Title: '1. Choisissez la Langue',
      step1Desc: 'Sélectionnez votre langue d\'interface préférée.',

      step2Title: '2. Sélectionnez les Disques à Analyser',
      step2Desc: 'Choisissez les disques et partitions à analyser.',

      step3Title: '3. Mode de Protection & IA',
      step3Desc: 'Choisissez le niveau d\'analyse antivirus.',
      maxAiName: 'Protection Wieszka IA Maximale (Recommandée)',
      maxAiDesc: 'Analyse heuristique Wieszka IA complète et scan mémoire.',
      balancedName: 'Protection Équilibrée',
      balancedDesc: 'Analyse en temps réel avec faible utilisation du processeur.',
      gamerName: 'Mode Joueur / Ultra Performance',
      gamerDesc: 'Aucune notification pendant les jeux, RAM minimale.',

      step4Title: '4. Exécution en Arrière-plan & Tray',
      step4Desc: 'Comportement lors de la fermeture et au démarrage.',
      bgLabel: 'Exécuter en arrière-plan',
      bgDesc: 'Réduire dans la zone de notification sans arrêter la protection.',
      trayLabel: 'Démarrage automatique avec l\'OS',
      trayDesc: 'Le logiciel démarre automatiquement avec l\'ordinateur.',

      finishTitle: 'Configuration du Setup Terminée!',
      finishDesc: 'Votre système est totalement protégé par Wieszka Guard.',
      summaryDrives: 'Disques Analysés:',
      summaryPreset: 'Mode Protection:',
      summaryTray: 'Arrière-plan:',
      summarySched: 'Planification:',
      summaryActive: 'ACTIF',
      summaryInactive: 'DÉSACTIVÉ',
      summaryDailyAt: 'Tous les jours à',
      summaryManual: 'Manuel uniquement',

      btnBack: 'Retour',
      btnNext: 'Suivant',
      btnFinish: 'Enregistrer & Démarrer',
    }
  };

  const activeLang = ['pl', 'en', 'de', 'fr'].includes(currentLang) ? (currentLang as 'pl' | 'en' | 'de' | 'fr') : 'en';
  const t = text[activeLang];

  const handleFinish = () => {
    const config: WizardConfig = {
      isCompleted: true,
      protectionPreset,
      backgroundEnabled,
      trayMinimize,
      quickScanDaily,
      scanTime,
      language: currentLang,
      scannedDrives,
    };
    onSaveConfig(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className="bg-[#121217] border border-indigo-500/30 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[560px]">
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Content Container */}
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
            <div className="flex items-center space-x-3">
              <WieszkaLogo className="w-9 h-9" customLogoUrl={customLogoUrl} />
              <div>
                <h2 className="text-base font-bold text-white tracking-wide font-mono flex items-center gap-2">
                  <span>{t.setupTitle}</span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/30 font-sans">
                    SETUP
                  </span>
                </h2>
                <p className="text-xs text-slate-400">{t.setupSubtitle}</p>
              </div>
            </div>

            <div className="text-xs font-mono text-indigo-400 font-bold bg-[#1A1A21] px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
              {t.stepStr} {step} {t.ofStr} 4
            </div>
          </div>

          {/* Important User Note Banner */}
          <div className="mb-4 p-3 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl flex items-center gap-2.5 text-xs text-indigo-200">
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{t.noteTitle}</span>
          </div>

          {/* Progress Indicator */}
          <div className="w-full bg-[#1A1A21] h-1.5 rounded-full mb-5 overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-300 rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>

          {/* STEP 1: Language & Theme Selection */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                <span>{t.step1Title}</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t.step1Desc}</p>

              {/* Language selection */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300">
                  {getText(currentLang, 'Wybór języka interfejsu:', 'Interface language:')}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 max-h-[140px] overflow-y-auto pr-1">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => onLanguageChange(lang.code)}
                      className={`p-2.5 rounded-2xl border text-left transition flex items-center space-x-2.5 ${
                        currentLang === lang.code
                          ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold shadow-md shadow-indigo-950/40'
                          : 'bg-[#1A1A21] border-slate-800/80 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <div className="overflow-hidden">
                        <div className="text-xs font-semibold truncate text-slate-200">{lang.name}</div>
                        <div className="text-[9px] text-slate-500 uppercase font-mono">{lang.code}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme mode selection */}
              {onThemeChange && (
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>{getText(currentLang, 'Motyw wizualny (Jasny / Ciemny):', 'Visual theme (Light / Dark):')}</span>
                    </h4>
                    <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase">
                      {themeMode === 'light' ? getText(currentLang, 'Tryb Jasny', 'Light') : getText(currentLang, 'Tryb Ciemny', 'Dark')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => onThemeChange('dark')}
                      className={`p-3 rounded-2xl border text-left transition flex items-center space-x-3 ${
                        themeMode === 'dark'
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                          : 'bg-[#1A1A21] border-slate-800/80 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-indigo-400 shrink-0">
                        <Moon className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white">
                          {getText(currentLang, 'Tryb Ciemny (Dark)', 'Dark Mode')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {getText(currentLang, 'Komfort w nocy', 'Night comfort')}
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onThemeChange('light')}
                      className={`p-3 rounded-2xl border text-left transition flex items-center space-x-3 ${
                        themeMode === 'light'
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                          : 'bg-[#1A1A21] border-slate-800/80 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                        <Sun className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white">
                          {getText(currentLang, 'Tryb Jasny (Light)', 'Light Mode')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {getText(currentLang, 'Jasny i czytelny', 'Bright contrast')}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Protection Mode Preset */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" />
                <span>{t.step2Title}</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t.step2Desc}</p>

              <div className="grid grid-cols-1 gap-3 pt-1">
                <div
                  onClick={() => setProtectionPreset('max_ai')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-4 ${
                    protectionPreset === 'max_ai'
                      ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-lg'
                      : 'bg-[#1A1A21] border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-white">{t.maxAiName}</h4>
                      {protectionPreset === 'max_ai' && <Check className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{t.maxAiDesc}</p>
                  </div>
                </div>

                <div
                  onClick={() => setProtectionPreset('balanced')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-4 ${
                    protectionPreset === 'balanced'
                      ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-lg'
                      : 'bg-[#1A1A21] border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-white">{t.balancedName}</h4>
                      {protectionPreset === 'balanced' && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{t.balancedDesc}</p>
                  </div>
                </div>

                <div
                  onClick={() => setProtectionPreset('gamer_light')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-4 ${
                    protectionPreset === 'gamer_light'
                      ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-lg'
                      : 'bg-[#1A1A21] border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-white">{t.gamerName}</h4>
                      {protectionPreset === 'gamer_light' && <Check className="w-4 h-4 text-purple-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{t.gamerDesc}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Background & Tray */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Laptop className="w-4 h-4 text-indigo-400" />
                <span>{t.step3Title}</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t.step3Desc}</p>

              <div className="space-y-3 pt-2">
                <div className="p-4 bg-[#1A1A21] rounded-2xl border border-slate-800/80 flex items-center justify-between">
                  <div className="space-y-1 pr-4">
                    <h4 className="text-xs font-bold text-white">{t.bgLabel}</h4>
                    <p className="text-[11px] text-slate-400">{t.bgDesc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBackgroundEnabled(!backgroundEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                      backgroundEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        backgroundEnabled ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 bg-[#1A1A21] rounded-2xl border border-slate-800/80 flex items-center justify-between">
                  <div className="space-y-1 pr-4">
                    <h4 className="text-xs font-bold text-white">{t.trayLabel}</h4>
                    <p className="text-[11px] text-slate-400">{t.trayDesc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTrayMinimize(!trayMinimize)}
                    className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                      trayMinimize ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        trayMinimize ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Confirmation & Summary */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center py-2 space-y-1.5">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-white">{t.finishTitle}</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">{t.finishDesc}</p>
              </div>

              <div className="bg-[#1A1A21] p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-500">{t.summaryDrives}</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[11px] font-bold">
                    {getText(currentLang, 'System OS, RAM, Procesy, .EXE (Cały Komputer)', 'System OS, RAM, Processes, .EXE (Full PC)')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">{t.summaryPreset}</span>
                  <span className="font-bold text-indigo-400">
                    {protectionPreset === 'max_ai'
                      ? getText(currentLang, 'Maksymalny AI', 'Maximum AI')
                      : protectionPreset === 'balanced'
                      ? getText(currentLang, 'Zbalansowany', 'Balanced')
                      : 'Gamer Ultra'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">{t.summaryTray}</span>
                  <span className={backgroundEnabled ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {backgroundEnabled ? t.summaryActive : t.summaryInactive}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">{t.summarySched}</span>
                  <span className="text-slate-200">
                    {quickScanDaily ? `${t.summaryDailyAt} ${scanTime}` : t.summaryManual}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 mt-4">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 bg-[#1A1A21] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold border border-slate-800 transition flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.btnBack}</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-900/30"
            >
              <span>{t.btnNext}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-xl shadow-emerald-900/30"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.btnFinish}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
