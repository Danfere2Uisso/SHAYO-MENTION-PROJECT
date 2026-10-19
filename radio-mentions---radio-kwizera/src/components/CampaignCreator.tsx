import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle,
  FileText,
  Radio,
  Sliders,
  Download,
  Bookmark,
  Edit3,
  RotateCw,
  Repeat,
  Check,
  Layers,
  ArrowRight,
  Sun,
  ShieldCheck,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';
import { useRadioApp } from '../context/RadioAppContext';
import { Client, ClientTier, AdCampaign, ScheduledSpotItem, CampaignTimeSlotConfig, ScheduleTemplate } from '../types';
import { RichTextEditor } from './RichTextEditor';
import { AiMentionRewriter } from './AiMentionRewriter';
import { AdPlacementModal } from './AdPlacementModal';
import { EditableWordSchedulePreview } from './EditableWordSchedulePreview';
import { generateCampaignSpots, exportSpotsToCSV, exportSpotsToWord, exportSpotsToICS } from '../utils';

interface CampaignCreatorProps {
  initialClient?: Client | null;
  onCampaignCreated?: (campaign: AdCampaign) => void;
}

const DEFAULT_WEEKDAY_SLOTS = [
  '07:30 - 07:45',
  '13:15 - 13:30',
  '17:15 - 17:30',
];

const DEFAULT_SATURDAY_SLOTS = [
  '09:30 - 10:00',
  '14:30 - 15:00',
];

const DEFAULT_SUNDAY_SLOTS = [
  '10:30 - 11:00',
  '16:15 - 16:45',
];

const DAY_NAMES_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_NAMES_SW = ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'];

