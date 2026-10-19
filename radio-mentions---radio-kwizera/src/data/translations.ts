import { Language } from '../types';

export interface TranslationDictionary {
  appName: string;
  stationTagline: string;
  frequency: string;
  jrsFullName: string;
  nav: {
    dashboard: string;
    studioTablet: string;
    schedule: string;
    clients: string;
    production: string;
    auditTrail: string;
    reports: string;
    settings: string;
    generator: string;
    logout: string;
    switchRole: string;
  };
  roles: {
    presenter: string;
    marketing_officer: string;
  };
  marketingTabs: {
    campaignCreator: string;
    clientDirectory: string;
    masterPlayout: string;
    spotPlanner: string;
    alertsRenewals: string;
    compliancePop: string;
    printExport: string;
    audioIngestion: string;
    airplayLogs: string;
  };
  campaign: {
    title: string;
    clientSection: string;
    selectClient: string;
    newClientQuick: string;
    campaignName: string;
    campaignNamePlaceholder: string;
    adType: string;
    liveMention: string;
    recordedSpot: string;
    startDate: string;
    durationDays: string;
    customDays: string;
    quickPresets: string;
    scriptSection: string;
    targetAirtime: string;
    scriptPlaceholder: string;
    aiPolish: string;
    trafficRulesTitle: string;
    trafficRulesSubtitle: string;
    smartDayJumping: string;
    smartDayJumpingDesc: string;
    targetTotalSpots: string;
    separateWeekend: string;
    separateWeekendDesc: string;
    saturdayTimes: string;
    sundayTimes: string;
    cyclicRotation: string;
    cyclicRotationDesc: string;
    firstDayOverride: string;
    firstDayOverrideDesc: string;
    firstDaySlots: string;
    dayOfWeekFilter: string;
    dayOfWeekFilterDesc: string;
    variableDaysMode: string;
    variableDaysModeDesc: string;
    saveAsTemplate: string;
    loadTemplate: string;
    templateSavedSuccess: string;
    previewTitle: string;
    previewSubtitle: string;
    openWordEditor: string;
    backToBuilder: string;
    saveDraft: string;
    draftSaved: string;
    printDoc: string;
    exportWord: string;
    exportCsv: string;
    exportIcs: string;
    publishCampaign: string;
    spotsScheduled: string;
    daysCount: string;
    dayNames: string[];
  };
  status: {
    live: string;
    onAir: string;
    signed: string;
    pending: string;
    missed: string;
    synced: string;
    syncing: string;
    online: string;
    offline: string;
    urgent: string;
    moderate: string;
    congested: string;
    free: string;
  };
  actions: {
    sign: string;
    signedSuccess: string;
    read: string;
    undo: string;
    checkIn: string;
    save: string;
    publish: string;
    cancel: string;
    exportSheets: string;
    addClient: string;
    newAd: string;
    uploadScript: string;
    pingStudio: string;
    swipeToSign: string;
    tapToSign: string;
    testFlow: string;
    filter: string;
    search: string;
    close: string;
    confirm: string;
  };
  labels: {
    ad: string;
    client: string;
    program: string;
    schedule: string;
    reports: string;
    settings: string;
    duration: string;
    seconds: string;
    script: string;
    audio: string;
    timestamp: string;
    presenter: string;
    timeSlot: string;
    auditLog: string;
    rateTzs: string;
    activePrograms: string;
    congestionTracker: string;
    doubleBookingWarning: string;
    liveStudioFeed: string;
    upcomingMentions: string;
    complianceRate: string;
  };
  schedule: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  studioTablet: {
    welcome: string;
    currentProgram: string;
    selectProgram: string;
    nextAdApproaching: string;
    cueCountdown: string;
    checkInCounter: string;
    tapToReadOverlay: string;
    swipeInstruction: string;
    autoAdvanceNotice: string;
    undoGracePeriod: string;
    signedAt: string;
    studioModeDark: string;
  };
  simulation: {
    title: string;
    flow1Desc: string;
    flow2Desc: string;
    flow3Desc: string;
    flow4Desc: string;
    flow5Desc: string;
    flow6Desc: string;
    runFlow: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    appName: 'Radio Mentions',
    stationTagline: 'Jukwaa la Matumaini',
    frequency: '97.7 FM • Ngara, Kagera',
    jrsFullName: 'Jesuit Refugee Service',
    nav: {
      dashboard: 'Dashboard',
      studioTablet: 'Studio Tablet',
      schedule: 'Schedule',
      clients: 'Clients',
      production: 'Production & Audio',
      auditTrail: 'Audit Trail',
      reports: 'Reports',
      settings: 'Settings',
      generator: 'Schedule Generator',
      logout: 'Logout',
      switchRole: 'Switch Role',
    },
    roles: {
      presenter: 'Presenter',
      marketing_officer: 'Marketing Officer & Main Admin',
    },
    marketingTabs: {
      campaignCreator: 'Campaign Creator',
      clientDirectory: 'Client Directory (CRM)',
      masterPlayout: 'Master Playout Sheet',
      spotPlanner: 'Spot Planner',
      alertsRenewals: 'Alerts & Renewals',
      compliancePop: 'Compliance & POP',
      printExport: 'Print & Export',
      audioIngestion: 'Ad Audio Ingestion',
      airplayLogs: 'Airplay Logs',
    },
    campaign: {
      title: 'Ad Campaign Creator & Traffic Engine',
      clientSection: '1. Select Client & Campaign Basics',
      selectClient: 'Commercial Client',
      newClientQuick: 'Register New Client Here',
      campaignName: 'Campaign Title',
      campaignNamePlaceholder: 'e.g. M-Pesa Lipa Namba Promotion 2026',
      adType: 'Ad Format Type',
      liveMention: 'Live Mention (Presenter Read)',
      recordedSpot: 'Recorded Audio Spot',
      startDate: 'Start Date',
      durationDays: 'Campaign Duration (Days)',
      customDays: 'Custom Number of Days',
      quickPresets: 'Quick Duration Presets',
      scriptSection: '2. Broadcast Script & Presenter Cues',
      targetAirtime: 'Target On-Air Duration: 45 seconds',
      scriptPlaceholder: 'Enter broadcast script here. You can include presenter cues such as [Emphasis], [Phone Number], or use the AI Script Polisher for professional delivery...',
      aiPolish: 'AI Script Polisher',
      trafficRulesTitle: '3. Advanced Traffic Rules & Scheduling Options',
      trafficRulesSubtitle: 'Configure smart pacing, rotating cyclic times, and weekend time structures',
      smartDayJumping: 'Smart Day Jumping (Auto-Distribute Spots)',
      smartDayJumpingDesc: 'Place a specific total number of ad spots spaced evenly over the campaign period',
      targetTotalSpots: 'Total Target Number of Spots',
      separateWeekend: 'Separate Weekend Time Slots',
      separateWeekendDesc: 'Define different broadcast times for Saturdays and Sundays',
      saturdayTimes: 'Saturday Broadcast Times',
      sundayTimes: 'Sunday Broadcast Times',
      cyclicRotation: 'Cyclic Time Loop Rotation',
      cyclicRotationDesc: 'Cycle ad slots through different times daily (e.g. Day 1: Time 1, Day 2: Time 2, Day 3: Time 3, and loop back)',
      firstDayOverride: 'First Day Slot Timing Override',
      firstDayOverrideDesc: 'Define distinct timings for the first day only (choose 1st hour, 2nd hour, or selected slot for delayed launches)',
      firstDaySlots: 'Launch Day (Day 1) Timings',
      dayOfWeekFilter: 'Specific Day-of-Week Filter (Day Specific Mentions)',
      dayOfWeekFilterDesc: 'Schedule mentions/spots strictly on chosen days (e.g., Tuesdays only, Saturdays only, or Mon-Wed-Fri)',
      variableDaysMode: 'Variable Days Mode (Custom Mentions & Timings Per Day)',
      variableDaysModeDesc: 'Customize different number of mentions and specific broadcast timings for each individual day (e.g. Friday & Saturday: 5 mentions, Monday: 2, Tuesday: 1)',
      saveAsTemplate: 'Save as Template',
      loadTemplate: 'Load Template',
      templateSavedSuccess: 'Template saved successfully for future reuse!',
      previewTitle: '4. Schedule Preview & Spot Allocation',
      previewSubtitle: 'Preview how spots are allocated across 2026 programs and official time slots',
      openWordEditor: 'Interactive Word-like Preview & Edit',
      backToBuilder: '← Back to Campaign Builder',
      saveDraft: 'Save Draft',
      draftSaved: 'Draft Auto-Saved',
      printDoc: 'Print Document',
      exportWord: 'Export Word (.doc)',
      exportCsv: 'Export CSV',
      exportIcs: 'Export Calendar (.ics)',
      publishCampaign: 'Publish Campaign to Playout & Studio',
      spotsScheduled: 'Spots Scheduled',
      daysCount: 'Days Campaign',
      dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    status: {
      live: 'LIVE',
      onAir: 'ON AIR',
      signed: 'Signed',
      pending: 'Pending',
      missed: 'Missed',
      synced: 'Synced',
      syncing: 'Syncing...',
      online: 'Online',
      offline: 'Offline',
      urgent: 'Critical Due',
      moderate: 'Upcoming',
      congested: 'Congested',
      free: 'Available Slot',
    },
    actions: {
      sign: 'Sign',
      signedSuccess: 'SAINIWA',
      read: 'Read',
      undo: 'Undo',
      checkIn: 'Check-in',
      save: 'Save',
      publish: 'Publish Ad to Studio',
      cancel: 'Cancel',
      exportSheets: 'Export to Google Sheets / Excel',
      addClient: 'Add New Client',
      newAd: 'Schedule Ad Mention',
      uploadScript: 'Upload Script / Audio',
      pingStudio: 'Send Alert to Studio',
      swipeToSign: 'SWIPE TO SIGN MENTION',
      tapToSign: 'TAP TO SIGN (INSTANT)',
      testFlow: 'Run Flow Test',
      filter: 'Filter',
      search: 'Search',
      close: 'Close',
      confirm: 'Confirm',
    },
    labels: {
      ad: 'Ad Mention',
      client: 'Client',
      program: 'Program',
      schedule: 'Schedule',
      reports: 'Reports',
      settings: 'Settings',
      duration: 'Duration',
      seconds: 'seconds',
      script: 'Broadcast Script',
      audio: 'Audio Cue',
      timestamp: 'Timestamp',
      presenter: 'Presenter',
      timeSlot: 'Time Slot',
      auditLog: 'Audit Trail & Second-by-Second Log',
      rateTzs: 'Rate (TZS)',
      activePrograms: 'Active Programs Today',
      congestionTracker: 'Airtime Congestion Meter',
      doubleBookingWarning: 'Zero Double-Booking Enforced',
      liveStudioFeed: 'Live Studio On-Air Feed',
      upcomingMentions: 'Upcoming Commercial Breaks',
      complianceRate: 'Broadcast Compliance Rate',
    },
    schedule: {
      weekdays: 'Weekdays',
      saturday: 'Saturday',
      sunday: 'Sunday',
    },
    studioTablet: {
      welcome: 'Habari za Studio',
      currentProgram: 'Current Live Program',
      selectProgram: 'Select Your Program',
      nextAdApproaching: 'AD BREAK DUE NOW!',
      cueCountdown: 'Time to Live Ad:',
      checkInCounter: 'Check-in Run:',
      tapToReadOverlay: 'Tap card to open full-screen teleprompter overlay',
      swipeInstruction: 'Swipe right or click button after reading on air',
      autoAdvanceNotice: 'Auto-advancing in 3 seconds...',
      undoGracePeriod: 'Undo available for 15 seconds',
      signedAt: 'Broadcast Sign-off Timestamp:',
      studioModeDark: 'Studio Dimmed Mode Active',
    },
    simulation: {
      title: 'Automated Flow Simulation Triggers',
      flow1Desc: '1. Marketing Officer schedules "Twiga Cement" on Mseto Leo at 17:00 & Publishes',
      flow2Desc: '2. Real-Time Sync notification instantly flashes on Studio Tablet',
      flow3Desc: '3. Presenter signs Twiga Cement on tablet -> Green flash + exact timestamp',
      flow4Desc: '4. Admin watches Live Studio Feed update & audit trail log exact second',
      flow5Desc: '5. Offline Sync Flow (Yellow offline -> sign -> internet restore -> Synced badge)',
      flow6Desc: '6. Switch Language toggle (English <-> Swahili)',
      runFlow: 'Simulate Step',
    },
  },
  sw: {
    appName: 'Radio Mentions',
    stationTagline: 'Jukwaa la Matumaini',
    frequency: '97.7 FM • Ngara, Kagera',
    jrsFullName: 'Shirika la Kijesuiti la Kuhudumia Wakimbizi (JRS)',
    nav: {
      dashboard: 'Dashibodi',
      studioTablet: 'Kishikwambi cha Studio',
      schedule: 'Ratiba',
      clients: 'Wateja',
      production: 'Uzalishaji na Sauti',
      auditTrail: 'Kumbukumbu na Ukaguzi',
      reports: 'Ripoti',
      settings: 'Mipangilio',
      generator: 'Kizalisha Ratiba',
      logout: 'Toka',
      switchRole: 'Badili Nafasi',
    },
    roles: {
      presenter: 'Mtangazaji',
      marketing_officer: 'Afisa Masoko & Msimamizi Mkuu',
    },
    marketingTabs: {
      campaignCreator: 'Kizalisha Kampeni',
      clientDirectory: 'Orodha ya Wateja (CRM)',
      masterPlayout: 'Jedwali la Playout Kuu',
      spotPlanner: 'Mpangilio wa Spots',
      alertsRenewals: 'Taarifa na Upyaji',
      compliancePop: 'Utekelezaji & POP',
      printExport: 'Chapisha & Hamisha',
      audioIngestion: 'Upakiaji wa Sauti',
      airplayLogs: 'Kumbukumbu za Hewani',
    },
    campaign: {
      title: 'Kizalisha Kampeni na Upangaji wa Matangazo',
      clientSection: '1. Chagua Mteja na Taarifa za Awali',
      selectClient: 'Mteja wa Kibiashara',
      newClientQuick: 'Sajili Mteja Mpya Hapa',
      campaignName: 'Jina la Kampeni',
      campaignNamePlaceholder: 'k.m. Promosheni ya Ramadhani M-Pesa 2026',
      adType: 'Aina ya Tangazo',
      liveMention: 'Live Mention (Kusomwa na Mtangazaji)',
      recordedSpot: 'Tangazo Lililorekodiwa (Spot)',
      startDate: 'Tarehe ya Kuanza',
      durationDays: 'Muda wa Kampeni (Siku)',
      customDays: 'Idadi ya Siku Maalum',
      quickPresets: 'Machaguo ya Haraka',
      scriptSection: '2. Nakala ya Tangazo na Ishara za Mtangazaji',
      targetAirtime: 'Muda Uliokusudiwa Hewani: sekunde 45',
      scriptPlaceholder: 'Weka maneno ya tangazo hapa. Unaweza kuweka ishara kama [Sisitiza], [Namba ya Simu], au kutumia AI Script Polisher kuboresha mtiririko...',
      aiPolish: 'Boresha kwa AI Script Polisher',
      trafficRulesTitle: '3. Kanuni Maalum za Upangaji wa Masaa Hewani (Advanced Traffic Rules)',
      trafficRulesSubtitle: 'Panga mzunguko wa kiotomatiki, masaa tofauti ya mwisho wa wiki, na siku maalum',
      smartDayJumping: 'Smart Day Jumping (Kugawanya Spots kwa Usawa)',
      smartDayJumpingDesc: 'Weka idadi kamili ya spots zigawanywe sawia katika siku zote za kampeni',
      targetTotalSpots: 'Lengo la Jumla ya Spots Zote',
      separateWeekend: 'Masaa Tofauti ya Mwisho wa Wiki (Weekend Slots)',
      separateWeekendDesc: 'Weka masaa tofauti ya kuruka hewani kwa Jumamosi na Jumapili',
      saturdayTimes: 'Masaa ya Jumamosi',
      sundayTimes: 'Masaa ya Jumapili',
      cyclicRotation: 'Mzunguko wa Kila Siku (Cyclic Time Loop)',
      cyclicRotationDesc: 'Zungusha masaa ya matangazo kila siku (k.m. Siku 1: Saa 1, Siku 2: Saa 2, Siku 3: Saa 3, kisha rudia)',
      firstDayOverride: 'Mabadiliko ya Siku ya Kwanza Tu (First Day Override)',
      firstDayOverrideDesc: 'Weka masaa maalum ya siku ya kwanza tu (chagua saa ya kwanza au ya pili kwa kampeni zinazoanza mchana)',
      firstDaySlots: 'Masaa ya Siku ya Uzinduzi (Siku 1)',
      dayOfWeekFilter: 'Chuja Siku Maalum za Wiki (Day Specific Mentions)',
      dayOfWeekFilterDesc: 'Panga matangazo kwenye siku maalum tu (k.m. Jumanne tu, Jumamosi tu, au Jtatu-Jtano-Ijumaa)',
      variableDaysMode: 'Modi ya Siku Tofauti (Variable Days Mode)',
      variableDaysModeDesc: 'Weka idadi tofauti ya matangazo na masaa mahsusi kwa kila siku ya wiki (k.m. Ijumaa na Jumamosi: matangazo 5, Jumatatu: 2, Jumanne: 1)',
      saveAsTemplate: 'Hifadhi kama Kiolezo (Save Template)',
      loadTemplate: 'Pakia Kiolezo (Load Template)',
      templateSavedSuccess: 'Kiolezo kimehifadhiwa kwa mafanikio!',
      previewTitle: '4. Uhakiki wa Ratiba na Mgawanyo wa Spots',
      previewSubtitle: 'Tazama jinsi matangazo yanavyogawanywa kwenye vipindi vya redio vya mwaka 2026',
      openWordEditor: 'Hakiki na Uhariri kama Word (Interactive Word Preview)',
      backToBuilder: '← Rudi Kwenye Kizalisha Kampeni',
      saveDraft: 'Hifadhi Rasimu',
      draftSaved: 'Rasimu Imehifadhiwa',
      printDoc: 'Chapisha Waraka',
      exportWord: 'Pakua Word (.doc)',
      exportCsv: 'Pakua CSV',
      exportIcs: 'Pakua Kalenda (.ics)',
      publishCampaign: 'Chapisha Kampeni Studioni na Playout',
      spotsScheduled: 'Spots Zilizoratibiwa',
      daysCount: 'Siku za Kampeni',
      dayNames: ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'],
    },
    status: {
      live: 'MOJA KWA MOJA',
      onAir: 'HEWANI',
      signed: 'Sainiwa',
      pending: 'Inasubiri',
      missed: 'Imekosekana',
      synced: 'Imelandanishwa',
      syncing: 'Inalandanisha...',
      online: 'Mtandaoni',
      offline: 'Nje ya Mtandao',
      urgent: 'Inatakiwa Sasa',
      moderate: 'Inakuja',
      congested: 'Imejaa / Msongamano',
      free: 'Nafasi Ipo Huru',
    },
    actions: {
      sign: 'Saini',
      signedSuccess: 'SAINIWA',
      read: 'Soma',
      undo: 'Ondoa',
      checkIn: 'Ingia',
      save: 'Hifadhi',
      publish: 'Chapisha Tangazo Studioni',
      cancel: 'Ghairi',
      exportSheets: 'Hamisha kwenda Google Sheets / Excel',
      addClient: 'Ongeza Mteja Mpya',
      newAd: 'Panga Tangazo Jipya',
      uploadScript: 'Pakia Maelezo / Sauti',
      pingStudio: 'Tuma Onyo kwa Studio',
      swipeToSign: 'TELEZA KUSAINI TANGAZO',
      tapToSign: 'GUSA KUSAINI (PAPO HAPO)',
      testFlow: 'Jaribu Mtiririko',
      filter: 'Chuja',
      search: 'Tafuta',
      close: 'Funga',
      confirm: 'Thibitisha',
    },
    labels: {
      ad: 'Tangazo',
      client: 'Mteja',
      program: 'Kipindi',
      schedule: 'Ratiba',
      reports: 'Ripoti',
      settings: 'Mipangilio',
      duration: 'Muda',
      seconds: 'sekunde',
      script: 'Nakala ya Tangazo',
      audio: 'Ishara ya Sauti',
      timestamp: 'Muda Kamili',
      presenter: 'Mtangazaji',
      timeSlot: 'Wakati wa Kipindi',
      auditLog: 'Kumbukumbu ya Ukaguzi kwa Sekunde',
      rateTzs: 'Gharama (TZS)',
      activePrograms: 'Vipindi vya Leo',
      congestionTracker: 'Kipimo cha Msongamano wa Matangazo',
      doubleBookingWarning: 'Hakuna Nafasi Mbili kwa Saa Moja',
      liveStudioFeed: 'Mwonekano wa Moja kwa Moja wa Hewani',
      upcomingMentions: 'Matangazo Yanayofuata',
      complianceRate: 'Kiwango cha Utekelezaji Hewani',
    },
    schedule: {
      weekdays: 'Siku za Wiki',
      saturday: 'Jumamosi',
      sunday: 'Jumapili',
    },
    studioTablet: {
      welcome: 'Karibu Studio ya Radio Kwizera',
      currentProgram: 'Kipindi cha Moja kwa Moja Sasa',
      selectProgram: 'Chagua Kipindi Chako',
      nextAdApproaching: 'WAKATI WA TANGAZO UMEWADIA!',
      cueCountdown: 'Muda Uliobaki:',
      checkInCounter: 'Marudio ya:',
      tapToReadOverlay: 'Gusa kadi kufungua mwonekano kamili wa kusoma',
      swipeInstruction: 'Teleza kulia au bonyeza baada ya kusoma hewani',
      autoAdvanceNotice: 'Inafunga baada ya sekunde 3...',
      undoGracePeriod: 'Unaweza kuondoa ndani ya sekunde 15',
      signedAt: 'Muda Kamili wa Kusainiwa:',
      studioModeDark: 'Modi ya Studio Imewashwa',
    },
    simulation: {
      title: 'Majaribio ya Mtiririko wa Kiotomatiki',
      flow1Desc: '1. Afisa Masoko apanga tangazo la "Twiga Cement" Mseto Leo saa 17:00 & achapishe',
      flow2Desc: '2. Taarifa ya papo hapo ifike kwenye kishikwambi cha Studio',
      flow3Desc: '3. Mtangazaji asaini Twiga Cement -> Mweko wa kijani + muda kamili',
      flow4Desc: '4. Msimamizi Mkuu aone hewani mara moja na kumbukumbu ya sekunde iandikwe',
      flow5Desc: '5. Mtiririko wa bila mtandao (Zima mtandao -> saini -> washa mtandao -> Imelandanishwa)',
      flow6Desc: '6. Badilisha lugha (Kiingereza <-> Kiswahili)',
      runFlow: 'Tekeleza Hatua',
    },
  },
};
