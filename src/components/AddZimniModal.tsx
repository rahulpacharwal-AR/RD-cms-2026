import React, { useState, useEffect } from 'react';
import { PoliceCase, ZimniEntry } from '../types';
import { X, BookOpen, Clock, MapPin, User, FileText, CheckCircle2, Maximize2, Minimize2, Plus, Edit3, Sparkles } from 'lucide-react';

interface AddZimniModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: PoliceCase | null;
  isEnquiryZimni: boolean; // true = PE mini diary; false = full post-FIR Zimni
  onAddZimni: (caseId: string, entry: ZimniEntry, isEnquiry: boolean) => void;
  onUpdateZimni?: (caseId: string, entry: ZimniEntry, isEnquiry: boolean) => void;
  currentOfficerName: string;
  currentOfficerRank: string;
  currentOfficerPhone: string;
  presetDate?: string;
  presetDayNumber?: number;
  editingEntry?: ZimniEntry | null;
}

const QUICK_ACTION_PRESETS = [
  'Spot Inspection & Crime Scene Map Preparation',
  'Complainant / Victim Detailed Statement Recorded',
  'Eye-Witness Examination & 161 CrPC Memo',
  'CCTV Footage Seized & Hash Verified Under Panchnama',
  'Suspect Questioning & Verification of Alibi',
  'Malkhana Deposit of Seized Case Property',
  'Call Detail Record (CDR) & Tower Dump Request Initiated',
  'Notice Served U/S 35(3) BNSS for Appearance',
  'Bank Account Statement / UPI Transaction Audit'
];

