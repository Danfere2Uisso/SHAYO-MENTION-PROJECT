import React, { useState, useEffect } from 'react';
import {
  RadioKwizeraCompactLogo,
} from '../logos/RadioKwizeraLogos';
import { useRadioApp } from '../../context/RadioAppContext';
import { UserRole } from '../../types';
import {
  Wifi,
  WifiOff,
  Clock,
  Radio,
  Globe,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  Info,
  Sliders,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface TopNavbarProps {
  onOpenAbout: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onOpenAbout }) => {
  const {
    currentUser,
    switchRole,
    language,
    setLanguage,
    t,
    isOnline,
    setIsOnline,
    syncStatus,
    offlineQueueCount,
    studioDarkMode,
    setStudioDarkMode,
    logout,
    adminLogout,
    isAdminAuthenticated,
    currentLiveProgram,
  } = useRadioApp();

  // Studio On-Air Live Clock
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const roleOptions: { role: UserRole; label: string; badgeColor: string }[] = [
    { role: 'presenter', label: t.roles.presenter, badgeColor: 'bg-[#EE1C25]' },
    { role: 'marketing_officer', label: t.roles.marketing_officer, badgeColor: 'bg-gradient-to-r from-[#7A128B] to-[#0033A0]' },
  ];

  return (
    <header
      id="main-top-navbar"
      className={`sticky top-0 z-40 border-b transition-colors duration-200 ${
        studioDarkMode
          ? 'bg-[#080E1C]/95 border-slate-800/80 text-slate-100 backdrop-blur-md'
          : 'bg-white/95 border-slate-200 text-slate-900 backdrop-blur-md shadow-xs'
      }`}
    >
      {/* Official Radio Kwizera Signature Color Ribbon */}
      <div className="h-1 w-full bg-gradient-to-r from-[#EE1C25] via-[#7A128B] to-[#0033A0]" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-4 sm:gap-6">
        {/* Left: Station Identity - guaranteed shrink-0 and clean spacing */}
        <div className="flex items-center gap-3 shrink-0 mr-2 sm:mr-6">
          <div className="shrink-0 cursor-pointer hover:opacity-90 transition-opacity" onClick={onOpenAbout} title="Radio Kwizera - RK JRS 97.7 FM">
            <RadioKwizeraCompactLogo size="md" />
          </div>

          <div className="hidden xl:flex flex-col border-l border-slate-700/50 pl-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#EE1C25] text-white shadow-xs animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white"></span>
                {t.status.onAir}
              </span>
              <span className="text-xs font-bold text-[#EE1C25] uppercase tracking-wide">
                {currentLiveProgram?.name || 'MSETO LEO'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              97.7 MHz FM • Jukwaa la Matumaini
            </span>
          </div>
        </div>

        {/* Center: Live Studio Clock & Sync Status - distinct and separated */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 mx-auto">
          {/* Studio Digital Clock */}
          <div
            id="studio-digital-clock"
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg border font-mono font-black text-sm sm:text-base tracking-wider shrink-0 ${
              studioDarkMode
                ? 'bg-slate-900/90 border-slate-800 text-amber-400 shadow-inner'
                : 'bg-slate-100 border-slate-300 text-slate-900'
            }`}
            title="Studio Broadcast Time (EAT)"
          >
            <Clock className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
            <span className="whitespace-nowrap">{timeStr || '17:00:00'}</span>
            <span className="text-[10px] text-slate-400 font-sans font-bold">EAT</span>
          </div>

          {/* Online / Offline Connectivity Toggle (Module 4) */}
          <button
            id="connection-toggle-btn"
            onClick={() => setIsOnline(!isOnline)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
              isOnline
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-700/60 hover:bg-emerald-900/50'
                : 'bg-amber-950/60 text-amber-300 border-amber-500 hover:bg-amber-900/70 animate-pulse'
            }`}
            title={isOnline ? 'Online (Connected to station cloud). Click to simulate offline.' : 'Offline mode active. Click to reconnect.'}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">{t.status.online}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.status.offline}</span>
              </>
            )}
          </button>

          {/* Sync Badge */}
          <div
            id="sync-status-badge"
            className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-300"
          >
            {syncStatus === 'syncing' ? (
              <span className="text-amber-400 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                {t.status.syncing}
              </span>
            ) : syncStatus === 'offline_queued' ? (
              <span className="text-amber-400 font-bold">
                ⚠️ Queued ({offlineQueueCount})
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {t.status.synced}
              </span>
            )}
          </div>
        </div>

        {/* Right: Language Switcher, Role Selector, Studio Theme */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Language Switcher (Module 7: English / Swahili) */}
          <button
            id="language-toggle-btn"
            onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-extrabold border transition-all ${
              studioDarkMode
                ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
            }`}
            title={language === 'en' ? 'Badili kwenda Kiswahili' : 'Switch to English'}
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>{language === 'en' ? 'SW' : 'EN'}</span>
          </button>

          {/* Dark / Light Studio Mode Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={() => setStudioDarkMode(!studioDarkMode)}
            className={`p-1.5 rounded-md border transition-colors ${
              studioDarkMode
                ? 'bg-slate-800/80 border-slate-700 text-amber-400 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'
            }`}
            title={studioDarkMode ? 'Switch to Clean Light Mode' : 'Switch to Studio Dark Mode'}
          >
            {studioDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Role Switcher Dropdown (Module 1 & 9) */}
          <div className="relative">
            <button
              id="role-selector-dropdown-btn"
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className={`flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-lg border text-left transition-all ${
                studioDarkMode
                  ? 'bg-slate-900 border-slate-700 hover:border-slate-500'
                  : 'bg-slate-100 border-slate-300 hover:border-slate-400'
              }`}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-purple-500 shrink-0"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold leading-tight truncate max-w-[140px]">
                  {currentUser.role === 'presenter' ? (currentLiveProgram?.name || 'Studio On-Air') : currentUser.name.split(' ')[0]}
                </div>
                <div className="text-[10px] text-purple-400 font-semibold leading-tight capitalize">
                  {currentUser.role === 'presenter' ? 'Studio Desk' : 'Marketing & Admin'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {roleDropdownOpen && (
              <div
                className={`absolute right-0 mt-2 w-64 rounded-xl border shadow-2xl py-2 z-50 ${
                  studioDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <div className="px-3 py-1.5 border-b border-slate-800/50">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {t.nav.switchRole}
                  </div>
                </div>
                {roleOptions.map((opt) => (
                  <button
                    key={opt.role}
                    onClick={() => {
                      switchRole(opt.role);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                      currentUser.role === opt.role
                        ? 'bg-purple-600/20 text-purple-400 font-bold'
                        : 'hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {currentUser.role === opt.role && (
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                    )}
                  </button>
                ))}

                {isAdminAuthenticated && (
                  <div className="border-t border-slate-800/50 mt-1 pt-1 px-1">
                    <button
                      onClick={() => {
                        adminLogout();
                        setRoleDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-amber-400 hover:bg-amber-500/10 rounded-md flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{language === 'sw' ? 'Toka kwenye Utawala wa Masoko' : 'Admin Sign Out'}</span>
                    </button>
                  </div>
                )}

                <div className="border-t border-slate-800/50 mt-1 pt-1 px-1">
                  <button
                    onClick={() => {
                      logout();
                      setRoleDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded-md flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t.nav.logout}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
