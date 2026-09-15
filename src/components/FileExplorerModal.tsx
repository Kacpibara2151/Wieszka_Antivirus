import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Folder,
  File,
  HardDrive,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  RotateCw,
  Search,
  CheckSquare,
  Square,
  ShieldAlert,
  ShieldCheck,
  X,
  FileCode,
  FileText,
  FileArchive,
  FileCheck,
  Usb,
  FolderOpen,
  Plus,
  Trash2,
  Upload
} from 'lucide-react';
import { FileItem } from '../types';
import { INITIAL_MOCK_FILES } from '../data/mockFilesystem';
import { getText } from '../i18n';
import { scanRealDirectoryHandle } from '../utils/fileScannerUtils';

export interface DriveConfig {
  id: string;
  path: string;
  label: string;
  totalGb: number;
  freeGb: number;
  system?: boolean;
  bitlocker?: boolean;
  usb?: boolean;
}

const DEFAULT_USER_DRIVES: DriveConfig[] = [
  { id: 'C:', path: 'C:\\', label: 'System OS (C:)', totalGb: 512, freeGb: 184, system: true, bitlocker: true },
];

interface FileExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCustomScan: (selectedFiles: FileItem[]) => void;
  currentLang: string;
  initialSelectedIds?: string[];
  initialPath?: string;
  selectedDrives?: string[];
  onToggleDrive?: (driveId: string) => void;
}

// Tree node definition for directory browsing
interface FolderNode {
  name: string;
  fullPath: string;
  driveId: string;
  children: FolderNode[];
}

