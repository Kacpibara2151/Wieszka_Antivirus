import React, { useState } from 'react';
import {
  Cpu,
  Sparkles,
  Upload,
  FileCode,
  AlertTriangle,
  CheckCircle2,
  Biohazard,
  ShieldAlert,
  Loader2,
  FileText,
  Terminal,
  Code,
  HardDrive
} from 'lucide-react';
import { FileItem, ThreatCategory, SeverityLevel } from '../types';
import { LanguageCode, getText } from '../i18n';
import { inspectFileSafe, formatBytes } from '../utils/fileScannerUtils';

interface AiAnalysisResult {
  isThreat: boolean;
  threatName: string;
  threatType: ThreatCategory;
  severity: SeverityLevel;
  riskScore: number;
  confidenceScore: number;
  behaviorSummary: string;
  detectedIndicators: string[];
  recommendedAction: string;
  technicalDetails: string;
}

interface AiDeepInspectorViewProps {
  mockFiles: FileItem[];
  currentLang?: LanguageCode;
  onQuarantineNewThreat: (file: FileItem, analysis: AiAnalysisResult) => void;
  isLoggedIn?: boolean;
  onRequireAuth?: () => void;
}

export const AiDeepInspectorView: React.FC<AiDeepInspectorViewProps> = ({
  mockFiles,
  currentLang = 'pl',
  onQuarantineNewThreat,
  isLoggedIn = false,
  onRequireAuth,
}) => {
  const isPl = currentLang === 'pl';
  const [selectedFileId, setSelectedFileId] = useState<string>('f3');
  const [customCode, setCustomCode] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedFileSizeInfo, setUploadedFileSizeInfo] = useState<string>('');
  const [isLargeFileLoaded, setIsLargeFileLoaded] = useState<boolean>(false);
  const [isReadingFile, setIsReadingFile] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AiAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeMockFile = mockFiles.find((f) => f.id === selectedFileId);

  const handleSelectMockFile = (fileId: string) => {
    setSelectedFileId(fileId);
    setUploadedFileName('');
    setUploadedFileSizeInfo('');
    setIsLargeFileLoaded(false);
    const found = mockFiles.find((f) => f.id === fileId);
    if (found && found.content) {
      setCustomCode(found.content);
    } else {
      setCustomCode('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setSelectedFileId('');
    setErrorMessage(null);
    setAnalysisResult(null);

    const formatted = formatBytes(file.size);
    setUploadedFileSizeInfo(formatted);

    // If file is large (> 1GB or > 2MB), use non-blocking stream inspector
    const isBig = file.size > 2 * 1024 * 1024;
    setIsLargeFileLoaded(isBig);
    setIsReadingFile(true);

    try {
      // Safely inspect header chunk without loading gigabytes into RAM
      const inspected = await inspectFileSafe(file);
      setCustomCode(inspected.previewSnippet);
    } catch (err: any) {
      setCustomCode(`// Błąd bezpiecznego odczytu nagłówka pliku: ${file.name} (${formatted})`);
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleRunAiAnalysis = async () => {
    if (!isLoggedIn) {
      setErrorMessage(
        getText(
          currentLang,
          'Zaloguj się lub utwórz konto, aby skorzystać z analizatora heurystycznego AI!',
          'Please sign in or create an account to use the AI heuristic inspector!'
        )
      );
      if (onRequireAuth) onRequireAuth();
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisResult(null);

    const fileName = uploadedFileName || activeMockFile?.name || 'skrypt_podejrzany.ps1';
    const filePath = activeMockFile?.path || `C:\\Users\\User\\Downloads\\${fileName}`;
    // Limit payload to max 8KB of text so it never crashes memory or HTTP limits
    const safeContent = (customCode || activeMockFile?.content || 'No code content').slice(0, 8000);

    try {
      const res = await fetch('/api/scan/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          filePath,
          fileContent: safeContent,
          fileType: activeMockFile?.type || (isLargeFileLoaded ? 'Binary File' : 'Script/Code'),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message ||
            getText(
              currentLang,
              'Błąd podczas analizy w chmurze Wieszka AI.',
              'Error during Wieszka AI cloud analysis.'
            )
        );
      }

      setAnalysisResult(data.analysis);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          getText(
            currentLang,
            'Wystąpił problem z połączeniem z silnikiem AI.',
            'Connection issue with Wieszka AI security engine.'
          )
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#121217] p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Wieszka AI Heuristic Engine</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {getText(currentLang, 'Głęboki Analizator Heurystyczny AI', 'Deep AI Heuristic Inspector')}
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            {getText(
              currentLang,
              'Wklej podejrzany kod skryptu, wybierz plik z dysku lub prześlij własny plik z komputera. Model Wieszka AI dokona decompilacji i oceny ryzyka zero-day.',
              'Paste a suspicious script, pick a sample file, or upload a file. Wieszka AI will inspect code and evaluate zero-day threats.'
            )}
          </p>
        </div>

        <button
          onClick={handleRunAiAnalysis}
          disabled={isAnalyzing}
          className={`px-6 py-3.5 rounded-2xl font-bold text-xs tracking-wide transition shadow-xl flex items-center space-x-2 shrink-0 ${
            isAnalyzing
              ? 'bg-[#1A1A21] text-slate-500 cursor-not-allowed border border-slate-800'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30'
          }`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-indigo-300" />
              <span>{getText(currentLang, 'Analizowanie przez Wieszka AI...', 'Analyzing with Wieszka AI...')}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <span>{getText(currentLang, 'Uruchom Prześwietlenie AI', 'Run AI Inspection')}</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Input Column */}
        <div className="space-y-4">
          <div className="bg-[#121217] p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-400" />
                <span>{getText(currentLang, 'Wybór Pliku do Analizy AI', 'Select File for AI Analysis')}</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {getText(currentLang, 'Próbki systemowe', 'System Samples')}
              </span>
            </h3>

            {/* Mock Files Selector */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 block">
                {getText(currentLang, 'Wybierz próbkę z dysku C:\\', 'Select sample from drive C:\\')}
              </label>
              <select
                value={selectedFileId}
                onChange={(e) => handleSelectMockFile(e.target.value)}
                className="w-full bg-[#1A1A21] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {mockFiles.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.category} - {f.path})
                  </option>
                ))}
              </select>
            </div>

            {/* Local File Uploader */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-400 block">
                  {getText(currentLang, 'lub Prześlij Plik z Komputera / Laptopa', 'or Upload File from Computer / Laptop')}
                </label>
                <span className="text-[10px] text-emerald-400 font-medium">
                  {getText(currentLang, 'Obsługa plików > 1GB bez ścinania', 'Supports files > 1GB smoothly')}
                </span>
              </div>
              <label className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 bg-[#1A1A21] text-slate-400 hover:text-indigo-300 cursor-pointer transition">
                {isReadingFile ? (
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 text-indigo-400" />
                )}
                <span className="text-xs font-semibold truncate max-w-xs">
                  {uploadedFileName
                    ? `${getText(currentLang, 'Wczytano', 'Loaded')}: ${uploadedFileName} (${uploadedFileSizeInfo})`
                    : getText(currentLang, 'Kliknij, aby wybrać plik z dysku (dowolny rozmiar)...', 'Click to select file from disk (any size)...')}
                </span>
                <input type="file" className="hidden" onChange={handleFileUpload} />
              </label>

              {isLargeFileLoaded && (
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-700/50 text-[11px] text-indigo-200">
                  <HardDrive className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>
                    {getText(
                      currentLang,
                      `Wykryto duży plik (${uploadedFileSizeInfo}). Silnik Wieszka AI użył ochrony strumieniowej - brak zamrażania pamięci RAM.`,
                      `Large file detected (${uploadedFileSizeInfo}). Wieszka AI used streaming protection - zero RAM freeze.`
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Code / Text Editor Area */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-400 font-mono">
                  {getText(currentLang, 'Podgląd Zawartości / Kodu Skryptu:', 'Content / Script Code Preview:')}
                </label>
                <span className="text-[10px] text-slate-500">
                  {customCode.length} {getText(currentLang, 'znaków', 'characters')}
                </span>
              </div>
              <textarea
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder={getText(
                  currentLang,
                  'Wklej tutaj podejrzane polecenia PowerShell, skrypt VBScript, wywołania DLL lub kod źródłowy...',
                  'Paste suspicious PowerShell commands, VBScript, DLL calls, or source code here...'
                )}
                rows={10}
                className="w-full bg-[#1A1A21] border border-slate-800 rounded-xl p-3 text-xs font-mono text-indigo-200 focus:outline-none focus:border-indigo-500 scrollbar-thin"
              />
            </div>
          </div>
        </div>

        {/* Right Analysis Result Column */}
        <div className="space-y-4">
          <div className="bg-[#121217] p-5 rounded-2xl border border-slate-800 min-h-[460px] flex flex-col justify-between">
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {isAnalyzing && (
              <div className="my-auto text-center space-y-4 py-12">
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                  <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">
                    {getText(currentLang, 'Sztuczna Inteligencja Wieszka AI Analizuje Plik...', 'Wieszka AI is Analyzing the File...')}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {getText(
                      currentLang,
                      'Rozpoznawanie wzorców złośliwego oprogramowania, heurystyka funkcji WinAPI i dekompilacja pętli.',
                      'Malware pattern recognition, WinAPI heuristics, and loop decompilation.'
                    )}
                  </p>
                </div>
              </div>
            )}

            {!isAnalyzing && !analysisResult && !errorMessage && (
              <div className="my-auto text-center space-y-3 py-16 text-slate-500">
                <Cpu className="w-12 h-12 mx-auto text-slate-700 opacity-60" />
                <p className="text-xs font-medium">
                  {getText(currentLang, 'Brak aktywnego raportu AI.', 'No active AI report.')}
                </p>
                <p className="text-[11px] text-slate-600 max-w-xs mx-auto">
                  {getText(
                    currentLang,
                    'Kliknij przycisk "Uruchom Prześwietlenie AI", aby wygenerować głęboką analizę heurystyczną Wieszka AI.',
                    'Click "Run AI Inspection" button to generate a deep heuristic analysis with Wieszka AI.'
                  )}
                </p>
              </div>
            )}

            {!isAnalyzing && analysisResult && (
              <div className="space-y-5">
                {/* Result Status Header */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  analysisResult.isThreat
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                    : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                }`}>
                  <div className="flex items-center space-x-3">
                    {analysisResult.isThreat ? (
                      <ShieldAlert className="w-6 h-6 text-rose-400" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        {analysisResult.isThreat
                          ? getText(currentLang, 'ZAGROŻENIE WYKRYTE PRZEZ WIESZKA AI!', 'THREAT DETECTED BY WIESZKA AI!')
                          : getText(currentLang, 'PLIK BEZPIECZNY', 'FILE IS CLEAN & SAFE')}
                      </h4>
                      <p className="text-xs opacity-90 font-mono">
                        {analysisResult.threatName} ({analysisResult.threatType})
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-mono">
                      {getText(currentLang, 'Wynik Ryzyka', 'Risk Score')}
                    </span>
                    <span className={`text-xl font-extrabold font-mono ${
                      analysisResult.riskScore > 50 ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {analysisResult.riskScore}/100
                    </span>
                  </div>
                </div>

                {/* Detailed Analysis Cards */}
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-[#1A1A21] rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                      {getText(currentLang, 'Opis Działania (Behavior Summary):', 'Behavior Summary:')}
                    </span>
                    <p className="text-slate-300 leading-relaxed">{analysisResult.behaviorSummary}</p>
                  </div>

                  {Array.isArray(analysisResult.detectedIndicators) && analysisResult.detectedIndicators.length > 0 && (
                    <div className="p-3 bg-[#1A1A21] rounded-xl border border-slate-800 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                        {getText(currentLang, 'Wykryte Indykatory Infekcji (IoC):', 'Detected Indicators of Compromise (IoC):')}
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                        {(analysisResult.detectedIndicators || []).map((ioc, idx) => (
                          <li key={idx}>{ioc}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="p-3 bg-[#1A1A21] rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 font-mono">
                      {getText(currentLang, 'Szczegóły Techniczne / Dekompilacja:', 'Technical Details / Decompilation:')}
                    </span>
                    <p className="text-indigo-200 font-mono text-[11px] leading-relaxed">{analysisResult.technicalDetails}</p>
                  </div>

                  <div className="p-3 bg-[#1A1A21] rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                        {getText(currentLang, 'Rekomendowane Działanie:', 'Recommended Action:')}
                      </span>
                      <p className="font-bold text-slate-200">{analysisResult.recommendedAction}</p>
                    </div>
                    <span className="text-[11px] font-mono text-indigo-400">
                      {getText(currentLang, 'Pewność AI:', 'AI Confidence:')} {analysisResult.confidenceScore}%
                    </span>
                  </div>
                </div>

                {/* Action button if threat */}
                {analysisResult.isThreat && (
                  <button
                    onClick={() => {
                      const fileToIsolate: FileItem = activeMockFile || {
                        id: 'custom-' + Date.now(),
                        name: uploadedFileName || 'skrypt_podejrzany.ps1',
                        path: `C:\\Users\\User\\Downloads\\${uploadedFileName || 'skrypt_podejrzany.ps1'}`,
                        sizeKb: 12,
                        type: 'Script',
                        category: 'Script',
                        hash: 'custom-hash-' + Date.now(),
                        lastModified: 'Now',
                        content: customCode
                      };
                      onQuarantineNewThreat(fileToIsolate, analysisResult);
                    }}
                    className="w-full py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition flex items-center justify-center space-x-2"
                  >
                    <Biohazard className="w-4 h-4" />
                    <span>{getText(currentLang, 'Przenieś Plik do Kwarantanny Wieszka', 'Move File to Wieszka Quarantine')}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
