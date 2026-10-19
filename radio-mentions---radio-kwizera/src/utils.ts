import { AdCampaign, ScheduledSpotItem, CampaignAdType } from './types';
import { getShowForTime } from './data/timetable';

// Format currency in Tanzanian Shillings (TZS)
export function formatTZS(amount: number): string {
  return 'TZS ' + (amount || 0).toLocaleString('en-US');
}

// Format date to readable string
export function formatReadableDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('sw-TZ', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Get day of week name (Swahili / English)
export function getDayName(dayOfWeek: number, lang: 'sw' | 'en' = 'sw'): string {
  const swDays = ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'];
  const enDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return lang === 'sw' ? swDays[dayOfWeek] : enDays[dayOfWeek];
}

// Calculate days remaining until campaign expiration
export function getDaysRemaining(endDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDateStr + 'T00:00:00');
  const diffTime = end.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Expiration alert color status
export interface ExpirationStatus {
  code: 'green' | 'amber' | 'orange' | 'red' | 'purple';
  label: string;
  daysRemaining: number;
  badgeClass: string;
}

export function getExpirationStatus(endDateStr: string): ExpirationStatus {
  const days = getDaysRemaining(endDateStr);
  if (days < 0) {
    return {
      code: 'purple',
      label: `Imechelewa siku ${Math.abs(days)} (Past Due)`,
      daysRemaining: days,
      badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-700',
    };
  }
  if (days <= 1) {
    return {
      code: 'red',
      label: days === 0 ? 'Inaisha Leo (Expires Today)' : 'Inaisha Kesho (Expires Tomorrow)',
      daysRemaining: days,
      badgeClass: 'bg-red-950/80 text-red-300 border-red-700 animate-pulse',
    };
  }
  if (days <= 3) {
    return {
      code: 'orange',
      label: `Zimebaki siku ${days} (1-3 Days)`,
      daysRemaining: days,
      badgeClass: 'bg-orange-950/80 text-orange-300 border-orange-700',
    };
  }
  if (days <= 7) {
    return {
      code: 'amber',
      label: `Zimebaki siku ${days} (3-7 Days)`,
      daysRemaining: days,
      badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-700',
    };
  }
  return {
    code: 'green',
    label: `Zimebaki siku ${days} (Active 7+ Days)`,
    daysRemaining: days,
    badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-700',
  };
}

// Generate the complete list of ScheduledSpotItems for a campaign based on its timeSlotConfig
export function generateCampaignSpots(
  campaignId: string,
  campaignName: string,
  clientName: string,
  adType: CampaignAdType,
  startDateStr: string,
  durationDays: number,
  config: AdCampaign['timeSlotConfig'],
  existingSpots: ScheduledSpotItem[] = []
): ScheduledSpotItem[] {
  const spots: ScheduledSpotItem[] = [];
  const start = new Date(startDateStr + 'T00:00:00');

  const baseSlots = (config.customSlots && config.customSlots.length > 0)
    ? config.customSlots
    : (config.timeSlots && config.timeSlots.length > 0)
      ? config.timeSlots
      : ['07:30 - 07:45', '12:45 - 13:00', '17:15 - 17:30'];

  // 1. Check Smart Day Jumping (Auto-Distribute spots evenly over campaign days)
  const isDayJumping = !!(config.smartDayJumping || config.rotationPattern === 'day_jumping');
  const targetTotalSpots = config.totalSpotsTarget && config.totalSpotsTarget > 0 ? config.totalSpotsTarget : null;

  // If Smart Day Jumping is active with a target count, calculate the scheduled days
  let jumpingActiveDays: Set<number> | null = null;
  let jumpingDailyCounts: { [dayIdx: number]: number } | null = null;

  if (isDayJumping && targetTotalSpots) {
    jumpingDailyCounts = {};
    jumpingActiveDays = new Set();
    const effectiveDays = Math.max(1, durationDays);

    if (targetTotalSpots <= effectiveDays) {
      for (let i = 0; i < targetTotalSpots; i++) {
        const dIdx = targetTotalSpots === 1 
          ? 0 
          : Math.min(effectiveDays - 1, Math.round((i * (effectiveDays - 1)) / (targetTotalSpots - 1)));
        jumpingActiveDays.add(dIdx);
        jumpingDailyCounts[dIdx] = (jumpingDailyCounts[dIdx] || 0) + 1;
      }
    } else {
      const basePerDay = Math.floor(targetTotalSpots / effectiveDays);
      const remainder = targetTotalSpots % effectiveDays;
      for (let d = 0; d < effectiveDays; d++) {
        jumpingActiveDays.add(d);
        jumpingDailyCounts[d] = basePerDay + (d < remainder ? 1 : 0);
      }
    }
  }

  for (let dayIdx = 0; dayIdx < durationDays; dayIdx++) {
    const current = new Date(start);
    current.setDate(start.getDate() + dayIdx);

    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayOfWeek = current.getDay(); // 0 = Sun, 6 = Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // RULE 1: Specific Day-of-Week Filter (NEW: Day Specific Mentions)
    if (config.dayOfWeekFilter && config.dayOfWeekFilter.length > 0) {
      if (!config.dayOfWeekFilter.includes(dayOfWeek)) {
        continue;
      }
    }

    // RULE 2: Smart Day Jumping filter
    if (isDayJumping && targetTotalSpots && jumpingActiveDays) {
      if (!jumpingActiveDays.has(dayIdx)) {
        continue;
      }
    }

    // Determine slots for this day
    let daySlots: string[] = [];

    // RULE 3: Variable Days Mode (Custom Mentions & Timings Per Day of the Week)
    if (config.variableDaysMode && config.variableDayConfig) {
      const daySetting = config.variableDayConfig[dayOfWeek];
      if (daySetting) {
        if (!daySetting.enabled) {
          continue; // Day disabled for variable days
        }
        if (daySetting.slots && daySetting.slots.length > 0) {
          daySlots = [...daySetting.slots];
        }
      }
    }

    // If daySlots not set by variable days mode, use default rules
    if (daySlots.length === 0) {
      // RULE 4: First Day Slot Timing Override (Day 1 only)
      if (dayIdx === 0 && config.firstDayOverride && config.firstDaySlots && config.firstDaySlots.length > 0) {
        daySlots = [...config.firstDaySlots];
      } 
      // RULE 5: Separate Weekend Time Slots (Saturdays & Sundays)
      else if (isWeekend && config.separateWeekendTimes) {
        if (dayOfWeek === 6 && config.saturdaySlots && config.saturdaySlots.length > 0) {
          daySlots = [...config.saturdaySlots];
        } else if (dayOfWeek === 0 && config.sundaySlots && config.sundaySlots.length > 0) {
          daySlots = [...config.sundaySlots];
        } else if (config.weekendSlots && config.weekendSlots.length > 0) {
          daySlots = [...config.weekendSlots];
        } else {
          daySlots = [...baseSlots];
        }
      } 
      // General weekend override fallback
      else if (isWeekend && (config.rotationPattern === 'weekend_override' || config.weekendOverride) && config.weekendOverride && config.weekendOverride.length > 0) {
        daySlots = [...config.weekendOverride];
      } else {
        daySlots = [...baseSlots];
      }
    }

    // RULE 6: Cyclic Time Loop Rotation (Cycle ad slots through different times daily)
    const isCyclic = !!(config.cyclicRotation || config.rotationPattern === 'cyclic');
    if (isCyclic && daySlots.length > 0) {
      const shift = dayIdx % daySlots.length;
      daySlots = [...daySlots.slice(shift), ...daySlots.slice(0, shift)];
    }

    // If Smart Day Jumping specified a quota of spots for this day
    if (isDayJumping && targetTotalSpots && jumpingDailyCounts) {
      const neededCount = jumpingDailyCounts[dayIdx] || 1;
      if (daySlots.length > neededCount) {
        daySlots = daySlots.slice(0, neededCount);
      }
    }

    daySlots.forEach((slot, slotIdx) => {
      const startTime = slot.split('-')[0]?.trim() || '12:00';
      const show = getShowForTime(startTime, dayOfWeek);
      const programName = show?.name || (isWeekend ? 'Machweo Jumamosi' : 'Mseto Leo');
      const programId = show?.id || 'prog-wd-mseto';

      const spotId = `spot-${campaignId}-${dateStr}-${slotIdx}`;
      
      // Check if spot was already marked as aired in existing data
      const existing = existingSpots.find((s) => s.id === spotId || (s.date === dateStr && s.timeBetween === slot));

      spots.push({
        id: spotId,
        campaignId,
        campaignName,
        clientName,
        date: dateStr,
        dayName: `${getDayName(dayOfWeek, 'sw')} / ${getDayName(dayOfWeek, 'en')}`,
        dayOfWeek,
        description: `${adType} ya ${clientName} - ${campaignName}`,
        adType,
        timeBetween: slot,
        programName,
        programId,
        timeAired: existing?.timeAired,
        signature: existing?.signature,
        signedBy: existing?.signedBy,
        isAired: !!existing?.isAired,
        isWeekend,
      });
    });
  }

  return spots;
}

// EXPORT 1: CSV Export
export function exportSpotsToCSV(spots: ScheduledSpotItem[], filenameOrCampaignName: string = 'Ratiba_Spots'): void {
  const headers = 'Tarehe (Date),Siku (Day),Mteja (Client),Kampeni (Campaign),Aina (Type),Muda (Time Slot),Kipindi (Show),Maelezo (Description),Imerushwa (Aired),Muda Uliorushwa (Aired Time),Saini (Signature)\n';
  const rows = spots
    .map((s) => {
      return `"${s.date}","${s.dayName}","${s.clientName || ''}","${s.campaignName || ''}","${s.adType}","${s.timeBetween}","${s.programName}","${(s.description || '').replace(/"/g, '""')}","${s.isAired ? 'NDIYO' : 'BADO'}","${s.timeAired || ''}","${s.signature || s.signedBy || ''}"`;
    })
    .join('\n');

  const csvContent = headers + rows;
  const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const safeName = (filenameOrCampaignName || 'Schedule').replace(/[^a-zA-Z0-9_-]/g, '_');
  link.setAttribute('download', `Radio_Kwizera_${safeName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportCampaignToCSV(campaign: AdCampaign): void {
  exportSpotsToCSV(campaign.scheduledSpots || [], `${campaign.clientName}_${campaign.name}`);
}

// EXPORT 2: MS Word Document (.doc) HTML Export
export function exportSpotsToWord(
  spots: ScheduledSpotItem[],
  campaignName: string = 'Ratiba ya Matangazo',
  clientName: string = 'Radio Kwizera',
  script: string = ''
): void {
  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>Ratiba ya Matangazo - ${campaignName}</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #FF0000; padding-bottom: 10px; margin-bottom: 20px; }
        .station { color: #003366; font-size: 24pt; font-weight: bold; }
        .slogan { color: #6B4C9A; font-size: 13pt; font-style: italic; }
        .meta { margin-bottom: 20px; font-size: 11pt; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background-color: #003366; color: #ffffff; padding: 8px; border: 1px solid #ccc; font-size: 10pt; }
        td { padding: 7px; border: 1px solid #ccc; font-size: 9.5pt; text-align: left; }
        .weekend { background-color: #f2f6fc; }
        .script-box { background: #fdfaf0; border: 1px solid #eedcba; padding: 12px; margin-top: 20px; font-family: 'Georgia', serif; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="station">RADIO KWIZERA 97.7 FM</div>
        <div class="slogan">Jukwaa la Matumaini • Ngara, Kagera, Tanzania</div>
        <h3>RATIBA RASMI YA MATANGAZO YA KIBIASHARA</h3>
      </div>
      <div class="meta">
        <strong>Mteja (Client):</strong> ${clientName} | 
        <strong>Kampeni:</strong> ${campaignName} | 
        <strong>Jumla ya Spots:</strong> ${spots.length}
      </div>
      <table>
        <thead>
          <tr>
            <th>Tarehe</th>
            <th>Siku</th>
            <th>Mteja / Kampeni</th>
            <th>Aina</th>
            <th>Muda Uliopangwa</th>
            <th>Kipindi / Studio Desk</th>
            <th>Muda Uliorushwa</th>
            <th>Saini ya Mtangazaji</th>
          </tr>
        </thead>
        <tbody>
          ${spots
            .map(
              (s) => `
            <tr class="${s.isWeekend ? 'weekend' : ''}">
              <td>${s.date}</td>
              <td>${s.dayName.split('/')[0]}</td>
              <td>${s.clientName || clientName}</td>
              <td>${s.adType}</td>
              <td><strong>${s.timeBetween}</strong></td>
              <td>${s.programName}</td>
              <td>${s.timeAired || (s.isAired ? 'Imerushwa' : '_________________')}</td>
              <td>${s.signature || s.signedBy || '_________________'}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
      ${
        script
          ? `<div class="script-box">
        <strong>NAKALA YA TANGANYIKA / SCRIPT YA MTANGAZAJI:</strong><br/>
        <p>${script.replace(/\n/g, '<br/>')}</p>
      </div>`
          : ''
      }
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const safeName = (clientName || campaignName || 'Schedule').replace(/[^a-zA-Z0-9_-]/g, '_');
  link.setAttribute('download', `Radio_Kwizera_${safeName}_Schedule.doc`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportCampaignToWord(campaign: AdCampaign): void {
  exportSpotsToWord(campaign.scheduledSpots || [], campaign.name, campaign.clientName, campaign.script);
}

// EXPORT 3: iCalendar (.ics) Export for Google Calendar / Apple Calendar
export function exportSpotsToICS(spots: ScheduledSpotItem[], calendarName: string = 'Radio Kwizera'): void {
  let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Radio Kwizera 97.7 FM//Campaign Scheduler//SW\nCALSCALE:GREGORIAN\n';

  spots.forEach((s) => {
    const cleanDate = s.date.replace(/-/g, '');
    const startTimeParts = (s.timeBetween.split('-')[0] || '12:00').trim().split(':');
    const endTimeParts = (s.timeBetween.split('-')[1] || s.timeBetween.split('-')[0] || '12:15').trim().split(':');

    const dtStart = `${cleanDate}T${startTimeParts[0].padStart(2, '0')}${startTimeParts[1].padStart(2, '0')}00`;
    const dtEnd = `${cleanDate}T${endTimeParts[0].padStart(2, '0')}${endTimeParts[1].padStart(2, '0')}00`;

    icsContent += 'BEGIN:VEVENT\n';
    icsContent += `UID:${s.id}@radiokwizera.org\n`;
    icsContent += `SUMMARY:Radio Kwizera 97.7: ${s.clientName || calendarName} (${s.adType})\n`;
    icsContent += `DESCRIPTION:${s.campaignName || calendarName} on ${s.programName}. Maelezo: ${s.description || ''}\n`;
    icsContent += `LOCATION:Radio Kwizera 97.7 FM Studio Desk\n`;
    icsContent += `DTSTART:${dtStart}\n`;
    icsContent += `DTEND:${dtEnd}\n`;
    icsContent += 'STATUS:CONFIRMED\n';
    icsContent += 'END:VEVENT\n';
  });

  icsContent += 'END:VCALENDAR';

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const safeName = (calendarName || 'Schedule').replace(/[^a-zA-Z0-9_-]/g, '_');
  link.setAttribute('download', `${safeName}_Calendar.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportCampaignToICS(campaign: AdCampaign): void {
  exportSpotsToICS(campaign.scheduledSpots || [], `${campaign.clientName}_${campaign.name}`);
}

// EXPORT 4: Full JSON Backup
export function exportToJSON(data: unknown, filename: string = 'radio_kwizera_backup'): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const safeName = (filename || 'backup').replace(/[^a-zA-Z0-9_-]/g, '_');
  link.setAttribute('download', `${safeName}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportCampaignToJSON(campaign: AdCampaign): void {
  exportToJSON(campaign, `Radio_Kwizera_${campaign.id}_backup`);
}
