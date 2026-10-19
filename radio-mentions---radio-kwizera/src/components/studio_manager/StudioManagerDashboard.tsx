import React, { useState } from 'react';
import { useRadioApp } from '../../context/RadioAppContext';
import {
  MonitorCheck,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Radio,
  Send,
  Volume2,
  Zap,
} from 'lucide-react';

export const StudioManagerDashboard: React.FC = () => {
  const {
    currentLiveProgram,
    ads,
    programs,
    sendStudioAlert,
    t,
    language,
    studioDarkMode,
    isOnline,
  } = useRadioApp();

  const [customAlertText, setCustomAlertText] = useState<string>('');
  const [alertSentNotice, setAlertSentNotice] = useState<string | null>(null);

  // Pending ads in the live show
  const currentShowAds = ads.filter((a) => a.programId === currentLiveProgram?.id);
  const pendingAds = currentShowAds.filter((a) => a.status === 'pending');
  const signedAds = currentShowAds.filter((a) => a.status === 'signed');

  const handleSendPing = (message: string) => {
    sendStudioAlert('Studio Manager Intercom', message);
    setAlertSentNotice(message);
    setTimeout(() => setAlertSentNotice(null), 3000);
  };

  return (
    <div className={`p-4 sm:p-6 max-w-7xl mx-auto space-y-6 ${studioDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-blue-600 text-white">
              {t.roles.studio_manager}
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              Broadcast Operations & Quality Assurance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Studio Monitor & Check-In Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {language === 'sw'
              ? 'Ufuatiliaji wa moja kwa moja wa matangazo hewani na tahadhari za dharura kwa watangazaji.'
              : 'Real-time monitoring of live mentions, on-time sign-off enforcement, and studio booth intercom.'}
          </p>
        </div>

        {/* Live Show Status Pill */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">
              Current Live Show
            </div>
            <div className="text-sm font-black text-white">
              {currentLiveProgram?.name} ({currentLiveProgram?.timeSlot})
            </div>
          </div>
        </div>
      </div>

      {/* Alert Sent Toast */}
      {alertSentNotice && (
        <div className="p-3 rounded-xl bg-blue-950/80 border border-blue-500 text-blue-200 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <Bell className="w-4 h-4 text-blue-400" />
          <span>Intercom alert sent to Studio Tablet: "{alertSentNotice}"</span>
        </div>
      )}

      {/* Grid: 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Signed On Air
            </div>
            <div className="text-3xl font-black text-emerald-400 mt-1">
              {signedAds.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Commercials fulfilled</div>
          </div>
          <CheckCircle2 className="w-10 h-10 text-emerald-500/40" />
        </div>

        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Pending in Current Show
            </div>
            <div className="text-3xl font-black text-amber-400 mt-1">
              {pendingAds.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Awaiting presenter read</div>
          </div>
          <Clock className="w-10 h-10 text-amber-500/40" />
        </div>

        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Total Station Bookings
            </div>
            <div className="text-3xl font-black text-purple-400 mt-1">
              {ads.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">All 2026 daily slots</div>
          </div>
          <Radio className="w-10 h-10 text-purple-500/40" />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Real-Time Check-In Timeline */}
        <div className="lg:col-span-8 bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <MonitorCheck className="w-4 h-4 text-blue-400" />
              Live Show Ad Queue ({currentLiveProgram?.name})
            </span>
            <span className="text-xs text-slate-500">
              Presenter: {currentLiveProgram?.presenterName}
            </span>
          </div>

          <div className="space-y-3">
            {currentShowAds.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs italic">
                No commercials queued in this immediate hour.
              </div>
            ) : (
              currentShowAds.map((ad) => {
                const isSigned = ad.status === 'signed';
                const isCritical = ad.urgency === 'critical' && !isSigned;

                return (
                  <div
                    key={ad.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isSigned
                        ? 'bg-slate-950 border-emerald-800/60'
                        : isCritical
                        ? 'bg-red-950/50 border-red-500 animate-pulse'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-black text-amber-400 bg-slate-900 px-2 py-0.5 rounded">
                          {ad.scheduledTime}
                        </span>
                        <span className="font-bold text-sm text-white">
                          {ad.clientName}
                        </span>
                        <span className="text-xs text-purple-300 font-medium">
                          ({ad.durationSec}s)
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-serif line-clamp-1">
                        {ad.scriptText}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {isSigned ? (
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-400 bg-emerald-950 border border-emerald-700 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {t.status.signed}
                          </span>
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                            {ad.checkIns[ad.checkIns.length - 1]?.timestamp}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-red-400 bg-red-950 border border-red-600 px-2 py-0.5 rounded animate-bounce">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {t.status.urgent}
                          </span>
                          <button
                            onClick={() =>
                              handleSendPing(`REMINDER: Please read ${ad.clientName} ad due at ${ad.scheduledTime}!`)
                            }
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                            title="Ping Presenter"
                          >
                            <Bell className="w-3 h-3" />
                            <span>Ping</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 4 Cols: Intercom & Urgency Alert Dispatcher */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              Direct Studio Booth Intercom
            </span>
            <p className="text-xs text-slate-400">
              Send instant pop-up cues and chimes directly to the Presenter's tablet in the studio.
            </p>

            {/* Quick action buttons */}
            <div className="space-y-2">
              <button
                onClick={() => handleSendPing('Commercial break approaching in 60 seconds!')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center justify-between"
              >
                <span>⏱️ "Break approaching in 60s"</span>
                <Send className="w-3.5 h-3.5 text-blue-400" />
              </button>
              <button
                onClick={() => handleSendPing('Ad sign-off overdue! Please execute sign button.')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-red-300 flex items-center justify-between"
              >
                <span>⚠️ "Sign-off overdue alert"</span>
                <Send className="w-3.5 h-3.5 text-red-400" />
              </button>
              <button
                onClick={() => handleSendPing('Sponsor tag confirmed by commercial director.')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-emerald-300 flex items-center justify-between"
              >
                <span>✅ "Sponsor tag confirmed"</span>
                <Send className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </div>

            {/* Custom message */}
            <div className="pt-2 border-t border-slate-800">
              <input
                type="text"
                value={customAlertText}
                onChange={(e) => setCustomAlertText(e.target.value)}
                placeholder="Type custom note to booth..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 mb-2"
              />
              <button
                onClick={() => {
                  if (customAlertText.trim()) {
                    handleSendPing(customAlertText);
                    setCustomAlertText('');
                  }
                }}
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Transmit Custom Alert</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
