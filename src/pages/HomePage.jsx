import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  Activity, 
  PhoneCall, 
  FileText, 
  Search, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Volume2, 
  Building2, 
  Users, 
  Pill, 
  Droplet, 
  Bed, 
  Sparkle 
} from 'lucide-react';

export const HomePage = () => {
  const { lang, setLang, t } = useLanguage();

  const categories = [
    { title: t('catMedicine'), icon: Pill, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: t('catDoctor'), icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: t('catCleanliness'), icon: Sparkle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: t('catWater'), icon: Droplet, color: 'text-sky-600', bg: 'bg-sky-50' },
    { title: t('catBed'), icon: Bed, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: t('catInfra'), icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="min-h-screen bg-white text-[#0a0b0d]">
      {/* Editorial Hero Band (Coinbase style: clean white canvas, calm weight-400 headline, primary blue CTA) */}
      <section className="pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-[#dee1e6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Section badge pill */}
          <div className="inline-flex items-center space-x-2 bg-[#f7f7f7] border border-[#dee1e6] px-4 py-1.5 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-[#0052ff] animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0a0b0d]">
              {t('heroBadge')}
            </span>
          </div>

          {/* Hero Headline - Editorial calm, Inter 400 */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#0a0b0d] max-w-4xl mx-auto leading-[1.12]">
            {t('heroTitle')}
          </h1>

          <p className="mt-6 text-base sm:text-lg text-[#5b616e] max-w-2xl mx-auto font-normal leading-relaxed">
            {t('heroDescription')}
          </p>

          {/* Language Fast-Select Bar */}
          <div className="mt-8 flex items-center justify-center space-x-3 text-xs">
            <span className="text-[#7c828a] font-medium">{t('language')}:</span>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-3.5 py-1.5 rounded-full border transition-all ${
                lang === 'en'
                  ? 'bg-[#0052ff] border-[#0052ff] text-white font-semibold'
                  : 'bg-white border-[#dee1e6] text-[#0a0b0d] hover:bg-[#f7f7f7]'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLang('kn')}
              className={`px-3.5 py-1.5 rounded-full border transition-all ${
                lang === 'kn'
                  ? 'bg-[#0052ff] border-[#0052ff] text-white font-semibold'
                  : 'bg-white border-[#dee1e6] text-[#0a0b0d] hover:bg-[#f7f7f7]'
              }`}
            >
              ಕನ್ನಡ (Kannada)
            </button>
          </div>

          {/* Primary Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#0052ff] hover:bg-[#003ecc] text-white text-base font-semibold transition-all shadow-xs group"
            >
              <FileText className="w-5 h-5 mr-2" />
              <span>{t('btnRegisterComplaint')}</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/track"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#eef0f3] hover:bg-[#e2e5ea] text-[#0a0b0d] text-base font-semibold transition-all"
            >
              <Search className="w-5 h-5 mr-2 text-[#5b616e]" />
              <span>{t('btnTrackComplaint')}</span>
            </Link>
          </div>

          {/* Quick trust strip */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-[#5b616e] pt-8 border-t border-[#dee1e6]/60">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#0052ff]" />
              <span>Free Public Service</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#0052ff]" />
              <span>Time-Bound Redressal</span>
            </div>
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-[#0052ff]" />
              <span>Voice & Dial-in Supported</span>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Dark Band: AI Telephone Voice Agent Spotlight (Coinbase signature hero-band-dark) */}
      <section className="bg-[#0a0b0d] text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-[#16181c] border border-white/10 px-3.5 py-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-[#0052ff]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  {lang === 'kn' ? '24/7 ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ದೂರವಾಣಿ ಸೇವೆ' : '24/7 AI Voice Agent Helpline'}
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-white leading-tight">
                {lang === 'kn'
                  ? 'ಇಂಟರ್ನೆಟ್ ಇಲ್ಲವೇ? ಕೇವಲ ಫೋನ್ ಮಾಡಿ ಮಾತನಾಡಿ ದೂರು ದಾಖಲಿಸಿ.'
                  : 'No internet access? Simply call and speak your grievance.'}
              </h2>

              <p className="text-sm sm:text-base text-gray-400 font-normal leading-relaxed">
                {t('callHelplineDesc')}
              </p>

              {/* Toll free number card */}
              <div className="bg-[#16181c] border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-semibold text-gray-400 tracking-wider">
                    {t('callHelplineLabel')}
                  </span>
                  <div className="text-2xl sm:text-3xl font-mono font-bold text-white mt-1">
                    {t('callHelplineNumber')}
                  </div>
                  <p className="text-xs text-emerald-400 mt-1 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>
                    {lang === 'kn' ? 'ಉಚಿತ ಕರೆ • ಯಾವುದೇ ಫೋನ್‌ನಿಂದ ಲಭ್ಯ' : 'Toll-free • Works from any mobile/landline'}
                  </p>
                </div>

                <a
                  href="tel:18002032273"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#0052ff] hover:bg-[#003ecc] text-white text-sm font-semibold transition-colors shrink-0"
                >
                  <PhoneCall className="w-4 h-4 mr-2" />
                  {lang === 'kn' ? 'ಈಗಲೇ ಕರೆ ಮಾಡಿ' : 'Call Helpline'}
                </a>
              </div>
            </div>

            {/* Right mockup card */}
            <div className="lg:col-span-5">
              <div className="bg-[#16181c] border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-[#0052ff] flex items-center justify-center text-white">
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">CareVoice Phone Agent</div>
                      <div className="text-[10px] text-gray-400">Live Call Simulation</div>
                    </div>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Active Channel
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-gray-300">
                    <span className="text-[#0052ff] font-semibold block text-[11px] mb-1">
                      AI Agent (Kannada/English):
                    </span>
                    "ನಮಸ್ಕಾರ, ಕೇರ್‌ವಾಯ್ಸ್ ಆಸ್ಪತ್ರೆ ಸಹಾಯವಾಣಿಗೆ ಸ್ವಾಗತ. ನಿಮ್ಮ ದೂರು ಅಥವಾ ಸಮಸ್ಯೆಯನ್ನು ಹೇಳಿ."
                  </div>

                  <div className="bg-[#0052ff]/10 border border-[#0052ff]/20 rounded-xl p-3 text-blue-200">
                    <span className="text-gray-400 font-semibold block text-[11px] mb-1">
                      Citizen (ಧ್ವನಿ):
                    </span>
                    "Ward 4 ನಲ್ಲಿ ನಿನ್ನೆಯಿಂದ ಕುಡಿಯುವ ನೀರು ಬರುತ್ತಿಲ್ಲ, ದಯವಿಟ್ಟು ಸರಿಪಡಿಸಿ."
                  </div>

                  <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-gray-300">
                    <span className="text-emerald-400 font-semibold block text-[11px] mb-1">
                      Action Taken:
                    </span>
                    Complaint registered: <strong className="text-white font-mono">CV-2026-0812</strong>. Routed to Hospital Infrastructure Department. SMS dispatched.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works 3-step section */}
      <section className="py-20 bg-white border-b border-[#dee1e6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-normal text-[#0a0b0d] tracking-tight">
              {t('howItWorksTitle')}
            </h2>
            <p className="mt-3 text-sm text-[#5b616e]">
              {t('howItWorksSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="card-coinbase p-8 space-y-4 hover:border-[#0052ff]/40 transition-colors">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0052ff] flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="text-lg font-semibold text-[#0a0b0d]">
                {t('channelWebTitle')}
              </h3>
              <p className="text-xs text-[#5b616e] leading-relaxed">
                {t('channelWebDesc')}
              </p>
              <Link to="/register" className="inline-flex items-center text-xs font-semibold text-[#0052ff] hover:underline pt-2">
                <span>{lang === 'kn' ? 'ವೆಬ್ ಮೂಲಕ ದೂರು ಸಲ್ಲಿಸಿ' : 'Open Web Registration'}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {/* Step 2 */}
            <div className="card-coinbase p-8 space-y-4 hover:border-[#0052ff]/40 transition-colors">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="text-lg font-semibold text-[#0a0b0d]">
                {t('channelPhoneTitle')}
              </h3>
              <p className="text-xs text-[#5b616e] leading-relaxed">
                {t('channelPhoneDesc')}
              </p>
              <span className="inline-flex items-center text-xs font-mono font-semibold text-purple-700 pt-2">
                Dial 1800-203-2273
              </span>
            </div>

            {/* Step 3 */}
            <div className="card-coinbase p-8 space-y-4 hover:border-[#0052ff]/40 transition-colors">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="text-lg font-semibold text-[#0a0b0d]">
                {t('channelResolutionTitle')}
              </h3>
              <p className="text-xs text-[#5b616e] leading-relaxed">
                {t('channelResolutionDesc')}
              </p>
              <Link to="/track" className="inline-flex items-center text-xs font-semibold text-[#0052ff] hover:underline pt-2">
                <span>{lang === 'kn' ? 'ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ' : 'Track Resolution'}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="py-20 bg-[#f7f7f7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-normal text-[#0a0b0d]">
                {t('categoriesTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-[#5b616e] mt-1">
                {lang === 'kn' 
                  ? 'ಯಾವುದೇ ವಿಭಾಗದ ಸಮಸ್ಯೆಗಳಿದ್ದರೂ ತಕ್ಷಣ ಪರಿಹರಿಸಲು ಆಸ್ಪತ್ರೆ ತಂಡ ಸನ್ನದ್ಧವಾಗಿದೆ'
                  : 'Fast-tracked routing to respective hospital department heads'}
              </p>
            </div>

            <Link
              to="/register"
              className="inline-flex items-center text-xs font-semibold text-[#0052ff] hover:underline"
            >
              {lang === 'kn' ? 'ಎಲ್ಲಾ ವರ್ಗಗಳ ದೂರು ನೋಂದಣಿ' : 'Register for Any Category'} &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={idx}
                  to={`/register?cat=${encodeURIComponent(cat.title)}`}
                  className="bg-white border border-[#dee1e6] hover:border-[#0052ff] rounded-2xl p-6 transition-all group flex flex-col justify-between"
                >
                  <div className={`w-12 h-12 rounded-xl ${cat.bg} ${cat.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-[#0a0b0d] group-hover:text-[#0052ff] transition-colors">
                      {cat.title}
                    </h3>
                    <span className="text-[11px] text-[#7c828a] mt-1 inline-flex items-center">
                      {lang === 'kn' ? 'ದೂರು ದಾಖಲಿಸಿ' : 'Report Issue'} &rarr;
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pre-footer Call to Action Band */}
      <section className="py-20 bg-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-normal text-[#0a0b0d] tracking-tight">
            {lang === 'kn' ? 'ಸಾರ್ವಜನಿಕ ಆಸ್ಪತ್ರೆಯಲ್ಲಿ ಯಾವುದೇ ಸಮಸ್ಯೆ ಎದುರಿಸುತ್ತಿದ್ದೀರಾ?' : 'Facing an issue at a public hospital right now?'}
          </h2>
          <p className="mt-4 text-sm text-[#5b616e]">
            {lang === 'kn' 
              ? 'ನಿಮ್ಮ ಧ್ವನಿ ಮುಖ್ಯವಾಗಿದೆ. ಕೇರ್‌ವಾಯ್ಸ್ ಮೂಲಕ ನಿಮ್ಮ ದೂರು ನೇರವಾಗಿ ಆಸ್ಪತ್ರೆ ಅಧಿಕಾರಿಗಳನ್ನು ತಲುಪುತ್ತದೆ.'
              : 'Your voice matters. CareVoice ensures strict accountability and monitored grievance redressal.'}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto btn-primary px-8 py-3 text-sm font-semibold"
            >
              {t('btnRegisterComplaint')}
            </Link>
            <Link
              to="/track"
              className="w-full sm:w-auto btn-secondary px-8 py-3 text-sm font-semibold"
            >
              {t('btnTrackComplaint')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
