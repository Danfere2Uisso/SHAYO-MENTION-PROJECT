import React, { useState, useEffect } from 'react';
import { useRadioApp } from '../../context/RadioAppContext';
import {
  ShieldCheck,
  Radio,
  FileCheck,
  Users,
  Activity,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { RadioKwizeraCompactLogo } from '../logos/RadioKwizeraLogos';

export const MainAdminDashboard: React.FC = () => {
  const {
    currentLiveProgram,
    auditLogs,
    ads,
    allUsers,
    t,
    language,
    studioDarkMode,
    isOnline,
  } = useRadioApp();

  const [activeTab, setActiveTab] = useState<'live_feed' | 'audit' | 'analytics' | 'users'>('live_feed');
  const [auditSearch, setAuditSearch] = useState<string>('');
  const [liveSeconds, setLiveSeconds] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setLiveSeconds(
        d.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filtered audit trail
  const filteredAudit = auditLogs.filter(
    (log) =>
      log.presenter.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.adTitle.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(auditSearch.toLowerCase())
  );

  // Fulfillment metrics
  const totalAdsCount = ads.length;
  const signedAdsCount = ads.filter((a) => a.status === 'signed').length;
  const fulfillmentRate = totalAdsCount > 0 ? Math.round((signedAdsCount / totalAdsCount) * 100) : 100;

  // Next upcoming ad in live program
  const nextAd = ads.find(
    (a) => (a.programId === currentLiveProgram?.id || a.programName === currentLiveProgram?.name) && a.status === 'pending'
  );

  return (
    <div className={`p-4 sm:p-6 max-w-7xl mx-auto space-y-6 ${studioDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#EE1C25] via-[#7A128B] to-[#0033A0] text-white shadow-xs">
              {t.roles.admin} • Super Admin
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              Executive Directorate & Station Governance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Radio Kwizera Master Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {language === 'sw'
              ? 'Ufuatiliaji wa studio hewani, kumbukumbu ya ukaguzi ya kila sekunde, na usimamizi wa mfumo.'
              : 'Live studio broadcast monitor, second-by-second audit trail, fulfillment analytics, and staff access.'}
          </p>
        </div>

        {/* Console Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('live_feed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'live_feed' ? 'bg-gradient-to-r from-[#EE1C25] to-[#7A128B] text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.labels.liveStudioFeed}
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'audit' ? 'bg-gradient-to-r from-[#EE1C25] to-[#7A128B] text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.nav.auditTrail} ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'analytics' ? 'bg-gradient-to-r from-[#EE1C25] to-[#7A128B] text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.nav.analytics}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'users' ? 'bg-gradient-to-r from-[#EE1C25] to-[#7A128B] text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.nav.users} ({allUsers.length})
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE STUDIO FEED (SIMULATION FLOW 4 CORE REQUIREMENT) */}
      {activeTab === 'live_feed' && (
        <div className="space-y-6">
          {/* Top Live Studio Monitor Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-rose-950/30 rounded-3xl p-6 sm:p-8 border-2 border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* On-Air badge & Presenter */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 animate-ping" />
                  <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-red-600/20 border-2 border-red-500 flex items-center justify-center text-red-400">
                    <Radio className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
                  </span>
                </div>

                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-red-600 text-white mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    LIVE ON AIR BOOTH
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white">
                    {currentLiveProgram?.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium">
                    On-Air Presenter: <strong className="text-amber-400">{currentLiveProgram?.presenterName}</strong> • Slot: <span className="font-mono text-slate-300">{currentLiveProgram?.timeSlot}</span>
                  </p>
                </div>
              </div>

              {/* Live Seconds Master Clock */}
              <div className="text-left lg:text-right bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                  Station Master Clock (EAT)
                </div>
                <div className="text-3xl sm:text-4xl font-mono font-black text-amber-400">
                  {liveSeconds}
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 lg:justify-end mt-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Synchronized with Studio Tablet
                </div>
              </div>
            </div>

            {/* Upcoming / Current Commercial Spotlight */}
            <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Next Scheduled Commercial in Live Show
                </span>
                {nextAd ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-black text-base text-white">{nextAd.clientName}</div>
                      <div className="text-xs text-slate-400">{nextAd.campaignTitle} ({nextAd.durationSec}s)</div>
                    </div>
                    <span className="font-mono text-xs font-black text-amber-400 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg">
                      {nextAd.scheduledTime}
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic">No pending commercials remaining in this show block.</div>
                )}
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Today's Commercial Fulfillment
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-black text-xl text-emerald-400">
                      {signedAdsCount} / {totalAdsCount} Signed
                    </div>
                    <div className="text-xs text-slate-400">Compliance Rate: {fulfillmentRate}%</div>
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center font-bold text-xs text-white">
                    {fulfillmentRate}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time incoming audit stream preview */}
          <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4" />
                Live Broadcast Telemetry Stream
              </span>
              <button
                onClick={() => setActiveTab('audit')}
                className="text-xs font-bold text-purple-400 hover:text-purple-300 underline"
              >
                View Full Audit Log →
              </button>
            </div>

            <div className="space-y-2">
              {auditLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded text-[11px]">
                      {log.timestamp}
                    </span>
                    <strong className="text-white">{log.presenter}</strong>
                    <span className="text-slate-400">—</span>
                    <span className="text-purple-300 font-semibold">{log.adTitle}</span>
                  </div>
                  <span className="text-emerald-400 font-mono text-[11px] font-bold">
                    {log.action}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPLETE AUDIT TRAIL (MODULE 5 - EXACT SECOND BY SECOND) */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-rose-400" />
                Second-by-Second Audit Trail (Module 5)
              </h2>
              <p className="text-xs text-slate-400">
                Format: <code>[Timestamp] - [Presenter] - [Ad] - [Action]</code>. Irreversible compliance log for advertisers and TCRA regulations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Search logs..."
                  className="bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 w-48"
                />
              </div>
            </div>
          </div>

          {/* Audit Trail List */}
          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {filteredAudit.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono text-xs"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-amber-400 font-bold bg-slate-900 px-2 py-0.5 rounded">
                    {log.timestamp}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-white font-bold">{log.presenter}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-purple-300 font-sans font-semibold">
                    {log.adTitle}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 font-sans">{log.details}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                      log.action.includes('SIGN')
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                        : log.action.includes('PUBLISH')
                        ? 'bg-purple-950 text-purple-300 border-purple-700'
                        : 'bg-blue-950 text-blue-300 border-blue-700'
                    }`}
                  >
                    {log.action}
                  </span>
                  <span className="text-[10px] text-slate-500">{log.device}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ANALYTICS & FULFILLMENT */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800">
            <span className="text-xs uppercase font-bold text-slate-400">
              Total Contract Revenue Value
            </span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              TZS {ads.reduce((sum, a) => sum + (a.rateTzs || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Based on March 2026 scheduled commercial mentions
            </p>
          </div>

          <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800">
            <span className="text-xs uppercase font-bold text-slate-400">
              Station Compliance Score
            </span>
            <div className="text-2xl font-black text-blue-400 mt-1">
              98.4%
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Zero unlogged airtime discrepancies recorded
            </p>
          </div>

          <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800">
            <span className="text-xs uppercase font-bold text-slate-400">
              Offline Cache Resilience
            </span>
            <div className="text-2xl font-black text-purple-400 mt-1">
              8+ Hours
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Local persistent storage ready for studio power cuts
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: STAFF & USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="font-black text-base text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-400" />
              Station Personnel & Access Rights
            </h2>
            <span className="text-xs text-slate-400">
              5 Authorized Department Heads & Presenters
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allUsers.map((u) => (
              <div
                key={u.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3"
              >
                <img
                  src={u.avatar}
                  alt={u.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-bold text-sm text-white truncate">{u.name}</div>
                  <div className="text-xs text-slate-400 truncate">{u.title}</div>
                  <span className="text-[10px] font-bold text-purple-400 uppercase">
                    {u.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
