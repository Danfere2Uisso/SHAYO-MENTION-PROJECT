import { OFFICIAL_TIMETABLE_2026, BroadcastShow, getShowForTime } from './timetable';
import { AdMention, ClientTier } from '../types';

export interface SlotSuggestion {
  timeSlot: string; // e.g. "07:30 - 07:45"
  startTime: string; // "07:30"
  endTime: string; // "07:45"
  showName: string;
  showId: string;
  genre: string;
  primeLevel: string;
  suitabilityScore: number; // 0 - 100%
  congestionLevel: 'low' | 'moderate' | 'high';
  currentDensitySeconds: number;
  reason: string;
  matchHighlight: string;
}

export type RangeOption = '30m' | '45m' | '1h';

/**
 * Robust Category-to-Program Mapping for Radio Kwizera 2026 Timetable
 * Maps 15+ industry sectors to the most relevant programs based on listenership demographics.
 */
export const CATEGORY_PROGRAM_MAP: Record<string, string[]> = {
  // 1. Health & Pharmaceuticals
  Health: ['Mchakato', 'Tumwimbie Bwana', 'Asubuhi Njema'],
  'Health Campaign': ['Mchakato', 'Tumwimbie Bwana', 'Asubuhi Njema'],
  'Healthcare & Pharmaceuticals': ['Mchakato', 'Tumwimbie Bwana', 'Asubuhi Njema'],

  // 2. Betting, Gaming & Lotteries
  Betting: ['Sports Corner', 'Nje ya Dimba', 'Sports Corner Wiki Hii'],
  'Betting & Gaming': ['Sports Corner', 'Nje ya Dimba', 'Sports Corner Wiki Hii'],
  'Gaming & Sports Betting': ['Sports Corner', 'Nje ya Dimba', 'Sports Corner Wiki Hii'],

  // 3. Agriculture, Farming & Agrochemicals
  Agriculture: ['Asubuhi Njema Jumamosi', 'Machweo I Jumamosi', 'Mchakato', 'Asubuhi Njema'],
  'Agriculture & Farming': ['Asubuhi Njema Jumamosi', 'Machweo I Jumamosi', 'Mchakato', 'Asubuhi Njema'],
  'Agriculture & Agribusiness': ['Asubuhi Njema Jumamosi', 'Machweo I Jumamosi', 'Mchakato'],

  // 4. Telecommunications & Mobile Money
  Telecom: ['Connector', 'Mseto Leo', 'Asubuhi Njema', 'Machweo II Jumamosi'],
  Telecommunications: ['Connector', 'Mseto Leo', 'Asubuhi Njema', 'Machweo II Jumamosi'],
  'Telecom & Mobile Money': ['Connector', 'Mseto Leo', 'Asubuhi Njema'],

  // 5. Banking, Microfinance & Insurance
  'Banking & Finance': ['Asubuhi Njema', 'Mseto Leo', 'Mchakato'],
  Banking: ['Asubuhi Njema', 'Mseto Leo', 'Mchakato'],
  'Financial Services & Insurance': ['Asubuhi Njema', 'Mseto Leo', 'Mchakato'],

  // 6. Food, Beverages & FMCG
  'Food & Beverages': ['Mseto Leo', 'Machweo I Jumamosi', 'Asubuhi Njema', 'Mchakato'],
  FMCG: ['Mseto Leo', 'Asubuhi Njema', 'Machweo I Jumamosi'],
  'Beverages & Consumer Goods': ['Mseto Leo', 'Machweo I Jumamosi', 'Asubuhi Njema'],

  // 7. Building, Hardware & Construction
  'Building & Construction': ['Asubuhi Njema', 'Machweo I Jumamosi', 'Mseto Leo'],
  Construction: ['Asubuhi Njema', 'Machweo I Jumamosi', 'Mseto Leo'],
  'Hardware & Construction Materials': ['Asubuhi Njema', 'Machweo I Jumamosi', 'Mseto Leo'],

  // 8. Education & Vocational Training
  Education: ['Connector', 'Asubuhi Njema', 'Mchakato'],
  'Education & Training': ['Connector', 'Asubuhi Njema', 'Mchakato'],
  'Schools & Universities': ['Connector', 'Asubuhi Njema', 'Mchakato'],

  // 9. Religious, Faith-Based & Spiritual
  'Religious & Faith': ['Tumwimbie Bwana', 'Usiku Mwanana', 'Mchakato'],
  'Religious & NGO': ['Tumwimbie Bwana', 'Usiku Mwanana', 'Mchakato'],
  Spiritual: ['Tumwimbie Bwana', 'Usiku Mwanana', 'Mchakato'],

  // 10. Government, Public Notices & NGOs
  'Government & Public Notices': ['Asubuhi Njema', 'Mchakato', 'Mseto Leo'],
  Government: ['Asubuhi Njema', 'Mchakato', 'Mseto Leo'],
  'Humanitarian & Community': ['Mchakato', 'Asubuhi Njema', 'Tumwimbie Bwana'],
  'NGOs & Civil Society': ['Mchakato', 'Asubuhi Njema', 'Tumwimbie Bwana'],

  // 11. Energy, Solar & Clean Cooking
  'Energy & Solar': ['Mchakato', 'Asubuhi Njema', 'Machweo I Jumamosi'],
  Energy: ['Mchakato', 'Asubuhi Njema', 'Machweo I Jumamosi'],
  'Clean Energy & Cooking Gas': ['Mchakato', 'Asubuhi Njema', 'Machweo I Jumamosi'],

  // 12. Automotive, Transport & Logistics
  Automotive: ['Mseto Leo', 'Asubuhi Njema', 'Sports Corner'],
  'Automotive & Transport': ['Mseto Leo', 'Asubuhi Njema', 'Sports Corner'],
  'Transport & Logistics': ['Mseto Leo', 'Asubuhi Njema', 'Sports Corner'],

  // 13. Sports, Athletics & Fitness
  Sports: ['Sports Corner', 'Nje ya Dimba', 'Sports Corner Wiki Hii'],
  'Sports & Fitness': ['Sports Corner', 'Nje ya Dimba', 'Sports Corner Wiki Hii'],

  // 14. Retail, Supermarkets & Wholesale
  Retail: ['Mseto Leo', 'Asubuhi Njema', 'Connector'],
  'Retail & Wholesale': ['Mseto Leo', 'Asubuhi Njema', 'Connector'],
  'E-commerce & Shopping': ['Connector', 'Mseto Leo', 'Asubuhi Njema'],

  // 15. Entertainment, Events & Music
  Entertainment: ['Connector', 'Machweo II Jumamosi', 'Machweo II Jumapili', 'Mseto Leo'],
  'Youth & Entertainment': ['Connector', 'Mseto Leo', 'Machweo II Jumamosi'],
  'Events & Concerts': ['Connector', 'Machweo II Jumamosi', 'Mseto Leo'],

  // 16. Beauty, Fashion & Personal Care
  Beauty: ['Connector', 'Mchakato', 'Machweo II Jumamosi'],
  'Beauty & Personal Care': ['Connector', 'Mchakato', 'Machweo II Jumamosi'],

  // 17. Real Estate & Property Development
  'Real Estate': ['Asubuhi Njema', 'Mseto Leo', 'Machweo I Jumamosi'],
  'Property & Real Estate': ['Asubuhi Njema', 'Mseto Leo', 'Machweo I Jumamosi'],
};

