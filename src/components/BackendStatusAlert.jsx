import React from 'react';
import { AlertCircle, RefreshCw, Terminal, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const BackendStatusAlert = ({ onRetry, isRetrying }) => {
  const { lang, t } = useLanguage();

  return (
    <div className="bg-amber-50/90 border border-amber-300/80 rounded-2xl p-5 text-amber-950 shadow-xs mb-6">
      <div className="flex items-start space-x-3.5">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="font-bold text-sm text-amber-950">
              {lang === 'kn' ? 'ಆಸ್ಪತ್ರೆ ಸರ್ವರ್ ಸಂಪರ್ಕ ವಿಫಲವಾಗಿದೆ (localhost:8000)' : 'Hospital Backend Server Offline (localhost:8000)'}
            </h4>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                disabled={isRetrying}
                className="self-start sm:self-center inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRetrying ? 'animate-spin' : ''}`} />
                {t('btnRetry')}
              </button>
            )}
          </div>

          <p className="text-xs text-amber-900 leading-relaxed">
            {t('errorBackendOffline')}
          </p>

          <div className="bg-white/80 border border-amber-200 rounded-xl p-3 text-[11px] font-mono text-amber-900">
            <div className="flex items-center space-x-1.5 text-amber-700 font-semibold mb-1">
              <Terminal className="w-3.5 h-3.5" />
              <span>FastAPI Backend Startup Command:</span>
            </div>
            <code className="text-gray-900 font-bold select-all">
              uvicorn main:app --reload --port 8000
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};
