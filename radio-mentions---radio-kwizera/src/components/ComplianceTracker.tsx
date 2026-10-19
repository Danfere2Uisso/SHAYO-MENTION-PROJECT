import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  DollarSign,
  TrendingUp,
  FileCheck,
  AlertCircle,
  CheckCircle,
  Download,
  Printer,
  Calendar,
  Building,
  UserCheck,
  CreditCard,
  FileText,
  Filter,
  Award,
  Search,
} from 'lucide-react';
import { useRadioApp } from '../context/RadioAppContext';
import { AdCampaign, ScheduledSpotItem } from '../types';

export const ComplianceTracker: React.FC = () => {
  const { campaigns, clients } = useRadioApp();

  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeProofModalCampaign, setActiveProofModalCampaign] = useState<AdCampaign | null>(null);

  // Compute metrics
  const complianceData = useMemo(() => {
    let totalContractedSpots = 0;
    let totalAiredSpots = 0;
    let totalContractedRevenue = 0;
    let totalRealizedRevenue = 0;

    const list = campaigns.map((camp) => {
      const contracted = camp.scheduledSpots ? camp.scheduledSpots.length : camp.totalSlots || 0;
      const aired = camp.scheduledSpots ? camp.scheduledSpots.filter((s) => s.isAired).length : 0;
      const missed = Math.max(0, contracted - aired);
      const rate = camp.ratePerSlotTzs || 45000;
      const contractedRev = contracted * rate;
      const realizedRev = aired * rate;
      const outstandingRev = Math.max(0, contractedRev - realizedRev);
      const complianceRate = contracted > 0 ? Math.round((aired / contracted) * 100) : 0;

      totalContractedSpots += contracted;
      totalAiredSpots += aired;
      totalContractedRevenue += contractedRev;
      totalRealizedRevenue += realizedRev;

      return {
        ...camp,
        contractedSpots: contracted,
        airedSpots: aired,
        missedSpots: missed,
        contractedRevenue: contractedRev,
        realizedRevenue: realizedRev,
        outstandingRevenue: outstandingRev,
        complianceRate,
      };
    });

    const overallRate =
      totalContractedSpots > 0 ? Math.round((totalAiredSpots / totalContractedSpots) * 100) : 100;

    return {
      list,
      totalContractedSpots,
      totalAiredSpots,
      totalContractedRevenue,
      totalRealizedRevenue,
      overallRate,
    };
  }, [campaigns]);

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return complianceData.list.filter((c) => {
      const matchCampaign = selectedCampaignId === 'all' || c.id === selectedCampaignId;
      const matchClient = selectedClientId === 'all' || c.clientId === selectedClientId || c.clientName === selectedClientId;
      const matchStart = !startDateFilter || c.startDate >= startDateFilter;
      const matchEnd = !endDateFilter || c.startDate <= endDateFilter;
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.clientName.toLowerCase().includes(q) ||
        c.adType.toLowerCase().includes(q);

      return matchCampaign && matchClient && matchStart && matchEnd && matchQuery;
    });
  }, [
    complianceData.list,
    selectedCampaignId,
    selectedClientId,
    startDateFilter,
    endDateFilter,
    searchQuery,
  ]);

  // Client aggregated breakdown
  const clientAggregates = useMemo(() => {
    const map = new Map<
      string,
      {
        clientName: string;
        campaignCount: number;
        contractedSpots: number;
        airedSpots: number;
        contractedRevenue: number;
        realizedRevenue: number;
        outstandingRevenue: number;
        complianceRate: number;
      }
    >();

    filteredCampaigns.forEach((camp) => {
      const existing = map.get(camp.clientName) || {
        clientName: camp.clientName,
        campaignCount: 0,
        contractedSpots: 0,
        airedSpots: 0,
        contractedRevenue: 0,
        realizedRevenue: 0,
        outstandingRevenue: 0,
        complianceRate: 0,
      };

      existing.campaignCount += 1;
      existing.contractedSpots += camp.contractedSpots;
      existing.airedSpots += camp.airedSpots;
      existing.contractedRevenue += camp.contractedRevenue;
      existing.realizedRevenue += camp.realizedRevenue;
      existing.outstandingRevenue += camp.outstandingRevenue;
      map.set(camp.clientName, existing);
    });

    return Array.from(map.values()).map((c) => ({
      ...c,
      complianceRate:
        c.contractedSpots > 0 ? Math.round((c.airedSpots / c.contractedSpots) * 100) : 100,
    }));
  }, [filteredCampaigns]);

  const handlePrintFullReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Financial / Compliance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 print:hidden">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Kiwango cha Uzingatiaji (Compliance)
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {complianceData.overallRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {complianceData.totalAiredSpots} kati ya {complianceData.totalContractedSpots} spots
            zimesomwa
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-blue-400" />
            Mapato Yaliyothibitishwa (Realized)
          </div>
          <div className="text-xl font-bold text-white font-mono">
            TZS {complianceData.totalRealizedRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Spots zilizosainiwa studio</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            Jumla ya Mikataba (Contracted)
          </div>
          <div className="text-xl font-bold text-purple-400 font-mono">
            TZS {complianceData.totalContractedRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Thamani kamili ya oda</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            Kiasi Kinachobaki (Outstanding)
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono">
            TZS{' '}
            {(
              complianceData.totalContractedRevenue - complianceData.totalRealizedRevenue
            ).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Zitasomwa kabla ya kumalizika</div>
        </div>
      </div>

      {/* Filter & Export Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xs space-y-3 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-400" />
              Chuja Ripoti ya Compliance & Mapato
            </h3>
            <p className="text-xs text-slate-400">
              Tazama uzingatiaji kwa kila mteja na upakue vyeti vya utekelezaji (Proof of
              Performance)
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrintFullReport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Chapisha Ripoti Kamili (PDF)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 pt-2 border-t border-slate-800 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Chagua Mteja:</label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-1.5 focus:outline-none"
            >
              <option value="all">Wateja Wote</option>
              {clients.map((cl) => (
                <option key={cl.id} value={cl.name}>
                  {cl.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Kampeni:</label>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-1.5 focus:outline-none"
            >
              <option value="all">Kampeni Zote</option>
              {complianceData.list.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.clientName} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Kuanzia Tarehe:</label>
            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-1.5 font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Hadi Tarehe:</label>
            <input
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-1.5 font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Tafuta:</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Jina au neno..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg pl-7 pr-2 p-1.5 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CLIENT AGGREGATE BREAKDOWN TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="font-bold text-white text-sm flex items-center gap-2">
            <Building className="w-4 h-4 text-purple-400" />
            Muhtasari kwa Kila Mteja (Client Compliance & Billing Summary)
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {clientAggregates.length} Wateja
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Jina la Mteja</th>
                <th className="py-3 px-3 text-center">Kampeni</th>
                <th className="py-3 px-3">Spots Mkataba</th>
                <th className="py-3 px-3">Spots Hewani</th>
                <th className="py-3 px-4">Kiwango (Status)</th>
                <th className="py-3 px-4">Billed Amount</th>
                <th className="py-3 px-4">Delivered</th>
                <th className="py-3 px-4 text-right">Outstanding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {clientAggregates.map((cl, i) => {
                const isExcellent = cl.complianceRate >= 95;
                const isGood = cl.complianceRate >= 80 && cl.complianceRate < 95;
                const isLow = cl.complianceRate < 80;

                return (
                  <tr key={i} className="hover:bg-slate-850/50 transition">
                    <td className="py-3 px-4 font-bold text-white">{cl.clientName}</td>
                    <td className="py-3 px-3 text-center font-mono">{cl.campaignCount}</td>
                    <td className="py-3 px-3 font-mono">{cl.contractedSpots}</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      {cl.airedSpots}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isExcellent
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : isGood
                            ? 'bg-amber-950 text-amber-300 border border-amber-700'
                            : 'bg-red-950 text-red-300 border border-red-700'
                        }`}
                      >
                        {isExcellent && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                        {isGood && <AlertCircle className="w-3 h-3 text-amber-400" />}
                        {isLow && <AlertCircle className="w-3 h-3 text-red-400" />}
                        {cl.complianceRate}%{' '}
                        {isExcellent ? 'Bora' : isGood ? 'Wastani' : 'Chini'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      TZS {cl.contractedRevenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      TZS {cl.realizedRevenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-400 text-right">
                      TZS {cl.outstandingRevenue.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaigns Compliance Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="font-bold text-white text-sm flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            Orodha Kamili ya Kampeni & Vyeti vya POP (Proof of Performance)
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Mteja & Kampeni</th>
                <th className="py-3 px-3">Spots Mkataba</th>
                <th className="py-3 px-3">Zilizosomwa (Aired)</th>
                <th className="py-3 px-4">Kiwango cha Utekelezaji</th>
                <th className="py-3 px-4">Mapato Yaliyopatikana</th>
                <th className="py-3 px-4 text-right">Cheti Rasmi (POP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-sans">
              {filteredCampaigns.map((camp) => {
                const isExcellent = camp.complianceRate >= 95;
                const isGood = camp.complianceRate >= 80 && camp.complianceRate < 95;

                return (
                  <tr key={camp.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{camp.name}</div>
                      <div className="text-xs text-slate-400">{camp.clientName}</div>
                    </td>
                    <td className="py-3 px-3 font-mono">{camp.contractedSpots} spots</td>
                    <td className="py-3 px-3 font-mono text-emerald-400 font-bold">
                      {camp.airedSpots} spots
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              isExcellent
                                ? 'bg-emerald-500'
                                : isGood
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${camp.complianceRate}%` }}
                          />
                        </div>
                        <span
                          className={`font-mono font-bold text-xs ${
                            isExcellent
                              ? 'text-emerald-400'
                              : isGood
                              ? 'text-amber-400'
                              : 'text-red-400'
                          }`}
                        >
                          {camp.complianceRate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      TZS {camp.realizedRevenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setActiveProofModalCampaign(camp)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 text-xs font-semibold transition inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Tengeneza POP</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof of Performance (POP) Certificate Modal */}
      {activeProofModalCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150 print:p-0">
          <div className="bg-white text-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl p-8 border border-slate-300 overflow-y-auto max-h-[94vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
            {/* Modal Actions Bar (Hidden on print) */}
            <div className="flex items-center justify-between border-b pb-3 mb-6 print:hidden">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-red-600" />
                Proof of Performance (POP) Certificate Generator
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Chapisha Cheti Rasmi (Print / PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveProofModalCampaign(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Funga
                </button>
              </div>
            </div>

            {/* Official Certificate Content */}
            <div className="border-4 border-double border-red-700 p-8 rounded-xl bg-white">
              {/* Official Kwizera Header */}
              <div className="text-center border-b-2 border-red-600 pb-5 mb-5">
                <div className="inline-block p-2 rounded-full bg-red-50 border border-red-200 mb-2">
                  <Award className="w-8 h-8 text-red-600 mx-auto" />
                </div>
                <h1 className="text-3xl font-black text-red-700 uppercase tracking-widest">
                  Radio Kwizera 97.7 FM
                </h1>
                <div className="text-xs font-bold text-slate-700 uppercase mt-0.5 tracking-wider">
                  "Jukwaa la Matumaini" • Commercial Sales & Playout Compliance Directorate
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  P.O. Box 154, Ngara, Kagera, Tanzania • info@radiokwizera.org
                </div>
                <div className="text-base font-serif italic text-slate-800 mt-3 font-semibold">
                  Official Certificate: Proof of Performance & Playout Audit Log
                </div>
              </div>

              <div className="space-y-4 text-xs leading-relaxed text-slate-800">
                <p className="text-sm">
                  Kituo cha utangazaji cha <strong>Radio Kwizera 97.7 FM</strong> kinathibitisha
                  kuwa tangazo la biashara la{' '}
                  <strong className="text-black uppercase">
                    {activeProofModalCampaign.clientName}
                  </strong>{' '}
                  lenye jina la{' '}
                  <strong className="text-black uppercase">
                    "{activeProofModalCampaign.name}"
                  </strong>{' '}
                  limerushwa hewani kulingana na mkataba wa matangazo kama inavyothibitishwa na
                  kumbukumbu za studio hapa chini:
                </p>

                {/* Metrics Pill Grid */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase">Aina ya Tangazo:</span>
                    <div className="font-bold text-slate-900 text-xs">
                      {activeProofModalCampaign.adType}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase">Spots Zilizosomwa:</span>
                    <div className="font-bold text-emerald-700 text-xs">
                      {activeProofModalCampaign.scheduledSpots?.filter((s) => s.isAired).length ||
                        0}{' '}
                      / {activeProofModalCampaign.scheduledSpots?.length || 0} Spots
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase">Kipindi cha Mkataba:</span>
                    <div className="font-bold text-slate-900 text-xs">
                      {activeProofModalCampaign.startDate} (Siku{' '}
                      {activeProofModalCampaign.durationDays || 7})
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase">Thamani ya Mkataba:</span>
                    <div className="font-bold text-red-700 text-xs">
                      TZS {activeProofModalCampaign.totalCostTzs?.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Itemized broadcast log */}
                <div className="pt-2">
                  <div className="font-bold uppercase tracking-wider text-[11px] text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Orodha Kamili ya Spots Zilizorushwa Hewani (Itemized Broadcast Log):</span>
                    <span className="font-mono text-slate-500 text-[10px]">
                      Jumla ya Spots:{' '}
                      {activeProofModalCampaign.scheduledSpots?.filter((s) => s.isAired).length ||
                        0}
                    </span>
                  </div>
                  <div className="border border-slate-300 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-2">Spot #</th>
                          <th className="py-2 px-2">Tarehe</th>
                          <th className="py-2 px-2">Kipindi Rasmi</th>
                          <th className="py-2 px-2">Saa Iliyopangwa</th>
                          <th className="py-2 px-2">Muda Uliorushwa</th>
                          <th className="py-2 px-2">Sahihi ya Mtangazaji Studio</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-sans">
                        {activeProofModalCampaign.scheduledSpots &&
                        activeProofModalCampaign.scheduledSpots.filter((s) => s.isAired).length >
                          0 ? (
                          activeProofModalCampaign.scheduledSpots
                            .filter((s) => s.isAired)
                            .map((s, idx) => (
                              <tr key={s.id || idx} className="hover:bg-slate-50">
                                <td className="py-1.5 px-2 font-mono font-bold text-slate-500">
                                  #{idx + 1}
                                </td>
                                <td className="py-1.5 px-2 font-mono">{s.date}</td>
                                <td className="py-1.5 px-2 font-medium">{s.programName}</td>
                                <td className="py-1.5 px-2 font-mono">{s.timeBetween}</td>
                                <td className="py-1.5 px-2 font-mono text-blue-700 font-bold">
                                  {s.timeAired || s.timeBetween}
                                </td>
                                <td className="py-1.5 px-2 font-mono text-emerald-700 font-semibold">
                                  ✓ {s.signedBy || 'Mtangazaji wa Zamu'}
                                </td>
                              </tr>
                            ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-4 text-center text-slate-400 italic">
                              Hakuna matangazo yaliyosainiwa bado kwa kampeni hii.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3 Signature Blocks with Seal */}
                <div className="pt-8 grid grid-cols-3 gap-6 border-t-2 border-slate-800 mt-6 text-xs">
                  <div>
                    <div className="font-bold text-slate-800">Afisa Masoko (Marketing Officer):</div>
                    <div className="mt-8 border-b border-slate-500 w-36" />
                    <div className="text-[10px] text-slate-500 mt-0.5">Sahihi & Tarehe</div>
                  </div>

                  <div>
                    <div className="font-bold text-slate-800">
                      Mkuu wa Vipindi (Head of Programs):
                    </div>
                    <div className="mt-8 border-b border-slate-500 w-36" />
                    <div className="text-[10px] text-slate-500 mt-0.5">Sahihi & Tarehe</div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-slate-800">Meneja wa Kituo (Station Manager):</div>
                    <div className="mt-4 inline-block w-28 h-16 border-2 border-dashed border-red-300 rounded text-center text-[10px] text-red-600 font-bold pt-4 uppercase">
                      MHURI WA KITUO
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
