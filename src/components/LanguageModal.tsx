import React, { useState, useEffect } from 'react';
import { Globe, Check, ShieldCheck } from 'lucide-react';
import { LANGUAGES, LanguageCode, t } from '../i18n';

interface LanguageModalProps {
  isOpen: boolean;
  currentLang: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onClose: () => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({
  isOpen,
  currentLang,
  onSelectLanguage,
  onClose,
}) => {
  const [selected, setSelected] = useState<LanguageCode>(currentLang);

  useEffect(() => {
    if (isOpen) {
      setSelected(currentLang);
    }
  }, [isOpen, currentLang]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onSelectLanguage(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0D0D12] border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 text-slate-100 select-none">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-1">
            <Globe className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Select Your Language
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Choose your preferred language for Wieszka Guard security interface.
          </p>
        </div>

        {/* Language Options Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
          {LANGUAGES.map((lang) => {
            const isSelected = selected === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setSelected(lang.code)}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-900/30 ring-1 ring-indigo-500'
                    : 'bg-[#14141C] border-slate-800/80 hover:border-slate-700 text-slate-300 hover:text-white hover:bg-[#1A1A24]'
                }`}
              >
                <span className="flex items-center space-x-2.5 truncate">
                  <span className="text-lg leading-none">{lang.flag}</span>
                  <span className="truncate">{lang.name}</span>
                </span>
                {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>

        {/* Confirm Button */}
        <div className="pt-2">
          <button
            onClick={handleConfirm}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-900/40 transition active:scale-[0.99]"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t(selected, 'confirmLanguage')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
