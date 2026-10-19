export type UserRole =
  | 'presenter'
  | 'marketing_officer';

export type Language = 'en' | 'sw';

export type DayType = 'weekday' | 'saturday' | 'sunday';

export type AdType = 'live_mention' | 'recorded_spot' | 'promo' | 'sponsor_tag';

export type AdStatus = 'pending' | 'signed' | 'missed';

export type UrgencyLevel = 'normal' | 'moderate' | 'critical' | 'overdue';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  title: string;
  assignedPrograms?: string[];
  email: string;
  phone: string;
}

export interface ScheduleSegment {
  id: string;
  timeSlot: string; // e.g. "16:00-16:30"
  title: string;
  isAdBreak?: boolean;
}

export interface Program {
  id: string;
  name: string;
  timeSlot: string; // e.g. "16:00-18:30"
  startTime: string; // e.g. "16:00"
  endTime: string; // e.g. "18:30"
  dayType: DayType;
  presenterId?: string;
  presenterName?: string;
  coPresenterName?: string;
  segments: ScheduleSegment[];
  description?: string;
}

export interface AdCheckIn {
  checkInNumber: number; // 1, 2, or 3
  timestamp: string; // ISO / EAT string
  signedBy: string;
  synced: boolean;
  notes?: string;
}

export interface AdMention {
  id: string;
  clientName: string;
  campaignTitle: string;
  programId: string;
  programName: string;
  scheduledTime: string; // e.g. "17:00"
  durationSec: number; // e.g. 30, 45, 60
  adType: AdType;
  scriptText: string;
  audioAssetUrl?: string;
  status: AdStatus;
  checkIns: AdCheckIn[];
  maxCheckIns: number; // default 3
  urgency: UrgencyLevel;
  date: string; // YYYY-MM-DD
  month: string; // e.g. "March 2026"
  rateTzs?: number;
  contactPerson?: string;
}

export type ClientTier = 'A' | 'B' | 'C' | 'D';
export type BillingStatus = 'paid' | 'pending' | 'partially_paid' | 'overdue';

export interface Client {
  id: string;
  name: string;
  company?: string;
  category: string; // e.g. "Health Campaign", "Telecommunications", "Banking & Finance", etc.
  tier: ClientTier; // A/B/C/D
  billingStatus: BillingStatus;
  contactPerson: string;
  phone: string;
  email: string;
  targetAudience?: string;
  preferredTimeSlots?: string[];
  budgetTier?: string; // e.g. "TZS 5,000,000+", "TZS 1M - 5M"
  rateCardCode?: string;
  notes?: string;
  activeCampaigns: number;
}

export type CampaignAdType = 'Mention' | 'Spot' | 'Sponsorship' | 'Interview' | 'DJ Hype';

export interface CampaignTimeSlotConfig {
  mode?: 'standard' | 'custom_matrix';
  slotsPerDay?: number;
  timeSlots?: string[]; // e.g. ["07:30 - 07:45", "12:45 - 13:00", "17:15 - 17:30"]
  customSlots?: string[];
  rotationPattern?: string; // 'cyclic' | 'daily_fixed' | 'weekdays_only' | 'weekend_override' | 'day_jumping'
  
  // Advanced Traffic Rules & Scheduling Options
  smartDayJumping?: boolean; // Smart Day Jumping (Auto-Distribute Spots)
  dayJumping?: boolean; // Alias for smartDayJumping
  totalSpotsTarget?: number; // Target number of spots to evenly space across campaign
  
  separateWeekendTimes?: boolean; // Separate Weekend Time Slots
  weekendSlots?: string[]; // General weekend slots
  saturdaySlots?: string[]; // Distinct Saturday broadcast times
  sundaySlots?: string[]; // Distinct Sunday broadcast times
  
  cyclicRotation?: boolean; // Cyclic Time Loop Rotation daily
  
  firstDayOverride?: boolean; // First Day Slot Timing Override
  firstDaySlots?: string[]; // Distinct timings for first day only
  firstDayHourSlots?: string[]; // e.g. select only 1st hour or 2nd hour
  
  dayOfWeekFilter?: number[]; // Specific Day-of-Week Filter (0=Sun, 1=Mon, ..., 6=Sat)
  
  variableDaysMode?: boolean; // Variable Days Mode (Custom mentions & timings per day of week)
  variableDayConfig?: {
    [dayOfWeek: number]: {
      enabled: boolean;
      slots: string[];
    };
  };
  
  weekendOverride?: string[];
  customMatrix?: { [dayOfWeek: number]: string[] };
}

export interface ScheduleTemplate {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  durationDays: number;
  customSlots: string[];
  rotationPattern: string;
  timeSlotConfig: CampaignTimeSlotConfig;
}

export interface ScheduledSpotItem {
  id: string;
  campaignId: string;
  campaignName: string;
  clientName: string;
  date: string; // YYYY-MM-DD
  dayName: string; // e.g. "Jumatatu / Monday"
  dayOfWeek: number; // 0-6
  description: string;
  adType: CampaignAdType;
  timeBetween: string; // e.g. "07:30 - 07:45"
  programName: string;
  programId: string;
  timeAired?: string;
  signature?: string;
  signedBy?: string;
  isAired: boolean;
  isWeekend: boolean;
}

export interface AdCampaign {
  id: string;
  clientId: string;
  clientName: string;
  company?: string;
  name: string; // e.g. "Vodacom M-Pesa Promo"
  adType: CampaignAdType;
  category: string;
  tier: ClientTier;
  startDate: string; // YYYY-MM-DD
  durationDays: number; // e.g. 14, 31, or custom
  endDate: string; // YYYY-MM-DD
  script: string;
  timeSlotConfig: CampaignTimeSlotConfig;
  totalSlots: number;
  ratePerSlotTzs?: number;
  totalBudgetTzs?: number;
  totalCostTzs?: number;
  claimedRevenueTzs?: number;
  receivedRevenueTzs?: number;
  invoiceNumber?: string;
  paymentReference?: string;
  status: 'active' | 'completed' | 'draft' | 'paused';
  createdAt: string;
  scheduledSpots: ScheduledSpotItem[];
}

export type Campaign = AdCampaign;

export interface AuditLogEntry {
  id: string;
  timestamp: string; // e.g. "2026-09-10 17:01:14 EAT"
  isoTime: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  adId?: string;
  clientName?: string;
  programName?: string;
  details: string;
}

export interface AudioAsset {
  id: string;
  title: string;
  clientName: string;
  durationSec: number;
  uploadedAt: string;
  uploadedBy: string;
  type: 'spot' | 'promo' | 'jingle' | 'station_id';
  fileUrl?: string;
  voiceoverArtist?: string;
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'ad_alert';
  timestamp: string;
}
