import React, { useRef } from 'react';
import {
  Printer,
  FileText,
  X,
  Calendar,
  Clock,
  Building,
  Phone,
  Radio,
} from 'lucide-react';
import { Client, Campaign, ScheduledSpotItem, AdMention } from '../types';
import { OfficialRadioKwizeraLogo } from './logos/RadioKwizeraLogos';
import { useRadioApp } from '../context/RadioAppContext';

interface ClientTimetableReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  campaign?: Campaign;
  adMention?: AdMention;
  spots?: ScheduledSpotItem[];
}

export const ClientTimetableReportModal: React.FC<ClientTimetableReportModalProps> = ({
  isOpen,
  onClose,
  client,
  campaign,
  adMention,
  spots = [],
}) => {
  const { language } = useRadioApp();
  const printContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const campaignTitle = campaign?.name || adMention?.campaignTitle || 'Commercial Campaign';
  const durationSec = campaign?.durationSec || adMention?.durationSec || 45;
  const adFormat = campaign?.type || adMention?.adType || 'Commercial Spot';
  const category = client.category || 'Commercial';

  // Campaign Duration (Start Date to End Date)
  const startDate = campaign?.startDate || '2026-03-01';
  const endDate = campaign?.endDate || '2026-03-31';

  // Total spots for the WHOLE campaign
  const totalCampaignSpots = campaign?.totalSpots
    ? campaign.totalSpots
    : campaign?.scheduledSpots?.length || (spots.length > 0 ? spots.length : 28);

  // Filter or construct weekly schedule grid (Monday through Sunday)
  const weekdays = [
    { key: 1, nameSw: 'Jumatatu', nameEn: 'Monday' },
    { key: 2, nameSw: 'Jumanne', nameEn: 'Tuesday' },
    { key: 3, nameSw: 'Jumatano', nameEn: 'Wednesday' },
    { key: 4, nameSw: 'Alhamisi', nameEn: 'Thursday' },
    { key: 5, nameSw: 'Ijumaa', nameEn: 'Friday' },
    { key: 6, nameSw: 'Jumamosi', nameEn: 'Saturday' },
    { key: 0, nameSw: 'Jumapili', nameEn: 'Sunday' },
  ];

  // Group spots by day of week (One representative repeating week)
  const effectiveSpots = spots.length > 0 ? spots : campaign?.scheduledSpots || [];
  const spotsByDay: { [day: number]: ScheduledSpotItem[] } = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    0: [],
  };

  effectiveSpots.forEach((s) => {
    if (spotsByDay[s.dayOfWeek]) {
      // Avoid duplicate display for repeating slots in a single-week view
      const exists = spotsByDay[s.dayOfWeek].some(
        (existing) => existing.timeBetween === s.timeBetween && existing.programName === s.programName
      );
      if (!exists) {
        spotsByDay[s.dayOfWeek].push(s);
      }
    }
  });

  // Calculate spots in a single standard week
  const weeklySpotCount = Object.values(spotsByDay).reduce((acc, curr) => acc + curr.length, 0);

  // Handle browser printing
  const handlePrint = () => {
    window.print();
  };

  // Export to MS Word (.doc)
  const handleExportWord = () => {
    const filename = `Ratiba_Mteja_${client.name.replace(/\s+/g, '_')}_2026.doc`;
    const headerHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>JRS Radio Kwizera 97.7 FM - Official Client Broadcast Timetable</title>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; color: #0f172a; line-height: 1.4; padding: 24px; }
          .header-box { border-bottom: 2.5pt solid #003366; padding-bottom: 12px; margin-bottom: 18px; }
          .station-title { color: #003366; font-size: 20pt; font-weight: bold; margin: 0; }
          .station-sub { color: #6B4C9A; font-size: 11pt; font-weight: bold; margin-top: 4px; }
          .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10pt; }
          .info-table td { padding: 7px 10px; border: 1px solid #cbd5e1; }
          .label-cell { background-color: #f1f5f9; font-weight: bold; width: 25%; color: #003366; }
          .schedule-table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 10pt; }
          .schedule-table th { background-color: #003366; color: #ffffff; padding: 9px; text-align: left; border: 1px solid #003366; }
          .schedule-table td { padding: 8px 10px; border: 1px solid #cbd5e1; }
          .footer { margin-top: 30px; border-top: 1.5pt solid #003366; padding-top: 14px; font-size: 9.5pt; color: #334155; }
          .contact-bold { font-weight: bold; color: #FF0000; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div class="station-title">JRS RADIO KWIZERA 97.7 FM</div>
          <div class="station-sub">SAUTI YA MATUMAINI | THE VOICE OF HOPE</div>
          <div>Makao Makuu: P.O. Box 154 Ngara, Kagera - Tanzania</div>
        </div>

        <h3 style="color: #003366; margin-top: 0; text-transform: uppercase;">
          OFFICIAL CLIENT BROADCAST TIMETABLE (RATIBA RASMI YA MATANGAZO YA MTEJA)
        </h3>

        <table class="info-table">
          <tr>
            <td class="label-cell">Client Name:</td>
            <td><strong>${client.name}</strong> ${client.company ? `(${client.company})` : ''}</td>
            <td class="label-cell">Campaign Name:</td>
            <td><strong>${campaignTitle}</strong></td>
          </tr>
          <tr>
            <td class="label-cell">Category:</td>
            <td>${category}</td>
            <td class="label-cell">Campaign Duration:</td>
            <td><strong>${startDate} to ${endDate}</strong></td>
          </tr>
          <tr>
            <td class="label-cell">Contact Person:</td>
            <td>${client.contactPerson || client.name} (${client.phone})</td>
            <td class="label-cell">Total Campaign Ads:</td>
            <td><strong>${totalCampaignSpots} Broadcasts (Whole Campaign)</strong></td>
          </tr>
        </table>

        <h4 style="color: #003366; margin-bottom: 8px;">WEEKLY BROADCAST ROTATION SCHEDULE (JUMATATU HADI JUMAPILI)</h4>
        <table class="schedule-table">
          <thead>
            <tr>
              <th style="width: 25%;">Day (Siku)</th>
              <th style="width: 30%;">Airtime Slot (Muda)</th>
              <th style="width: 35%;">Official Program (Kipindi)</th>
              <th style="width: 10%; text-align: center;">Spots/Week</th>
            </tr>
          </thead>
          <tbody>
            ${weekdays
              .map((d) => {
                const daySpots = spotsByDay[d.key] || [];
                if (daySpots.length === 0) {
                  return `
                    <tr>
                      <td><strong>${d.nameSw} (${d.nameEn})</strong></td>
                      <td colspan="3" style="color: #94a3b8; font-style: italic;">Off-air day</td>
                    </tr>
                  `;
                }
                return daySpots
                  .map(
                    (s) => `
                    <tr>
                      <td><strong>${d.nameSw} (${d.nameEn})</strong></td>
                      <td style="font-family: monospace; font-weight: bold; color: #003366;">${s.timeBetween}</td>
                      <td><strong>${s.programName}</strong></td>
                      <td style="text-align: center; font-weight: bold;">1</td>
                    </tr>
                  `
                  )
                  .join('');
              })
              .join('')}
          </tbody>
        </table>

        <div class="footer">
          <p><strong>Radio Kwizera Commercial & Sales Contacts:</strong></p>
          <p>Phone: <span class="contact-bold">+255 739 030 333</span> &nbsp;|&nbsp; <span class="contact-bold">+255 743 872 983</span></p>
          <p>Email: ads@radiokwizera.co.tz | info@radiokwizera.co.tz</p>
          <p>Ngara, Kagera - Tanzania</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', headerHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="client-timetable-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Top Action Bar (hidden in print) */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white">
                {language === 'sw'
                  ? 'Ripoti Rasmi ya Ratiba ya Mteja (Client Timetable)'
                  : 'Official Client Broadcast Timetable Report'}
              </h3>
              <p className="text-[11px] text-slate-400">{client.name} • {campaignTitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'sw' ? 'Chapisha / PDF' : 'Print / PDF'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportWord}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>MS Word (.doc)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Document Canvas */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-slate-100 print:bg-white text-slate-900 print:p-0">
          <div
            ref={printContentRef}
            className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg print:shadow-none print:p-0 border border-slate-200 print:border-none"
          >
            {/* 1. Header with Official JRS Radio Kwizera 97.7 FM Details & Official Logo */}
            <div className="border-b-2 border-[#003366] pb-4 mb-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="shrink-0 flex items-center">
                  <OfficialRadioKwizeraLogo className="h-16 w-16" alt="JRS Radio Kwizera 97.7 FM" />
                </div>

                <div className="text-center sm:text-right space-y-0.5">
                  <h1 className="text-xl font-extrabold text-[#003366] tracking-tight">
                    JRS RADIO KWIZERA 97.7 FM
                  </h1>
                  <p className="text-xs font-bold text-[#6B4C9A] uppercase tracking-wider">
                    SAUTI YA MATUMAINI • THE VOICE OF HOPE
                  </p>
                  <p className="text-[11px] text-slate-600 font-medium">
                    Ngara, Kagera - Tanzania • P.O. Box 154
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs font-bold text-[#003366]">
                <span className="uppercase tracking-wide">
                  {language === 'sw' ? 'RATIBA RASMI YA MATANGAZO YA MTEJA' : 'OFFICIAL CLIENT BROADCAST TIMETABLE'}
                </span>
                <span className="text-slate-500 font-mono font-normal">
                  Ref: RK-COMM-{client.id.slice(0, 6).toUpperCase()}-2026
                </span>
              </div>
            </div>

            {/* 2. Client & Campaign Information Summary Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                  <Building className="w-3.5 h-3.5 text-[#003366]" />
                  <span>{language === 'sw' ? 'Jina la Mteja / Kampuni:' : 'Client / Company Name:'}</span>
                </div>
                <div className="font-bold text-sm text-[#003366]">
                  {client.name} {client.company ? `(${client.company})` : ''}
                </div>
                <div className="text-[11px] text-slate-600">
                  <span className="font-semibold">{language === 'sw' ? 'Sekta:' : 'Category:'}</span> {category}
                </div>
                <div className="text-[11px] text-slate-600">
                  <span className="font-semibold">{language === 'sw' ? 'Mawasiliano:' : 'Contact:'}</span> {client.contactPerson || client.name} ({client.phone})
                </div>
              </div>

              <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-4 pt-2 sm:pt-0">
                <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                  <Radio className="w-3.5 h-3.5 text-[#FF0000]" />
                  <span>{language === 'sw' ? 'Jina la Kampeni & Muda:' : 'Campaign Name & Duration:'}</span>
                </div>
                <div className="font-bold text-sm text-slate-800">{campaignTitle}</div>
                <div className="text-[11px] text-slate-600">
                  <span className="font-semibold">{language === 'sw' ? 'Muda wa Kampeni:' : 'Campaign Duration:'}</span>{' '}
                  <strong className="text-[#003366]">{startDate}</strong> {language === 'sw' ? 'hadi' : 'to'}{' '}
                  <strong className="text-[#003366]">{endDate}</strong>
                </div>
                <div className="text-[11px] text-slate-700">
                  <span className="font-semibold">{language === 'sw' ? 'Jumla ya Matangazo (Kampeni Nzima):' : 'Total Campaign Ads (Whole Campaign):'}</span>{' '}
                  <strong className="text-emerald-700 font-mono text-xs">{totalCampaignSpots} Spots</strong>
                </div>
              </div>
            </div>

            {/* 3. Single-Week Broadcast Table (Monday to Sunday) - Clean & Simple */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-[#003366] uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#6B4C9A]" />
                  {language === 'sw'
                    ? 'Ratiba ya Kila Wiki (Jumatatu hadi Jumapili):'
                    : 'Weekly Broadcast Schedule (Monday to Sunday):'}
                </span>
                <span className="text-[11px] font-mono text-slate-500 font-normal">
                  {weeklySpotCount} {language === 'sw' ? 'matangazo / wiki' : 'spots / week'}
                </span>
              </h3>

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#003366] text-white font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3 border-r border-blue-900 w-[25%]">
                        {language === 'sw' ? 'Siku (Day)' : 'Day of Week'}
                      </th>
                      <th className="py-2.5 px-3 border-r border-blue-900 w-[30%]">
                        {language === 'sw' ? 'Muda Uliotengwa (Time)' : 'Scheduled Airtime'}
                      </th>
                      <th className="py-2.5 px-3 border-r border-blue-900">
                        {language === 'sw' ? 'Kipindi Rasmi (Show)' : 'Target Program'}
                      </th>
                      <th className="py-2.5 px-3 w-[15%] text-center">
                        {language === 'sw' ? 'Nafasi / Wiki' : 'Spots / Wk'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {weekdays.map((day) => {
                      const daySpots = spotsByDay[day.key] || [];
                      const hasSpots = daySpots.length > 0;

                      return (
                        <tr
                          key={day.key}
                          className={hasSpots ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 text-slate-400'}
                        >
                          <td className="py-2.5 px-3 font-semibold border-r border-slate-200">
                            <div>{language === 'sw' ? day.nameSw : day.nameEn}</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {language === 'sw' ? day.nameEn : day.nameSw}
                            </div>
                          </td>

                          <td className="py-2.5 px-3 border-r border-slate-200">
                            {hasSpots ? (
                              <div className="space-y-1">
                                {daySpots.map((s, sIdx) => (
                                  <div
                                    key={sIdx}
                                    className="font-mono text-xs font-bold text-[#003366] flex items-center gap-1"
                                  >
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    <span>{s.timeBetween}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="italic text-[11px] text-slate-400">
                                {language === 'sw' ? 'Hakuna tangazo' : 'Off-air day'}
                              </span>
                            )}
                          </td>

                          <td className="py-2.5 px-3 border-r border-slate-200">
                            {hasSpots ? (
                              <div className="space-y-1">
                                {daySpots.map((s, sIdx) => (
                                  <div key={sIdx} className="font-semibold text-slate-900">
                                    {s.programName}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>

                          <td className="py-2.5 px-3 text-center">
                            {hasSpots ? (
                              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#003366] font-mono font-bold text-xs">
                                {daySpots.length}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-mono">0</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Station Signatures & Endorsement (Clean, No Internal Scripts) */}
            <div className="mt-8 pt-5 border-t-2 border-[#003366] grid grid-cols-3 gap-4 text-xs text-slate-700">
              <div>
                <div className="font-bold text-slate-900">
                  {language === 'sw' ? 'Idara ya Masoko (Marketing):' : 'Marketing Executive:'}
                </div>
                <div className="mt-6 border-b border-slate-400 w-32" />
                <div className="mt-1 text-[10px] text-slate-500">
                  {language === 'sw' ? 'Sahihi & Tarehe' : 'Sign & Date'}
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-900">
                  {language === 'sw' ? 'Mteja / Mwakilishi:' : 'Client Representative:'}
                </div>
                <div className="mt-6 border-b border-slate-400 w-32" />
                <div className="mt-1 text-[10px] text-slate-500">
                  {language === 'sw' ? 'Sahihi & Tarehe' : 'Sign & Date'}
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-slate-900">
                  {language === 'sw' ? 'Mhuri wa Radio Kwizera:' : 'Station Stamp:'}
                </div>
                <div className="mt-2 inline-block w-20 h-12 border border-dashed border-slate-300 rounded text-center text-[9px] text-slate-400 pt-4 font-mono">
                  MHURI RASMI
                </div>
              </div>
            </div>

            {/* Exact Footer Required Numbers */}
            <div className="mt-6 pt-3 border-t border-slate-200 text-center space-y-1">
              <p className="text-xs font-bold text-[#003366]">
                Mawasiliano ya Kibiashara (Commercial & Sales Department):
              </p>
              <p className="text-xs font-mono font-bold text-[#FF0000]">
                Simu: +255 739 030 333 &nbsp;|&nbsp; +255 743 872 983
              </p>
              <p className="text-[10px] text-slate-500">
                Barua Pepe: ads@radiokwizera.co.tz | Tovuti: www.radiokwizera.co.tz | Ngara, Kagera, Tanzania
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
