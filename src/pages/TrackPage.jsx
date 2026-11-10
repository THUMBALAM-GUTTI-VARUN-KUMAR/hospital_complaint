import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { BackendStatusAlert } from '../components/BackendStatusAlert';
import { 
  Search, 
  Calendar, 
  Tag, 
  Building, 
  PhoneCall, 
  Globe, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Copy, 
  Printer, 
  RefreshCw,
  ArrowRight,
  Volume2,
  VolumeX,
  User,
  ExternalLink
} from 'lucide-react';

export const TrackPage = () => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [complaintIdInput, setComplaintIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userComplaints, setUserComplaints] = useState([]);

  // If query parameter ?id=... is present, auto-fetch
  useEffect(() => {
    const qId = searchParams.get('id');
    if (qId) {
      setComplaintIdInput(qId);
      fetchComplaint(qId);
    }
  }, [searchParams]);

  // Load user's complaints if logged in as patient
  useEffect(() => {
    if (user?.role === 'patient') {
      api.getAllComplaints().then((data) => {
        const list = Array.isArray(data) ? data : (data.complaints || []);
        setUserComplaints(list.slice(0, 5));
      }).catch(() => {});
    }
  }, [user]);

  // Clean up speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const fetchComplaint = async (idToFetch) => {
    const targetId = idToFetch || complaintIdInput;
    if (!targetId || !targetId.trim()) return;

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    setLoading(true);
    setError(null);
    setComplaint(null);

    try {
      const data = await api.getComplaint(targetId.trim());
      setComplaint(data);
    } catch (err) {
      console.error('Error fetching complaint:', err);
      if (err.response?.status === 404) {
        setError({
          type: '404',
          message: `${t('trackNotFoundDesc')} "${targetId.trim()}"`
        });
      } else {
        setError({
          type: 'network',
          message: err.response?.data?.detail || err.message || 'Failed to reach hospital server. Please check your connection.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (complaintIdInput.trim()) {
      setSearchParams({ id: complaintIdInput.trim() });
      fetchComplaint(complaintIdInput.trim());
    }
  };

  const copyId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(String(id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Accessibility: Text-to-speech audio status reading
  const toggleSpeech = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!complaint) return;

    const cId = complaint.complaint_id || complaint.id || complaintIdInput;
    const statusText = complaint.status || 'Submitted';
    const deptText = complaint.department || 'Hospital Administration';
    const descText = complaint.complaint_text || '';

    let textToSpeak = '';
    if (lang === 'kn') {
      textToSpeak = `ದೂರು ಸಂಖ್ಯೆ: ${cId}. ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ: ${statusText}. ನಿಯೋಜಿತ ಇಲಾಖೆ: ${deptText}. ದೂರಿನ ವಿವರ: ${descText}`;
    } else {
      textToSpeak = `Complaint ID: ${cId}. Current status is: ${statusText}. Assigned department: ${deptText}. Grievance summary: ${descText}`;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang === 'kn' ? 'kn-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Page Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 bg-[#f7f7f7] border border-[#dee1e6] px-3.5 py-1 rounded-full text-xs font-semibold text-[#0052ff]">
            <Search className="w-3.5 h-3.5" />
            <span>Public Tracking Desk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-normal text-[#0a0b0d] tracking-tight">
            {t('trackTitle')}
          </h1>
          <p className="text-sm text-[#5b616e] max-w-xl mx-auto">
            {t('trackSubtitle')}
          </p>
        </div>

        {/* Citizen Quick Access List (if logged in as patient) */}
        {user?.role === 'patient' && userComplaints.length > 0 && (
          <div className="bg-[#f7f7f7] border border-[#dee1e6] rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#0a0b0d] flex items-center">
                <User className="w-4 h-4 mr-1.5 text-emerald-600" />
                <span>{lang === 'kn' ? 'ನನ್ನ ದಾಖಲಾದ ದೂರುಗಳು' : 'My Filed Grievances'} ({user.name})</span>
              </span>
              <span className="text-[11px] text-[#7c828a]">Click ID to view</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {userComplaints.map((c) => {
                const cId = c.complaint_id || c.id;
                return (
                  <button
                    key={cId}
                    type="button"
                    onClick={() => {
                      setComplaintIdInput(cId);
                      setSearchParams({ id: cId });
                      fetchComplaint(cId);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono font-semibold border transition-all ${
                      complaintIdInput === cId
                        ? 'bg-[#0052ff] text-white border-[#0052ff] shadow-xs'
                        : 'bg-white text-[#0a0b0d] border-[#dee1e6] hover:border-[#0052ff]'
                    }`}
                  >
                    {cId}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Search Input Box */}
        <div className="card-coinbase p-6 sm:p-8 space-y-4">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={complaintIdInput}
                onChange={(e) => setComplaintIdInput(e.target.value)}
                placeholder={t('trackInputPlaceholder')}
                className="w-full pl-11 pr-4 py-3.5 rounded-full border border-[#dee1e6] bg-white text-[#0a0b0d] text-sm focus:outline-none focus:border-[#0052ff] focus:ring-2 focus:ring-blue-100 font-mono font-medium"
                required
              />
              <Search className="w-4 h-4 text-[#7c828a] absolute left-4 top-1/2 -translate-y-1/2" />
            </div>

            <button
              type="submit"
              disabled={loading || !complaintIdInput.trim()}
              className="btn-primary py-3.5 px-8 text-sm shadow-xs shrink-0 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t('btnSearching')}</span>
                </>
              ) : (
                <>
                  <span>{t('btnCheckStatus')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-[#7c828a] flex items-center space-x-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-[#0052ff] shrink-0" />
            <span>
              {lang === 'kn'
                ? 'ದೂರು ಸಂಖ್ಯೆಯು SMS ಅಥವಾ ವೆಬ್ ನೋಂದಣಿ ದೃಢೀಕರಣದಲ್ಲಿ ಲಭ್ಯವಿರುತ್ತದೆ.'
                : 'Complaint IDs are generated during web registration or sent via SMS for voice call complaints.'}
            </span>
          </p>
        </div>

        {/* Error / Not Found Message */}
        {error && (
          <div className="p-6 bg-red-50/70 border border-red-200 rounded-3xl space-y-3 animate-in fade-in">
            <div className="flex items-center space-x-3 text-red-800">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <h3 className="font-bold text-sm">
                {error.type === '404' ? t('trackNotFoundTitle') : 'Connection Error'}
              </h3>
            </div>
            <p className="text-xs text-red-900 leading-relaxed pl-8">
              {error.message}
            </p>
            {error.type === '404' && (
              <p className="text-[11px] text-red-700 pl-8">
                {t('trackNotFoundAdvice')}
              </p>
            )}
            {error.type === 'network' && (
              <div className="pl-8 pt-2">
                <BackendStatusAlert onRetry={() => fetchComplaint()} isRetrying={loading} />
              </div>
            )}
          </div>
        )}

        {/* Real Complaint Details Display */}
        {complaint && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Card */}
            <div className="card-coinbase p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#dee1e6] gap-4">
                <div>
                  <span className="text-xs uppercase font-semibold text-[#7c828a] tracking-wider">
                    {t('dashColId')}
                  </span>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-2xl font-mono font-bold text-[#0a0b0d]">
                      {complaint.complaint_id || complaint.id || complaintIdInput}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyId(complaint.complaint_id || complaint.id || complaintIdInput)}
                      className="p-1.5 rounded-full hover:bg-[#eef0f3] text-[#5b616e] transition-colors"
                      title="Copy ID"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {copied && (
                      <span className="text-xs font-semibold text-emerald-600">
                        {t('regIdCopied')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Badge & Audio Readout Button */}
                <div className="flex flex-col items-start sm:items-end gap-2">
                  <span className="text-xs uppercase font-semibold text-[#7c828a] tracking-wider mb-1">
                    {t('trackFieldStatus')}
                  </span>
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={complaint.status || 'Submitted'} />
                    {/* Accessibility Speak Button */}
                    <button
                      type="button"
                      onClick={toggleSpeech}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                        isSpeaking
                          ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                          : 'bg-[#f7f7f7] hover:bg-[#eef0f3] text-[#0a0b0d] border-[#dee1e6]'
                      }`}
                      title={isSpeaking ? 'Stop Audio Readout' : 'Listen to Status (Speech Synthesis)'}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 mr-1 text-red-600" />
                          <span>Stop Audio</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 mr-1 text-[#0052ff]" />
                          <span>{lang === 'kn' ? 'ಆಲಿಸಿ' : 'Listen'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid of Key Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
                {/* Category */}
                <div className="space-y-1">
                  <span className="text-[#7c828a] flex items-center">
                    <Tag className="w-3.5 h-3.5 mr-1.5 text-[#0052ff]" />
                    {t('trackFieldCategory')}
                  </span>
                  <span className="font-semibold text-sm text-[#0a0b0d] block">
                    {complaint.category || 'Hospital Grievance'}
                  </span>
                </div>

                {/* Department */}
                <div className="space-y-1">
                  <span className="text-[#7c828a] flex items-center">
                    <Building className="w-3.5 h-3.5 mr-1.5 text-[#0052ff]" />
                    {t('trackFieldDept')}
                  </span>
                  <span className="font-semibold text-sm text-[#0a0b0d] block">
                    {complaint.department || 'Hospital Administration'}
                  </span>
                </div>

                {/* Date */}
                <div className="space-y-1">
                  <span className="text-[#7c828a] flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-[#0052ff]" />
                    {t('trackFieldDate')}
                  </span>
                  <span className="font-semibold text-sm text-[#0a0b0d] block">
                    {complaint.created_at || complaint.date 
                      ? new Date(complaint.created_at || complaint.date).toLocaleString()
                      : 'Recorded in system'}
                  </span>
                </div>

                {/* Source Channel */}
                <div className="space-y-1">
                  <span className="text-[#7c828a] flex items-center">
                    <Globe className="w-3.5 h-3.5 mr-1.5 text-[#0052ff]" />
                    {t('trackFieldSource')}
                  </span>
                  <span className="font-semibold text-sm text-[#0a0b0d] flex items-center space-x-1.5">
                    {String(complaint.source || '').toLowerCase().includes('voice') ? (
                      <>
                        <PhoneCall className="w-3.5 h-3.5 text-purple-600" />
                        <span>AI Telephone Helpline (IVR)</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-3.5 h-3.5 text-blue-600" />
                        <span>CareVoice Web Portal</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Language */}
                <div className="space-y-1">
                  <span className="text-[#7c828a]">{t('regLangLabel')}</span>
                  <span className="font-semibold text-sm text-[#0a0b0d] block">
                    {complaint.language === 'kn' ? 'ಕನ್ನಡ (Kannada)' : 'English'}
                  </span>
                </div>
              </div>

              {/* Full Description Box */}
              <div className="space-y-2 pt-4 border-t border-[#dee1e6]">
                <span className="text-xs uppercase font-semibold text-[#7c828a] tracking-wider flex items-center">
                  <FileText className="w-3.5 h-3.5 mr-1.5 text-[#0052ff]" />
                  {t('trackFieldDescription')}
                </span>
                <div className="p-4 rounded-2xl bg-[#f7f7f7] border border-[#dee1e6] text-xs sm:text-sm text-[#0a0b0d] leading-relaxed whitespace-pre-wrap">
                  {complaint.complaint_text || complaint.description || 'No complaint text recorded.'}
                </div>
              </div>

              {/* Print Action */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-outline text-xs py-2 px-4 space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>

            {/* Resolution Progress / Timeline */}
            <div className="card-coinbase p-6 sm:p-8 space-y-6">
              <h3 className="text-base font-semibold text-[#0a0b0d] flex items-center">
                <Clock className="w-4 h-4 mr-2 text-[#0052ff]" />
                <span>{t('trackTimelineTitle')}</span>
              </h3>

              {/* If backend returns history array, render it; otherwise render official status progression */}
              {Array.isArray(complaint.history) && complaint.history.length > 0 ? (
                <div className="space-y-4">
                  {complaint.history.map((step, idx) => (
                    <div key={idx} className="flex items-start space-x-3 text-xs">
                      <div className="w-6 h-6 rounded-full bg-blue-50 text-[#0052ff] flex items-center justify-center shrink-0 font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1 bg-[#f7f7f7] p-3 rounded-xl border border-[#dee1e6]">
                        <div className="flex items-center justify-between font-semibold text-[#0a0b0d]">
                          <span>{step.status || step.action}</span>
                          <span className="text-[11px] text-[#7c828a] font-normal">{step.timestamp || step.date}</span>
                        </div>
                        {step.remarks && <p className="mt-1 text-[#5b616e]">{step.remarks}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative border-l-2 border-[#dee1e6] ml-4 pl-6 space-y-8 text-xs">
                  {/* Step 1: Registration */}
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#0052ff] ring-4 ring-white"></span>
                    <h4 className="font-semibold text-sm text-[#0a0b0d]">Grievance Registered</h4>
                    <p className="text-[#5b616e] mt-0.5">
                      Successfully lodged via {String(complaint.source || '').toLowerCase().includes('voice') ? 'AI Voice Telephone' : 'Web Portal'}.
                    </p>
                    <span className="text-[10px] text-[#7c828a] font-mono mt-1 block">
                      {complaint.created_at || 'Confirmed'}
                    </span>
                  </div>

                  {/* Step 2: Department Routing */}
                  <div className="relative">
                    <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full ring-4 ring-white ${
                      complaint.status && !String(complaint.status).toLowerCase().includes('submit')
                        ? 'bg-[#0052ff]'
                        : 'bg-[#dee1e6]'
                    }`}></span>
                    <h4 className="font-semibold text-sm text-[#0a0b0d]">Assigned to Department</h4>
                    <p className="text-[#5b616e] mt-0.5">
                      Assigned to <strong className="text-[#0a0b0d]">{complaint.department || 'Hospital Nodal Desk'}</strong> for inquiry and action.
                    </p>
                  </div>

                  {/* Step 3: Resolution */}
                  <div className="relative">
                    <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full ring-4 ring-white ${
                      String(complaint.status || '').toLowerCase().includes('resolve')
                        ? 'bg-emerald-500'
                        : 'bg-[#dee1e6]'
                    }`}></span>
                    <h4 className="font-semibold text-sm text-[#0a0b0d]">Resolution & Closure</h4>
                    <p className="text-[#5b616e] mt-0.5">
                      {String(complaint.status || '').toLowerCase().includes('resolve')
                        ? 'Grievance redressed and closed by hospital administration.'
                        : 'Under active review by hospital administration.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
