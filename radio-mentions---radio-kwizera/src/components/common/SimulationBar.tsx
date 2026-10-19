import React from 'react';
import { useRadioApp } from '../../context/RadioAppContext';
import {
  Sparkles,
  Radio,
  Send,
  Bell,
  CheckCircle2,
  ShieldCheck,
  WifiOff,
  Globe,
  X,
  Play,
} from 'lucide-react';

interface SimulationBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimulationBar: React.FC<SimulationBarProps> = ({ isOpen, onClose }) => {
  const { runSimulationFlow, t, language, studioDarkMode } = useRadioApp();

  if (!isOpen) return null;

  const simulationSteps = [
    {
      num: 1,
      title: language === 'sw' ? '1. Afisa Masoko Achapishe Tangazo' : '1. Marketing Officer Publish Flow',
      desc: language === 'sw'
        ? 'Ingia kama Afisa Masoko -> Twiga Cement -> Mseto Leo saa 17:00 -> Chapisha.'
        : 'Marketing Officer schedules Twiga Cement on Mseto Leo at 17:00 and publishes.',
      icon: Send,
      color: 'from-purple-600 to-indigo-600',
    },
    {
      num: 2,
      title: language === 'sw' ? '2. Taarifa ya Moja kwa Moja Studioni' : '2. Real-Time Studio Notification',
      desc: language === 'sw'
        ? 'Kishikwambi cha studio kinapokea tahadhari ya papo hapo bila ku-refresh.'
        : 'Studio tablet receives instant notification and updates timeline automatically.',
      icon: Bell,
      color: 'from-amber-600 to-red-600',
    },
    {
      num: 3,
      title: language === 'sw' ? '3. Mtangazaji Asaini Tangazo' : '3. Presenter Sign-off Flow',
      desc: language === 'sw'
        ? 'Mtangazaji afungua Mseto Leo -> Kadi inapiga mweko -> Teleza kusaini -> Mweko wa kijani.'
        : 'Presenter opens Mseto Leo -> Pulsing ad -> Swipes to sign -> Instant green flash.',
      icon: Radio,
      color: 'from-emerald-600 to-teal-600',
    },
    {
      num: 4,
      title: language === 'sw' ? '4. Ufuatiliaji wa Msimamizi Mkuu' : '4. Admin Live Monitoring & Audit',
      desc: language === 'sw'
        ? 'Msimamizi Mkuu aona hewani mara moja & kumbukumbu ya sekunde iandikwe.'
        : 'Admin watches live studio feed & second-by-second audit trail updates.',
      icon: ShieldCheck,
      color: 'from-rose-600 to-pink-600',
    },
    {
      num: 5,
      title: language === 'sw' ? '5. Mtiririko wa Bila Mtandao' : '5. Offline Sync Flow (Local Queue)',
      desc: language === 'sw'
        ? 'Zima mtandao -> Saini tangazo -> Washa mtandao -> Inalandanishwa -> Imelandanishwa.'
        : 'Go offline -> Sign ad -> Restore network -> Auto-sync to cloud.',
      icon: WifiOff,
      color: 'from-yellow-600 to-amber-700',
    },
    {
      num: 6,
      title: language === 'sw' ? '6. Kubadili Lugha (Kiswahili / Kiingereza)' : '6. Language Switcher Flow',
      desc: language === 'sw'
        ? 'Badili maneno yote ya mfumo kwa mguso mmoja (SW <-> EN).'
        : 'Toggle between Swahili and English across all UI modules instantly.',
      icon: Globe,
      color: 'from-blue-600 to-cyan-600',
    },
  ];

  return (
    <aside
      id="simulation-drawer"
      aria-label="Simulation Flows"
      className={`border-b transition-all duration-300 ${
        studioDarkMode
          ? 'bg-slate-900/95 border-purple-900/40 text-slate-100'
          : 'bg-indigo-50/95 border-indigo-200 text-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-gradient-to-r from-red-600 to-purple-600 text-white">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-xs sm:text-sm font-black tracking-wide uppercase">
              {t.simulation.title} (6 Core Scenarios)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md"
            title="Close Simulation Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {simulationSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all hover:scale-[1.01] ${
                  studioDarkMode
                    ? 'bg-slate-950/60 border-slate-800 hover:border-purple-600/50'
                    : 'bg-white border-indigo-100 hover:border-indigo-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs flex items-center gap-1.5 text-purple-400">
                      <Icon className="w-3.5 h-3.5 text-purple-400" />
                      {step.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                    {step.desc}
                  </p>
                </div>
                <button
                  onClick={() => runSimulationFlow(step.num)}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold text-white bg-gradient-to-r ${step.color} hover:opacity-90 flex items-center justify-center gap-1.5 shadow-xs`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{t.simulation.runFlow} #{step.num}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
