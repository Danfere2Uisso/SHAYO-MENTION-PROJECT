import React from 'react';
import {
  RadioKwizeraSunburstLogo,
  RadioKwizeraFullLogo,
} from '../logos/RadioKwizeraLogos';
import { useRadioApp } from '../../context/RadioAppContext';
import {
  Radio,
  Heart,
  Globe2,
  ShieldCheck,
  X,
  Award,
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const { t } = useRadioApp();

  if (!isOpen) return null;

  return (
    <div
      id="about-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-[#0A1020] border-2 border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-fade-in my-8 text-slate-100">
        {/* Top Brand Accent Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl bg-gradient-to-r from-[#EE1C25] via-[#7A128B] to-[#0033A0]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Official Logo Showcase */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-3">
            <RadioKwizeraSunburstLogo size="md" animated={true} />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-red-950/80 text-red-400 border border-red-800/80 mb-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            97.7 MHz FM • Jukwaa la Matumaini
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            RADIO KWIZERA (RK JRS)
          </h2>
          <p className="text-xs sm:text-sm text-purple-300 font-medium max-w-md">
            Jesuit Refugee Service (JRS) Community Broadcaster • Ngara, Kagera Region, Tanzania
          </p>
        </div>

        {/* Full Station Lockup Preview */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="shrink-0">
            <RadioKwizeraFullLogo size="md" variant="dark" />
          </div>
          <div className="text-xs text-slate-300 space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#00A3E0]" />
              Authentic Station Identity
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Official colors: <strong className="text-[#EE1C25]">Vibrant Flame Red</strong>,{' '}
              <strong className="text-[#7A128B]">Royal Purple</strong>, and{' '}
              <strong className="text-[#00A3E0]">JRS Deep Blue</strong>.
            </p>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-slate-950/90 p-5 rounded-2xl border border-slate-800/90 text-xs sm:text-sm text-slate-300 space-y-3 leading-relaxed">
          <p>
            <strong>Radio Kwizera</strong>, founded under the auspices of the{' '}
            <strong className="text-white">Jesuit Refugee Service (JRS)</strong>, is an iconic community broadcaster based in Ngara, Kagera Region, near the tri-border crossroads of Tanzania, Rwanda, and Burundi.
          </p>
          <p>
            Known lovingly as <em>"Jukwaa la Matumaini" (The Platform of Hope)</em>, Radio Kwizera delivers peacebuilding, education, news, and community development programming to over 3 million listeners across northwestern Tanzania and the Great Lakes sub-region.
          </p>
          <p>
            This <strong>"Radio Mentions"</strong> management system marks the station's official 2026 digital modernization initiative, ensuring flawless compliance, instant on-air check-in verification, zero double-booking, and resilient offline continuity in the broadcast studio.
          </p>
        </div>

        {/* Station Technical Profile Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <Radio className="w-4 h-4 mx-auto text-[#EE1C25] mb-1" />
            <div className="font-bold text-xs text-white">97.7 MHz FM</div>
            <div className="text-[10px] text-slate-400">Primary Frequency</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <Globe2 className="w-4 h-4 mx-auto text-[#00A3E0] mb-1" />
            <div className="font-bold text-xs text-white">Ngara, Kagera</div>
            <div className="text-[10px] text-slate-400">Station HQ</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <Heart className="w-4 h-4 mx-auto text-[#7A128B] mb-1" />
            <div className="font-bold text-xs text-white">JRS Heritage</div>
            <div className="text-[10px] text-slate-400">Jesuit Mission</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <ShieldCheck className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
            <div className="font-bold text-xs text-white">2026 Certified</div>
            <div className="text-[10px] text-slate-400">Broadcast Grid</div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider text-white bg-gradient-to-r from-[#EE1C25] via-[#7A128B] to-[#0033A0] hover:opacity-95 shadow-xl transition-all"
        >
          {t.actions.close}
        </button>
      </div>
    </div>
  );
};