/**
 * Standard Show Timing Templates from Official 2026 Timetable
 * Used as reliable fallback when Traffic Database has no entries.
 */
export const SHOW_TIMING_TEMPLATES: Record<string, string[]> = {
  'Asubuhi Njema': ['06:45 - 07:00', '07:30 - 07:45', '08:15 - 08:30'],
  'Nje ya Dimba': ['09:30 - 09:45', '10:15 - 10:30', '10:45 - 11:00'],
  'Mchakato': ['11:30 - 11:45', '12:15 - 12:30', '12:45 - 13:00'],
  Connector: ['14:30 - 14:45', '15:15 - 15:30', '15:45 - 16:00'],
  'Mseto Leo': ['16:30 - 16:45', '17:15 - 17:30', '18:00 - 18:15'],
  'Sports Corner': ['19:45 - 20:00', '20:30 - 20:45', '21:00 - 21:15'],
  'Usiku Mwanana': ['22:30 - 22:45', '23:15 - 23:30', '00:00 - 00:15'],
  'Asubuhi Njema Jumamosi': ['07:30 - 08:00', '08:45 - 09:00', '09:30 - 10:00'],
  'Machweo I Jumamosi': ['14:30 - 14:45', '15:30 - 15:45', '16:30 - 16:45'],
  'Machweo II Jumamosi': ['17:45 - 18:00', '19:15 - 19:30', '20:30 - 20:45'],
  'Tumwimbie Bwana': ['07:30 - 08:00', '09:15 - 09:30', '10:15 - 10:30'],
  'Sports Corner Wiki Hii': ['11:30 - 11:45', '12:15 - 12:30', '12:45 - 13:00'],
  'Machweo I Jumapili': ['14:30 - 14:45', '15:30 - 15:45', '16:30 - 16:45'],
  'Machweo II Jumapili': ['17:45 - 18:00', '19:15 - 19:30', '20:30 - 20:45'],
};

