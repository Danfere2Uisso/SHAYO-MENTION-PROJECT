import React, { useState } from 'react';
import { useRadioApp } from '../../context/RadioAppContext';
import {
  Sliders,
  FileText,
  Music,
  Upload,
  Play,
  Pause,
  Plus,
  CheckCircle2,
  Volume2,
  Mic2,
  Sparkles,
  Clock,
} from 'lucide-react';
import { studioAudio } from '../../utils/audioSynth';

export const ProductionDashboard: React.FC = () => {
  const { ads, t, language, studioDarkMode } = useRadioApp();

  const [activeTab, setActiveTab] = useState<'scripts' | 'promos' | 'assets'>('scripts');
  const [playingAssetId, setPlayingAssetId] = useState<string | null>(null);

  // Audio Assets list
  const [audioAssets, setAudioAssets] = useState([
    {
      id: 'asset-1',
      title: 'Radio Kwizera 97.7 Station ID (Sunburst Jingle)',
      type: 'Station Jingle',
      duration: '00:15',
      fileSize: '2.4 MB',
      format: 'WAV 48kHz/24bit Broadcast',
      status: 'Mastered',
    },
    {
      id: 'asset-2',
      title: 'Sauti ya Matumaini Hope Theme (JRS Signature)',
      type: 'Theme Music',
      duration: '00:45',
      fileSize: '7.1 MB',
      format: 'WAV 48kHz/24bit Broadcast',
      status: 'Mastered',
    },
    {
      id: 'asset-3',
      title: 'Mseto Leo Show Intro Beat',
      type: 'Program Sweeper',
      duration: '00:20',
      fileSize: '3.2 MB',
      format: 'MP3 320kbps',
      status: 'Ready',
    },
    {
      id: 'asset-4',
      title: 'Twiga Extra Cement Audio Bed (Swahili)',
      type: 'Commercial Bed',
      duration: '00:45',
      fileSize: '4.8 MB',
      format: 'WAV 48kHz/24bit',
      status: 'Active On Air',
    },
    {
      id: 'asset-5',
      title: 'Vodacom M-Pesa Signature Sonic Tag',
      type: 'Commercial Tag',
      duration: '00:08',
      fileSize: '1.1 MB',
      format: 'WAV 48kHz/24bit',
      status: 'Active On Air',
    },
  ]);

  // Station Promos
  const [stationPromos, setStationPromos] = useState([
    {
      id: 'promo-1',
      title: 'Asubuhi Njema Morning Wake-Up Campaign',
      targetShow: 'Asubuhi Njema (06:00 - 09:00)',
      frequency: '3x daily',
      producer: 'David Mlay',
      status: 'Active',
    },
    {
      id: 'promo-2',
      title: 'Nje ya Dimba Sports Weekend Special',
      targetShow: 'Nje ya Dimba (09:00 - 10:00)',
      frequency: '2x daily',
      producer: 'David Mlay',
      status: 'Active',
    },
    {
      id: 'promo-3',
      title: 'Radio Kwizera Mobile App & Web Stream Promo',
      targetShow: 'All Daytime Shows',
      frequency: 'Hourly',
      producer: 'David Mlay',
      status: 'In Production',
    },
  ]);

  // Audio Playback simulation
  const togglePlayAudio = (id: string) => {
    if (playingAssetId === id) {
      setPlayingAssetId(null);
    } else {
      setPlayingAssetId(id);
      studioAudio.playOnAirBeep();
      setTimeout(() => setPlayingAssetId(null), 4000);
    }
  };

  return (
    <div className={`p-4 sm:p-6 max-w-7xl mx-auto space-y-6 ${studioDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-600 text-white">
              {t.roles.production_officer}
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              Radio Kwizera Studios • Audio Production & Jingles
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Production & Audio Assets Suite
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {language === 'sw'
              ? 'Kupakia hati za matangazo, maelekezo ya sauti, jingles, na maktaba ya sauti.'
              : 'Script management with voiceover instructions, broadcast promo rotations, and sound library.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('scripts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'scripts' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ad Scripts ({ads.length})
          </button>
          <button
            onClick={() => setActiveTab('promos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'promos' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Promos & Jingles
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'assets' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Audio Vault ({audioAssets.length})
          </button>
        </div>
      </div>

      {/* TAB 1: AD SCRIPTS & VOICEOVER DIRECTIONS */}
      {activeTab === 'scripts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Commercial Scripts in Circulation
            </span>
            <span className="text-xs text-amber-400 font-mono">
              Broadcasting Standards Compliant (TCRA/RK)
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-black text-base text-white">{ad.clientName}</h2>
                    <span className="text-xs text-amber-400 font-bold">
                      {ad.campaignTitle}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-950 px-2 py-1 rounded text-slate-300 border border-slate-800">
                    {ad.durationSec}s • {ad.scheduledTime}
                  </span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-serif text-xs text-slate-300 leading-relaxed">
                  {ad.scriptText}
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                  <span className="text-slate-400">
                    Voiceover: <strong>Natural Swahili, Energetic & Trustworthy</strong>
                  </span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PROMOS & JINGLES SCHEDULER */}
      {activeTab === 'promos' && (
        <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="font-black text-base text-white flex items-center gap-2">
              <Music className="w-4 h-4 text-amber-400" />
              Radio Kwizera 2026 On-Air Promos
            </h2>
            <button className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule New Promo</span>
            </button>
          </div>

          <div className="space-y-3">
            {stationPromos.map((promo) => (
              <div
                key={promo.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="font-black text-sm text-white">{promo.title}</div>
                  <div className="text-xs text-slate-400">
                    Target: {promo.targetShow} • Rotation: {promo.frequency}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded">
                    {promo.status}
                  </span>
                  <button
                    onClick={() => togglePlayAudio(promo.id)}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700"
                    title="Play Promo Preview"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AUDIO VAULT */}
      {activeTab === 'assets' && (
        <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="font-black text-base text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-400" />
              Master Broadcast Audio Assets (Studio Cloud)
            </h2>
            <button className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Master Audio (.WAV)</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {audioAssets.map((asset) => {
              const isPlaying = playingAssetId === asset.id;
              return (
                <div
                  key={asset.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => togglePlayAudio(asset.id)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isPlaying
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700'
                      }`}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-white truncate">{asset.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {asset.format} • {asset.duration} • {asset.fileSize}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 shrink-0">
                    {asset.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
