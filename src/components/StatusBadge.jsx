import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Clock, CheckCircle, AlertTriangle, ArrowRightCircle, XCircle } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const { t } = useLanguage();
  const normalized = String(status || '').toLowerCase().trim();

  let styles = 'bg-gray-100 text-gray-700 border-gray-200';
  let Icon = Clock;
  let label = status || 'Unknown';

  if (normalized.includes('submit')) {
    styles = 'bg-blue-50 text-[#0052ff] border-blue-200';
    Icon = ArrowRightCircle;
    label = t('statusSubmitted');
  } else if (normalized.includes('progress') || normalized.includes('review') || normalized.includes('under')) {
    styles = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    Icon = Clock;
    label = t('statusInProgress');
  } else if (normalized.includes('pend')) {
    styles = 'bg-amber-50 text-amber-800 border-amber-200';
    Icon = AlertTriangle;
    label = t('statusPending');
  } else if (normalized.includes('resolve') || normalized.includes('closed') || normalized.includes('fixed')) {
    styles = 'bg-emerald-50 text-[#05b169] border-emerald-200';
    Icon = CheckCircle;
    label = t('statusResolved');
  } else if (normalized.includes('reject')) {
    styles = 'bg-rose-50 text-[#cf202f] border-rose-200';
    Icon = XCircle;
    label = t('statusRejected');
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${styles}`}>
      <Icon className="w-3.5 h-3.5 mr-1.5 shrink-0" />
      {label}
    </span>
  );
};

