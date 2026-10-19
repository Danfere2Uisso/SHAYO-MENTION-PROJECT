import React, { useState } from 'react';
import { useRadioApp } from '../../context/RadioAppContext';
import { Client, AdMention, Program } from '../../types';
import {
  Users,
  Calendar,
  Clock,
  Plus,
  Send,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Building,
  Phone,
  Mail,
  Search,
  Sparkles,
  TrendingUp,
  Tag,
  FileText,
  UploadCloud,
  ShieldCheck,
  Printer,
  Radio,
  ListChecks,
  Megaphone,
} from 'lucide-react';
import { RadioKwizeraCompactLogo } from '../logos/RadioKwizeraLogos';
import { AirplayReportsManager } from './AirplayReportsManager';
import { AdUploaderStudio } from './AdUploaderStudio';
import { CampaignCreator } from '../CampaignCreator';
import { ClientManager } from '../ClientManager';
import { ScheduleOutput } from '../ScheduleOutput';
import { SpotPlanner } from '../SpotPlanner';
import { CampaignTracker } from '../CampaignTracker';
import { ComplianceTracker } from '../ComplianceTracker';
import { MasterPlayoutSheet } from '../MasterPlayoutSheet';
import { PresenterManager } from '../admin/PresenterManager';

export const MarketingDashboard: React.FC = () => {
  const {
    clients,
    addClient,
    programs,
    ads,
    campaigns,
    addAdMention,
    deleteAdMention,
    t,
    language,
    studioDarkMode,
  } = useRadioApp();

  const [activeTab, setActiveTab] = useState<
    | 'creator'
    | 'playout'
    | 'clients'
    | 'presenters'
    | 'planner'
    | 'tracker'
    | 'compliance'
    | 'export'
    | 'uploader'
    | 'reports'
  >('creator');

  const [preselectedClientId, setPreselectedClientId] = useState<string | undefined>(undefined);

  // New Ad Scheduling Form State
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('prog-wd-mseto');
  const [scheduledTime, setScheduledTime] = useState<string>('17:00');
  const [durationSec, setDurationSec] = useState<number>(45);
  const [campaignTitle, setCampaignTitle] = useState<string>('');
  const [scriptText, setScriptText] = useState<string>('');
  const [rateTzs, setRateTzs] = useState<number>(45000);
  const [schedulingSuccess, setSchedulingSuccess] = useState<string | null>(null);

  // New Client Modal / Form State
  const [newClientModal, setNewClientModal] = useState<boolean>(false);
  const [newClientName, setNewClientName] = useState<string>('');
  const [newClientCategory, setNewClientCategory] = useState<string>('General Commercial');
  const [newClientContact, setNewClientContact] = useState<string>('');
  const [newClientPhone, setNewClientPhone] = useState<string>('');
  const [newClientEmail, setNewClientEmail] = useState<string>('');
  const [newClientNotes, setNewClientNotes] = useState<string>('');

  // Selected client object
  const currentClient = clients.find((c) => c.id === selectedClientId) || clients[0];
  const currentProgram = programs.find((p) => p.id === selectedProgramId) || programs[4];

  // Auto-fill client details when client selection changes
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const c = clients.find((item) => item.id === clientId);
    if (c) {
      setRateTzs(c.standardRateTzs || 45000);
    }
  };

  // Double-booking check: count how many ads are already scheduled in the same hour / slot
  const existingAdsInSlot = ads.filter(
    (a) => a.programId === selectedProgramId && a.scheduledTime === scheduledTime
  );
  const isDoubleBooked = existingAdsInSlot.length >= 2;

  // Congestion calculation for time slots (Free < 2 ads, Moderate = 2 ads, Congested >= 3 ads)
  const getSlotCongestion = (progId: string, time: string) => {
    const count = ads.filter((a) => a.programId === progId && a.scheduledTime === time).length;
    if (count === 0) return { label: t.status.free, color: 'text-emerald-400 bg-emerald-950/60 border-emerald-700' };
    if (count === 1) return { label: t.status.moderate, color: 'text-amber-400 bg-amber-950/60 border-amber-700' };
    return { label: t.status.congested, color: 'text-red-400 bg-red-950/60 border-red-700' };
  };

  // Submit and publish new ad mention
  const handlePublishAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClient || !currentProgram) return;

    const created = addAdMention({
      clientName: currentClient.name,
      campaignTitle,
      programId: currentProgram.id,
      programName: currentProgram.name,
      scheduledTime,
      durationSec,
      adType: 'live_mention',
      scriptText,
      urgency: 'critical',
      date: '2026-09-10',
      month: 'March 2026',
      rateTzs,
      contactPerson: `${currentClient.contactPerson} (${currentClient.phone})`,
      maxCheckIns: 3,
    });

    setSchedulingSuccess(
      language === 'sw'
        ? `✅ Tangazo la "${created.clientName}" limeratibiwa na kutumwa Moja kwa Moja kwenye Kishikwambi cha Studio!`
        : `✅ Ad mention for "${created.clientName}" published instantly to Studio Tablet!`
    );

    setTimeout(() => {
      setSchedulingSuccess(null);
    }, 4500);
  };

  // Create new client in master CRM
  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const created = addClient({
      name: newClientName,
      category: newClientCategory,
      contactPerson: newClientContact || 'Representative',
      phone: newClientPhone || '+255 754 000 000',
      email: newClientEmail || 'contact@client.com',
      rateCardCode: 'PRIME-A1',
      notes: newClientNotes || 'Client added via Marketing CRM.',
    });

    setSelectedClientId(created.id);
    setNewClientModal(false);
    setNewClientName('');
  };

  // Export to CSV simulation
  const handleExportCSV = () => {
    const headers = 'ID,Date,Time,Program,Client,Campaign,Duration(s),Rate(TZS),Status,CheckIns\n';
    const rows = ads
      .map(
        (a) =>
          `"${a.id}","${a.date}","${a.scheduledTime}","${a.programName}","${a.clientName}","${a.campaignTitle}",${a.durationSec},${a.rateTzs || 0},"${a.status}",${a.checkIns.length}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Radio_Kwizera_Schedule_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`p-4 sm:p-6 max-w-7xl mx-auto ${studioDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-purple-600 text-white">
              {t.roles.marketing_officer}
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              Radio Kwizera 97.7 FM • Jukwaa la Matumaini • Marketing & Station Admin
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Marketing & Station Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {language === 'sw'
              ? 'Ripoti za matangazo yaliyosomwa hewani, programu iliyounganishwa ya kupakia, ratiba za matangazo na wateja.'
              : 'Certified airplay read reports, integrated ad uploader portal, campaign scheduler, and client CRM.'}
          </p>
        </div>

        {/* Quick Tabs - Campaign & Ad Management Module */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start md:self-auto flex-wrap">
          <button
            onClick={() => setActiveTab('creator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'creator'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{t.marketingTabs.campaignCreator}</span>
          </button>

          <button
            onClick={() => setActiveTab('playout')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'playout'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" />
            <span>{t.marketingTabs.masterPlayout}</span>
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'clients'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>{t.marketingTabs.clientDirectory} ({clients.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('presenters')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'presenters'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{language === 'sw' ? 'Watangazaji' : 'Manage Presenters'}</span>
          </button>

          <button
            onClick={() => setActiveTab('planner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'planner'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t.marketingTabs.spotPlanner}</span>
          </button>

          <button
            onClick={() => setActiveTab('tracker')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tracker'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
            <span>{t.marketingTabs.alertsRenewals}</span>
          </button>

          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'compliance'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>{t.marketingTabs.compliancePop}</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'export'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Printer className="w-3.5 h-3.5 text-blue-300" />
            <span>{t.marketingTabs.printExport}</span>
          </button>

          <button
            onClick={() => setActiveTab('uploader')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'uploader'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{t.marketingTabs.audioIngestion}</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t.marketingTabs.airplayLogs}</span>
          </button>
        </div>
      </div>

      {/* SUCCESS NOTICE */}
      {schedulingSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 text-emerald-200 flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <span className="font-bold text-sm">{schedulingSuccess}</span>
          </div>
          <span className="text-xs bg-emerald-900 px-2 py-1 rounded text-emerald-300 font-mono">
            SYNCED
          </span>
        </div>
      )}

      {/* TAB 1: AD CAMPAIGN CREATOR (CORE MODULE) */}
      {activeTab === 'creator' && (
        <CampaignCreator preselectedClientId={preselectedClientId} />
      )}

      {/* TAB 2: CLIENT DIRECTORY & CRM MANAGEMENT */}
      {activeTab === 'clients' && (
        <ClientManager
          onCreateCampaignForClient={(clientId) => {
            setPreselectedClientId(clientId);
            setActiveTab('creator');
          }}
        />
      )}

      {/* TAB: PRESENTER MANAGEMENT */}
      {activeTab === 'presenters' && <PresenterManager />}

      {/* TAB 3: MASTER PLAYOUT SHEET */}
      {activeTab === 'playout' && <MasterPlayoutSheet />}

      {/* TAB 4: 7-DAY SPOT PLANNER & CONGESTION */}
      {activeTab === 'planner' && <SpotPlanner />}

      {/* TAB 5: CAMPAIGN TRACKER & EXPIRATION ALERTS */}
      {activeTab === 'tracker' && <CampaignTracker />}

      {/* TAB 6: COMPLIANCE & REVENUE TRACKER (POP CERTIFICATES) */}
      {activeTab === 'compliance' && <ComplianceTracker />}

      {/* TAB 7: SCHEDULE OUTPUT & EXPORTS */}
      {activeTab === 'export' && <ScheduleOutput />}

      {/* TAB 8: AD AUDIO UPLOADER & INGESTION STUDIO */}
      {activeTab === 'uploader' && <AdUploaderStudio />}

      {/* TAB 1 (LEGACY): SMART SCHEDULER */}
      {activeTab === ('legacy_scheduler' as any) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Cols: Scheduler Form */}
          <form
            onSubmit={handlePublishAd}
            className="lg:col-span-7 bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                {language === 'sw' ? 'Uundaji wa Tangazo Jipya' : 'Schedule Ad Mention'}
              </span>
              <button
                type="button"
                onClick={() => setNewClientModal(true)}
                className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.actions.addClient}</span>
              </button>
            </div>

            {/* Client Select (Auto-Fill) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {t.labels.client}
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-purple-500"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Campaign Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {language === 'sw' ? 'Jina la Kampeni' : 'Campaign Title'}
              </label>
              <input
                type="text"
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-semibold"
                placeholder="e.g. Twiga Extra - Imara Kuliko Yote"
                required
              />
            </div>

            {/* Program & Time Slot Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  {t.labels.program} (2026 Schedule)
                </label>
                <select
                  value={selectedProgramId}
                  onChange={(e) => setSelectedProgramId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-purple-500"
                >
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.timeSlot})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  {t.labels.timeSlot} (Broadcast Time)
                </label>
                <select
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-mono font-bold text-amber-400 focus:outline-none focus:border-purple-500"
                >
                  <option value="06:55">06:55 (Asubuhi Njema break)</option>
                  <option value="07:15">07:15 (Asubuhi prime slot)</option>
                  <option value="09:45">09:45 (Nje ya Dimba slot)</option>
                  <option value="12:55">12:55 (Mchakato slot)</option>
                  <option value="16:30">16:30 (Mseto Leo break 1)</option>
                  <option value="17:00">17:00 (Mseto Leo prime commercial)</option>
                  <option value="17:25">17:25 (Mseto Leo Furushi)</option>
                  <option value="20:10">20:10 (Sports Corner spot)</option>
                </select>
              </div>
            </div>

            {/* Duration & Commercial Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  {t.labels.duration} ({t.labels.seconds})
                </label>
                <select
                  value={durationSec}
                  onChange={(e) => setDurationSec(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                >
                  <option value={30}>30 Seconds (Spot)</option>
                  <option value={45}>45 Seconds (Live Mention)</option>
                  <option value={60}>60 Seconds (Full Commercial)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  {t.labels.rateTzs}
                </label>
                <input
                  type="number"
                  value={rateTzs}
                  onChange={(e) => setRateTzs(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-emerald-400 focus:outline-none focus:border-purple-500 font-bold"
                  step={5000}
                />
              </div>
            </div>

            {/* Script Text */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {t.labels.script} (Presenter Teleprompter Text)
              </label>
              <textarea
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 font-serif focus:outline-none focus:border-purple-500 leading-relaxed"
                placeholder="Enter exact on-air script..."
                required
              />
            </div>

            {/* Double-Booking Warning Alert (Zero Double Booking Requirement) */}
            {isDoubleBooked && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>
                  ⚠️ <strong>{t.labels.doubleBookingWarning}:</strong> {scheduledTime} slot has {existingAdsInSlot.length} ads already assigned. Consider adjusting time to avoid congestion.
                </span>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="publish-ad-btn"
              type="submit"
              className="w-full py-3 px-6 rounded-xl font-black text-sm tracking-wide text-white bg-gradient-to-r from-red-600 via-purple-600 to-blue-700 hover:opacity-95 shadow-xl flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>{t.actions.publish}</span>
            </button>
          </form>

          {/* Right 5 Cols: Live Availability & Scheduled Ads Preview */}
          <div className="lg:col-span-5 space-y-4">
            {/* Slot Congestion Gauge Card */}
            <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 block">
                {t.labels.congestionTracker} • {currentProgram.name}
              </span>

              <div className="space-y-2.5">
                {['16:30', '17:00', '17:25', '18:15'].map((time) => {
                  const status = getSlotCongestion(currentProgram.id, time);
                  return (
                    <div
                      key={time}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono font-bold text-xs">{time}</span>
                      </div>
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Currently Active Scheduled Commercials */}
            <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  {language === 'sw' ? 'Matangazo Yaliyopangwa Leo' : 'Scheduled Mentions Today'} ({ads.length})
                </span>
                <span className="text-[11px] text-purple-400 font-mono">March 2026</span>
              </div>

              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {ads.map((ad) => (
                  <div
                    key={ad.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-mono text-[10px] font-black text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded">
                          {ad.scheduledTime}
                        </span>
                        <span className="text-xs font-bold text-white truncate">
                          {ad.clientName}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {ad.programName} • {ad.durationSec}s
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {ad.status === 'signed' ? (
                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/60 border border-emerald-700 px-2 py-0.5 rounded">
                          {t.status.signed}
                        </span>
                      ) : (
                        <span className="text-[10px] font-black text-amber-400 bg-amber-950/60 border border-amber-700 px-2 py-0.5 rounded">
                          {t.status.pending}
                        </span>
                      )}
                      <button
                        onClick={() => deleteAdMention(ad.id)}
                        className="text-slate-500 hover:text-red-400 text-xs px-1"
                        title="Delete from schedule"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLIENT CRM DIRECTORY (MODULE 8) */}
      {activeTab === 'clients' && (
        <ClientManager
          onSelectClientForCampaign={(client) => {
            setPreselectedClientId(client.id);
            setActiveTab('creator');
          }}
        />
      )}

      {/* TAB 3: CONGESTION TRACKER (MODULE 6 & 8) */}
      {activeTab === 'congestion' && (
        <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-black text-white">
                {t.labels.congestionTracker}
              </h2>
              <p className="text-xs text-slate-400">
                Visual airtime load monitor across all 2026 programming slots. Green: Free, Yellow: Moderate, Red: Congested.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Free
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Moderate
              </span>
              <span className="flex items-center gap-1 text-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Congested
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programs.slice(0, 6).map((prog) => {
              const programAds = ads.filter((a) => a.programId === prog.id);
              const isCongested = programAds.length >= 3;
              const isModerate = programAds.length === 2;

              return (
                <div
                  key={prog.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-black text-sm text-white">{prog.name}</div>
                      <div className="text-xs font-mono text-slate-400">{prog.timeSlot}</div>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                        isCongested
                          ? 'bg-red-950 text-red-400 border-red-700'
                          : isModerate
                          ? 'bg-amber-950 text-amber-400 border-amber-700'
                          : 'bg-emerald-950 text-emerald-400 border-emerald-700'
                      }`}
                    >
                      {isCongested ? 'Congested (3+ Ads)' : isModerate ? 'Moderate (2 Ads)' : 'Available'}
                    </span>
                  </div>

                  {/* Progress Meter */}
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCongested
                          ? 'bg-red-500 w-full'
                          : isModerate
                          ? 'bg-amber-500 w-2/3'
                          : 'bg-emerald-500 w-1/3'
                      }`}
                    />
                  </div>

                  {/* Ads listed in slot */}
                  <div className="text-xs text-slate-400 space-y-1">
                    {programAds.length === 0 ? (
                      <div className="text-[11px] text-slate-500 italic">No ads scheduled yet. Prime slot open.</div>
                    ) : (
                      programAds.map((a) => (
                        <div key={a.id} className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-200 font-semibold">{a.clientName} ({a.scheduledTime})</span>
                          <span className="font-mono text-slate-400">{a.durationSec}s</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: GOOGLE SHEETS / EXCEL EXPORT (MODULE 8 CORE) */}
      {activeTab === 'export' && (
        <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                {t.actions.exportSheets}
              </h2>
              <p className="text-xs text-slate-400">
                Generate and download the complete broadcast fulfillment grid matching standard Google Sheets & Excel layout.
              </p>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 shadow-lg self-start sm:self-auto active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download .CSV Spreadsheet</span>
            </button>
          </div>

          {/* Table Preview */}
          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">Program</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Campaign</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Rate (TZS)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Runs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {ads.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-amber-400">{a.scheduledTime}</td>
                    <td className="p-3 font-bold text-white">{a.programName}</td>
                    <td className="p-3 font-semibold text-purple-300">{a.clientName}</td>
                    <td className="p-3">{a.campaignTitle}</td>
                    <td className="p-3 font-mono">{a.durationSec}s</td>
                    <td className="p-3 font-mono text-emerald-400">{(a.rateTzs || 0).toLocaleString()}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          a.status === 'signed'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                            : 'bg-amber-950 text-amber-400 border border-amber-700'
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono">{a.checkIns.length}/{a.maxCheckIns}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: AIRPLAY & TIMESTAMP PROOF REPORTS */}
      {activeTab === 'reports' && <AirplayReportsManager />}

      {/* NEW CLIENT MODAL */}
      {newClientModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateClient}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="font-black text-base text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-400" />
                {t.actions.addClient}
              </h2>
              <button
                type="button"
                onClick={() => setNewClientModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Company / Client Name
              </label>
              <input
                type="text"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="e.g. Serengeti Breweries Ltd"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Category / Sector
              </label>
              <input
                type="text"
                value={newClientCategory}
                onChange={(e) => setNewClientCategory(e.target.value)}
                placeholder="e.g. Telecommunications, Agriculture"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={newClientContact}
                  onChange={(e) => setNewClientContact(e.target.value)}
                  placeholder="Manager name"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  placeholder="+255 7..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Notes & Rate Terms
              </label>
              <textarea
                value={newClientNotes}
                onChange={(e) => setNewClientNotes(e.target.value)}
                rows={2}
                placeholder="Commercial campaign goals..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setNewClientModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                {t.actions.cancel}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-black text-white bg-purple-600 hover:bg-purple-500 shadow-md"
              >
                {t.actions.save} Client
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
