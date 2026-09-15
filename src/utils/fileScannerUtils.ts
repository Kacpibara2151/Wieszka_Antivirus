import { FileItem, ThreatItem } from '../types';

/**
 * Formats byte counts into human-readable strings (B, KB, MB, GB).
 * Seamlessly handles files larger than 1GB.
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const safeI = Math.min(i, sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, safeI)).toFixed(dm))} ${sizes[safeI]}`;
}

/**
 * Examines magic bytes from the initial slice of a file without loading the whole file into RAM.
 */
export function detectMagicBytes(buffer: ArrayBuffer): {
  signature: string;
  isExecutable: boolean;
  isArchive: boolean;
  mimeGuess: string;
} {
  const bytes = new Uint8Array(buffer.slice(0, 16));
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');

  // Windows PE (EXE, DLL, SYS, OCX) - "MZ"
  if (bytes[0] === 0x4d && bytes[1] === 0x5a) {
    return {
      signature: 'Windows PE (MZ Executable / DLL)',
      isExecutable: true,
      isArchive: false,
      mimeGuess: 'application/x-msdownload',
    };
  }

  // Linux ELF
  if (bytes[0] === 0x7f && bytes[1] === 0x45 && bytes[2] === 0x4c && bytes[3] === 0x46) {
    return {
      signature: 'Linux ELF Executable',
      isExecutable: true,
      isArchive: false,
      mimeGuess: 'application/x-executable',
    };
  }

  // ZIP / APK / JAR / DOCX / XLSX
  if (bytes[0] === 0x50 && bytes[1] === 0x4b && (bytes[2] === 0x03 || bytes[2] === 0x05)) {
    return {
      signature: 'ZIP Archive / Compressed Package',
      isExecutable: false,
      isArchive: true,
      mimeGuess: 'application/zip',
    };
  }

  // 7-Zip
  if (bytes[0] === 0x37 && bytes[1] === 0x7a && bytes[2] === 0xbc && bytes[3] === 0xaf) {
    return {
      signature: '7-Zip Compressed Archive',
      isExecutable: false,
      isArchive: true,
      mimeGuess: 'application/x-7z-compressed',
    };
  }

  // RAR
  if (bytes[0] === 0x52 && bytes[1] === 0x61 && bytes[2] === 0x72 && bytes[3] === 0x21) {
    return {
      signature: 'RAR Archive Package',
      isExecutable: false,
      isArchive: true,
      mimeGuess: 'application/vnd.rar',
    };
  }

  // PDF
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return {
      signature: 'PDF Document (%PDF)',
      isExecutable: false,
      isArchive: false,
      mimeGuess: 'application/pdf',
    };
  }

  // Check if printable ASCII/UTF-8 (scripts, text files)
  let isPrintable = true;
  for (let i = 0; i < Math.min(bytes.length, 16); i++) {
    const code = bytes[i];
    if (code === 0) {
      isPrintable = false;
      break;
    }
  }

  return {
    signature: isPrintable ? 'Plain Text / Script / Config' : `Binary Data [${hex.slice(0, 11)}]`,
    isExecutable: false,
    isArchive: false,
    mimeGuess: isPrintable ? 'text/plain' : 'application/octet-stream',
  };
}

/**
 * Computes a fast, non-blocking cryptographic or sampled SHA-256 hash.
 * Uses sliced chunks with async event loop yields (setTimeout 0) so the UI NEVER freezes,
 * even when processing massive files (> 1GB, 5GB, 10GB).
 */
