import React, { useState, useRef, useEffect } from 'react';
import { useRadioApp } from '../../context/RadioAppContext';
import { Client, AdMention, Program, AdType } from '../../types';
import {
  UploadCloud,
  FileAudio,
  FileText,
  Play,
  Pause,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
  Plus,
  Trash2,
  Eye,
  Radio,
  Building,
  Calendar,
  Volume2,
  VolumeX,
  RefreshCw,
  Sliders,
  Check,
  Tag,
  ShieldCheck,
  Search,
  ExternalLink,
  Layers,
  ArrowRight,
  Music,
} from 'lucide-react';
import { studioAudio } from '../../utils/audioSynth';

export const AdUploaderStudio: React.FC = () => {
  const {
    clients,
    addClient,
    programs,
    ads,
    addAdMention,
    deleteAdMention,
    t,
    language,
    studioDarkMode,
  } = useRadioApp();

  // Active sub-tab inside Uploader Studio: "new_upload" or "uploaded_vault"
  const [activeSubView, setActiveSubView] = useState<'new_upload' | 'uploaded_vault'>('new_upload');

  // Form State
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [campaignTitle, setCampaignTitle] = useState<string>('');
  const [adType, setAdType] = useState<AdType>('live_mention');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('prog-wd-mseto');
  const [scheduledTime, setScheduledTime] = useState<string>('17:00');
  const [durationSec, setDurationSec] = useState<number>(45);
  const [rateTzs, setRateTzs] = useState<number>(45000);
  const [adLanguage, setAdLanguage] = useState<'sw' | 'rn' | 'rw' | 'en'>('sw');
  const [runFrequency, setRunFrequency] = useState<number>(3);
  const [startDate, setStartDate] = useState<string>('2026-09-10');
  const [endDate, setEndDate] = useState<string>('2026-09-24');

  // Script text
  const [scriptText, setScriptText] = useState<string>('');

  // Uploaded Audio File State
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const audioIntervalRef = useRef<any>(null);

  // Success Notice State
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  // Studio Preview Modal State
  const [previewStudioModal, setPreviewStudioModal] = useState<boolean>(false);

  // New Client Modal State
  const [newClientModal, setNewClientModal] = useState<boolean>(false);
  const [newClientName, setNewClientName] = useState<string>('');
  const [newClientCategory, setNewClientCategory] = useState<string>('General Commercial');
  const [newClientContact, setNewClientContact] = useState<string>('');
  const [newClientPhone, setNewClientPhone] = useState<string>('');
  const [newClientEmail, setNewClientEmail] = useState<string>('');

  // Selected client object
  const currentClient = clients.find((c) => c.id === selectedClientId) || clients[0];
  const currentProgram = programs.find((p) => p.id === selectedProgramId) || programs[4];

  // Script metrics: word count and estimated reading time
  const words = scriptText.trim() ? scriptText.trim().split(/\s+/).length : 0;
  const estimatedReadingSec = Math.ceil((words / 130) * 60); // 130 words per minute average broadcast pace

  // Congestion calculation for chosen time slot
  const slotAds = ads.filter(
    (a) => a.programId === selectedProgramId && a.scheduledTime === scheduledTime
  );
  const slotSecondsUsed = slotAds.reduce((acc, a) => acc + (a.durationSec || 30), 0);
  const isCongested = slotSecondsUsed + durationSec > 240; // over 4 minutes of commercial in same block

  // Simulate audio playback preview using web audio synth
  const toggleAudioPlayback = () => {
    if (isAudioPlaying) {
      clearInterval(audioIntervalRef.current);
      setIsAudioPlaying(false);
      setAudioProgress(0);
    } else {
      setIsAudioPlaying(true);
      setAudioProgress(0);
      studioAudio.playSuccessSignChime();

      let currentSec = 0;
      audioIntervalRef.current = setInterval(() => {
        currentSec += 1;
        setAudioProgress(Math.min(100, Math.round((currentSec / durationSec) * 100)));
        if (currentSec >= durationSec) {
          clearInterval(audioIntervalRef.current);
          setIsAudioPlaying(false);
          setAudioProgress(0);
        }
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, []);

  // Handle file drop / manual file input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setUploadedFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      if (file.name.toLowerCase().endsWith('.mp3') || file.name.toLowerCase().endsWith('.wav')) {
        setAdType('recorded_spot');
      }
    }
  };

  // Quick template loaders
  const loadTemplate = (clientKey: 'twiga' | 'vodacom' | 'azam' | 'jrs') => {
    if (clientKey === 'twiga') {
      const client = clients.find((c) => c.name.includes('Twiga')) || clients[0];
      setSelectedClientId(client.id);
      setCampaignTitle('Twiga Extra Cement - Uimara Usio na Kikomo');
      setDurationSec(45);
      setRateTzs(45000);
      setAdType('live_mention');
      setUploadedFileName('Twiga_Extra_Cement_45s_Spot_Master.wav');
      setScriptText(
        `Wasikilizaji wa Radio Kwizera 97.7 FM, unapojenga nyumba yako au mradi wowote wa ujenzi, jenga kwa amani na uhakika ukitumia Twiga Cement! Twiga Extra ndiyo simenti namba moja Tanzania, imara na thabiti inayodumu vizazi na vizazi.\n\nInapatikana madukani kote Ngara mjini, Rusumo, Benako, Biharamulo na mkoa mzima wa Kagera. Kwa maelezo zaidi piga simu namba 0754 889 900. Twiga Cement - Imara Kuliko Yote!`
      );
    } else if (clientKey === 'vodacom') {
      const client = clients.find((c) => c.name.includes('Vodacom')) || clients[0];
      setSelectedClientId(client.id);
      setCampaignTitle('Vodacom M-Pesa - Ni Zaidi ya Pesa');
      setDurationSec(30);
      setRateTzs(40000);
      setAdType('recorded_spot');
      setUploadedFileName('Vodacom_MPesa_Ni_Zaidi_Ya_Pesa_30s.mp3');
      setScriptText(
        `Tuma na kupokea pesa kwa urahisi, lipia bili za maji, umeme, ada za shule na ununue vifurushi kupitia M-Pesa. Piga *150*00# sasa kufurahia huduma ya uhakika kutoka Vodacom - Kazi Ni Kwako!`
      );
    } else if (clientKey === 'azam') {
      const client = clients.find((c) => c.name.includes('Azam')) || clients[0];
      setSelectedClientId(client.id);
      setCampaignTitle('Azam Energy Drink - Burudika na Nguvu Mpya');
      setDurationSec(30);
      setRateTzs(35000);
      setAdType('recorded_spot');
      setUploadedFileName('Azam_Energy_Drink_Theme_30s.wav');
      setScriptText(
        `Unajisikia mchovu kazini au kwenye shughuli zako za kila siku? Pata Azam Energy Drink baridi ikurudishie nguvu na uchangamfu papo hapo. Inapatikana madukani kote kwa shilingi mia sita tu! Azam - Burudika kwa Ubora.`
      );
    } else if (clientKey === 'jrs') {
      setCampaignTitle('Jesuit Refugee Service (JRS) - Elimu na Amani Kambi ya Wakimbizi');
      setDurationSec(60);
      setRateTzs(25000);
      setAdType('live_mention');
      setUploadedFileName('JRS_Peace_Education_Radio_Brief.pdf');
      setScriptText(
        `Jesuit Refugee Service (JRS) ikishirikiana na Radio Kwizera 97.7 FM inawatangazia wakazi wa kambi za wakimbizi na jamii wenyeji kuwa uandikishaji wa masomo ya stadi za kazi na elimu ya amani unaendelea katika vituo vyetu vya kijamii. Elimu ni chachu ya maendeleo na matumaini. JRS - Kuandamana, Kuhudumia na Kutetea.`
      );
    }
  };

  // Insert helper tags into script
  const insertTag = (tag: string) => {
    setScriptText((prev) => `${prev} ${tag}`);
  };

  // Publish ad directly to studio
  const handlePublishToStudio = (e: React.FormEvent) => {
    e.preventDefault();

    const newAd: AdMention = {
      id: `ad-${Date.now()}`,
      clientName: currentClient ? currentClient.name : 'Twiga Cement Tanzania',
      campaignTitle: campaignTitle || 'Commercial Mention',
      programId: selectedProgramId,
      programName: currentProgram ? currentProgram.name : 'MSETO LEO',
      scheduledTime: scheduledTime,
      durationSec: durationSec,
      adType: adType,
      scriptText: scriptText,
      audioAssetUrl: uploadedFileName || undefined,
      status: 'pending',
      checkIns: [],
      maxCheckIns: runFrequency,
      urgency: 'normal',
      date: startDate,
      month: 'September 2026',
      rateTzs: rateTzs,
      contactPerson: currentClient?.contactPerson || 'Commercial Department',
    };

    addAdMention(newAd);
    studioAudio.playSuccessSignChime();

    setUploadSuccessMessage(
      `Tangazo limepakiwa na kutumwa moja kwa moja kwenye Studio Tablet ya Kipindi cha "${currentProgram?.name}" saa ${scheduledTime}!`
    );

    setTimeout(() => {
      setUploadSuccessMessage(null);
    }, 6000);
  };

  // Handle client creation
  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const newC: Client = {
      id: `client-${Date.now()}`,
      name: newClientName,
      category: newClientCategory,
      tier: 'B',
      billingStatus: 'pending',
      contactPerson: newClientContact || 'Representative',
      phone: newClientPhone || '+255 754 000 000',
      email: newClientEmail || 'contact@client.co.tz',
      rateCardCode: 'STANDARD-2026',
      notes: 'New client added via Ad Uploader Studio',
      activeCampaigns: 1,
    };

    addClient(newC);
    setSelectedClientId(newC.id);
    setNewClientModal(false);
    setNewClientName('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Station Header */}
      <div className="bg-gradient-to-r from-[#0C1427] via-slate-900 to-[#0A1020] p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-red-600 to-purple-600 text-white shadow-xs">
              <Radio className="w-3.5 h-3.5" />
              97.7 FM Direct Ingestion
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              Radio Kwizera • Jukwaa la Matumaini • Marketing & Commercial Studio
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Commercial Ad Uploader & Studio Dispatcher
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pakia faili za matangazo ya sauti na matini, panga vipindi vya hewani, kagua msongamano, na tuma moja kwa moja kwenye kishikwambi cha watangazaji studioni.
          </p>
        </div>

        {/* View Switcher & Actions */}
        <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => setActiveSubView('new_upload')}
              className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                activeSubView === 'new_upload'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Pakia Tangazo Jipya</span>
            </button>
            <button
              onClick={() => setActiveSubView('uploaded_vault')}
              className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                activeSubView === 'uploaded_vault'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Maktaba ya Matangazo ({ads.length})</span>
            </button>
          </div>

          <button
            onClick={() => setPreviewStudioModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-md transition-all active:scale-95"
          >
            <Eye className="w-4 h-4 text-amber-400" />
            <span>Hakiki Mwonekano wa Studio</span>
          </button>
        </div>
      </div>

      {/* SUCCESS BANNER */}
      {uploadSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border-2 border-emerald-500 text-emerald-100 flex items-center justify-between shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <span className="font-bold text-sm leading-relaxed">{uploadSuccessMessage}</span>
          </div>
          <span className="text-xs bg-emerald-900 px-3 py-1 rounded-full text-emerald-200 font-mono font-black border border-emerald-700">
            LIVE ON 97.7 FM
          </span>
        </div>
      )}

      {/* QUICK TEMPLATE SHORTCUTS */}
      {activeSubView === 'new_upload' && (
        <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1.5 pl-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Violezo vya Haraka (Quick Ingest):
          </span>
          <button
            onClick={() => loadTemplate('twiga')}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 shrink-0 transition-colors"
          >
            Twiga Cement (45s Mention)
          </button>
          <button
            onClick={() => loadTemplate('vodacom')}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 shrink-0 transition-colors"
          >
            Vodacom M-Pesa (30s Audio Spot)
          </button>
          <button
            onClick={() => loadTemplate('azam')}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 shrink-0 transition-colors"
          >
            Azam Energy (30s Spot)
          </button>
          <button
            onClick={() => loadTemplate('jrs')}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-purple-300 border border-purple-800 shrink-0 transition-colors"
          >
            JRS Announcement (60s Peace)
          </button>
        </div>
      )}

      {/* ===================== VIEW 1: NEW AD UPLOAD & INGESTION FORM ===================== */}
      {activeSubView === 'new_upload' && (
        <form onSubmit={handlePublishToStudio} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 7 COLS: UPLOAD ZONE & RICH SCRIPT TELEPROMPTER */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. MEDIA DROPZONE & AUDIO AUDITION PLAYER */}
            <div className="bg-slate-900/80 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileAudio className="w-5 h-5 text-purple-400" />
                  <h2 className="font-black text-white text-base">
                    1. Pakia Faili la Tangazo (Audio Spot / Media Ingestion)
                  </h2>
                </div>
                <span className="text-[10px] font-mono font-black text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
                  48kHz / Broadcast Ready
                </span>
              </div>

              {/* Drag and Drop Zone */}
              <div className="relative border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-2xl p-6 text-center transition-all bg-slate-950/50 group cursor-pointer">
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.ogg,.pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-purple-950/70 border border-purple-600 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white group-hover:text-purple-300">
                      Buruta au Bonyeza Kupakia Faili la Tangazo
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Inakubali Audio (WAV, MP3, M4A) au Hati za Matangazo (PDF, DOCX, TXT)
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Max file size: 50MB • Standard Stereo 48,000 Hz
                  </span>
                </div>
              </div>

              {/* Audition Player for Uploaded Audio */}
              {uploadedFileName && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={toggleAudioPlayback}
                        className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 shrink-0"
                        title={isAudioPlaying ? 'Sitisha Sauti' : 'Sikiliza Tangazo (Audition)'}
                      >
                        {isAudioPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </button>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate max-w-[240px] sm:max-w-sm">
                          {uploadedFileName}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{uploadedFileSize}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-mono font-semibold">{durationSec}s Duration</span>
                          <span>•</span>
                          <span className="text-purple-400">{isAudioPlaying ? 'Playing on monitor...' : 'Ready to air'}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFileName(null);
                        setUploadedFileSize(null);
                        setIsAudioPlaying(false);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                      title="Ondoa Faili"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Audio Progress Scrubber */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-400 h-full transition-all duration-300"
                        style={{ width: `${audioProgress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>00:{String(Math.round((audioProgress / 100) * durationSec)).padStart(2, '0')}</span>
                      <span>00:{String(durationSec).padStart(2, '0')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. RICH SCRIPT & TELEPROMPTER EDITOR */}
            <div className="bg-slate-900/80 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <h2 className="font-black text-white text-base">
                    2. Matini ya Kusoma Hewani (Studio Teleprompter Script)
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400">{words} maneno</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-amber-400 font-bold">~{estimatedReadingSec}s muda wa kusoma</span>
                </div>
              </div>

              {/* Tag Shortcuts */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-slate-500 uppercase mr-1">Viashiria vya Mtangazaji:</span>
                <button
                  type="button"
                  onClick={() => insertTag('[Paza Sauti & Shangilia]')}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-purple-300 px-2 py-0.5 rounded-md border border-slate-700 font-medium"
                >
                  + [Shangilia]
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('[Sisitiza Namba ya Simu: 0754...]')}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-purple-300 px-2 py-0.5 rounded-md border border-slate-700 font-medium"
                >
                  + [Sisitiza Namba]
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('[Muda wa Ofa Unamalizika Siku Chache]')}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-purple-300 px-2 py-0.5 rounded-md border border-slate-700 font-medium"
                >
                  + [Muda wa Ofa]
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('[Soma kwa Utulivu & Amani - JRS]')}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-purple-300 px-2 py-0.5 rounded-md border border-slate-700 font-medium"
                >
                  + [Utulivu & Amani]
                </button>
              </div>

              {/* Script Textarea */}
              <div className="relative">
                <textarea
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  rows={8}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-sm sm:text-base font-serif text-slate-100 leading-relaxed focus:outline-none focus:border-purple-500 shadow-inner"
                  placeholder="Andika au bandika matini kamili ya tangazo atakayosoma mtangazaji hewani..."
                  required
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Mtangazaji ataona matini hii kwa ukubwa unaosomeka kirahisi akiwa hewani.</span>
                <button
                  type="button"
                  onClick={() => setPreviewStudioModal(true)}
                  className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
                >
                  <span>Angalia jinsi mtangazaji atakavyoona</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: CAMPAIGN DETAILS & AIRTIME PROGRAMMING */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/80 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-red-500" />
                  <h2 className="font-black text-white text-base">
                    3. Taarifa za Mteja na Ratiba
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setNewClientModal(true)}
                  className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Mteja Mpya</span>
                </button>
              </div>

              {/* Client Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Mteja / Advertiser
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-purple-500"
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Jina la Kampeni (Campaign Title)
                </label>
                <input
                  type="text"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              {/* Format & Language */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Aina ya Tangazo
                  </label>
                  <select
                    value={adType}
                    onChange={(e) => setAdType(e.target.value as AdType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="live_mention">Live Mention (Kusoma)</option>
                    <option value="recorded_spot">Recorded Spot (Audio)</option>
                    <option value="sponsor_tag">Sponsorship Tag (Udhamini)</option>
                    <option value="promo">Station Promo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Lugha ya Tangazo
                  </label>
                  <select
                    value={adLanguage}
                    onChange={(e) => setAdLanguage(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="sw">Kiswahili</option>
                    <option value="rn">Kirundi</option>
                    <option value="rw">Kinyarwanda</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              {/* Target Show & Airtime Slot */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Kipindi cha 97.7 FM
                  </label>
                  <select
                    value={selectedProgramId}
                    onChange={(e) => setSelectedProgramId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
                  >
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.timeSlot})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Saa ya Kurusha (Slot)
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              {/* Congestion Checker Widget */}
              <div
                className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                  isCongested
                    ? 'bg-red-950/60 border-red-500 text-red-300'
                    : 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isCongested ? (
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <span>
                    Nafasi ya Dakika: <strong>{slotSecondsUsed + durationSec}s</strong> / 240s
                  </span>
                </div>
                <span className="font-mono text-[11px] font-black uppercase">
                  {isCongested ? 'Msongamano Mkubwa' : 'Salama (Safe)'}
                </span>
              </div>

              {/* Duration & Commercial Rate */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Urefu (Sekunde)
                  </label>
                  <div className="flex items-center gap-1">
                    {[15, 30, 45, 60].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => {
                          setDurationSec(sec);
                          setRateTzs(sec === 15 ? 25000 : sec === 30 ? 35000 : sec === 45 ? 45000 : 60000);
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-black font-mono transition-all ${
                          durationSec === sec
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Gharama kwa Mzunguko (TZS)
                  </label>
                  <input
                    type="number"
                    value={rateTzs}
                    onChange={(e) => setRateTzs(Number(e.target.value))}
                    step={1000}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Frequency & Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Marudio kwa Siku
                  </label>
                  <select
                    value={runFrequency}
                    onChange={(e) => setRunFrequency(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value={1}>1x kwa siku</option>
                    <option value={2}>2x kwa siku</option>
                    <option value={3}>3x kwa siku</option>
                    <option value={4}>4x kwa siku</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Tarehe ya Kuanzia
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Total Contract Billing Summary */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-bold block">
                    Makadirio ya Bili (Jumla):
                  </span>
                  <span className="text-lg font-mono font-black text-amber-400">
                    TZS {(rateTzs * runFrequency).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 block">kwa siku 1 (mara {runFrequency})</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-red-400 font-black uppercase tracking-wider block">
                    Radio Kwizera 97.7
                  </span>
                  <span className="text-[11px] text-slate-400">Jukwaa la Matumaini</span>
                </div>
              </div>

              {/* ACTION DISPATCH BUTTON */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-red-600 via-purple-600 to-[#0033A0] hover:opacity-95 shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Chapisha & Tuma Moja kwa Moja Studioni</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ===================== VIEW 2: UPLOADED COMMERCIAL REPOSITORY / VAULT ===================== */}
      {activeSubView === 'uploaded_vault' && (
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl space-y-4 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                <span>Maktaba ya Matangazo Yaliyopakiwa (Active Campaigns Vault)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Orodha ya matangazo yote yaliyopakiwa tayari kwa kurushwa hewani kupitia 97.7 FM.
              </p>
            </div>

            <button
              onClick={() => setActiveSubView('new_upload')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-purple-600 hover:bg-purple-500 text-white shadow-md self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Pakia Tangazo Jipya</span>
            </button>
          </div>

          {/* Ads Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ads.map((ad) => {
              const isSigned = ad.status === 'signed';
              return (
                <div
                  key={ad.id}
                  className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 hover:border-purple-600 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-black text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {ad.scheduledTime}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          isSigned
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                            : 'bg-amber-950 text-amber-400 border-amber-700'
                        }`}
                      >
                        {isSigned ? 'Imesainiwa Hewani' : 'Inasubiri Studio'}
                      </span>
                    </div>

                    <h3 className="font-black text-white text-base leading-tight mb-1 truncate">
                      {ad.clientName}
                    </h3>
                    <div className="text-xs text-purple-300 font-semibold mb-2 line-clamp-1">
                      {ad.campaignTitle}
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs font-serif text-slate-300 line-clamp-3 mb-3">
                      "{ad.scriptText}"
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-800">
                      <span>Kipindi: <strong className="text-slate-200">{ad.programName}</strong></span>
                      <span className="font-mono text-emerald-400">{(ad.rateTzs || 45000).toLocaleString()} TZS</span>
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setScriptText(ad.scriptText);
                        setCampaignTitle(ad.campaignTitle);
                        setDurationSec(ad.durationSec);
                        setActiveSubView('new_upload');
                      }}
                      className="text-xs text-purple-400 hover:text-purple-300 font-bold"
                    >
                      Hariri / Fungua
                    </button>

                    <button
                      onClick={() => deleteAdMention(ad.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-900 transition-colors"
                      title="Futa Tangazo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================== MODAL: LIVE STUDIO TABLET PREVIEW ===================== */}
      {previewStudioModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#090E1D] border-2 border-purple-500 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Hakiki Kishikwambi cha Studio (Live Tablet Teleprompter View)
                </h3>
              </div>
              <button
                onClick={() => setPreviewStudioModal(false)}
                className="text-xs text-slate-400 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg"
              >
                Funga Hakiki
              </button>
            </div>

            {/* Studio Card Mockup */}
            <div className="bg-slate-950 rounded-2xl p-5 border border-red-500/60 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                  <span className="text-xs font-black text-red-400 uppercase tracking-wider">
                    HEWANI SASA • {currentProgram?.name || 'MSETO LEO'} (97.7 FM)
                  </span>
                </div>
                <span className="font-mono font-black text-amber-400 text-sm bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                  {scheduledTime} EAT • {durationSec}s
                </span>
              </div>

              <div className="text-xl sm:text-2xl font-black text-white">
                {currentClient?.name || 'Twiga Cement'} - {campaignTitle}
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-base sm:text-lg font-serif text-slate-100 leading-relaxed max-h-48 overflow-y-auto">
                {scriptText}
              </div>

              {/* Swipe to sign simulator bar */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-600 via-purple-700 to-emerald-600 text-center text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2">
                <span>Mtangazaji huteleza kidole kusaini baada ya kusoma</span>
                <ArrowRight className="w-4 h-4 animate-bounce" />
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center italic">
              "Tangazo hili litatokea mara moja kwenye screen ya mtangazaji muda utakapowadia."
            </p>
          </div>
        </div>
      )}

      {/* ===================== MODAL: NEW CLIENT ===================== */}
      {newClientModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveClient}
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-black text-white text-base">Ongeza Mteja Mpya</h3>
              <button
                type="button"
                onClick={() => setNewClientModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Funga
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Jina la Kampuni / Mteja
              </label>
              <input
                type="text"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="Mfano: CRDB Bank, Azam Group..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Sekta / Kundi
              </label>
              <select
                value={newClientCategory}
                onChange={(e) => setNewClientCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="Commercial Business">Commercial Business</option>
                <option value="Telecommunications">Telecommunications</option>
                <option value="Banking & Finance">Banking & Finance</option>
                <option value="Building & Construction">Building & Construction</option>
                <option value="Government & Agency">Government & Agency</option>
                <option value="JRS & Humanitarian">JRS & Humanitarian</option>
                <option value="Religious & Community">Religious & Community</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Mtu wa Mawasiliano
                </label>
                <input
                  type="text"
                  value={newClientContact}
                  onChange={(e) => setNewClientContact(e.target.value)}
                  placeholder="Afisa Masoko..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Simu
                </label>
                <input
                  type="text"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  placeholder="+255 7..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setNewClientModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Ghairi
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-black text-white bg-purple-600 hover:bg-purple-500 shadow-md"
              >
                Hifadhi Mteja
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
