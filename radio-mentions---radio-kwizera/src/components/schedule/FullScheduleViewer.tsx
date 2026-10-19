import React, { useState } from 'react';
import { useRadioApp } from '../../context/RadioAppContext';
import { Program, DayType } from '../../types';
import {
  Calendar,
  Clock,
  Radio,
  User,
  CheckCircle2,
  Tag,
  Search,
} from 'lucide-react';

export const FullScheduleViewer: React.FC = () => {
  const { programs, t, language, studioDarkMode, setSelectedProgramId } = useRadioApp();

  const [dayFilter, setDayFilter] = useState<DayType>('weekday');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = programs.filter(
    (p) =>
      p.dayType === dayFilter &&
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className={`p-4 sm:p-6 max-w-7xl mx-auto space-y-6 ${studioDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-red-600 text-white">
              Official 2026 Grid
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              Radio Kwizera 97.7 FM • Jukwaa la Matumaini
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Master Program Broadcast Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {language === 'sw'
              ? 'Ratiba kamili ya vipindi na nafasi za matangazo ya kibiashara kwa siku za wiki na wikendi.'
              : 'Official certified schedule with segment breakdowns and ad break positions.'}
          </p>
        </div>

        {/* Day Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setDayFilter('weekday')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              dayFilter === 'weekday' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t?.schedule?.weekdays || 'Siku za Wiki'} (Jumatatu - Ijumaa)
          </button>
          <button
            onClick={() => setDayFilter('saturday')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              dayFilter === 'saturday' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t?.schedule?.saturday || 'Jumamosi'}
          </button>
          <button
            onClick={() => setDayFilter('sunday')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              dayFilter === 'sunday' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t?.schedule?.sunday || 'Jumapili'}
          </button>
        </div>
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((prog) => (
          <div
            key={prog.id}
            className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-black text-amber-400 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                  {prog.timeSlot}
                </span>
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider bg-red-950/60 px-2 py-0.5 rounded border border-red-800/60">
                  97.7 FM
                </span>
              </div>

              <h2 className="text-lg font-black text-white mb-1">{prog.name}</h2>
              <div className="flex items-center gap-1.5 text-xs text-purple-300 font-semibold mb-3">
                <Radio className="w-3.5 h-3.5 text-red-400" />
                <span>Studio On-Air Broadcast Desk</span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {prog.description}
              </p>

              {/* Segments breakdown */}
              <div className="space-y-1.5 border-t border-slate-800/80 pt-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Show Segments & Ad Breaks
                </span>
                {prog.segments.map((seg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between text-[11px] px-2 py-1 rounded ${
                      seg.isAdBreak
                        ? 'bg-red-950/40 text-red-300 font-bold border border-red-900/40'
                        : 'text-slate-400'
                    }`}
                  >
                    <span className="font-mono text-[10px]">{seg.timeSlot}</span>
                    <span className="truncate max-w-[150px]">{seg.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedProgramId(prog.id)}
              className="mt-4 w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-colors"
            >
              Open in Studio Tablet →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
