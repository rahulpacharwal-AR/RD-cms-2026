import React, { useState } from 'react';
import { PoliceCase, SuspectInfo } from '../types';
import { calculateStatutoryDeadline } from '../utils/policeHelpers';
import { X, Lock, ShieldAlert, Calendar, CheckCircle2, UserCheck } from 'lucide-react';

interface CustodyBailModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: PoliceCase | null;
  onUpdateSuspectCustody: (caseId: string, updatedSuspects: SuspectInfo[]) => void;
}

export const CustodyBailModal: React.FC<CustodyBailModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  onUpdateSuspectCustody
}) => {
  if (!isOpen || !caseItem) return null;

  const suspects = caseItem.suspects;
  const [selectedSuspectId, setSelectedSuspectId] = useState(suspects[0]?.id || '');
  const targetSuspect = suspects.find((s) => s.id === selectedSuspectId) || suspects[0];

  const [status, setStatus] = useState<SuspectInfo['status']>(targetSuspect?.status || 'ARRESTED');
  const [arrestDate, setArrestDate] = useState(targetSuspect?.arrestDate || new Date().toISOString().split('T')[0]);
  const [custodyType, setCustodyType] = useState<SuspectInfo['custodyType']>(targetSuspect?.custodyType || 'JUDICIAL_CUSTODY');
  const [bailDetails, setBailDetails] = useState(targetSuspect?.bailDetails || '');
  const [statutoryDays, setStatutoryDays] = useState<60 | 90>(90);

  const handleSuspectChange = (id: string) => {
    setSelectedSuspectId(id);
    const susp = suspects.find((s) => s.id === id);
    if (susp) {
      setStatus(susp.status);
      setArrestDate(susp.arrestDate || new Date().toISOString().split('T')[0]);
      setCustodyType(susp.custodyType || 'JUDICIAL_CUSTODY');
      setBailDetails(susp.bailDetails || '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSuspect) return;

    const updated = suspects.map((s) => {
      if (s.id === selectedSuspectId) {
        return {
          ...s,
          status,
          arrestDate: status === 'ARRESTED' ? arrestDate : undefined,
          custodyType: status === 'ARRESTED' ? custodyType : 'NOT_ARRESTED',
          bailDetails: bailDetails.trim() || undefined
        };
      }
      return s;
    });

    onUpdateSuspectCustody(caseItem.id, updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#0c1a30] text-white px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-red-500/20 border border-red-400/40 flex items-center justify-center text-red-400">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Accused Arrest, Custody & Bail Tracking
              </h2>
              <p className="text-xs text-slate-300">
                Statutory 60/90 Days Chargesheet Deadline Tracker
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
          
          {suspects.length === 0 ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              No suspects currently registered in this case. Please add a suspect from the case dossier first.
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Accused / Suspect *
                </label>
                <select
                  value={selectedSuspectId}
                  onChange={(e) => handleSuspectChange(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 font-medium"
                >
                  {suspects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (s/o {s.fatherName}) - Current: {s.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Accused Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                  >
                    <option value="ARRESTED">Arrested (गिरफ्तार / हिरासत)</option>
                    <option value="UNDER_SURVEILLANCE">Under Surveillance (निगरानी में)</option>
                    <option value="ABSCONDING">Absconding (फरार / वांटेड)</option>
                    <option value="IDENTIFIED">Identified (चिन्हित)</option>
                    <option value="EXONERATED">Exonerated (निर्दोष पाया गया)</option>
                  </select>
                </div>

                {status === 'ARRESTED' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Date of Arrest *
                    </label>
                    <input
                      type="date"
                      required
                      value={arrestDate}
                      onChange={(e) => setArrestDate(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-mono"
                    />
                  </div>
                )}
              </div>

              {status === 'ARRESTED' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Remand / Custody Stage *
                    </label>
                    <select
                      value={custodyType}
                      onChange={(e) => setCustodyType(e.target.value as any)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-semibold"
                    >
                      <option value="POLICE_REMAND">Police Remand (पुलिस हिरासत / रिमांड)</option>
                      <option value="JUDICIAL_CUSTODY">Judicial Custody / Central Jail (न्यायिक हिरासत)</option>
                      <option value="BAIL_GRANTED">Regular Bail Granted by Court (ज़मानत पर रिहा)</option>
                    </select>
                  </div>

                  {/* Statutory 60/90 Days Auto-Calculator Alert */}
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-red-900 flex items-center gap-1.5">
                        <ShieldAlert className="h-4 w-4 text-red-700" />
                        Statutory Chargesheet Limit (BNSS Sec 187 / CrPC 167(2))
                      </span>
                      <select
                        value={statutoryDays}
                        onChange={(e) => setStatutoryDays(parseInt(e.target.value) as any)}
                        className="text-[11px] bg-white border border-red-300 rounded px-1.5 py-0.5 text-red-900 font-bold"
                      >
                        <option value={90}>90 Days (Heinous Offence)</option>
                        <option value={60}>60 Days (Other Offence)</option>
                      </select>
                    </div>

                    <p className="text-red-800 text-[11px]">
                      Clock begins on Date of Arrest ({arrestDate}). Chargesheet must be submitted to court before the statutory period to prevent the accused from getting default statutory bail.
                    </p>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Court Remand / Bail Order Details
                </label>
                <textarea
                  rows={2}
                  value={bailDetails}
                  onChange={(e) => setBailDetails(e.target.value)}
                  placeholder="e.g. 2 days police custody granted by CJM court on 28-08-2026. Bail application dismissed."
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                ></textarea>
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
                  className="px-5 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Save Custody & Update Deadline
                </button>
              </div>
            </>
          )}

        </form>

      </div>
    </div>
  );
};
