import React, { useState } from 'react';
import { Sparkles, Check, Copy, RefreshCw, X, Sliders, Volume2, Globe, Clock, ShieldCheck } from 'lucide-react';
import { useRadioApp } from '../context/RadioAppContext';

interface AiMentionRewriterProps {
  isOpen: boolean;
  onClose: () => void;
  currentScript: string;
  clientName: string;
  category: string;
  onApplyScript: (newScript: string) => void;
  defaultDurationSec?: number;
}

export const AiMentionRewriter: React.FC<AiMentionRewriterProps> = ({
  isOpen,
  onClose,
  currentScript,
  clientName,
  category,
  onApplyScript,
  defaultDurationSec = 45,
}) => {
  const { language: appLanguage, t } = useRadioApp();
  const [tone, setTone] = useState<string>('energetic');
  const [durationSec, setDurationSec] = useState<number>(defaultDurationSec);
  const [broadcastLanguage, setBroadcastLanguage] = useState<'sw' | 'en'>(appLanguage === 'sw' ? 'sw' : 'en');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [rewrittenText, setRewrittenText] = useState<string>('');
  const [provider, setProvider] = useState<string>('');
  const [wordCount, setWordCount] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!currentScript.trim()) {
      setErrorMsg(
        appLanguage === 'sw'
          ? 'Tafadhali andika draft au maelezo machache kwenye script kwanza.'
          : 'Please write a draft or brief points in the script editor first.'
      );
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/rewrite-mention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: currentScript,
          clientName: clientName || (appLanguage === 'sw' ? 'Mteja wa Kibiashara' : 'Commercial Client'),
          category: category || 'General Commercial',
          durationSec,
          tone,
          language: broadcastLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error(
          appLanguage === 'sw'
            ? 'Hitilafu kwenye seva ya AI. Tafadhali jaribu tena.'
            : 'Error from AI service. Please try again.'
        );
      }

      const data = await response.json();
      setRewrittenText(data.rewrittenScript || '');
      setProvider(data.provider || 'Gemini 3.8 Flash');
      setWordCount(data.wordCount || 0);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.message ||
          (appLanguage === 'sw'
            ? 'Hitilafu ya mtandao wakati wa kuwasiliana na AI.'
            : 'Network error communicating with AI service.')
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!rewrittenText) return;
    navigator.clipboard.writeText(rewrittenText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (!rewrittenText) return;
    onApplyScript(rewrittenText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-300">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {appLanguage === 'sw' ? 'Mhariri Mahiri wa Script za Matangazo' : 'AI Mention Rewriter & Script Polisher'}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                  Google Gemini
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {appLanguage === 'sw'
                  ? 'Huboresha mtiririko wa sauti hewani na muda sahihi kwa ajili ya Radio Kwizera 97.7 FM'
                  : 'Optimizes on-air broadcast flow, pacing, and duration for Radio Kwizera 97.7 FM'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Controls Bar */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/50 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Tone Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-purple-400" />
              {appLanguage === 'sw' ? 'Mtindo wa Sauti (Tone)' : 'Delivery Tone'}
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
            >
              <option value="energetic">
                {appLanguage === 'sw' ? 'Msisimko & Bashasha (Energetic Commercial)' : 'Energetic Commercial (Upbeat & Vibrant)'}
              </option>
              <option value="authoritative">
                {appLanguage === 'sw' ? 'Uaminifu & Mamlaka (Corporate / Banking)' : 'Authoritative & Trusted (Corporate / Banking)'}
              </option>
              <option value="community">
                {appLanguage === 'sw' ? 'Jamii & Faraja (Community / Health NGO)' : 'Community & Warm (Health / Public Interest)'}
              </option>
              <option value="urgent">
                {appLanguage === 'sw' ? 'Ofa ya Haraka & Mwisho (Limited Promo)' : 'Urgent Call-To-Action (Flash Sale / Promo)'}
              </option>
            </select>
          </div>

          {/* Target Duration */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              {appLanguage === 'sw' ? 'Kipimo cha Muda (Duration)' : 'Target Duration'}
            </label>
            <div className="grid grid-cols-4 gap-1">
              {[15, 30, 45, 60].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setDurationSec(sec)}
                  className={`py-1.5 rounded text-xs font-mono font-medium transition cursor-pointer ${
                    durationSec === sec
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Target Language */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              {appLanguage === 'sw' ? 'Lugha ya Tangazo' : 'Broadcast Language'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBroadcastLanguage('sw')}
                className={`py-1.5 px-3 rounded text-xs font-medium transition cursor-pointer ${
                  broadcastLanguage === 'sw'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Kiswahili Sanifu
              </button>
              <button
                type="button"
                onClick={() => setBroadcastLanguage('en')}
                className={`py-1.5 px-3 rounded text-xs font-medium transition cursor-pointer ${
                  broadcastLanguage === 'en'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                English Broadcast
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body / Comparison */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-200 text-xs flex items-center gap-2">
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Original Draft */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {appLanguage === 'sw' ? 'Draft ya Sasa (Raw Script)' : 'Raw Script Draft'}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {currentScript.trim() ? currentScript.trim().split(/\s+/).length : 0}{' '}
                  {appLanguage === 'sw' ? 'maneno' : 'words'}
                </span>
              </div>
              <div className="flex-1 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-slate-300 text-sm leading-relaxed overflow-y-auto max-h-56 min-h-36 font-sans">
                {currentScript || (
                  <span className="text-slate-600 italic">
                    {appLanguage === 'sw'
                      ? 'Hakuna maneno bado. Andika draft kwanza kwenye editor.'
                      : 'No script text entered yet. Enter a draft in the script box first.'}
                  </span>
                )}
              </div>
            </div>

            {/* Right: AI Rewritten */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {appLanguage === 'sw' ? 'Script Iliyoboreshwa (AI Polish)' : 'AI Polished Script'}
                </span>
                {wordCount > 0 && (
                  <span className="text-[11px] text-purple-300 font-mono">
                    {wordCount} {appLanguage === 'sw' ? 'maneno' : 'words'} (~{Math.round(wordCount / 2.16)}s)
                  </span>
                )}
              </div>
              <div className="flex-1 bg-purple-950/20 p-3.5 rounded-xl border border-purple-800/40 text-slate-100 text-sm leading-relaxed overflow-y-auto max-h-56 min-h-36 font-sans relative">
                {isGenerating ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-xs rounded-xl gap-2">
                    <RefreshCw className="w-6 h-6 text-purple-400 animate-spin" />
                    <span className="text-xs text-purple-300 font-medium">
                      {appLanguage === 'sw'
                        ? 'Gemini inaboresha script kwa mtiririko wa redio...'
                        : 'Gemini is polishing script for radio broadcast cadence...'}
                    </span>
                  </div>
                ) : rewrittenText ? (
                  <p className="whitespace-pre-wrap">{rewrittenText}</p>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500 text-xs">
                    <span>
                      {appLanguage === 'sw'
                        ? 'Bofya kitufe cha "Boresha Script na AI" hapa chini kupata script kamili ya kiutangazaji.'
                        : 'Click "Polish Script with AI" below to generate a presenter-ready broadcast script.'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !currentScript.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium text-xs transition shadow-md hover:shadow-purple-600/30 cursor-pointer"
            >
              {isGenerating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>
                {rewrittenText
                  ? (appLanguage === 'sw' ? 'Tengeneza Tena (Regenerate)' : 'Regenerate')
                  : (appLanguage === 'sw' ? 'Boresha Script na AI' : 'Polish Script with AI')}
              </span>
            </button>

            {rewrittenText && (
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>
                  {copied
                    ? (appLanguage === 'sw' ? 'Imenakiliwa!' : 'Copied!')
                    : (appLanguage === 'sw' ? 'Nakili (Copy)' : 'Copy Script')}
                </span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition font-medium cursor-pointer"
            >
              {t.actions.cancel}
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!rewrittenText}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs transition shadow-md hover:shadow-emerald-600/30 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>
                {appLanguage === 'sw' ? 'Tumia Script Hii (Apply)' : 'Apply to Script Editor'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
