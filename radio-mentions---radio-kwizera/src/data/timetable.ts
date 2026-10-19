// Official 2026 Radio Kwizera Broadcasting Timetable Reference Data
// Frequency: 97.7 FM • Slogan: Jukwaa la Matumaini

export interface BroadcastShow {
  id: string;
  name: string;
  title: string;
  timeSlot: string;
  time: string;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  dayType: 'weekday' | 'saturday' | 'sunday';
  daysOfWeek: number[];
  genre: string;
  targetAudience: string;
  primeLevel: string;
  adCapacityMinutes: number; // standard commercial limit per show
}

interface RawBroadcastShow {
  id: string;
  name: string;
  timeSlot: string;
  startTime: string;
  endTime: string;
  dayType: 'weekday' | 'saturday' | 'sunday';
  genre: string;
  targetAudience: string;
  primeLevel: string;
  adCapacityMinutes: number;
}

const RAW_TIMETABLE: RawBroadcastShow[] = [
  // WEEKDAYS (Monday - Friday)
  {
    id: 'prog-wd-asubuhi',
    name: 'Asubuhi Njema',
    timeSlot: '06:00-09:00',
    startTime: '06:00',
    endTime: '09:00',
    dayType: 'weekday',
    genre: 'Breakfast News',
    targetAudience: 'General public, workers, commuters, business owners',
    primeLevel: 'Prime A',
    adCapacityMinutes: 18,
  },
  {
    id: 'prog-wd-dimba',
    name: 'Nje ya Dimba',
    timeSlot: '09:00-11:00',
    startTime: '09:00',
    endTime: '11:00',
    dayType: 'weekday',
    genre: 'Sports',
    targetAudience: 'Sports enthusiasts, youth, traders, sports betting clients',
    primeLevel: 'Prime B',
    adCapacityMinutes: 12,
  },
  {
    id: 'prog-wd-mchakato',
    name: 'Mchakato',
    timeSlot: '11:00-13:00',
    startTime: '11:00',
    endTime: '13:00',
    dayType: 'weekday',
    genre: 'Midday Affairs',
    targetAudience: 'Families, market traders, farmers, health & community programs',
    primeLevel: 'Standard',
    adCapacityMinutes: 12,
  },
  {
    id: 'prog-wd-connector',
    name: 'Connector',
    timeSlot: '14:00-16:00',
    startTime: '14:00',
    endTime: '16:00',
    dayType: 'weekday',
    genre: 'Youth Lifestyle',
    targetAudience: 'Youth, university/secondary students, urban music lovers',
    primeLevel: 'Standard',
    adCapacityMinutes: 12,
  },
  {
    id: 'prog-wd-mseto',
    name: 'Mseto Leo',
    timeSlot: '16:00-18:30',
    startTime: '16:00',
    endTime: '18:30',
    dayType: 'weekday',
    genre: 'Drivetime Flagship',
    targetAudience: 'Drivetime commuters, evening listeners, corporate & FMCG',
    primeLevel: 'Prime A',
    adCapacityMinutes: 15,
  },
  {
    id: 'prog-wd-sports-corner',
    name: 'Sports Corner',
    timeSlot: '19:30-21:25',
    startTime: '19:30',
    endTime: '21:25',
    dayType: 'weekday',
    genre: 'Evening Sports',
    targetAudience: 'Evening sports fans, soccer fans, international match followers',
    primeLevel: 'Prime B',
    adCapacityMinutes: 12,
  },
  {
    id: 'prog-wd-usiku',
    name: 'Usiku Mwanana',
    timeSlot: '22:00-01:00',
    startTime: '22:00',
    endTime: '01:00',
    dayType: 'weekday',
    genre: 'Late Night',
    targetAudience: 'Late night relaxers, night-shift workers, soft-spoken advice',
    primeLevel: 'Off-Peak',
    adCapacityMinutes: 15,
  },

  // SATURDAY
  {
    id: 'prog-sat-asubuhi',
    name: 'Asubuhi Njema Jumamosi',
    timeSlot: '06:00-10:00',
    startTime: '06:00',
    endTime: '10:00',
    dayType: 'saturday',
    genre: 'Breakfast News',
    targetAudience: 'Weekend morning families, shoppers, community groups',
    primeLevel: 'Prime A',
    adCapacityMinutes: 20,
  },
  {
    id: 'prog-sat-dimba',
    name: 'Nje ya Dimba',
    timeSlot: '10:00-13:00',
    startTime: '10:00',
    endTime: '13:00',
    dayType: 'saturday',
    genre: 'Sports',
    targetAudience: 'Weekend sports fans, weekend league listeners',
    primeLevel: 'Prime A',
    adCapacityMinutes: 18,
  },
  {
    id: 'prog-sat-machweo-1',
    name: 'Machweo I Jumamosi',
    timeSlot: '14:00-17:00',
    startTime: '14:00',
    endTime: '17:00',
    dayType: 'saturday',
    genre: 'Weekend Magazine',
    targetAudience: 'Afternoon leisure, community events, entertainment',
    primeLevel: 'Standard',
    adCapacityMinutes: 18,
  },
  {
    id: 'prog-sat-machweo-2',
    name: 'Machweo II Jumamosi',
    timeSlot: '17:00-21:30',
    startTime: '17:00',
    endTime: '21:30',
    dayType: 'saturday',
    genre: 'Weekend Magazine',
    targetAudience: 'Saturday evening party & lifestyle, music lovers',
    primeLevel: 'Prime B',
    adCapacityMinutes: 24,
  },
  {
    id: 'prog-sat-usiku',
    name: 'Usiku Mwanana',
    timeSlot: '22:00-01:00',
    startTime: '22:00',
    endTime: '01:00',
    dayType: 'saturday',
    genre: 'Late Night',
    targetAudience: 'Saturday night listeners',
    primeLevel: 'Off-Peak',
    adCapacityMinutes: 15,
  },

  // SUNDAY
  {
    id: 'prog-sun-tumwimbie',
    name: 'Tumwimbie Bwana',
    timeSlot: '06:00-11:00',
    startTime: '06:00',
    endTime: '11:00',
    dayType: 'sunday',
    genre: 'Spiritual',
    targetAudience: 'Sunday worshipers, church congregations, Christian community',
    primeLevel: 'Prime A',
    adCapacityMinutes: 25,
  },
  {
    id: 'prog-sun-sports-wiki',
    name: 'Sports Corner Wiki Hii',
    timeSlot: '11:00-13:00',
    startTime: '11:00',
    endTime: '13:00',
    dayType: 'sunday',
    genre: 'Sports',
    targetAudience: 'Sunday sports recap, match commentary',
    primeLevel: 'Prime B',
    adCapacityMinutes: 12,
  },
  {
    id: 'prog-sun-machweo-1',
    name: 'Machweo I Jumapili',
    timeSlot: '14:00-17:00',
    startTime: '14:00',
    endTime: '17:00',
    dayType: 'sunday',
    genre: 'Weekend Magazine',
    targetAudience: 'Sunday afternoon family relaxers',
    primeLevel: 'Standard',
    adCapacityMinutes: 18,
  },
  {
    id: 'prog-sun-machweo-2',
    name: 'Machweo II Jumapili',
    timeSlot: '17:00-21:30',
    startTime: '17:00',
    endTime: '21:30',
    dayType: 'sunday',
    genre: 'Weekend Magazine',
    targetAudience: 'Sunday evening preparation for the week, music, requests',
    primeLevel: 'Standard',
    adCapacityMinutes: 24,
  },
  {
    id: 'prog-sun-usiku',
    name: 'Usiku Mwanana',
    timeSlot: '22:00-01:00',
    startTime: '22:00',
    endTime: '01:00',
    dayType: 'sunday',
    genre: 'Late Night',
    targetAudience: 'Sunday night listeners',
    primeLevel: 'Off-Peak',
    adCapacityMinutes: 15,
  },
];

