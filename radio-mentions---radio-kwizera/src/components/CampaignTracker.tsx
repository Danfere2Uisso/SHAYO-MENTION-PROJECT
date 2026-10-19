import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Clock,
  Send,
  RefreshCw,
  PauseCircle,
  PlayCircle,
  CheckCircle,
  Archive,
  Calendar,
  Building,
  BellRing,
  Filter,
  ArrowUpRight,
  DollarSign,
  History,
  RotateCcw,
  CheckSquare,
  AlertCircle,
} from 'lucide-react';
import { useRadioApp } from '../context/RadioAppContext';
import { AdCampaign, ScheduledSpotItem } from '../types';
import { getDayName } from '../utils';

export const CampaignTracker: React.FC = () => {
  const { campaigns, updateCampaign, sendStudioAlert, updateScheduledSpot } = useRadioApp();

  const [statusTab, setStatusTab] = useState<'active' | 'completed' | 'paused'>('active');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'critical' | 'warning' | 'healthy'>('all');
  const [alertSuccessMessage, setAlertSuccessMessage] = useState<string | null>(null);

  // Make-Good / Rescheduling modal state
  const [makeGoodSpot, setMakeGoodSpot] = useState<ScheduledSpotItem | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleTime, setRescheduleTime] = useState<string>('');
  const [rescheduleReason, setRescheduleReason] = useState<string>('Program Overrun / Live Coverage');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Compute days remaining, spots countdown, overdue spots, and budget delivered
  const enrichedCampaigns = useMemo(() => {
    const today = new Date();

    return campaigns.map((camp) => {
      const start = new Date(camp.startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + (camp.durationDays || 7));

      const diffTime = end.getTime() - today.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const spots = camp.scheduledSpots || [];
      const totalSpots = spots.length || camp.totalSlots || 0;
      const airedSpots = spots.filter((s) => s.isAired).length;
      const remainingSpots = Math.max(0, totalSpots - airedSpots);
      const completionPercent = totalSpots > 0 ? Math.round((airedSpots / totalSpots) * 100) : 0;

      // Overdue spots: scheduled in the past or earlier today, but not signed as aired
      const overdueSpots = spots.filter(
        (s) => !s.isAired && (s.date < todayStr || (s.date === todayStr && s.timeBetween < '12:00'))
      );

      // Financials: delivered vs total
      const totalBilled = camp.totalCostTzs || 0;
      const ratePerSpot = totalSpots > 0 ? totalBilled / totalSpots : 0;
      const deliveredAmount = Math.round(airedSpots * ratePerSpot);
      const outstandingAmount = Math.max(0, totalBilled - deliveredAmount);

      let alertLevel: 'critical' | 'warning' | 'healthy' | 'expired' = 'healthy';
      if (daysRemaining <= 0) {
        alertLevel = 'expired';
      } else if (daysRemaining <= 2) {
        alertLevel = 'critical';
      } else if (daysRemaining <= 5) {
        alertLevel = 'warning';
      }

      // Check status (if campaign is 100% completed or expired, mark completed)
      const computedStatus: 'active' | 'completed' | 'paused' =
        camp.status === 'paused'
          ? 'paused'
          : completionPercent === 100 || (daysRemaining <= 0 && remainingSpots === 0)
          ? 'completed'
          : 'active';

      return {
        ...camp,
        endDate: end.toISOString().split('T')[0],
        daysRemaining,
        totalSpots,
        airedSpots,
        remainingSpots,
        completionPercent,
        overdueSpots,
        totalBilled,
        deliveredAmount,
        outstandingAmount,
        alertLevel,
        computedStatus,
      };
    });
  }, [campaigns, todayStr]);

  // Overdue spots across all campaigns
  const allOverdueSpots = useMemo(() => {
    const list: (ScheduledSpotItem & { campaignName: string })[] = [];
    enrichedCampaigns.forEach((c) => {
      c.overdueSpots.forEach((s) => {
        list.push({ ...s, campaignName: c.name });
      });
    });
    return list;
  }, [enrichedCampaigns]);

  // Filtered by status tab and urgency
  const filtered = useMemo(() => {
    return enrichedCampaigns.filter((c) => {
      const matchStatus = c.computedStatus === statusTab;
      if (!matchStatus) return false;
      if (urgencyFilter === 'all') return true;
      if (urgencyFilter === 'critical')
        return c.alertLevel === 'critical' || c.alertLevel === 'expired';
      if (urgencyFilter === 'warning') return c.alertLevel === 'warning';
      return c.alertLevel === 'healthy';
    });
  }, [enrichedCampaigns, statusTab, urgencyFilter]);

  // Overall financial sums
  const totalBilledAll = useMemo(
    () => enrichedCampaigns.reduce((sum, c) => sum + c.totalBilled, 0),
    [enrichedCampaigns]
  );
  const totalDeliveredAll = useMemo(
    () => enrichedCampaigns.reduce((sum, c) => sum + c.deliveredAmount, 0),
    [enrichedCampaigns]
  );
  const totalOutstandingAll = useMemo(
    () => enrichedCampaigns.reduce((sum, c) => sum + c.outstandingAmount, 0),
    [enrichedCampaigns]
  );

  // Handle Send Studio Alert for expiring campaign
  const handleDispatchStudioAlert = (camp: any) => {
    sendStudioAlert(
      '⚠️ Onyo la Kampeni Kumalizika',
      `Kampeni ya "${camp.name}" ya mteja ${camp.clientName} inamalizika ndani ya siku ${camp.daysRemaining}. Wasiliana na Afisa Masoko kwa mkataba mpya.`
    );
    setAlertSuccessMessage(
      `Ilani imetumwa mara moja kwenye Studio Tablet ya watangazaji kwa ajili ya "${camp.name}".`
    );
    setTimeout(() => setAlertSuccessMessage(null), 4000);
  };

  // Extend campaign by X days
  const handleExtendCampaign = (id: string, currentDays: number, addDays: number) => {
    updateCampaign(id, {
      durationDays: currentDays + addDays,
      status: 'active',
    });
    setAlertSuccessMessage(`Kampeni imeongezewa siku ${addDays} zaidi kwa mafanikio!`);
    setTimeout(() => setAlertSuccessMessage(null), 4000);
  };

  // Toggle status (pause/resume)
  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    updateCampaign(id, { status: newStatus as any });
  };

  // Open Make-Good modal
  const handleOpenMakeGood = (spot: ScheduledSpotItem) => {
    setMakeGoodSpot(spot);
    // default tomorrow
    const tom = new Date();
    tom.setDate(tom.getDate() + 1);
    setRescheduleDate(tom.toISOString().split('T')[0]);
    setRescheduleTime(spot.timeBetween || '17:15 - 17:30');
    setRescheduleReason('Live Program Extended');
  };

  // Submit Make-Good / Reschedule
  const handleConfirmReschedule = () => {
    if (!makeGoodSpot || !rescheduleDate || !rescheduleTime) return;

    // Update the spot in context with new date and time
    updateScheduledSpot(makeGoodSpot.id, {
      date: rescheduleDate,
      timeBetween: rescheduleTime,
      isAired: false,
      signedBy: undefined,
      timeAired: undefined,
    });

    setAlertSuccessMessage(
      `Spot ya mteja ${makeGoodSpot.clientName} imeratibiwa upya (Make-Good) tarehe ${rescheduleDate} saa ${rescheduleTime}!`
    );
    setMakeGoodSpot(null);
    setTimeout(() => setAlertSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Financial Delivery & Countdown Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-blue-400" />
            Jumla ya Mapato Yaliyosajiliwa (Billed)
          </div>
          <div className="text-xl font-bold text-white font-mono">
            TZS {totalBilledAll.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Kwa kampeni zote</div>
        </div>

        <div className="bg-slate-900 border border-emerald-900/60 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-emerald-400 flex items-center gap-1.5 mb-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            Thamani Iliyotekelezwa (Delivered)
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            TZS {totalDeliveredAll.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-300 mt-1">
            {totalBilledAll > 0
              ? Math.round((totalDeliveredAll / totalBilledAll) * 100)
              : 0}
            % ya mkataba hewani
          </div>
        </div>

        <div className="bg-slate-900 border border-amber-900/60 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-amber-400 flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Thamani Inayosubiri (Outstanding)
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono">
            TZS {totalOutstandingAll.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Bado haijarushwa hewani</div>
        </div>

        <div className="bg-slate-900 border border-red-900/60 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-red-400 flex items-center gap-1.5 mb-1">
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
            Spots Zilizokosa / Overdue
          </div>
          <div className="text-xl font-bold text-red-400 font-mono">
            {allOverdueSpots.length} Spots
          </div>
          <div className="text-[11px] text-red-300 mt-1">Zinahitaji Make-Good sasa</div>
        </div>
      </div>

      {/* OVERDUE SPOTS & MAKE-GOOD ACTION BANNER */}
      {allOverdueSpots.length > 0 && (
        <div className="bg-red-950/40 border border-red-800/80 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  Spots Zilizokosa Kusomwa Hewani (Overdue / Missed Playouts)
                </h3>
                <p className="text-xs text-red-200">
                  Spots hizi zilipangiwa tarehe zilizopita lakini hazijasainiwa kama zimesomwa. Bofya "Make-Good" kuzipanga upya.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-red-900 text-red-200 text-xs font-mono font-bold">
              {allOverdueSpots.length} Zinazosubiri
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {allOverdueSpots.slice(0, 6).map((sp) => (
              <div
                key={sp.id}
                className="bg-slate-950 border border-red-900/60 p-3 rounded-xl flex items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="font-bold text-white truncate max-w-[170px]">
                    {sp.clientName}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {sp.date} • {sp.timeBetween}
                  </div>
                  <div className="text-[10px] text-red-400 font-medium truncate max-w-[170px]">
                    {sp.programName}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenMakeGood(sp)}
                  className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Make-Good</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Toast */}
      {alertSuccessMessage && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs rounded-xl flex items-center justify-between animate-in fade-in">
          <span>{alertSuccessMessage}</span>
          <button
            onClick={() => setAlertSuccessMessage(null)}
            className="text-emerald-400 font-bold ml-2 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* TAB NAVIGATION: ACTIVE / COMPLETED / PAUSED */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold mr-1">Hali ya Kampeni:</span>
          <button
            type="button"
            onClick={() => setStatusTab('active')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
              statusTab === 'active'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
            }`}
          >
            Zinazoendelea (Active) (
            {enrichedCampaigns.filter((c) => c.computedStatus === 'active').length}
            )
          </button>
          <button
            type="button"
            onClick={() => setStatusTab('completed')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
              statusTab === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
            }`}
          >
            Zilizokamilika (Completed) (
            {enrichedCampaigns.filter((c) => c.computedStatus === 'completed').length}
            )
          </button>
          <button
            type="button"
            onClick={() => setStatusTab('paused')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
              statusTab === 'paused'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
            }`}
          >
            Zilizositishwa (Paused) (
            {enrichedCampaigns.filter((c) => c.computedStatus === 'paused').length}
            )
          </button>
        </div>

        {/* Urgency sub-filters */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <span className="text-slate-500 px-1 font-semibold">Tahadhari:</span>
          <button
            type="button"
            onClick={() => setUrgencyFilter('all')}
            className={`px-2 py-0.5 rounded-md font-medium ${
              urgencyFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            Zote
          </button>
          <button
            type="button"
            onClick={() => setUrgencyFilter('critical')}
            className={`px-2 py-0.5 rounded-md font-medium ${
              urgencyFilter === 'critical' ? 'bg-red-600 text-white font-bold' : 'text-red-400'
            }`}
          >
            Hatari (&lt;48h)
          </button>
          <button
            type="button"
            onClick={() => setUrgencyFilter('warning')}
            className={`px-2 py-0.5 rounded-md font-medium ${
              urgencyFilter === 'warning' ? 'bg-amber-600 text-white font-bold' : 'text-amber-400'
            }`}
          >
            Tahadhari
          </button>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center text-slate-500 text-xs italic">
            Hakuna kampeni zilizopatikana kwenye kundi la "{statusTab}".
          </div>
        ) : (
          filtered.map((camp) => {
            const isCritical = camp.alertLevel === 'critical' || camp.alertLevel === 'expired';
            const isWarning = camp.alertLevel === 'warning';

            return (
              <div
                key={camp.id}
                className={`p-5 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isCritical
                    ? 'bg-red-950/20 border-red-700/80 shadow-md ring-1 ring-red-500/20'
                    : isWarning
                    ? 'bg-amber-950/20 border-amber-700/80'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Left: Campaign Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm">{camp.name}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                      {camp.clientName}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                      {camp.adType}
                    </span>

                    {/* Expiration Pill */}
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isCritical
                          ? 'bg-red-950 text-red-300 border border-red-700 animate-pulse'
                          : isWarning
                          ? 'bg-amber-950 text-amber-300 border border-amber-700'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      {camp.daysRemaining <= 0
                        ? 'Muda Umekwisha!'
                        : `Zimebaki Siku ${camp.daysRemaining}`}
                    </span>

                    {camp.overdueSpots.length > 0 && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-900 text-red-200 border border-red-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {camp.overdueSpots.length} Overdue Spots
                      </span>
                    )}
                  </div>

                  {/* Dates & Financials Breakdown */}
                  <div className="text-xs text-slate-400 flex items-center gap-3 flex-wrap">
                    <span>Mwanzo: {camp.startDate}</span>
                    <span>•</span>
                    <span>Mwisho: {camp.endDate}</span>
                    <span>•</span>
                    <div>
                      Billed:{' '}
                      <strong className="text-white font-mono">
                        TZS {camp.totalBilled.toLocaleString()}
                      </strong>
                    </div>
                    <span>•</span>
                    <div>
                      Delivered:{' '}
                      <strong className="text-emerald-400 font-mono">
                        TZS {camp.deliveredAmount.toLocaleString()}
                      </strong>
                    </div>
                    <span>•</span>
                    <div>
                      Outstanding:{' '}
                      <strong className="text-amber-400 font-mono">
                        TZS {camp.outstandingAmount.toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  {/* Progress Bar of Spots Countdown */}
                  <div className="pt-2 max-w-lg">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 mb-1">
                      <span>
                        <strong className="text-emerald-400">{camp.airedSpots}</strong> ya{' '}
                        {camp.totalSpots} zimesomwa —{' '}
                        <span className="text-amber-400 font-semibold">
                          {camp.remainingSpots} zimebaki
                        </span>
                      </span>
                      <span className="font-bold text-white">{camp.completionPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                        style={{ width: `${camp.completionPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Actions: Dispatch Alerts, Renew, Pause */}
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  {/* Dispatch Intercom Alert */}
                  <button
                    type="button"
                    onClick={() => handleDispatchStudioAlert(camp)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700 text-xs font-semibold transition cursor-pointer"
                    title="Tuma ilani ya haraka kwenye Studio Tablet"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Tuma Ilani Studio</span>
                  </button>

                  {/* Extend / Renew 7 Days */}
                  <button
                    type="button"
                    onClick={() => handleExtendCampaign(camp.id, camp.durationDays, 7)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 text-xs font-semibold transition cursor-pointer"
                    title="Ongeza siku 7 kwenye kampeni"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>+Siku 7 (Renew)</span>
                  </button>

                  {/* Pause / Resume */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(camp.id, camp.status)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
                    title={
                      camp.status === 'active'
                        ? 'Simamisha tangazo (Pause)'
                        : 'Endeleza tangazo (Resume)'
                    }
                  >
                    {camp.status === 'active' ? (
                      <PauseCircle className="w-4 h-4 text-amber-400" />
                    ) : (
                      <PlayCircle className="w-4 h-4 text-emerald-400" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MAKE-GOOD / RESCHEDULING MODAL */}
      {makeGoodSpot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-red-400" />
                <h3 className="text-base font-bold text-white">Make-Good / Panga Upya Spot</h3>
              </div>
              <button
                onClick={() => setMakeGoodSpot(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <div>
                <span className="text-slate-400">Mteja:</span>{' '}
                <strong className="text-white">{makeGoodSpot.clientName}</strong>
              </div>
              <div>
                <span className="text-slate-400">Tarehe ya Awali:</span>{' '}
                <span className="font-mono text-red-400">{makeGoodSpot.date}</span> (
                {makeGoodSpot.timeBetween})
              </div>
              <div>
                <span className="text-slate-400">Kipindi:</span>{' '}
                <span className="text-slate-300">{makeGoodSpot.programName}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tarehe Mpya ya Kurusha (New Date):
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Saa Mpya ya Kurusha (New Time Slot):
                </label>
                <input
                  type="text"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  placeholder="k.m. 17:15 - 17:30"
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Sababu ya Kuahirisha (Make-Good Reason):
                </label>
                <select
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 focus:outline-none"
                >
                  <option value="Program Overrun / Live Coverage">
                    Kipindi cha Moja kwa Moja Kiliongezeka Muda (Program Overrun)
                  </option>
                  <option value="Technical Transmission Fault">
                    Hitilafu ya Kiufundi ya Mtambo (Technical Fault)
                  </option>
                  <option value="Client Script Change Request">
                    Mabadiliko ya Script ya Mteja (Client Change)
                  </option>
                  <option value="Presenter Absence / Studio Handover">
                    Mabadiliko ya Watangazaji Studio (Studio Handover)
                  </option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setMakeGoodSpot(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Ghairi
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md transition"
              >
                Thibitisha Make-Good
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
