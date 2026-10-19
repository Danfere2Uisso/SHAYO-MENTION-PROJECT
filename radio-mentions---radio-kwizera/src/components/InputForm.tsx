import React, { useState } from 'react';
import {
  Send,
  Plus,
  Radio,
  Clock,
  Calendar,
  Layers,
  FileText,
  AlertCircle,
  CheckCircle2,
  Users,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { useRadioApp } from '../context/RadioAppContext';
import { SmartSuggestionPanel } from './SmartSuggestionPanel';
import { getShowForTime, OFFICIAL_TIMETABLE_2026 } from '../data/timetable';

interface InputFormProps {
  onAdPublished?: () => void;
}

export const InputForm: React.FC<InputFormProps> = ({ onAdPublished }) => {
  const { clients, programs, ads, addAdMention, addClient, language, t } = useRadioApp();

  // Form State
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [adName, setAdName] = useState<string>('');
  const [adCategory, setAdCategory] = useState<string>('Health');
  const [scheduledDate, setScheduledDate] = useState<string>('2026-03-15');
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // Monday
  const [scheduledTime, setScheduledTime] = useState<string>('07:30 - 07:45');
  const [selectedProgramName, setSelectedProgramName] = useState<string>('Asubuhi Njema');
  const [durationSec, setDurationSec] = useState<number>(45);
  const [adType, setAdType] = useState<'live_mention' | 'recorded_spot' | 'promo' | 'sponsor_tag'>('live_mention');
  const [rateTzs, setRateTzs] = useState<number>(45000);
  const [scriptText, setScriptText] = useState<string>('');

  // Quick Client Modal
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientCategory, setNewClientCategory] = useState('Health');

  // Feedback State
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const currentClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  // Callback when a slot is clicked in SmartSuggestionPanel
  const handleApplySlotFromPanel = (timeSlot: string, progName?: string) => {
    setScheduledTime(timeSlot);
    if (progName) {
      setSelectedProgramName(progName);
    } else {
      // Find show using time
      const startTime = timeSlot.split('-')[0].trim();
      const show = getShowForTime(startTime, dayOfWeek);
      if (show) setSelectedProgramName(show.name);
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClient || !adName.trim()) return;

    // Find program or fallback
    const prog =
      programs.find((p) => p.name.toLowerCase() === selectedProgramName.toLowerCase()) ||
      programs[0];

    const startTime = scheduledTime.split('-')[0]?.trim() || '07:30';

    addAdMention({
      clientName: currentClient.name,
      campaignTitle: adName,
      programId: prog.id,
      programName: selectedProgramName || prog.name,
      scheduledTime: startTime,
      durationSec,
      adType,
      scriptText: scriptText || `Tangazo la ${adName} kwa ajili ya wateja wetu.`,
      urgency: 'critical',
      date: scheduledDate,
      month: 'March 2026',
      rateTzs,
      contactPerson: `${currentClient.contactPerson} (${currentClient.phone})`,
      maxCheckIns: 3,
    });

    setSuccessMessage(
      language === 'sw'
        ? `✅ Tangazo la "${adName}" limepangwa kikamilifu kwenye ${selectedProgramName} (${scheduledTime}) na kusawazishwa kwenye Kishikwambi cha Studio!`
        : `✅ Ad "${adName}" successfully scheduled for ${selectedProgramName} (${scheduledTime}) and synced with Studio Tablet!`
    );

    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);

    // Reset form fields
    setAdName('');
    setScriptText('');
    if (onAdPublished) onAdPublished();
  };

  // Create quick client
  const handleCreateQuickClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const created = addClient({
      name: newClientName,
      category: newClientCategory,
      contactPerson: 'Commercial Contact',
      phone: newClientPhone || '+255 754 000 000',
      email: 'ads@radiokwizera.co.tz',
      rateCardCode: 'PRIME-A1',
      activeCampaigns: 1,
    });

    setSelectedClientId(created.id);
    setShowNewClientModal(false);
    setNewClientName('');
    setNewClientPhone('');
  };

  return (
    <div className="space-y-6">
      {/* Success Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-700 text-emerald-300 rounded-2xl flex items-center justify-between gap-3 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-bold">{successMessage}</span>
          </div>
          <span className="text-[10px] bg-emerald-900 px-2 py-0.5 rounded font-mono text-emerald-200">
            SYNCED
          </span>
        </div>
      )}

      {/* Two Column Layout: Left Form + Right Smart Suggestion Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: The Main Input Form (7 cols) */}
        <form
          id="ad-input-form"
          onSubmit={handleSubmit}
          className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-600/30 text-red-400 border border-red-500/40">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {language === 'sw' ? 'Fomu ya Upangaji wa Tangazo' : 'Commercial Ad Scheduling Form'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {language === 'sw'
                    ? 'Weka maelezo ya tangazo na muda wa kurushwa hewani'
                    : 'Configure commercial broadcast slots & script teleprompter'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowNewClientModal(true)}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'sw' ? 'Mteja Mpya' : 'New Client'}</span>
            </button>
          </div>

          {/* Client Selection */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === 'sw' ? 'Chagua Mteja *' : 'Select Client *'}</span>
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.company ? `(${c.company})` : ''} - {c.category}
                </option>
              ))}
            </select>
          </div>

          {/* Ad Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                {language === 'sw' ? 'Jina la Tangazo / Kampeni *' : 'Ad / Campaign Name *'}
              </label>
              <input
                type="text"
                value={adName}
                onChange={(e) => setAdName(e.target.value)}
                placeholder={language === 'sw' ? 'k.m. Huduma ya Afya ya Jamii' : 'e.g. M-Pesa Festive Campaign'}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                {language === 'sw' ? 'Sekta ya Kibiashara *' : 'Industry Category *'}
              </label>
              <select
                value={adCategory}
                onChange={(e) => setAdCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Health">Health / Afya</option>
                <option value="Betting & Gaming">Betting & Gaming</option>
                <option value="Agriculture">Agriculture / Kilimo</option>
                <option value="Telecom">Telecom & Technology</option>
                <option value="Banking & Finance">Banking & Finance / Benki</option>
                <option value="Food & Beverages">Food & Beverages / Vinywaji</option>
                <option value="Building & Construction">Building & Construction</option>
                <option value="Education">Education / Elimu</option>
                <option value="Religious & Faith">Religious & Faith / Dini</option>
                <option value="Government & Public Notices">Government / Serikali</option>
                <option value="Energy & Solar">Energy & Solar / Nishati Safi</option>
                <option value="Automotive & Transport">Automotive & Transport</option>
                <option value="Sports & Fitness">Sports & Fitness / Michezo</option>
                <option value="Retail & Wholesale">Retail & Wholesale</option>
                <option value="Entertainment & Events">Entertainment & Events</option>
                <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                <option value="Real Estate">Real Estate / Ardhi</option>
              </select>
            </div>
          </div>

          {/* Date & Day Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-purple-400" />
                <span>{language === 'sw' ? 'Tarehe ya Kurushwa' : 'Broadcast Date'}</span>
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => {
                  setScheduledDate(e.target.value);
                  const d = new Date(e.target.value + 'T00:00:00');
                  if (!isNaN(d.getTime())) setDayOfWeek(d.getDay());
                }}
                className="w-full bg-slate-950 border border-slate-700 text-white font-mono rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>{language === 'sw' ? 'Nafasi ya Saa (Time Slot) *' : 'Selected Time Slot *'}</span>
              </label>
              <input
                type="text"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                placeholder="07:30 - 07:45"
                className="w-full bg-slate-950 border border-slate-700 text-amber-400 font-mono font-bold rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Program Name & Ad Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                {language === 'sw' ? 'Kipindi Kinacholengwa' : 'Target Program'}
              </label>
              <input
                type="text"
                value={selectedProgramName}
                onChange={(e) => setSelectedProgramName(e.target.value)}
                placeholder="Asubuhi Njema"
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                {language === 'sw' ? 'Aina ya Tangazo' : 'Ad Format'}
              </label>
              <select
                value={adType}
                onChange={(e) => setAdType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="live_mention">Live Mention (Mtangazaji Hewani)</option>
                <option value="recorded_spot">Recorded Commercial Spot (Audio File)</option>
                <option value="sponsor_tag">Sponsor Tag / Kibwagizo</option>
                <option value="promo">Special Promotional Feature</option>
              </select>
            </div>
          </div>

          {/* Duration & Commercial Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                {language === 'sw' ? 'Urefu wa Tangazo' : 'Duration'}
              </label>
              <select
                value={durationSec}
                onChange={(e) => setDurationSec(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={30}>30 Seconds (Standard Spot)</option>
                <option value={45}>45 Seconds (Live Mention)</option>
                <option value={60}>60 Seconds (Full Commercial)</option>
                <option value={90}>90 Seconds (Extended Feature)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                {language === 'sw' ? 'Kiwango cha Bili (TZS)' : 'Billing Rate (TZS)'}
              </label>
              <input
                type="number"
                value={rateTzs}
                onChange={(e) => setRateTzs(Number(e.target.value))}
                step={5000}
                className="w-full bg-slate-950 border border-slate-700 text-emerald-400 font-mono font-bold rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Teleprompter Script */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3 text-amber-400" />
                {language === 'sw'
                  ? 'Nakala ya Kusomwa Hewani (Presenter Script) *'
                  : 'Presenter On-Air Teleprompter Script *'}
              </span>
              <span className="text-[10px] text-slate-500">
                {scriptText.length} {language === 'sw' ? 'herufi' : 'chars'}
              </span>
            </label>
            <textarea
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              rows={4}
              placeholder={
                language === 'sw'
                  ? 'Andika ujumbe rasmi utakaosomwa hewani na mtangazaji wa Radio Kwizera...'
                  : 'Enter exact on-air live mention script for presenter tablet...'
              }
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed font-sans"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            id="submit-ad-btn"
            type="submit"
            className="w-full py-3 px-6 rounded-xl font-bold text-xs tracking-wide text-white bg-gradient-to-r from-red-600 via-purple-700 to-blue-700 hover:from-red-500 hover:to-blue-600 shadow-xl flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
          >
            <Send className="w-4 h-4" />
            <span>
              {language === 'sw'
                ? 'Ratibu & Tuma Moja kwa Moja Studio'
                : 'Schedule & Publish to Studio Tablet'}
            </span>
          </button>
        </form>

        {/* RIGHT COLUMN: The Smart Placement Suggestion Panel (6 cols) */}
        <div className="lg:col-span-6">
          <SmartSuggestionPanel
            selectedCategory={adCategory}
            onCategoryChange={setAdCategory}
            adName={adName}
            onAdNameChange={setAdName}
            dayOfWeek={dayOfWeek}
            onDayOfWeekChange={setDayOfWeek}
            tier={currentClient?.tier || 'B'}
            onApplySlot={handleApplySlotFromPanel}
          />
        </div>
      </div>

      {/* Quick Client Registration Modal */}
      {showNewClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-red-500" />
              <span>{language === 'sw' ? 'Sajili Mteja Mpya Haraka' : 'Quick Register New Client'}</span>
            </h3>

            <form onSubmit={handleCreateQuickClient} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'sw' ? 'Jina la Mteja / Kampuni *' : 'Client / Brand Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="k.m. Vodacom Tanzania"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'sw' ? 'Nambari ya Simu' : 'Phone Number'}
                </label>
                <input
                  type="text"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  placeholder="+255 754 000 000"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'sw' ? 'Sekta ya Kibiashara' : 'Category'}
                </label>
                <select
                  value={newClientCategory}
                  onChange={(e) => setNewClientCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="Health">Health</option>
                  <option value="Telecom">Telecom</option>
                  <option value="Banking & Finance">Banking & Finance</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Betting & Gaming">Betting & Gaming</option>
                  <option value="Food & Beverages">Food & Beverages</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewClientModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  {language === 'sw' ? 'Ghairi' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-500"
                >
                  {language === 'sw' ? 'Hifadhi Mteja' : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
