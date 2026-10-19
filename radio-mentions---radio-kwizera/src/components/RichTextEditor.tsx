import React from 'react';
import { Bold, Italic, Underline, Mic, Clock, Sparkles, AlertCircle, Quote } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  onOpenAiRewriter?: () => void;
  targetDurationSec?: number;
  placeholder?: string;
  disabled?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  onOpenAiRewriter,
  targetDurationSec = 45,
  placeholder = 'Andika nakala ya tangazo la kusomwa na mtangazaji...',
  disabled = false,
}) => {
  // Stats
  const characters = value.length;
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  // Radio standard: ~130 words per minute (~2.16 words/sec)
  const estimatedSeconds = Math.round(words / 2.16);

  // Quick insertion of broadcast cue tags
  const insertTag = (tag: string) => {
    const textarea = document.getElementById('mention-script-textarea') as HTMLTextAreaElement | null;
    if (!textarea) {
      onChange(value ? `${value} ${tag}` : tag);
      return;
    }
    const start = textarea.selectionStart || value.length;
    const end = textarea.selectionEnd || value.length;
    const textBefore = value.substring(0, start);
    const textAfter = value.substring(end);
    const updated = `${textBefore}${tag}${textAfter}`;
    onChange(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 50);
  };

  const wrapSelection = (wrapper: string) => {
    const textarea = document.getElementById('mention-script-textarea') as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const selected = value.substring(start, end);
    if (!selected) {
      insertTag(wrapper);
      return;
    }
    const textBefore = value.substring(0, start);
    const textAfter = value.substring(end);
    const updated = `${textBefore}[${wrapper.replace(/[\[\]]/g, '')}: ${selected}]${textAfter}`;
    onChange(updated);
  };

  const isOverTargetTime = targetDurationSec > 0 && estimatedSeconds > targetDurationSec + 5;
  const isUnderTargetTime = targetDurationSec > 0 && estimatedSeconds < targetDurationSec - 10 && words > 5;

  return (
    <div className="border border-slate-700 rounded-xl bg-slate-900/90 overflow-hidden shadow-inner flex flex-col">
      {/* Editor Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-800/90 border-b border-slate-700/80">
        {/* Style & Cue Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => wrapSelection('[Msisitizo]')}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs flex items-center gap-1"
            title="Weka Msisitizo (Bold/Emphasis)"
          >
            <Bold className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Msisitizo</span>
          </button>

          <button
            type="button"
            onClick={() => wrapSelection('[Sauti ya Chini]')}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs flex items-center gap-1"
            title="Sauti ya Utulivu (Soft/Italic)"
          >
            <Italic className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Utulivu</span>
          </button>

          <span className="w-px h-4 bg-slate-700 mx-1" />

          {/* Quick Presenter Audio Cues */}
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => insertTag('[Paza Sauti] ')}
              className="px-2 py-0.5 rounded bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-700/60 text-[11px] font-mono transition"
              title="Cues presenter to project voice"
            >
              [Paza Sauti]
            </button>
            <button
              type="button"
              onClick={() => insertTag('[Sisitiza Namba] ')}
              className="px-2 py-0.5 rounded bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 text-[11px] font-mono transition"
              title="Cues presenter to repeat phone number clearly"
            >
              [Sisitiza Namba]
            </button>
            <button
              type="button"
              onClick={() => insertTag('[Pumzika sekunde 1] ')}
              className="px-2 py-0.5 rounded bg-blue-950/60 hover:bg-blue-900 text-blue-300 border border-blue-700/60 text-[11px] font-mono transition"
              title="1 second dramatic pause"
            >
              [Pumzika 1s]
            </button>
            <button
              type="button"
              onClick={() => insertTag('[Ofa Maalum] ')}
              className="px-2 py-0.5 rounded bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-700/60 text-[11px] font-mono transition"
            >
              [Ofa Maalum]
            </button>
          </div>
        </div>

        {/* AI Mention Rewriter Trigger Button */}
        {onOpenAiRewriter && (
          <button
            type="button"
            onClick={onOpenAiRewriter}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs shadow-md hover:shadow-purple-500/20 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
            <span>AI Script Polisher (Gemini)</span>
          </button>
        )}
      </div>

      {/* Main Script Textarea */}
      <div className="relative p-3">
        <textarea
          id="mention-script-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={6}
          className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none resize-y font-sans text-sm md:text-base leading-relaxed"
        />
      </div>

      {/* Real-Time Telemetry & Word Count Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-slate-950/90 border-t border-slate-800 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="text-slate-200 font-bold">{words}</span> maneno (words)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-slate-400">{characters}</span> herufi (chars)
          </span>
          <span
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded ${
              isOverTargetTime
                ? 'bg-red-950/80 text-red-300 border border-red-700 font-semibold'
                : isUnderTargetTime
                ? 'bg-amber-950/80 text-amber-300 border border-amber-700'
                : 'bg-slate-800 text-emerald-400'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Muda Hewani: ~{estimatedSeconds}s / Lengo: {targetDurationSec}s
          </span>
        </div>

        {isOverTargetTime && (
          <div className="flex items-center gap-1 text-red-400 text-[11px]">
            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>Script ndefu sana kwa tangazo la {targetDurationSec}s! Tumia AI kupunguza maneno.</span>
          </div>
        )}
      </div>
    </div>
  );
};