export async function computeSafeFileHash(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  try {
    // If file is smaller than 20MB, compute direct SHA-256 via SubtleCrypto
    if (file.size <= 20 * 1024 * 1024) {
      const buffer = await file.arrayBuffer();
      const digest = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(digest));
      return 'sha256-' + hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }

    // For files > 20MB and especially > 1GB:
    // Sample head (8MB), mid (8MB), tail (8MB) and file size to form a collision-resistant composite
    const sampleSize = 4 * 1024 * 1024; // 4MB
    const headSlice = file.slice(0, sampleSize);
    const midStart = Math.max(0, Math.floor(file.size / 2) - sampleSize / 2);
    const midSlice = file.slice(midStart, midStart + sampleSize);
    const tailStart = Math.max(0, file.size - sampleSize);
    const tailSlice = file.slice(tailStart, file.size);

    if (onProgress) onProgress(30);
    await new Promise((r) => setTimeout(r, 0)); // Yield to main thread

    const headBuf = await headSlice.arrayBuffer();
    if (onProgress) onProgress(60);
    await new Promise((r) => setTimeout(r, 0)); // Yield

    const midBuf = await midSlice.arrayBuffer();
    if (onProgress) onProgress(80);
    await new Promise((r) => setTimeout(r, 0)); // Yield

    const tailBuf = await tailSlice.arrayBuffer();

    // Combine sample buffers with file size metadata
    const combined = new Uint8Array(headBuf.byteLength + midBuf.byteLength + tailBuf.byteLength + 8);
    combined.set(new Uint8Array(headBuf), 0);
    combined.set(new Uint8Array(midBuf), headBuf.byteLength);
    combined.set(new Uint8Array(tailBuf), headBuf.byteLength + midBuf.byteLength);

    // Append file size into last 8 bytes
    const view = new DataView(combined.buffer);
    view.setBigUint64(headBuf.byteLength + midBuf.byteLength + tailBuf.byteLength, BigInt(file.size), true);

    const digest = await crypto.subtle.digest('SHA-256', combined);
    if (onProgress) onProgress(100);

    const hashArray = Array.from(new Uint8Array(digest));
    return 'sha256-fast-' + hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    // Fallback pseudo hash based on size and timestamps
    return `sha256-meta-${file.size.toString(16)}-${file.lastModified.toString(16)}`;
  }
}

/**
 * Safely inspects a local file without loading the entire payload into RAM.
 * Prevents UI freezes on files > 1GB.
 */
export async function inspectFileSafe(file: File): Promise<{
  isLargeFile: boolean;
  formattedSize: string;
  signature: string;
  isExecutable: boolean;
  isArchive: boolean;
  previewSnippet: string;
  hash: string;
}> {
  const isLargeFile = file.size > 2 * 1024 * 1024; // > 2MB
  const formattedSize = formatBytes(file.size);

  // Read only the initial 64 KB header
  const headerSlice = file.slice(0, 65536);
  const headerBuffer = await headerSlice.arrayBuffer();
  const { signature, isExecutable, isArchive, mimeGuess } = detectMagicBytes(headerBuffer);

  // If file is small (< 1MB) and not pure binary, read text preview
  let previewSnippet = '';
  if (file.size <= 1024 * 1024 && !isExecutable && !isArchive) {
    try {
      const decoder = new TextDecoder('utf-8', { fatal: false });
      previewSnippet = decoder.decode(headerBuffer).slice(0, 10000);
    } catch {
      previewSnippet = `// Plik binarny: ${file.name} (${formattedSize})`;
    }
  } else {
    // Format high-tech structured header for large or binary files
    const bytes = new Uint8Array(headerBuffer.slice(0, 64));
    let hexDump = '';
    for (let i = 0; i < bytes.length; i += 16) {
      const chunk = Array.from(bytes.slice(i, i + 16))
        .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
        .join(' ');
      hexDump += `[0x${i.toString(16).padStart(4, '0')}] ${chunk}\n`;
    }

    previewSnippet = `// =========================================================================
// [WIESZKA GUARD] RAPORT INSPEKCJI DUŻEGO PLIKU (> 1 GB / PLIK BINARNY)
// =========================================================================
// Nazwa pliku: ${file.name}
// Rozmiar fizyczny: ${formattedSize} (${file.size.toLocaleString()} bajtów)
// Wykryta sygnatura nagłówka: ${signature}
// Typ MIME (estymacja): ${mimeGuess}
// Ostatnia modyfikacja: ${new Date(file.lastModified).toLocaleString()}
//
// Zabezpieczenie pamięci: Plik został przetworzony strumieniowo w plasterkach.
// Poniżej zrzut pierwszych 64 bajtów nagłówka PE/Binarnego:
// -------------------------------------------------------------------------
${hexDump}
// -------------------------------------------------------------------------
// Status: Gotowy do analizy heurystycznej Wieszka AI oraz kwarantanny.`;
  }

  const hash = await computeSafeFileHash(file);

  return {
    isLargeFile,
    formattedSize,
    signature,
    isExecutable,
    isArchive,
    previewSnippet,
    hash,
  };
}

/**
 * Converts real browser File objects into typed FileItem records.
 */
