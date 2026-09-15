import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Play,
  Zap,
  Search,
  FolderSearch,
  Sliders,
  Bell,
  Check,
  X
} from 'lucide-react';
import { ScheduledScan, ScheduleFrequency, ScanType } from '../types';
import { LanguageCode, t, getText } from '../i18n';

interface ScheduledScansViewProps {
  schedules: ScheduledScan[];
  currentLang?: LanguageCode;
  onAddSchedule: (schedule: Omit<ScheduledScan, 'id'>) => void;
  onToggleSchedule: (id: string) => void;
  onDeleteSchedule: (id: string) => void;
  onRunNow: (schedule: ScheduledScan) => void;
}

export const ScheduledScansView: React.FC<ScheduledScansViewProps> = ({
  schedules = [],
  currentLang = 'en',
  onAddSchedule,
  onToggleSchedule,
  onDeleteSchedule,
  onRunNow,
}) => {
  const safeSchedules = schedules || [];
  const [isAddingModalOpen, setIsAddingModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState<ScheduleFrequency>('daily');
  const [time, setTime] = useState('14:30');
  const [scanType, setScanType] = useState<ScanType>('quick');
  const [targetPath, setTargetPath] = useState('C:\\Users\\User\\Downloads');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddSchedule({
      title: title.trim(),
      frequency,
      time,
      scanType,
      targetPath: scanType === 'custom' ? targetPath : undefined,
      enabled: true,
      lastRun: 'Never',
      nextRun: `Today at ${time}`,
    });

    setTitle('');
    setIsAddingModalOpen(false);
  };

  const frequencyLabels: Record<ScheduleFrequency, string> = {
    daily: getText(currentLang, 'Codziennie', 'Daily'),
    weekly: getText(currentLang, 'Co tydzień', 'Weekly'),
    monthly: getText(currentLang, 'Co miesiąc', 'Monthly'),
    interval: getText(currentLang, 'Interwał czasowy', 'Interval (Every X hrs)'),
  };

  const scanTypeLabels: Record<ScanType, string> = {
    quick: t(currentLang, 'quickScan'),
    full: t(currentLang, 'fullSystemScan'),
    custom: t(currentLang, 'customFolder'),
    ai: getText(currentLang, 'Głęboka analiza heurystyczna AI', 'Deep AI Heuristic Analysis'),
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-[#121217] p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3">
            <span className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Calendar className="w-5 h-5 text-indigo-400" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {t(currentLang, 'scheduledScans')}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            {getText(
              currentLang,
              'Skonfiguruj zaplanowane zadania skanowania systemu. Antywirus Wieszka Guard automatycznie przeprowadzi skan w tle o wyznaczonej porze.',
              'Configure scheduled system scans. Wieszka Guard Antivirus will automatically perform scans in the background at the specified time.'
            )}
          </p>
        </div>

        <button
          onClick={() => setIsAddingModalOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-900/30 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>{t(currentLang, 'newSchedule')}</span>
        </button>
      </div>


      {/* Schedules List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {safeSchedules.map((item) => (
          <div
            key={item.id}
            className={`p-6 rounded-3xl border transition-all duration-200 space-y-4 ${
              item.enabled
                ? 'bg-[#121217] border-slate-800 shadow-xl'
                : 'bg-[#121217]/50 border-slate-900 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                  <h3 className="font-bold text-white text-sm">{item.title}</h3>
                </div>
                <div className="flex items-center space-x-2 text-xs text-indigo-300 font-mono">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{frequencyLabels[item.frequency]} {getText(currentLang, 'o godzinie', 'at')} {item.time}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => onToggleSchedule(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${
                    item.enabled
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {item.enabled ? t(currentLang, 'active') : t(currentLang, 'disabled')}
                </button>
                <button
                  onClick={() => onDeleteSchedule(item.id)}
                  className="p-1.5 hover:bg-rose-500/10 hover:text-rose-400 text-slate-500 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-[#1A1A21] p-3 rounded-xl border border-slate-800/60 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>{getText(currentLang, 'Typ Skanowania:', 'Scan Type:')}</span>
                <span className="font-semibold text-slate-200">{scanTypeLabels[item.scanType]}</span>
              </div>
              {item.targetPath && (
                <div className="flex justify-between text-slate-400 font-mono text-[11px]">
                  <span>{getText(currentLang, 'Ścieżka:', 'Path:')}</span>
                  <span className="text-indigo-300 truncate max-w-[200px]">{item.targetPath}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>{getText(currentLang, 'Następne uruchomienie:', 'Next Run:')} <strong className="text-slate-200">{item.nextRun || getText(currentLang, 'Zaplanowano', 'Scheduled')}</strong></span>
              <button
                onClick={() => onRunNow(item)}
                className="px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 font-semibold rounded-lg border border-indigo-500/30 transition flex items-center gap-1.5"
              >
                <Play className="w-3 h-3 text-indigo-400 fill-indigo-400" />
                <span>{getText(currentLang, 'Uruchom Teraz', 'Run Now')}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Schedule Modal */}
      {isAddingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-[#121217] border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <span>{t(currentLang, 'newSchedule')}</span>
              </h3>
              <button
                onClick={() => setIsAddingModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">{getText(currentLang, 'Nazwa Zadania:', 'Task Title:')}</label>
                <input
                  type="text"
                  required
                  placeholder={getText(currentLang, 'np. Codzienny Skan Nocny', 'e.g. Daily Night Scan')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#1A1A21] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">{getText(currentLang, 'Częstotliwość:', 'Frequency:')}</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full bg-[#1A1A21] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="daily">{getText(currentLang, 'Codziennie', 'Daily')}</option>
                    <option value="weekly">{getText(currentLang, 'Co tydzień', 'Weekly')}</option>
                    <option value="monthly">{getText(currentLang, 'Co miesiąc', 'Monthly')}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">{getText(currentLang, 'Godzina:', 'Time:')}</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-[#1A1A21] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">{getText(currentLang, 'Typ Skanowania:', 'Scan Type:')}</label>
                <select
                  value={scanType}
                  onChange={(e) => setScanType(e.target.value as any)}
                  className="w-full bg-[#1A1A21] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="quick">{t(currentLang, 'quickScan')}</option>
                  <option value="full">{t(currentLang, 'fullSystemScan')}</option>
                  <option value="custom">{t(currentLang, 'customFolder')}</option>
                </select>
              </div>

              {scanType === 'custom' && (
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">{getText(currentLang, 'Ścieżka Folderu:', 'Folder Path:')}</label>
                  <input
                    type="text"
                    value={targetPath}
                    onChange={(e) => setTargetPath(e.target.value)}
                    className="w-full bg-[#1A1A21] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddingModalOpen(false)}
                  className="px-4 py-2 bg-[#1A1A21] text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-800"
                >
                  {t(currentLang, 'cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg"
                >
                  {getText(currentLang, 'Zapisz Harmonogram', 'Save Schedule')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