export const AddZimniModal: React.FC<AddZimniModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  isEnquiryZimni,
  onAddZimni,
  onUpdateZimni,
  currentOfficerName,
  currentOfficerRank,
  currentOfficerPhone,
  presetDate,
  presetDayNumber,
  editingEntry
}) => {
  const isEditMode = !!editingEntry;

  const existingEntries = isEnquiryZimni
    ? (caseItem?.enquiryTimelineZimni || [])
    : (caseItem?.fullInvestigationZimni || []);

  const nextZimniNumber = editingEntry ? editingEntry.zimniNumber : existingEntries.length + 1;
  const currentDate = presetDate || new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const [date, setDate] = useState(currentDate);
  const [time, setTime] = useState(currentTime);
  const [locationVisited, setLocationVisited] = useState('Spot of Incident / Crime Scene');
  const [actionTaken, setActionTaken] = useState('');
  const [findings, setFindings] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingEntry) {
        setDate(editingEntry.date);
        setTime(editingEntry.time);
        setLocationVisited(editingEntry.locationVisited || 'Spot of Incident / Crime Scene');
        setActionTaken(editingEntry.actionTaken);
        setFindings(editingEntry.findings);
      } else {
        setDate(presetDate || new Date().toISOString().split('T')[0]);
        setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setLocationVisited('Spot of Incident / Crime Scene');
        setActionTaken('');
        setFindings('');
      }
      setSuccessToast(null);
    }
  }, [isOpen, editingEntry, presetDate]);

  if (!isOpen || !caseItem) return null;

  const handleSaveAndAddMore = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!actionTaken.trim() || !findings.trim()) {
      alert('Please fill both action taken and findings.');
      return;
    }

    const newZimni: ZimniEntry = {
      id: `zimni-${Date.now()}`,
      zimniNumber: nextZimniNumber,
      date,
      time,
      officerName: currentOfficerName || caseItem.currentIO.name,
      officerRank: currentOfficerRank || caseItem.currentIO.rank,
      officerPhone: currentOfficerPhone || caseItem.currentIO.phone,
      actionTaken: actionTaken.trim(),
      findings: findings.trim(),
      locationVisited: locationVisited.trim() || undefined
    };

    onAddZimni(caseItem.id, newZimni, isEnquiryZimni);

    setSuccessToast(`Action on ${date} at ${time} saved! You can now log another action for the same day.`);
    setActionTaken('');
    setFindings('');
    setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionTaken.trim() || !findings.trim()) {
      alert('Please fill both action taken and findings.');
      return;
    }

    if (isEditMode && editingEntry) {
      const updatedZimni: ZimniEntry = {
        ...editingEntry,
        date,
        time,
        officerName: editingEntry.officerName || currentOfficerName || caseItem.currentIO.name,
        officerRank: editingEntry.officerRank || currentOfficerRank || caseItem.currentIO.rank,
        officerPhone: editingEntry.officerPhone || currentOfficerPhone || caseItem.currentIO.phone,
        actionTaken: actionTaken.trim(),
        findings: findings.trim(),
        locationVisited: locationVisited.trim() || undefined
      };

      if (onUpdateZimni) {
        onUpdateZimni(caseItem.id, updatedZimni, isEnquiryZimni);
      }
    } else {
      const newZimni: ZimniEntry = {
        id: `zimni-${Date.now()}`,
        zimniNumber: nextZimniNumber,
        date,
        time,
        officerName: currentOfficerName || caseItem.currentIO.name,
        officerRank: currentOfficerRank || caseItem.currentIO.rank,
        officerPhone: currentOfficerPhone || caseItem.currentIO.phone,
        actionTaken: actionTaken.trim(),
        findings: findings.trim(),
        locationVisited: locationVisited.trim() || undefined
      };

      onAddZimni(caseItem.id, newZimni, isEnquiryZimni);
    }

    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isMaximized ? 'p-0' : 'p-4'} bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150`}>
      <div className={`bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-200 ${
        isMaximized ? 'w-full h-full max-w-none max-h-none rounded-none my-0' : 'max-w-xl w-full rounded-2xl max-h-[92vh]'
      }`}>
        
        {/* Header */}
        <div className="bg-[#0c1a30] text-white px-6 py-4 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 rounded-full flex items-center justify-center ${
              isEditMode 
                ? 'bg-blue-500/20 border border-blue-400/40 text-blue-400'
                : 'bg-amber-500/20 border border-amber-400/40 text-amber-400'
            }`}>
              {isEditMode ? <Edit3 className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {isEditMode 
                  ? 'Edit Timeline Action / Zimni Entry (संपादित करें)' 
                  : isEnquiryZimni 
                  ? 'Record Preliminary Enquiry Timeline (जांच कार्रवाई)' 
                  : 'Record Case Diary (Parcha Zimni / पर्चा जिमनी)'}
              </h2>
              <p className="text-xs text-slate-300">
                {isEditMode
                  ? `Editing Entry #${editingEntry.zimniNumber} • ${editingEntry.date}`
                  : presetDate
                  ? `Same Day Action for ${presetDate} ${presetDayNumber ? `(Day 0${presetDayNumber})` : ''}`
                  : isEnquiryZimni ? `Timeline Action #${nextZimniNumber}` : `Zimni Entry #${nextZimniNumber}`} • Case: {caseItem.firDetails?.firNumber || caseItem.complaintNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isMaximized ? "Restore Size (सामान्य आकार)" : "Maximize Screen (पूर्ण स्क्रीन / बड़ा करें)"}
            >
              {isMaximized ? <Minimize2 className="h-4.5 w-4.5" /> : <Maximize2 className="h-4.5 w-4.5" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Success Alert Banner when Add More used */}
        {successToast && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-xs text-emerald-900 font-medium flex items-center gap-2 animate-in fade-in shrink-0">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Mode Indicator Banner */}
        {presetDate && !isEditMode && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-xs text-amber-900 flex items-center justify-between shrink-0">
            <span className="font-semibold flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-700" />
              Recording additional action for same day: <strong>{presetDate}</strong>
            </span>
            <span className="text-[11px] text-amber-700">Multiple events tracked chronologically</span>
          </div>
        )}

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-slate-50/50 overflow-y-auto flex-1">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date of Investigation Entry *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Time (समय) *
              </label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 10:30 AM or 15:45"
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Location Visited / Spot Visited (स्थान / मौका)
            </label>
            <input
              type="text"
              value={locationVisited}
              onChange={(e) => setLocationVisited(e.target.value)}
              placeholder="e.g. Crime Scene, Complainant Residence, Bank Branch, Market lane"
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Action Taken (की गई कार्रवाई) *
              </label>
              <span className="text-[10px] text-slate-400">Select preset or type custom</span>
            </div>
            <input
              type="text"
              required
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              placeholder="e.g. Spot inspection, Complainant examination, CCTV footage seized..."
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
            />

            {/* Quick action preset chips */}
            <div className="mt-1.5 flex flex-wrap gap-1">
              {QUICK_ACTION_PRESETS.slice(0, 5).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setActionTaken(preset)}
                  className="px-2 py-0.5 rounded bg-slate-200/70 hover:bg-amber-100 hover:text-amber-900 text-[10px] text-slate-700 transition-colors text-left"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Findings & Remarks (विस्तृत निष्कर्ष व टिप्पणियां) *
            </label>
            <textarea
              rows={4}
              required
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              placeholder="Chronological notes of what was observed, witnesses questioned, physical verification, seized evidence under memo, leads verified..."
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 leading-relaxed focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
            ></textarea>
          </div>

          <div className="p-2.5 bg-slate-100 rounded-lg text-[11px] text-slate-600 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-500" />
              Recording Officer: <strong>{currentOfficerName || caseItem.currentIO.name} ({currentOfficerRank || caseItem.currentIO.rank})</strong>
            </span>
            <span className="text-slate-400 font-mono">{currentOfficerPhone || caseItem.currentIO.phone}</span>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-100 cursor-pointer"
            >
              Cancel (रद्द करें)
            </button>

            <div className="flex items-center gap-2">
              {!isEditMode && (
                <button
                  type="button"
                  onClick={handleSaveAndAddMore}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Save this action and immediately log another action for the same day"
                >
                  <Plus className="h-3.5 w-3.5 text-amber-400" /> Save & Add More (+ और जोड़ें)
                </button>
              )}

              <button
                type="submit"
                className={`px-5 py-2 rounded-lg font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isEditMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {isEditMode ? 'Save Changes (बदलाव सहेजें)' : 'Save & Close (सहेजें व बंद करें)'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
