import React, { useState } from 'react';
import { RadioKwizeraSunburstLogo } from '../logos/RadioKwizeraLogos';
import { useRadioApp } from '../../context/RadioAppContext';
import { UserProfile, UserRole } from '../../types';
import {
  Mic,
  MonitorCheck,
  Briefcase,
  Sliders,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Globe,
  Radio,
} from 'lucide-react';

interface LoginScreenProps {
  onOpenAbout: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onOpenAbout }) => {
  const { allUsers, login, language, setLanguage, t, studioDarkMode } = useRadioApp();
  const [selectedUser, setSelectedUser] = useState<UserProfile>(allUsers[0]);
  const [pin, setPin] = useState<string>('••••');

  const roleMeta: Record<
    UserRole,
    { icon: React.ComponentType<{ className?: string }>; color: string; badge: string; desc: string }
  > = {
    presenter: {
      icon: Mic,
      color: 'from-[#EE1C25] to-[#991B1B]',
      badge: 'bg-[#EE1C25]/20 text-red-300 border-[#EE1C25]/40',
      desc: language === 'sw' ? 'Kishikwambi cha Studio, vipindi vyote vya leo na kusaini matangazo hewani.' : 'Studio Tablet mode, today\'s show schedule, and live on-air ad sign-off.',
    },
    marketing_officer: {
      icon: Briefcase,
      color: 'from-[#7A128B] via-[#0033A0] to-[#0B2F9F]',
      badge: 'bg-gradient-to-r from-[#7A128B]/30 to-[#0033A0]/30 text-purple-200 border-purple-500/40',
      desc: language === 'sw' ? 'Mfumo wa kupakia matangazo, ripoti za usomaji na uthibitisho, uchapishaji wa ripoti kwa mteja au tangazo, na usimamizi mkuu wa kituo.' : 'Integrated uploader app, airplay & read compliance reports, print certificates by client or ad, and station administration.',
    },
  };

  const handleQuickLogin = (user: UserProfile) => {
    login(user);
  };

  return (
    <div className="min-h-screen bg-[#070C18] text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Authentic Radio Kwizera Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] bg-gradient-to-br from-[#EE1C25]/15 via-[#7A128B]/12 to-[#0033A0]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Stripe */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#EE1C25] via-[#7A128B] to-[#0033A0] absolute top-0 left-0 right-0 z-20" />

      {/* Top utility bar */}
      <div className="max-w-6xl mx-auto w-full px-6 py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
          <span className="text-xs font-black tracking-widest text-slate-400 uppercase">
            Radio Kwizera 97.7 FM • Ngara, Kagera
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>{language === 'en' ? 'Kiswahili (SW)' : 'English (EN)'}</span>
          </button>

          <button
            onClick={onOpenAbout}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-4"
          >
            {language === 'sw' ? 'Kuhusu Radio Kwizera' : 'About Radio Kwizera'}
          </button>
        </div>
      </div>

      {/* Center Container: Logo 2 + Role Selection Cards */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 relative z-10 flex flex-col items-center text-center">
        {/* Logo 2: Large Sunburst "RK JRS" Logo */}
        <div className="mb-4 cursor-pointer" onClick={onOpenAbout} title="Radio Kwizera - Sunburst Jesuit Emblem">
          <RadioKwizeraSunburstLogo size="lg" animated={true} />
        </div>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-2">
          RADIO MENTIONS
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mb-8 font-medium">
          {language === 'sw'
            ? 'Mfumo Rasmi wa Kusimamia Matangazo ya Hewani na Ratiba ya 2026 ya Radio Kwizera 97.7 FM.'
            : 'Official Radio Station Management & Commercial Mentions System for Radio Kwizera 97.7 FM.'}
        </p>

        {/* 2 User Groups */}
        <div className="w-full text-left mb-6">
          <div className="flex items-center justify-between mb-3 px-1 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {language === 'sw' ? 'Chagua Wasifu wa Kuingia (Makundi 2)' : 'Select User Group to Login'}
            </span>
            <span className="text-[11px] text-purple-400 font-medium">
              {language === 'sw' ? 'Mguso 1 Kuingia Haraka' : '1-Tap Instant Sign In'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {allUsers.map((user) => {
              const meta = roleMeta[user.role];
              const Icon = meta.icon;
              const isSelected = selectedUser.id === user.id;

              return (
                <div
                  key={user.id}
                  onClick={() => {
                    setSelectedUser(user);
                    handleQuickLogin(user);
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-900 border-purple-500 shadow-xl shadow-purple-950/40 scale-[1.01]'
                      : 'bg-slate-900/70 border-slate-800 hover:bg-slate-850 hover:border-purple-600'
                  }`}
                >
                  <div className="flex items-start gap-3.5 mb-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 group-hover:border-purple-500 shrink-0 shadow-md"
                    />
                    <div className="min-w-0">
                      <div className="font-black text-base text-white group-hover:text-purple-300 truncate">
                        {user.name}
                      </div>
                      <div className="text-xs text-slate-400 truncate mb-1 font-medium">
                        {user.title}
                      </div>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-black border ${meta.badge}`}
                      >
                        {t.roles[user.role]}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {meta.desc}
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickLogin(user);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-black tracking-wide text-white bg-gradient-to-r ${meta.color} flex items-center justify-center gap-1.5 shadow-lg transition-transform active:scale-95`}
                  >
                    <span>{t.status.live} {t.actions.checkIn}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer credits & Jesuit identity */}
      <footer className="max-w-6xl mx-auto w-full px-6 py-4 text-center text-xs text-slate-500 border-t border-slate-900 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2026 Radio Kwizera 97.7 FM • Jesuit Refugee Service (JRS)</span>
        <span className="text-slate-400">Ngara, Kagera Region, Tanzania • Jukwaa la Matumaini</span>
      </footer>
    </div>
  );
};
