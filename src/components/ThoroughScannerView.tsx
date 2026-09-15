import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  Biohazard,
  Trash2,
  CheckCircle2,
  Terminal,
  FileCode,
  FileSearch,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  FolderOpen,
  Upload,
  ShieldCheck,
  HelpCircle,
  Info,
  HardDrive,
  Laptop,
  Zap,
  X,
  Activity,
  Eye,
  Radar,
  Gauge,
  FolderSearch
} from 'lucide-react';
import { ScanProgress, ScanType, ThreatItem, FileItem, ScanPhase } from '../types';
import { LanguageCode, t, getText } from '../i18n';
import { scanRealDirectoryHandle, requestPCDiskDirectoryHandle, convertFilesToFileItems, formatBytes } from '../utils/fileScannerUtils';

interface ThoroughScannerViewProps {
  scanProgress: ScanProgress;
  currentLang?: LanguageCode;
  onStartScan: (type: ScanType, customFiles?: FileItem[]) => void;
  onPauseScan: () => void;
  onResumeScan: () => void;
  onStopScan: () => void;
  onQuarantineThreat: (threatId: string) => void;
  onDeleteThreat: (threatId: string) => void;
  onQuarantineAll: () => void;
  onAnalyzeWithAi: (threat: ThreatItem) => void;
  mockFiles: FileItem[];
  scannedDrives?: string[];
  onOpenSettings?: () => void;
  onOpenFileExplorer?: () => void;
}

