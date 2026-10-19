import React, { useState, useMemo } from 'react';
import {
  ListChecks,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  Clock,
  Radio,
  FileText,
  Volume2,
  Building,
  UserCheck,
  Zap,
  Printer,
  Layers,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { useRadioApp } from '../context/RadioAppContext';
import { ScheduledSpotItem } from '../types';
import { getDayName } from '../utils';

export const MasterPlayoutSheet: React.FC = () => {
  const { campaigns, updateScheduledSpot, signAdMention, currentUser, isOnline } = useRadioApp();

  const [dateFilter, setDateFilter] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedShow, setSelectedShow] = useState<string>('all');
  const [selectedPresenter, setSelectedPresenter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'aired' | 'overdue'>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'grouped'>('timeline');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Flatten all scheduled spots across all active campaigns
  const allMasterSpots = useMemo(() => {
    const spots: ScheduledSpotItem[] = [];
    campaigns.forEach((camp) => {
      if (camp.scheduledSpots) {
        camp.scheduledSpots.forEach((s) => {
          spots.push(s);
        });
      }
    });
    // Sort by date then time
    return spots.sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return a.timeBetween.localeCompare(b.timeBetween);
    });
  }, [campaigns]);

  // Unique list of shows and presenters
  const availableShows = useMemo(() => {
    const set = new Set<string>();
    allMasterSpots.forEach((s) => set.add(s.programName));
    return Array.from(set).sort();
  }, [allMasterSpots]);

  const availablePresenters = useMemo(() => {
    const set = new Set<string>();
    allMasterSpots.forEach((s) => {
      if (s.signedBy) set.add(s.signedBy);
    });
    return Array.from(set).sort();
  }, [allMasterSpots]);

  // Filtered spots
  const filteredSpots = useMemo(() => {
    return allMasterSpots.filter((s) => {
      const matchDate = !dateFilter || s.date === dateFilter;
      const matchShow = selectedShow === 'all' || s.programName === selectedShow;
      const matchPresenter =
        selectedPresenter === 'all' ||
        (selectedPresenter === 'unsigned' ? !s.signedBy : s.signedBy === selectedPresenter);

      const isOverdue = !s.isAired && s.date < todayStr;
      let matchStatus = true;
      if (statusFilter === 'aired') matchStatus = s.isAired;
      else if (statusFilter === 'pending') matchStatus = !s.isAired && !isOverdue;
      else if (statusFilter === 'overdue') matchStatus = isOverdue;

      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        s.clientName.toLowerCase().includes(q) ||
        s.campaignName.toLowerCase().includes(q) ||
        s.programName.toLowerCase().includes(q) ||
        s.timeBetween.toLowerCase().includes(q) ||
        (s.signedBy && s.signedBy.toLowerCase().includes(q));

      return matchDate && matchShow && matchPresenter && matchStatus && matchQuery;
    });
  }, [
    allMasterSpots,
    dateFilter,
    selectedShow,
    selectedPresenter,
    statusFilter,
    searchQuery,
    todayStr,
  ]);

  // Grouped by program
  const groupedByProgram = useMemo(() => {
    const map = new Map<string, ScheduledSpotItem[]>();
    filteredSpots.forEach((s) => {
      const existing = map.get(s.programName) || [];
      existing.push(s);
      map.set(s.programName, existing);
    });
    return Array.from(map.entries()).map(([programName, spots]) => ({
      programName,
      spots,
      airedCount: spots.filter((sp) => sp.isAired).length,
    }));
  }, [filteredSpots]);

  // Handle direct sign-off / toggle from Master Sheet
  const handleToggleSign = (spot: ScheduledSpotItem) => {
    if (!spot.isAired) {
      const now = new Date().toLocaleTimeString('sw-TZ', {
        timeZone: 'Africa/Nairobi',
        hour: '2-digit',
        minute: '2-digit',
      });
      updateScheduledSpot(spot.id, {
        isAired: true,
        timeAired: now,
        signature: currentUser.name,
        signedBy: currentUser.name,
      });
      signAdMention(spot.id, currentUser.name);
    } else {
      updateScheduledSpot(spot.id, {
        isAired: false,
        timeAired: undefined,
        signature: undefined,
        signedBy: undefined,
      });
    }
  };

  const totalFiltered = filteredSpots.length;
  const airedFiltered = filteredSpots.filter((s) => s.isAired).length;
  const pendingFiltered = filteredSpots.filter((s) => !s.isAired).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print:hidden">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
            <Radio className="w-3.5 h-3.5 text-blue-400" />
            Jumla ya Spots Kwenye Karatasi
          </div>
          <div className="text-2xl font-bold text-white font-mono">{totalFiltered}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {dateFilter ? `Tarehe: ${dateFilter}` : 'Muda wote'}
          </div>
        </div>

        <div className="bg-slate-900 border border-emerald-900/60 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-emerald-400 flex items-center gap-1.5 mb-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            Zilizosomwa & Kuthibitishwa Studio
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{airedFiltered}</div>
          <div className="text-[11px] text-emerald-300 mt-1">
            {totalFiltered > 0 ? Math.round((airedFiltered / totalFiltered) * 100) : 0}% zimekamilika
          </div>
        </div>

        <div className="bg-slate-900 border border-amber-900/60 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-amber-400 flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Zinazosubiri Kurushwa Hewani
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{pendingFiltered}</div>
          <div className="text-[11px] text-slate-500 mt-1">Inasawazishwa na Studio Tablet</div>
        </div>
      </div>

      {/* Filter & View Switcher Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xs space-y-3 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-red-500" />
              Master Playout Sheet (2026 Broadcasting Schedule)
            </h3>
            <p className="text-xs text-slate-400">
              Orodha kuu ya matangazo ya redio kwa mpangilio wa masaa, ikisawazishwa moja kwa moja
              na Studio Tablet
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  viewMode === 'timeline'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Mfuatano wa Saa (Timeline)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grouped')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  viewMode === 'grouped'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Kikundi cha Vipindi (Programs)
              </button>
            </div>

            {/* Print Button */}
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>Chapisha Log</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 pt-2 border-t border-slate-800 text-xs">
          {/* Date Picker */}
          <div>
            <label className="block text-slate-400 mb-1">Tarehe:</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-1.5 font-mono focus:outline-none"
            />
          </div>

          {/* Show Filter */}
          <div>
            <label className="block text-slate-400 mb-1">Kipindi:</label>
            <select
              value={selectedShow}
              onChange={(e) => setSelectedShow(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-1.5 focus:outline-none"
            >
              <option value="all">Vipindi Vyote ({availableShows.length})</option>
              {availableShows.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Presenter Filter */}
          <div>
            <label className="block text-slate-400 mb-1">Mtangazaji / Sahihi:</label>
            <select
              value={selectedPresenter}
              onChange={(e) => setSelectedPresenter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-1.5 focus:outline-none"
            >
              <option value="all">Wote</option>
              <option value="unsigned">Bado Haijasainiwa (Unsigned)</option>
              {availablePresenters.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-slate-400 mb-1">Hali:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-1.5 focus:outline-none"
            >
              <option value="all">Hali Zote</option>
              <option value="pending">Inasubiri (Pending)</option>
              <option value="aired">Zilizosomwa (Aired)</option>
              <option value="overdue">Overdue (Zilizopita)</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-slate-400 mb-1">Tafuta:</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Mteja, saa, tangazo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg pl-7 pr-2 p-1.5 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* VIEW 1: GROUPED BY PROGRAM SEGMENT */}
      {viewMode === 'grouped' ? (
        <div className="space-y-4">
          {groupedByProgram.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center text-slate-500 text-xs italic">
              Hakuna matangazo yaliyopangwa kulingana na vigezo vilivyochaguliwa.
            </div>
          ) : (
            groupedByProgram.map((group) => (
              <div
                key={group.programName}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs"
              >
                {/* Program Header */}
                <div className="px-5 py-3 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-purple-400" />
                    <span className="font-bold text-white text-sm">{group.programName}</span>
                    <span className="text-xs text-slate-400 font-mono">
                      ({group.spots.length} Mentions Zimeratibiwa)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                      {group.airedCount} / {group.spots.length} Zimesomwa
                    </span>
                  </div>
                </div>

                {/* Spots in this program */}
                <div className="divide-y divide-slate-800/80">
                  {group.spots.map((spot) => (
                    <div
                      key={spot.id}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                        spot.isAired ? 'bg-emerald-950/10' : 'hover:bg-slate-850/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-28 font-mono font-bold text-blue-400 text-xs">
                          {spot.timeBetween}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{spot.clientName}</div>
                          <div className="text-[11px] text-purple-300">{spot.campaignName}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {spot.adType}
                        </span>

                        {spot.isAired ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-mono font-semibold">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {spot.signedBy} @ {spot.timeAired}
                          </span>
                        ) : (
                          <span className="text-amber-400 text-xs font-medium">Inasubiri</span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleToggleSign(spot)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            spot.isAired
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                          }`}
                        >
                          {spot.isAired ? 'Batilisha' : 'Saini Hewani'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* VIEW 2: CHRONOLOGICAL TIMELINE TABLE */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Muda Uliopangwa</th>
                  <th className="py-3 px-3">Tarehe & Siku</th>
                  <th className="py-3 px-4">Kipindi Rasmi</th>
                  <th className="py-3 px-4">Mteja & Kampeni</th>
                  <th className="py-3 px-3">Aina</th>
                  <th className="py-3 px-4 text-center">Hali ya Kurushwa</th>
                  <th className="py-3 px-4 text-right">Sahihi ya Studio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-sans">
                {filteredSpots.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                      Hakuna matangazo yaliyopatikana kwa vigezo hivi kwenye Master Playout Sheet.
                    </td>
                  </tr>
                ) : (
                  filteredSpots.map((spot) => {
                    const isPast = spot.date < todayStr;
                    const isOverdue = !spot.isAired && isPast;
                    const dayDisplay = getDayName(spot.dayOfWeek, 'sw');

                    return (
                      <tr
                        key={spot.id}
                        className={`transition ${
                          spot.isAired
                            ? 'bg-emerald-950/10 hover:bg-emerald-950/20'
                            : isOverdue
                            ? 'bg-red-950/20 hover:bg-red-950/30'
                            : 'hover:bg-slate-850/50'
                        }`}
                      >
                        {/* Time Slot */}
                        <td className="py-3 px-3 font-mono font-bold text-blue-400">
                          {spot.timeBetween}
                        </td>

                        {/* Date */}
                        <td className="py-3 px-3 font-mono text-slate-400">
                          {spot.date} ({dayDisplay})
                        </td>

                        {/* Show Name */}
                        <td className="py-3 px-4">
                          <span className="font-bold text-white">{spot.programName}</span>
                        </td>

                        {/* Client & Campaign */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-200">{spot.clientName}</div>
                          <div className="text-[11px] text-purple-300">{spot.campaignName}</div>
                        </td>

                        {/* Ad Type */}
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 font-medium">
                            {spot.adType}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-4 text-center">
                          {spot.isAired ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold text-[10px] flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Imesomwa
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                                {spot.signedBy} @ {spot.timeAired}
                              </span>
                            </div>
                          ) : isOverdue ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-700 text-[10px] font-bold flex items-center gap-1 mx-auto w-fit">
                              <AlertTriangle className="w-3 h-3" />
                              Overdue
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700 text-[10px] font-medium">
                              Inasubiri
                            </span>
                          )}
                        </td>

                        {/* Sign-off button */}
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleSign(spot)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                              spot.isAired
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                            }`}
                          >
                            {spot.isAired ? 'Batilisha (Undo)' : 'Saini Hewani (Sign)'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
