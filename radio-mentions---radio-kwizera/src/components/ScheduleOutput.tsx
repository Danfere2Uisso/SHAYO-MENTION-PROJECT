import React, { useState, useMemo } from 'react';
import {
  Printer,
  Download,
  Search,
  Calendar,
  Filter,
  FileText,
  Radio,
  CheckCircle,
  Clock,
  Building,
  UserCheck,
  FileCode,
  CheckSquare,
  Database,
  Sparkles,
  AlertCircle,
  X,
} from 'lucide-react';
import { useRadioApp } from '../context/RadioAppContext';
import { ScheduledSpotItem } from '../types';
import { exportSpotsToCSV, exportSpotsToWord, exportSpotsToICS, exportToJSON, getDayName } from '../utils';
import { OfficialRadioKwizeraLogo } from './Logo';
import { saveSpotsToTrafficDb } from '../data/adSuggestions';
import { getShowForTime } from '../data/timetable';

export const ScheduleOutput: React.FC = () => {
  const { campaigns, ads, updateScheduledSpot, currentUser, language, t } = useRadioApp();

  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'aired' | 'pending'>('all');
  const [strikethroughPastDates, setStrikethroughPastDates] = useState<boolean>(true);
  const [editingSpotId, setEditingSpotId] = useState<string | null>(null);
  const [manualTime, setManualTime] = useState<string>('');
  const [manualSigner, setManualSigner] = useState<string>('');

  // Traffic Database Print Interception State
  const [showTrafficModal, setShowTrafficModal] = useState<boolean>(false);
  const [trafficSavedSuccess, setTrafficSavedSuccess] = useState<boolean>(false);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Consolidate all spots
  const allSpots = useMemo(() => {
    const list: ScheduledSpotItem[] = [];
    campaigns.forEach((c) => {
      if (c.scheduledSpots) {
        list.push(...c.scheduledSpots);
      }
    });
    return list;
  }, [campaigns]);

  // Filtered spots
  const filteredSpots = useMemo(() => {
    return allSpots.filter((spot) => {
      const matchCampaign =
        selectedCampaignId === 'all' || spot.campaignId === selectedCampaignId;
      const matchDate = !filterDate || spot.date === filterDate;
      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'aired'
          ? spot.isAired
          : !spot.isAired;

      const q = searchQuery.toLowerCase();
      const matchQuery =
        spot.clientName.toLowerCase().includes(q) ||
        spot.campaignName.toLowerCase().includes(q) ||
        spot.programName.toLowerCase().includes(q) ||
        spot.timeBetween.toLowerCase().includes(q) ||
        (spot.signedBy && spot.signedBy.toLowerCase().includes(q));

      return matchCampaign && matchDate && matchStatus && matchQuery;
    });
  }, [allSpots, selectedCampaignId, filterDate, statusFilter, searchQuery]);

  const activeCampaign = useMemo(() => {
    return campaigns.find((c) => c.id === selectedCampaignId);
  }, [campaigns, selectedCampaignId]);

  // Format date to full readable string (e.g., "15 March 2026")
  const formatDateFull = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const monthNamesEn = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const monthNamesSw = [
          'Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni',
          'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'
        ];
        const month = language === 'sw' ? monthNamesSw[monthIndex] : monthNamesEn[monthIndex];
        return `${day} ${month || ''} ${year}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Intercept the Print / Export PDF button click
  const handlePrint = () => {
    setShowTrafficModal(true);
  };

  // Save to traffic DB and then proceed to print
  const handleConfirmSaveAndPrint = () => {
    const spotsToProcess = filteredSpots.length > 0 ? filteredSpots : allSpots;

    // Enrich spots with getShowForTime to identify program if needed
    const enrichedSpots = spotsToProcess.map((spot) => {
      let progName = spot.programName;
      if (!progName || progName === 'General Broadcast') {
        const timeStr = spot.timeBetween ? spot.timeBetween.split('-')[0].trim() : '07:30';
        const show = getShowForTime(timeStr, spot.dayOfWeek);
        if (show) progName = show.name;
      }
      return {
        ...spot,
        programName: progName,
      };
    });

    saveSpotsToTrafficDb(enrichedSpots);
    setTrafficSavedSuccess(true);
    setShowTrafficModal(false);

    // Proceed to print
    setTimeout(() => {
      window.print();
      setTrafficSavedSuccess(false);
    }, 450);
  };

  // Skip saving to DB and print directly
  const handleSkipAndPrint = () => {
    setShowTrafficModal(false);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleSaveSpotSign = (spotId: string) => {
    const now = new Date().toLocaleTimeString('sw-TZ', {
      timeZone: 'Africa/Nairobi',
      hour: '2-digit',
      minute: '2-digit',
    });
    const signer = manualSigner.trim() || currentUser.name;
    const time = manualTime.trim() || now;
    updateScheduledSpot(spotId, {
      isAired: true,
      timeAired: time,
      signature: signer,
      signedBy: signer,
    });
    setEditingSpotId(null);
    setManualTime('');
    setManualSigner('');
  };

  return (
    <div className="space-y-6">
      {/* Control & Filter Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs space-y-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Printer className="w-5 h-5 text-blue-400" />
              {language === 'sw' ? 'Injini ya Kutoa & Kuchapisha Ratiba' : 'Schedule Output & Export Engine'}
            </h2>
            <p className="text-xs text-slate-400">
              {language === 'sw'
                ? 'Chapisha ratiba rasmi ya matangazo au pakua kwa ajili ya mteja, msimamizi au studio'
                : 'Print official broadcast schedule or export for client certification, compliance, and studio logs'}
            </p>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>{language === 'sw' ? 'Chapisha (Print / PDF)' : 'Print / Save PDF'}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                exportSpotsToCSV(
                  filteredSpots,
                  activeCampaign ? activeCampaign.name : 'Ratiba_Kwizera_2026'
                )
              }
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>CSV (Google Sheets / Excel)</span>
            </button>

            <button
              type="button"
              onClick={() =>
                exportSpotsToWord(
                  filteredSpots,
                  activeCampaign ? activeCampaign.name : 'Ratiba_Kwizera_FM',
                  activeCampaign ? activeCampaign.clientName : (language === 'sw' ? 'Wateja Mbalimbali' : 'Multiple Clients'),
                  activeCampaign ? activeCampaign.script : (language === 'sw' ? 'Script mbalimbali za matangazo ya redio.' : 'Official radio commercial broadcast scripts.')
                )
              }
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-900/60 hover:bg-blue-800 text-blue-200 text-xs font-semibold transition border border-blue-700 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-blue-300" />
              <span>MS Word (.doc)</span>
            </button>

            <button
              type="button"
              onClick={() =>
                exportSpotsToICS(
                  filteredSpots,
                  activeCampaign ? activeCampaign.name : 'Ratiba_Kwizera'
                )
              }
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-xs font-semibold transition border border-purple-700 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-purple-300" />
              <span>Google Calendar (.ics)</span>
            </button>

            <button
              type="button"
              onClick={() =>
                exportToJSON(
                  { campaign: activeCampaign, spots: filteredSpots, exportedAt: new Date().toISOString() },
                  activeCampaign ? `Backup_${activeCampaign.name}` : 'Backup_Ratiba_Kwizera'
                )
              }
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-950/60 hover:bg-amber-900 text-amber-200 text-xs font-semibold transition border border-amber-700 cursor-pointer"
            >
              <FileCode className="w-4 h-4 text-amber-400" />
              <span>JSON Backup</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2 border-t border-slate-800 text-xs">
          {/* Campaign Selector */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">
              {language === 'sw' ? 'Kampeni:' : 'Campaign:'}
            </label>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">
                {language === 'sw'
                  ? `Kampeni Zote Zinazoendelea (${campaigns.length})`
                  : `All Active Campaigns (${campaigns.length})`}
              </option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.clientName} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">
              {language === 'sw' ? 'Tarehe Maalum:' : 'Specific Date:'}
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none font-mono"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">
              {language === 'sw' ? 'Hali Hewani:' : 'Broadcast Status:'}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">{language === 'sw' ? 'Zote (Aired & Pending)' : 'All (Aired & Pending)'}</option>
              <option value="aired">{language === 'sw' ? 'Zilizosomwa Tu (Signed On-Air)' : 'Aired Only (Signed)'}</option>
              <option value="pending">{language === 'sw' ? 'Zinazosubiri Tu (Pending)' : 'Pending Broadcast'}</option>
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">
              {language === 'sw' ? 'Tafuta:' : 'Search:'}
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'sw' ? 'Kipindi, mteja, mtangazaji...' : 'Show, client, presenter...'}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg pl-8 pr-2 py-1.5 focus:outline-none"
              />
            </div>
          </div>

          {/* Past date strikethrough toggle */}
          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 py-1.5 select-none">
              <input
                type="checkbox"
                checked={strikethroughPastDates}
                onChange={(e) => setStrikethroughPastDates(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-slate-950 border-slate-700"
              />
              <span>{language === 'sw' ? 'Kata mistari ya tarehe zilizopita' : 'Strike past dates'}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Printable Sheet View */}
      <div className="bg-white text-slate-900 rounded-2xl shadow-xl p-8 border border-slate-300 font-sans print:p-0 print:border-none print:shadow-none">
        {/* Radio Kwizera Official Header */}
        <div className="border-b-2 border-red-600 pb-4 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <OfficialRadioKwizeraLogo className="w-14 h-14 object-contain shrink-0" alt="JRS Radio Kwizera 97.7 FM" />
              <div>
                <h1 className="text-2xl font-black text-red-600 tracking-wide uppercase">
                  JRS Radio Kwizera 97.7 FM
                </h1>
                <div className="text-xs font-bold text-slate-600 tracking-wider uppercase mt-0.5">
                  "Jukwaa la Matumaini" • Ngara, Kagera, Tanzania
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Commercial Broadcast Schedule & Transmission Log • Schedule Year 2026
                </div>
              </div>
            </div>

            <div className="text-right text-xs text-slate-600 space-y-0.5">
              <div>
                <strong>{language === 'sw' ? 'Tarehe ya Ripoti:' : 'Report Date:'}</strong> {new Date().toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US')}
              </div>
              <div>
                <strong>{language === 'sw' ? 'Saa ya Afrika Mashariki:' : 'East Africa Time:'}</strong> {new Date().toLocaleTimeString(language === 'sw' ? 'sw-TZ' : 'en-US')} EAT
              </div>
              <div>
                <strong>{language === 'sw' ? 'Jumla ya Spots:' : 'Total Spots:'}</strong> {filteredSpots.length}
              </div>
            </div>
          </div>

          {activeCampaign && (
            <div className="mt-4 p-3 bg-slate-100 rounded-lg border border-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-slate-500">{language === 'sw' ? 'Mteja:' : 'Client:'}</span>{' '}
                <strong className="text-slate-900">{activeCampaign.clientName}</strong>
              </div>
              <div>
                <span className="text-slate-500">{language === 'sw' ? 'Kampeni:' : 'Campaign:'}</span>{' '}
                <strong className="text-slate-900">{activeCampaign.name}</strong>
              </div>
              <div>
                <span className="text-slate-500">{language === 'sw' ? 'Aina:' : 'Type:'}</span>{' '}
                <strong className="text-slate-900">{activeCampaign.adType}</strong>
              </div>
              <div>
                <span className="text-slate-500">{language === 'sw' ? 'Gharama:' : 'Cost:'}</span>{' '}
                <strong className="text-red-700 font-mono">
                  TZS {activeCampaign.totalCostTzs.toLocaleString()}
                </strong>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] text-slate-600 mb-3 pb-2 border-b border-slate-200 print:hidden">
          <span className="font-semibold">{language === 'sw' ? 'Maelezo ya Rangi:' : 'Color Legend:'}</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-100 border border-blue-400 inline-block" />
            <span>{language === 'sw' ? `Leo (${todayStr})` : `Today (${todayStr})`}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-50 border border-amber-300 inline-block" />
            <span>{language === 'sw' ? 'Mwisho wa Wiki (Weekend)' : 'Weekend Slots'}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300 inline-block" />
            <span>{language === 'sw' ? 'Siku za Kazi (Weekdays)' : 'Weekday Slots'}</span>
          </span>
        </div>

        {/* Spots Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-800 text-slate-800 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-2">Spot #</th>
                <th className="py-2.5 px-3 w-[16%] min-w-[145px] whitespace-nowrap">{language === 'sw' ? 'Tarehe' : 'Date'}</th>
                <th className="py-2.5 px-2">{language === 'sw' ? 'Siku' : 'Day'}</th>
                <th className="py-2.5 px-3">{language === 'sw' ? 'Muda Uliopangwa' : 'Scheduled Slot'}</th>
                <th className="py-2.5 px-3">{language === 'sw' ? 'Kipindi Rasmi (Show)' : 'Official Show'}</th>
                <th className="py-2.5 px-3">{language === 'sw' ? 'Mteja & Kampeni' : 'Client & Campaign'}</th>
                <th className="py-2.5 px-2">{language === 'sw' ? 'Aina' : 'Type'}</th>
                <th className="py-2.5 px-3 text-center">{language === 'sw' ? 'Hali Hewani' : 'Status'}</th>
                <th className="py-2.5 px-3">{language === 'sw' ? 'Sahihi ya Mtangazaji (Log / Sign)' : 'Presenter Signature'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {filteredSpots.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 italic">
                    {language === 'sw'
                      ? 'Hakuna matangazo yaliyopatikana kulingana na vigezo vilivyochaguliwa.'
                      : 'No broadcast spots found matching current filter criteria.'}
                  </td>
                </tr>
              ) : (
                filteredSpots.map((spot, idx) => {
                  const isToday = spot.date === todayStr;
                  const isPast = spot.date < todayStr;
                  const dayDisplay = getDayName(spot.dayOfWeek, language);
                  const applyStrikethrough = strikethroughPastDates && isPast && spot.isAired;

                  return (
                    <tr
                      key={spot.id}
                      className={`transition ${
                        isToday
                          ? 'bg-blue-50/80 font-medium ring-1 ring-blue-300'
                          : spot.isWeekend
                          ? 'bg-amber-50/40'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2 px-2 font-mono font-bold text-slate-500">#{idx + 1}</td>
                      <td className={`py-2 px-3 w-[16%] min-w-[145px] whitespace-nowrap font-mono ${applyStrikethrough ? 'line-through text-slate-400' : ''}`}>
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <span className="font-semibold text-slate-900">{formatDateFull(spot.date)}</span>
                          {isToday && (
                            <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white text-[9px] font-bold uppercase">
                              {language === 'sw' ? 'Leo' : 'Today'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-2 font-medium">
                        <span className={spot.isWeekend ? 'text-amber-800 font-bold' : 'text-slate-700'}>
                          {dayDisplay}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-blue-800">{spot.timeBetween}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{spot.programName}</td>
                      <td className="py-2 px-3">
                        <div className="font-bold">{spot.clientName}</div>
                        <div className="text-[10px] text-slate-500">{spot.campaignName}</div>
                      </td>
                      <td className="py-2 px-2">{spot.adType}</td>
                      <td className="py-2 px-3 text-center">
                        {spot.isAired ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            {language === 'sw' ? 'Imesomwa' : 'Aired'}
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium text-[10px]">
                            {language === 'sw' ? 'Inasubiri' : 'Pending'}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px]">
                        {editingSpotId === spot.id ? (
                          <div className="flex items-center gap-1.5 print:hidden">
                            <input
                              type="text"
                              value={manualTime}
                              onChange={(e) => setManualTime(e.target.value)}
                              placeholder={language === 'sw' ? 'Muda (k.m. 17:05)' : 'Time (e.g. 17:05)'}
                              className="w-20 px-1.5 py-0.5 border border-slate-300 rounded text-[10px]"
                            />
                            <input
                              type="text"
                              value={manualSigner}
                              onChange={(e) => setManualSigner(e.target.value)}
                              placeholder={language === 'sw' ? 'Jina / Sahihi' : 'Signer Name'}
                              className="w-24 px-1.5 py-0.5 border border-slate-300 rounded text-[10px]"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveSpotSign(spot.id)}
                              className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold cursor-pointer"
                            >
                              {language === 'sw' ? 'Hifadhi' : 'Save'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingSpotId(null)}
                              className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] cursor-pointer"
                            >
                              X
                            </button>
                          </div>
                        ) : spot.signedBy ? (
                          <div className="flex items-center justify-between group">
                            <div>
                              <strong className="text-slate-900">{spot.signedBy}</strong>
                              <div className="text-[10px] text-slate-500">{spot.timeAired}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSpotId(spot.id);
                                setManualTime(spot.timeAired || '');
                                setManualSigner(spot.signedBy || '');
                              }}
                              className="opacity-0 group-hover:opacity-100 text-[10px] text-blue-600 underline ml-2 print:hidden cursor-pointer"
                            >
                              {language === 'sw' ? 'Hariri' : 'Edit'}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 italic">___________________</span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSpotId(spot.id);
                                setManualTime(new Date().toLocaleTimeString('sw-TZ', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' }));
                                setManualSigner(currentUser.name);
                              }}
                              className="text-[10px] text-blue-600 hover:text-blue-800 font-bold ml-2 print:hidden cursor-pointer"
                            >
                              + {language === 'sw' ? 'Saini Hapa' : 'Sign Here'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Script Attachment Section if Single Campaign */}
        {activeCampaign && activeCampaign.script && (
          <div className="mt-6 pt-4 border-t border-slate-300">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              {language === 'sw'
                ? 'Nakala Rasmi ya Kusomwa na Mtangazaji (Official Script):'
                : 'Official Broadcast Script (Teleprompter):'}
            </h4>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs leading-relaxed text-slate-800 font-sans whitespace-pre-wrap">
              {activeCampaign.script}
            </div>
          </div>
        )}

        {/* Signatures & Certification Footer */}
        <div className="mt-8 pt-6 border-t-2 border-slate-800 grid grid-cols-3 gap-6 text-xs text-slate-600">
          <div>
            <div className="font-bold text-slate-800">
              {language === 'sw' ? 'Afisa Masoko (Marketing Officer):' : 'Marketing Officer:'}
            </div>
            <div className="mt-8 border-b border-slate-400 w-40" />
            <div className="mt-1 text-[11px]">{language === 'sw' ? 'Sahihi & Tarehe' : 'Signature & Date'}</div>
          </div>
          <div>
            <div className="font-bold text-slate-800">
              {language === 'sw' ? 'Mkuu wa Vipindi (Head of Programs):' : 'Head of Programs:'}
            </div>
            <div className="mt-8 border-b border-slate-400 w-40" />
            <div className="mt-1 text-[11px]">{language === 'sw' ? 'Sahihi & Tarehe' : 'Signature & Date'}</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-slate-800">
              {language === 'sw' ? 'Mhuri Rasmi (Official Seal):' : 'Official Station Seal:'}
            </div>
            <div className="mt-4 inline-block w-24 h-16 border-2 border-dashed border-slate-300 rounded text-center text-[10px] text-slate-400 pt-5">
              {language === 'sw' ? 'MHURI WA RADIO' : 'STATION SEAL'}
            </div>
          </div>
        </div>
      </div>

      {/* Traffic DB Save Confirmation Modal (Print Interception) */}
      {showTrafficModal && (
        <div
          id="traffic-db-intercept-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150 print:hidden"
        >
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 text-slate-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-md">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    <span>{language === 'sw' ? 'Hifadhi kwenye Traffic Database?' : 'Save to Traffic Database?'}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                      jrs_traffic_db
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Radio Kwizera Broadcast Intelligence System
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTrafficModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <p className="text-sm font-semibold text-white leading-relaxed">
                {language === 'sw'
                  ? 'Je, unataka kuhifadhi ratiba hii kwenye Traffic Database ili kuboresha mapendekezo mahiri ya vipindi (Smart Suggestions)?'
                  : 'Do you want to save this schedule to the Traffic Database to improve future smart suggestions?'}
              </p>

              <div className="text-xs text-slate-300 space-y-1.5 border-t border-slate-800/80 pt-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">
                    {language === 'sw' ? 'Jumla ya Matangazo (Spots):' : 'Total Broadcast Spots:'}
                  </span>
                  <span className="font-mono font-bold text-indigo-400">
                    {filteredSpots.length > 0 ? filteredSpots.length : allSpots.length} spots
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">
                    {language === 'sw' ? 'Utambuzi wa Vipindi:' : 'Program Mapping Engine:'}
                  </span>
                  <span className="text-emerald-400 font-semibold">getShowForTime (2026 Timetable)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">
                    {language === 'sw' ? 'Hifadhi ya Ndani (Key):' : 'Storage Key:'}
                  </span>
                  <code className="font-mono text-[11px] text-amber-300 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/50">
                    localStorage.jrs_traffic_db
                  </code>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal flex items-start gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                {language === 'sw'
                  ? 'Hii inasasisha takwimu za msongamano wa matangazo kwa kila kipindi na siku ya wiki ili kuzuia mrundikano kupita kiasi wa matangazo katika vipindi vya kilele.'
                  : 'This calculates program ad density by day of week to prevent over-congestion and continuously trains our smart placement engine.'}
              </span>
            </p>

            {/* Modal Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowTrafficModal(false)}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition cursor-pointer"
              >
                {language === 'sw' ? 'Ghairi' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleSkipAndPrint}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition cursor-pointer border border-slate-700"
              >
                {language === 'sw' ? 'Chapisha Tu (Bila Kuhifadhi)' : 'Print Only (Skip Saving)'}
              </button>

              <button
                type="button"
                onClick={handleConfirmSaveAndPrint}
                className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Database className="w-3.5 h-3.5" />
                <span>
                  {language === 'sw' ? 'Ndio, Hifadhi & Chapisha' : 'Yes, Save & Print'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Traffic Saved Toast Notification */}
      {trafficSavedSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 border border-emerald-500 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in print:hidden">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            {language === 'sw'
              ? 'Ratiba imehifadhiwa kikamilifu kwenye Traffic Database (jrs_traffic_db)!'
              : 'Schedule successfully saved to Traffic Database (jrs_traffic_db)!'}
          </span>
        </div>
      )}
    </div>
  );
};