export const ThoroughScannerView: React.FC<ThoroughScannerViewProps> = ({
  scanProgress,
  currentLang = 'en',
  onStartScan,
  onPauseScan,
  onResumeScan,
  onStopScan,
  onQuarantineThreat,
  onDeleteThreat,
  onQuarantineAll,
  onAnalyzeWithAi,
  mockFiles,
  scannedDrives = ['C:', 'D:'],
  onOpenSettings,
  onOpenFileExplorer,
}) => {
  const [selectedScanType, setSelectedScanType] = useState<ScanType>(scanProgress.scanType || 'full');
  const [isReadingFolder, setIsReadingFolder] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  const nativeFileInputRef = useRef<HTMLInputElement>(null);
  const nativeFolderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (nativeFolderInputRef.current) {
      nativeFolderInputRef.current.setAttribute('webkitdirectory', '');
      nativeFolderInputRef.current.setAttribute('directory', '');
    }
  }, []);

  const handleNativeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;
    const realFiles = convertFilesToFileItems(filesList);
    onStartScan(selectedScanType, realFiles);
  };

  const handleNativeFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;
    const realFiles = convertFilesToFileItems(filesList);
    onStartScan(selectedScanType, realFiles);
  };

  // Direct native OS directory permission & recursive auto-detect scan
  const handleRequestAccessAndScan = (scanType: ScanType = selectedScanType) => {
    onStartScan(scanType);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const realFiles = convertFilesToFileItems(files);
      onStartScan(selectedScanType, realFiles);
    }
  };

  const phases: string[] = [
    'Boot Sector & MBR',
    getText(currentLang, 'Kluczowe Moduły Systemowe', 'Critical System Modules'),
    getText(currentLang, 'Sektory Plików Systemowych', 'System File Sectors'),
    getText(currentLang, 'Baza Rejestru', 'Registry Database'),
    getText(currentLang, 'Pliki Programów', 'Program Files'),
    getText(currentLang, 'Pobrania i Dokumenty', 'Downloads & Documents'),
    getText(currentLang, 'Analiza Heurystyczna AI', 'AI Heuristic Analysis'),
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#121217] p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3">
            <span className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
              <Search className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{t(currentLang, 'thoroughScan')}</span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                100% (Wieszka AI Engine)
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {getText(
              currentLang,
              'Silnik Wieszka wykorzystuje 4-warstwową technologię skanowania (Wieszka AI + Chmura Sygnatur 25.8M + Wykrywanie Podwójnych Rozszerzeń + Strażnik Jądra Systemu).',
              'Wieszka scanner uses a 4-layer scanning technology (Wieszka AI + 25.8M Cloud Signatures + Double Extension Detection + Kernel Guard).'
            )}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mt-3 pt-3 border-t border-slate-800/80">
            <div className="flex items-center space-x-2 text-slate-300 font-mono text-xs">
              <span className="text-slate-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {t(currentLang, 'thisPc')}:
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded font-bold text-[11px]">
                {scannedDrives && scannedDrives.length > 0
                  ? `${scannedDrives.map((d) => (d.endsWith('\\') ? d : `${d}\\`)).join(', ')}, .EXE, .DLL`
                  : `C:\\, .EXE, .DLL`}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-xl">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>
                Heuristic AI Max: Files ≤50 GB (SHA-256 Cloud)
              </span>
            </div>
          </div>
        </div>

        {/* Hidden File Input for uploading REAL files from user's hard drive */}
        <input
          type="file"
          ref={nativeFileInputRef}
          onChange={handleNativeFileUpload}
          multiple
          className="hidden"
        />
        {/* Hidden Folder Input for uploading REAL folders from user's hard drive */}
        <input
          type="file"
          ref={nativeFolderInputRef}
          onChange={handleNativeFolderUpload}
          multiple
          className="hidden"
        />

        {/* Scan Type Selection Buttons */}
        <div className="flex flex-wrap items-center gap-2 bg-[#1A1A21] p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setSelectedScanType('full')}
            disabled={scanProgress.isActive}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedScanType === 'full'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t(currentLang, 'fullSystemScan')}
          </button>
          <button
            onClick={() => setSelectedScanType('quick')}
            disabled={scanProgress.isActive}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedScanType === 'quick'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t(currentLang, 'quickScan')}
          </button>
          <button
            onClick={() => handleRequestAccessAndScan(selectedScanType)}
            disabled={scanProgress.isActive || isReadingFolder}
            className="px-4 py-2 rounded-xl text-xs font-bold transition bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border border-blue-500/40 flex items-center gap-1.5 shadow-sm shadow-blue-900/30 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
            <span>
              {isReadingFolder
                ? getText(currentLang, '🔍 Wykrywanie plików...', '🔍 Detecting files...')
                : getText(currentLang, 'Skanuj', 'Scan')}
            </span>
          </button>
          <button
            onClick={() => setShowHelpModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5"
            title={getText(currentLang, 'Jak działa dostęp do plików i skanowanie komputera?', 'How does file access and PC scanning work?')}
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>{getText(currentLang, 'Pomoc: Dostęp do plików', 'Help: File Access')}</span>
          </button>
        </div>
      </div>

      {/* Main Active Scan Section */}
      {scanProgress.isActive || scanProgress.isCompleted ? (
        <div className="space-y-6">
          {/* Scanning Progress Console Card */}
          <div className="bg-[#121217] p-6 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  scanProgress.isCompleted
                    ? 'bg-emerald-400'
                    : scanProgress.isPaused
                    ? 'bg-amber-400'
                    : 'bg-indigo-400 animate-ping'
                }`} />
                <div>
                  <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                    {scanProgress.isCompleted
                      ? getText(currentLang, 'SKANOWANIE ZAKOŃCZONE!', 'SCAN COMPLETED!')
                      : scanProgress.isPaused
                      ? getText(currentLang, 'SKANOWANIE WSTRZYMANE', 'SCAN PAUSED')
                      : getText(currentLang, 'SKANOWANIE W TOKU (BARDZO DOKŁADNE)...', 'THOROUGH SCANNING IN PROGRESS...')}
                  </h3>
                  <p className="text-xs text-indigo-400 font-mono mt-0.5">
                    Phase: <strong className="text-slate-200">{scanProgress.currentPhase}</strong>
                  </p>
                </div>
              </div>

              {/* Scan Control Action Buttons */}
              <div className="flex items-center space-x-2">
                {!scanProgress.isCompleted && (
                  <>
                    {scanProgress.isPaused ? (
                      <button
                        onClick={onResumeScan}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center space-x-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{t(currentLang, 'active')}</span>
                      </button>
                    ) : (
                      <button
                        onClick={onPauseScan}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center space-x-1.5"
                      >
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>{t(currentLang, 'cancel')}</span>
                      </button>
                    )}
                    <button
                      onClick={onStopScan}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1A1A21] hover:bg-rose-500/20 text-rose-400 border border-slate-800 transition"
                    >
                      {t(currentLang, 'cancel')}
                    </button>
                  </>
                )}

                {scanProgress.isCompleted && (
                  <button
                    onClick={() => onStartScan(selectedScanType)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center space-x-1.5 shadow-lg shadow-indigo-900/30"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t(currentLang, 'startScan')}</span>
                  </button>
                )}
              </div>
            </div>


            {/* Live Sonar Radar Visualizer & Real-Time Scanning HUD (No fake percentage bar) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              {/* Live Animated Radar Sonar Visualizer */}
              <div className="flex flex-col items-center justify-center p-4 bg-[#16161D]/80 rounded-2xl border border-slate-800">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  {/* Concentric Radar Circles */}
                  <div className="absolute inset-0 rounded-full border border-indigo-500/20" />
                  <div className="absolute inset-3 rounded-full border border-indigo-500/30" />
                  <div className="absolute inset-7 rounded-full border border-indigo-500/40" />
                  <div className="absolute inset-12 rounded-full border border-indigo-500/50" />
                  {/* Radar Crosshairs */}
                  <div className="absolute inset-x-0 top-1/2 h-[1px] bg-indigo-500/30" />
                  <div className="absolute inset-y-0 left-1/2 w-[1px] bg-indigo-500/30" />
                  
                  {/* Rotating Sonar Scan Beam */}
                  {scanProgress.isActive && !scanProgress.isPaused && (
                    <div className="absolute inset-0 rounded-full overflow-hidden animate-[spin_2.5s_linear_infinite]">
                      <div className="w-1/2 h-1/2 bg-gradient-to-br from-indigo-500/50 via-indigo-500/10 to-transparent transform origin-bottom-right" />
                    </div>
                  )}

                  {/* Center Radar Node */}
                  <div className="relative z-10 w-12 h-12 rounded-full bg-slate-950 border border-indigo-500/60 flex flex-col items-center justify-center shadow-lg shadow-indigo-950/60">
                    {scanProgress.isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : scanProgress.isPaused ? (
                      <Pause className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
                    )}
                  </div>
                </div>

                <div className="text-center mt-3 space-y-0.5">
                  <div className="text-xs font-bold font-mono text-white flex items-center justify-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      scanProgress.isCompleted
                        ? 'bg-emerald-400'
                        : scanProgress.isPaused
                        ? 'bg-amber-400'
                        : 'bg-emerald-400 animate-ping'
                    }`} />
                    <span>
                      {scanProgress.isCompleted
                        ? getText(currentLang, 'SKAN UKOŃCZONY', 'SCAN COMPLETE')
                        : scanProgress.isPaused
                        ? getText(currentLang, 'WSTRZYMANO', 'PAUSED')
                        : getText(currentLang, 'SKANOWANIE NA ŻYWO', 'LIVE SCANNING')}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {getText(currentLang, 'Wszystkie pliki + ukryte foldery', 'All files + hidden folders')}
                  </p>
                </div>
              </div>

              {/* Real-time Telemetry & File Statistics Grid */}
              <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-[#1A1A21] p-3.5 rounded-2xl border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">{t(currentLang, 'scannedFiles')}</span>
                    <FolderSearch className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <p className="text-xl font-bold text-white font-mono mt-1">
                    {scanProgress.scannedFilesCount.toLocaleString()}
                  </p>
                </div>

                <div className="bg-[#1A1A21] p-3.5 rounded-2xl border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">{getText(currentLang, 'Pliki ukryte i systemowe', 'Hidden & System Files')}</span>
                    <Eye className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <p className="text-xl font-bold text-purple-300 font-mono mt-1">
                    {(scanProgress.hiddenFilesCount ?? 0).toLocaleString()}
                  </p>
                </div>

                <div className="bg-[#1A1A21] p-3.5 rounded-2xl border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">{getText(currentLang, 'Prędkość skanowania', 'Scan Speed')}</span>
                    <Gauge className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <p className="text-xl font-bold text-blue-300 font-mono mt-1">
                    {scanProgress.scanDurationSeconds > 0
                      ? `${Math.round(scanProgress.scannedFilesCount / scanProgress.scanDurationSeconds)} plik/s`
                      : 'Aktywna'}
                  </p>
                </div>

                <div className="bg-[#1A1A21] p-3.5 rounded-2xl border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">{t(currentLang, 'detectedThreats')}</span>
                    <ShieldAlert className={`w-3.5 h-3.5 ${scanProgress.threatsFoundCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
                  </div>
                  <p className={`text-xl font-bold font-mono mt-1 ${
                    scanProgress.threatsFoundCount > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {scanProgress.threatsFoundCount}
                  </p>
                </div>

                <div className="bg-[#1A1A21] p-3.5 rounded-2xl border border-slate-800/80">
                  <span className="text-[11px] text-slate-400">{t(currentLang, 'elapsedTime')}</span>
                  <p className="text-xl font-bold text-white font-mono mt-1">
                    {scanProgress.scanDurationSeconds}s
                  </p>
                </div>

                <div className="bg-[#1A1A21] p-3.5 rounded-2xl border border-slate-800/80">
                  <span className="text-[11px] text-slate-400">{getText(currentLang, 'Silnik Heurystyczny', 'Heuristic Engine')}</span>
                  <p className="text-xs font-bold text-emerald-400 font-mono mt-1">
                    Wieszka AI (v4.8)
                  </p>
                </div>

                {/* Current Active File Path */}
                <div className="bg-[#1A1A21] p-3.5 rounded-2xl border border-slate-800/80 col-span-2 sm:col-span-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono text-slate-400 font-bold flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                      {t(currentLang, 'scanningFile')}
                    </span>
                    {(() => {
                      if (!scanProgress.currentFilePath) return null;
                      const fileName = scanProgress.currentFilePath.split(/[\/\\]/).pop() || '';
                      const lowerPath = scanProgress.currentFilePath.toLowerCase();
                      const isHidden = fileName.startsWith('.') || fileName.startsWith('~$') || lowerPath.includes('appdata') || lowerPath.includes('$recycle.bin') || lowerPath.includes('system volume information');
                      if (!isHidden) return null;
                      return (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono flex items-center gap-1">
                          <Eye className="w-3 h-3 text-purple-400" />
                          {getText(currentLang, 'Plik Ukryty / Systemowy', 'Hidden / System File')}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="flex items-center space-x-2 mt-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping shrink-0" />
                    <p className="text-xs font-mono font-bold text-indigo-300 truncate tracking-wide" title={scanProgress.currentFilePath}>
                      {scanProgress.currentFilePath || 'Inicjalizacja skanera...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Scanner Terminal Console Output */}
            <div className="bg-[#1A1A21] p-4 rounded-2xl border border-slate-800 font-mono text-[11px] space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400 flex items-center gap-1.5 text-[10px]">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  Wieszka Scanner Log
                </span>
                <span className="text-slate-600 text-[10px]">{(scanProgress?.logs || []).length}</span>
              </div>

              <div className="h-32 overflow-y-auto space-y-1 scrollbar-thin text-slate-300">
                {(scanProgress?.logs || []).map((log, index) => (
                  <div key={index} className={`leading-relaxed ${
                    log.includes('WYKRYTO ZAGROŻENIE') || log.includes('THREAT DETECTED') ? 'text-rose-400 font-bold bg-rose-950/30 p-0.5 rounded' :
                    log.includes('BEZPIECZNY') || log.includes('SAFE') ? 'text-emerald-400' :
                    log.includes('AI') ? 'text-purple-300' : 'text-slate-400'
                  }`}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detected Threats List Section */}
          <div className="bg-[#121217] p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <span>{t(currentLang, 'detectedThreats')} ({(scanProgress?.detectedThreats || []).length})</span>
                </h3>
              </div>

              {(scanProgress?.detectedThreats || []).length > 0 && (
                <button
                  onClick={onQuarantineAll}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/20 transition flex items-center space-x-1.5"
                >
                  <Biohazard className="w-4 h-4 text-white" />
                  <span>{t(currentLang, 'moveAllQuarantine')}</span>
                </button>
              )}
            </div>

            {(scanProgress?.detectedThreats || []).length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto opacity-80" />
                <p className="text-sm font-semibold text-slate-200">
                  {scanProgress?.isCompleted
                    ? t(currentLang, 'noThreatsFound')
                    : 'Scanning in progress...'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {(scanProgress?.detectedThreats || []).map((threat) => (
                  <div
                    key={threat.id}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-rose-500/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 hover:border-rose-500/60 transition"
                  >
                    <div className="space-y-1 max-w-xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 border border-rose-500/40 text-rose-400">
                          {threat.threatName}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 border border-amber-500/30 text-amber-300">
                          {threat.threatType}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                          Score: {threat.riskScore}/100
                        </span>
                      </div>

                      <p className="text-xs font-mono font-bold text-slate-200 truncate" title={threat.filePath}>
                        {threat.filePath}
                      </p>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        {threat.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() => onAnalyzeWithAi(threat)}
                        className="px-3 py-2 rounded-xl text-xs font-semibold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 transition flex items-center space-x-1"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>AI Analysis</span>
                      </button>

                      <button
                        onClick={() => onQuarantineThreat(threat.id)}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center space-x-1"
                      >
                        <Biohazard className="w-3.5 h-3.5" />
                        <span>{t(currentLang, 'moveAllQuarantine')}</span>
                      </button>

                      <button
                        onClick={() => onDeleteThreat(threat.id)}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Scan Launcher Start Screen */
        <div className="space-y-6">
          {/* Main Scanner Launcher with Drag & Drop */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`p-8 rounded-3xl border transition text-center space-y-6 relative overflow-hidden ${
              isDragging
                ? 'bg-emerald-950/40 border-2 border-dashed border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.25)]'
                : 'bg-[#121217] border-slate-800'
            }`}
          >
            {isDragging && (
              <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 space-y-3">
                <Upload className="w-16 h-16 text-emerald-400 animate-bounce" />
                <h3 className="text-xl font-bold text-white">
                  {getText(currentLang, 'Upuść pliki lub foldery tutaj!', 'Drop files or folders here!')}
                </h3>
                <p className="text-sm text-emerald-200">
                  {getText(currentLang, 'Bezpieczny skan bez ograniczeń pamięci (obsługuje pliki > 1 GB)', 'Safe scan with memory protection (handles files > 1 GB)')}
                </p>
              </div>
            )}

            <div className="w-20 h-20 rounded-full bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
              <Search className="w-10 h-10" />
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                <span>{t(currentLang, 'thoroughScan')}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold uppercase">
                  {getText(currentLang, 'Silnik 100% Prawdziwych Plików', '100% Real File Engine')}
                </span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {getText(
                  currentLang,
                  'Skanuj rzeczywiste pliki i foldery ze swojego komputera (C:\\, Pobrane, Pulpit). Zero sztucznych plików. Pełna ochrona pamięci RAM przy analizie plików o rozmiarze powyżej 1 GB.',
                  'Scan real files and folders from your PC (C:\\, Downloads, Desktop). Zero artificial files. Full RAM protection for files exceeding 1 GB.'
                )}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => handleRequestAccessAndScan(selectedScanType)}
                disabled={isReadingFolder}
                className="w-full max-w-xl py-4 px-6 rounded-2xl font-bold text-sm sm:text-base bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-950/60 transition flex items-center justify-center space-x-3 transform hover:scale-[1.02] active:scale-[0.98] border border-indigo-400/30 cursor-pointer"
              >
                <ShieldCheck className="w-6 h-6 text-emerald-300 shrink-0" />
                <div className="text-left">
                  <div className="font-extrabold leading-tight flex items-center gap-2">
                    <span>
                      {isReadingFolder
                        ? getText(currentLang, '🔍 Wykrywanie struktury plików na komputerze...', '🔍 Detecting computer file structure...')
                        : getText(currentLang, 'Skanuj Komputer (w tym ukryte pliki)', 'Scan PC (Including Hidden Files)')}
                    </span>
                  </div>
                  <div className="text-[11px] text-indigo-200 font-normal mt-0.5">
                    {getText(
                      currentLang,
                      'Przeszukuje wszystkie katalogi, pliki z kropką (.env, .ssh), podfoldery AppData i pliki systemowe bez sztucznych ograniczeń.',
                      'Scans all directories, dotfiles (.env, .ssh), AppData subfolders, and system files without artificial limits.'
                    )}
                  </div>
                </div>
              </button>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => nativeFolderInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition inline-flex items-center space-x-2 cursor-pointer"
                >
                  <FolderOpen className="w-4 h-4 text-amber-400" />
                  <span>{getText(currentLang, '📁 Wybierz Folder z Komputera', '📁 Choose Folder from PC')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => nativeFileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition inline-flex items-center space-x-2 cursor-pointer"
                >
                  <FileCode className="w-4 h-4 text-blue-400" />
                  <span>{getText(currentLang, '📄 Wybierz Pliki do Skanu', '📄 Choose Files to Scan')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedScanType('quick');
                    handleRequestAccessAndScan('quick');
                  }}
                  disabled={isReadingFolder}
                  className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition inline-flex items-center space-x-2"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{getText(currentLang, '⚡ Szybki Skan', '⚡ Quick Scan')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowHelpModal(true)}
                  className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition inline-flex items-center space-x-2"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{getText(currentLang, 'Jak działa autoryzacja dostępu?', 'How does file access work?')}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 max-w-xl mx-auto text-left text-xs text-slate-300 flex items-start gap-2.5">
                <Eye className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  <strong className="text-purple-300">{getText(currentLang, 'Wykrywanie i analiza plików ukrytych: ', 'Hidden files detection & analysis: ')}</strong>
                  {getText(
                    currentLang,
                    'Silnik skanuje każdy plik fizyczny bez pomijania plików konfiguracyjnych (.env, .git, .ssh), folderów aplikacji (AppData), ukrytych skryptów VBS/PS1 i archiwów zip. Brak sztucznego paska 99% — licznik wskazuje faktycznie zbadaną liczbę plików na żywo.',
                    'The engine scans every physical file without skipping config files (.env, .git, .ssh), AppData folders, hidden VBS/PS1 scripts, and zip archives. No artificial 99% progress bar — the live counter reflects real inspected file count.'
                  )}
                </p>
              </div>
            </div>

            {/* Drag and drop hint footer */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Laptop className="w-4 h-4 text-indigo-400" />
                {getText(currentLang, 'Możesz przeciągnąć pliki lub folder bezpośrednio tutaj!', 'You can drag & drop files or folders directly here!')}
              </span>
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="text-indigo-400 hover:text-indigo-300 underline font-medium flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{getText(currentLang, 'Jak skanować cały dysk C:\\?', 'How to scan entire C:\\ drive?')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal: Jak skanować Twój komputer bez sztucznych plików */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16161D] border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Laptop className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {getText(currentLang, 'Jak skanować Twój prawdziwy komputer w Wieszka AI?', 'How to scan your real PC with Wieszka AI?')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {getText(currentLang, 'Odpowiedź na pytanie: co zrobić, aby skaner skanował fizyczny dysk bez sztucznych plików', 'Guide: scanning physical drives without simulated files')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-2">
                <h4 className="font-bold text-indigo-300 flex items-center gap-2 text-sm">
                  <span>1. Bezpośredni dostęp do folderu lub dysku (Zalecane — 1 kliknięcie)</span>
                </h4>
                <p>
                  {getText(
                    currentLang,
                    'Kliknij przycisk "Skanuj Prawdziwy Folder / Dysk z Komputera" lub "Wybierz Folder / Dysk". Nowoczesna przeglądarka zapyta Cię o zgodę na odczyt folderu (np. folderu Pobrane, Pulpit, lub całego dysku C:\\). Skaner odczyta 100% prawdziwe pliki z Twojego dysku bez żadnych sztucznych danych.',
                    'Click "Scan Real Folder / Drive from PC". Your browser will request read permission for the selected folder (Downloads, Desktop, or entire drive). The scanner will inspect 100% real files with zero mock data.'
                  )}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
                <h4 className="font-bold text-emerald-300 flex items-center gap-2 text-sm">
                  <span>2. Przeciągnij i Upuść (Dowolne pliki, w tym pliki {'>'} 1 GB)</span>
                </h4>
                <p>
                  {getText(
                    currentLang,
                    'Możesz po prostu przeciągnąć dowolny plik lub katalog z Eksploratora Windows prosto do okna antywirusa. Zaimplementowano strumieniową inspekcję nagłówków bez ładowania całego pliku do RAM, dzięki czemu pliki 1 GB, 5 GB czy 10 GB nie ścinają ani nie zamrażają aplikacji!',
                    'You can drag and drop any file or folder directly into the window. Chunked streaming header inspection is used without allocating gigabytes of RAM, so 1 GB, 5 GB or 10 GB files will never freeze the browser!'
                  )}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-2">
                <h4 className="font-bold text-slate-200 flex items-center gap-2 text-sm">
                  <span>3. Taktyka Kaspersky & Malwarebytes (Agent PowerShell C:\)</span>
                </h4>
                <p>
                  {getText(
                    currentLang,
                    'Przeglądarki Chromium (Chrome/Edge) blokują bezpośredni wybór C:\\ ze względów bezpieczeństwa. Aby przeskanować całe C:\\ wraz z C:\\Windows i plikami systemowymi (dokładnie tak jak robi to Kaspersky Online Scanner lub Malwarebytes), uruchom 1 linijkę w Windows PowerShell lub pobierz plik .BAT. Agent na Twoim komputerze skanuje cały dysk C:\\ z uprawnieniami administratora i wysyła strumień na żywo do tej aplikacji!',
                    'Chromium browsers block direct C:\\ access for safety. To scan entire C:\\ including C:\\Windows and system files (identically to Kaspersky Online Scanner or Malwarebytes), run 1 command in Windows PowerShell or launch the .BAT file. The local agent scans your drive with administrator rights and streams results live to this app!'
                  )}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowHelpModal(false);
                  handleRequestAccessAndScan(selectedScanType);
                }}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition"
              >
                {getText(currentLang, 'Rozumiem, poproś o dostęp i skanuj komputer', 'Got it, request access & scan PC')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
