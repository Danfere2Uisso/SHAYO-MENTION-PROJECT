import React, { useState, useMemo } from 'react';
import { Sparkles, Check, Clock, TrendingUp, AlertTriangle, X, Radio, Filter, Zap } from 'lucide-react';
import { useRadioApp } from '../context/RadioAppContext';
import { ClientTier, AdMention } from '../types';
import { getSmartAdPlacementSuggestions, generateBalancedSlots, RangeOption, SlotSuggestion } from '../data/adSuggestions';
import { OFFICIAL_TIMETABLE_2026 } from '../data/timetable';

interface AdPlacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  tier: ClientTier;
  selectedSlots: string[];
  onSelectSlot: (slot: string) => void;
  onApplyBalancedSlots: (slots: string[]) => void;
  existingAds?: AdMention[];
}

export const AdPlacementModal: React.FC<AdPlacementModalProps> = ({
  isOpen,
  onClose,
  category,
  tier,
  selectedSlots,
  onSelectSlot,
  onApplyBalancedSlots,
  existingAds = [],
}) => {
  const { language } = useRadioApp();
  const [rangeOption, setRangeOption] = useState<RangeOption>('45m');
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(1); // Monday
  const [filterGenre, setFilterGenre] = useState<string>('all');

  // Suggestions computation
  const suggestions = useMemo(() => {
    return getSmartAdPlacementSuggestions(category, tier, rangeOption, selectedDayOfWeek, existingAds);
  }, [category, tier, rangeOption, selectedDayOfWeek, existingAds]);

  const filteredSuggestions = useMemo(() => {
    if (filterGenre === 'all') return suggestions;
    return suggestions.filter((s) => s.genre === filterGenre);
  }, [suggestions, filterGenre]);

  if (!isOpen) return null;

  const handleAutoFill = () => {
    const balanced = generateBalancedSlots(category, tier, 3, existingAds);
    onApplyBalancedSlots(balanced);
    onClose();
  };

  const days = [
    { num: 1, label: language === 'sw' ? 'Jumatatu (Mon)' : 'Monday' },
    { num: 2, label: language === 'sw' ? 'Jumanne (Tue)' : 'Tuesday' },
    { num: 3, label: language === 'sw' ? 'Jumatano (Wed)' : 'Wednesday' },
    { num: 4, label: language === 'sw' ? 'Alhamisi (Thu)' : 'Thursday' },
    { num: 5, label: language === 'sw' ? 'Ijumaa (Fri)' : 'Friday' },
    { num: 6, label: language === 'sw' ? 'Jumamosi (Sat)' : 'Saturday' },
    { num: 0, label: language === 'sw' ? 'Jumapili (Sun)' : 'Sunday' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/30 border border-blue-500/40 text-blue-300">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {language === 'sw' ? 'Mapendekezo ya Smart ya Upangaji wa Saa' : 'Smart Time Placement Suggestions'}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                  {category} • Tier {tier}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'sw'
                  ? 'Uchambuzi wa msongamano wa matangazo na kulinganisha na hadhira ya vipindi vya 2026'
                  : 'Ad congestion analysis matching target audiences with 2026 Radio Kwizera programs'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Day selection */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-slate-400 font-semibold shrink-0 mr-1">{language === 'sw' ? 'Siku:' : 'Day:'}</span>
            {days.map((d) => (
              <button
                key={d.num}
                type="button"
                onClick={() => setSelectedDayOfWeek(d.num)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  selectedDayOfWeek === d.num
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Range Interval Selection */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">{language === 'sw' ? 'Mpangilio:' : 'Interval:'}</span>
            <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              {(['30m', '45m', '1h'] as RangeOption[]).map((rng) => (
                <button
                  key={rng}
                  type="button"
                  onClick={() => setRangeOption(rng)}
                  className={`px-2.5 py-0.5 rounded-md text-xs font-mono transition cursor-pointer ${
                    rangeOption === rng
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {rng}
                </button>
              ))}
            </div>

            {/* Auto-fill 1-click */}
            <button
              type="button"
              onClick={handleAutoFill}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs transition shadow-sm cursor-pointer ml-2"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'sw' ? 'Weka Saa 3 Zilizolingana' : 'Auto-Fill 3 Balanced Slots'}</span>
            </button>
          </div>
        </div>

        {/* Suggestion Cards List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredSuggestions.map((sug, idx) => {
              const isSelected = selectedSlots.includes(sug.timeSlot);
              return (
                <div
                  key={idx}
                  onClick={() => onSelectSlot(sug.timeSlot)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-950/50 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <div>
                    {/* Top Row: Show & Time */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-700 text-white font-mono text-xs font-bold">
                          {sug.timeSlot}
                        </span>
                        <span className="text-sm font-bold text-slate-100">{sug.showName}</span>
                      </div>

                      {/* Suitability Badge */}
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            sug.suitabilityScore >= 80
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700'
                              : sug.suitabilityScore >= 60
                              ? 'bg-blue-950/80 text-blue-300 border border-blue-700'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          <TrendingUp className="w-3 h-3" />
                          {sug.suitabilityScore}% {language === 'sw' ? 'Ufaafu' : 'Fit'}
                        </span>
                      </div>
                    </div>

                    {/* Meta Row: Genre & Congestion */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2">
                      <span className="text-purple-300">{sug.genre}</span>
                      <span>•</span>
                      <span>{sug.primeLevel}</span>
                      <span>•</span>
                      <span
                        className={`font-medium ${
                          sug.congestionLevel === 'low'
                            ? 'text-emerald-400'
                            : sug.congestionLevel === 'moderate'
                            ? 'text-amber-400'
                            : 'text-red-400'
                        }`}
                      >
                        {language === 'sw' ? 'Msongamano:' : 'Traffic:'}{' '}
                        {sug.congestionLevel === 'low'
                          ? (language === 'sw' ? 'Chini (Safí)' : 'Low (Optimal)')
                          : sug.congestionLevel === 'moderate'
                          ? (language === 'sw' ? 'Wastani' : 'Moderate')
                          : (language === 'sw' ? 'Juu (Msongamano Mkubwa)' : 'High (Congested)')}
                      </span>
                    </div>

                    {/* Reason */}
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                      {sug.reason}
                    </p>
                  </div>

                  {/* Bottom selection indicator */}
                  <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-700/60">
                    <span className="text-slate-400 text-[11px]">
                      {isSelected
                        ? (language === 'sw' ? '✓ Tayari imechaguliwa' : '✓ Already selected')
                        : (language === 'sw' ? '+ Bofya kuongeza kwenye kampeni' : '+ Click to add to campaign')}
                    </span>
                    <button
                      type="button"
                      className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-700 text-slate-200 hover:bg-blue-600 hover:text-white'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{language === 'sw' ? 'Imechaguliwa' : 'Selected'}</span>
                        </>
                      ) : (
                        <span>{language === 'sw' ? 'Chagua Muda Huu' : 'Select Slot'}</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {language === 'sw' ? 'Jumla ya muda uliochaguliwa:' : 'Total slots selected:'}{' '}
            <strong className="text-white">{selectedSlots.length}</strong>{' '}
            {language === 'sw' ? 'vipindi' : 'slots'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition cursor-pointer"
          >
            {language === 'sw' ? 'Imekamilika (Done)' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
