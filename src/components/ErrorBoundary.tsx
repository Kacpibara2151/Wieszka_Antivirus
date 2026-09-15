import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  props!: Props;
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Wieszka Antivirus Uncaught Error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('wieszka_user_profile');
      localStorage.removeItem('wieszka_user_subscription');
      localStorage.removeItem('wieszka_wizard_config');
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#09090B] text-slate-100 flex items-center justify-center p-6 font-sans select-none">
          <div className="max-w-md w-full bg-[#121217] border border-red-500/30 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-red-400">
              <ShieldAlert className="w-7 h-7 animate-pulse" />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white tracking-wide">WieszKa Guard — Wykryto błąd aplikacji</h2>
              <p className="text-xs text-slate-400">
                Wystąpił nieoczekiwany błąd w interfejsie. Ochrona silnika działa stabilnie.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-[#09090B] border border-slate-800 rounded-xl p-3 text-left font-mono text-[11px] text-red-300 overflow-x-auto max-h-32 scrollbar-thin">
                {this.state.error.message || this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-indigo-600/20"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Odśwież Aplikację & Resetuj Pamięć Podręczną</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