export const FileExplorerModal: React.FC<FileExplorerModalProps> = ({
  isOpen,
  onClose,
  onStartCustomScan,
  currentLang,
  initialSelectedIds = [],
  initialPath = 'Ten Komputer',
  selectedDrives = ['C:', 'D:'],
  onToggleDrive,
}) => {
  const realFileInputRef = useRef<HTMLInputElement>(null);
  const realFolderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (realFolderInputRef.current) {
      realFolderInputRef.current.setAttribute('webkitdirectory', '');
      realFolderInputRef.current.setAttribute('directory', '');
    }
  }, []);

  // Dynamic Drives list configured by user
  const [userDrives, setUserDrives] = useState<DriveConfig[]>(() => {
    try {
      const saved = localStorage.getItem('wieszka_user_drives_v3');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_USER_DRIVES;
  });

  const saveUserDrives = (newList: DriveConfig[]) => {
    setUserDrives(newList);
    try {
      localStorage.setItem('wieszka_user_drives_v3', JSON.stringify(newList));
    } catch (e) {}
  };

  // Real local files uploaded from user's computer disk
  const [realUploadedFiles, setRealUploadedFiles] = useState<FileItem[]>([]);

  // Add real files from PC via input file chooser
  const handleRealFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;

    const newFiles: FileItem[] = Array.from(filesList).map((f: File, idx: number) => {
      const ext = f.name.split('.').pop()?.toUpperCase() || 'FILE';
      let cat: FileItem['category'] = 'Document';
      if (['EXE', 'MSI', 'BAT', 'CMD', 'COM'].includes(ext)) cat = 'Executable';
      else if (['JS', 'PY', 'PS1', 'SH', 'VBS'].includes(ext)) cat = 'Script';
      else if (['ZIP', 'RAR', '7Z', 'TAR', 'GZ', 'ISO'].includes(ext)) cat = 'Archive';
      else if (['DLL', 'SYS', 'DRV'].includes(ext)) cat = 'System';

      return {
        id: `real-file-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        name: f.name,
        path: `C:\\Użytkownik\\PlikiPrawdziwe\\${f.name}`,
        sizeKb: Math.max(1, Math.round(f.size / 1024)),
        type: ext,
        category: cat,
        hash: `sha256-real-${f.size.toString(16)}-${Date.now().toString(16)}`,
        lastModified: new Date(f.lastModified).toISOString().split('T')[0],
        originalFile: f,
        isRealUserFile: true,
      };
    });

    setRealUploadedFiles((prev) => [...prev, ...newFiles]);
    setSelectedFileIds((prev) => [...prev, ...newFiles.map((nf) => nf.id)]);
    setDrivePromptMsg(
      getText(
        currentLang,
        `Załadowano ${newFiles.length} prawdziwych plików z dysku komputera do skanera!`,
        `Loaded ${newFiles.length} real files from your PC into scanner!`
      )
    );
  };

  // Add entire folder from PC via directory input chooser
  const handleRealFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;

    const newFiles: FileItem[] = Array.from(filesList).map((f: File, idx: number) => {
      const ext = f.name.split('.').pop()?.toUpperCase() || 'FILE';
      let cat: FileItem['category'] = 'Document';
      if (['EXE', 'MSI', 'BAT', 'CMD', 'COM'].includes(ext)) cat = 'Executable';
      else if (['JS', 'PY', 'PS1', 'SH', 'VBS'].includes(ext)) cat = 'Script';
      else if (['ZIP', 'RAR', '7Z', 'TAR', 'GZ', 'ISO'].includes(ext)) cat = 'Archive';
      else if (['DLL', 'SYS', 'DRV'].includes(ext)) cat = 'System';

      const relPath = (f as any).webkitRelativePath || f.name;

      return {
        id: `real-folder-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        name: f.name,
        path: `C:\\${relPath.replace(/\//g, '\\')}`,
        sizeKb: Math.max(1, Math.round(f.size / 1024)),
        type: ext,
        category: cat,
        hash: `sha256-real-${f.size.toString(16)}-${Date.now().toString(16)}`,
        lastModified: new Date(f.lastModified).toISOString().split('T')[0],
        originalFile: f,
        isRealUserFile: true,
      };
    });

    setRealUploadedFiles((prev) => [...prev, ...newFiles]);
    setSelectedFileIds((prev) => [...prev, ...newFiles.map((nf) => nf.id)]);
    setDrivePromptMsg(
      getText(
        currentLang,
        `Załadowano ${newFiles.length} prawdziwych plików z folderu dysku komputera!`,
        `Loaded ${newFiles.length} real files from folder into scanner!`
      )
    );
  };

  // Direct native OS directory picker via modern File System Access API
  const handleDirectFolderPick = async () => {
    try {
      if ('showDirectoryPicker' in window) {
        setDrivePromptMsg(getText(currentLang, 'Wybieranie folderu z komputera...', 'Selecting folder from PC...'));
        const dirHandle = await (window as any).showDirectoryPicker({ mode: 'read' });
        const items = await scanRealDirectoryHandle(dirHandle, undefined, 2000);
        if (items.length > 0) {
          setRealUploadedFiles((prev) => [...prev, ...items]);
          setSelectedFileIds((prev) => [...prev, ...items.map((it) => it.id)]);
          setDrivePromptMsg(
            getText(
              currentLang,
              `Pomyślnie załadowano ${items.length} prawdziwych plików z dysku (${dirHandle.name})!`,
              `Successfully loaded ${items.length} real files from disk (${dirHandle.name})!`
            )
          );
        }
      } else {
        realFolderInputRef.current?.click();
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        realFolderInputRef.current?.click();
      }
    }
  };

  // Combined files list
  const allFiles = useMemo(() => {
    return [...INITIAL_MOCK_FILES, ...realUploadedFiles];
  }, [realUploadedFiles]);

  // Selected file IDs
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>(
    initialSelectedIds.length > 0
      ? initialSelectedIds
      : allFiles.map((f) => f.id)
  );

  // Current directory path in Explorer
  const [currentPath, setCurrentPath] = useState<string>(initialPath);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [drivePromptMsg, setDrivePromptMsg] = useState<string | null>(null);

  // Modal for adding custom drive letter
  const [showAddDrive, setShowAddDrive] = useState(false);
  const [addDriveLetter, setAddDriveLetter] = useState('E:');
  const [addDriveLabel, setAddDriveLabel] = useState('Dane & Dokumenty');

  const handleAddDriveConfirm = () => {
    const letter = addDriveLetter.toUpperCase().replace(/[^A-Z:]/g, '');
    const driveId = letter.endsWith(':') ? letter : `${letter}:`;
    if (userDrives.some((d) => d.id === driveId)) {
      setDrivePromptMsg(
        getText(currentLang, `Dysk ${driveId} już istnieje na liście!`, `Drive ${driveId} already exists!`)
      );
      return;
    }
    const newDrive: DriveConfig = {
      id: driveId,
      path: `${driveId}\\`,
      label: `${addDriveLabel} (${driveId})`,
      totalGb: 500,
      freeGb: 320,
      usb: driveId !== 'E:' && driveId !== 'D:',
    };
    const updated = [...userDrives, newDrive];
    saveUserDrives(updated);
    if (onToggleDrive && !selectedDrives.includes(driveId)) {
      onToggleDrive(driveId);
    }
    setShowAddDrive(false);
    setDrivePromptMsg(getText(currentLang, `Dodano dysk ${driveId}!`, `Added drive ${driveId}!`));
  };

  const handleRemoveDrive = (driveId: string) => {
    if (userDrives.length <= 1) {
      alert(getText(currentLang, 'Musisz zachować co najmniej 1 dysk (np. C:).', 'Keep at least 1 drive.'));
      return;
    }
    const updated = userDrives.filter((d) => d.id !== driveId);
    saveUserDrives(updated);
    if (selectedDrives.includes(driveId) && onToggleDrive) {
      onToggleDrive(driveId);
    }
    setDrivePromptMsg(getText(currentLang, `Usunięto dysk ${driveId} z listy.`, `Removed drive ${driveId}.`));
  };

  // Path history for back / forward navigation
  const [pathHistory, setPathHistory] = useState<string[]>([initialPath]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Always reset to initialPath ('Ten Komputer' by default) when modal is opened
  useEffect(() => {
    if (isOpen) {
      const target = initialPath || 'Ten Komputer';
      setCurrentPath(target);
      setPathHistory([target]);
      setHistoryIndex(0);
      setDrivePromptMsg(null);
    }
  }, [isOpen, initialPath]);

  // Synchronize selected files based on selected drives
  useEffect(() => {
    if (selectedDrives && selectedDrives.length > 0) {
      const driveFiles = allFiles.filter((f) =>
        selectedDrives.some((d) => f.path.startsWith(d))
      );
      setSelectedFileIds(driveFiles.map((f) => f.id));
    }
  }, [selectedDrives, allFiles]);

  // Expanded folders in the left tree
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'C:': true,
    'C:\\Users': true,
    'C:\\Users\\Użytkownik': true,
    'D:': true,
  });

  // Build folder hierarchy tree dynamically from user drives and files
  const folderTree = useMemo(() => {
    const drives: Record<string, FolderNode> = {};
    userDrives.forEach((d) => {
      drives[d.id] = { name: d.label, fullPath: d.path, driveId: d.id, children: [] };
    });

    allFiles.forEach((file) => {
      const parts = file.path.split('\\');
      const driveLetter = parts[0]; // e.g. 'C:'
      if (!drives[driveLetter]) return;

      let currentLevel = drives[driveLetter].children;
      let accumulatedPath = driveLetter;

      // Navigate through folder parts (excluding drive and filename)
      for (let i = 1; i < parts.length - 1; i++) {
        const folderName = parts[i];
        accumulatedPath += '\\' + folderName;

        let existing = currentLevel.find((node) => node.name === folderName);
        if (!existing) {
          existing = {
            name: folderName,
            fullPath: accumulatedPath,
            driveId: driveLetter,
            children: [],
          };
          currentLevel.push(existing);
        }
        currentLevel = existing.children;
      }
    });

    return drives;
  }, [userDrives, allFiles]);

  // Navigate to a new path
  const navigateTo = (newPath: string) => {
    if (newPath === currentPath) return;
    const newHistory = pathHistory.slice(0, historyIndex + 1);
    newHistory.push(newPath);
    setPathHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentPath(newPath);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentPath(pathHistory[historyIndex - 1]);
    }
  };

  const goForward = () => {
    if (historyIndex < pathHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentPath(pathHistory[historyIndex + 1]);
    }
  };

  const goUp = () => {
    if (currentPath.endsWith(':\\') || currentPath.endsWith(':')) {
      setCurrentPath('Ten Komputer');
      return;
    }
    const parts = currentPath.split('\\');
    if (parts.length <= 2) {
      setCurrentPath(parts[0] + '\\');
    } else {
      parts.pop();
      setCurrentPath(parts.join('\\'));
    }
  };

  const toggleFolderExpand = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  // Get items in current directory
  const currentItems = useMemo(() => {
    if (searchQuery.trim() !== '') {
      // Global search filter
      const q = searchQuery.toLowerCase();
      return {
        subfolders: [] as string[],
        files: allFiles.filter(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            f.path.toLowerCase().includes(q) ||
            f.type.toLowerCase().includes(q)
        ),
      };
    }

    if (currentPath === 'Ten Komputer') {
      return { subfolders: ['C:\\', 'D:\\', 'E:\\', 'F:\\'], files: [] };
    }

    const subfoldersSet = new Set<string>();
    const matchingFiles: FileItem[] = [];

    const normalizedCurrentPath = currentPath.endsWith('\\')
      ? currentPath.slice(0, -1).toLowerCase()
      : currentPath.toLowerCase();

    allFiles.forEach((file) => {
      const filePathLower = file.path.toLowerCase();
      const lastSlashIndex = filePathLower.lastIndexOf('\\');
      const folderOfFile = filePathLower.substring(0, lastSlashIndex);

      if (folderOfFile === normalizedCurrentPath) {
        matchingFiles.push(file);
      } else if (folderOfFile.startsWith(normalizedCurrentPath + '\\')) {
        // Extract direct child folder name
        const relativePart = folderOfFile.substring(normalizedCurrentPath.length + 1);
        const childFolderName = relativePart.split('\\')[0];
        const fullChildFolderPath =
          (currentPath.endsWith('\\') ? currentPath : currentPath + '\\') + childFolderName;
        subfoldersSet.add(fullChildFolderPath);
      }
    });

    return {
      subfolders: Array.from(subfoldersSet),
      files: matchingFiles,
    };
  }, [allFiles, currentPath, searchQuery]);

  // Toggle selection of a single file
  const toggleFileSelect = (fileId: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  // Select/deselect all currently visible files
  const toggleSelectAllVisible = () => {
    const visibleIds = currentItems.files.map((f) => f.id);
    const allVisibleSelected = visibleIds.every((id) => selectedFileIds.includes(id));

    if (allVisibleSelected) {
      setSelectedFileIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedFileIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Get selected files objects
  const selectedFilesList = useMemo(() => {
    return allFiles.filter((f) => selectedFileIds.includes(f.id));
  }, [allFiles, selectedFileIds]);

  const totalSelectedSizeKb = useMemo(() => {
    return selectedFilesList.reduce((acc, curr) => acc + curr.sizeKb, 0);
  }, [selectedFilesList]);

  const handleConfirmScan = () => {
    onStartCustomScan(selectedFilesList);
    onClose();
  };

  // Helper for file type icons
  const getFileIcon = (type: string, name: string) => {
    if (name.endsWith('.exe')) return <FileCode className="w-4 h-4 text-emerald-400" />;
    if (name.endsWith('.dll')) return <FileCode className="w-4 h-4 text-amber-400" />;
    if (name.endsWith('.ps1') || name.endsWith('.vbs') || name.endsWith('.js'))
      return <FileCode className="w-4 h-4 text-rose-400" />;
    if (name.endsWith('.docx') || name.endsWith('.pdf'))
      return <FileText className="w-4 h-4 text-sky-400" />;
    if (name.endsWith('.jpg') || name.endsWith('.png'))
      return <FileArchive className="w-4 h-4 text-purple-400" />;
    return <File className="w-4 h-4 text-slate-400" />;
  };

  // Render Recursive Folder Tree on Left Sidebar
  const renderTreeNodes = (nodes: FolderNode[]) => {
    return nodes.map((node) => {
      const isExpanded = !!expandedFolders[node.fullPath];
      const hasChildren = node.children.length > 0;
      const isSelectedPath = currentPath === node.fullPath;

      return (
        <div key={node.fullPath} className="text-xs">
          <div
            onClick={() => navigateTo(node.fullPath)}
            className={`flex items-center space-x-1.5 py-1 px-2 rounded-lg cursor-pointer transition select-none ${
              isSelectedPath
                ? 'bg-blue-600/30 text-white font-semibold border border-blue-500/40'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            {hasChildren ? (
              <span
                onClick={(e) => toggleFolderExpand(node.fullPath, e)}
                className="p-0.5 hover:bg-slate-700 rounded text-slate-400"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </span>
            ) : (
              <span className="w-3.5 h-3.5 inline-block" />
            )}
            <Folder className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">{node.name}</span>
          </div>

          {hasChildren && isExpanded && (
            <div className="pl-4 space-y-0.5 border-l border-slate-800 ml-2.5 my-0.5">
              {renderTreeNodes(node.children)}
            </div>
          )}
        </div>
      );
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-fade-in select-none">
      <div className="bg-[#12141D] border border-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] max-h-[750px] flex flex-col overflow-hidden">
        {/* Title bar - Windows 11 style */}
        <div className="bg-[#1A1C27] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white">
              <FolderOpen className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-200 font-sans tracking-wide">
              {getText(
                currentLang,
                'Eksplorator Plików Windows — Wybór Plików do Skanowania Wieszka AI',
                'Windows File Explorer — Select Files to Scan'
              )}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-rose-600/80 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar & Address Bar */}
        <div className="bg-[#161822] px-4 py-2 border-b border-slate-800/80 flex flex-wrap items-center gap-2 shrink-0">
          {/* Navigation controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={goBack}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
              title={getText(currentLang, 'Wstecz', 'Back')}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goForward}
              disabled={historyIndex >= pathHistory.length - 1}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
              title={getText(currentLang, 'Dalej', 'Forward')}
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={goUp}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800"
              title={getText(currentLang, 'Folder wyżej', 'Up')}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPath(currentPath)}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800"
              title={getText(currentLang, 'Odśwież', 'Refresh')}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Windows Explorer Address Bar */}
          <div className="flex-1 min-w-[200px] bg-[#0E1017] border border-slate-700/80 rounded-lg px-3 py-1 flex items-center space-x-2 text-xs font-mono text-slate-200">
            <HardDrive className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <input
              type="text"
              value={currentPath}
              onChange={(e) => setCurrentPath(e.target.value)}
              className="w-full bg-transparent outline-none text-slate-200 font-mono text-xs"
            />
          </div>

          {/* Realtime Search Input */}
          <div className="w-full sm:w-56 bg-[#0E1017] border border-slate-700/80 rounded-lg px-2.5 py-1 flex items-center space-x-2 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder={getText(currentLang, 'Szukaj plików...', 'Search files...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-slate-200 placeholder-slate-500 text-xs"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Main Body: Sidebar + File List View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Navigation Tree */}
          <div className="w-56 bg-[#0F1118] border-r border-slate-800 p-3 overflow-y-auto shrink-0 hidden md:block">
            <div className="text-[11px] font-bold text-slate-400 font-mono mb-2 uppercase tracking-wider">
              {getText(currentLang, 'Ten Komputer', 'This PC')}
            </div>

            {/* Quick Access Items */}
            <div className="space-y-0.5 mb-3 text-xs">
              <div
                onClick={() => navigateTo('C:\\Users\\User\\Downloads')}
                className="flex items-center space-x-2 py-1 px-2 rounded-lg text-slate-300 hover:bg-slate-800/80 cursor-pointer"
              >
                <Folder className="w-4 h-4 text-blue-400" />
                <span>{getText(currentLang, 'Pobrane (Downloads)', 'Downloads')}</span>
              </div>
              <div
                onClick={() => navigateTo('C:\\Users\\User\\Documents')}
                className="flex items-center space-x-2 py-1 px-2 rounded-lg text-slate-300 hover:bg-slate-800/80 cursor-pointer"
              >
                <Folder className="w-4 h-4 text-emerald-400" />
                <span>{getText(currentLang, 'Dokumenty', 'Documents')}</span>
              </div>
              <div
                onClick={() => navigateTo('C:\\Program Files')}
                className="flex items-center space-x-2 py-1 px-2 rounded-lg text-slate-300 hover:bg-slate-800/80 cursor-pointer"
              >
                <Folder className="w-4 h-4 text-indigo-400" />
                <span>{getText(currentLang, 'Programy (Program Files)', 'Program Files')}</span>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-2 mb-2 text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider">
              {getText(currentLang, 'Dyski i Zarządzanie', 'Drives & Devices')}
            </div>

            {/* Recursive Drive Nodes */}
            <div className="space-y-1">
              {userDrives.map((drive) => (
                <div key={drive.id}>
                  <div
                    onClick={() => navigateTo(drive.path)}
                    className="flex items-center space-x-2 py-1 px-2 rounded-lg text-slate-300 hover:bg-slate-800/80 cursor-pointer font-bold text-xs"
                  >
                    {drive.usb ? (
                      <Usb className="w-4 h-4 text-amber-400" />
                    ) : (
                      <HardDrive className="w-4 h-4 text-sky-400" />
                    )}
                    <span>{drive.label}</span>
                  </div>
                  <div className="pl-3">{renderTreeNodes(folderTree[drive.id]?.children || [])}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Main Folder Contents View */}
          <div className="flex-1 bg-[#12141D] flex flex-col overflow-hidden">
            {/* Folder Header Bar */}
            <div className="bg-[#151722] px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-300 shrink-0">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">{getText(currentLang, 'Zawartość:', 'Contents:')}</span>
                <span className="font-bold text-white font-mono">{currentPath}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleSelectAllVisible}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[11px] font-sans font-medium text-slate-200 transition"
                >
                  {currentItems.files.every((f) => selectedFileIds.includes(f.id))
                    ? getText(currentLang, 'Odznacz widoczne', 'Deselect visible')
                    : getText(currentLang, 'Zaznacz wszystkie w folderze', 'Select all in folder')}
                </button>
              </div>
            </div>

            {/* Hidden File Input for uploading REAL files from user's hard drive */}
            <input
              type="file"
              ref={realFileInputRef}
              onChange={handleRealFileUpload}
              multiple
              className="hidden"
            />
            {/* Hidden Folder Input for uploading REAL folders from user's hard drive */}
            <input
              type="file"
              ref={realFolderInputRef}
              onChange={handleRealFolderUpload}
              multiple
              className="hidden"
            />

            {/* Explorer Content Area */}
            <div className="flex-1 overflow-y-auto p-3">
              {/* Native System Dialog Trigger Highlight Banner */}
              <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900 to-indigo-950/90 border-2 border-emerald-500/60 rounded-xl p-4 shadow-xl mb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shrink-0">
                      <FolderOpen className="w-6 h-6 text-emerald-400 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{getText(currentLang, '💻 Wybór Plików i Folderów (Wybierz z Komputera)', '💻 System File & Folder Picker')}</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold uppercase">
                          {getText(currentLang, 'Natywne Okno OS', 'Native OS Picker')}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {getText(
                          currentLang,
                          'Wywołaj natywne okno systemowe wyboru plików ze swojego twardego dysku (C:, D:, Pobrane itp.)!',
                          'Launch your native OS system window to pick real files or folders directly from your disk!'
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => realFileInputRef.current?.click()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg border border-emerald-400/50 flex items-center gap-2 transition transform hover:scale-105"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{getText(currentLang, '💻 Wybierz Pliki (Okno OS)', '💻 Pick Files (OS Window)')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDirectFolderPick}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg border border-indigo-400/50 flex items-center gap-2 transition transform hover:scale-105"
                    >
                      <Folder className="w-4 h-4" />
                      <span>{getText(currentLang, '📂 Wybierz Cały Folder / Dysk', '📂 Pick Entire Folder / Drive')}</span>
                    </button>
                  </div>
                </div>
              </div>

              {currentPath === 'Ten Komputer' ? (
                <div className="space-y-4">
                  {/* Interactive Drive Selection Prompt Banner */}
                  <div className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 border border-blue-500/40 rounded-xl p-4 shadow-lg">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/25 border border-blue-500/40 flex items-center justify-center text-blue-300 shrink-0">
                        <HardDrive className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{getText(currentLang, 'Automatyczna Detekcja Dysków i Aplikacji .EXE — Mój Komputer', 'Auto Drive & .EXE App Detection — This PC')}</span>
                          <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-md font-mono font-bold">
                            {userDrives.length} {getText(currentLang, 'wykrytych partycji', 'drives detected')}
                          </span>
                        </h4>
                        <p className="text-xs text-slate-300 mt-1">
                          {getText(
                            currentLang,
                            'Pełny Skan Systemu automatycznie przeszukuje wszystkie wykryte partycje dyskowe (C:, D:, E:), pamięć RAM oraz pliki wykonywalne .EXE i .DLL bez potrzeby ręcznego zaznaczania.',
                            'Full System Scan automatically scans all detected partitions (C:, D:, E:), RAM memory, and .EXE/.DLL executable files without requiring manual selection.'
                          )}
                        </p>

                        {drivePromptMsg && (
                          <div className="mt-2.5 p-2 bg-blue-500/20 border border-blue-500/40 rounded-lg text-xs font-semibold text-blue-200 flex items-center justify-between animate-fade-in shadow-inner">
                            <span>💡 {drivePromptMsg}</span>
                            <button
                              onClick={() => setDrivePromptMsg(null)}
                              className="text-slate-400 hover:text-white ml-2 text-xs font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick selection actions */}
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 text-xs text-slate-300 flex-wrap gap-1.5">
                        <span className="text-slate-400">{getText(currentLang, 'Twoje dyski:', 'Your drives:')}</span>
                        {userDrives.map((d) => {
                          const active = selectedDrives.includes(d.id);
                          return (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => {
                                if (onToggleDrive) onToggleDrive(d.id);
                                const nextState = !active;
                                setDrivePromptMsg(
                                  nextState
                                    ? getText(currentLang, `Zaznaczono dysk ${d.id}! Czy chcesz zaznaczyć kolejny dysk, czy przejść dalej?`, `Selected drive ${d.id}! Select another or click Next.`)
                                    : getText(currentLang, `Odznaczono dysk ${d.id}.`, `Deselected ${d.id}.`)
                                );
                              }}
                              className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold transition flex items-center gap-1 ${
                                active
                                  ? 'bg-blue-600 text-white shadow ring-1 ring-blue-400/50'
                                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                              }`}
                            >
                              <span>{active ? `✓ ${d.id}` : `+ ${d.id}`}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowAddDrive(true)}
                          className="text-[11px] font-bold text-indigo-300 hover:text-white px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 rounded-lg border border-indigo-500/40 transition flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{getText(currentLang, '+ Dodaj dysk', '+ Add Drive')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => realFileInputRef.current?.click()}
                          className="text-[11px] font-bold text-blue-300 hover:text-white px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600/50 rounded-lg border border-blue-500/40 transition flex items-center gap-1"
                        >
                          <Upload className="w-3.5 h-3.5 text-blue-400" />
                          <span>{getText(currentLang, '📂 Wczytaj z komputera', '📂 Load from PC')}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Add Drive Modal Dialog inline */}
                  {showAddDrive && (
                    <div className="bg-slate-900 border border-indigo-500/40 p-3.5 rounded-xl space-y-3 animate-fade-in">
                      <h4 className="text-xs font-bold text-white flex items-center justify-between">
                        <span>{getText(currentLang, 'Dodaj nowy dysk / partycję / Pendrive', 'Add new drive / partition / USB')}</span>
                        <button onClick={() => setShowAddDrive(false)} className="text-slate-400 hover:text-white">✕</button>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-slate-400 font-mono block mb-1">
                            {getText(currentLang, 'Litera dysku (np. E:, F:, G:):', 'Drive letter (e.g. E:, F:):')}
                          </label>
                          <input
                            type="text"
                            value={addDriveLetter}
                            onChange={(e) => setAddDriveLetter(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 font-mono block mb-1">
                            {getText(currentLang, 'Etykieta dysku:', 'Drive label:')}
                          </label>
                          <input
                            type="text"
                            value={addDriveLabel}
                            onChange={(e) => setAddDriveLabel(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => setShowAddDrive(false)}
                          className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg font-bold"
                        >
                          {getText(currentLang, 'Anuluj', 'Cancel')}
                        </button>
                        <button
                          onClick={handleAddDriveConfirm}
                          className="px-4 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg font-bold shadow"
                        >
                          {getText(currentLang, 'Dodaj dysk ✓', 'Add drive ✓')}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-semibold text-slate-300">
                    <span className="flex items-center gap-2">
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                      {getText(currentLang, `Urządzenia i dyski komputera (${userDrives.length})`, `Computer devices and drives (${userDrives.length})`)}
                    </span>
                    <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 rounded-md font-bold">
                      {selectedDrives.length} / {userDrives.length} {getText(currentLang, 'wybrane do skanu', 'selected')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {userDrives.map((drive) => {
                      const isChecked = selectedDrives.includes(drive.id);
                      const usedGb = drive.totalGb - drive.freeGb;
                      const usedPercent = Math.round((usedGb / drive.totalGb) * 100);

                      return (
                        <div
                          key={drive.id}
                          className={`p-3.5 rounded-xl border transition group relative select-none ${
                            isChecked
                              ? 'bg-[#1C2132] border-blue-500 ring-1 ring-blue-500/50 shadow-md'
                              : 'bg-[#14161F] border-slate-800 hover:border-slate-700 hover:bg-[#181A24]'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div
                              onClick={() => {
                                if (onToggleDrive) onToggleDrive(drive.id);
                                const nextState = !isChecked;
                                setDrivePromptMsg(
                                  nextState
                                    ? getText(currentLang, `Zaznaczono dysk ${drive.id}! Czy chcesz wybrać kolejny dysk, czy przejść dalej?`, `Selected ${drive.id}! Select another drive or click Next.`)
                                    : getText(currentLang, `Odznaczono dysk ${drive.id}.`, `Deselected ${drive.id}.`)
                                );
                              }}
                              className="flex items-center space-x-3 cursor-pointer flex-1"
                            >
                              <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 shrink-0 group-hover:scale-105 transition">
                                {drive.usb ? (
                                  <Usb className="w-5 h-5 text-indigo-400" />
                                ) : (
                                  <HardDrive className="w-5 h-5 text-sky-400" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-bold text-xs text-white group-hover:text-blue-300 transition flex items-center gap-1.5">
                                  <span>{drive.label}</span>
                                  {drive.bitlocker && (
                                    <span className="text-[9px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-1 py-0.2 rounded font-mono">
                                      BitLocker
                                    </span>
                                  )}
                                </h4>
                                <p className="text-[11px] text-slate-300 font-sans mt-0.5">
                                  {drive.freeGb} GB {getText(currentLang, 'wolnych z', 'free of')} {drive.totalGb} GB
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-1.5">
                              {/* Remove Drive button (only for non-system drives) */}
                              {!drive.system && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveDrive(drive.id);
                                  }}
                                  className="w-6 h-6 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 flex items-center justify-center transition"
                                  title={getText(currentLang, 'Usuń dysk z konfiguracji', 'Remove drive')}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Checkbox to toggle drive selection */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onToggleDrive) onToggleDrive(drive.id);
                                  const nextState = !isChecked;
                                  setDrivePromptMsg(
                                    nextState
                                      ? getText(currentLang, `Zaznaczono dysk ${drive.id}! Czy chcesz wybrać kolejny dysk, czy przejść dalej?`, `Selected ${drive.id}!`)
                                      : getText(currentLang, `Odznaczono dysk ${drive.id}.`, `Deselected ${drive.id}.`)
                                  );
                                }}
                                className={`w-5 h-5 rounded border flex items-center justify-center transition shrink-0 ${
                                  isChecked
                                    ? 'bg-blue-600 border-blue-500 text-white shadow'
                                    : 'border-slate-700 bg-slate-900 hover:border-slate-500'
                                }`}
                                title={getText(currentLang, 'Przełącz aktywność dysku w skanie', 'Toggle drive in scan')}
                              >
                                {isChecked && <CheckSquare className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          {/* Explorer Progress Bar */}
                          <div
                            onClick={() => navigateTo(drive.path)}
                            className="w-full bg-slate-800/90 h-2 rounded-sm overflow-hidden border border-slate-700/60 cursor-pointer"
                          >
                            <div
                              className="h-full bg-blue-500 rounded-sm"
                              style={{ width: `${usedPercent}%` }}
                            />
                          </div>

                          {/* Open drive button */}
                          <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 text-[10px]">
                              {isChecked
                                ? getText(currentLang, '✓ Włączony do skanowania', '✓ Active in scan')
                                : getText(currentLang, '✕ Wyłączony z skanu', '✕ Excluded')}
                            </span>
                            <button
                              type="button"
                              onClick={() => navigateTo(drive.path)}
                              className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition"
                            >
                              <span>{getText(currentLang, 'Przeglądaj pliki dysku ➔', 'Browse drive files ➔')}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse select-none">
                <thead>
                  <tr className="border-b border-slate-800/80 text-slate-400 font-mono text-[11px]">
                    <th className="py-2 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          currentItems.files.length > 0 &&
                          currentItems.files.every((f) => selectedFileIds.includes(f.id))
                        }
                        onChange={toggleSelectAllVisible}
                        className="rounded border-slate-700 accent-blue-600"
                      />
                    </th>
                    <th className="py-2 px-3">{getText(currentLang, 'Nazwa Pliku / Folderu', 'Name')}</th>
                    <th className="py-2 px-3 hidden sm:table-cell">{getText(currentLang, 'Data modyfikacji', 'Date modified')}</th>
                    <th className="py-2 px-3 hidden md:table-cell">{getText(currentLang, 'Typ', 'Type')}</th>
                    <th className="py-2 px-3 text-right">{getText(currentLang, 'Rozmiar', 'Size')}</th>
                    <th className="py-2 px-3 text-center">{getText(currentLang, 'Status AI', 'AI Status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {/* Render Subfolders */}
                  {currentItems.subfolders.map((subfolderPath) => {
                    const folderName = subfolderPath.split('\\').pop() || subfolderPath;
                    return (
                      <tr
                        key={subfolderPath}
                        onClick={() => navigateTo(subfolderPath)}
                        className="hover:bg-slate-800/60 cursor-pointer transition group"
                      >
                        <td className="py-2.5 px-3 text-center opacity-40">
                          <Folder className="w-4 h-4 text-slate-500 mx-auto" />
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-white flex items-center space-x-2.5">
                          <Folder className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition" />
                          <span>{folderName}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px] font-mono hidden sm:table-cell">
                          ---
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px] font-mono hidden md:table-cell">
                          {getText(currentLang, 'Folder plików', 'File folder')}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-500 font-mono text-[11px]">
                          ---
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="text-[10px] font-mono text-slate-500">
                            {getText(currentLang, 'Katalog', 'Directory')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Render Files */}
                  {currentItems.files.map((file) => {
                    const isSelected = selectedFileIds.includes(file.id);
                    return (
                      <tr
                        key={file.id}
                        onClick={() => toggleFileSelect(file.id)}
                        className={`cursor-pointer transition ${
                          isSelected
                            ? 'bg-blue-600/15 border-l-2 border-blue-500 text-white'
                            : 'hover:bg-slate-800/50 text-slate-300'
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleFileSelect(file.id)}
                            className="rounded border-slate-700 accent-blue-600 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-medium flex items-center space-x-2.5">
                          {getFileIcon(file.type, file.name)}
                          <span className={file.isKnownMalicious ? 'text-rose-300 font-semibold' : ''}>
                            {file.name}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px] font-mono hidden sm:table-cell">
                          {file.lastModified}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px] font-mono hidden md:table-cell">
                          {file.type}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[11px] text-slate-300">
                          {file.sizeKb >= 1024
                            ? `${(file.sizeKb / 1024).toFixed(1)} MB`
                            : `${file.sizeKb} KB`}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {file.isKnownMalicious ? (
                            <span
                              className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded text-[10px] font-mono inline-flex items-center gap-1 font-bold"
                              title="Podejrzany plik - wysokie ryzyko"
                            >
                              <ShieldAlert className="w-3 h-3 text-rose-400" />
                              Malware
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-mono inline-flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              OK
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {currentItems.subfolders.length === 0 && currentItems.files.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 font-mono text-xs">
                        {getText(currentLang, 'Brak plików w tym folderze odpowiadających kryteriom.', 'No files match in this folder.')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              )}
            </div>

            {/* Bottom Status Bar & Action Confirm Button */}
            <div className="bg-[#161822] p-3.5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex items-center space-x-3 text-xs font-mono text-slate-300">
                <FileCheck className="w-4 h-4 text-blue-400" />
                <span>
                  {getText(currentLang, 'Wybrano do skanowania Wieszka AI:', 'Selected for Wieszka AI scan:')}{' '}
                  <strong className="text-indigo-300 font-bold">{selectedDrives.length}</strong> {getText(currentLang, 'dysków', 'drives')} (
                  <strong className="text-white font-bold">{selectedFilesList.length}</strong> {getText(currentLang, 'plików', 'files')},{' '}
                  <strong className="text-blue-400">
                    {totalSelectedSizeKb >= 1024
                      ? `${(totalSelectedSizeKb / 1024).toFixed(1)} MB`
                      : `${totalSelectedSizeKb} KB`}
                  </strong>
                  )
                </span>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
                >
                  {getText(currentLang, 'Anuluj', 'Cancel')}
                </button>
                <button
                  onClick={handleConfirmScan}
                  disabled={selectedFilesList.length === 0 && selectedDrives.length === 0}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 border border-blue-400/40"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {getText(currentLang, 'Rozpocznij Skanowanie', 'Start Scanning')}
                  </span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
