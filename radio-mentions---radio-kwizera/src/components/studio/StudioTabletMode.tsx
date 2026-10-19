import React, { useState, useEffect, useRef } from 'react';
import { useRadioApp } from '../../context/RadioAppContext';
import { AdMention, Program, ScheduleSegment } from '../../types';
import {
  Radio,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Volume2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Maximize2,
  Minimize2,
  Mic,
  ChevronRight,
  Check,
  Send,
  Zap,
  Users,
} from 'lucide-react';
import { RadioKwizeraCompactLogo, RadioKwizeraSunburstLogo } from '../logos/RadioKwizeraLogos';
import { studioAudio } from '../../utils/audioSynth';

export const StudioTabletMode: React.FC = () => {
  const {
    currentUser,
    currentLiveProgram,
    selectedProgramId,
    setSelectedProgramId,
    programs,
    ads,
    signAdMention,
    undoSignAdMention,
    activeAdForSign,
    setActiveAdForSign,
    greenFlashActive,
    t,
    language,
    isOnline,
    syncStatus,
    presentersList,
    selectedPresenter,
    setSelectedPresenter,
  } = useRadioApp();

  // Current studio clock
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);

  // Undo button grace state
  const [lastSignedAdId, setLastSignedAdId] = useState<string | null>(null);
  const [undoSecondsLeft, setUndoSecondsLeft] = useState<number>(0);

  // Swipe slider state in full-screen ad overlay
  const [swipeProgress, setSwipeProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const sliderTrackRef = useRef<HTMLDivElement>(null);

  // Auto-advance countdown in overlay after signing
  const [signedConfirmation, setSignedConfirmation] = useState<{
    timestamp: string;
    countdown: number;
    presenter: string;
  } | null>(null);

  // Presenter selection validation error
  const [presenterError, setPresenterError] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTimeStr(
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

  // Filter ads for the current selected main program block
  const currentProgramAds = ads.filter(
    (a) => a.programId === selectedProgramId || a.programName?.toLowerCase() === currentLiveProgram?.name?.toLowerCase()
  );

  // Strictly chronological order by scheduled airtime
  const sortedAds = [...currentProgramAds].sort((a, b) => {
    return a.scheduledTime.localeCompare(b.scheduledTime);
  });

  // Handle Swipe-to-Sign completion
  const handleExecuteSign = (ad: AdMention) => {
    const presenterToUse = selectedPresenter || (presentersList.length > 0 ? presentersList[0] : '');
    if (!presenterToUse) {
      setPresenterError(
        language === 'sw'
          ? 'Tafadhali chagua jina la mtangazaji kwanza kabla ya kusaini.'
          : 'Please select a presenter name first before signing.'
      );
      setSwipeProgress(0);
      return;
    }

    setPresenterError(null);
    const result = signAdMention(ad.id, presenterToUse);
    setLastSignedAdId(ad.id);
    setUndoSecondsLeft(15); // 15-second undo grace period

    setSignedConfirmation({
      timestamp: result.timestamp,
      countdown: 3,
      presenter: presenterToUse,
    });

    // Auto advance after 3 seconds as required by specification
    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      setSignedConfirmation((prev) => (prev ? { ...prev, countdown: count } : null));
      if (count <= 0) {
        clearInterval(interval);
        setSignedConfirmation(null);
        setActiveAdForSign(null);
        setSwipeProgress(0);
      }
    }, 1000);
  };

  // Undo handler
  const handleUndo = (adId: string) => {
    undoSignAdMention(adId);
    setLastSignedAdId(null);
    setUndoSecondsLeft(0);
    setSignedConfirmation(null);
  };

  // Drag handlers for Swipe to Sign
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !sliderTrackRef.current) return;
    const rect = sliderTrackRef.current.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const trackWidth = rect.width - 64; // button width
    const pct = Math.max(0, Math.min(100, (relativeX / trackWidth) * 100));
    setSwipeProgress(pct);

    if (pct >= 90 && activeAdForSign && !signedConfirmation) {
      setIsDragging(false);
      setSwipeProgress(100);
      handleExecuteSign(activeAdForSign);
    }
  };

  const handlePointerUp = () => {
    if (!signedConfirmation) {
      setIsDragging(false);
      setSwipeProgress(0);
    }
  };

  return (
    <div
      id="studio-tablet-root"
      className="min-h-[calc(100vh-70px)] bg-slate-950 text-slate-100 p-3 sm:p-6 select-none flex flex-col justify-between relative overflow-hidden"
    >
      {/* FULL-SCREEN GREEN FLASH ON SIGNING */}
      {greenFlashActive && (
        <div
          id="green-flash-overlay"
          className="fixed inset-0 z-50 bg-emerald-500/80 backdrop-blur-md flex flex-col items-center justify-center animate-pulse pointer-events-none transition-opacity duration-300"
        >
          <div className="bg-slate-950/90 text-emerald-400 border-4 border-emerald-400 rounded-3xl p-8 sm:p-12 text-center shadow-2xl scale-110 transform transition-transform">
            <CheckCircle2 className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 text-emerald-400 animate-bounce" />
            <h1 className="text-4xl sm:text-6xl font-black tracking-wider uppercase mb-2">
              ✅ {t.actions.signedSuccess}
            </h1>
            <p className="text-xl sm:text-2xl font-mono text-emerald-200">
              {currentTimeStr} EAT
            </p>
          </div>
        </div>
      )}

      {/* TOP STUDIO BAR: Presenter quick info & on-air countdown */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-red-500 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-black tracking-wider text-red-400 uppercase">
                {t.status.onAir} • {t.roles.presenter}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {currentLiveProgram?.name || 'MSETO LEO'}
            </h1>
            <p className="text-xs text-slate-400">
              {currentLiveProgram?.timeSlot} • Radio Kwizera 97.7 FM • Jukwaa la Matumaini
            </p>
          </div>
        </div>

        {/* Studio Status & Undo Bar if active */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          {/* Presenter Selector in studio bar */}
          <div className="flex items-center gap-2 bg-slate-950 border border-purple-500/40 px-3 py-1.5 rounded-xl">
            <Mic className="w-4 h-4 text-purple-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                {language === 'sw' ? 'Mtangazaji Hewani:' : 'Presenter On-Air:'}
              </span>
              <select
                value={selectedPresenter}
                onChange={(e) => {
                  setSelectedPresenter(e.target.value);
                  setPresenterError(null);
                }}
                className="bg-transparent text-xs font-black text-purple-300 focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-slate-900 text-slate-300">
                  -- {language === 'sw' ? 'Chagua Jina Lako' : 'Select Name'} --
                </option>
                {presentersList.map((p) => (
                  <option key={p} value={p} className="bg-slate-900 text-white">
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {lastSignedAdId && undoSecondsLeft > 0 && (
            <div className="flex items-center gap-2 bg-amber-950/80 border border-amber-600 px-3 py-1.5 rounded-xl">
              <span className="text-xs font-bold text-amber-300">
                {t.actions.signedSuccess}! ({undoSecondsLeft}s)
              </span>
              <button
                onClick={() => handleUndo(lastSignedAdId)}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-black flex items-center gap-1 active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.actions.undo}</span>
              </button>
            </div>
          )}

          <div className="text-right">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              {t.labels.liveStudioFeed}
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-amber-400">
              {currentTimeStr}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN PROGRAM BLOCKS TIMETABLE & CONSOLIDATED AD LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left 4 Cols: Timetable (Main Program Blocks Only - No Inner Segments) */}
        <div className="lg:col-span-4 bg-slate-900/70 rounded-2xl p-4 border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <div>
              <span className="text-xs font-black tracking-wider text-red-400 uppercase flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-red-500" />
                {language === 'sw' ? 'Ratiba ya Vipindi Vikuu' : "Today's Main Shows"}
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {language === 'sw' ? 'Gusa kipindi kuona matangazo yake' : 'Tap show to view scheduled ads'}
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
              7 SHOWS
            </span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[520px] pr-1 scrollbar-thin">
            {programs.slice(0, 7).map((prog) => {
              const isSelected = prog.id === selectedProgramId;
              const progAdCount = ads.filter(
                (a) => a.programId === prog.id || a.programName?.toLowerCase() === prog.name.toLowerCase()
              ).length;
              const progSignedCount = ads.filter(
                (a) => (a.programId === prog.id || a.programName?.toLowerCase() === prog.name.toLowerCase()) && a.status === 'signed'
              ).length;

              return (
                <button
                  key={prog.id}
                  onClick={() => setSelectedProgramId(prog.id)}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-r from-red-600 via-purple-700 to-[#0033A0] border-red-400 text-white shadow-lg shadow-red-950/40 ring-1 ring-red-400/50 scale-[1.01]'
                      : 'bg-slate-950/70 border-slate-800/80 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`text-[11px] font-mono font-black px-2 py-0.5 rounded ${
                        isSelected ? 'bg-black/30 text-amber-300' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {prog.timeSlot}
                    </span>
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-white text-red-700 px-2 py-0.5 rounded-full shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                        ON AIR
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-semibold">
                        {progAdCount} {language === 'sw' ? 'matangazo' : 'ads'}
                      </span>
                    )}
                  </div>

                  <div className="font-black text-sm tracking-wide mb-0.5">
                    {prog.name}
                  </div>

                  <div className="flex items-center justify-between text-xs opacity-80">
                    <span className="truncate">97.7 FM • Studio Desk</span>
                    {isSelected && (
                      <span className="text-[11px] font-mono font-bold text-emerald-300">
                        {progSignedCount}/{progAdCount} {t.status.signed}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 8 Cols: Consolidated Ad List for Selected Program (Strictly Chronological) */}
        <div className="lg:col-span-8 flex flex-col bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
          {/* Main Program Header & Ads Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-wide">
                  {currentLiveProgram?.name}
                </h2>
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/80 border border-amber-600/40 px-2 py-0.5 rounded">
                  {currentLiveProgram?.timeSlot}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'sw'
                  ? 'Orodha moja ya matangazo yote ya kipindi hiki (mfuatano wa muda wa kurushwa)'
                  : 'Consolidated list of all ads scheduled for this show block (chronological airtime)'}
              </p>
            </div>

            {/* Quick Status Count */}
            <div className="flex items-center gap-2 text-xs font-mono shrink-0">
              <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
                {sortedAds.length} {language === 'sw' ? 'Jumla' : 'Total'}
              </span>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 px-2.5 py-1 rounded-lg font-bold">
                {sortedAds.filter((a) => a.status === 'signed').length} {t.status.signed}
              </span>
              <span className="bg-red-950 text-red-300 border border-red-700 px-2.5 py-1 rounded-lg font-bold">
                {sortedAds.filter((a) => a.status === 'pending').length} {t.status.pending}
              </span>
            </div>
          </div>

          {/* Consolidated Chronological Ad List */}
          {sortedAds.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-slate-500">
              <Radio className="w-12 h-12 text-slate-700 mb-3" />
              <p className="text-sm font-semibold">
                {language === 'sw'
                  ? 'Hakuna matangazo yaliyoratibiwa kwa kipindi hiki bado.'
                  : 'No commercial mentions scheduled for this show block.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[520px] pr-1 scrollbar-thin">
              {sortedAds.map((ad, index) => {
                const isSigned = ad.status === 'signed';
                const isCritical = ad.urgency === 'critical' && !isSigned;
                const checkInCount = ad.checkIns?.length || 0;

                return (
                  <div
                    key={ad.id}
                    onClick={() => setActiveAdForSign(ad)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isSigned
                        ? 'bg-slate-950/70 border-emerald-600/50 hover:border-emerald-500'
                        : isCritical
                        ? 'bg-gradient-to-r from-red-950/70 via-slate-900 to-slate-900 border-red-500/90 shadow-lg shadow-red-950/40 ring-1 ring-red-500/40'
                        : 'bg-slate-950/80 border-slate-800 hover:border-purple-600'
                    }`}
                  >
                    {/* Left: Scheduled Time, Sequence & Client Details */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      {/* Chronological Airtime Pill */}
                      <div className="shrink-0 flex flex-col items-center">
                        <span
                          className={`font-mono text-sm font-black px-2.5 py-1 rounded-lg border text-center shadow-xs ${
                            isSigned
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                              : isCritical
                              ? 'bg-red-600 text-white border-red-400 animate-pulse'
                              : 'bg-slate-800 text-amber-300 border-slate-700'
                          }`}
                        >
                          {ad.scheduledTime}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 mt-1">
                          #{index + 1}
                        </span>
                      </div>

                      {/* Client, Campaign & Script Snippet */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-base font-black text-white tracking-wide truncate">
                            {ad.clientName}
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {ad.adType === 'live_mention' ? 'Live Mention' : ad.adType === 'recorded_spot' ? 'Recorded Spot' : 'Sponsor Tag'} • {ad.durationSec}s
                          </span>
                          {isSigned ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-400 bg-emerald-950/80 border border-emerald-700 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              {t.status.signed}
                            </span>
                          ) : isCritical ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-red-300 bg-red-950 border border-red-600 px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3 text-red-400" />
                              URGENT
                            </span>
                          ) : null}
                        </div>

                        <p className="text-xs font-semibold text-purple-300 mb-1.5 truncate">
                          {ad.campaignTitle}
                        </p>

                        {/* Script snippet preview */}
                        <p className="text-xs text-slate-400 font-serif line-clamp-2 leading-relaxed bg-slate-900/60 p-2 rounded-lg border border-slate-850">
                          {ad.scriptText}
                        </p>
                      </div>
                    </div>

                    {/* Right: Sign Action Button & Sign Status */}
                    <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      {isSigned ? (
                        <div className="text-right">
                          <div className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {ad.checkIns?.[0]?.timestamp ? ad.checkIns[ad.checkIns.length - 1].timestamp.split(' ')[1] : '16:31:08'} EAT
                          </div>
                          <span className="text-[10px] text-slate-500">
                            Check-in {checkInCount}/{ad.maxCheckIns}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-amber-400 font-mono">
                          {ad.durationSec}s
                        </span>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveAdForSign(ad);
                        }}
                        className={`py-2 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all active:scale-95 ${
                          isSigned
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                            : 'bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white shadow-red-950/50'
                        }`}
                      >
                        <Mic className="w-3.5 h-3.5" />
                        <span>{isSigned ? t.actions.read : t.actions.sign}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* FULL-SCREEN TELEPROMPTER OVERLAY FOR AD SIGNING (MODULE 3 REQUIREMENT) */}
      {activeAdForSign && (
        <div
          id="ad-fullscreen-teleprompter"
          className="fixed inset-0 z-40 bg-slate-950/98 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8 overflow-y-auto"
        >
          {/* Top Bar of Overlay */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <RadioKwizeraCompactLogo size="sm" />
              <div className="border-l border-slate-700 pl-3">
                <span className="text-xs font-mono font-bold text-amber-400">
                  {activeAdForSign.scheduledTime} BREAK • {activeAdForSign.durationSec}s
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {activeAdForSign.clientName}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Audio Cue Button */}
              <button
                onClick={() => {
                  studioAudio.playOnAirBeep();
                  setAudioPlaying(!audioPlaying);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-colors ${
                  audioPlaying
                    ? 'bg-blue-600 text-white border-blue-400 animate-pulse'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Volume2 className="w-4 h-4 text-blue-400" />
                <span>{audioPlaying ? 'Audio Cue Playing' : 'Play Audio Jingle'}</span>
              </button>

              <button
                onClick={() => {
                  setActiveAdForSign(null);
                  setSwipeProgress(0);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-black uppercase tracking-wider"
              >
                {t.actions.close}
              </button>
            </div>
          </div>

          {/* Center: Extra-Large Teleprompter Script */}
          <div className="max-w-4xl mx-auto w-full my-auto py-6">
            <div className="text-center mb-4">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-950 text-red-400 border border-red-800">
                ● LIVE ON AIR SCRIPT
              </span>
              <div className="text-sm font-semibold text-purple-400 mt-1">
                {activeAdForSign.campaignTitle}
              </div>
            </div>

            <div className="bg-slate-900/90 border-2 border-slate-700 rounded-3xl p-6 sm:p-10 shadow-2xl">
              <div className="text-xl sm:text-3xl font-serif text-slate-100 leading-relaxed sm:leading-loose whitespace-pre-line tracking-wide">
                {activeAdForSign.scriptText}
              </div>
            </div>

            {/* Check-In History if already signed */}
            {activeAdForSign.checkIns?.length > 0 && (
              <div className="mt-4 flex items-center justify-center gap-3 text-xs text-emerald-400 font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {t.studioTablet.signedAt} {activeAdForSign.checkIns[activeAdForSign.checkIns.length - 1].timestamp} ({activeAdForSign.checkIns.length}/{activeAdForSign.maxCheckIns} runs)
                </span>
              </div>
            )}
          </div>

          {/* Bottom: Massive Swipe To Sign / Tap To Sign Control */}
          <div className="max-w-3xl mx-auto w-full pt-4 space-y-3">
            {/* Presenter Sign-Off Confirmation Box */}
            <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-950 border border-purple-500/50 flex items-center justify-center shrink-0">
                    <Mic className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-purple-300">
                      {language === 'sw' ? 'Mtangazaji Anayesaini (Sign-Off Presenter):' : 'Signing Presenter Name:'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {language === 'sw' ? 'Jina hili litathibitishwa rasmi kwenye ripoti ya urushaji hewani' : 'Certified in official transmission compliance certificate'}
                    </div>
                  </div>
                </div>

                <div className="min-w-[220px]">
                  {presentersList.length > 0 ? (
                    <select
                      value={selectedPresenter}
                      onChange={(e) => {
                        setSelectedPresenter(e.target.value);
                        setPresenterError(null);
                      }}
                      className="w-full bg-slate-950 border-2 border-purple-500/80 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-purple-400 cursor-pointer"
                    >
                      <option value="">-- {language === 'sw' ? 'Chagua Jina Lako' : 'Select Your Name'} --</option>
                      {presentersList.map((p) => (
                        <option key={p} value={p}>
                          🎤 {p}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-xs text-amber-300 bg-amber-950/60 border border-amber-700/80 p-2 rounded-xl">
                      {language === 'sw' ? 'Hakuna watangazaji walioorodheshwa. Waongeze kwenye Dashibodi ya Masoko.' : 'No presenters registered. Add in Marketing Admin.'}
                    </div>
                  )}
                </div>
              </div>

              {presenterError && (
                <div className="mt-2.5 text-xs font-bold text-red-400 bg-red-950/60 border border-red-800/80 px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{presenterError}</span>
                </div>
              )}
            </div>

            {signedConfirmation ? (
              <div className="bg-emerald-950 border-2 border-emerald-500 rounded-2xl p-5 text-center shadow-2xl animate-fade-in">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 animate-bounce" />
                <div className="text-2xl font-black text-emerald-300">
                  ✅ {t.actions.signedSuccess} ({signedConfirmation.timestamp})
                </div>
                <div className="text-sm font-bold text-emerald-200 mt-1">
                  🎤 {language === 'sw' ? 'Imethibitishwa na Mtangazaji:' : 'Certified by Presenter:'}{' '}
                  <span className="text-white underline">{signedConfirmation.presenter}</span>
                </div>
                <div className="text-xs text-emerald-400 mt-1">
                  {t.studioTablet.autoAdvanceNotice} ({signedConfirmation.countdown}s)
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Swipe Slider Track */}
                <div
                  ref={sliderTrackRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  className="relative h-18 bg-slate-900 border-2 border-red-500/80 rounded-2xl overflow-hidden touch-none cursor-grab active:cursor-grabbing shadow-2xl flex items-center select-none"
                >
                  {/* Fill progress bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-red-600 via-purple-600 to-emerald-500 transition-all duration-75"
                    style={{ width: `${swipeProgress}%` }}
                  />

                  {/* Instructional Text */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-sm sm:text-base font-black tracking-widest text-white uppercase flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                      {t.actions.swipeToSign}
                      <ArrowRight className="w-4 h-4 animate-bounce" />
                    </span>
                  </div>

                  {/* Draggable Button Thumb */}
                  <div
                    className="absolute h-14 w-14 rounded-xl bg-white text-slate-950 flex items-center justify-center font-black shadow-2xl transition-all duration-75 border-2 border-red-600 ml-2"
                    style={{ left: `calc(${swipeProgress}% * 0.85)` }}
                  >
                    <Check className="w-7 h-7 text-red-600 stroke-[3]" />
                  </div>
                </div>

                {/* Instant 1-Touch Fallback Button */}
                <button
                  id="instant-sign-btn"
                  onClick={() => handleExecuteSign(activeAdForSign)}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700 active:scale-98 transition-all"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>{t.actions.tapToSign}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
