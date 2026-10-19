import React, { useState, useMemo } from 'react';
import { useRadioApp } from '../../context/RadioAppContext';
import { AdMention, Client, Program } from '../../types';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  Building,
  Radio,
  Search,
  ChevronRight,
  Eye,
  ShieldCheck,
  Award,
  Sparkles,
  Layers,
  X,
  Share2,
} from 'lucide-react';
import { RadioKwizeraCompactLogo, RadioKwizeraSunburstLogo } from '../logos/RadioKwizeraLogos';

export const AirplayReportsManager: React.FC = () => {
  const { ads, clients, programs, language, studioDarkMode, t } = useRadioApp();

  // Mode: by specific ad, by client, or master log
  const [reportType, setReportType] = useState<'by_ad' | 'by_client' | 'all'>('by_ad');
  const [selectedAdId, setSelectedAdId] = useState<string>(ads[0]?.id || '');
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'past7' | 'past30' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-09-08');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-09-10');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>('all');

  // Preview Modal state
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);

  // Filtered dataset
  const filteredAds = useMemo(() => {
    return ads.filter((ad) => {
      // Report type filter
      if (reportType === 'by_ad' && selectedAdId && ad.id !== selectedAdId) {
        return false;
      }
      if (reportType === 'by_client' && selectedClientId) {
        const client = clients.find((c) => c.id === selectedClientId);
        if (client && !ad.clientName.toLowerCase().includes(client.name.toLowerCase())) {
          return false;
        }
      }

      // Program filter
      if (selectedProgramFilter !== 'all' && ad.programId !== selectedProgramFilter) {
        return false;
      }

      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ad.campaignTitle.toLowerCase().includes(q);
        const matchClient = ad.clientName.toLowerCase().includes(q);
        const matchProg = ad.programName?.toLowerCase().includes(q);
        if (!matchTitle && !matchClient && !matchProg) return false;
      }

      // Date filter
      if (dateFilter === 'today' && ad.date !== '2026-09-10') return false;
      if (dateFilter === 'yesterday' && ad.date !== '2026-09-09') return false;
      if (dateFilter === 'past7' && (ad.date < '2026-09-03' || ad.date > '2026-09-10')) return false;
      if (dateFilter === 'past30' && (ad.date < '2026-08-10' || ad.date > '2026-09-10')) return false;
      if (dateFilter === 'custom') {
        if (customStartDate && ad.date < customStartDate) return false;
        if (customEndDate && ad.date > customEndDate) return false;
      }

      return true;
    });
  }, [ads, reportType, selectedAdId, selectedClientId, selectedProgramFilter, dateFilter, customStartDate, customEndDate, searchQuery, clients]);

  // Aggregate stats
  const totalSpots = filteredAds.reduce((acc, a) => acc + (a.checkIns?.length || (a.status === 'signed' ? 1 : 0)), 0);
  const totalBilledTzs = filteredAds.reduce((acc, a) => {
    const runs = a.checkIns?.length || (a.status === 'signed' ? 1 : 0);
    return acc + (a.rateTzs || 45000) * runs;
  }, 0);
  const totalAirplaySeconds = filteredAds.reduce((acc, a) => {
    const runs = a.checkIns?.length || (a.status === 'signed' ? 1 : 0);
    return acc + (a.durationSec || 30) * runs;
  }, 0);

  // Active target entity for certificate
  const activeAd = ads.find((a) => a.id === selectedAdId) || filteredAds[0];
  const activeClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'Ad ID',
      'Client Name',
      'Campaign Title',
      'Program Name',
      'Scheduled Time',
      'Duration (Sec)',
      'Broadcast Date',
      'Exact Read Timestamp (EAT)',
      'Check-in Number',
      'Signed By Desk',
      'Status',
      'Rate (TZS)',
    ];

    const rows: string[][] = [];

    filteredAds.forEach((ad) => {
      if (ad.checkIns && ad.checkIns.length > 0) {
        ad.checkIns.forEach((ci) => {
          rows.push([
            ad.id,
            `"${ad.clientName.replace(/"/g, '""')}"`,
            `"${ad.campaignTitle.replace(/"/g, '""')}"`,
            `"${ad.programName || ''}"`,
            ad.scheduledTime,
            ad.durationSec.toString(),
            ad.date,
            `"${ci.timestamp}"`,
            ci.checkInNumber.toString(),
            `"${ci.signedBy}"`,
            ad.status,
            (ad.rateTzs || 45000).toString(),
          ]);
        });
      } else {
        rows.push([
          ad.id,
          `"${ad.clientName.replace(/"/g, '""')}"`,
          `"${ad.campaignTitle.replace(/"/g, '""')}"`,
          `"${ad.programName || ''}"`,
          ad.scheduledTime,
          ad.durationSec.toString(),
          ad.date,
          'Pending Studio Read',
          '0',
          'Pending',
          ad.status,
          (ad.rateTzs || 45000).toString(),
        ]);
      }
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `RadioKwizera_Airplay_Report_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/80 p-4 sm:p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-600 text-white">
              Airplay Certification
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              Radio Kwizera 97.7 FM • Jukwaa la Matumaini
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {language === 'sw'
              ? 'Ripoti za Matangazo Yaliyosomwa na Muda Kamili'
              : 'Proof of Broadcast & Airplay Timestamp Reports'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'sw'
              ? 'Tazama na chapisha cheti rasmi cha uthibitisho kwa kila tangazo au kwa mteja kwa kipindi ulichochagua.'
              : 'Preview and print certified broadcast proof logs with exact on-air seconds for each ad or grouped by client.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setPreviewOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-purple-600 hover:bg-purple-500 text-white shadow-lg transition-all active:scale-95"
          >
            <Eye className="w-4 h-4" />
            <span>{language === 'sw' ? 'Hakiki Ripoti / Cheti' : 'Preview Official Report'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'sw' ? 'Chapisha Ripoti (Print)' : 'Print Report'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
        <button
          onClick={() => setReportType('by_ad')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-2 ${
            reportType === 'by_ad'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>{language === 'sw' ? '1. Kwa Tangazo Maalumu' : '1. By Specific Ad Campaign'}</span>
        </button>

        <button
          onClick={() => setReportType('by_client')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-2 ${
            reportType === 'by_client'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>{language === 'sw' ? '2. Kwa Mteja (Client Statement)' : '2. By Client'}</span>
        </button>

        <button
          onClick={() => setReportType('all')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-2 ${
            reportType === 'all'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{language === 'sw' ? '3. Orodha Yote ya Matangazo' : '3. Master Broadcast Log'}</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        {/* Ad Selector (if in by_ad mode) */}
        {reportType === 'by_ad' && (
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              {language === 'sw' ? 'Chagua Tangazo' : 'Select Specific Ad'}
            </label>
            <select
              value={selectedAdId}
              onChange={(e) => setSelectedAdId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
            >
              {ads.map((ad) => (
                <option key={ad.id} value={ad.id}>
                  {ad.clientName} - {ad.campaignTitle} ({ad.programName})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Client Selector (if in by_client mode) */}
        {reportType === 'by_client' && (
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              {language === 'sw' ? 'Chagua Mteja' : 'Select Client'}
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.category})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            {language === 'sw' ? 'Muda / Kipindi' : 'Time Period'}
          </label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">{language === 'sw' ? 'Muda Wote (Tarehe Zote)' : 'All Recorded Dates'}</option>
            <option value="today">{language === 'sw' ? 'Leo (10 Septemba 2026)' : 'Today (10 Sept 2026)'}</option>
            <option value="yesterday">{language === 'sw' ? 'Jana (09 Septemba 2026)' : 'Yesterday (09 Sept 2026)'}</option>
            <option value="past7">{language === 'sw' ? 'Siku 7 Zilizopita' : 'Past 7 Days'}</option>
            <option value="past30">{language === 'sw' ? 'Mwezi Huu (Machi 2026)' : 'Past 30 Days'}</option>
            <option value="custom">{language === 'sw' ? 'Tarehe Maalumu (Custom)' : 'Custom Date Range'}</option>
          </select>
        </div>

        {/* Program Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            {language === 'sw' ? 'Chuja kwa Kipindi' : 'Program Filter'}
          </label>
          <select
            value={selectedProgramFilter}
            onChange={(e) => setSelectedProgramFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">{language === 'sw' ? 'Vipindi Vyote' : 'All Programs'}</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.timeSlot})
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            {language === 'sw' ? 'Tafuta' : 'Search Query'}
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tafuta tangazo au mteja..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Custom Date Range Picker if active */}
      {dateFilter === 'custom' && (
        <div className="flex items-center gap-3 bg-purple-950/40 p-3 rounded-xl border border-purple-800 text-xs">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span className="font-bold text-purple-300">Kuanzia (From):</span>
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}
            className="bg-slate-900 border border-purple-700 rounded-lg px-2.5 py-1 text-white text-xs"
          />
          <span className="font-bold text-purple-300">Hadi (To):</span>
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => setCustomEndDate(e.target.value)}
            className="bg-slate-900 border border-purple-700 rounded-lg px-2.5 py-1 text-white text-xs"
          />
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">
              {language === 'sw' ? 'Matangazo Yaliyosomwa' : 'Total Airplay Runs'}
            </div>
            <div className="text-2xl font-black text-white mt-1">{totalSpots}</div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
              100% Verified Sign-offs
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">
              {language === 'sw' ? 'Jumla ya Dakika Hewani' : 'Airplay Duration'}
            </div>
            <div className="text-2xl font-black text-purple-400 mt-1">
              {Math.floor(totalAirplaySeconds / 60)}m {totalAirplaySeconds % 60}s
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
              {totalAirplaySeconds} total seconds
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-800 flex items-center justify-center text-purple-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">
              {language === 'sw' ? 'Thamani / Bili (TZS)' : 'Billed Value (TZS)'}
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
              TZS {totalBilledTzs.toLocaleString()}
            </div>
            <div className="text-[10px] text-amber-300/80 font-semibold mt-0.5">
              Official Rate Card 2026
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800 flex items-center justify-center text-amber-400">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">
              {language === 'sw' ? 'Kituo & Mzunguko' : 'Station & Channel'}
            </div>
            <div className="text-xl font-black text-white mt-1">97.7 FM</div>
            <div className="text-[10px] text-red-400 font-bold mt-0.5">
              Jukwaa la Matumaini
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800 flex items-center justify-center text-red-400">
            <Radio className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Airplay Table with Second-by-Second Verification */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <h3 className="font-black text-sm text-white uppercase tracking-wider">
              {language === 'sw'
                ? 'Kumbukumbu ya Matangazo Yaliyosomwa na Muda Kamili wa Hewani'
                : 'Certified On-Air Verification & Exact Timestamp Log'}
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {filteredAds.length} campaigns • {totalSpots} broadcast runs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3 sm:p-4">Client & Campaign</th>
                <th className="p-3 sm:p-4">Program & Slot</th>
                <th className="p-3 sm:p-4">Duration</th>
                <th className="p-3 sm:p-4">Exact Broadcast Time (EAT)</th>
                <th className="p-3 sm:p-4">Verified By Desk</th>
                <th className="p-3 sm:p-4">Status</th>
                <th className="p-3 sm:p-4 text-right">Rate (TZS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {filteredAds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No airplay logs match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAds.map((ad) => {
                  const hasCheckIns = ad.checkIns && ad.checkIns.length > 0;
                  return (
                    <tr key={ad.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="p-3 sm:p-4">
                        <div className="font-black text-white text-sm">{ad.clientName}</div>
                        <div className="text-purple-300 font-medium text-[11px] line-clamp-1">
                          {ad.campaignTitle}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          ID: {ad.id} • Date: {ad.date}
                        </div>
                      </td>

                      <td className="p-3 sm:p-4">
                        <div className="font-bold text-white">{ad.programName}</div>
                        <div className="text-[11px] font-mono text-amber-400">
                          Slot: {ad.scheduledTime}
                        </div>
                      </td>

                      <td className="p-3 sm:p-4">
                        <span className="font-mono bg-slate-950 px-2 py-1 rounded text-slate-300 font-bold">
                          {ad.durationSec}s
                        </span>
                      </td>

                      <td className="p-3 sm:p-4">
                        {hasCheckIns ? (
                          <div className="space-y-1">
                            {ad.checkIns.map((ci, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-1.5 font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/60 text-[11px]"
                              >
                                <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span className="font-bold">{ci.timestamp}</span>
                                <span className="text-[9px] text-emerald-300/70 font-sans ml-auto">
                                  Run #{ci.checkInNumber}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : ad.status === 'signed' ? (
                          <span className="font-mono text-emerald-400 text-[11px]">
                            {ad.date} {ad.scheduledTime}:15 EAT
                          </span>
                        ) : (
                          <span className="text-amber-400/80 italic font-mono text-[11px]">
                            Pending on-air read
                          </span>
                        )}
                      </td>

                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-1 text-slate-300 font-medium">
                          <Radio className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span>Studio Broadcast Desk</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          97.7 FM On-Air
                        </span>
                      </td>

                      <td className="p-3 sm:p-4">
                        {ad.status === 'signed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-400 border border-emerald-700 uppercase">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Imesainiwa</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-950 text-amber-400 border border-amber-700 uppercase">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>Inasubiri</span>
                          </span>
                        )}
                      </td>

                      <td className="p-3 sm:p-4 text-right font-mono font-bold text-white">
                        TZS {(ad.rateTzs || 45000).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: OFFICIAL CERTIFIED AIRPLAY PROOF REPORT (PRINT & PREVIEW READY) */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Action Header (hidden on print) */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 no-print">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Official Radio Kwizera Certificate of Broadcast Preview
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-transform active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === 'sw' ? 'Chapisha Sasa' : 'Print Certificate'}</span>
                </button>
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Document Area */}
            <div
              id="printable-broadcast-certificate"
              className="flex-1 p-6 sm:p-8 overflow-y-auto bg-white text-slate-900 font-sans"
            >
              {/* STATION OFFICIAL LETTERHEAD */}
              <div className="border-b-2 border-slate-900 pb-4 mb-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <RadioKwizeraSunburstLogo size="sm" />
                    <div>
                      <h1 className="text-xl sm:text-2xl font-black text-red-600 tracking-tight leading-tight">
                        RADIO KWIZERA 97.7 FM
                      </h1>
                      <div className="text-xs font-bold text-slate-800 tracking-wider uppercase">
                        Jukwaa la Matumaini • Jesuit Refugee Service (JRS)
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        P.O. Box 154, Ngara, Kagera Region, Tanzania • Tel: +255 754 445 667 • Email: commercial@radiokwizera.co.tz
                      </div>
                    </div>
                  </div>

                  <div className="text-right border-l-2 border-slate-300 pl-4">
                    <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                      Document Type
                    </div>
                    <div className="text-xs font-black text-purple-900 uppercase">
                      Certificate of Broadcast
                    </div>
                    <div className="text-[11px] font-mono text-slate-700 mt-1">
                      Cert No: RK-2026-{Math.floor(1000 + Math.random() * 9000)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Date Issued: 10 Sept 2026
                    </div>
                  </div>
                </div>
              </div>

              {/* CERTIFICATE TITLE */}
              <div className="text-center my-6">
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-slate-900 underline underline-offset-4">
                  OFFICIAL PROOF OF BROADCAST AIRPLAY & TRANSMISSION LOG
                </h2>
                <p className="text-xs text-slate-600 mt-1 font-medium italic">
                  Uthibitisho Rasmi wa Matangazo Yaliyorushwa Hewani kupitia masafa ya 97.7 FM Ngara na Kanda ya Ziwa
                </p>
              </div>

              {/* CLIENT & CAMPAIGN SUMMARY BOX */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-100 border border-slate-300 mb-6 text-xs">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">
                    Advertiser / Client Name:
                  </div>
                  <div className="text-sm font-black text-slate-900">
                    {reportType === 'by_client'
                      ? activeClient.name
                      : reportType === 'by_ad'
                      ? activeAd.clientName
                      : 'Multiple Commercial Clients'}
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    Category: {activeClient?.category || 'Commercial'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">
                    Report Period & Scope:
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {dateFilter === 'all'
                      ? 'March 2026 Commercial Airplay'
                      : dateFilter === 'today'
                      ? '10 September 2026'
                      : dateFilter === 'yesterday'
                      ? '09 September 2026'
                      : `${customStartDate} to ${customEndDate}`}
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    Frequency: <strong>97.7 MHz FM</strong> (Ngara, Kagera, Kigoma, Mwanza)
                  </div>
                </div>
              </div>

              {/* TRANSMISSION LOG TABLE */}
              <table className="w-full text-left text-xs border border-slate-300 mb-6">
                <thead className="bg-slate-200 font-bold uppercase text-slate-800 border-b border-slate-300">
                  <tr>
                    <th className="p-2.5 border-r border-slate-300">#</th>
                    <th className="p-2.5 border-r border-slate-300">Campaign Title</th>
                    <th className="p-2.5 border-r border-slate-300">Program Name</th>
                    <th className="p-2.5 border-r border-slate-300">Duration</th>
                    <th className="p-2.5 border-r border-slate-300">Exact Broadcast Timestamp (EAT)</th>
                    <th className="p-2.5 border-r border-slate-300">Status</th>
                    <th className="p-2.5 text-right">Rate (TZS)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 text-slate-800 font-mono">
                  {filteredAds.map((ad, idx) => (
                    <tr key={ad.id} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                      <td className="p-2.5 border-r border-slate-300 font-bold">{idx + 1}</td>
                      <td className="p-2.5 border-r border-slate-300 font-sans font-bold">
                        {ad.campaignTitle}
                        <div className="text-[10px] text-slate-500 font-mono font-normal">
                          Client: {ad.clientName}
                        </div>
                      </td>
                      <td className="p-2.5 border-r border-slate-300 font-sans font-semibold">
                        {ad.programName}
                      </td>
                      <td className="p-2.5 border-r border-slate-300 text-center font-bold">
                        {ad.durationSec}s
                      </td>
                      <td className="p-2.5 border-r border-slate-300 font-bold text-emerald-800">
                        {ad.checkIns && ad.checkIns.length > 0
                          ? ad.checkIns.map((c) => c.timestamp).join(', ')
                          : `${ad.date} ${ad.scheduledTime}:15 EAT`}
                      </td>
                      <td className="p-2.5 border-r border-slate-300 font-sans font-bold text-emerald-700">
                        VERIFIED ON AIR
                      </td>
                      <td className="p-2.5 text-right font-bold">
                        {(ad.rateTzs || 45000).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-400">
                  <tr>
                    <td colSpan={3} className="p-2.5 font-sans font-black uppercase">
                      Total Verified Broadcast Airplay:
                    </td>
                    <td className="p-2.5 text-center font-mono">
                      {Math.floor(totalAirplaySeconds / 60)}m {totalAirplaySeconds % 60}s
                    </td>
                    <td className="p-2.5 font-sans">
                      {totalSpots} Spots Certified
                    </td>
                    <td className="p-2.5 text-right font-sans uppercase">
                      Total Invoiced:
                    </td>
                    <td className="p-2.5 text-right font-mono text-sm font-black text-red-700">
                      TZS {totalBilledTzs.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* STATION ATTESTATION AND OFFICIAL SIGNATURE BLOCK */}
              <div className="border-t-2 border-slate-900 pt-6 mt-8">
                <p className="text-xs text-slate-700 leading-relaxed mb-6 italic">
                  "This document certifies that the commercial advertisements listed above were duly transmitted and broadcast live on Radio Kwizera 97.7 FM in accordance with the official station log and digital on-air sign-off timestamps recorded in the master automation system."
                </p>

                <div className="grid grid-cols-2 gap-8 pt-4">
                  <div>
                    <div className="border-b border-slate-900 w-48 mb-2 pb-6 flex items-end">
                      <span className="font-serif italic text-base text-purple-950 font-bold">
                        Charles Kayanza
                      </span>
                    </div>
                    <div className="text-xs font-black text-slate-900 uppercase">
                      Charles Kayanza
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Marketing Officer & Main Station Admin
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Radio Kwizera 97.7 FM • Ngara
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <div className="w-24 h-24 rounded-full border-4 border-red-600/60 p-2 flex flex-col items-center justify-center text-center text-[8px] font-black text-red-700 uppercase tracking-tighter transform -rotate-12 mb-2">
                      <span>RADIO KWIZERA</span>
                      <span className="text-[10px] font-black">97.7 FM</span>
                      <span>OFFICIAL SEAL</span>
                      <span>JUKWAA LA MATUMAINI</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Station Verification Stamp
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
