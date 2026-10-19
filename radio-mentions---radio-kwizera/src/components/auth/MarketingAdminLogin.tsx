import React, { useState } from 'react';
import { useRadioApp } from '../../context/RadioAppContext';
import { RadioKwizeraSunburstLogo } from '../logos/RadioKwizeraLogos';
import { Lock, User, KeyRound, AlertCircle, ArrowRight, Radio, ShieldCheck } from 'lucide-react';

interface MarketingAdminLoginProps {
  onSwitchToPresenter?: () => void;
}

export const MarketingAdminLogin: React.FC<MarketingAdminLoginProps> = ({ onSwitchToPresenter }) => {
  const { adminLogin, switchRole, language } = useRadioApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg(
        language === 'sw'
          ? 'Tafadhali weka jina la mtumiaji na nenosiri.'
          : 'Please enter both username and password.'
      );
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const success = adminLogin(username.trim(), password.trim());
      if (!success) {
        setErrorMsg(
          language === 'sw'
            ? 'Jina la mtumiaji au nenosiri si sahihi. Jaribu: admin / kwizera977'
            : 'Invalid credentials. Hint: use admin / kwizera977'
        );
      }
      setIsSubmitting(false);
    }, 200);
  };

  const fillDefaultCredentials = () => {
    setUsername('admin');
    setPassword('kwizera977');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-8 relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        {/* Official Logo Display */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner mb-3">
            <RadioKwizeraSunburstLogo size="md" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Radio Kwizera 97.7 FM
          </h1>
          <p className="text-xs font-semibold text-purple-400 mt-1 uppercase tracking-wider">
            {language === 'sw' ? 'Utawala & Idara ya Masoko' : 'Marketing & Station Administration'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {language === 'sw' ? 'Ingia ili kusimamia wateja, ratiba za matangazo na watangazaji.' : 'Sign in to manage clients, commercial spot schedules, and presenters.'}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-700 text-red-300 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              {language === 'sw' ? 'Jina la Mtumiaji (Username)' : 'Username'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin / marketing"
                autoComplete="username"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              {language === 'sw' ? 'Nenosiri (Password)' : 'Password'}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <button
            id="admin-login-submit-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-purple-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>
              {isSubmitting
                ? (language === 'sw' ? 'Inathibitisha...' : 'Authenticating...')
                : (language === 'sw' ? 'Ingia kwenye Utawala' : 'Sign In to Admin')}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Helper */}
        <div className="mt-5 pt-4 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={fillDefaultCredentials}
            className="text-[11px] text-purple-400 hover:text-purple-300 underline font-medium cursor-pointer"
          >
            {language === 'sw' ? 'Jaza nenosiri la majaribio (admin / kwizera977)' : 'Use demo credentials (admin / kwizera977)'}
          </button>
        </div>

        {/* Switch to Presenter View Option */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {language === 'sw' ? 'Unahitaji kusoma matangazo studio?' : 'Need to sign ads in the studio?'}
          </span>
          <button
            type="button"
            onClick={() => {
              if (onSwitchToPresenter) {
                onSwitchToPresenter();
              } else {
                switchRole('presenter');
              }
            }}
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/50 border border-emerald-800/80 px-2.5 py-1 rounded-lg transition"
          >
            <Radio className="w-3 h-3" />
            <span>{language === 'sw' ? 'Studio ya Mtangazaji' : 'Presenter View'}</span>
          </button>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 mt-4 text-center">
        Radio Kwizera 97.7 FM • Jesuit Refugee Service (JRS) • Ngara, Kagera, Tanzania
      </p>
    </div>
  );
};