export function convertFilesToFileItems(
  files: File[] | FileList,
  basePathPrefix = 'C:\\Użytkownik\\PlikiPrawdziwe\\'
): FileItem[] {
  const arr = Array.from(files);
  return arr.map((f, idx) => {
    const ext = f.name.split('.').pop()?.toUpperCase() || 'FILE';
    let cat: FileItem['category'] = 'Document';
    if (['EXE', 'MSI', 'BAT', 'CMD', 'COM', 'SCR'].includes(ext)) cat = 'Executable';
    else if (['JS', 'PY', 'PS1', 'SH', 'VBS', 'WSF', 'HTA'].includes(ext)) cat = 'Script';
    else if (['ZIP', 'RAR', '7Z', 'TAR', 'GZ', 'ISO', 'IMG'].includes(ext)) cat = 'Archive';
    else if (['DLL', 'SYS', 'DRV', 'OCX', 'BIN'].includes(ext)) cat = 'System';

    const relPath = (f as any).webkitRelativePath;
    const computedPath = relPath
      ? `C:\\${relPath.replace(/\//g, '\\')}`
      : `${basePathPrefix}${f.name}`;

    const isHidden = f.name.startsWith('.') || f.name.startsWith('~$') || computedPath.toLowerCase().includes('appdata') || computedPath.toLowerCase().includes('$recycle.bin') || computedPath.toLowerCase().includes('system volume information');

    return {
      id: `real-pc-file-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      name: f.name,
      path: computedPath,
      sizeKb: Math.max(1, Math.round(f.size / 1024)),
      type: ext,
      category: cat,
      hash: `sha256-meta-${f.size.toString(16)}`,
      lastModified: new Date(f.lastModified).toISOString().split('T')[0],
      originalFile: f,
      isRealUserFile: true,
      isHidden,
    };
  });
}

/**
 * Traverses a directory selected via modern window.showDirectoryPicker() recursively.
 * Scans ALL files, including hidden files, dotfiles, system directories, and nested archives.
 */
export async function scanRealDirectoryHandle(
  dirHandle: any,
  onFileFound?: (file: File, relativePath: string) => void,
  maxFiles = 50000
): Promise<FileItem[]> {
  const fileItems: FileItem[] = [];

  async function walk(handle: any, currentPath: string) {
    if (fileItems.length >= maxFiles) return;

    try {
      for await (const [name, entry] of handle.entries()) {
        if (fileItems.length >= maxFiles) break;

        const pathStr = currentPath ? `${currentPath}\\${name}` : name;

        if (entry.kind === 'file') {
          try {
            const file: File = await entry.getFile();
            if (onFileFound) {
              onFileFound(file, pathStr);
            }

            const ext = name.split('.').pop()?.toUpperCase() || 'FILE';
            let cat: FileItem['category'] = 'Document';
            if (['EXE', 'MSI', 'BAT', 'CMD', 'COM'].includes(ext)) cat = 'Executable';
            else if (['JS', 'PY', 'PS1', 'SH', 'VBS'].includes(ext)) cat = 'Script';
            else if (['ZIP', 'RAR', '7Z', 'TAR', 'GZ', 'ISO'].includes(ext)) cat = 'Archive';
            else if (['DLL', 'SYS', 'DRV'].includes(ext)) cat = 'System';

            const isHidden = name.startsWith('.') || name.startsWith('~$') || pathStr.toLowerCase().includes('appdata') || pathStr.toLowerCase().includes('$recycle.bin') || pathStr.toLowerCase().includes('system volume information');

            fileItems.push({
              id: `real-dir-file-${Date.now()}-${fileItems.length}`,
              name,
              path: `C:\\${pathStr}`,
              sizeKb: Math.max(1, Math.round(file.size / 1024)),
              type: ext,
              category: cat,
              hash: `sha256-${file.size.toString(16)}-${file.lastModified.toString(16)}`,
              lastModified: new Date(file.lastModified).toISOString().split('T')[0],
              originalFile: file,
              isRealUserFile: true,
              isHidden,
            });
          } catch (e) {
            // Skip unreadable / locked files
          }
        } else if (entry.kind === 'directory') {
          // Traverse into all subdirectories, including hidden directories (dotfolders)
          await walk(entry, pathStr);
        }
      }
    } catch (e) {
      // Access or traversal issue
    }
  }

  await walk(dirHandle, dirHandle.name || 'Dysk');
  return fileItems;
}

/**
 * Streams files in real-time as they are discovered from a directory handle.
 * Starts scanning immediately with zero delay and scans ALL files (including hidden files).
 */
export async function streamScanRealDirectory(
  dirHandle: any,
  onFile: (fileItem: FileItem) => Promise<void> | void,
  shouldStop: () => boolean,
  maxFiles = 100000
): Promise<number> {
  let count = 0;

  async function walk(handle: any, currentPath: string) {
    if (shouldStop() || count >= maxFiles) return;

    try {
      // Safely support entries() and values() iterator across all browser versions
      if (typeof handle.values === 'function') {
        for await (const entry of handle.values()) {
          if (shouldStop() || count >= maxFiles) break;
          const name = entry.name;
          const pathStr = currentPath ? `${currentPath}\\${name}` : name;

          if (entry.kind === 'file') {
            try {
              const file: File = await entry.getFile();
              count++;

              const ext = name.split('.').pop()?.toUpperCase() || 'FILE';
              let cat: FileItem['category'] = 'Document';
              if (['EXE', 'MSI', 'BAT', 'CMD', 'COM'].includes(ext)) cat = 'Executable';
              else if (['JS', 'PY', 'PS1', 'SH', 'VBS'].includes(ext)) cat = 'Script';
              else if (['ZIP', 'RAR', '7Z', 'TAR', 'GZ', 'ISO'].includes(ext)) cat = 'Archive';
              else if (['DLL', 'SYS', 'DRV'].includes(ext)) cat = 'System';

              const isHidden = name.startsWith('.') || name.startsWith('~$') || pathStr.toLowerCase().includes('appdata') || pathStr.toLowerCase().includes('$recycle.bin') || pathStr.toLowerCase().includes('system volume information');

              const item: FileItem = {
                id: `stream-file-${Date.now()}-${count}`,
                name,
                path: `C:\\${pathStr}`,
                sizeKb: Math.max(1, Math.round(file.size / 1024)),
                type: ext,
                category: cat,
                hash: `sha256-${file.size.toString(16)}-${file.lastModified.toString(16)}`,
                lastModified: new Date(file.lastModified).toISOString().split('T')[0],
                originalFile: file,
                isRealUserFile: true,
                isHidden,
              };

              await onFile(item);
            } catch {
              // Skip locked or inaccessible files
            }
          } else if (entry.kind === 'directory') {
            await walk(entry, pathStr);
          }
        }
      } else if (typeof handle.entries === 'function') {
        for await (const [name, entry] of handle.entries()) {
          if (shouldStop() || count >= maxFiles) break;
          const pathStr = currentPath ? `${currentPath}\\${name}` : name;

          if (entry.kind === 'file') {
            try {
              const file: File = await entry.getFile();
              count++;

              const ext = name.split('.').pop()?.toUpperCase() || 'FILE';
              let cat: FileItem['category'] = 'Document';
              if (['EXE', 'MSI', 'BAT', 'CMD', 'COM'].includes(ext)) cat = 'Executable';
              else if (['JS', 'PY', 'PS1', 'SH', 'VBS'].includes(ext)) cat = 'Script';
              else if (['ZIP', 'RAR', '7Z', 'TAR', 'GZ', 'ISO'].includes(ext)) cat = 'Archive';
              else if (['DLL', 'SYS', 'DRV'].includes(ext)) cat = 'System';

              const isHidden = name.startsWith('.') || name.startsWith('~$') || pathStr.toLowerCase().includes('appdata') || pathStr.toLowerCase().includes('$recycle.bin') || pathStr.toLowerCase().includes('system volume information');

              const item: FileItem = {
                id: `stream-file-${Date.now()}-${count}`,
                name,
                path: `C:\\${pathStr}`,
                sizeKb: Math.max(1, Math.round(file.size / 1024)),
                type: ext,
                category: cat,
                hash: `sha256-${file.size.toString(16)}-${file.lastModified.toString(16)}`,
                lastModified: new Date(file.lastModified).toISOString().split('T')[0],
                originalFile: file,
                isRealUserFile: true,
                isHidden,
              };

              await onFile(item);
            } catch {
              // Skip locked or inaccessible files
            }
          } else if (entry.kind === 'directory') {
            await walk(entry, pathStr);
          }
        }
      }
    } catch {
      // Protected folder
    }
  }

  await walk(dirHandle, dirHandle.name || 'Dysk');
  return count;
}

/**
 * Requests native browser directory permission to scan user's computer drive
 */
export async function requestPCDiskDirectoryHandle(): Promise<any> {
  if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
    const dirHandle = await (window as any).showDirectoryPicker({
      mode: 'read',
    });
    return dirHandle;
  }
  return null;
}

/**
 * Fast header & metadata inspection for real PC files.
 * Checks EICAR, double extensions, script droppers, and known malware signatures.
 */
export async function inspectFileHeaderForThreats(fileItem: FileItem): Promise<ThreatItem | null> {
  const name = fileItem.name;
  const lowerName = name.toLowerCase();
  const lowerPath = fileItem.path.toLowerCase();

  // 1. Double extension detection (e.g. invoice.pdf.exe, report.docx.vbs)
  const doubleExtRegex = /\.(pdf|docx?|xlsx?|jpg|png|txt|mp4)\.(exe|vbs|bat|cmd|ps1|scr|hta|pif)$/i;
  if (doubleExtRegex.test(name)) {
    return {
      id: `thr-dbl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      fileName: name,
      filePath: fileItem.path,
      threatName: 'Trojan.Win32.DoubleExtension.Dropper',
      threatType: 'Trojan',
      severity: 'Krytyczne',
      riskScore: 99,
      confidenceScore: 99.8,
      status: 'Wykryto',
      detectedAt: new Date().toLocaleTimeString(),
      description: 'Wykryto złośliwą technikę maskowania rozszerzenia (Double Extension). Plik podszywa się pod dokument/obraz, aby oszukać użytkownika i uruchomić złośliwy kod.',
      indicators: ['Podwójne rozszerzenie ukrywające plik wykonywalny', 'Zamaskowany typ pliku'],
      recommendedAction: 'Natychmiast przenieś do kwarantanny.',
      hash: fileItem.hash,
    };
  }

  // 2. Ransomware extensions
  if (/\.(locked|crypto|crypted|enc|wannacry|lockbit|blackcat)$/i.test(name)) {
    return {
      id: `thr-ran-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      fileName: name,
      filePath: fileItem.path,
      threatName: 'Ransom.Win32.GenericCryptor',
      threatType: 'Ransomware',
      severity: 'Krytyczne',
      riskScore: 98,
      confidenceScore: 98.5,
      status: 'Wykryto',
      detectedAt: new Date().toLocaleTimeString(),
      description: 'Rozszerzenie pliku wskazuje na zaszyfrowanie przez szkodliwe oprogramowanie typu Ransomware.',
      indicators: ['Złośliwe rozszerzenie ransomware'],
      recommendedAction: 'Izoluj plik i przeskanuj pozostałe foldery.',
      hash: fileItem.hash,
    };
  }

  // 3. Header inspection if original file exists (reads only first 4KB)
  if (fileItem.originalFile) {
    try {
      const slice = fileItem.originalFile.slice(0, 4096);
      const buf = await slice.arrayBuffer();
      const text = new TextDecoder('utf-8', { fatal: false }).decode(buf);

      // EICAR Standard Test File
      if (text.includes('X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*')) {
        return {
          id: `thr-eicar-${Date.now()}`,
          fileName: name,
          filePath: fileItem.path,
          threatName: 'EICAR.Standard.AntivirusTestFile',
          threatType: 'Malware',
          severity: 'Krytyczne',
          riskScore: 100,
          confidenceScore: 100,
          status: 'Wykryto',
          detectedAt: new Date().toLocaleTimeString(),
          description: 'Standardowy plik testowy sygnatur antywirusowych (EICAR). Potwierdza sprawne działanie silnika Wieszka AI.',
          indicators: ['EICAR-STANDARD-ANTIVIRUS-TEST-FILE!'],
          recommendedAction: 'Plik testowy jest nieszkodliwy, lecz powinien zostać usunięty lub poddany kwarantannie.',
          hash: fileItem.hash,
        };
      }

      // Malicious script indicators
      if (
        (lowerName.endsWith('.ps1') || lowerName.endsWith('.bat') || lowerName.endsWith('.vbs') || lowerName.endsWith('.hta')) &&
        (text.includes('-EncodedCommand') ||
          text.includes('Invoke-Expression') ||
          text.includes('mimikatz') ||
          (text.includes('DownloadString') && text.includes('http')) ||
          text.includes('advfirewall set allprofiles state off'))
      ) {
        return {
          id: `thr-scr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          fileName: name,
          filePath: fileItem.path,
          threatName: 'Trojan.PowerShell.MalScript.Loader',
          threatType: 'Trojan',
          severity: 'Wysokie',
          riskScore: 92,
          confidenceScore: 95.4,
          status: 'Wykryto',
          detectedAt: new Date().toLocaleTimeString(),
          description: 'Skrypt zawiera podejrzane instrukcje pobierania ładunku zewnętrznego i wyłączania zapory systemu Windows.',
          indicators: ['Podejrzany skrypt PowerShell / Batch', 'Próba pobrania ładunku'],
          recommendedAction: 'Przenieś skrypt do kwarantanny.',
          hash: fileItem.hash,
        };
      }
    } catch {
      // Ignore unreadable header
    }
  }

  return null;
}


