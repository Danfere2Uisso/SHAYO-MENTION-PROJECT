import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserRole,
  UserProfile,
  Language,
  Program,
  AdMention,
  Client,
  AuditLogEntry,
  AudioAsset,
  ToastNotification,
  AdCampaign,
  ScheduledSpotItem,
} from '../types';
import {
  OFFICIAL_2026_PROGRAMS,
  INITIAL_USERS,
  INITIAL_CLIENTS,
  INITIAL_ADS,
  INITIAL_AUDIO_ASSETS,
  INITIAL_CAMPAIGNS,
} from '../data/scheduleData';
import { translations, TranslationDictionary } from '../data/translations';
import { studioAudio } from '../utils/audioSynth';
import { generateCampaignSpots } from '../utils';

const LOCAL_STORAGE_KEY_CAMPAIGNS = 'kwizera_campaigns_2026';
const LOCAL_STORAGE_KEY_CLIENTS = 'kwizera_clients_2026';
const LOCAL_STORAGE_KEY_ADS = 'kwizera_ads_2026';
const LOCAL_STORAGE_KEY_PRESENTERS = 'jrs_presenters_list';
const LOCAL_STORAGE_KEY_CURRENT_PRESENTER = 'jrs_current_presenter';
const SESSION_KEY_ADMIN_AUTH = 'rk_admin_session_auth';
const CLEAN_SLATE_KEY = 'kwizera_clean_slate_applied_v3';

// Clean slate initialization: clear any lingering mock data from older preview sessions
if (typeof window !== 'undefined') {
  try {
    if (!localStorage.getItem(CLEAN_SLATE_KEY)) {
      localStorage.removeItem(LOCAL_STORAGE_KEY_CAMPAIGNS);
      localStorage.removeItem(LOCAL_STORAGE_KEY_CLIENTS);
      localStorage.removeItem(LOCAL_STORAGE_KEY_ADS);
      localStorage.removeItem('kwizera_audio_2026');
      localStorage.setItem(CLEAN_SLATE_KEY, 'true');
    }
  } catch (e) {
    console.error('Error checking clean slate:', e);
  }
}

interface RadioAppContextType {
  // Authentication & Role
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  allUsers: UserProfile[];
  switchRole: (role: UserRole) => void;
  isLoggedIn: boolean;
  login: (user: UserProfile) => void;
  logout: () => void;

  // Marketing Admin Authentication
  isAdminAuthenticated: boolean;
  adminLogin: (username: string, password: string) => { success: boolean; error?: string };
  adminLogout: () => void;

  // Presenters Management
  presentersList: string[];
  addPresenter: (name: string) => boolean;
  deletePresenter: (name: string) => void;
  selectedPresenter: string;
  setSelectedPresenter: (name: string) => void;

  // Language & Theme
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
  studioDarkMode: boolean;
  setStudioDarkMode: (dark: boolean) => void;

  // Real-Time & Connectivity (Module 4)
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  syncStatus: 'synced' | 'syncing' | 'offline_queued';
  offlineQueueCount: number;
  syncOfflineQueue: () => void;

  // Core Broadcast & Programs (Module 2)
  programs: Program[];
  currentLiveProgram: Program;
  selectedProgramId: string;
  setSelectedProgramId: (id: string) => void;

  // Ads & Mentions (Module 3 & 8)
  ads: AdMention[];
  addAdMention: (ad: Omit<AdMention, 'id' | 'status' | 'checkIns'>) => AdMention;
  signAdMention: (adId: string, presenterName: string) => { success: boolean; timestamp: string };
  undoSignAdMention: (adId: string) => boolean;
  deleteAdMention: (adId: string) => void;

  // Campaigns Management (New)
  campaigns: AdCampaign[];
  addCampaign: (campaign: Omit<AdCampaign, 'id' | 'createdAt' | 'scheduledSpots'> & { scheduledSpots?: ScheduledSpotItem[] }) => AdCampaign;
  updateCampaign: (id: string, updates: Partial<AdCampaign>) => void;
  deleteCampaign: (id: string) => void;
  updateScheduledSpot: (spotId: string, updates: Partial<ScheduledSpotItem>) => void;

  // Clients Database (Module 8 & CRUD)
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'activeCampaigns'>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Production & Audio (Module 5)
  audioAssets: AudioAsset[];
  addAudioAsset: (asset: Omit<AudioAsset, 'id' | 'uploadedAt'>) => void;