export const CampaignCreator: React.FC<CampaignCreatorProps> = ({
  initialClient,
  onCampaignCreated,
}) => {
  const { clients, addCampaign, addClient, ads, language, t } = useRadioApp();

  // Mode: 'builder' | 'word_preview'
  const [viewMode, setViewMode] = useState<'builder' | 'word_preview'>('builder');

  // Selected Client
  const [selectedClientId, setSelectedClientId] = useState<string>(initialClient?.id || '');

  useEffect(() => {
    if (initialClient) {
      setSelectedClientId(initialClient.id);
    } else if (clients.length > 0 && !selectedClientId) {
      setSelectedClientId(clients[0].id);
    }
  }, [initialClient, clients]);

  const activeClient = useMemo(() => {
    return clients.find((c) => c.id === selectedClientId) || clients[0] || null;
  }, [clients, selectedClientId]);

  // Campaign Form State
  const [campaignName, setCampaignName] = useState('');
  const [adType, setAdType] = useState<'Mention' | 'Spot'>('Mention');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  // Physical custom duration in days
  const [durationDays, setDurationDays] = useState<number>(31);
  const [script, setScript] = useState('');

  // Base Time Slots
  const [customSlots, setCustomSlots] = useState<string[]>([...DEFAULT_WEEKDAY_SLOTS]);
  const [newSlotInput, setNewSlotInput] = useState('');
  const [rotationPattern, setRotationPattern] = useState<'cyclic' | 'daily_fixed' | 'weekdays_only' | 'weekend_override' | 'day_jumping'>('cyclic');

  // ==========================================
  // ADVANCED TRAFFIC RULES & SCHEDULING OPTIONS
  // ==========================================
  // 1. Smart Day Jumping (Auto-distribute spots evenly over campaign duration)
  const [smartDayJumping, setSmartDayJumping] = useState<boolean>(false);
  const [totalSpotsTarget, setTotalSpotsTarget] = useState<number>(15);

  // 2. Separate Weekend Time Slots (Saturdays & Sundays)
  const [separateWeekendTimes, setSeparateWeekendTimes] = useState<boolean>(false);
  const [saturdaySlots, setSaturdaySlots] = useState<string[]>([...DEFAULT_SATURDAY_SLOTS]);
  const [sundaySlots, setSundaySlots] = useState<string[]>([...DEFAULT_SUNDAY_SLOTS]);
  const [newSatSlotInput, setNewSatSlotInput] = useState('');
  const [newSunSlotInput, setNewSunSlotInput] = useState('');

  // 3. Cyclic Time Loop Rotation
  const [cyclicRotation, setCyclicRotation] = useState<boolean>(true);

  // 4. First Day Slot Timing Override
  const [firstDayOverride, setFirstDayOverride] = useState<boolean>(false);
  const [firstDayHourSelection, setFirstDayHourSelection] = useState<'all' | 'first_hour_only' | 'second_hour_only' | 'custom'>('second_hour_only');
  const [firstDayCustomSlots, setFirstDayCustomSlots] = useState<string[]>(['17:15 - 17:30']);

  // 5. Specific Day-of-Week Filter (Day Specific Mentions: e.g. Tuesdays only, Saturdays only, Mon-Wed-Fri)
  const [enableDayFilter, setEnableDayFilter] = useState<boolean>(false);
  const [dayOfWeekFilter, setDayOfWeekFilter] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]); // 0=Sun, 1=Mon...

  // 6. Variable Days Mode (Custom Mentions & Timings Per Day of the Week)
  const [variableDaysMode, setVariableDaysMode] = useState<boolean>(false);
  const [variableDayConfig, setVariableDayConfig] = useState<{
    [dayOfWeek: number]: { enabled: boolean; slots: string[] };
  }>({
    1: { enabled: true, slots: ['07:30 - 07:45', '17:15 - 17:30'] }, // Mon: 2
    2: { enabled: true, slots: ['13:15 - 13:30'] }, // Tue: 1
    3: { enabled: true, slots: ['07:30 - 07:45', '13:15 - 13:30', '17:15 - 17:30'] }, // Wed: 3
    4: { enabled: true, slots: ['13:15 - 13:30'] }, // Thu: 1
    5: { enabled: true, slots: ['07:30 - 07:45', '11:00 - 11:15', '13:15 - 13:30', '17:15 - 17:30', '20:15 - 20:30'] }, // Fri: 5
    6: { enabled: true, slots: ['09:30 - 10:00', '12:00 - 12:15', '14:30 - 15:00', '17:30 - 17:45', '21:00 - 21:15'] }, // Sat: 5
    0: { enabled: true, slots: ['10:30 - 11:00', '16:15 - 16:45'] }, // Sun: 2
  });

  // ==========================================
  // TEMPLATES MANAGEMENT
  // ==========================================
  const [savedTemplates, setSavedTemplates] = useState<ScheduleTemplate[]>(() => {
    try {
      const stored = localStorage.getItem('kwizera_schedule_templates');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    // Default preset templates
    return [
      {
        id: 'template-31day-jumping',
        name: '31-Day Smart Day Jumping (15 Spots Even)',
        description: 'Auto-distribute 15 spots spaced evenly across a 31-day month with cyclic rotation',
        createdAt: new Date().toISOString(),
        durationDays: 31,
        customSlots: ['07:30 - 07:45', '13:15 - 13:30', '17:15 - 17:30'],
        rotationPattern: 'day_jumping',
        timeSlotConfig: {
          smartDayJumping: true,
          totalSpotsTarget: 15,
          cyclicRotation: true,
        },
      },
      {
        id: 'template-weekend-heavy',
        name: 'Weekend Heavy (Fri & Sat 5-Spots)',
        description: 'Variable days mode featuring 5 mentions on Fridays and Saturdays',
        createdAt: new Date().toISOString(),
        durationDays: 14,
        customSlots: ['07:30 - 07:45', '13:15 - 13:30', '17:15 - 17:30'],
        rotationPattern: 'cyclic',
        timeSlotConfig: {
          variableDaysMode: true,
          separateWeekendTimes: true,
          saturdaySlots: ['09:30 - 10:00', '12:00 - 12:15', '14:30 - 15:00', '17:30 - 17:45', '21:00 - 21:15'],
          sundaySlots: ['10:30 - 11:00', '16:15 - 16:45'],
        },
      },
      {
        id: 'template-tuesday-saturday',
        name: 'Specific Days Only (Tuesdays & Saturdays)',
        description: 'Restricts mentions strictly to Tuesdays and Saturdays throughout the campaign',
        createdAt: new Date().toISOString(),
        durationDays: 30,
        customSlots: ['07:30 - 07:45', '17:15 - 17:30'],
        rotationPattern: 'cyclic',
        timeSlotConfig: {
          dayOfWeekFilter: [2, 6], // Tue, Sat
          cyclicRotation: true,
        },
      },
    ];
  });

  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateNameInput, setTemplateNameInput] = useState('');
  const [templateSavedAlert, setTemplateSavedAlert] = useState(false);
  const [draftSavedBanner, setDraftSavedBanner] = useState(false);

  // Quick Client Creation Modal
  const [showQuickClientModal, setShowQuickClientModal] = useState(false);
  const [quickClientName, setQuickClientName] = useState('');
  const [quickCategory, setQuickCategory] = useState('Telecommunications');
  const [quickTier, setQuickTier] = useState<ClientTier>('B');
  const [quickContact, setQuickContact] = useState('');
  const [quickPhone, setQuickPhone] = useState('');

  // Modals
  const [isAiRewriterOpen, setIsAiRewriterOpen] = useState(false);
  const [isPlacementModalOpen, setIsPlacementModalOpen] = useState(false);

  // Success Feedback state
  const [createdSuccess, setCreatedSuccess] = useState<AdCampaign | null>(null);

  // Calculated End Date
  const calculatedEndDate = useMemo(() => {
    if (!startDate) return '';
    const d = new Date(startDate + 'T00:00:00');
    d.setDate(d.getDate() + Math.max(1, durationDays) - 1);
    return d.toISOString().split('T')[0];
  }, [startDate, durationDays]);

  // First day slots computed
  const effectiveFirstDaySlots = useMemo(() => {
    if (!firstDayOverride) return customSlots;
    if (firstDayHourSelection === 'first_hour_only') {
      return customSlots.slice(0, 1);
    }
    if (firstDayHourSelection === 'second_hour_only') {
      return customSlots.length > 1 ? [customSlots[1]] : customSlots;
    }
    return firstDayCustomSlots.length > 0 ? firstDayCustomSlots : customSlots;
  }, [firstDayOverride, firstDayHourSelection, customSlots, firstDayCustomSlots]);

  // Compile full TimeSlotConfig
  const currentConfig: CampaignTimeSlotConfig = useMemo(() => {
    return {
      customSlots,
      rotationPattern,
      smartDayJumping,
      totalSpotsTarget: smartDayJumping ? totalSpotsTarget : undefined,
      separateWeekendTimes,
      saturdaySlots: separateWeekendTimes ? saturdaySlots : undefined,
      sundaySlots: separateWeekendTimes ? sundaySlots : undefined,
      cyclicRotation,
      firstDayOverride,
      firstDaySlots: firstDayOverride ? effectiveFirstDaySlots : undefined,
      dayOfWeekFilter: enableDayFilter ? dayOfWeekFilter : undefined,
      variableDaysMode,
      variableDayConfig: variableDaysMode ? variableDayConfig : undefined,
    };
  }, [
    customSlots,
    rotationPattern,
    smartDayJumping,
    totalSpotsTarget,
    separateWeekendTimes,
    saturdaySlots,
    sundaySlots,
    cyclicRotation,
    firstDayOverride,
    effectiveFirstDaySlots,
    enableDayFilter,
    dayOfWeekFilter,
    variableDaysMode,
    variableDayConfig,
  ]);

  // Preview generated spots live using advanced rules
  const previewSpots = useMemo(() => {
    if (!campaignName.trim() || !activeClient || customSlots.length === 0) return [];
    return generateCampaignSpots(
      'preview-temp',
      campaignName,
      activeClient.name,
      adType,
      startDate,
      durationDays,
      currentConfig
    );
  }, [
    campaignName,
    activeClient,
    adType,
    startDate,
    durationDays,
    currentConfig,
  ]);

  // Restore Draft if exists
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('kwizera_campaign_active_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.campaignName && !campaignName) {
          setCampaignName(parsed.campaignName);
        }
        if (parsed.script && !script) {
          setScript(parsed.script);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save as template handler
  const handleSaveAsTemplate = () => {
    if (!templateNameInput.trim()) return;
    const newTemplate: ScheduleTemplate = {
      id: `template-${Date.now()}`,
      name: templateNameInput.trim(),
      description: `${durationDays} ${language === 'sw' ? 'Siku' : 'Days'} • ${customSlots.length} slots • ${rotationPattern}`,
      createdAt: new Date().toISOString(),
      durationDays,
      customSlots,
      rotationPattern,
      timeSlotConfig: currentConfig,
    };
    const updated = [newTemplate, ...savedTemplates];
    setSavedTemplates(updated);
    try {
      localStorage.setItem('kwizera_schedule_templates', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setTemplateNameInput('');
    setShowSaveTemplateModal(false);
    setTemplateSavedAlert(true);
    setTimeout(() => setTemplateSavedAlert(false), 3500);
  };

  // Load a template
  const handleLoadTemplate = (template: ScheduleTemplate) => {
    setDurationDays(template.durationDays || 31);
    if (template.customSlots && template.customSlots.length > 0) {
      setCustomSlots(template.customSlots);
    }
    if (template.rotationPattern) {
      setRotationPattern(template.rotationPattern as any);
    }
    if (template.timeSlotConfig) {
      const c = template.timeSlotConfig;
      if (c.smartDayJumping !== undefined) {
        setSmartDayJumping(!!c.smartDayJumping);
        if (c.totalSpotsTarget) setTotalSpotsTarget(c.totalSpotsTarget);
      }
      if (c.separateWeekendTimes !== undefined) {
        setSeparateWeekendTimes(!!c.separateWeekendTimes);
        if (c.saturdaySlots) setSaturdaySlots(c.saturdaySlots);
        if (c.sundaySlots) setSundaySlots(c.sundaySlots);
      }
      if (c.cyclicRotation !== undefined) {
        setCyclicRotation(!!c.cyclicRotation);
      }
      if (c.firstDayOverride !== undefined) {
        setFirstDayOverride(!!c.firstDayOverride);
        if (c.firstDaySlots) setFirstDayCustomSlots(c.firstDaySlots);
      }
      if (c.dayOfWeekFilter && c.dayOfWeekFilter.length > 0) {
        setEnableDayFilter(true);
        setDayOfWeekFilter(c.dayOfWeekFilter);
      }
      if (c.variableDaysMode !== undefined) {
        setVariableDaysMode(!!c.variableDaysMode);
        if (c.variableDayConfig) setVariableDayConfig(c.variableDayConfig);
      }
    }
  };

  // Add slot helper
  const handleAddSlot = () => {
    if (!newSlotInput.trim()) return;
    if (!customSlots.includes(newSlotInput.trim())) {
      setCustomSlots([...customSlots, newSlotInput.trim()]);
    }
    setNewSlotInput('');
  };

  const handleRemoveSlot = (slot: string) => {
    setCustomSlots(customSlots.filter((s) => s !== slot));
  };

  // Add Saturday slot
  const handleAddSatSlot = () => {
    if (!newSatSlotInput.trim()) return;
    if (!saturdaySlots.includes(newSatSlotInput.trim())) {
      setSaturdaySlots([...saturdaySlots, newSatSlotInput.trim()]);
    }
    setNewSatSlotInput('');
  };

  // Add Sunday slot
  const handleAddSunSlot = () => {
    if (!newSunSlotInput.trim()) return;
    if (!sundaySlots.includes(newSunSlotInput.trim())) {
      setSundaySlots([...sundaySlots, newSunSlotInput.trim()]);
    }
    setNewSunSlotInput('');
  };

  // Quick save new client
  const handleSaveQuickClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickClientName.trim()) return;

    const newC = addClient({
      name: quickClientName,
      category: quickCategory,
      tier: quickTier,
      billingStatus: 'pending',
      contactPerson: quickContact || 'Commercial Contact',
      phone: quickPhone || '+255 754 000 000',
      email: 'contact@client.co.tz',
      rateCardCode: 'STD-2026',
    });

    setSelectedClientId(newC.id);
    setShowQuickClientModal(false);
    setQuickClientName('');
    setQuickContact('');
    setQuickPhone('');
  };

  // Save as Draft
  const handleSaveDraft = () => {
    const draftPayload = {
      campaignName,
      clientName: activeClient?.name || '',
      adType,
      startDate,
      durationDays,
      script,
      customSlots,
      currentConfig,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem('kwizera_campaign_active_draft', JSON.stringify(draftPayload));
      setDraftSavedBanner(true);
      setTimeout(() => setDraftSavedBanner(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle Day of week filter
  const toggleDayFilter = (dayIndex: number) => {
    if (dayOfWeekFilter.includes(dayIndex)) {
      if (dayOfWeekFilter.length > 1) {
        setDayOfWeekFilter(dayOfWeekFilter.filter((d) => d !== dayIndex));
      }
    } else {
      setDayOfWeekFilter([...dayOfWeekFilter, dayIndex].sort((a, b) => a - b));
    }
  };

  // Submit and create campaign
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClient) {
      alert(language === 'sw' ? 'Tafadhali chagua au sajili mteja kwanza.' : 'Please select or register a client first.');
      return;
    }
    if (!campaignName.trim()) {
      alert(language === 'sw' ? 'Tafadhali weka jina la kampeni.' : 'Please enter campaign title.');
      return;
    }
    if (!script.trim()) {
      alert(language === 'sw' ? 'Tafadhali andika nakala/script ya tangazo.' : 'Please enter broadcast script text.');
      return;
    }
    if (customSlots.length === 0) {
      alert(language === 'sw' ? 'Tafadhali weka angalau nafasi moja ya muda wa kuruka hewani.' : 'Please enter at least one time slot.');
      return;
    }

    const created = addCampaign({
      clientId: activeClient.id,
      clientName: activeClient.name,
      name: campaignName,
      adType,
      startDate,
      durationDays,
      status: 'active',
      totalSlots: previewSpots.length,
      script,
      timeSlotConfig: currentConfig,
      scheduledSpots: previewSpots,
    });

    try {
      localStorage.removeItem('kwizera_campaign_active_draft');
    } catch (e) {
      console.error(e);
    }

    setCreatedSuccess(created);
    if (onCampaignCreated) {
      onCampaignCreated(created);
    }
  };

  // Publish from Word preview
  const handlePublishFromWordPreview = (finalSpots: ScheduledSpotItem[], finalScript: string) => {
    if (!activeClient) return;
    const created = addCampaign({
      clientId: activeClient.id,
      clientName: activeClient.name,
      name: campaignName,
      adType,
      startDate,
      durationDays,
      status: 'active',
      totalSlots: finalSpots.length,
      script: finalScript,
      timeSlotConfig: currentConfig,
      scheduledSpots: finalSpots,
    });

    try {
      localStorage.removeItem('kwizera_campaign_active_draft');
    } catch (e) {
      console.error(e);
    }

    setCreatedSuccess(created);
    if (onCampaignCreated) {
      onCampaignCreated(created);
    }
    setViewMode('builder');
  };

  const handleResetForNew = () => {
    setCreatedSuccess(null);
    setCampaignName('');
    setScript('');
  };

  // SUCCESS SCREEN
  if (createdSuccess) {
    return (
      <div className="bg-slate-900 border border-emerald-700/80 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {language === 'sw' ? 'Kampeni Imeratibiwa Kikamilifu!' : 'Campaign Scheduled Successfully!'}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {language === 'sw' ? (
                <>
                  Kampeni ya <strong className="text-emerald-300">{createdSuccess.name}</strong> kwa mteja{' '}
                  <strong className="text-white">{createdSuccess.clientName}</strong> imeunganishwa moja kwa moja kwenye
                  Studio Tablet ya watangazaji.
                </>
              ) : (
                <>
                  Campaign <strong className="text-emerald-300">{createdSuccess.name}</strong> for client{' '}
                  <strong className="text-white">{createdSuccess.clientName}</strong> is published directly to
                  the Studio Presenter Tablet.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Campaign Metrics (Prices removed - pure traffic metrics) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div>
            <div className="text-[11px] text-slate-400">{language === 'sw' ? 'Jumla ya Spots' : 'Total Spots'}</div>
            <div className="text-xl font-bold text-white font-mono">{createdSuccess.scheduledSpots.length}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">{language === 'sw' ? 'Muda wa Kampeni' : 'Duration'}</div>
            <div className="text-xl font-bold text-blue-400 font-mono">
              {createdSuccess.durationDays} {language === 'sw' ? 'Siku' : 'Days'}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">{language === 'sw' ? 'Tarehe ya Kuanza' : 'Start Date'}</div>
            <div className="text-sm font-bold text-slate-200 font-mono mt-1">{createdSuccess.startDate}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">{language === 'sw' ? 'Tarehe ya Mwisho' : 'End Date'}</div>
            <div className="text-sm font-bold text-emerald-400 font-mono mt-1">{createdSuccess.endDate}</div>
          </div>
        </div>

        {/* Quick Export Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/80 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
            <Download className="w-4 h-4 text-blue-400" />
            {language === 'sw' ? 'Hamisha Ratiba Rasmi:' : 'Export Official Schedule:'}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => exportSpotsToWord(createdSuccess.scheduledSpots, createdSuccess.name, createdSuccess.clientName, createdSuccess.script)}
              className="px-3.5 py-1.5 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700 text-xs font-mono transition flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              Word (.doc)
            </button>
            <button
              type="button"
              onClick={() => exportSpotsToCSV(createdSuccess.scheduledSpots, createdSuccess.name)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition"
            >
              CSV (Excel)
            </button>
            <button
              type="button"
              onClick={() => exportSpotsToICS(createdSuccess.scheduledSpots, createdSuccess.name)}
              className="px-3.5 py-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700 text-xs font-mono transition"
            >
              Kalenda (.ics)
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleResetForNew}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
          >
            + {language === 'sw' ? 'Tengeneza Kampeni Nyingine Mpya' : 'Create Another Campaign'}
          </button>
        </div>
      </div>
    );
  }

  // IF IN WORD PREVIEW MODE
  if (viewMode === 'word_preview') {
    return (
      <EditableWordSchedulePreview
        campaignName={campaignName || (language === 'sw' ? 'Kampeni Mpya 2026' : 'New Campaign 2026')}
        clientName={activeClient?.name || 'Mteja'}
        adType={adType}
        startDate={startDate}
        durationDays={durationDays}
        script={script}
        spots={previewSpots}
        onBackToBuilder={() => setViewMode('builder')}
        onPublishCampaign={handlePublishFromWordPreview}
        onSaveDraft={handleSaveDraft}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: Templates & Draft Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-sm">
        {/* Left: Templates Quick Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            {t.campaign.loadTemplate}:
          </span>
          <select
            onChange={(e) => {
              const found = savedTemplates.find((tpl) => tpl.id === e.target.value);
              if (found) handleLoadTemplate(found);
            }}
            className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
            defaultValue=""
          >
            <option value="" disabled>
              {language === 'sw' ? '--- Chagua Kiolezo Kilichohifadhiwa ---' : '--- Choose Saved Template ---'}
            </option>
            {savedTemplates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name} ({tpl.durationDays}d)
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowSaveTemplateModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            title={t.campaign.saveAsTemplate}
          >
            <Plus className="w-3 h-3 text-emerald-400" />
            <span>{t.campaign.saveAsTemplate}</span>
          </button>
        </div>

        {/* Right: Word-like preview toggle & Draft */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Bookmark className="w-3.5 h-3.5 text-blue-400" />
            <span>{t.campaign.saveDraft}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('word_preview')}
            disabled={previewSpots.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-900/70 hover:bg-blue-800 text-blue-200 disabled:opacity-50 text-xs font-bold border border-blue-700 transition cursor-pointer shadow-sm"
            title={language === 'sw' ? 'Fungua mwonekano unaoweza kuhaririwa kama Word' : 'Open editable Word-like document preview'}
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-300" />
            <span>{t.campaign.openWordEditor}</span>
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {draftSavedBanner && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{t.campaign.draftSaved}</span>
        </div>
      )}

      {templateSavedAlert && (
        <div className="p-3 bg-blue-950/80 border border-blue-700 text-blue-300 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-blue-400" />
          <span>{t.campaign.templateSavedSuccess}</span>
        </div>
      )}

      <form onSubmit={handleCreateCampaign} className="space-y-6">
        {/* Section 1: Client Selection & Campaign Basics */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-500" />
              {t.campaign.clientSection}
            </h3>
            <button
              type="button"
              onClick={() => setShowQuickClientModal(true)}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              {t.campaign.newClientQuick}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Client Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.campaign.selectClient} *
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.category} • Tier {c.tier || 'B'})
                  </option>
                ))}
              </select>
              {activeClient && (
                <div className="mt-1.5 text-[11px] text-slate-400 flex items-center gap-2">
                  <span>{language === 'sw' ? 'Mawasiliano:' : 'Contact:'} {activeClient.contactPerson}</span>
                  <span>•</span>
                  <span>{activeClient.phone}</span>
                </div>
              )}
            </div>

            {/* Campaign Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.campaign.campaignName} *
              </label>
              <input
                type="text"
                required
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder={t.campaign.campaignNamePlaceholder}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Ad Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.campaign.adType} *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdType('Mention')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                    adType === 'Mention'
                      ? 'bg-red-600 text-white border-red-500 shadow-xs'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {t.campaign.liveMention}
                </button>
                <button
                  type="button"
                  onClick={() => setAdType('Spot')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                    adType === 'Spot'
                      ? 'bg-red-600 text-white border-red-500 shadow-xs'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {t.campaign.recordedSpot}
                </button>
              </div>
            </div>
          </div>

          {/* DATES & PHYSICAL CUSTOM DURATION (Prices removed) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                {t.campaign.startDate} *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            {/* Physical Custom Number of Days Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {t.campaign.customDays} *
                </span>
                <span className="text-[10px] text-blue-400 font-mono">1 - 365 {language === 'sw' ? 'siku' : 'days'}</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  required
                  min={1}
                  max={365}
                  value={durationDays}
                  onChange={(e) => setDurationDays(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 font-mono text-sm font-bold rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="31"
                />
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                  {language === 'sw' ? 'Siku' : 'Days'}
                </span>
              </div>
            </div>

            {/* Calculated End Date & Duration Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'sw' ? 'Tarehe ya Kumalizika (End Date)' : 'Calculated End Date'}
              </label>
              <div className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-emerald-400">
                {calculatedEndDate} ({durationDays} {language === 'sw' ? 'siku' : 'days'})
              </div>
            </div>
          </div>

          {/* Quick Presets Pills */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] text-slate-400 font-medium mr-1">{t.campaign.quickPresets}:</span>
            {[3, 7, 10, 14, 21, 30, 31, 60].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setDurationDays(days)}
                className={`px-2 py-0.5 rounded-md text-xs font-mono transition ${
                  durationDays === days
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Rich Text Script Editor & AI Polisher */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              {t.campaign.scriptSection}
            </h3>
            <span className="text-xs text-slate-400">
              {t.campaign.targetAirtime}
            </span>
          </div>

          <RichTextEditor
            value={script}
            onChange={setScript}
            onOpenAiRewriter={() => setIsAiRewriterOpen(true)}
            targetDurationSec={45}
            placeholder={t.campaign.scriptPlaceholder}
          />
        </div>

        {/* Section 3: Time Slot Configuration & Smart Suggestions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                {t.campaign.trafficRulesTitle}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.campaign.trafficRulesSubtitle}
              </p>
            </div>

            {/* Smart Suggestions Trigger */}
            <button
              type="button"
              onClick={() => setIsPlacementModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Smart Time Suggestions</span>
            </button>
          </div>

          {/* Base Time Slots Pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {language === 'sw' ? 'Masaa ya Kawaida ya Matangazo (Standard Daily Airtime Slots):' : 'Standard Broadcast Time Slots:'} ({customSlots.length} slots)
            </label>
            <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 min-h-[46px]">
              {customSlots.map((slot) => (
                <span
                  key={slot}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950 text-blue-200 border border-blue-700/80 text-xs font-mono font-medium"
                >
                  <span>{slot}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(slot)}
                    className="hover:text-red-400 transition cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {/* Add slot input */}
              <div className="flex items-center gap-1 ml-auto">
                <input
                  type="text"
                  placeholder="k.m. 16:30 - 16:45"
                  value={newSlotInput}
                  onChange={(e) => setNewSlotInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSlot();
                    }
                  }}
                  className="bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs rounded-lg px-2.5 py-1 w-32 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* ADVANCED TRAFFIC RULES ACCORDION / EXPANDED CONTROLS */}
          {/* ======================================================== */}
          <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/60 space-y-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              {language === 'sw' ? 'Mifumo ya Ziada ya Upangaji wa Masaa Hewani (Advanced Rules)' : 'Advanced Scheduling Rules'}
            </h4>

            {/* RULE 1: Smart Day Jumping */}
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-white flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={smartDayJumping}
                      onChange={(e) => setSmartDayJumping(e.target.checked)}
                      className="rounded border-slate-700 text-red-600 focus:ring-red-500"
                    />
                    <span>{t.campaign.smartDayJumping}</span>
                  </label>
                  <p className="text-[11px] text-slate-400 mt-0.5 pl-5">
                    {t.campaign.smartDayJumpingDesc}
                  </p>
                </div>
                {smartDayJumping && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-300 font-medium whitespace-nowrap">
                      {t.campaign.targetTotalSpots}:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={durationDays * customSlots.length}
                      value={totalSpotsTarget}
                      onChange={(e) => setTotalSpotsTarget(Math.max(1, Number(e.target.value)))}
                      className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-center font-mono font-bold text-amber-400 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* RULE 2: Separate Weekend Time Slots */}
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-white flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={separateWeekendTimes}
                      onChange={(e) => setSeparateWeekendTimes(e.target.checked)}
                      className="rounded border-slate-700 text-red-600 focus:ring-red-500"
                    />
                    <span>{t.campaign.separateWeekend}</span>
                  </label>
                  <p className="text-[11px] text-slate-400 mt-0.5 pl-5">
                    {t.campaign.separateWeekendDesc}
                  </p>
                </div>
              </div>

              {separateWeekendTimes && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 pl-5">
                  {/* Saturday Slots */}
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-amber-400">{t.campaign.saturdayTimes}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {saturdaySlots.map((slot) => (
                        <span
                          key={slot}
                          className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-200 border border-amber-800 text-[11px] font-mono flex items-center gap-1"
                        >
                          {slot}
                          <button
                            type="button"
                            onClick={() => setSaturdaySlots(saturdaySlots.filter((s) => s !== slot))}
                            className="text-slate-400 hover:text-red-400"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 pt-1">
                      <input
                        type="text"
                        placeholder="k.m. 14:30 - 15:00"
                        value={newSatSlotInput}
                        onChange={(e) => setNewSatSlotInput(e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 w-full font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAddSatSlot}
                        className="p-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Sunday Slots */}
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-purple-400">{t.campaign.sundayTimes}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {sundaySlots.map((slot) => (
                        <span
                          key={slot}
                          className="px-2 py-0.5 rounded bg-purple-950/60 text-purple-200 border border-purple-800 text-[11px] font-mono flex items-center gap-1"
                        >
                          {slot}
                          <button
                            type="button"
                            onClick={() => setSundaySlots(sundaySlots.filter((s) => s !== slot))}
                            className="text-slate-400 hover:text-red-400"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 pt-1">
                      <input
                        type="text"
                        placeholder="k.m. 16:15 - 16:45"
                        value={newSunSlotInput}
                        onChange={(e) => setNewSunSlotInput(e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 w-full font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAddSunSlot}
                        className="p-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RULE 3: Cyclic Time Loop Rotation */}
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1">
              <label className="text-xs font-bold text-white flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cyclicRotation}
                  onChange={(e) => setCyclicRotation(e.target.checked)}
                  className="rounded border-slate-700 text-red-600 focus:ring-red-500"
                />
                <span className="flex items-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5 text-blue-400" />
                  {t.campaign.cyclicRotation}
                </span>
              </label>
              <p className="text-[11px] text-slate-400 pl-5">
                {t.campaign.cyclicRotationDesc}
              </p>
            </div>

            {/* RULE 4: First Day Slot Timing Override */}
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-white flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={firstDayOverride}
                  onChange={(e) => setFirstDayOverride(e.target.checked)}
                  className="rounded border-slate-700 text-red-600 focus:ring-red-500"
                />
                <span>{t.campaign.firstDayOverride}</span>
              </label>
              <p className="text-[11px] text-slate-400 pl-5">
                {t.campaign.firstDayOverrideDesc}
              </p>

              {firstDayOverride && (
                <div className="pl-5 pt-1 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="firstDayHourSelection"
                      checked={firstDayHourSelection === 'first_hour_only'}
                      onChange={() => setFirstDayHourSelection('first_hour_only')}
                      className="text-blue-500"
                    />
                    <span>{language === 'sw' ? 'Saa ya Kwanza Tu (First Slot)' : 'First Slot Only'} ({customSlots[0] || '07:30'})</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="firstDayHourSelection"
                      checked={firstDayHourSelection === 'second_hour_only'}
                      onChange={() => setFirstDayHourSelection('second_hour_only')}
                      className="text-blue-500"
                    />
                    <span>{language === 'sw' ? 'Saa ya Pili Tu (2nd Slot)' : '2nd Slot Only'} ({customSlots[1] || '13:15'})</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="firstDayHourSelection"
                      checked={firstDayHourSelection === 'all'}
                      onChange={() => setFirstDayHourSelection('all')}
                      className="text-blue-500"
                    />
                    <span>{language === 'sw' ? 'Masaa Yote ya Siku 1' : 'All Day 1 Slots'}</span>
                  </label>
                </div>
              )}
            </div>

            {/* RULE 5: Specific Day-of-Week Filter (Day Specific Mentions) */}
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-white flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableDayFilter}
                      onChange={(e) => setEnableDayFilter(e.target.checked)}
                      className="rounded border-slate-700 text-red-600 focus:ring-red-500"
                    />
                    <span>{t.campaign.dayOfWeekFilter}</span>
                  </label>
                  <p className="text-[11px] text-slate-400 mt-0.5 pl-5">
                    {t.campaign.dayOfWeekFilterDesc}
                  </p>
                </div>
              </div>

              {enableDayFilter && (
                <div className="pl-5 pt-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 0].map((dayIdx) => {
                      const isSelected = dayOfWeekFilter.includes(dayIdx);
                      const name = language === 'sw' ? DAY_NAMES_SW[dayIdx] : DAY_NAMES_EN[dayIdx];
                      return (
                        <button
                          key={dayIdx}
                          type="button"
                          onClick={() => toggleDayFilter(dayIdx)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <button
                      type="button"
                      onClick={() => setDayOfWeekFilter([2])}
                      className="hover:text-blue-400 underline"
                    >
                      {language === 'sw' ? 'Jumanne Tu (Tuesdays only)' : 'Tuesdays only'}
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setDayOfWeekFilter([6])}
                      className="hover:text-blue-400 underline"
                    >
                      {language === 'sw' ? 'Jumamosi Tu (Saturdays only)' : 'Saturdays only'}
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setDayOfWeekFilter([1, 3, 5])}
                      className="hover:text-blue-400 underline"
                    >
                      Mon-Wed-Fri
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RULE 6: Variable Days Mode (Custom Mentions & Timings Per Day of the Week) */}
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-white flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={variableDaysMode}
                  onChange={(e) => setVariableDaysMode(e.target.checked)}
                  className="rounded border-slate-700 text-red-600 focus:ring-red-500"
                />
                <span>{t.campaign.variableDaysMode}</span>
              </label>
              <p className="text-[11px] text-slate-400 pl-5">
                {t.campaign.variableDaysModeDesc}
              </p>

              {variableDaysMode && (
                <div className="pl-5 pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                    const cfg = variableDayConfig[d] || { enabled: true, slots: [] };
                    const dayLabel = language === 'sw' ? DAY_NAMES_SW[d] : DAY_NAMES_EN[d];
                    return (
                      <div key={d} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">{dayLabel}</span>
                          <span className="text-[10px] font-mono font-bold text-blue-400">
                            {cfg.slots.length} {language === 'sw' ? 'matangazo' : 'mentions'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono flex flex-wrap gap-1">
                          {cfg.slots.map((s, idx) => (
                            <span key={idx} className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Live Schedule Generation Preview & Word Document Button */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                {t.campaign.previewTitle} ({previewSpots.length} {t.campaign.spotsScheduled})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.campaign.previewSubtitle}
              </p>
            </div>

            {/* Word Editor Direct Button */}
            <button
              type="button"
              onClick={() => setViewMode('word_preview')}
              disabled={previewSpots.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-300" />
              <span>{t.campaign.openWordEditor}</span>
            </button>
          </div>

          {/* Spots Table / Preview Grid */}
          <div className="max-h-64 overflow-y-auto border border-slate-800 rounded-xl bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Spot #</th>
                  <th className="py-2.5 px-3">{language === 'sw' ? 'Tarehe & Siku' : 'Date & Day'}</th>
                  <th className="py-2.5 px-3">{language === 'sw' ? 'Muda Uliopangwa' : 'Time Slot'}</th>
                  <th className="py-2.5 px-3">{language === 'sw' ? 'Kipindi Rasmi (2026 Show)' : 'Official 2026 Show'}</th>
                  <th className="py-2.5 px-3">{language === 'sw' ? 'Aina' : 'Type'}</th>
                  <th className="py-2.5 px-3 text-right">{language === 'sw' ? 'Sahihi ya Mtangazaji' : 'Presenter Sign-off'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300 font-mono">
                {previewSpots.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500 font-sans italic">
                      {language === 'sw'
                        ? 'Jaza jina la kampeni na muda ili kuona ratiba kamili hapa.'
                        : 'Enter campaign title and time slots to generate live schedule preview.'}
                    </td>
                  </tr>
                ) : (
                  previewSpots.slice(0, 15).map((spot, idx) => (
                    <tr key={spot.id} className="hover:bg-slate-900/50 transition">
                      <td className="py-2 px-3 text-slate-400 font-bold">#{idx + 1}</td>
                      <td className="py-2 px-3 text-slate-200 font-sans">
                        {spot.date} ({spot.dayName})
                      </td>
                      <td className="py-2 px-3 text-blue-300 font-bold">{spot.timeBetween}</td>
                      <td className="py-2 px-3 text-purple-300 font-sans font-medium">{spot.programName}</td>
                      <td className="py-2 px-3 text-slate-400 font-sans">{spot.adType}</td>
                      <td className="py-2 px-3 text-right text-slate-500 font-sans italic">
                        Studio Tablet Sign-Off
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {previewSpots.length > 15 && (
              <div className="py-2 text-center text-xs text-slate-400 bg-slate-900/60 border-t border-slate-800 font-sans">
                + {previewSpots.length - 15} {language === 'sw' ? 'spots nyingine zimeratibiwa...' : 'more spots scheduled...'}
              </div>
            )}
          </div>

          {/* Action Submission Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => exportSpotsToWord(previewSpots, campaignName || 'campaign', activeClient?.name || 'client', script)}
                disabled={previewSpots.length === 0}
                className="px-3 py-2 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-700/80 disabled:opacity-40 text-blue-200 text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.campaign.exportWord}</span>
              </button>

              <button
                type="button"
                onClick={() => exportSpotsToCSV(previewSpots, campaignName || 'preview')}
                disabled={previewSpots.length === 0}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.campaign.exportCsv}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={previewSpots.length === 0 || !script.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition cursor-pointer flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{t.campaign.publishCampaign}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Save Template Modal */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-400" />
              {language === 'sw' ? 'Hifadhi Mpangilio wa Ratiba kama Kiolezo' : 'Save Schedule as Template'}
            </h3>
            <p className="text-xs text-slate-300">
              {language === 'sw'
                ? 'Weka jina la kiolezo hiki ili uweze kukitumia tena kwa urahisi kwenye kampeni zijazo bila kupanga upya.'
                : 'Enter a name for this template to quickly reuse its pacing, days, and time slot configurations later.'}
            </p>
            <input
              type="text"
              required
              value={templateNameInput}
              onChange={(e) => setTemplateNameInput(e.target.value)}
              placeholder={language === 'sw' ? 'k.m. Mzunguko wa Mwezi 1 (Spots 15 Sawia)' : 'e.g. 31-Day Smart Distribution (15 Spots)'}
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSaveTemplateModal(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
              >
                {t.actions.cancel}
              </button>
              <button
                type="button"
                onClick={handleSaveAsTemplate}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                {t.actions.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Rewriter Modal */}
      <AiMentionRewriter
        isOpen={isAiRewriterOpen}
        onClose={() => setIsAiRewriterOpen(false)}
        currentScript={script}
        clientName={activeClient?.name || 'Mteja'}
        category={activeClient?.category || 'Commercial'}
        onApplyScript={(newScript) => setScript(newScript)}
        defaultDurationSec={45}
      />

      {/* Ad Placement Modal */}
      <AdPlacementModal
        isOpen={isPlacementModalOpen}
        onClose={() => setIsPlacementModalOpen(false)}
        category={activeClient?.category || 'Telecommunications'}
        tier={activeClient?.tier || 'B'}
        selectedSlots={customSlots}
        onSelectSlot={(slot) => {
          if (!customSlots.includes(slot)) {
            setCustomSlots([...customSlots, slot]);
          } else {
            setCustomSlots(customSlots.filter((s) => s !== slot));
          }
        }}
        onApplyBalancedSlots={(balanced) => {
          setCustomSlots(balanced);
        }}
        existingAds={ads}
      />

      {/* Quick Client Modal */}
      {showQuickClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">
              {language === 'sw' ? 'Sajili Mteja Mpya wa Haraka' : 'Quick Register New Client'}
            </h3>
            <form onSubmit={handleSaveQuickClient} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'sw' ? 'Jina la Mteja / Brand *' : 'Client / Brand Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={quickClientName}
                  onChange={(e) => setQuickClientName(e.target.value)}
                  placeholder="k.m. Azam TV"
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'sw' ? 'Sekta ya Biashara' : 'Category'}
                </label>
                <select
                  value={quickCategory}
                  onChange={(e) => setQuickCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                >
                  <option value="Telecommunications">Telecommunications</option>
                  <option value="Banking & Finance">Banking & Finance</option>
                  <option value="Health Campaign">Health Campaign</option>
                  <option value="Building & Construction">Building & Construction</option>
                  <option value="Food & Beverages">Food & Beverages</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === 'sw' ? 'Ngazi (Tier)' : 'Tier'}
                  </label>
                  <select
                    value={quickTier}
                    onChange={(e) => setQuickTier(e.target.value as ClientTier)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="A">Tier A</option>
                    <option value="B">Tier B</option>
                    <option value="C">Tier C</option>
                    <option value="D">Tier D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === 'sw' ? 'Mtu wa Mawasiliano' : 'Contact Person'}
                  </label>
                  <input
                    type="text"
                    value={quickContact}
                    onChange={(e) => setQuickContact(e.target.value)}
                    placeholder="Meneja Masoko"
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickClientModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  {t.actions.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer"
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
