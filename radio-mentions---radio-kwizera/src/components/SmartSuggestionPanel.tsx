import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Check,
  Clock,
  Radio,
  BarChart2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Info,
  Database,
} from 'lucide-react';
import {
  CATEGORY_PROGRAM_MAP,
  getSmartPlacementSuggestions,
  SmartPlacementResult,
  getTrafficDb,
} from '../data/adSuggestions';
import { ClientTier } from '../types';
import { useRadioApp } from '../context/RadioAppContext';

interface SmartSuggestionPanelProps {
  onApplySlot: (timeSlot: string, programName?: string) => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  adName?: string;
  onAdNameChange?: (name: string) => void;
  dayOfWeek?: number;
  onDayOfWeekChange?: (day: number) => void;
  tier?: ClientTier;
  compact?: boolean;
}

const DAYS_OF_WEEK = [
  { value: 1, labelSw: 'Jumatatu (Mon)', labelEn: 'Monday' },
  { value: 2, labelSw: 'Jumanne (Tue)', labelEn: 'Tuesday' },
  { value: 3, labelSw: 'Jumatano (Wed)', labelEn: 'Wednesday' },
  { value: 4, labelSw: 'Alhamisi (Thu)', labelEn: 'Thursday' },
  { value: 5, labelSw: 'Ijumaa (Fri)', labelEn: 'Friday' },
  { value: 6, labelSw: 'Jumamosi (Sat)', labelEn: 'Saturday' },
  { value: 0, labelSw: 'Jumapili (Sun)', labelEn: 'Sunday' },
];