  // Audit Trail (Module 5 & 9)
  auditLogs: AuditLogEntry[];
  logAuditEvent: (action: string, adClient?: string, program?: string, details?: string) => void;

  // Notifications & Intercom Alerts
  notifications: ToastNotification[];
  dismissNotification: (id: string) => void;
  sendStudioAlert: (title: string, message: string) => void;

  // Active overlay in tablet mode
  activeAdForSign: AdMention | null;
  setActiveAdForSign: (ad: AdMention | null) => void;
  greenFlashActive: boolean;

  // Simulation Triggers
  runSimulationFlow: (flowNumber: number) => void;
  simulatedNotification: string | null;
}

const RadioAppContext = createContext<RadioAppContextType | null>(null);

export const RadioAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Language state
  const [language, setLanguage] = useState<Language>('sw'); // Default to Swahili / English toggle
  const t = translations[language];

  // 2. Users and Auth
  const [allUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]); // Presenter
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  // 2.1 Marketing Admin Session Authentication
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        return sessionStorage.getItem(SESSION_KEY_ADMIN_AUTH) === 'true';
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  });

  const adminLogin = useCallback((username: string, password: string) => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // Accepted default credentials: admin / kwizera977 (also accepts admin/admin or marketing/kwizera)
    const validUsernames = ['admin', 'marketing', 'kwizera', 'manager', 'jrs'];
    const validPasswords = ['kwizera977', 'admin', 'admin123', 'kwizera', '1234'];

    if ((validUsernames.includes(cleanUser) || cleanUser === '') && validPasswords.includes(cleanPass)) {
      setIsAdminAuthenticated(true);
      try {
        sessionStorage.setItem(SESSION_KEY_ADMIN_AUTH, 'true');
      } catch (e) {
        console.error(e);
      }
      return { success: true };
    }

    return {
      success: false,
      error: language === 'sw' ? 'Jina la mtumiaji au nenosiri sio sahihi. Jaribu: admin / kwizera977' : 'Invalid admin credentials. Hint: admin / kwizera977',
    };
  }, [language]);

  const adminLogout = useCallback(() => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem(SESSION_KEY_ADMIN_AUTH);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // 2.2 Presenters List Management (Stored in localStorage under 'jrs_presenters_list')
  const [presentersList, setPresentersList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PRESENTERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => (typeof item === 'string' ? item : item?.name || '')).filter(Boolean);
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [selectedPresenter, setSelectedPresenterState] = useState<string>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_PRESENTER) || '';
    } catch (e) {
      return '';
    }
  });

  const setSelectedPresenter = useCallback((name: string) => {
    setSelectedPresenterState(name);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_PRESENTER, name);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const addPresenter = useCallback((name: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    let added = false;
    setPresentersList((prev) => {
      if (prev.some((p) => p.toLowerCase() === trimmed.toLowerCase())) {
        return prev;
      }
      added = true;
      const next = [...prev, trimmed];
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_PRESENTERS, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    setSelectedPresenterState((curr) => (!curr ? trimmed : curr));
    return added;
  }, []);

  const deletePresenter = useCallback((name: string) => {
    setPresentersList((prev) => {
      const next = prev.filter((p) => p !== name);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_PRESENTERS, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    setSelectedPresenterState((curr) => (curr === name ? '' : curr));
  }, []);

  // 3. Studio Theme
  const [studioDarkMode, setStudioDarkMode] = useState<boolean>(true);

  // 4. Connectivity & Sync
  const [isOnline, setIsOnlineState] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline_queued'>('synced');
  const [offlineQueue, setOfflineQueue] = useState<{ adId: string; presenterName: string; timestamp: string }[]>([]);

  // 5. Broadcast Programs
  const [programs] = useState<Program[]>(OFFICIAL_2026_PROGRAMS);
  // Default program: MSETO LEO (16:00-18:30) as featured in requirements
  const [selectedProgramId, setSelectedProgramId] = useState<string>('prog-wd-mseto');

  // 6. Ads State with initial data and localStorage persistence
  const [ads, setAds] = useState<AdMention[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ADS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ADS;
  });

  // 7. Clients with localStorage persistence
  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CLIENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CLIENTS;
  });

  // 7.1 Campaigns with localStorage persistence
  const [campaigns, setCampaigns] = useState<AdCampaign[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CAMPAIGNS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CAMPAIGNS;
  });

  // LocalStorage synchronizers
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_ADS, JSON.stringify(ads));
    } catch (e) {
      console.error(e);
    }
  }, [ads]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CLIENTS, JSON.stringify(clients));
    } catch (e) {
      console.error(e);
    }
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CAMPAIGNS, JSON.stringify(campaigns));
    } catch (e) {
      console.error(e);
    }
  }, [campaigns]);

  // Real-Time Cross-Window & Cross-Tab Storage Event Listener
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY_ADS && e.newValue) {
        try {
          setAds(JSON.parse(e.newValue));
        } catch (err) {
          console.error(err);
        }
      }
      if (e.key === LOCAL_STORAGE_KEY_CLIENTS && e.newValue) {
        try {
          setClients(JSON.parse(e.newValue));
        } catch (err) {
          console.error(err);
        }
      }
      if (e.key === LOCAL_STORAGE_KEY_CAMPAIGNS && e.newValue) {
        try {
          setCampaigns(JSON.parse(e.newValue));
        } catch (err) {
          console.error(err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 8. Audio Assets
  const [audioAssets, setAudioAssets] = useState<AudioAsset[]>(INITIAL_AUDIO_ASSETS);

  // 9. Notifications
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  const [simulatedNotification, setSimulatedNotification] = useState<string | null>(null);

  // 10. Active Sign overlay & Green Flash
  const [activeAdForSign, setActiveAdForSign] = useState<AdMention | null>(null);
  const [greenFlashActive, setGreenFlashActive] = useState<boolean>(false);

  // 11. Audit Trail
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'log-001',
      timestamp: '2026-09-10 16:31:08 EAT',
      isoTime: new Date().toISOString(),
      userId: 'user-presenter-1',
      userName: 'Aloyce Ndunguru',
      userRole: 'presenter',
      action: 'SIGN_AD_CHECKIN_1',
      adId: 'ad-mseto-vodacom-1630',
      clientName: 'Vodacom M-Pesa',
      programName: 'MSETO LEO',
      details: 'Signed commercial live mention run #1 during 16:30 break.',
    },
    {
      id: 'log-000',
      timestamp: '2026-09-10 15:45:00 EAT',
      isoTime: new Date().toISOString(),
      userId: 'user-marketing-officer',
      userName: 'Charles Kayanza',
      userRole: 'marketing_officer',
      action: 'SCHEDULE_AD_PUBLISH',
      adId: 'ad-mseto-twiga-1700',
      clientName: 'Twiga Cement',
      programName: 'MSETO LEO',
      details: 'Published high-priority commercial mention for 17:00 break.',
    },
  ]);

  // Helper for EAT Formatted Timestamp to the exact second
  const getEATTimestamp = useCallback(() => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} EAT`;
  }, []);

  // Log an audit event
  const logAuditEvent = useCallback((action: string, adClient?: string, program?: string, details?: string) => {
    const timestamp = getEATTimestamp();
    const newEntry: AuditLogEntry = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp,
      isoTime: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      clientName: adClient,
      programName: program,
      details: details || `Action ${action} executed by ${currentUser.name} (${currentUser.role}).`,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  }, [currentUser, getEATTimestamp]);

  // Online / Offline toggle simulation
  const setIsOnline = useCallback((online: boolean) => {
    setIsOnlineState(online);
    if (!online) {
      setSyncStatus('offline_queued');
      // Toast notice
      setNotifications((prev) => [
        {
          id: 'notif-conn-' + Date.now(),
          title: language === 'sw' ? 'Hali ya Mtandao: Nje ya Mtandao' : 'Connection: Offline Mode',
          message: language === 'sw' ? 'Kishikwambi kitahifadhi saini zote na kulandanisha mtandao ukirejea.' : 'Tablet is operating offline. Actions are queued locally.',
          type: 'warning',
          timestamp: getEATTimestamp(),
        },
        ...prev,
      ]);
    } else {
      // Reconnected! Auto-sync offline queue
      setSyncStatus('syncing');
      setTimeout(() => {
        setOfflineQueue([]);
        setSyncStatus('synced');
        setNotifications((prev) => [
          {
            id: 'notif-conn-restored-' + Date.now(),
            title: language === 'sw' ? '✅ Imelandanishwa na Wingu' : '✅ Synced with Station Server',
            message: language === 'sw' ? 'Saini zote zilizohifadhiwa zimelandanishwa kikamilifu.' : 'All queued offline sign-offs successfully synchronized.',
            type: 'success',
            timestamp: getEATTimestamp(),
          },
          ...prev,
        ]);
      }, 1400);
    }
  }, [language, getEATTimestamp]);

  // Sign Ad Mention
  const signAdMention = useCallback((adId: string, presenterName: string) => {
    const timestamp = getEATTimestamp();
    let updatedAd: AdMention | null = null;

    setAds((prev) =>
      prev.map((ad) => {
        if (ad.id === adId) {
          const nextCheckInNum = (ad.checkIns.length || 0) + 1;
          const newCheckIn = {
            checkInNumber: nextCheckInNum,
            timestamp,
            signedBy: presenterName,
            synced: isOnline,
          };
          const updated: AdMention = {
            ...ad,
            status: 'signed',
            urgency: 'normal',
            checkIns: [...ad.checkIns, newCheckIn],
          };
          updatedAd = updated;
          return updated;
        }
        return ad;
      })
    );

    // Audio Chime & Green Flash
    studioAudio.playSuccessSignChime();
    setGreenFlashActive(true);
    setTimeout(() => {
      setGreenFlashActive(false);
    }, 1800);

    // If offline, add to offline queue
    if (!isOnline) {
      setOfflineQueue((q) => [...q, { adId, presenterName, timestamp }]);
      setSyncStatus('offline_queued');
    }

    // Log to audit trail
    if (updatedAd) {
      logAuditEvent(
        'SIGN_AD_CHECKIN',
        (updatedAd as AdMention).clientName,
        (updatedAd as AdMention).programName,
        `Signed on air by ${presenterName} at ${timestamp}. Check-in #${(updatedAd as AdMention).checkIns.length}. Synced: ${isOnline}`
      );

      // Also update matching spot in campaigns
      setCampaigns((prev) =>
        prev.map((camp) => {
          let touched = false;
          const updatedSpots = camp.scheduledSpots.map((spot) => {
            if (spot.id === adId || (spot.clientName.toLowerCase() === (updatedAd as AdMention).clientName.toLowerCase() && !spot.isAired)) {
              touched = true;
              return {
                ...spot,
                isAired: true,
                timeAired: timestamp,
                signature: presenterName,
                signedBy: presenterName,
              };
            }
            return spot;
          });
          return touched ? { ...camp, scheduledSpots: updatedSpots } : camp;
        })
      );
    }

    return { success: true, timestamp };
  }, [isOnline, getEATTimestamp, logAuditEvent]);

  // Undo Sign Ad Mention
  const undoSignAdMention = useCallback((adId: string) => {
    let clientName = '';
    let programName = '';

    setAds((prev) =>
      prev.map((ad) => {
        if (ad.id === adId && ad.checkIns.length > 0) {
          clientName = ad.clientName;
          programName = ad.programName;
          const newCheckIns = ad.checkIns.slice(0, -1);
          return {
            ...ad,
            status: newCheckIns.length === 0 ? 'pending' : 'signed',
            checkIns: newCheckIns,
            urgency: newCheckIns.length === 0 ? 'critical' : 'normal',
          };
        }
        return ad;
      })
    );

    setCampaigns((prev) =>
      prev.map((camp) => {
        let touched = false;
        const updatedSpots = camp.scheduledSpots.map((spot) => {
          if (spot.id === adId) {
            touched = true;
            return {
              ...spot,
              isAired: false,
              timeAired: undefined,
              signature: undefined,
              signedBy: undefined,
            };
          }
          return spot;
        });
        return touched ? { ...camp, scheduledSpots: updatedSpots } : camp;
      })
    );

    logAuditEvent(
      'UNDO_SIGN_CHECKIN',
      clientName,
      programName,
      `Sign-off undone within grace period by ${currentUser.name}.`
    );

    return true;
  }, [currentUser, logAuditEvent]);

  // Add Ad Mention (Marketing Officer Flow)
  const addAdMention = useCallback((newAdData: Omit<AdMention, 'id' | 'status' | 'checkIns'>) => {
    const id = 'ad-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5);
    const newAd: AdMention = {
      ...newAdData,
      id,
      status: 'pending',
      checkIns: [],
      maxCheckIns: 3,
    };

    setAds((prev) => [newAd, ...prev]);

    // Audit log
    logAuditEvent(
      'SCHEDULE_AD_PUBLISH',
      newAd.clientName,
      newAd.programName,
      `New commercial scheduled for ${newAd.scheduledTime} (${newAd.durationSec}s). Published directly to Studio Tablet.`
    );

    // Instant Real-Time notification to Studio Tablet
    const toastTitle = language === 'sw' ? '🔔 Tangazo Jipya Limewekwa Studioni!' : '🔔 New Ad Mention Added!';
    const toastMsg = `${newAd.clientName} - ${newAd.programName} (${newAd.scheduledTime})`;
    
    setSimulatedNotification(toastMsg);
    setTimeout(() => setSimulatedNotification(null), 5000);

    setNotifications((prev) => [
      {
        id: 'notif-' + Date.now(),
        title: toastTitle,
        message: toastMsg,
        type: 'ad_alert',
        timestamp: getEATTimestamp(),
      },
      ...prev,
    ]);

    studioAudio.playUrgentAlertPing();

    return newAd;
  }, [language, getEATTimestamp, logAuditEvent]);

  // Delete Ad Mention
  const deleteAdMention = useCallback((adId: string) => {
    const target = ads.find((a) => a.id === adId);
    setAds((prev) => prev.filter((a) => a.id !== adId));
    if (target) {
      logAuditEvent('DELETE_AD_MENTION', target.clientName, target.programName, 'Ad mention removed from schedule.');
    }
  }, [ads, logAuditEvent]);

  // Add Client
  const addClient = useCallback((clientData: Omit<Client, 'id' | 'activeCampaigns'>) => {
    const id = 'client-' + Date.now();
    const newClient: Client = {
      ...clientData,
      id,
      activeCampaigns: 1,
    };
    setClients((prev) => [newClient, ...prev]);
    logAuditEvent('CREATE_CLIENT', newClient.name, undefined, `New commercial client created in master database.`);
    return newClient;
  }, [logAuditEvent]);

  // Update Client
  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    logAuditEvent('UPDATE_CLIENT', updates.name, undefined, `Client ${id} details updated.`);
  }, [logAuditEvent]);

  // Delete Client
  const deleteClient = useCallback((id: string) => {
    const target = clients.find((c) => c.id === id);
    setClients((prev) => prev.filter((c) => c.id !== id));
    if (target) {
      logAuditEvent('DELETE_CLIENT', target.name, undefined, `Client ${target.name} removed from master directory.`);
    }
  }, [clients, logAuditEvent]);

  // Add Campaign
  const addCampaign = useCallback(
    (
      campaignData: Omit<AdCampaign, 'id' | 'createdAt' | 'scheduledSpots'> & {
        scheduledSpots?: ScheduledSpotItem[];
      }
    ) => {
      const id = 'camp-' + Date.now();
      const createdAt = new Date().toISOString();

      // Generate spots if not provided
      const spots =
        campaignData.scheduledSpots && campaignData.scheduledSpots.length > 0
          ? campaignData.scheduledSpots
          : generateCampaignSpots(
              id,
              campaignData.name,
              campaignData.clientName,
              campaignData.adType,
              campaignData.startDate,
              campaignData.durationDays,
              campaignData.timeSlotConfig
            );

      const newCampaign: AdCampaign = {
        ...campaignData,
        id,
        createdAt,
        totalSlots: spots.length,
        scheduledSpots: spots,
      };

      setCampaigns((prev) => [newCampaign, ...prev]);

      // Automatically populate ads for studio tablet for active campaigns
      if (newCampaign.status === 'active') {
        const generatedAds: AdMention[] = spots.map((spot) => ({
          id: spot.id,
          clientName: spot.clientName,
          campaignTitle: newCampaign.name,
          programId: spot.programId,
          programName: spot.programName,
          scheduledTime: spot.timeBetween.split('-')[0].trim(),
          durationSec: 45,
          adType: spot.adType === 'Mention' ? 'live_mention' : 'recorded_spot',
          scriptText: newCampaign.script,
          status: spot.isAired ? 'signed' : 'pending',
          checkIns: spot.isAired
            ? [
                {
                  checkInNumber: 1,
                  timestamp: spot.timeAired || getEATTimestamp(),
                  signedBy: spot.signedBy || 'Studio Presenter',
                  synced: true,
                },
              ]
            : [],
          maxCheckIns: 1,
          urgency: 'normal',
          date: spot.date,
          month: new Date(spot.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          rateTzs: newCampaign.ratePerSlotTzs,
        }));

        setAds((prevAds) => {
          const existingIds = new Set(prevAds.map((a) => a.id));
          const newOnes = generatedAds.filter((a) => !existingIds.has(a.id));
          return [...newOnes, ...prevAds];
        });
      }

      // Update client's activeCampaigns count
      setClients((prev) =>
        prev.map((c) =>
          c.id === campaignData.clientId || c.name.toLowerCase() === campaignData.clientName.toLowerCase()
            ? { ...c, activeCampaigns: (c.activeCampaigns || 0) + 1 }
            : c
        )
      );

      logAuditEvent(
        'CREATE_CAMPAIGN',
        newCampaign.clientName,
        undefined,
        `New campaign "${newCampaign.name}" created with ${spots.length} spots. Synced to studio schedule.`
      );

      return newCampaign;
    },
    [getEATTimestamp, logAuditEvent]
  );

  // Update Campaign
  const updateCampaign = useCallback((id: string, updates: Partial<AdCampaign>) => {
    setCampaigns((prev) =>
      prev.map((camp) => (camp.id === id ? { ...camp, ...updates } : camp))
    );
    logAuditEvent('UPDATE_CAMPAIGN', updates.clientName, undefined, `Campaign ${id} updated.`);
  }, [logAuditEvent]);

  // Delete Campaign
  const deleteCampaign = useCallback((id: string) => {
    const target = campaigns.find((c) => c.id === id);
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    // Also remove associated spots from ads
    setAds((prev) => prev.filter((a) => !a.id.startsWith(`spot-${id}-`)));
    if (target) {
      logAuditEvent('DELETE_CAMPAIGN', target.clientName, undefined, `Campaign "${target.name}" deleted.`);
    }
  }, [campaigns, logAuditEvent]);

  // Update individual scheduled spot
  const updateScheduledSpot = useCallback((spotId: string, updates: Partial<ScheduledSpotItem>) => {
    setCampaigns((prev) =>
      prev.map((camp) => {
        let touched = false;
        const updatedSpots = camp.scheduledSpots.map((spot) => {
          if (spot.id === spotId) {
            touched = true;
            return { ...spot, ...updates };
          }
          return spot;
        });
        return touched ? { ...camp, scheduledSpots: updatedSpots } : camp;
      })
    );
  }, []);

  // Add Audio Asset
  const addAudioAsset = useCallback((assetData: Omit<AudioAsset, 'id' | 'uploadedAt'>) => {
    const id = 'aud-' + Date.now();
    const newAsset: AudioAsset = {
      ...assetData,
      id,
      uploadedAt: getEATTimestamp(),
    };
    setAudioAssets((prev) => [newAsset, ...prev]);
    logAuditEvent('UPLOAD_AUDIO_ASSET', newAsset.clientName, undefined, `Audio file "${newAsset.title}" uploaded (${newAsset.durationSec}s).`);
  }, [getEATTimestamp, logAuditEvent]);

  // Send Intercom Alert to Studio
  const sendStudioAlert = useCallback((title: string, message: string) => {
    studioAudio.playUrgentAlertPing();
    const notif: ToastNotification = {
      id: 'alert-' + Date.now(),
      title,
      message,
      type: 'warning',
      timestamp: getEATTimestamp(),
    };
    setNotifications((prev) => [notif, ...prev]);
    logAuditEvent('STUDIO_ALERT_SENT', undefined, undefined, `${title}: ${message}`);
  }, [getEATTimestamp, logAuditEvent]);

  // Dismiss notification
  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Switch role
  const switchRole = useCallback((role: UserRole) => {
    const found = allUsers.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
    }
  }, [allUsers]);

  const login = useCallback((user: UserProfile) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    logAuditEvent('USER_LOGIN', undefined, undefined, `User ${user.name} logged into Radio Mentions.`);
  }, [logAuditEvent]);

  const logout = useCallback(() => {
    logAuditEvent('USER_LOGOUT', undefined, undefined, `User ${currentUser.name} logged out.`);
    setIsLoggedIn(false);
  }, [currentUser, logAuditEvent]);

  // Current Live Program
  const currentLiveProgram = programs.find((p) => p.id === selectedProgramId) || programs[4]; // Default Mseto Leo

  // Run Guided Flow Simulations for the 6 exact requirements
  const runSimulationFlow = useCallback((flowNumber: number) => {
    switch (flowNumber) {
      case 1: {
        // 1. Marketing Officer Flow: Add "Twiga Cement" ad for March on "Mseto Leo" at 17:00 -> Publish
        switchRole('marketing_officer');
        addAdMention({
          clientName: 'Twiga Cement',
          campaignTitle: 'Twiga Extra - Imara Kuliko Yote',
          programId: 'prog-wd-mseto',
          programName: 'MSETO LEO',
          scheduledTime: '17:00',
          durationSec: 45,
          adType: 'live_mention',
          scriptText: `[MTANGAZAJI: Kwa sauti ya bashasha na msisitizo wa kibiashara]
"Wasikilizaji wa Radio Kwizera, popote pale mlipo Kagera, Kigoma, Geita, hadi nchi jirani za Rwanda na Burundi... unapotaka kujenga nyumba ya ndoto zako, chagua Twiga Cement Extra! TBS imethibitisha ubora wake. Inapatikana kwa mawakala wote. Twiga Cement – Jenga kwa Uhakika!"`,
          urgency: 'critical',
          date: '2026-09-10',
          month: 'March 2026',
          rateTzs: 45000,
          contactPerson: 'Godfrey Mrema (+255 713 554 433)',
        });
        break;
      }
      case 2: {
        // 2. Real-Time Sync Flow: Studio tablet receives instant notification
        studioAudio.playUrgentAlertPing();
        setSimulatedNotification('🔔 New Ad Added: Twiga Cement scheduled for 17:00 on Mseto Leo!');
        setTimeout(() => setSimulatedNotification(null), 6000);
        break;
      }
      case 3: {
        // 3. Presenter Flow: Presenter logs in -> Selects Mseto Leo -> Ad break approaches -> Swipes to sign -> Green flash
        switchRole('presenter');
        setSelectedProgramId('prog-wd-mseto');
        const targetAd = ads.find((a) => a.clientName.includes('Twiga') || a.status === 'pending') || ads[0];
        if (targetAd) {
          setActiveAdForSign(targetAd);
        }
        break;
      }
      case 4: {
        // 4. Admin Monitoring Flow: Main Admin watches Live Studio Feed -> Audit trail updates instantly
        switchRole('admin');
        break;
      }
      case 5: {
        // 5. Offline Sync Flow: Studio Tablet goes offline -> sign ad -> internet restores -> Synced
        setIsOnline(false);
        setTimeout(() => {
          // sign pending ad in offline mode
          const pending = ads.find((a) => a.status === 'pending');
          if (pending) {
            signAdMention(pending.id, currentUser.name);
          }
          // Restore online connection after 3 seconds
          setTimeout(() => {
            setIsOnline(true);
          }, 2500);
        }, 1200);
        break;
      }
      case 6: {
        // 6. Language Toggle Flow: Switch language from English to Swahili and vice-versa
        setLanguage((prev) => (prev === 'en' ? 'sw' : 'en'));
        break;
      }
      default:
        break;
    }
  }, [ads, currentUser, switchRole, addAdMention, setIsOnline, signAdMention]);

  return (
    <RadioAppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        allUsers,
        switchRole,
        isLoggedIn,
        login,
        logout,
        isAdminAuthenticated,
        adminLogin,
        adminLogout,
        presentersList,
        addPresenter,
        deletePresenter,
        selectedPresenter,
        setSelectedPresenter,
        language,
        setLanguage,
        t,
        studioDarkMode,
        setStudioDarkMode,
        isOnline,
        setIsOnline,
        syncStatus,
        offlineQueueCount: offlineQueue.length,
        syncOfflineQueue: () => setIsOnline(true),
        programs,
        currentLiveProgram,
        selectedProgramId,
        setSelectedProgramId,
        ads,
        addAdMention,
        signAdMention,
        undoSignAdMention,
        deleteAdMention,
        campaigns,
        addCampaign,
        updateCampaign,
        deleteCampaign,
        updateScheduledSpot,
        clients,
        addClient,
        updateClient,
        deleteClient,
        audioAssets,
        addAudioAsset,
        auditLogs,
        logAuditEvent,
        notifications,
        dismissNotification,
        sendStudioAlert,
        activeAdForSign,
        setActiveAdForSign,
        greenFlashActive,
        runSimulationFlow,
        simulatedNotification,
      }}
    >
      {children}
    </RadioAppContext.Provider>
  );
};

export const useRadioApp = () => {
  const context = useContext(RadioAppContext);
  if (!context) {
    throw new Error('useRadioApp must be used within a RadioAppProvider');
  }
  return context;
};