/**
 * Traffic Database Interface & LocalStorage Helpers
 * Tracks total ad counts per program per day of week (0=Sun, 1=Mon... 6=Sat)
 */
export type TrafficDatabase = Record<string, Record<number, number>>;

export const TRAFFIC_DB_KEY = 'jrs_traffic_db';

export function getTrafficDb(): TrafficDatabase {
  try {
    const raw = localStorage.getItem(TRAFFIC_DB_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (err) {
    console.error('Error loading jrs_traffic_db from localStorage:', err);
    return {};
  }
}

export function saveSpotsToTrafficDb(
  spots: Array<{
    timeBetween?: string;
    scheduledTime?: string;
    date?: string;
    dayOfWeek?: number;
    programName?: string;
  }>
): TrafficDatabase {
  try {
    const db = getTrafficDb();

    spots.forEach((spot) => {
      // Determine day of week
      let day = typeof spot.dayOfWeek === 'number' ? spot.dayOfWeek : 1;
      if (spot.date && isNaN(day)) {
        const d = new Date(spot.date + 'T00:00:00');
        if (!isNaN(d.getTime())) day = d.getDay();
      }

      // Determine time
      let timeStr = spot.scheduledTime || '';
      if (!timeStr && spot.timeBetween) {
        timeStr = spot.timeBetween.split('-')[0].trim();
      }

      // Determine program
      let program = spot.programName;
      if (!program && timeStr) {
        const show = getShowForTime(timeStr, day);
        if (show) program = show.name;
      }
      if (!program) program = 'General Broadcast';

      if (!db[program]) {
        db[program] = {};
      }
      db[program][day] = (db[program][day] || 0) + 1;
    });

    localStorage.setItem(TRAFFIC_DB_KEY, JSON.stringify(db));
    return db;
  } catch (err) {
    console.error('Error saving to jrs_traffic_db:', err);
    return {};
  }
}

export interface SmartPlacementResult {
  programName: string;
  timeRange: string;
  startTime: string;
  endTime: string;
  relevanceScore: number;
  congestionStatus: string;
  congestionLevel: 'low' | 'moderate' | 'high';
  currentAdCount: number;
  dayOfWeek: number;
  reason: string;
  category: string;
}

/**
 * Smart Placement Suggestion Engine
 * Step A: Look up CATEGORY_PROGRAM_MAP for top 3 most relevant programs
 * Step B: Query jrs_traffic_db for current ad density/congestion in those programs
 * Step C: Filter out heavily congested time slots
 * Step D: Return ranked list with Program Name, Time Range, Relevance Score, Congestion Status
 * Fallback: If jrs_traffic_db is empty, use SHOW_TIMING_TEMPLATES
 */
export function getSmartPlacementSuggestions(
  adCategory: string,
  dayOfWeek: number = 1,
  adName: string = '',
  tier: ClientTier | string = 'B'
): SmartPlacementResult[] {
  // Step A: Find top 3 most relevant programs for category
  let matchedPrograms: string[] = CATEGORY_PROGRAM_MAP[adCategory] || [];

  if (!matchedPrograms.length) {
    // Fuzzy search through map keys
    const catLower = adCategory.toLowerCase().trim();
    const foundKey = Object.keys(CATEGORY_PROGRAM_MAP).find(
      (k) => catLower.includes(k.toLowerCase()) || k.toLowerCase().includes(catLower)
    );
    if (foundKey) {
      matchedPrograms = CATEGORY_PROGRAM_MAP[foundKey];
    } else {
      matchedPrograms = ['Asubuhi Njema', 'Mseto Leo', 'Mchakato'];
    }
  }

  // Limit to top 3 programs
  const topPrograms = matchedPrograms.slice(0, 3);

  // Step B: Query jrs_traffic_db
  const trafficDb = getTrafficDb();
  const hasTrafficData = Object.keys(trafficDb).length > 0;

  const suggestions: SmartPlacementResult[] = [];

  topPrograms.forEach((progName, progIndex) => {
    // Determine ad count from traffic DB
    const progData = trafficDb[progName] || {};
    const dayAdCount = progData[dayOfWeek] !== undefined ? progData[dayOfWeek] : 0;
    const totalProgramAds = Object.values(progData).reduce((sum, c) => sum + c, 0);
    const effectiveAdCount = hasTrafficData ? dayAdCount : 0;

    // Get time slots: check SHOW_TIMING_TEMPLATES or official timetable
    let availableSlots: string[] = SHOW_TIMING_TEMPLATES[progName] || [];
    if (!availableSlots.length) {
      // Find show in timetable
      const show = OFFICIAL_TIMETABLE_2026.find(
        (s) => s.name.toLowerCase() === progName.toLowerCase()
      );
      if (show) {
        const [sH, sM] = show.startTime.split(':').map(Number);
        const [eH, eM] = show.endTime.split(':').map(Number);
        const midH = Math.floor((sH + eH) / 2);
        const pad = (n: number) => n.toString().padStart(2, '0');
        availableSlots = [
          `${pad(sH)}:30 - ${pad(sH)}:45`,
          `${pad(midH)}:15 - ${pad(midH)}:30`,
          `${pad(Math.max(sH, eH - 1))}:00 - ${pad(Math.max(sH, eH - 1))}:15`,
        ];
      } else {
        availableSlots = ['07:30 - 07:45', '13:15 - 13:30', '17:15 - 17:30'];
      }
    }

    availableSlots.forEach((slot, slotIndex) => {
      const [startStr = '', endStr = ''] = slot.split('-').map((s) => s.trim());

      // Congestion analysis based on traffic DB count (and slot index)
      // Low: 0-2 ads, Moderate: 3-5 ads, High: >= 6 ads
      const estimatedSlotLoad = effectiveAdCount + slotIndex;
      let congestionLevel: 'low' | 'moderate' | 'high' = 'low';
      let congestionStatus = 'Low Traffic - Highly Recommended';

      if (!hasTrafficData) {
        // Fallback status when DB is initial / clean
        if (slotIndex === 0) {
          congestionLevel = 'low';
          congestionStatus = 'Optimal Airtime - Highly Recommended';
        } else if (slotIndex === 1) {
          congestionLevel = 'low';
          congestionStatus = 'Prime Placement - Balanced Load';
        } else {
          congestionLevel = 'moderate';
          congestionStatus = 'Standard Traffic - Good Availability';
        }
      } else {
        if (estimatedSlotLoad <= 2) {
          congestionLevel = 'low';
          congestionStatus = 'Low Traffic - Highly Recommended';
        } else if (estimatedSlotLoad <= 5) {
          congestionLevel = 'moderate';
          congestionStatus = 'Moderate Traffic - Optimal Slot';
        } else {
          congestionLevel = 'high';
          congestionStatus = 'Heavy Congestion - Alternate Slot Advised';
        }
      }

      // Step C: Filter out heavily congested time slots if possible
      // If heavily congested, we lower the relevance score and place at end
      let relevance = 98 - progIndex * 7 - slotIndex * 3;
      if (congestionLevel === 'high') {
        relevance -= 25;
      } else if (congestionLevel === 'moderate') {
        relevance -= 6;
      }

      // Tier adjustments
      if (tier === 'A' && (progName.includes('Asubuhi') || progName.includes('Mseto'))) {
        relevance += 3;
      }

      // Ad Name keyword boost if sports or youth
      if (adName) {
        const lowerName = adName.toLowerCase();
        if ((lowerName.includes('sport') || lowerName.includes('bet')) && progName.includes('Sport')) {
          relevance += 5;
        }
      }

      const finalScore = Math.min(99, Math.max(45, relevance));

      const reason =
        congestionLevel === 'low'
          ? `Kipindi cha ${progName} kinalingana kikamilifu na sekta ya ${adCategory}. Msongamano uko chini (${effectiveAdCount} matangazo kurekodiwa).`
          : congestionLevel === 'moderate'
          ? `Kipindi cha ${progName} kina mvuto mkubwa na wasikilizaji wengi. Nafasi inapatikana.`
          : `Msongamano ni mkubwa (${effectiveAdCount} matangazo). Zingatia kuchagua masaa ya asubuhi au mchana.`;

      suggestions.push({
        programName: progName,
        timeRange: slot,
        startTime: startStr,
        endTime: endStr,
        relevanceScore: finalScore,
        congestionStatus,
        congestionLevel,
        currentAdCount: effectiveAdCount,
        dayOfWeek,
        reason,
        category: adCategory,
      });
    });
  });

  // Step D: Return ranked list
  return suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// Category to Genre affinity matrix (Legacy support)
const CATEGORY_AFFINITY: { [category: string]: { preferredGenres: string[]; boostKeywords: string[] } } = {
  'Health Campaign': {
    preferredGenres: ['Breakfast News', 'Midday Affairs'],
    boostKeywords: ['Mchakato', 'Asubuhi Njema'],
  },
  Telecommunications: {
    preferredGenres: ['Breakfast News', 'Drivetime Flagship', 'Youth Lifestyle'],
    boostKeywords: ['Asubuhi Njema', 'Mseto Leo', 'Connector'],
  },
  'Banking & Finance': {
    preferredGenres: ['Breakfast News', 'Drivetime Flagship', 'Midday Affairs'],
    boostKeywords: ['Asubuhi Njema', 'Mseto Leo'],
  },
  'Sports & Gaming': {
    preferredGenres: ['Sports', 'Evening Sports'],
    boostKeywords: ['Nje ya Dimba', 'Sports Corner', 'Sports Corner Wiki Hii'],
  },
  'Agriculture & Manufacturing': {
    preferredGenres: ['Midday Affairs', 'Breakfast News'],
    boostKeywords: ['Mchakato', 'Asubuhi Njema'],
  },
  'Religious & NGO': {
    preferredGenres: ['Spiritual', 'Midday Affairs', 'Late Night'],
    boostKeywords: ['Tumwimbie Bwana', 'Mchakato', 'Usiku Mwanana'],
  },
  'Youth & Entertainment': {
    preferredGenres: ['Youth Lifestyle', 'Drivetime Flagship', 'Weekend Magazine'],
    boostKeywords: ['Connector', 'Mseto Leo', 'Machweo II Jumamosi'],
  },
};

export function getSmartAdPlacementSuggestions(
  category: string,
  tier: ClientTier,
  range: RangeOption = '30m',
  dayOfWeek: number = 1,
  existingAds: AdMention[] = []
): SlotSuggestion[] {
  const dayType = dayOfWeek === 0 ? 'sunday' : dayOfWeek === 6 ? 'saturday' : 'weekday';
  const shows = OFFICIAL_TIMETABLE_2026.filter((s) => s.dayType === dayType);
  const affinity = CATEGORY_AFFINITY[category] || {
    preferredGenres: ['Breakfast News', 'Drivetime Flagship'],
    boostKeywords: ['Asubuhi Njema', 'Mseto Leo'],
  };

  const suggestions: SlotSuggestion[] = [];

  shows.forEach((show) => {
    const [sH, sM] = show.startTime.split(':').map(Number);
    const [eH, eM] = show.endTime.split(':').map(Number);
    let startMin = sH * 60 + sM;
    let endMin = eH * 60 + eM;
    if (endMin < startMin) endMin += 24 * 60;

    const interval = range === '30m' ? 30 : range === '45m' ? 45 : 60;
    const slotDuration = 15;

    for (let m = startMin + 15; m < endMin - 10; m += interval) {
      const slotStartH = Math.floor((m % (24 * 60)) / 60);
      const slotStartM = m % 60;
      const slotEndTotal = m + slotDuration;
      const slotEndH = Math.floor((slotEndTotal % (24 * 60)) / 60);
      const slotEndM = slotEndTotal % 60;

      const pad = (n: number) => n.toString().padStart(2, '0');
      const startStr = `${pad(slotStartH)}:${pad(slotStartM)}`;
      const endStr = `${pad(slotEndH)}:${pad(slotEndM)}`;
      const slotRangeStr = `${startStr} - ${endStr}`;

      const adsInSlot = existingAds.filter((ad) => {
        if (ad.programName.toLowerCase() === show.name.toLowerCase()) {
          const adTime = ad.scheduledTime;
          const [aH, aM] = adTime.split(':').map(Number);
          const adMin = (aH || 0) * 60 + (aM || 0);
          return Math.abs(adMin - m) <= 15;
        }
        return false;
      });

      const currentDensitySeconds = adsInSlot.reduce((sum, a) => sum + (a.durationSec || 30), 0);
      const congestionLevel: 'low' | 'moderate' | 'high' =
        currentDensitySeconds < 60 ? 'low' : currentDensitySeconds < 150 ? 'moderate' : 'high';

      let score = 50;
      if (affinity.preferredGenres.includes(show.genre)) score += 25;
      if (tier === 'A') {
        if (show.primeLevel === 'Prime A') score += 20;
        else if (show.primeLevel === 'Prime B') score += 10;
        else score -= 10;
      } else if (tier === 'B') {
        if (show.primeLevel === 'Prime B' || show.primeLevel === 'Prime A') score += 15;
        else score += 5;
      } else if (tier === 'C') {
        if (show.primeLevel === 'Standard') score += 15;
        else if (show.primeLevel === 'Prime B') score += 10;
      } else {
        if (show.primeLevel === 'Off-Peak') score += 20;
        else if (show.primeLevel === 'Standard') score += 10;
      }

      if (congestionLevel === 'low') score += 15;
      else if (congestionLevel === 'high') score -= 25;

      if (affinity.boostKeywords.some((kw) => show.name.toLowerCase().includes(kw.toLowerCase()))) {
        score += 10;
      }

      const finalScore = Math.min(99, Math.max(15, score));
      let reason = '';
      if (affinity.preferredGenres.includes(show.genre) && congestionLevel === 'low') {
        reason = `Lugha na maudhui ya kipindi (${show.genre}) yanalandana kikamilifu na sekta ya ${category}, na msongamano wa matangazo uko chini.`;
      } else if (congestionLevel === 'high') {
        reason = `Kipindi kina mvuto mkubwa lakini tayari kina matangazo kadhaa.`;
      } else {
        reason = `Inafaa kwa hadhira ya jumla ya ${show.name}.`;
      }

      suggestions.push({
        timeSlot: slotRangeStr,
        startTime: startStr,
        endTime: endStr,
        showName: show.name,
        showId: show.id,
        genre: show.genre,
        primeLevel: show.primeLevel,
        suitabilityScore: finalScore,
        congestionLevel,
        currentDensitySeconds,
        reason,
        matchHighlight: `${show.primeLevel} • ${show.genre} • Ufaafu ${finalScore}%`,
      });
    }
  });

  return suggestions.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
}

export function generateBalancedSlots(
  category: string,
  tier: ClientTier,
  count: number = 3,
  existingAds: AdMention[] = []
): string[] {
  // Use new smart placement engine
  const smartResults = getSmartPlacementSuggestions(category, 1, '', tier);
  if (smartResults.length > 0) {
    const uniqueShows = new Set<string>();
    const picked: string[] = [];
    for (const res of smartResults) {
      if (!uniqueShows.has(res.programName) && res.congestionLevel !== 'high') {
        picked.push(res.timeRange);
        uniqueShows.add(res.programName);
        if (picked.length >= count) break;
      }
    }
    if (picked.length < count) {
      for (const res of smartResults) {
        if (!picked.includes(res.timeRange)) {
          picked.push(res.timeRange);
          if (picked.length >= count) break;
        }
      }
    }
    if (picked.length > 0) return picked.slice(0, count);
  }

  const suggestions = getSmartAdPlacementSuggestions(category, tier, '45m', 1, existingAds);
  const chosenSlots: string[] = [];
  const usedShows = new Set<string>();

  for (const s of suggestions) {
    if (!usedShows.has(s.showName) && s.congestionLevel !== 'high') {
      chosenSlots.push(s.timeSlot);
      usedShows.add(s.showName);
      if (chosenSlots.length >= count) break;
    }
  }

  if (chosenSlots.length < count) {
    for (const s of suggestions) {
      if (!chosenSlots.includes(s.timeSlot)) {
        chosenSlots.push(s.timeSlot);
        if (chosenSlots.length >= count) break;
      }
    }
  }

  return chosenSlots.slice(0, count);
}

