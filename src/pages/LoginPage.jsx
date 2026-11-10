import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShieldCheck, 
  User, 
  Stethoscope, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  KeyRound, 
  Sparkles, 
  Phone, 
  Mail, 
  Building2,
  AlertCircle
} from 'lucide-react';

export const LoginPage = () => {
  const { lang, t } = useLanguage();
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedRole, setSelectedRole] = useState('patient'); // 'patient' | 'staff' | 'admin'
  const [identifier, setIdentifier] = useState(DEMO_USERS.patient.identifier);
  const [password, setPassword] = useState('demo1234');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Switch role handler: auto-populate representative credentials
  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setError(null);
    if (roleKey === 'patient') {
      setIdentifier(DEMO_USERS.patient.identifier);
      setPassword('demo1234');
    } else if (roleKey === 'staff') {
      setIdentifier(DEMO_USERS.staff.identifier);
      setPassword('staffPass@2026');
    } else if (roleKey === 'admin') {
      setIdentifier(DEMO_USERS.admin.identifier);
      setPassword('adminMaster#2026');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError(lang === 'kn' ? 'ದಯವಿಟ್ಟು ಗುರುತು ನಮೂದಿಸಿ.' : 'Please enter your login identifier.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const loggedUser = login(selectedRole, {
        identifier: identifier.trim()
      });

      // Redirect based on role
      const redirectPath = location.state?.from || (selectedRole === 'patient' ? '/track' : '/dashboard');
      setTimeout(() => {
        setIsSubmitting(false);
        navigate(redirectPath, { replace: true });
      }, 400);
    } catch (err) {
      setIsSubmitting(false);
      setError('Login failed. Please try again.');
    }
  };

  const handleQuickDemo = (roleKey) => {
    login(roleKey);
    const redirectPath = location.state?.from || (roleKey === 'patient' ? '/register' : '/dashboard');
    navigate(redirectPath, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] py-14 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full space-y-6">
        {/* Brand Badge */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 bg-white border border-[#dee1e6] px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#0052ff] shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#0052ff]" />
            <span>{t('loginNotice')}</span>
          </div>
          <h1 className="text-3xl font-normal text-[#0a0b0d] tracking-tight">
            {t('loginTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-[#5b616e] max-w-md mx-auto">
            {t('loginSubtitle')}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-[#dee1e6] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Redirect advisory banner */}
          {location.state?.from === '/register' && (
            <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-center space-x-2.5 text-xs text-[#0052ff]">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>
                {lang === 'kn' 
                  ? 'ದೂರು ದಾಖಲಿಸಲು ದಯವಿಟ್ಟು ರೋಗಿ/ನಾಗರಿಕ ಖಾತೆಗೆ ಲಾಗಿನ್ ಆಗಿ.' 
                  : 'Please sign in to register and link your hospital grievance.'}
              </span>
            </div>
          )}

          {/* Role Selection Tabs (Coinbase Pill design) */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#7c828a] uppercase tracking-wider block">
              {lang === 'kn' ? 'ಲಾಗಿನ್ ಪಾತ್ರ ಆಯ್ಕೆಮಾಡಿ' : 'Select Access Role'}
            </span>
            <div className="grid grid-cols-3 gap-2 bg-[#f7f7f7] p-1.5 rounded-2xl border border-[#dee1e6]">
              {/* Patient Tab */}
              <button
                type="button"
                onClick={() => handleRoleSelect('patient')}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                  selectedRole === 'patient'
                    ? 'bg-white text-[#0a0b0d] shadow-xs border border-[#dee1e6]'
                    : 'text-[#5b616e] hover:text-[#0a0b0d]'
                }`}
              >
                <User className={`w-4 h-4 mb-1 ${selectedRole === 'patient' ? 'text-emerald-600' : 'text-[#7c828a]'}`} />
                <span>{t('rolePatient')}</span>
              </button>

              {/* Staff Tab */}
              <button
                type="button"
                onClick={() => handleRoleSelect('staff')}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                  selectedRole === 'staff'
                    ? 'bg-white text-[#0a0b0d] shadow-xs border border-[#dee1e6]'
                    : 'text-[#5b616e] hover:text-[#0a0b0d]'
                }`}
              >
                <Stethoscope className={`w-4 h-4 mb-1 ${selectedRole === 'staff' ? 'text-[#0052ff]' : 'text-[#7c828a]'}`} />
                <span>{t('roleStaff')}</span>
              </button>

              {/* Admin Tab */}
              <button
                type="button"
                onClick={() => handleRoleSelect('admin')}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                  selectedRole === 'admin'
                    ? 'bg-white text-[#0a0b0d] shadow-xs border border-[#dee1e6]'
                    : 'text-[#5b616e] hover:text-[#0a0b0d]'
                }`}
              >
                <Building2 className={`w-4 h-4 mb-1 ${selectedRole === 'admin' ? 'text-purple-600' : 'text-[#7c828a]'}`} />
                <span>{t('roleAdmin')}</span>
              </button>
            </div>
          </div>

          {/* Role Info Banner */}
          <div className="p-4 rounded-2xl bg-[#f7f7f7] border border-[#dee1e6] flex items-start space-x-3 text-xs">
            {selectedRole === 'patient' && (
              <>
                <User className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#0a0b0d]">{t('loginPatientTitle')}</strong>
                  <span className="text-[#5b616e] leading-relaxed">{t('loginPatientDesc')}</span>
                </div>
              </>
            )}
            {selectedRole === 'staff' && (
              <>
                <Stethoscope className="w-4 h-4 text-[#0052ff] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#0a0b0d]">{t('loginStaffTitle')}</strong>
                  <span className="text-[#5b616e] leading-relaxed">{t('loginStaffDesc')}</span>
                </div>
              </>
            )}
            {selectedRole === 'admin' && (
              <>
                <Building2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#0a0b0d]">{t('loginAdminTitle')}</strong>
                  <span className="text-[#5b616e] leading-relaxed">{t('loginAdminDesc')}</span>
                </div>
              </>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Identifier input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#0a0b0d] uppercase tracking-wider">
                {selectedRole === 'patient' 
                  ? t('loginIdentifier')
                  : selectedRole === 'staff'
                    ? (lang === 'kn' ? 'ಸಿಬ್ಬಂದಿ ಇಮೇಲ್ ಅಥವಾ ಐಡಿ' : 'Staff Official Email / Employee ID')
                    : (lang === 'kn' ? 'ಆಡಳಿತಾಧಿಕಾರಿ ಅಧಿಕೃತ ಇಮೇಲ್' : 'Administrator Official Email')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#dee1e6] text-xs sm:text-sm bg-white text-[#0a0b0d] focus:outline-none focus:border-[#0052ff] font-medium"
                  required
                />
                {selectedRole === 'patient' ? (
                  <Phone className="w-4 h-4 text-[#7c828a] absolute left-3.5 top-1/2 -translate-y-1/2" />
                ) : (
                  <Mail className="w-4 h-4 text-[#7c828a] absolute left-3.5 top-1/2 -translate-y-1/2" />
                )}
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#0a0b0d] uppercase tracking-wider">
                {t('loginPassword')}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#dee1e6] text-xs sm:text-sm bg-white text-[#0a0b0d] focus:outline-none focus:border-[#0052ff] font-medium"
                  required
                />
                <Lock className="w-4 h-4 text-[#7c828a] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-3.5 text-xs sm:text-sm font-semibold shadow-xs flex items-center justify-center space-x-2 mt-2"
            >
              <span>{isSubmitting ? 'Authenticating...' : t('btnLogin')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Click Demo Logins for Pair Programming and Testing */}
          <div className="pt-4 border-t border-[#dee1e6] space-y-3">
            <span className="text-[11px] font-semibold text-[#7c828a] uppercase tracking-wider flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#0052ff]" />
              <span>{t('loginQuickDemo')}</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('patient')}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-900 text-left transition-colors"
              >
                <div className="text-[10px] uppercase font-bold text-emerald-700">Citizen</div>
                <div className="text-xs font-semibold truncate">Rajesh Kumar</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('staff')}
                className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-900 text-left transition-colors"
              >
                <div className="text-[10px] uppercase font-bold text-[#0052ff]">Hospital Staff</div>
                <div className="text-xs font-semibold truncate">Dr. Sunita Rao</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-purple-900 text-left transition-colors"
              >
                <div className="text-[10px] uppercase font-bold text-purple-700">Administrator</div>
                <div className="text-xs font-semibold truncate">Dr. A.K. Sharma</div>
              </button>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link to="/" className="text-xs font-medium text-[#5b616e] hover:text-[#0052ff]">
            &larr; {lang === 'kn' ? 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ' : 'Back to Public Home'}
          </Link>
        </div>
      </div>
    </div>
  );
};

