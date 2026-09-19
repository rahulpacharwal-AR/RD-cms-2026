import React, { useState } from 'react';
import { PoliceCase, ChargesheetRecord, UserRole } from '../types';
import { X, FileText, CheckCircle2, RotateCcw, AlertTriangle, Scale, ShieldCheck } from 'lucide-react';

interface ChargesheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: PoliceCase | null;
  currentRole: UserRole;
  currentOfficerName: string;
  onSaveChargesheet: (caseId: string, chargesheet: ChargesheetRecord) => void;
}

export const ChargesheetModal: React.FC<ChargesheetModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  currentRole,
  currentOfficerName,
  onSaveChargesheet
}) => {
  if (!isOpen || !caseItem) return null;

  const existingChallan = caseItem.chargesheet;
  const initialSections = caseItem.firDetails?.applicableSections || ['BNS 303(2)'];
  const accusedNames = caseItem.suspects.filter((s) => s.status === 'ARRESTED').map((s) => s.name);
  const defaultAccused = accusedNames.length > 0 ? accusedNames : caseItem.suspects.map((s) => s.name);

  const [chargesheetNumber, setChargesheetNumber] = useState(
    existingChallan?.chargesheetNumber || `CHALLAN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
  );
  const [witnesses, setWitnesses] = useState(
    existingChallan?.listOfWitnesses.join('\n') ||
      `1. ${caseItem.complainant.name} (Complainant / PW-1)\n2. ${caseItem.currentIO.name} (Investigating Officer / PW-2)\n3. HC Malkhana Incharge (Recovery / PW-3)`
  );
  const [materialEvidences, setMaterialEvidences] = useState(
    existingChallan?.materialEvidences.join('\n') ||
      `Ex.P1: Spot Panchnama & Site Plan\nEx.P2: Seized weapon / recovery memo\nEx.P3: Scientific Forensic Report`
  );

  // Reviews
  const [shoStatus, setShoStatus] = useState(existingChallan?.shoReviewStatus || 'PENDING');
  const [shoRemarks, setShoRemarks] = useState(existingChallan?.shoRemarks || '');
  const [spStatus, setSpStatus] = useState(existingChallan?.spApprovalStatus || 'PENDING');
  const [spRemarks, setSpRemarks] = useState(existingChallan?.spRemarks || '');
  const [revisionInstructions, setRevisionInstructions] = useState(existingChallan?.revisionInstructions || '');

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();

    const record: ChargesheetRecord = {
      chargesheetNumber,
      draftPreparedDate: existingChallan?.draftPreparedDate || new Date().toISOString().split('T')[0],
      submissionDate: spStatus === 'APPROVED' ? new Date().toISOString().split('T')[0] : existingChallan?.submissionDate,
      investigatingOfficerName: caseItem.currentIO.name,
      applicableSections: initialSections,
      accusedPersonsCharged: defaultAccused.length > 0 ? defaultAccused : ['Accused as per FIR'],
      listOfWitnesses: witnesses.split('\n').filter((w) => w.trim().length > 0),
      materialEvidences: materialEvidences.split('\n').filter((e) => e.trim().length > 0),
      shoReviewStatus: shoStatus,
      shoRemarks: shoRemarks.trim() || undefined,
      spApprovalStatus: spStatus,
      spRemarks: spRemarks.trim() || undefined,
      revisionInstructions: revisionInstructions.trim() || undefined
    };

    onSaveChargesheet(caseItem.id, record);
    onClose();
  };

  const handleApproveSHO = () => {
    setShoStatus('APPROVED');
    setShoRemarks(`Reviewed by SHO ${currentOfficerName}. Investigation is legally sound and complete in all respects. Forwarded to SP Office for approval.`);
  };

  const handleResendToIO = () => {
    setShoStatus('REVISION_REQUESTED');
    setRevisionInstructions('IO to collect pending forensic FSL certificate and verify supplementary statement of eyewitness before submission.');
  };

  const handleApproveSP = () => {
    setSpStatus('APPROVED');
    setShoStatus('APPROVED');
    setSpRemarks(`Approved by SP / District Head (${currentOfficerName}). Sanction granted for filing before the competent Court of CJM / Sessions.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#0c1a30] text-white px-6 py-4 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Chargesheet / Final Report (अंतिम चालान)
              </h2>
              <p className="text-xs text-slate-300">
                Sec 193 BNSS / 173 CrPC • Senior Review & Court Submission
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
        <form onSubmit={handleSaveDraft} className="p-6 space-y-4 overflow-y-auto flex-1 bg-slate-50/50">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chargesheet (Challan) Number *
              </label>
              <input
                type="text"
                required
                value={chargesheetNumber}
                onChange={(e) => setChargesheetNumber(e.target.value)}
                className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Investigating Officer
              </label>
              <input
                type="text"
                disabled
                value={`${caseItem.currentIO.name} (${caseItem.currentIO.rank})`}
                className="w-full text-xs bg-slate-100 border border-slate-300 rounded-lg p-2 text-slate-600"
              />
            </div>
          </div>

          {/* Charged Accused */}
          <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1 text-xs">
            <span className="font-bold text-slate-700 block">Accused Persons to be Charged:</span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {defaultAccused.map((acc, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-semibold text-[11px] border border-red-200">
                  {acc}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              List of Prosecution Witnesses (PWs) - One per line
            </label>
            <textarea
              rows={3}
              value={witnesses}
              onChange={(e) => setWitnesses(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 leading-relaxed font-mono"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              List of Material Exhibits & Seized Articles
            </label>
            <textarea
              rows={3}
              value={materialEvidences}
              onChange={(e) => setMaterialEvidences(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 leading-relaxed font-mono"
            ></textarea>
          </div>

          {/* Senior Review Section (SHO & SP / District Head) */}
          <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-purple-700" />
                Senior Supervisory Review & Approval
              </span>
              <span className="text-[11px] font-semibold text-purple-800">
                SHO & SP / District Head
              </span>
            </div>

            {/* SHO Level */}
            <div className="p-2.5 bg-white rounded-lg border border-purple-200/80 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">1. SHO Scrutiny Status:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  shoStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : shoStatus === 'REVISION_REQUESTED' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {shoStatus}
                </span>
              </div>
              {shoRemarks && <p className="text-slate-600 text-[11px] italic">"{shoRemarks}"</p>}
              
              {(currentRole === 'SHO' || currentRole === 'ADMIN') && (
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleApproveSHO}
                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-3 w-3" /> Approve by SHO
                  </button>
                  <button
                    type="button"
                    onClick={handleResendToIO}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" /> Resend to IO (Revision)
                  </button>
                </div>
              )}
            </div>

            {/* SP Level */}
            <div className="p-2.5 bg-white rounded-lg border border-purple-200/80 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">2. SP / District Head Final Approval:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  spStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {spStatus}
                </span>
              </div>
              {spRemarks && <p className="text-slate-600 text-[11px] italic">"{spRemarks}"</p>}

              {(currentRole === 'SP' || currentRole === 'ADMIN') && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleApproveSP}
                    className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded text-xs font-semibold flex items-center gap-1"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" /> SP Sanction & Authorize Court Filing
                  </button>
                </div>
              )}
            </div>
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
              className="px-5 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Save Chargesheet Status
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
