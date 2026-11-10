import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { BackendStatusAlert } from '../components/BackendStatusAlert';
import { DEPARTMENT_MAPPING, DEPARTMENT_MAPPING_KN } from '../translations';
import { 
  FileText, 
  Mic, 
  Tag, 
  Building, 
  CheckCircle2, 
  Copy, 
  ArrowRight, 
  AlertCircle, 
  Search, 
  Info, 
  RotateCcw,
  Sparkles,
  PhoneCall
} from 'lucide-react';

const CATEGORIES = [
  "Medicine unavailable",
  "Doctor or staff unavailable",
  "Cleanliness problem",
  "Drinking water problem",
  "Bed availability",
  "Infrastructure problem",
  "Other"
];

const CATEGORIES_KN = {
  "Medicine unavailable": "ಔಷಧಿ ಲಭ್ಯವಿಲ್ಲ",
  "Doctor or staff unavailable": "ವೈದ್ಯರು ಅಥವಾ ಸಿಬ್ಬಂದಿ ಅಲಭ್ಯ",
  "Cleanliness problem": "ಸ್ವಚ್ಛತೆಯ ಕೊರತೆ",
  "Drinking water problem": "ಕುಡಿಯುವ ನೀರಿನ ಸಮಸ್ಯೆ",
  "Bed availability": "ಹಾಸಿಗೆ ಲಭ್ಯತೆ ಸಮಸ್ಯೆ",
  "Infrastructure problem": "ಮೂಲಸೌಕರ್ಯ ತೊಂದರೆ",
  "Other": "ಇತರ ಸಮಸ್ಯೆಗಳು"
};

