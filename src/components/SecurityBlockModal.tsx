import React, { useState, useEffect } from 'react';
import { ShieldAlert, Terminal, FolderOpen, Copy, Check, Download, AlertTriangle, ExternalLink, X } from 'lucide-react';
import { LanguageCode, getText } from '../i18n';

interface SecurityBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang?: LanguageCode;
  onScanUsersFolder: () => void;
}

export const SecurityBlockModal: React.FC<SecurityBlockModalProps> = ({
  isOpen,
  onClose,
  currentLang = 'pl',
  onScanUsersFolder,
}) => {
  const [copied, setCopied] = useState(false);
  const [isAgentRunning, setIsAgentRunning] = useState(false);

  // Check if localhost:4000 agent started
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch('http://localhost:4000/system-info', { signal: AbortSignal.timeout(800) });
        if (res.ok) {
          setIsAgentRunning(true);
        }
      } catch {
        setIsAgentRunning(false);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.origin : '';
  const psCommand = `powershell -Command "irm ${currentHost}/agent.ps1 | iex"`;

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(psCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">
                {getText(currentLang, 'Dlaczego przeglądarka zablokowała dysk C:?', 'Why did the browser block drive C:?')}
              </h3>
              <p className="text-xs text-slate-400">
                {getText(
                  currentLang,
                  'Bezpieczeństwo sandboxa Chromium (Chrome / Edge) i taktyka antywirusów',
                  'Chromium sandbox security rules & Antivirus tactics'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Explanation Box */}
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200/90 leading-relaxed flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 font-semibold block mb-1">
                {getText(
                  currentLang,
                  'Chromium (Chrome / Edge) chroni pliki jądra systemu operacyjnego',
                  'Chromium protects operating system kernel files'
                )}
              </strong>
              {getText(
                currentLang,
                'Przeglądarki internetowe celowo uniemożliwiają bezpośredni wybór głównego korzenia C:\\ lub C:\\Windows (SecurityError), aby żadna strona www nie uszkodziła jądra systemu. Antywirusy takie jak Kaspersky, Malwarebytes czy Avast stosują dwie poniższe taktyki:',
                'Web browsers deliberately block direct selection of root C:\\ or C:\\Windows (SecurityError) to prevent websites from modifying OS files. Antiviruses like Kaspersky, Malwarebytes, or Avast use the two tactics below:'
              )}
            </div>
          </div>

          {/* Option 1: Browser scan of C:\Users */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-100">
                    {getText(
                      currentLang,
                      'Taktyka 1: Wybierz folder C:\\Users (Skanowanie w przeglądarce)',
                      'Tactic 1: Select C:\\Users folder (In-Browser scan)'
                    )}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {getText(
                      currentLang,
                      'Przeglądarka pozwala na dostęp do C:\\Users. Tam znajduje się 99% wirusów (Pobrane, Pulpit, AppData, Dokumenty).',
                      'The browser allows access to C:\\Users where 99% of malware resides (Downloads, Desktop, AppData, Documents).'
                    )}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {getText(currentLang, 'Zalecane', 'Recommended')}
              </span>
            </div>

            <button
              onClick={() => {
                onClose();
                onScanUsersFolder();
              }}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition flex items-center justify-center gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              {getText(
                currentLang,
                'Wybierz folder C:\\Users i skanuj pliki komputera',
                'Select C:\\Users folder & scan PC files'
              )}
            </button>
          </div>

          {/* Option 2: Native Agent (Kaspersky / Malwarebytes Online Scanner architecture) */}
          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-700/50 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-100">
                    {getText(
                      currentLang,
                      'Taktyka 2: Agent PowerShell (Dokładnie tak jak Kaspersky & Malwarebytes)',
                      'Tactic 2: PowerShell Agent (Identical to Kaspersky & Malwarebytes)'
                    )}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {getText(
                      currentLang,
                      'Uruchomienie 1 linijki w PowerShell daje uprawnienia Windows i skanuje całe C:\\ (w tym C:\\Windows i RAM) bez limitów przeglądarki.',
                      'Running 1 line in PowerShell gives native Windows privileges to scan entire C:\\ (including C:\\Windows and RAM) without browser limits.'
                    )}
                  </p>
                </div>
              </div>
              {isAgentRunning && (
                <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                  {getText(currentLang, 'Agent Aktywny!', 'Agent Connected!')}
                </span>
              )}
            </div>

            {/* Command Copy Box */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs flex items-center justify-between gap-2 overflow-x-auto text-indigo-300">
              <span className="select-all truncate">{psCommand}</span>
              <button
                onClick={handleCopyCommand}
                className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs flex items-center gap-1.5 transition flex-shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? getText(currentLang, 'Skopiowano!', 'Copied!') : getText(currentLang, 'Kopiuj', 'Copy')}
              </button>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <a
                href="/uruchom-skaner-wieszka.bat"
                download="uruchom-skaner-wieszka.bat"
                className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-1.5 border border-slate-700"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                {getText(currentLang, 'Pobierz plik .BAT (1-klik)', 'Download .BAT (1-click)')}
              </a>
              <a
                href="/agent.ps1"
                download="wieszka-agent.ps1"
                className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-1.5 border border-slate-700"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                {getText(currentLang, 'Pobierz skrypt .PS1', 'Download .PS1 script')}
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            {getText(currentLang, 'Zamknij', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
