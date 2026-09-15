import React, { useState } from 'react';
import {
  Biohazard,
  Trash2,
  RotateCcw,
  Code,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Sparkles,
  Search
} from 'lucide-react';
import { ThreatItem } from '../types';
import { LanguageCode, getText } from '../i18n';

interface QuarantineViewProps {
  quarantinedThreats: ThreatItem[];
  currentLang?: LanguageCode;
  onDeleteFromQuarantine: (threatId: string) => void;
  onRestoreFromQuarantine: (threatId: string) => void;
  onClearQuarantine: () => void;
  onAnalyzeWithAi: (threat: ThreatItem) => void;
}

export const QuarantineView: React.FC<QuarantineViewProps> = ({
  quarantinedThreats = [],
  currentLang = 'pl',
  onDeleteFromQuarantine,
  onRestoreFromQuarantine,
  onClearQuarantine,
  onAnalyzeWithAi,
}) => {
  const safeThreats = quarantinedThreats || [];
  const [inspectingThreat, setInspectingThreat] = useState<ThreatItem | null>(null);

  return (
    <div className="p-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-[#121217] p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <span className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Biohazard className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {getText(currentLang, 'Izolowany Magazyn Kwarantanny Wieszka', 'Wieszka Isolated Quarantine Vault')}
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            {getText(
              currentLang,
              'Pliki w kwarantannie są całkowicie odizolowane od jądra systemu operacyjnego i nie mogą wykonać żadnego złośliwego kodu.',
              'Files in quarantine are completely isolated from the OS kernel and cannot execute any malicious payload.'
            )}
          </p>
        </div>

        {safeThreats.length > 0 && (
          <button
            onClick={onClearQuarantine}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/20 transition flex items-center space-x-1.5 shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>{getText(currentLang, 'Opróżnij Całą Kwarantannę', 'Empty All Quarantine')}</span>
          </button>
        )}
      </div>

      {safeThreats.length === 0 ? (
        <div className="bg-[#121217] p-12 rounded-3xl border border-slate-800 text-center space-y-3">
          <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto opacity-80" />
          <h3 className="text-sm font-bold text-slate-200">{getText(currentLang, 'Kwarantanna jest pusta', 'Quarantine is empty')}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {getText(
              currentLang,
              'Brak zablokowanych plików. Po wykryciu zagrożenia podczas skanowania, trafi ono tutaj bezpiecznie.',
              'No blocked files. When threats are detected during scan, they will be safely quarantined here.'
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {safeThreats.map((threat) => (
              <div
                key={threat.id}
                className="bg-[#121217] p-4 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {threat.threatName}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1A1A21] text-slate-300 border border-slate-800">
                      {getText(currentLang, 'Zabezpieczono: ', 'Secured: ')}{threat.detectedAt}
                    </span>
                  </div>

                  <p className="text-xs font-mono font-bold text-slate-200 truncate" title={threat.filePath}>
                    {threat.filePath}
                  </p>

                  <p className="text-xs text-slate-400">{threat.description}</p>
                </div>


                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {threat.codeSnippet && (
                    <button
                      onClick={() => setInspectingThreat(threat)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1A1A21] hover:bg-slate-800 text-slate-300 border border-slate-800 transition flex items-center space-x-1"
                    >
                      <Code className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{getText(currentLang, 'Podgląd Kodu', 'Code Preview')}</span>
                    </button>
                  )}

                  <button
                    onClick={() => onAnalyzeWithAi(threat)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition flex items-center space-x-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{getText(currentLang, 'Re-analiza AI', 'AI Re-analyze')}</span>
                  </button>

                  <button
                    onClick={() => onRestoreFromQuarantine(threat.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1A1A21] hover:bg-slate-800 text-amber-300 border border-slate-800 transition flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{getText(currentLang, 'Przywróć', 'Restore')}</span>
                  </button>

                  <button
                    onClick={() => onDeleteFromQuarantine(threat.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{getText(currentLang, 'Usuń', 'Delete')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal code inspector */}
          {inspectingThreat && (
            <div className="fixed inset-0 z-50 bg-[#09090B]/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#121217] border border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Code className="w-4 h-4 text-indigo-400" />
                    <span>{getText(currentLang, 'Bezpieczny Podgląd Izolowanego Kodu:', 'Safe Isolated Code Preview:')} {inspectingThreat.fileName}</span>
                  </h3>
                  <button
                    onClick={() => setInspectingThreat(null)}
                    className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-[#1A1A21] border border-slate-800"
                  >
                    {getText(currentLang, 'Zamknij', 'Close')}
                  </button>
                </div>

                <div className="bg-[#1A1A21] p-4 rounded-2xl border border-slate-800 font-mono text-xs text-indigo-200 overflow-x-auto max-h-80 scrollbar-thin">
                  <pre>{inspectingThreat.codeSnippet || getText(currentLang, '// Brak zawartości tekstu skryptu', '// No script text content')}</pre>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setInspectingThreat(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#1A1A21] text-slate-300 border border-slate-800 hover:text-white"
                  >
                    {getText(currentLang, 'Zamknij Okno', 'Close Window')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
