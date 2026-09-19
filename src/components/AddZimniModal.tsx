import React, { useState } from 'react';
import { PoliceCase, ZimniEntry } from '../types';
import { X, BookOpen, Clock, MapPin, User, FileText, CheckCircle2 } from 'lucide-react';

interface AddZimniModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: PoliceCase | null;
  isEnquiryZimni: boolean; // true = PE mini diary; false = full post-FIR Zimni
  onAddZimni: (caseId: string, entry: ZimniEntry, isEnquiry: boolean) => void;
  currentOfficerName: string;
  currentOfficerRank: string;
  currentOfficerPhone: string;
}

export const AddZimniModal: React.FC<AddZimniModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  isEnquiryZimni,
  onAddZimni,
  currentOfficerName,
  currentOfficerRank,
  currentOfficerPhone
}) => {
  if (!isOpen || !caseItem) return null;

  const existingEntries = isEnquiryZimni
    ? caseItem.enquiryTimelineZimni
    : caseItem.fullInvestigationZimni;

  const nextZimniNumber = existingEntries.length + 1;
  const currentDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const [date, setDate] = useState(currentDate);
  const [time, setTime] = useState(currentTime);
  const [locationVisited, setLocationVisited] = useState('Spot of Incident / Crime Scene');
  const [actionTaken, setActionTaken] = useState('');
  const [findings, setFindings] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#0c1a30] text-white px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {isEnquiryZimni ? 'Record Preliminary Enquiry Timeline' : 'Record Case Diary (Parcha Zimni / जिमनी)'}
              </h2>
              <p className="text-xs text-slate-300">
                {isEnquiryZimni ? `Day 0${nextZimniNumber} Timeline Log` : `Zimni Entry #${nextZimniNumber}`} • Case: {caseItem.firDetails?.firNumber || caseItem.complaintNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-slate-50/50">
          
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
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Time (24h / AM-PM) *
              </label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Location Visited / Spot Visited
            </label>
            <input
              type="text"
              value={locationVisited}
              onChange={(e) => setLocationVisited(e.target.value)}
              placeholder="e.g. Crime Scene, Complainant Residence, Bank Branch, Hospital"
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Action Taken (कार्रवाई विवरण) *
            </label>
            <input
              type="text"
              required
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              placeholder="e.g. Spot inspection, Complainant examination, CCTV hard drive recovery, Bank account freeze notice"
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-medium"
            />
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
              placeholder="Chronological notes of what was observed, who was questioned, evidence seized under panchnama, statements recorded, lead followed..."
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 leading-relaxed"
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
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Save Zimni to Case Docket
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