export const OFFICIAL_TIMETABLE_2026: BroadcastShow[] = RAW_TIMETABLE.map((s) => ({
  ...s,
  title: s.name,
  time: s.timeSlot,
  daysOfWeek: s.dayType === 'sunday' ? [0] : s.dayType === 'saturday' ? [6] : [1, 2, 3, 4, 5],
}));

// Helper to get all shows for a specific day of the week (0 = Sun, 6 = Sat, 1-5 = Weekday)
export function getShowsForDay(dayOfWeek: number): BroadcastShow[] {
  const dayType = dayOfWeek === 0 ? 'sunday' : dayOfWeek === 6 ? 'saturday' : 'weekday';
  return OFFICIAL_TIMETABLE_2026.filter((s) => s.dayType === dayType || s.daysOfWeek.includes(dayOfWeek));
}

// Helper to get show for a specific time and day
export function getShowForTime(timeStr: string, dayOfWeek: number): BroadcastShow | undefined {
  // dayOfWeek: 0 = Sun, 6 = Sat, 1-5 = Weekday
  const dayType = dayOfWeek === 0 ? 'sunday' : dayOfWeek === 6 ? 'saturday' : 'weekday';
  const shows = OFFICIAL_TIMETABLE_2026.filter((s) => s.dayType === dayType);

  const [tH, tM] = timeStr.split(':').map(Number);
  const timeMinutes = (tH || 0) * 60 + (tM || 0);

  return shows.find((show) => {
    const [sH, sM] = show.startTime.split(':').map(Number);
    const [eH, eM] = show.endTime.split(':').map(Number);
    let startMin = sH * 60 + sM;
    let endMin = eH * 60 + eM;
    if (endMin < startMin) {
      // wraps past midnight (e.g. 22:00 - 01:00)
      endMin += 24 * 60;
      let adjTime = timeMinutes;
      if (adjTime < startMin) adjTime += 24 * 60;
      return adjTime >= startMin && adjTime < endMin;
    }
    return timeMinutes >= startMin && timeMinutes < endMin;
  });
}
