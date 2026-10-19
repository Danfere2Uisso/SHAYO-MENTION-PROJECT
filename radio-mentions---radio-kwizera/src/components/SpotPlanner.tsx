import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  Users,
  CheckCircle,
  Radio,
  Sliders,
  DollarSign,
  Zap,
  Copy,
  Plus,
  Trash2,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  FileCode,
  Shield,
  Sparkles,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import { useRadioApp } from '../context/RadioAppContext';
import { OFFICIAL_TIMETABLE_2026, getShowForTime, getShowsForDay } from '../data/timetable';
import { getDayName } from '../utils';
import { ClientTier } from '../types';

interface DayPattern {
  [dayIndex: number]: string[]; // 0=Sun, 1=Mon, ..., 6=Sat
}

const DEFAULT_WEEKLY_PATTERN: DayPattern = {
  0: ['08:00 - 08:30', '14:30 - 15:00'], // Sunday
  1: ['07:30 - 07:45', '13:15 - 13:30', '17:15 - 17:30'], // Monday
  2: ['07:30 - 07:45', '13:15 - 13:30', '17:15 - 17:30'], // Tuesday
  3: ['07:30 - 07:45', '13:15 - 13:30', '17:15 - 17:30'], // Wednesday
  4: ['07:30 - 07:45', '13:15 - 13:30', '17:15 - 17:30'], // Thursday
  5: ['07:30 - 07:45', '13:15 - 13:30', '17:15 - 17:30'], // Friday
  6: ['09:30 - 10:00', '16:00 - 16:30'], // Saturday
};

// Listenership data calibrated for Lake Zone & Kagera broadcast area
const SHOW_AUDIENCE_MAP: { [key: string]: number } = {
  'Asubuhi Njema': 390000,
  'Nje ya Dimba': 270000,
  'Mchakato': 220000,
  'Mseto Leo': 450000,
  'Sports Corner': 340000,
  'Usiku Mwanana': 160000,
  'Kwizera Mix': 290000,
  'Harusi ya Furaha': 300000,
  'Connector': 230000,
  'Machweo Jumamosi': 280000,
  'Ibada na Tafakari': 350000,
};

