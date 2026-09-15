import React, { useState } from 'react';
import {
  Database,
  RefreshCw,
  FileText,
  ShieldAlert,
  Search,
  CloudDownload,
  Biohazard,
  CheckCircle2,
  Bug,
  ShieldCheck,
  Zap,
  Filter
} from 'lucide-react';
import { VirusDefinition } from '../data/virusDatabase';
import { LanguageCode, getText } from '../i18n';

interface VirusDbAndLogsViewProps {
  virusDbVersion: string;
  virusDbUpdateDate: string;
  currentLang?: LanguageCode;
  onUpdateDb: () => void;
  logs: string[];
  virusDefinitions: VirusDefinition[];
  signaturesCount?: number;
}

export const VirusDbAndLogsView: React.FC<VirusDbAndLogsViewProps> = ({
  virusDbVersion,
  virusDbUpdateDate,
  currentLang = 'pl',
  onUpdateDb,
  logs = [],
  virusDefinitions = [],
  signaturesCount = 18429102,
}) => {
  const safeLogs = logs || [];
  const safeViruses = virusDefinitions || [];
  const [activeTab, setActiveTab] = useState<'viruses' | 'logs'>('viruses');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Wszystkie');

  const handleUpdateClick = () => {
    setIsUpdating(true);
    setUpdateMessage(
      getText(
        currentLang,
        'Łączenie z serwerem Wieszka Security Cloud (https://db-cloud.wieszka.security)...',
        'Connecting to Wieszka Security Cloud server (https://db-cloud.wieszka.security)...'
      )
    );

    setTimeout(() => {
      setUpdateMessage(
        getText(
          currentLang,
          'Pobieranie paczki 7.46 MB z nowo odkrytymi sygnaturami wirusów v2026.07.29.508...',
          'Downloading 7.46 MB signature update package v2026.07.29.508...'
        )
      );
    }, 1100);

    setTimeout(() => {
      setUpdateMessage(
        getText(
          currentLang,
          'Instalacja definicji i aktualizacja silnika skanera...',
          'Installing definitions and updating scanner engine...'
        )
      );
    }, 2100);

    setTimeout(() => {
      setIsUpdating(false);
      setUpdateMessage(
        getText(
          currentLang,
          'Baza sygnatur została pomyślnie zaktualizowana! Dodano 5 nowych groźnych wariantów wirusów.',
          'Signature database successfully updated! Added 5 new threat variants.'
        )
      );
      onUpdateDb();
    }, 3200);
  };

  const categories = ['Wszystkie', 'All', 'Malware', 'Trojan', 'Ransomware', 'Spyware', 'Keylogger', 'Adware', 'Rootkit'];

  const filteredViruses = safeViruses.filter((v) => {
    const matchesQuery =
      (v?.threatName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v?.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v?.targetPattern || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = (selectedCategory === 'Wszystkie' || selectedCategory === 'All') || v?.threatType === selectedCategory;
    return matchesQuery && matchesCat;
  });

  const filteredLogs = safeLogs.filter((l) => (typeof l === 'string' ? l : String(l || '')).toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#121217] p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3">
            <span className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
              <Database className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {getText(currentLang, 'Baza Sygnatur Wirusów & Dzienniki Zdarzeń', 'Virus Signature Database & Event Logs')}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            {getText(
              currentLang,
              'Pobieraj najnowsze wykryte szczepy wirusów, przeglądaj pełne sygnatury w bazie danych oraz monitoruj aktywność skanera i osłon.',
              'Download the latest virus strains, browse full database signatures, and monitor scanner activity.'
            )}
          </p>
        </div>

        <button
          onClick={handleUpdateClick}
          disabled={isUpdating}
          className={`px-6 py-3 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
            isUpdating
              ? 'bg-[#1A1A21] text-slate-500 border border-slate-800 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
          <span>
            {isUpdating
              ? getText(currentLang, 'Aktualizacja...', 'Updating...')
              : getText(currentLang, 'Sprawdź Aktualizacje Bazy', 'Check Database Updates')}
          </span>
        </button>
      </div>

      {updateMessage && (
        <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono flex items-center space-x-2">
          <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-indigo-400" />
          <span>{updateMessage}</span>
        </div>
      )}

      {/* Database Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#121217] p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">{getText(currentLang, 'Wersja Bazy Wirusów', 'Virus Database Version')}</span>
          <p className="text-xl font-bold text-indigo-400 font-mono">{virusDbVersion}</p>
          <span className="text-[10px] text-slate-500 block">
            {getText(currentLang, 'Ostatnia aktualizacja:', 'Last updated:')} {virusDbUpdateDate}
          </span>
        </div>

        <div className="bg-[#121217] p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">{getText(currentLang, 'Liczba Wzorców Sygnatur', 'Signatures Count')}</span>
          <p className="text-xl font-bold text-white font-mono">{signaturesCount.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-400 block">
            {getText(currentLang, 'Wykrywanie zagrożeń x86 / x64 / ARM64', 'x86 / x64 / ARM64 Threat Detection')}
          </span>
        </div>

        <div className="bg-[#121217] p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">{getText(currentLang, 'Liczba Wirusów w Bazie', 'Viruses in Database')}</span>
          <p className="text-xl font-bold text-rose-400 font-mono">
            {safeViruses.length} {getText(currentLang, 'Odkrytych Szczepów', 'Discovered Strains')}
          </p>
          <span className="text-[10px] text-purple-400 block">
            {getText(currentLang, 'Wszystkie aktywnie blokowane', 'All actively blocked')}
          </span>
        </div>
      </div>

      {/* Main Container with Tabs */}
      <div className="bg-[#121217] p-6 rounded-3xl border border-slate-800 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex bg-[#1A1A21] p-1 rounded-2xl border border-slate-800 text-xs font-semibold w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('viruses')}
              className={`px-5 py-2 rounded-xl transition flex items-center space-x-2 ${
                activeTab === 'viruses'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Biohazard className="w-4 h-4" />
              <span>{getText(currentLang, 'Odkryte Wirusy w Bazie', 'Discovered Viruses in DB')} ({safeViruses.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-5 py-2 rounded-xl transition flex items-center space-x-2 ${
                activeTab === 'logs'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{getText(currentLang, 'Dziennik Zdarzeń', 'Event Logs')} ({safeLogs.length})</span>
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'viruses'
                  ? getText(currentLang, 'Szukaj nazwy wirusa lub wzorca...', 'Search virus name or pattern...')
                  : getText(currentLang, 'Filtruj wpisy w logach...', 'Filter log entries...')
              }
              className="bg-[#1A1A21] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-full"
            />
          </div>
        </div>

        {activeTab === 'viruses' ? (
          <div className="space-y-4">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 flex items-center gap-1 mr-1 font-bold">
                <Filter className="w-3.5 h-3.5" />
                <span>{getText(currentLang, 'Kategoria:', 'Category:')}</span>
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    selectedCategory === cat
                      ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-300'
                      : 'bg-[#1A1A21] text-slate-400 hover:text-white border border-slate-800/60'
                  }`}
                >
                  {cat === 'Wszystkie' ? getText(currentLang, 'Wszystkie', 'All') : cat}
                </button>
              ))}
            </div>

            {/* Viruses Grid/List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredViruses.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-slate-500 text-xs">
                  {getText(currentLang, 'Brak wirusów spełniających podane kryteria wyszukiwania.', 'No viruses match the search criteria.')}
                </div>
              ) : (
                filteredViruses.map((v) => (
                  <div
                    key={v.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      v.isNewlyDownloaded
                        ? 'bg-gradient-to-br from-[#121217] to-indigo-950/30 border-indigo-500/40'
                        : 'bg-[#1A1A21] border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-white text-sm font-mono">{v.threatName}</h4>
                          {v.isNewlyDownloaded && (
                            <span className="bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                              {getText(currentLang, 'NOWO POBRANY', 'NEWLY DOWNLOADED')}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{v.description}</p>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border shrink-0 ${
                          v.severity === 'Krytyczne'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                            : v.severity === 'Wysokie'
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                        }`}
                      >
                        {v.severity === 'Krytyczne' ? getText(currentLang, 'Krytyczne', 'Critical') : (v.severity === 'Wysokie' ? getText(currentLang, 'Wysokie', 'High') : v.severity)}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div>
                        <span className="text-slate-500 block text-[10px]">{getText(currentLang, 'Wzorzec Wirusa / Pliku:', 'Virus Pattern / File:')}</span>
                        <span className="text-indigo-300 font-bold">{v.targetPattern}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">{getText(currentLang, 'Wskaźnik Ryzyka:', 'Risk Score:')}</span>
                        <span className="text-rose-400 font-bold">{v.riskScore} / 100</span>
                      </div>
                    </div>

                    <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
                      <span>{getText(currentLang, 'Data wykrycia:', 'Discovered date:')} {v.discoveredDate}</span>
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{getText(currentLang, 'Aktywne Wykrywanie', 'Active Detection')}</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Audit Logs View */
          <div className="bg-[#1A1A21] p-4 rounded-2xl border border-slate-800 font-mono text-xs max-h-[500px] overflow-y-auto scrollbar-thin space-y-1.5">
            {filteredLogs.length === 0 ? (
              <p className="text-slate-500 text-center py-6">{getText(currentLang, 'Brak wpisów pasujących do kryteriów.', 'No entries matching criteria.')}</p>
            ) : (
              filteredLogs.map((log, index) => (
                <div
                  key={index}
                  className={`py-1.5 border-b border-slate-800/50 leading-relaxed ${
                    log.includes('WYKRYTO') ? 'text-rose-400 font-bold' :
                    log.includes('POBRANO') || log.includes('AKTUALIZACJA') ? 'text-indigo-300 font-bold' :
                    log.includes('BEZPIECZNY') ? 'text-emerald-400' :
                    log.includes('AI') ? 'text-purple-300' : 'text-slate-400'
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