export const SmartSuggestionPanel: React.FC<SmartSuggestionPanelProps> = ({
  onApplySlot,
  selectedCategory: controlledCategory,
  onCategoryChange,
  adName: controlledAdName,
  onAdNameChange,
  dayOfWeek: controlledDayOfWeek,
  onDayOfWeekChange,
  tier = 'B',
  compact = false,
}) => {
  const { language } = useRadioApp();

  // Internal state when not fully controlled
  const [internalCategory, setInternalCategory] = useState<string>('Health');
  const [internalAdName, setInternalAdName] = useState<string>('');
  const [internalDay, setInternalDay] = useState<number>(1);
  const [appliedSlot, setAppliedSlot] = useState<string | null>(null);

  const activeCategory = controlledCategory !== undefined ? controlledCategory : internalCategory;
  const activeAdName = controlledAdName !== undefined ? controlledAdName : internalAdName;
  const activeDay = controlledDayOfWeek !== undefined ? controlledDayOfWeek : internalDay;

  const handleCategorySelect = (cat: string) => {
    if (onCategoryChange) {
      onCategoryChange(cat);
    } else {
      setInternalCategory(cat);
    }
  };

  const handleAdNameInput = (val: string) => {
    if (onAdNameChange) {
      onAdNameChange(val);
    } else {
      setInternalAdName(val);
    }
  };

  const handleDaySelect = (d: number) => {
    if (onDayOfWeekChange) {
      onDayOfWeekChange(d);
    } else {
      setInternalDay(d);
    }
  };

  // Unique category keys from CATEGORY_PROGRAM_MAP
  const categoryOptions = useMemo(() => {
    const list = Object.keys(CATEGORY_PROGRAM_MAP);
    // Keep prime categories at the top
    const curated = [
      'Health',
      'Betting & Gaming',
      'Agriculture',
      'Telecom',
      'Banking & Finance',
      'Food & Beverages',
      'Building & Construction',
      'Education',
      'Religious & Faith',
      'Government & Public Notices',
      'Energy & Solar',
      'Automotive & Transport',
      'Sports & Fitness',
      'Retail & Wholesale',
      'Entertainment & Events',
      'Beauty & Personal Care',
      'Real Estate',
    ];
    // Return curated list
    return curated;
  }, []);

  // Compute smart suggestions
  const suggestions = useMemo<SmartPlacementResult[]>(() => {
    return getSmartPlacementSuggestions(activeCategory, activeDay, activeAdName, tier);
  }, [activeCategory, activeDay, activeAdName, tier]);

  // Check if traffic db has data
  const trafficDbCount = useMemo(() => {
    const db = getTrafficDb();
    let count = 0;
    Object.values(db).forEach((sub) => {
      Object.values(sub).forEach((val) => {
        count += val;
      });
    });
    return count;
  }, [appliedSlot]);

  const handleApply = (slot: string, progName?: string) => {
    onApplySlot(slot, progName);
    setAppliedSlot(slot);
    setTimeout(() => {
      setAppliedSlot(null);
    }, 2500);
  };

  return (
    <div
      id="smart-suggestion-panel"
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 text-slate-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/40">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{language === 'sw' ? 'Mshauri wa Upangaji Mahiri' : 'Smart Placement Advisor'}</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                2026 AI
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {language === 'sw'
                ? 'Mapendekezo ya masaa kulingana na sekta na msongamano wa database'
                : 'Traffic DB-driven slot suggestions matched to industry demographics'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
          <Database className="w-3 h-3 text-emerald-400" />
          <span className="font-mono text-emerald-400 font-bold">{trafficDbCount}</span>
          <span className="hidden sm:inline">{language === 'sw' ? 'matangazo DB' : 'ads in DB'}</span>
        </div>
      </div>

      {/* Input Controls: Category + Ad Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Category Dropdown */}
        <div>
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-blue-400" />
            <span>{language === 'sw' ? 'Sekta ya Tangazo (Category) *' : 'Ad Category *'}</span>
          </label>
          <select
            id="smart-category-select"
            value={activeCategory}
            onChange={(e) => handleCategorySelect(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Ad Name Input */}
        <div>
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Radio className="w-3 h-3 text-red-400" />
            <span>{language === 'sw' ? 'Jina la Tangazo (Ad Name)' : 'Ad / Campaign Name'}</span>
          </label>
          <input
            id="smart-ad-name-input"
            type="text"
            value={activeAdName}
            onChange={(e) => handleAdNameInput(e.target.value)}
            placeholder={
              language === 'sw'
                ? 'k.m. Vodacom M-Pesa, Twiga Cement...'
                : 'e.g. M-Pesa, Twiga Extra...'
            }
            className="w-full bg-slate-950 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Day Selector Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 pt-0.5">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
          <Calendar className="w-3 h-3 text-purple-400" />
          {language === 'sw' ? 'Siku:' : 'Day:'}
        </span>
        {DAYS_OF_WEEK.map((d) => (
          <button
            key={d.value}
            type="button"
            onClick={() => handleDaySelect(d.value)}
            className={`px-2 py-1 rounded-lg text-[11px] font-mono transition shrink-0 cursor-pointer ${
              activeDay === d.value
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {language === 'sw' ? d.labelSw.split(' ')[0] : d.labelEn.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Ranked Suggestions List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium pt-1">
          <span>
            {language === 'sw'
              ? `Nafasi ${suggestions.length} Zinazofaa Zaidi:`
              : `Top ${suggestions.length} Ranked Airtime Slots:`}
          </span>
          <span className="text-[11px] text-indigo-400">
            {language === 'sw' ? 'Ulinganifu wa Vipindi 2026' : '2026 Timetable Matrix'}
          </span>
        </div>

        {suggestions.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
            {language === 'sw'
              ? 'Hakuna mapendekezo yaliyopatikana kwa sekta hii.'
              : 'No suggestions found for selected category.'}
          </div>
        ) : (
          suggestions.slice(0, 6).map((item, idx) => {
            const isApplied = appliedSlot === item.timeRange;

            // Congestion badge styling
            const badgeColors =
              item.congestionLevel === 'low'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/70'
                : item.congestionLevel === 'moderate'
                ? 'bg-amber-950/80 text-amber-300 border-amber-700/70'
                : 'bg-red-950/80 text-red-300 border-red-700/70';

            return (
              <div
                key={`${item.programName}-${item.timeRange}-${idx}`}
                className="group p-3 rounded-xl bg-slate-950/90 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                {/* Left: Program & Time Details */}
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <Radio className="w-3.5 h-3.5 text-red-500" />
                      <span>{item.programName}</span>
                    </span>

                    <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.timeRange}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${badgeColors}`}
                    >
                      {item.congestionStatus}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span className="text-amber-400 font-mono font-semibold">
                      {language === 'sw' ? 'Ufaafu:' : 'Relevance:'} {item.relevanceScore}%
                    </span>
                    <span>•</span>
                    <span className="truncate text-slate-300" title={item.reason}>
                      {item.reason}
                    </span>
                  </div>
                </div>

                {/* Right: Apply Button */}
                <div className="shrink-0 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => handleApply(item.timeRange, item.programName)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shadow-sm ${
                      isApplied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>{language === 'sw' ? 'Imewekwa!' : 'Slot Applied!'}</span>
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>{language === 'sw' ? 'Tumia Nafasi Hii' : 'Apply this Slot'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer / Helper Note */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-blue-400" />
          <span>
            {language === 'sw'
              ? 'Kubonyeza "Tumia Nafasi Hii" kunajaza muda kwenye fomu moja kwa moja.'
              : 'Clicking "Apply this Slot" instantly populates the broadcast time in your form.'}
          </span>
        </div>
      </div>
    </div>
  );
};