export const SpotPlanner: React.FC = () => {
  const { campaigns, ads, language, t } = useRadioApp();

  const [weeklyPattern, setWeeklyPattern] = useState<DayPattern>(DEFAULT_WEEKLY_PATTERN);
  const [selectedTier, setSelectedTier] = useState<ClientTier>('A');
  const [estimatedRateTzs, setEstimatedRateTzs] = useState<number>(45000);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // New slot inputs per day (0-6)
  const [newSlotInputs, setNewSlotInputs] = useState<{ [dayIndex: number]: string }>({});

  // Smart Importer Modal
  const [isImporterOpen, setIsImporterOpen] = useState<boolean>(false);
  const [pastedText, setPastedText] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);

  // Days list in Sun-Sat order
  const days = [
    { num: 0, nameSw: 'Jumapili', nameEn: 'Sunday', short: 'Sun', isWeekend: true },
    { num: 1, nameSw: 'Jumatatu', nameEn: 'Monday', short: 'Mon', isWeekend: false },
    { num: 2, nameSw: 'Jumanne', nameEn: 'Tuesday', short: 'Tue', isWeekend: false },
    { num: 3, nameSw: 'Jumatano', nameEn: 'Wednesday', short: 'Wed', isWeekend: false },
    { num: 4, nameSw: 'Alhamisi', nameEn: 'Thursday', short: 'Thu', isWeekend: false },
    { num: 5, nameSw: 'Ijumaa', nameEn: 'Friday', short: 'Fri', isWeekend: false },
    { num: 6, nameSw: 'Jumamosi', nameEn: 'Saturday', short: 'Sat', isWeekend: true },
  ];

  // Quick Preset Patterns
  const applyPreset = (presetKey: string) => {
    if (presetKey === '3x_daily') {
      const p: DayPattern = {};
      days.forEach((d) => {
        p[d.num] = ['07:30 - 07:45', '13:15 - 13:30', '17:15 - 17:30'];
      });
      setWeeklyPattern(p);
    } else if (presetKey === '2x_drive') {
      const p: DayPattern = {};
      days.forEach((d) => {
        p[d.num] = ['07:45 - 08:00', '17:30 - 17:45'];
      });
      setWeeklyPattern(p);
    } else if (presetKey === 'weekdays_prime') {
      const p: DayPattern = {};
      days.forEach((d) => {
        if (d.isWeekend) {
          p[d.num] = [];
        } else {
          p[d.num] = ['07:15 - 07:30', '12:45 - 13:00', '17:00 - 17:15'];
        }
      });
      setWeeklyPattern(p);
    } else if (presetKey === '5x_saturation') {
      const p: DayPattern = {};
      days.forEach((d) => {
        p[d.num] = [
          '07:00 - 07:15',
          '10:30 - 10:45',
          '13:00 - 13:15',
          '17:30 - 17:45',
          '20:45 - 21:00',
        ];
      });
      setWeeklyPattern(p);
    } else if (presetKey === 'weekend_special') {
      const p: DayPattern = {};
      days.forEach((d) => {
        if (d.isWeekend) {
          p[d.num] = ['09:30 - 10:00', '13:30 - 14:00', '16:30 - 17:00'];
        } else {
          p[d.num] = ['07:30 - 07:45'];
        }
      });
      setWeeklyPattern(p);
    }
    setCopyFeedback(`Mpangilio wa "${presetKey}" umewekwa kwa siku zote!`);
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  // Add a slot to a day
  const handleAddSlotToDay = (dayIdx: number) => {
    const raw = (newSlotInputs[dayIdx] || '').trim();
    if (!raw) return;

    let formatted = raw;
    // Auto format if user typed "07:30" -> "07:30 - 07:45"
    if (/^\d{1,2}:\d{2}$/.test(raw)) {
      const [h, m] = raw.split(':').map(Number);
      const endM = (m + 15) % 60;
      const endH = m + 15 >= 60 ? (h + 1) % 24 : h;
      formatted = `${raw} - ${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    }

    setWeeklyPattern((prev) => {
      const current = prev[dayIdx] || [];
      if (current.includes(formatted)) return prev;
      return {
        ...prev,
        [dayIdx]: [...current, formatted].sort(),
      };
    });

    setNewSlotInputs((prev) => ({ ...prev, [dayIdx]: '' }));
  };

  // Remove a slot from a day
  const handleRemoveSlotFromDay = (dayIdx: number, slotToRemove: string) => {
    setWeeklyPattern((prev) => ({
      ...prev,
      [dayIdx]: (prev[dayIdx] || []).filter((s) => s !== slotToRemove),
    }));
  };

  // Copy one day's config to all other days
  const handleCopyDayToAll = (sourceDayIdx: number) => {
    const slots = weeklyPattern[sourceDayIdx] || [];
    const updated: DayPattern = {};
    days.forEach((d) => {
      updated[d.num] = [...slots];
    });
    setWeeklyPattern(updated);
    const dayName = days.find((d) => d.num === sourceDayIdx)?.nameSw;
    setCopyFeedback(`Ratiba ya ${dayName} imenakiliwa kwa siku zote 7!`);
    setTimeout(() => setCopyFeedback(null), 3500);
  };

  // Smart suggestions by Tier
  const applyTierRecommendation = (tier: ClientTier) => {
    setSelectedTier(tier);
    const p: DayPattern = {};
    if (tier === 'A') {
      // Tier A Prime Slots
      days.forEach((d) => {
        p[d.num] = ['07:30 - 07:45', '13:15 - 13:30', '17:15 - 17:30', '20:45 - 21:00'];
      });
    } else if (tier === 'B') {
      days.forEach((d) => {
        p[d.num] = ['09:45 - 10:00', '13:00 - 13:15', '16:30 - 16:45'];
      });
    } else if (tier === 'C') {
      days.forEach((d) => {
        p[d.num] = ['11:30 - 11:45', '14:45 - 15:00', '18:15 - 18:30'];
      });
    } else {
      // Tier D
      days.forEach((d) => {
        p[d.num] = ['22:15 - 22:30', '23:30 - 23:45'];
      });
    }
    setWeeklyPattern(p);
    setCopyFeedback(`Mapendekezo ya Tier ${tier} yamewekwa kwenye ratiba!`);
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  // Parser for Jazzler / Excel text import
  const handleParseImportText = (text: string) => {
    if (!text.trim()) return;

    const newPattern: DayPattern = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    const lines = text.split('\n');

    let currentDayIndex: number | null = null;
    let extractedCount = 0;

    const dayKeywords: { [kw: string]: number } = {
      sunday: 0, jumapili: 0, sun: 0,
      monday: 1, jumatatu: 1, mon: 1,
      tuesday: 2, jumanne: 2, tue: 2,
      wednesday: 3, jumatano: 3, wed: 3,
      thursday: 4, alhamisi: 4, thu: 4,
      friday: 5, ijumaa: 5, fri: 5,
      saturday: 6, jumamosi: 6, sat: 6,
    };

    lines.forEach((line) => {
      const lower = line.toLowerCase();

      // Check if line specifies a day
      for (const [kw, dayNum] of Object.entries(dayKeywords)) {
        if (lower.includes(kw)) {
          currentDayIndex = dayNum;
          break;
        }
      }

      // Extract time stamps like "07:30" or "07:30 - 07:45"
      const timeMatches = line.match(/\d{1,2}:\d{2}(\s*-\s*\d{1,2}:\d{2})?/g);
      if (timeMatches && timeMatches.length > 0) {
        timeMatches.forEach((tm) => {
          let slotStr = tm.replace(/\s+/g, ' ');
          if (!slotStr.includes('-')) {
            const [h, m] = slotStr.split(':').map(Number);
            const endM = (m + 15) % 60;
            const endH = m + 15 >= 60 ? (h + 1) % 24 : h;
            slotStr = `${slotStr} - ${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
          }

          if (currentDayIndex !== null) {
            if (!newPattern[currentDayIndex].includes(slotStr)) {
              newPattern[currentDayIndex].push(slotStr);
              extractedCount++;
            }
          } else {
            // If no day specified yet, distribute to weekdays (1-5)
            [1, 2, 3, 4, 5].forEach((d) => {
              if (!newPattern[d].includes(slotStr)) {
                newPattern[d].push(slotStr);
                extractedCount++;
              }
            });
          }
        });
      }
    });

    if (extractedCount > 0) {
      setWeeklyPattern(newPattern);
      setImportStatus(`Ufanisi: Spots ${extractedCount} zimeingizwa na kupangwa kwenye siku 7!`);
      setTimeout(() => {
        setIsImporterOpen(false);
        setImportStatus(null);
        setPastedText('');
      }, 1500);
    } else {
      setImportStatus('Hakuna masaa yaliyotambuliwa. Hakikisha maandishi yana muundo kama "07:30" au "Monday: 12:45".');
    }
  };

  // Handle file uploads (CSV, TXT, DOCX)
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        handleParseImportText(content);
      }
    };
    reader.readAsText(file);
  };

  // Traffic alignment / hourly congestion across the 24 hours
  const hourlyCongestion = useMemo(() => {
    const counts: { [hour: number]: { booked: number; planned: number } } = {};
    for (let h = 5; h < 24; h++) {
      counts[h] = { booked: 0, planned: 0 };
    }

    // Existing booked ads
    ads.forEach((a) => {
      const h = parseInt(a.scheduledTime.split(':')[0], 10);
      if (counts[h]) counts[h].booked += 1;
    });

    // Planned spots across the weekly pattern
    (Object.values(weeklyPattern) as string[][]).forEach((slots) => {
      slots.forEach((s) => {
        const start = s.split('-')[0].trim();
        const h = parseInt(start.split(':')[0], 10);
        if (counts[h]) counts[h].planned += 1;
      });
    });

    return counts;
  }, [ads, weeklyPattern]);

  // ROI Estimations Calculation
  const totalWeeklySpots = useMemo(() => {
    return (Object.values(weeklyPattern) as string[][]).reduce(
      (sum, slots) => sum + slots.length,
      0
    );
  }, [weeklyPattern]);

  const roiMetrics = useMemo(() => {
    let grossWeeklyImpressions = 0;
    const showsHit = new Set<string>();

    days.forEach((d) => {
      const slots = weeklyPattern[d.num] || [];
      slots.forEach((slot) => {
        const startTime = slot.split('-')[0].trim();
        const show = getShowForTime(startTime, d.num);
        const title = show?.name || 'Mseto Leo';
        showsHit.add(title);
        grossWeeklyImpressions += SHOW_AUDIENCE_MAP[title] || 250000;
      });
    });

    // Estimated unduplicated reach (Kagera & Lake Zone population ~3.2M)
    const reachBase = Math.min(2200000, 420000 + showsHit.size * 180000 + totalWeeklySpots * 15000);

    // Share of voice: total commercial slots on radio ~ 140 per week
    const shareOfVoice = Math.min(100, Math.round((totalWeeklySpots / 140) * 100));

    // Budget
    const weeklyBudgetTzs = totalWeeklySpots * estimatedRateTzs;
    const monthlyBudgetTzs = weeklyBudgetTzs * 4;

    return {
      totalWeeklySpots,
      grossWeeklyImpressions,
      reachEstimate: reachBase,
      shareOfVoice,
      weeklyBudgetTzs,
      monthlyBudgetTzs,
      showsHitCount: showsHit.size,
    };
  }, [weeklyPattern, totalWeeklySpots, estimatedRateTzs]);

  return (
    <div className="space-y-6">
      {/* Planner Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-500" />
              {language === 'sw' ? 'Mpangaji wa Spots za Siku 7 & Muundo wa Wiki' : '7-Day Spot Planner & Weekly Matrix'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'sw'
                ? 'Tengeneza mzunguko wa siku 7 (Sun-Sat), linganisha msongamano wa masaa, na pima makadirio ya hadhira (ROI)'
                : 'Design 7-day broadcast patterns (Sun-Sat), analyze hourly congestion, and simulate audience reach & ROI'}
            </p>
          </div>

          {/* Quick Preset Buttons & Import Trigger */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsImporterOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-700 text-xs font-semibold transition cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-purple-400" />
              <span>Smart Importer (Jazzler / Excel)</span>
            </button>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 px-1 font-semibold">Presets:</span>
              <button
                type="button"
                onClick={() => applyPreset('3x_daily')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer"
              >
                {language === 'sw' ? '3x Kila Siku' : '3x Daily'}
              </button>
              <button
                type="button"
                onClick={() => applyPreset('2x_drive')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer"
              >
                {language === 'sw' ? '2x Drive Time' : '2x Drive Time'}
              </button>
              <button
                type="button"
                onClick={() => applyPreset('weekdays_prime')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer"
              >
                {language === 'sw' ? 'Mon-Fri Tu' : 'Mon-Fri Only'}
              </button>
              <button
                type="button"
                onClick={() => applyPreset('weekend_special')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer"
              >
                {language === 'sw' ? 'Weekend Tu' : 'Weekend Only'}
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {copyFeedback && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{copyFeedback}</span>
          </div>
        )}
      </div>

      {/* 7-COLUMN GRID: SUN TO SAT */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-red-500" />
            {language === 'sw'
              ? `Ratiba ya Wiki Nzima (Sunday - Saturday Matrix): ${totalWeeklySpots} Spots kwa Wiki`
              : `Full Week Pattern (Sunday - Saturday Matrix): ${totalWeeklySpots} Weekly Spots`}
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {language === 'sw'
              ? 'Bofya "Nakili kwa Zote" kuhamisha masaa ya siku moja kwenda siku zote'
              : 'Click "Copy to All" to replicate a day\'s slots across the whole week'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 min-w-[900px]">
          {days.map((day) => {
            const slots = weeklyPattern[day.num] || [];

            return (
              <div
                key={day.num}
                className={`rounded-xl p-3 border flex flex-col justify-between transition ${
                  day.isWeekend
                    ? 'bg-slate-950/90 border-purple-900/40 hover:border-purple-700/60'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Day Header */}
                <div>
                  <div className="flex items-start justify-between gap-1 border-b border-slate-800/80 pb-2 mb-2.5">
                    <div>
                      <div className="font-bold text-white text-xs flex items-center gap-1">
                        <span>{language === 'sw' ? day.nameSw : day.nameEn}</span>
                        {day.isWeekend && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-purple-900/60 text-purple-300">
                            W/E
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {language === 'sw' ? day.nameEn : day.nameSw}
                      </div>
                    </div>

                    {/* Copy Day to All Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyDayToAll(day.num)}
                      title={
                        language === 'sw'
                          ? `Nakili masaa ya ${day.nameSw} kwa siku zote`
                          : `Copy ${day.nameEn} slots to all days`
                      }
                      className="p-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-blue-400 border border-slate-800 transition cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Spots Count Badge */}
                  <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center justify-between">
                    <span>{language === 'sw' ? 'Nafasi:' : 'Slots:'}</span>
                    <strong className="text-white bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                      {slots.length} spots
                    </strong>
                  </div>

                  {/* List of Time Slots */}
                  <div className="space-y-1.5 min-h-[140px]">
                    {slots.length === 0 ? (
                      <div className="text-[11px] text-slate-600 italic py-6 text-center">
                        {language === 'sw' ? 'Hakuna masaa yaliyopangwa' : 'No slots scheduled'}
                      </div>
                    ) : (
                      slots.map((slot) => {
                        const start = slot.split('-')[0].trim();
                        const show = getShowForTime(start, day.num);

                        return (
                          <div
                            key={slot}
                            className="group p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition relative"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-blue-400">
                                {slot}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSlotFromDay(day.num, slot)}
                                className="text-slate-500 hover:text-red-400 transition cursor-pointer"
                                title={language === 'sw' ? 'Ondoa saa hii' : 'Remove this slot'}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                              {show?.name || 'Mseto Leo'}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Add Time Slot Input at Bottom */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="k.m. 17:30"
                      value={newSlotInputs[day.num] || ''}
                      onChange={(e) =>
                        setNewSlotInputs((prev) => ({ ...prev, [day.num]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSlotToDay(day.num);
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-600 rounded-lg px-2 py-1 text-[11px] font-mono focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSlotToDay(day.num)}
                      className="p-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer shrink-0"
                      title={language === 'sw' ? 'Ongeza saa hii' : 'Add this slot'}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2 PANELS: TRAFFIC CONGESTION + SMART TIER STRATEGY & ROI ESTIMATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Cols: Hourly Traffic Congestion Heatmap */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                {language === 'sw'
                  ? 'Msongamano wa Masaa Hewani (Hourly Congestion Heatmap)'
                  : 'Hourly Airtime Congestion Heatmap'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'sw'
                  ? 'Uchambuzi wa upatikanaji wa nafasi kwa kila saa (05:00 - 24:00)'
                  : 'Real-time commercial slot availability analysis per hour (05:00 - 24:00)'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                {language === 'sw' ? 'Nafasi Ipo' : 'Available'}
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                {language === 'sw' ? 'Wastani' : 'Moderate'}
              </span>
              <span className="flex items-center gap-1 text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                {language === 'sw' ? 'Msongamano' : 'Heavy'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {(
              Object.entries(hourlyCongestion) as [
                string,
                { booked: number; planned: number }
              ][]
            ).map(([hStr, data]) => {
              const hour = parseInt(hStr, 10);
              const totalInHour = data.booked + data.planned;
              const isCongested = totalInHour >= 3;
              const isModerate = totalInHour === 2;

              return (
                <div
                  key={hour}
                  className={`p-2 rounded-xl border transition ${
                    isCongested
                      ? 'bg-red-950/30 border-red-700/60 text-red-200'
                      : isModerate
                      ? 'bg-amber-950/30 border-amber-700/60 text-amber-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="font-mono text-xs font-bold">
                    {String(hour).padStart(2, '0')}:00
                  </div>
                  <div className="text-[10px] mt-1 flex items-center justify-between">
                    <span className="text-slate-500">Spots:</span>
                    <strong
                      className={`font-mono ${
                        isCongested
                          ? 'text-red-400'
                          : isModerate
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {totalInHour} / 4
                    </strong>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={`h-full ${
                        isCongested
                          ? 'bg-red-500'
                          : isModerate
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, (totalInHour / 4) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 6 Cols: Smart Tier Strategies & ROI Estimator */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                {language === 'sw'
                  ? 'Mkakati kwa Tier ya Mteja & Makadirio ya ROI'
                  : 'Client Tier Strategy & Projected ROI'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'sw'
                  ? 'Pima makadirio ya hadhira, asilimia ya sauti hewani (SOV), na bajeti'
                  : 'Simulate audience impressions, station share of voice (SOV), and estimated investment'}
              </p>
            </div>

            {/* Tier Switcher */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {(['A', 'B', 'C', 'D'] as ClientTier[]).map((tr) => (
                <button
                  key={tr}
                  type="button"
                  onClick={() => applyTierRecommendation(tr)}
                  className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                    selectedTier === tr
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tier {tr}
                </button>
              ))}
            </div>
          </div>

          {/* Tier Strategy Description Box */}
          <div className="p-3 rounded-xl bg-slate-950 border border-purple-900/50 text-xs text-slate-300 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">
                {language === 'sw' ? `Mkakati wa Tier ${selectedTier}:` : `Tier ${selectedTier} Strategy:`}
              </span>
              <span className="text-[10px] text-purple-400 font-mono">
                {selectedTier === 'A'
                  ? 'Prime Drive Times (07:00-08:30 & 16:30-18:00)'
                  : selectedTier === 'B'
                  ? 'Midday Commercial Core (09:30-13:30)'
                  : selectedTier === 'C'
                  ? 'Afternoon & Local Community (14:00-18:30)'
                  : 'Late Night / Off-Peak (22:00-00:00)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {language === 'sw' ? (
                <>
                  {selectedTier === 'A' &&
                    'Inalenga wasikilizaji wengi zaidi wakati wa asubuhi (Asubuhi Njema) na jioni (Mseto Leo), bora kwa benki, kampuni za mawasiliano, na bidhaa za kitaifa.'}
                  {selectedTier === 'B' &&
                    'Inalenga biashara za kati na maduka ya kikanda wakati wa kazi za mchana na michezo.'}
                  {selectedTier === 'C' &&
                    'Inafaa kwa wajasiriamali wadogo wa Kagera na ngazi ya wilaya kwa gharama nafuu.'}
                  {selectedTier === 'D' &&
                    'Tangazo la saa za usiku na burudani tulivu kwa bajeti ndogo sana.'}
                </>
              ) : (
                <>
                  {selectedTier === 'A' &&
                    'Targets peak commuter listenership during morning (Asubuhi Njema) and evening drive (Mseto Leo), ideal for banks, telcos, and national brands.'}
                  {selectedTier === 'B' &&
                    'Targets medium enterprises and regional retailers during midday working hours and sports intervals.'}
                  {selectedTier === 'C' &&
                    'Tailored for local Kagera entrepreneurs and district SMEs with affordable broadcast entry.'}
                  {selectedTier === 'D' &&
                    'Late-night and quiet acoustic programming for ultra-budget awareness campaigns.'}
                </>
              )}
            </p>
          </div>

          {/* ROI Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">
                {language === 'sw' ? 'Hadhira ya Jumla' : 'Total Reach'}
              </div>
              <div className="text-base font-bold text-white font-mono mt-0.5">
                {(roiMetrics.reachEstimate / 1000000).toFixed(2)}M
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">
                {language === 'sw' ? 'Wasikilizaji Pekee' : 'Unique Listeners'}
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">
                {language === 'sw' ? 'Impressions' : 'Impressions'}
              </div>
              <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                {(roiMetrics.grossWeeklyImpressions / 1000000).toFixed(2)}M
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">
                {language === 'sw' ? 'Kusikia kwa Wiki' : 'Gross Weekly'}
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">
                {language === 'sw' ? 'Share of Voice' : 'Share of Voice'}
              </div>
              <div className="text-base font-bold text-purple-400 font-mono mt-0.5">
                {roiMetrics.shareOfVoice}%
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">
                {language === 'sw' ? 'Ujazo Hewani' : 'Airtime Density'}
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">
                {language === 'sw' ? 'Vipindi Vyenye Matangazo' : 'Shows Utilized'}
              </div>
              <div className="text-base font-bold text-blue-400 font-mono mt-0.5">
                {roiMetrics.showsHitCount} {language === 'sw' ? 'Vipindi' : 'Shows'}
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">
                {language === 'sw' ? 'Mtawanyo mzuri' : 'Balanced Spread'}
              </div>
            </div>
          </div>

          {/* Budget Estimator Slider / Inputs */}
          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">
                {language === 'sw' ? 'Gharama/Spot (TZS):' : 'Rate/Spot (TZS):'}
              </span>
              <input
                type="number"
                step="5000"
                value={estimatedRateTzs}
                onChange={(e) => setEstimatedRateTzs(Number(e.target.value))}
                className="w-24 bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <div>
                <span className="text-slate-400 text-[11px]">
                  {language === 'sw' ? 'Bajeti kwa Wiki:' : 'Weekly Budget:'}
                </span>{' '}
                <strong className="text-emerald-400 font-mono text-xs">
                  TZS {roiMetrics.weeklyBudgetTzs.toLocaleString()}
                </strong>
              </div>
              <div className="h-3 w-px bg-slate-700" />
              <div>
                <span className="text-slate-400 text-[11px]">
                  {language === 'sw' ? 'Bajeti kwa Mwezi:' : 'Monthly Budget:'}
                </span>{' '}
                <strong className="text-purple-400 font-mono text-xs">
                  TZS {roiMetrics.monthlyBudgetTzs.toLocaleString()}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SMART IMPORTER MODAL */}
      {isImporterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-purple-400" />
                  {language === 'sw'
                    ? 'Smart Importer: Jazzler Soho, Excel & Word'
                    : 'Smart Importer: Jazzler Soho, Excel & Word'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'sw'
                    ? 'Bandika maandishi au pakia faili ili mfumo utambue kiotomatiki masaa na siku'
                    : 'Paste text or upload file for automatic day & time slot extraction'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsImporterOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className={`p-5 rounded-xl border-2 border-dashed text-center transition cursor-pointer ${
                dragOver
                  ? 'border-purple-500 bg-purple-950/30'
                  : 'border-slate-700 bg-slate-950/60 hover:border-slate-600'
              }`}
            >
              <FileSpreadsheet className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-xs font-semibold text-slate-200">
                {language === 'sw'
                  ? 'Buruta na uangushe faili la CSV, TXT, au Word (.docx) hapa'
                  : 'Drag & drop CSV, TXT, or Word (.docx) file here'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {language === 'sw' ? 'au bofya kuchagua kutoka kwenye kifaa chako' : 'or click to browse from device'}
              </div>
              <input
                type="file"
                accept=".csv,.txt,.docx,.doc,.pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                className="hidden"
                id="smart-file-upload-input"
              />
              <label
                htmlFor="smart-file-upload-input"
                className="mt-2 inline-block px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                {language === 'sw' ? 'Chagua Faili' : 'Select File'}
              </label>
            </div>

            {/* Textarea Paste */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'sw'
                  ? 'Au Bandika Maandishi ya Ratiba (Paste text directly):'
                  : 'Or Paste Broadcast Schedule Text Directly:'}
              </label>
              <textarea
                rows={5}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={
                  language === 'sw'
                    ? `Mfano:\nMonday: 07:30, 13:15, 17:15\nTuesday: 07:30, 12:45\nSunday: 08:30, 15:00`
                    : `Example:\nMonday: 07:30, 13:15, 17:15\nTuesday: 07:30, 12:45\nSunday: 08:30, 15:00`
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            {importStatus && (
              <div className="p-3 rounded-xl bg-purple-950 border border-purple-700 text-purple-200 text-xs">
                {importStatus}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsImporterOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                {language === 'sw' ? 'Ghairi' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleParseImportText(pastedText)}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
              >
                {language === 'sw' ? 'Chakata & Weka kwenye Ratiba' : 'Process & Apply Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
