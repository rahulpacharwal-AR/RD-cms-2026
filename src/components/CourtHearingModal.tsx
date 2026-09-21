import React, { useState } from 'react';
import { PoliceCase, CourtTrialRecord, CourtHearing } from '../types';
import { X, Scale, Calendar, CheckCircle2, Gavel, Maximize2, Minimize2 } from 'lucide-react';

interface CourtHearingModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: PoliceCase | null;
  onUpdateCourtTrial: (caseId: string, trialRecord: CourtTrialRecord) => void;
}

export const CourtHearingModal: React.FC<CourtHearingModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  onUpdateCourtTrial
}) => {
  const existingTrial = caseItem?.courtTrial;

  const [courtCaseNumber, setCourtCaseNumber] = useState(
    existingTrial?.courtCaseNumber || `CIS-CHI-${Math.floor(100 + Math.random() * 900)}-${new Date().getFullYear()}`
  );
  const [cnrNumber, setCnrNumber] = useState(
    existingTrial?.cnrNumber || `HRKN01-${Math.floor(100000 + Math.random() * 900000)}-${new Date().getFullYear()}`
  );
  const [courtName, setCourtName] = useState(
    existingTrial?.courtName || `Court of Chief Judicial Magistrate (CJM), ${caseItem?.district || 'Karnal'}`
  );
  const [presidingJudge, setPresidingJudge] = useState(existingTrial?.presidingJudge || 'Sh. Sanjeev Kumar, CJM');
  const [currentTrialStage, setCurrentTrialStage] = useState<CourtTrialRecord['currentTrialStage']>(
    existingTrial?.currentTrialStage || 'PROSECUTION_EVIDENCE'
  );
  const [isMaximized, setIsMaximized] = useState(false);

  // New hearing addition
  const [hearingDate, setHearingDate] = useState(new Date().toISOString().split('T')[0]);
  const [hearingPurpose, setHearingPurpose] = useState<CourtHearing['purpose']>('PROSECUTION_EVIDENCE');
  const [proceedingSummary, setProceedingSummary] = useState(
    'PW-1 Complainant examined and cross-examined. Defense counsel sought adjournment for further cross-examination.'
  );
  const [nextDate, setNextDate] = useState(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );
  const [nextPurpose, setNextPurpose] = useState('Recording of Remaining Prosecution Evidence (PW-2 IO)');

  // Disposal
  const [finalOutcome, setFinalOutcome] = useState<CourtTrialRecord['finalOutcome']>(existingTrial?.finalOutcome);
  const [punishmentAwarded, setPunishmentAwarded] = useState(existingTrial?.punishmentAwarded || '');
  const [fineAmount, setFineAmount] = useState(existingTrial?.fineAmount || 0);

  if (!isOpen || !caseItem) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const hearingsList = [...(existingTrial?.hearings || [])];

    if (proceedingSummary.trim()) {
      hearingsList.push({
        id: `hrg-${Date.now()}`,
        hearingDate,
        courtName,
        judgeDesignation: presidingJudge,
        purpose: hearingPurpose,
        proceedingSummary: proceedingSummary.trim(),
        nextHearingDate: currentTrialStage !== 'DISPOSED' ? nextDate : undefined,
        nextHearingPurpose: currentTrialStage !== 'DISPOSED' ? nextPurpose : undefined,
        officerPresent: caseItem.currentIO.name
      });
    }

    const updatedTrial: CourtTrialRecord = {
      courtCaseNumber: courtCaseNumber.trim(),
      cnrNumber: cnrNumber.trim() || undefined,
      courtName: courtName.trim(),
      presidingJudge: presidingJudge.trim(),
      dateOfInstitution: existingTrial?.dateOfInstitution || new Date().toISOString().split('T')[0],
      currentTrialStage,
      hearings: hearingsList,
      finalOutcome: currentTrialStage === 'DISPOSED' ? finalOutcome : undefined,
      judgmentDate: currentTrialStage === 'DISPOSED' ? hearingDate : undefined,
      punishmentAwarded: currentTrialStage === 'DISPOSED' && finalOutcome === 'CONVICTION' ? punishmentAwarded : undefined,
      fineAmount: currentTrialStage === 'DISPOSED' && finalOutcome === 'CONVICTION' ? Number(fineAmount) : undefined
    };

    onUpdateCourtTrial(caseItem.id, updatedTrial);
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isMaximized ? 'p-0' : 'p-4'} bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150`}>
      <div className={`bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-200 ${
        isMaximized ? 'w-full h-full max-w-none max-h-none rounded-none my-0' : 'max-w-2xl w-full rounded-2xl my-6 max-h-[92vh]'
      }`}>
        
        {/* Header */}
        <div className="bg-[#0c1a30] text-white px-6 py-4 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Court Trial & Hearing Tracking (अदालत विचारण)
              </h2>
              <p className="text-xs text-slate-300">
                Case: {caseItem.firDetails?.firNumber || caseItem.complaintNumber} • e-Courts Tracking
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 bg-slate-50/50">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Court Case Number (CIS) *
              </label>
              <input
                type="text"
                required
                value={courtCaseNumber}
                onChange={(e) => setCourtCaseNumber(e.target.value)}
                className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                16-Digit CNR Number (e-Courts)
              </label>
              <input
                type="text"
                value={cnrNumber}
                onChange={(e) => setCnrNumber(e.target.value)}
                className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Designated Court *
              </label>
              <input
                type="text"
                required
                value={courtName}
                onChange={(e) => setCourtName(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Trial Stage *
              </label>
              <select
                value={currentTrialStage}
                onChange={(e) => setCurrentTrialStage(e.target.value as any)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-bold"
              >
                <option value="CASE_REGISTERED">Case Registered in Court (दाखिल)</option>
                <option value="SUMMONING">Summoning of Accused (समन जारी)</option>
                <option value="CHARGES_FRAMED">Charges Framed (आरोप तय)</option>
                <option value="PROSECUTION_EVIDENCE">Prosecution Evidence (अभियोजन साक्ष्य)</option>
                <option value="DEFENSE_EVIDENCE">Defense Evidence (बचाव पक्ष साक्ष्य)</option>
                <option value="ARGUMENTS">Final Arguments (अंतिम बहस)</option>
                <option value="JUDGMENT_RESERVED">Judgment Reserved (निर्णय सुरक्षित)</option>
                <option value="DISPOSED">Case Disposed / Decided (फैसला सुनाया गया)</option>
              </select>
            </div>
          </div>

          {/* Hearing Entry */}
          <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2.5">
            <span className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-blue-600" />
              Record Hearing Proceeding
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hearing Date
                </label>
                <input
                  type="date"
                  value={hearingDate}
                  onChange={(e) => setHearingDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded p-1.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Purpose of Hearing
                </label>
                <select
                  value={hearingPurpose}
                  onChange={(e) => setHearingPurpose(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded p-1.5 text-slate-800"
                >
                  <option value="SUMMONS_SERVICE">Summons / Bailable Warrants Service</option>
                  <option value="FRAMING_OF_CHARGES">Framing of Charges</option>
                  <option value="PROSECUTION_EVIDENCE">Prosecution Witness (PW) Examination</option>
                  <option value="STATEMENT_OF_ACCUSED">Statement of Accused u/s 351 BNSS</option>
                  <option value="DEFENSE_EVIDENCE">Defense Witness (DW) Examination</option>
                  <option value="FINAL_ARGUMENTS">Final Arguments</option>
                  <option value="JUDGMENT">Pronouncement of Judgment</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Court Order / Proceedings Summary
              </label>
              <textarea
                rows={2}
                value={proceedingSummary}
                onChange={(e) => setProceedingSummary(e.target.value)}
                placeholder="What happened in court today: witness examined, adjournment granted, bail argued..."
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded p-2 text-slate-800"
              ></textarea>
            </div>

            {currentTrialStage !== 'DISPOSED' && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Next Date of Hearing (NDOH)
                  </label>
                  <input
                    type="date"
                    value={nextDate}
                    onChange={(e) => setNextDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded p-1.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Next Purpose
                  </label>
                  <input
                    type="text"
                    value={nextPurpose}
                    onChange={(e) => setNextPurpose(e.target.value)}
                    placeholder="e.g. PW-2 IO Examination"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded p-1.5 text-slate-800"
                  />
                </div>
              </div>
            )}
          </div>

          {/* If Disposed, record final outcome */}
          {currentTrialStage === 'DISPOSED' && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl space-y-3">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Gavel className="h-4 w-4 text-emerald-700" />
                Final Judgment / Case Disposal Outcome
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Judgment Outcome *
                  </label>
                  <select
                    value={finalOutcome || 'CONVICTION'}
                    onChange={(e) => setFinalOutcome(e.target.value as any)}
                    className="w-full text-xs bg-white border border-slate-300 rounded p-2 text-slate-800 font-bold"
                  >
                    <option value="CONVICTION">Conviction (दोषसिद्धि / सज़ा)</option>
                    <option value="ACQUITTAL">Acquittal (दोषमुक्त / बरी)</option>
                    <option value="COMPROMISED">Compromised / Compounded (समझौता)</option>
                    <option value="QUASHED">Quashed by High Court (रद्द)</option>
                  </select>
                </div>

                {finalOutcome === 'CONVICTION' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fine Imposed (₹)
                    </label>
                    <input
                      type="number"
                      value={fineAmount}
                      onChange={(e) => setFineAmount(parseFloat(e.target.value))}
                      className="w-full text-xs bg-white border border-slate-300 rounded p-2 text-slate-800"
                    />
                  </div>
                )}
              </div>

              {finalOutcome === 'CONVICTION' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sentence / Quantum of Punishment Awarded
                  </label>
                  <input
                    type="text"
                    value={punishmentAwarded}
                    onChange={(e) => setPunishmentAwarded(e.target.value)}
                    placeholder="e.g. 3 Years Rigorous Imprisonment under BNS 304(2) with fine ₹10,000"
                    className="w-full text-xs bg-white border border-slate-300 rounded p-2 text-slate-800"
                  />
                </div>
              )}
            </div>
          )}

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
              <CheckCircle2 className="h-3.5 w-3.5" /> Save Court Proceedings
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
