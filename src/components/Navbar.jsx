import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { 
  Activity, 
  Globe, 
  Menu, 
  X, 
  PhoneCall, 
  FileText, 
  Search, 
  LayoutDashboard,
  ShieldCheck
} from 'lucide-react';

export const Navbar = () => {
  const { lang, setLang, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline' | 'checking'

  useEffect(() => {
    let isMounted = true;
    const checkServer = async () => {
      const res = await api.checkHealth();
      if (isMounted) {
        setBackendStatus(res.online ? 'online' : 'offline');
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navLinks = [
    { to: '/', label: t('navHome'), icon: Activity },
    { to: '/register', label: t('navRegister'), icon: FileText },
    { to: '/track', label: t('navTrack'), icon: Search },
    { to: '/dashboard', label: t('navDashboard'), icon: LayoutDashboard },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#dee1e6]">
      {/* Top Govt banner strip */}
      <div className="bg-[#f7f7f7] border-b border-[#eef0f3] text-[11px] font-medium text-[#5b616e] px-4 py-1 flex items-center justify-between">
        <div className="flex items-center space-x-2 max-w-7xl mx-auto w-full">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0052ff]" />
          <span>{t('govtAffiliation')} • {t('portalSubtitle')}</span>
          <div className="ml-auto flex items-center space-x-3 text-[11px]">
            <span className="hidden sm:inline-flex items-center text-[#5b616e]">
              <PhoneCall className="w-3 h-3 mr-1 text-[#0052ff]" />
              AI Helpline: <strong className="ml-1 text-[#0a0b0d]">1800-203-2273</strong>
            </span>
            <span 
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                backendStatus === 'online' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : backendStatus === 'offline' 
                    ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                    : 'bg-gray-100 text-gray-500'
              }`}
              title={backendStatus === 'online' ? 'Backend connected (localhost:8000)' : 'Backend offline (check localhost:8000)'}
            >
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                backendStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}></span>
              {backendStatus === 'online' ? 'Backend Live' : 'Backend (Port 8000)'}
            </span>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-full bg-[#0052ff] flex items-center justify-center text-white shadow-sm group-hover:bg-[#003ecc] transition-colors">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-[#0a0b0d]">
                CareVoice
              </span>
              <span className="bg-[#eef0f3] text-[#0052ff] text-[11px] font-bold px-2 py-0.5 rounded-full">
                AI Gov
              </span>
            </div>
            <p className="text-[11px] text-[#7c828a] leading-none hidden sm:block">
              {lang === 'kn' ? 'ಸಾರ್ವಜನಿಕ ಆಸ್ಪತ್ರೆ ಕುಂದುಕೊರತೆ ವೇದಿಕೆ' : 'Public Hospital Grievance System'}
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#eef0f3] text-[#0052ff] font-semibold'
                    : 'text-[#5b616e] hover:text-[#0a0b0d] hover:bg-[#f7f7f7]'
                }`}
              >
                <Icon className={`w-4 h-4 mr-2 ${active ? 'text-[#0052ff]' : 'text-[#7c828a]'}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side controls: Language switcher & Primary CTA */}
        <div className="flex items-center space-x-3">
          {/* Language Toggle Pill */}
          <div className="flex items-center bg-[#eef0f3] p-1 rounded-full border border-[#dee1e6]">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                lang === 'en'
                  ? 'bg-white text-[#0a0b0d] shadow-xs'
                  : 'text-[#5b616e] hover:text-[#0a0b0d]'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLang('kn')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                lang === 'kn'
                  ? 'bg-[#0052ff] text-white shadow-xs'
                  : 'text-[#5b616e] hover:text-[#0a0b0d]'
              }`}
            >
              ಕನ್ನಡ
            </button>
          </div>

          {/* Quick Register CTA Button */}
          <Link
            to="/register"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#0052ff] hover:bg-[#003ecc] text-white text-xs font-semibold tracking-wide transition-all shadow-xs"
          >
            {t('btnRegisterComplaint')}
          </Link>

          {/* Mobile hamburger menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-[#5b616e] hover:text-[#0a0b0d] hover:bg-[#f7f7f7]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#dee1e6] bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-base font-medium ${
                    active
                      ? 'bg-[#eef0f3] text-[#0052ff] font-semibold'
                      : 'text-[#0a0b0d] hover:bg-[#f7f7f7]'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${active ? 'text-[#0052ff]' : 'text-[#7c828a]'}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#dee1e6]">
            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center py-3 px-4 rounded-full bg-[#0052ff] text-white font-semibold text-sm"
            >
              {t('btnRegisterComplaint')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