export const RegisterPage = () => {
  const { lang, setLang, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Registration state
  const [inputMode, setInputMode] = useState('voice'); // 'voice' | 'manual'
  const [complaintText, setComplaintText] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [department, setDepartment] = useState(DEPARTMENT_MAPPING[CATEGORIES[0]]);
  const [selectedLanguage, setSelectedLanguage] = useState(lang);

  // Review modal state
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Post-submission confirmation state
  const [registeredComplaint, setRegisteredComplaint] = useState(null);
  const [copied, setCopied] = useState(false);

  // Sync category from query params if passed
  useEffect(() => {
    const qCat = searchParams.get('cat');
    if (qCat) {
      const match = CATEGORIES.find(c => c.toLowerCase() === qCat.toLowerCase()) || 
                    CATEGORIES.find(c => CATEGORIES_KN[c] === qCat);
      if (match) {
        setCategory(match);
        setDepartment(lang === 'kn' ? DEPARTMENT_MAPPING_KN[match] : DEPARTMENT_MAPPING[match]);
      }
    }
  }, [searchParams, lang]);

  // Keep department mapped when category or language changes
  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    const dept = lang === 'kn' ? (DEPARTMENT_MAPPING_KN[newCat] || DEPARTMENT_MAPPING[newCat]) : DEPARTMENT_MAPPING[newCat];
    setDepartment(dept);
  };

  // Auto-detect category keywords if user types or speaks
  useEffect(() => {
    const lower = complaintText.toLowerCase();
    if (lower.includes('medicine') || lower.includes('tablet') || lower.includes('syrup') || lower.includes('pharmacy') || lower.includes('ಔಷಧ') || lower.includes('ಮಾತ್ರೆ')) {
      handleCategoryChange("Medicine unavailable");
    } else if (lower.includes('doctor') || lower.includes('nurse') || lower.includes('staff') || lower.includes('absent') || lower.includes('ವೈದ್ಯ') || lower.includes('ನರ್ಸ್')) {
      handleCategoryChange("Doctor or staff unavailable");
    } else if (lower.includes('dirty') || lower.includes('clean') || lower.includes('toilet') || lower.includes('garbage') || lower.includes('ವಾಸನೆ') || lower.includes('ಕಸ') || lower.includes('ಸ್ವಚ್ಛ')) {
      handleCategoryChange("Cleanliness problem");
    } else if (lower.includes('water') || lower.includes('drinking') || lower.includes('tap') || lower.includes('ನೀರು') || lower.includes('ಕುಡಿಯುವ')) {
      handleCategoryChange("Drinking water problem");
    } else if (lower.includes('bed') || lower.includes('admit') || lower.includes('stretcher') || lower.includes('ಹಾಸಿಗೆ') || lower.includes('ಬೆಡ್')) {
      handleCategoryChange("Bed availability");
    } else if (lower.includes('fan') || lower.includes('light') || lower.includes('lift') || lower.includes('power') || lower.includes('ಕರಂಟ್') || lower.includes('ಫ್ಯಾನ್') || lower.includes('ಲಿಫ್ಟ್')) {
      handleCategoryChange("Infrastructure problem");
    }
  }, [complaintText]);

  // Handle open review modal
  const handleReviewClick = (e) => {
    e.preventDefault();
    setSubmitError(null);
    if (!complaintText.trim()) {
      setSubmitError(lang === 'kn' ? 'ದಯವಿಟ್ಟು ದೂರಿನ ವಿವರವನ್ನು ನಮೂದಿಸಿ ಅಥವಾ ಧ್ವನಿ ಮೂಲಕ ಮಾತನಾಡಿ.' : 'Please enter or speak your complaint description.');
      return;
    }
    setIsReviewOpen(true);
  };

  // Submit to real backend POST /api/complaints
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      complaint_text: complaintText.trim(),
      language: selectedLanguage,
      source: 'web',
      category: category,
      department: department
    };

    try {
      const data = await api.registerComplaint(payload);
      // Backend returned real complaint ID and saved details
      setRegisteredComplaint(data);
      setIsReviewOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Submission failed:', err);
      const msg = err.response?.data?.detail || err.message || 'Failed to submit complaint to hospital server.';
      setSubmitError(msg);
      setIsReviewOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyIdToClipboard = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(String(id));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // ==========================================
  // SUCCESS VIEW: Shown ONLY after backend response
  // ==========================================
  if (registeredComplaint) {
    const complaintId = registeredComplaint.id || registeredComplaint.complaint_id || registeredComplaint.tracking_id;
    return (
      <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-200">
          {/* Success card */}
          <div className="border border-emerald-200 bg-emerald-50/50 rounded-3xl p-8 sm:p-10 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0a0b0d]">
                {t('regSuccessTitle')}
              </h1>
              <p className="mt-2 text-sm text-[#5b616e]">
                {t('regSuccessDesc')}
              </p>
            </div>

            {/* Complaint ID Box */}
            <div className="bg-white border-2 border-emerald-300 rounded-2xl p-6 shadow-xs max-w-md mx-auto">
              <span className="text-xs uppercase font-semibold text-[#7c828a] tracking-wider block">
                {t('regYourId')}
              </span>
              <div className="text-3xl font-mono font-bold text-[#0052ff] my-2 select-all tracking-tight">
                {complaintId}
              </div>
              <button
                type="button"
                onClick={() => copyIdToClipboard(complaintId)}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[#eef0f3] hover:bg-[#e2e5ea] text-xs font-semibold text-[#0a0b0d] transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? t('regIdCopied') : t('regCopyId')}</span>
              </button>
            </div>

            {/* Next Steps List */}
            <div className="bg-white/80 border border-[#dee1e6] rounded-2xl p-6 text-left space-y-3">
              <h4 className="font-semibold text-xs text-[#0a0b0d] uppercase tracking-wider">
                {t('regNextSteps')}
              </h4>
              <ul className="space-y-2 text-xs text-[#5b616e]">
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0052ff] shrink-0 mt-1.5"></span>
                  <span>{t('regNextStep1')}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0052ff] shrink-0 mt-1.5"></span>
                  <span>{t('regNextStep2')}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0052ff] shrink-0 mt-1.5"></span>
                  <span>{t('regNextStep3')}</span>
                </li>
              </ul>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                to={`/track?id=${encodeURIComponent(complaintId)}`}
                className="w-full sm:w-auto btn-primary text-xs py-3 px-6 shadow-xs flex items-center justify-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>{t('btnTrackThisGrievance')}</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setRegisteredComplaint(null);
                  setComplaintText('');
                  setSubmitError(null);
                }}
                className="w-full sm:w-auto btn-secondary text-xs py-3 px-6"
              >
                {t('btnRegisterAnother')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // REGISTRATION FORM VIEW
  // ==========================================
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 bg-[#f7f7f7] border border-[#dee1e6] px-3.5 py-1 rounded-full text-xs font-semibold text-[#0052ff]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Public Health Grievance Form</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-normal text-[#0a0b0d] tracking-tight">
            {t('regTitle')}
          </h1>
          <p className="text-sm text-[#5b616e] max-w-xl mx-auto">
            {t('regSubtitle')}
          </p>
        </div>

        {/* Global Submit Error if backend failed */}
        {submitError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 text-red-900 text-xs">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="block font-semibold">Error submitting grievance:</strong>
              <span>{submitError}</span>
              <p className="mt-1 text-[11px] text-red-700">
                Please verify that the hospital backend at <code className="font-mono font-bold">http://localhost:8000</code> is running.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleReviewClick} className="space-y-6">
          {/* Card: Language & Mode Selection */}
          <div className="card-coinbase p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#dee1e6]">
              {/* Language selection */}
              <div>
                <label className="block text-xs font-semibold text-[#0a0b0d] uppercase tracking-wider mb-2">
                  {t('regLangLabel')}
                </label>
                <div className="inline-flex items-center bg-[#eef0f3] p-1 rounded-full border border-[#dee1e6]">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLanguage('en');
                      setLang('en');
                    }}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                      selectedLanguage === 'en'
                        ? 'bg-white text-[#0a0b0d] shadow-xs'
                        : 'text-[#5b616e] hover:text-[#0a0b0d]'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLanguage('kn');
                      setLang('kn');
                    }}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                      selectedLanguage === 'kn'
                        ? 'bg-[#0052ff] text-white shadow-xs'
                        : 'text-[#5b616e] hover:text-[#0a0b0d]'
                    }`}
                  >
                    ಕನ್ನಡ (Kannada)
                  </button>
                </div>
              </div>

              {/* Mode Toggle: Voice vs Manual */}
              <div>
                <label className="block text-xs font-semibold text-[#0a0b0d] uppercase tracking-wider mb-2">
                  {lang === 'kn' ? 'ದಾಖಲಿಸುವ ವಿಧಾನ' : 'Input Method'}
                </label>
                <div className="inline-flex items-center bg-[#eef0f3] p-1 rounded-full border border-[#dee1e6]">
                  <button
                    type="button"
                    onClick={() => setInputMode('voice')}
                    className={`inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                      inputMode === 'voice'
                        ? 'bg-[#0052ff] text-white shadow-xs'
                        : 'text-[#5b616e] hover:text-[#0a0b0d]'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5 mr-1.5" />
                    <span>{t('regModeVoice')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('manual')}
                    className={`inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                      inputMode === 'manual'
                        ? 'bg-[#0052ff] text-white shadow-xs'
                        : 'text-[#5b616e] hover:text-[#0a0b0d]'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 mr-1.5" />
                    <span>{t('regModeManual')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Voice Input Section (Web Speech API) */}
            {inputMode === 'voice' && (
              <div className="space-y-4">
                <VoiceRecorder
                  selectedLang={selectedLanguage}
                  currentText={complaintText}
                  onTranscriptChange={(newText) => setComplaintText(newText)}
                />
              </div>
            )}

            {/* Complaint Text Area (Editable in both Voice and Manual modes) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#0a0b0d] uppercase tracking-wider">
                  {inputMode === 'voice' ? t('regSpeechRecognized') : t('regTextLabel')}
                </label>
                {complaintText && (
                  <button
                    type="button"
                    onClick={() => setComplaintText('')}
                    className="text-[11px] text-[#7c828a] hover:text-[#cf202f] transition-colors"
                  >
                    {lang === 'kn' ? 'ಪಠ್ಯ ಅಳಿಸಿ' : 'Clear Text'}
                  </button>
                )}
              </div>
              <textarea
                rows={5}
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder={t('regTextPlaceholder')}
                className="w-full p-4 rounded-xl border border-[#dee1e6] bg-white text-[#0a0b0d] text-sm focus:outline-none focus:border-[#0052ff] focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-[#a8acb3]"
                required
              />
              <p className="text-[11px] text-[#7c828a]">
                {lang === 'kn' 
                  ? 'ಧ್ವನಿ ಮೂಲಕ ಮಾತನಾಡಿದ ನಂತರ, ಅಗತ್ಯವಿದ್ದರೆ ಪಠ್ಯವನ್ನು ಇಲ್ಲಿ ಸಂಪಾದಿಸಬಹುದು.'
                  : 'You can freely edit the recognised speech text before submitting.'}
              </p>
            </div>
          </div>

          {/* Card: Category & Assigned Department */}
          <div className="card-coinbase p-6 space-y-6">
            <h3 className="text-base font-semibold text-[#0a0b0d] flex items-center">
              <Tag className="w-4 h-4 mr-2 text-[#0052ff]" />
              <span>{lang === 'kn' ? 'ವಿಭಾಗ ಮತ್ತು ವರ್ಗೀಕರಣ' : 'Category & Department Assignment'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category selector */}
              <div>
                <label className="block text-xs font-semibold text-[#0a0b0d] uppercase tracking-wider mb-2">
                  {t('regCategoryLabel')}
                </label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-[#dee1e6] bg-white text-[#0a0b0d] text-sm focus:outline-none focus:border-[#0052ff] font-medium"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {lang === 'kn' ? CATEGORIES_KN[cat] || cat : cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department display */}
              <div>
                <label className="block text-xs font-semibold text-[#0a0b0d] uppercase tracking-wider mb-2">
                  {t('regDeptLabel')}
                </label>
                <div className="p-3.5 rounded-xl border border-[#dee1e6] bg-[#f7f7f7] text-[#0a0b0d] text-sm font-semibold flex items-center space-x-2">
                  <Building className="w-4 h-4 text-[#0052ff] shrink-0" />
                  <span className="truncate">{department}</span>
                </div>
                <p className="text-[11px] text-[#7c828a] mt-1.5">
                  {t('regDeptAutoHint')}
                </p>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#7c828a] flex items-center space-x-2">
              <Info className="w-4 h-4 text-[#0052ff] shrink-0" />
              <span>
                {lang === 'kn'
                  ? 'ಸಲ್ಲಿಸುವ ಮುನ್ನ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ದೃಢೀಕರಣ ವಿಂಡೋ ತೆರೆಯುತ್ತದೆ.'
                  : 'You will review and confirm all details before grievance submission.'}
              </span>
            </div>

            <button
              type="submit"
              disabled={!complaintText.trim()}
              className="w-full sm:w-auto btn-primary py-3.5 px-8 text-sm shadow-xs flex items-center justify-center space-x-2"
            >
              <span>{t('btnReviewSubmit')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onConfirm={handleFinalSubmit}
        isSubmitting={isSubmitting}
        complaintData={{
          complaint_text: complaintText,
          category: lang === 'kn' ? CATEGORIES_KN[category] || category : category,
          department: department,
          language: selectedLanguage
        }}
      />
    </div>
  );
};
