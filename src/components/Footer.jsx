import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Activity, PhoneCall, ShieldCheck, HeartHandshake, Headphones, ExternalLink } from 'lucide-react';

export const Footer = () => {
  const { lang, t } = useLanguage();

  return (
    <footer className="bg-white border-t border-[#dee1e6] text-[#5b616e] text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-[#0052ff] flex items-center justify-center text-white">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-[#0a0b0d]">CareVoice</span>
            </div>
            <p className="text-xs text-[#5b616e] leading-relaxed">
              {lang === 'kn' 
                ? 'ಸಾರ್ವಜನಿಕ ಜಿಲ್ಲಾ ಮತ್ತು ತಾಲೂಕು ಆಸ್ಪತ್ರೆಗಳಲ್ಲಿ ರೋಗಿಗಳ ಹಕ್ಕುಗಳನ್ನು ರಕ್ಷಿಸುವ ಮತ್ತು ತ್ವರಿತ ಸೇವೆ ಖಚಿತಪಡಿಸುವ ಎಐ-ಆಧಾರಿತ ವೇದಿಕೆ.'
                : 'Empowering citizens with AI-driven voice and digital grievance redressal for government district and taluk hospitals.'}
            </p>
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#0a0b0d]">
              <ShieldCheck className="w-4 h-4 text-[#0052ff]" />
              <span>Ministry of Health & Family Welfare</span>
            </div>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="font-semibold text-[#0a0b0d] text-xs uppercase tracking-wider mb-4">
              {lang === 'kn' ? 'ತ್ವರಿತ ಸಂಪರ್ಕಗಳು' : 'Quick Access'}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/" className="hover:text-[#0052ff] transition-colors">{t('navHome')}</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#0052ff] transition-colors">{t('navRegister')}</Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-[#0052ff] transition-colors">{t('navTrack')}</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#0052ff] transition-colors">{t('navDashboard')}</Link>
              </li>
            </ul>
          </div>

          {/* Hospital Channels */}
          <div>
            <h4 className="font-semibold text-[#0a0b0d] text-xs uppercase tracking-wider mb-4">
              {lang === 'kn' ? 'ದೂರು ನೀಡುವ ಮಾರ್ಗಗಳು' : 'Grievance Channels'}
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start space-x-2">
                <Headphones className="w-4 h-4 text-[#0052ff] shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-[#0a0b0d]">24/7 Voice AI IVR</span>
                  <p className="text-[11px] text-[#7c828a]">1800-203-2273 (Toll Free)</p>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <HeartHandshake className="w-4 h-4 text-[#0052ff] shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-[#0a0b0d]">District Grievance Cell</span>
                  <p className="text-[11px] text-[#7c828a]">Medical Superintendent Office</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Citizen Notice & Emergency */}
          <div className="bg-[#f7f7f7] border border-[#dee1e6] rounded-2xl p-4 space-y-2">
            <h5 className="font-semibold text-xs text-[#0a0b0d] flex items-center">
              <PhoneCall className="w-3.5 h-3.5 mr-1.5 text-[#0052ff]" />
              {lang === 'kn' ? 'ತುರ್ತು ಚಿಕಿತ್ಸೆ ಸಹಾಯಕ್ಕೆ' : 'Medical Emergencies'}
            </h5>
            <p className="text-[11px] text-[#5b616e] leading-relaxed">
              {lang === 'kn'
                ? 'ತೀವ್ರ ತುರ್ತು ಚಿಕಿತ್ಸಾ ಸಂದರ್ಭಗಳಲ್ಲಿ ದಯವಿಟ್ಟು ನೇರವಾಗಿ 108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಅಥವಾ ಆಸ್ಪತ್ರೆಯ ಕ್ಯಾಶುಯಲ್ಟಿ ವಿಭಾಗಕ್ಕೆ ತಕ್ಷಣ ಸಂಪರ್ಕಿಸಿ.'
                : 'For critical life-threatening medical emergencies, please dial 108 for immediate ambulance dispatch or visit the nearest Casualty ward.'}
            </p>
            <div className="pt-1 text-[11px] font-mono font-semibold text-[#0052ff]">
              Emergency: 108 | Ambulance: 102
            </div>
          </div>
        </div>

        {/* Legal & Attribution strip */}
        <div className="mt-10 pt-6 border-t border-[#dee1e6] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#7c828a] space-y-2 sm:space-y-0">
          <p>© {new Date().getFullYear()} CareVoice Public Hospital Grievance System. All rights reserved.</p>
          <p className="flex items-center space-x-1">
            <span>Designed for Public Health Accountability</span>
            <span>•</span>
            <span className="text-[#0a0b0d] font-medium">Bilingual (Kannada / English)</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
