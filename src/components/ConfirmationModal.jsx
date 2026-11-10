import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, AlertCircle, ArrowRight, X, Building, Tag, FileText, Check } from 'lucide-react';

export const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  complaintData, 
  isSubmitting 
}) => {
  const { lang, t } = useLanguage();
  const [confirmed, setConfirmed] = React.useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full border border-[#dee1e6] shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#dee1e6] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0052ff] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0a0b0d]">
                {t('regReviewTitle')}
              </h3>
              <p className="text-xs text-[#7c828a]">
                {t('portalSubtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-full text-[#7c828a] hover:text-[#0a0b0d] hover:bg-[#f7f7f7] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content details */}
        <div className="p-6 space-y-5 text-sm">
          <p className="text-xs text-[#5b616e] leading-relaxed">
            {t('regReviewNote')}
          </p>

          <div className="space-y-3 bg-[#f7f7f7] border border-[#dee1e6] rounded-2xl p-4">
            {/* Category */}
            <div className="flex items-start justify-between pb-3 border-b border-[#dee1e6]/60">
              <div className="flex items-center space-x-2 text-xs text-[#7c828a]">
                <Tag className="w-3.5 h-3.5 text-[#0052ff]" />
                <span>{t('regCategoryLabel')}</span>
              </div>
              <span className="font-semibold text-xs text-[#0a0b0d]">
                {complaintData.category}
              </span>
            </div>

            {/* Department */}
            <div className="flex items-start justify-between pb-3 border-b border-[#dee1e6]/60">
              <div className="flex items-center space-x-2 text-xs text-[#7c828a]">
                <Building className="w-3.5 h-3.5 text-[#0052ff]" />
                <span>{t('regDeptLabel')}</span>
              </div>
              <span className="font-semibold text-xs text-[#0a0b0d] text-right">
                {complaintData.department}
              </span>
            </div>

            {/* Language & Channel */}
            <div className="flex items-center justify-between pb-3 border-b border-[#dee1e6]/60 text-xs">
              <span className="text-[#7c828a]">{t('regLangLabel')}</span>
              <span className="font-semibold text-[#0a0b0d]">
                {complaintData.language === 'kn' ? 'ಕನ್ನಡ (Kannada)' : 'English'} • Web Portal
              </span>
            </div>

            {/* Complaint Text */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center space-x-2 text-xs text-[#7c828a]">
                <FileText className="w-3.5 h-3.5 text-[#0052ff]" />
                <span>{t('regTextLabel')}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#dee1e6] text-xs text-[#0a0b0d] whitespace-pre-wrap max-h-40 overflow-y-auto">
                {complaintData.complaint_text}
              </div>
            </div>
          </div>

          {/* Citizen Acknowledgement Checkbox */}
          <label className="flex items-start space-x-3 cursor-pointer p-2 rounded-xl hover:bg-[#f7f7f7] transition-colors">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              disabled={isSubmitting}
              className="mt-0.5 w-4 h-4 rounded text-[#0052ff] focus:ring-[#0052ff]"
            />
            <span className="text-xs text-[#0a0b0d] font-medium leading-relaxed">
              {t('regConfirmText')}
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="p-6 bg-[#f7f7f7] border-t border-[#dee1e6] flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-semibold text-[#5b616e] hover:text-[#0a0b0d] hover:bg-[#eef0f3] transition-colors"
          >
            {t('btnBackToEdit')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!confirmed || isSubmitting}
            className="w-full sm:w-auto btn-primary text-xs py-2.5 px-6 shadow-sm flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <span>{t('btnSubmitting')}</span>
            ) : (
              <>
                <span>{t('btnConfirmSubmit')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
