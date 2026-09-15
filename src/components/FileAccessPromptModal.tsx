import React, { useRef, useState } from 'react';
import {
  ShieldCheck,
  FolderOpen,
  HardDrive,
  Plus,
  Play,
  X,
  Trash2,
  CheckCircle2,
  FolderPlus
} from 'lucide-react';
import { LanguageCode, getText } from '../i18n';
import { FileItem, ScanType } from '../types';
import { convertFilesToFileItems } from '../utils/fileScannerUtils';

export interface SelectedFolderEntry {
  id: string;
  name: string;
  handle?: any;
  files?: FileItem[];
  fileCount?: number;
}

interface FileAccessPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesSelected: (files: FileItem[], scanType: ScanType) => void;
  onStartNativeDrivePicker: (scanType: ScanType, dirHandles?: any[]) => void;
  currentLang?: LanguageCode;
  defaultScanType?: ScanType;
}

export const FileAccessPromptModal: React.FC<FileAccessPromptModalProps> = ({
  isOpen,
  onClose,
  onFilesSelected,
  onStartNativeDrivePicker,
  currentLang = 'pl',
  defaultScanType = 'full',
}) => {
  const [selectedFolders, setSelectedFolders] = useState<SelectedFolderEntry[]>([]);
  const [isPicking, setIsPicking] = useState<boolean>(false);
  const folderInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Direct trigger of browser directory picker (File System Access API or fallback input)
  const triggerDirectoryPicker = async () => {
    setIsPicking(true);
    if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
      try {
        const handle = await (window as any).showDirectoryPicker({
          mode: 'read',
        });
        if (handle) {
          const newEntry: SelectedFolderEntry = {
            id: `folder-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: handle.name || 'Dysk / Folder',
            handle,
          };
          setSelectedFolders((prev) => [...prev, newEntry]);
        }
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          // If native picker fails with permission/security, fallback to folder input
          folderInputRef.current?.click();
        }
      } finally {
        setIsPicking(false);
      }
    } else {
      setIsPicking(false);
      folderInputRef.current?.click();
    }
  };

  const handleFolderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (list && list.length > 0) {
      const converted = convertFilesToFileItems(list);
      const folderName = list[0].webkitRelativePath
        ? list[0].webkitRelativePath.split('/')[0]
        : 'Folder komputera';
      const newEntry: SelectedFolderEntry = {
        id: `folder-input-${Date.now()}`,
        name: folderName,
        files: converted,
        fileCount: converted.length,
      };
      setSelectedFolders((prev) => [...prev, newEntry]);
    }
    // reset input so same folder can be picked again if desired
    e.target.value = '';
  };

  const handleRemoveFolder = (id: string) => {
    setSelectedFolders((prev) => prev.filter((f) => f.id !== id));
  };

  const handleStartFinalScan = () => {
    if (selectedFolders.length === 0) {
      triggerDirectoryPicker();
      return;
    }

    const handles = selectedFolders.filter((f) => f.handle).map((f) => f.handle);
    const customFiles = selectedFolders
      .filter((f) => f.files && f.files.length > 0)
      .flatMap((f) => f.files || []);

    onClose();
    // Reset selection for next time
    setSelectedFolders([]);

    if (handles.length > 0) {
      onStartNativeDrivePicker(defaultScanType, handles);
    } else if (customFiles.length > 0) {
      onFilesSelected(customFiles, defaultScanType);
    } else {
      onStartNativeDrivePicker(defaultScanType);
    }
  };

  const hasSelectedFolders = selectedFolders.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-[#121217] border border-slate-700/80 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100 relative transition-all">
        {/* Hidden native input element for folder selection fallback */}
        <input
          type="file"
          ref={folderInputRef}
          onChange={handleFolderInputChange}
          // @ts-ignore
          webkitdirectory=""
          directory=""
          multiple
          className="hidden"
        />

        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 shadow-lg shadow-indigo-950/40">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {getText(currentLang, 'Skanowanie Komputera', 'Computer Scan')}
                </h3>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  BEZPOŚREDNI DOSTĘP
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {getText(
                  currentLang,
                  'Wybierz dysk lub folder do przeskanowania przez Wieszka AI.',
                  'Select drive or folder to scan with Wieszka AI.'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedFolders([]);
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View 1: When no folder selected yet -> ONLY Direct Drive Selection Button */}
        {!hasSelectedFolders && (
          <div className="space-y-4 py-2">
            <button
              type="button"
              onClick={triggerDirectoryPicker}
              disabled={isPicking}
              className="w-full p-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 hover:from-indigo-500 hover:via-purple-500 hover:to-emerald-500 text-white font-bold transition-all shadow-xl shadow-indigo-950/50 flex items-center justify-between group cursor-pointer border border-indigo-400/40 hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 text-white border border-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <HardDrive className="w-6 h-6 text-emerald-300" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-base sm:text-lg text-white group-hover:text-emerald-200 transition">
                    {getText(currentLang, 'Bezpośrednie wybranie dysku / folderu', 'Direct Drive / Folder Selection')}
                  </h4>
                  <p className="text-xs text-indigo-100 font-normal mt-0.5">
                    {getText(
                      currentLang,
                      'Otwiera okno wyboru folderu lub dysku (File System API)',
                      'Opens folder or drive picker dialog (File System API)'
                    )}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold bg-white/20 border border-white/30 px-3 py-1.5 rounded-xl hidden sm:inline-block text-white">
                {getText(currentLang, 'Wybierz →', 'Select →')}
              </span>
            </button>
          </div>
        )}

        {/* View 2: When 1 or more folders are selected -> Ask if user wants to select another folder */}
        {hasSelectedFolders && (
          <div className="space-y-5 animate-fade-in">
            {/* List of currently selected folders */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    {getText(currentLang, 'Wybrane foldery do skanowania:', 'Selected folders to scan:')} ({selectedFolders.length})
                  </span>
                </label>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedFolders.map((folder, idx) => (
                  <div
                    key={folder.id}
                    className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="font-semibold text-white truncate">
                        {folder.name}
                      </span>
                      {folder.fileCount ? (
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full shrink-0">
                          {folder.fileCount} {getText(currentLang, 'plików', 'files')}
                        </span>
                      ) : null}
                    </div>
                    <button
                      onClick={() => handleRemoveFolder(folder.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800 transition shrink-0"
                      title={getText(currentLang, 'Usuń folder', 'Remove folder')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirmation Question: "Czy chcesz wybrać jeszcze jakiś folder?" */}
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-center space-y-3">
              <h4 className="text-sm font-bold text-white">
                {getText(
                  currentLang,
                  'Czy chcesz wybrać jeszcze jakiś folder?',
                  'Do you want to select another folder?'
                )}
              </h4>
              <p className="text-xs text-indigo-200/80">
                {getText(
                  currentLang,
                  'Możesz dodać kolejny folder lub dysk, albo od razu rozpocząć skanowanie.',
                  'You can add another folder or drive, or start scanning now.'
                )}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Button 1: Add another folder */}
                <button
                  type="button"
                  onClick={triggerDirectoryPicker}
                  disabled={isPicking}
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:border-indigo-400"
                >
                  <FolderPlus className="w-4 h-4 text-amber-400" />
                  <span>{getText(currentLang, '➕ Wybierz kolejny folder', '➕ Select another folder')}</span>
                </button>

                {/* Button 2: No, start scanning */}
                <button
                  type="button"
                  onClick={handleStartFinalScan}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Play className="w-4 h-4 text-emerald-200 fill-current" />
                  <span>
                    {getText(
                      currentLang,
                      `🚀 Nie, skanuj (${selectedFolders.length})`,
                      `🚀 No, start scan (${selectedFolders.length})`
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
