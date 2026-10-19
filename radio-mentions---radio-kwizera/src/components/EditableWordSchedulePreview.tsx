import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
  ArrowLeft,
  Save,
  Check,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Send,
  HelpCircle,
  FileCode,
} from 'lucide-react';
import { useRadioApp } from '../context/RadioAppContext';
import { ScheduledSpotItem, AdCampaign } from '../types';
import { exportSpotsToCSV, exportSpotsToWord, exportSpotsToICS } from '../utils';
import { RadioKwizeraSunburstLogo } from './logos/RadioKwizeraLogos';

interface EditableWordSchedulePreviewProps {
  campaignName: string;
  clientName: string;
  adType: string;
  startDate: string;
  durationDays: number;
  script: string;
  spots: ScheduledSpotItem[];
  onBackToBuilder: () => void;
  onPublishCampaign: (finalSpots: ScheduledSpotItem[], finalScript: string) => void;
  onSaveDraft?: (draftData: any) => void;
}

export const EditableWordSchedulePreview: React.FC<EditableWordSchedulePreviewProps> = ({
  campaignName: initialCampaignName,
  clientName: initialClientName,
  adType,
  startDate,
  durationDays,
  script: initialScript,
  spots: initialSpots,
  onBackToBuilder,
  onPublishCampaign,
  onSaveDraft,
}) => {
  const { language, t, currentUser } = useRadioApp();

  const [editableCampaignName, setEditableCampaignName] = useState(initialCampaignName);
  const [editableClientName, setEditableClientName] = useState(initialClientName);
  const [editableScript, setEditableScript] = useState(initialScript);
  const [editableSpots, setEditableSpots] = useState<ScheduledSpotItem[]>(initialSpots);
  const [draftSavedToast, setDraftSavedToast] = useState(false);
  const [showHelperTips, setShowHelperTips] = useState(true);

  // Auto-save draft on changes
  useEffect(() => {
    const draftPayload = {
      campaignName: editableCampaignName,
      clientName: editableClientName,
      script: editableScript,
      spots: editableSpots,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem('kwizera_campaign_active_draft', JSON.stringify(draftPayload));
    } catch (e) {
      console.error(e);
    }
  }, [editableCampaignName, editableClientName, editableScript, editableSpots]);

  const handleManualSaveDraft = () => {
    const draftPayload = {
      campaignName: editableCampaignName,
      clientName: editableClientName,
      script: editableScript,
      spots: editableSpots,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem('kwizera_campaign_active_draft', JSON.stringify(draftPayload));
      if (onSaveDraft) onSaveDraft(draftPayload);
      setDraftSavedToast(true);
      setTimeout(() => setDraftSavedToast(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Modify cell in editableSpots
  const handleCellChange = (spotIndex: number, field: keyof ScheduledSpotItem, value: string) => {
    setEditableSpots((prev) => {
      const updated = [...prev];
      if (updated[spotIndex]) {
        updated[spotIndex] = {
          ...updated[spotIndex],
          [field]: value,
        };
      }
      return updated;
    });
  };

  // Add custom spot row
  const handleAddCustomRow = () => {
    const lastSpot = editableSpots[editableSpots.length - 1];
    const newSpot: ScheduledSpotItem = {
      id: `spot-custom-${Date.now()}`,
      campaignId: lastSpot?.campaignId || 'custom',
      campaignName: editableCampaignName,
      clientName: editableClientName,
      date: lastSpot?.date || startDate,
      dayName: lastSpot?.dayName || 'Jumatatu / Monday',
      dayOfWeek: lastSpot?.dayOfWeek || 1,
      description: `${adType} ya ${editableClientName}`,
      adType: (lastSpot?.adType || 'Mention') as any,
      timeBetween: '17:15 - 17:30',
      programName: 'Mseto Leo',
      programId: 'prog-wd-mseto',
      isAired: false,
      isWeekend: false,
    };
    setEditableSpots([...editableSpots, newSpot]);
  };

  // Remove spot row
  const handleRemoveRow = (index: number) => {
    setEditableSpots((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Rich Text command for Word document simulation
  const formatSelection = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* WORD PROCESSOR TOOLBAR (Floating at top) */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-xl sticky top-16 z-30 flex flex-wrap items-center justify-between gap-2.5 print:hidden">
        {/* Left: Navigation & Save status */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToBuilder}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            title={language === 'sw' ? 'Rudi Kwenye Kizalisha Kampeni' : 'Back to Builder'}
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
            <span>{t.campaign.backToBuilder}</span>
          </button>

          <button
            type="button"
            onClick={handleManualSaveDraft}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold border border-emerald-700 transition cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{t.campaign.saveDraft}</span>
          </button>

          {draftSavedToast && (
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              {t.campaign.draftSaved}
            </span>
          )}
        </div>

        {/* Center: Formatting controls like Microsoft Word */}
        <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => formatSelection('bold')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5 font-bold" />
          </button>
          <button
            type="button"
            onClick={() => formatSelection('italic')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => formatSelection('underline')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300"
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-slate-700 mx-1" />
          <button
            type="button"
            onClick={handleAddCustomRow}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-900/60 text-blue-300 text-xs font-medium"
            title={language === 'sw' ? 'Ongeza Mstari wa Spot (Insert Row)' : 'Insert Spot Row'}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ {language === 'sw' ? 'Ongeza Mstari' : 'Add Row'}</span>
          </button>
        </div>

        {/* Right: Export & Final Publish Action */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>{t.campaign.printDoc}</span>
          </button>

          <button
            type="button"
            onClick={() => exportSpotsToWord(editableSpots, editableCampaignName, editableClientName, editableScript)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900/60 hover:bg-blue-800 text-blue-200 text-xs font-semibold border border-blue-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.campaign.exportWord}</span>
          </button>

          <button
            type="button"
            onClick={() => exportSpotsToCSV(editableSpots, editableCampaignName)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={() => onPublishCampaign(editableSpots, editableScript)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t.campaign.publishCampaign}</span>
          </button>
        </div>
      </div>

      {/* HELPER NOTICE BANNER */}
      {showHelperTips && (
        <div className="bg-blue-950/60 border border-blue-700/60 rounded-xl p-3 text-xs text-blue-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              {language === 'sw'
                ? 'Mwonekano Huu ni kama Microsoft Word unaoweza kubonyeza na kuhariri neno lolote, muda au mistari moja kwa moja kabla ya kuchapisha au kusambaza studioni.'
                : 'This is an interactive Word-like document view. You can click into any field, header, time, or row to edit it live before printing or publishing.'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowHelperTips(false)}
            className="text-slate-400 hover:text-white text-xs px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* A4 WORD DOCUMENT SHEET */}
      <div className="bg-slate-300 p-4 sm:p-8 rounded-2xl flex justify-center overflow-x-auto print:p-0 print:bg-white">
        <div
          id="word-document-canvas"
          className="w-full max-w-4xl bg-white text-slate-900 rounded-lg shadow-2xl p-8 sm:p-12 border border-slate-300 font-sans min-h-[1050px] print:shadow-none print:border-none print:p-0"
        >
          {/* Official Letterhead Header */}
          <div className="border-b-2 border-red-600 pb-4 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <RadioKwizeraSunburstLogo size="sm" />
                <div>
                  <h1
                    contentEditable
                    suppressContentEditableWarning
                    className="text-2xl sm:text-3xl font-black text-red-600 tracking-wide uppercase outline-none focus:bg-amber-50 rounded px-1 -ml-1"
                  >
                    RADIO KWIZERA 97.7 FM
                  </h1>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className="text-xs font-bold text-slate-700 tracking-wider uppercase mt-1 outline-none focus:bg-amber-50 px-1 -ml-1"
                  >
                    "Jukwaa la Matumaini" • Ngara, Kagera, Tanzania
                  </div>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className="text-xs text-slate-500 mt-1 outline-none focus:bg-amber-50 px-1 -ml-1"
                  >
                    {language === 'sw'
                      ? 'Ratiba Rasmi ya Matangazo ya Kibiashara (Commercial Broadcast Schedule) • Mwaka 2026'
                      : 'Official Commercial Broadcast Schedule & Transmission Log • Year 2026'}
                  </div>
                </div>
              </div>

              <div className="text-right text-xs text-slate-600 space-y-1">
                <div>
                  <strong>{language === 'sw' ? 'Tarehe ya Waraka:' : 'Date:'}</strong>{' '}
                  <span contentEditable suppressContentEditableWarning className="outline-none focus:bg-amber-50 px-1">
                    {new Date().toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US')}
                  </span>
                </div>
                <div>
                  <strong>{language === 'sw' ? 'Saa ya Afrika Mashariki:' : 'East Africa Time:'}</strong>{' '}
                  <span contentEditable suppressContentEditableWarning className="outline-none focus:bg-amber-50 px-1">
                    {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} EAT
                  </span>
                </div>
                <div>
                  <strong>{language === 'sw' ? 'Jumla ya Spots:' : 'Total Spots:'}</strong>{' '}
                  <span className="font-bold text-red-600 font-mono">{editableSpots.length}</span>
                </div>
              </div>
            </div>

            {/* Campaign Summary Card (Word Callout) */}
            <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">{language === 'sw' ? 'Mteja (Client):' : 'Client Name:'}</span>
                <input
                  type="text"
                  value={editableClientName}
                  onChange={(e) => setEditableClientName(e.target.value)}
                  className="font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-400 focus:border-blue-500 focus:outline-none w-full"
                />
              </div>

              <div>
                <span className="text-slate-500 block">{language === 'sw' ? 'Kampeni (Campaign):' : 'Campaign Title:'}</span>
                <input
                  type="text"
                  value={editableCampaignName}
                  onChange={(e) => setEditableCampaignName(e.target.value)}
                  className="font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-400 focus:border-blue-500 focus:outline-none w-full"
                />
              </div>

              <div>
                <span className="text-slate-500 block">{language === 'sw' ? 'Aina ya Tangazo:' : 'Format:'}</span>
                <span className="font-bold text-slate-800">{adType}</span>
              </div>

              <div>
                <span className="text-slate-500 block">{language === 'sw' ? 'Muda & Idadi ya Siku:' : 'Duration:'}</span>
                <span className="font-bold text-blue-800 font-mono">{durationDays} {language === 'sw' ? 'Siku' : 'Days'} ({startDate})</span>
              </div>
            </div>
          </div>

          {/* Editable Spots Table */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {language === 'sw' ? 'Orodha Kamili ya Spots Zilizopangwa:' : 'Broadcast Schedule Spots:'} ({editableSpots.length})
              </h3>
              <button
                type="button"
                onClick={handleAddCustomRow}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 print:hidden"
              >
                <Plus className="w-3 h-3" />
                {language === 'sw' ? 'Ongeza Mstari Mpya' : 'Add Row'}
              </button>
            </div>

            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2 px-2 border-r border-slate-300 w-10">#</th>
                  <th className="py-2 px-2.5 border-r border-slate-300 w-28">{language === 'sw' ? 'Tarehe' : 'Date'}</th>
                  <th className="py-2 px-2.5 border-r border-slate-300 w-24">{language === 'sw' ? 'Siku' : 'Day'}</th>
                  <th className="py-2 px-2.5 border-r border-slate-300 w-28">{language === 'sw' ? 'Muda Uliopangwa' : 'Time Slot'}</th>
                  <th className="py-2 px-2.5 border-r border-slate-300">{language === 'sw' ? 'Kipindi Rasmi (Show)' : 'Program / Show'}</th>
                  <th className="py-2 px-2.5 border-r border-slate-300 w-20">{language === 'sw' ? 'Aina' : 'Type'}</th>
                  <th className="py-2 px-2.5 border-r border-slate-300 w-28">{language === 'sw' ? 'Muda Hewani' : 'Aired Time'}</th>
                  <th className="py-2 px-2.5 border-r border-slate-300">{language === 'sw' ? 'Sahihi ya Mtangazaji' : 'Presenter Sign'}</th>
                  <th className="py-2 px-1 text-center w-8 print:hidden">✕</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {editableSpots.map((spot, idx) => (
                  <tr key={spot.id || idx} className={spot.isWeekend ? 'bg-amber-50/50' : 'hover:bg-slate-50'}>
                    <td className="py-1.5 px-2 font-mono font-bold text-slate-500 border-r border-slate-200">
                      #{idx + 1}
                    </td>

                    {/* Date */}
                    <td className="py-1.5 px-2 border-r border-slate-200">
                      <input
                        type="text"
                        value={spot.date}
                        onChange={(e) => handleCellChange(idx, 'date', e.target.value)}
                        className="w-full font-mono bg-transparent hover:bg-amber-50/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                      />
                    </td>

                    {/* Day Name */}
                    <td className="py-1.5 px-2 border-r border-slate-200">
                      <input
                        type="text"
                        value={spot.dayName}
                        onChange={(e) => handleCellChange(idx, 'dayName', e.target.value)}
                        className="w-full bg-transparent hover:bg-amber-50/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 font-medium"
                      />
                    </td>

                    {/* Time Slot */}
                    <td className="py-1.5 px-2 border-r border-slate-200">
                      <input
                        type="text"
                        value={spot.timeBetween}
                        onChange={(e) => handleCellChange(idx, 'timeBetween', e.target.value)}
                        className="w-full font-mono font-bold text-blue-800 bg-transparent hover:bg-amber-50/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                      />
                    </td>

                    {/* Show Name */}
                    <td className="py-1.5 px-2 border-r border-slate-200">
                      <input
                        type="text"
                        value={spot.programName}
                        onChange={(e) => handleCellChange(idx, 'programName', e.target.value)}
                        className="w-full font-semibold text-slate-900 bg-transparent hover:bg-amber-50/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                      />
                    </td>

                    {/* Ad Type */}
                    <td className="py-1.5 px-2 border-r border-slate-200">
                      <input
                        type="text"
                        value={spot.adType}
                        onChange={(e) => handleCellChange(idx, 'adType', e.target.value as any)}
                        className="w-full bg-transparent hover:bg-amber-50/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                      />
                    </td>

                    {/* Aired Time */}
                    <td className="py-1.5 px-2 border-r border-slate-200">
                      <input
                        type="text"
                        placeholder={language === 'sw' ? 'k.m. 17:02' : 'e.g. 17:02'}
                        value={spot.timeAired || ''}
                        onChange={(e) => handleCellChange(idx, 'timeAired', e.target.value)}
                        className="w-full font-mono bg-transparent hover:bg-amber-50/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 placeholder-slate-400"
                      />
                    </td>

                    {/* Presenter Signature */}
                    <td className="py-1.5 px-2 border-r border-slate-200">
                      <input
                        type="text"
                        placeholder={language === 'sw' ? 'Sahihi ya Mtangazaji' : 'Presenter Signature'}
                        value={spot.signedBy || spot.signature || ''}
                        onChange={(e) => {
                          handleCellChange(idx, 'signedBy', e.target.value);
                          handleCellChange(idx, 'signature', e.target.value);
                        }}
                        className="w-full bg-transparent hover:bg-amber-50/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 placeholder-slate-400"
                      />
                    </td>

                    {/* Delete Action */}
                    <td className="py-1.5 px-1 text-center print:hidden">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        className="text-slate-400 hover:text-red-600 p-0.5"
                        title={language === 'sw' ? 'Ondoa Mstari' : 'Remove Row'}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Editable Script Box */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
              {language === 'sw'
                ? 'Nakala Rasmi ya Kusomwa na Mtangazaji (Editable Teleprompter Script):'
                : 'Official Broadcast Script (Editable):'}
            </h4>
            <div className="p-4 bg-amber-50/30 rounded-xl border border-amber-200/80">
              <textarea
                value={editableScript}
                onChange={(e) => setEditableScript(e.target.value)}
                rows={4}
                className="w-full text-xs leading-relaxed text-slate-900 bg-transparent border-none focus:outline-none resize-y font-serif"
                placeholder={language === 'sw' ? 'Andika au hariri script hapa...' : 'Type or edit script here...'}
              />
            </div>
          </div>

          {/* Certification & Signatures Section */}
          <div className="pt-6 border-t-2 border-slate-800 grid grid-cols-3 gap-6 text-xs text-slate-700">
            <div>
              <div className="font-bold text-slate-900">
                {language === 'sw' ? 'Afisa Masoko (Marketing Officer):' : 'Marketing Officer:'}
              </div>
              <div
                contentEditable
                suppressContentEditableWarning
                className="mt-1 text-[11px] text-slate-600 outline-none focus:bg-amber-50"
              >
                {currentUser.role === 'marketing_officer' ? currentUser.name : (language === 'sw' ? 'Afisa Masoko' : 'Marketing Officer')}
              </div>
              <div className="mt-6 border-b border-slate-400 w-44" />
              <div className="mt-1 text-[10px] text-slate-500">{language === 'sw' ? 'Sahihi & Tarehe' : 'Signature & Date'}</div>
            </div>

            <div>
              <div className="font-bold text-slate-900">
                {language === 'sw' ? 'Mkuu wa Vipindi (Head of Programs):' : 'Head of Programs:'}
              </div>
              <div
                contentEditable
                suppressContentEditableWarning
                className="mt-1 text-[11px] text-slate-600 outline-none focus:bg-amber-50"
              >
                Kagera Studio Chief
              </div>
              <div className="mt-6 border-b border-slate-400 w-44" />
              <div className="mt-1 text-[10px] text-slate-500">{language === 'sw' ? 'Sahihi & Tarehe' : 'Signature & Date'}</div>
            </div>

            <div className="text-right">
              <div className="font-bold text-slate-900">{language === 'sw' ? 'Mhuri Rasmi (Official Seal):' : 'Official Station Seal:'}</div>
              <div className="mt-3 inline-block w-28 h-16 border-2 border-dashed border-slate-400 rounded-lg text-center text-[10px] text-slate-400 pt-5 font-bold">
                {language === 'sw' ? 'MHURI WA RADIO' : 'STATION SEAL'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
