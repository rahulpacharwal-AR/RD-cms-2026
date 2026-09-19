import React, { useState } from 'react';
import { PoliceCase, FIRDetails } from '../types';
import { generateFIRNumber } from '../utils/policeHelpers';
import { X, FileCheck2, ShieldCheck, CheckSquare, AlertCircle } from 'lucide-react';

interface FIRGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: PoliceCase | null;
  onGenerateFIR: (caseId: string, firDetails: FIRDetails) => void;
  approvingShoName: string;
}

export const FIRGenerationModal: React.FC<FIRGenerationModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  onGenerateFIR,
  approvingShoName
}) => {
  if (!isOpen || !caseItem) return null;

  const initialFirNumber = generateFIRNumber(caseItem.policeStation);
  const currentDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Common BNS & Special Law Sections
  const availableSections = [
    'BNS 303(2) - Theft in Building/Tent/Vessel',
    'BNS 304(2) - Snatching / Robbery',
    'BNS 308(2) - Extortion by Putting in Fear of Death',
    'BNS 318(4) - Cheating & Dishonestly Inducing Delivery',
    'BNS 338 - Forgery of Valuable Security / Document',
    'BNS 336(3) - Using Forged Document as Genuine',
    'BNS 103(1) - Murder / Homicide',
    'BNS 109 - Attempt to Murder',
    'BNS 115(2) - Voluntarily Causing Hurt',
    'BNS 61(2) - Criminal Conspiracy',
    'BNS 351(2) - Criminal Intimidation',
    'BNS 74 - Assault or Use of Criminal Force to Woman',
    'IT Act 2000 Sec 66D - Cheating by Personation using Computer Resource',
    'Arms Act 1959 Sec 25/54/59 - Unlawful Possession of Firearm',
    'NDPS Act 1985 Sec 20/21/22 - Psychotropic Substances'
  ];

  const defaultSelectedSections = caseItem.crimeNature === 'CYBER_FRAUD'
    ? ['BNS 318(4) - Cheating & Dishonestly Inducing Delivery', 'IT Act 2000 Sec 66D - Cheating by Personation using Computer Resource']
    : caseItem.crimeNature === 'THEFT_BURGLARY'
    ? ['BNS 303(2) - Theft in Building/Tent/Vessel']
    : caseItem.crimeNature === 'EXTORTION'
    ? ['BNS 308(2) - Extortion by Putting in Fear of Death', 'Arms Act 1959 Sec 25/54/59 - Unlawful Possession of Firearm']
    : ['BNS 318(4) - Cheating & Dishonestly Inducing Delivery'];

  const [firNo, setFirNo] = useState(initialFirNumber);
  const [selectedSections, setSelectedSections] = useState<string[]>(defaultSelectedSections);
  const [customSection, setCustomSection] = useState('');
  const [firSummary, setFirSummary] = useState(
    `Upon preliminary enquiry by ${caseItem.currentIO.name || 'IO'}, cognizable offence is established. Case facts, complainant statement, site inspection, and seized evidences verified. Ordered for registration of formal FIR under relevant sections.`
  );

  const toggleSection = (sec: string) => {
    if (selectedSections.includes(sec)) {
      setSelectedSections(selectedSections.filter((s) => s !== sec));
    } else {
      setSelectedSections([...selectedSections, sec]);
    }
  };

  const handleAddCustomSection = () => {
    if (customSection.trim() && !selectedSections.includes(customSection.trim())) {
      setSelectedSections([...selectedSections, customSection.trim()]);
      setCustomSection('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSections.length === 0) {
      alert('Please select at least one applicable section of law.');
      return;
    }

    const firData: FIRDetails = {
      firNumber: firNo,
      registeredDate: currentDate,
      registeredTime: currentTime,
      policeStation: caseItem.policeStation,
      district: caseItem.district,
      applicableSections: selectedSections,
      firSummary,
      generatedByOfficer: caseItem.currentIO.name || 'IO PS',
      approvedBySHO: approvingShoName || 'Inspector Rajesh Hooda (SHO)'
    };

    onGenerateFIR(caseItem.id, firData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#0c1a30] text-white px-6 py-4 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Convert to Formal FIR (प्रथम सूचना रिपोर्ट)
              </h2>
              <p className="text-xs text-slate-300">
                Linked Complaint: {caseItem.complaintNumber} • Auto-carry forward all records & evidence
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 bg-slate-50/50">
          
          {/* Automatic Carry-Forward Notice */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              Automatic Digital Case Continuity Guaranteed:
            </div>
            <p className="text-emerald-800">
              Complainant details ({caseItem.complainant.name}), Suspects ({caseItem.suspects.length} recorded), {caseItem.initialAttachments.length + caseItem.evidenceFiles.length} Evidence files, Witness statements, and PE Mini Zimni timeline are automatically linked to this new FIR.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                FIR Number (Auto-assigned) *
              </label>
              <input
                type="text"
                required
                value={firNo}
                onChange={(e) => setFirNo(e.target.value)}
                className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Police Station / Jurisdiction
              </label>
              <input
                type="text"
                disabled
                value={caseItem.policeStation}
                className="w-full text-xs bg-slate-100 border border-slate-300 rounded-lg p-2 text-slate-600 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Applicable Sections of Law */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Applicable Sections of Law (BNS / Special Acts) *
            </label>

            <div className="max-h-44 overflow-y-auto p-2 bg-white border border-slate-300 rounded-lg space-y-1.5 text-xs">
              {availableSections.map((sec) => {
                const isChecked = selectedSections.includes(sec);
                return (
                  <label
                    key={sec}
                    className={`flex items-start gap-2 p-1.5 rounded cursor-pointer transition-colors ${
                      isChecked ? 'bg-amber-50 text-amber-950 font-medium' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSection(sec)}
                      className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>{sec}</span>
                  </label>
                );
              })}
            </div>

            {/* Custom section add */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customSection}
                onChange={(e) => setCustomSection(e.target.value)}
                placeholder="Add custom legal section (e.g. BNS 118, POCSO Act Sec 8)"
                className="flex-1 text-xs bg-white border border-slate-300 rounded-lg p-2"
              />
              <button
                type="button"
                onClick={handleAddCustomSection}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900"
              >
                + Add Section
              </button>
            </div>
          </div>

          {/* FIR Narrative / Summary */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              FIR Gist / Endorsement Narrative *
            </label>
            <textarea
              rows={3}
              required
              value={firSummary}
              onChange={(e) => setFirSummary(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 leading-relaxed"
            ></textarea>
          </div>

          <div className="p-2.5 bg-slate-100 rounded-lg text-[11px] text-slate-600 flex items-center justify-between">
            <span>Investigating Officer: <strong>{caseItem.currentIO.name} ({caseItem.currentIO.rank})</strong></span>
            <span>Approving Authority: <strong>{approvingShoName}</strong></span>
          </div>

          {/* Buttons */}
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
              className="px-6 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
            >
              <FileCheck2 className="h-4 w-4" /> Formally Register FIR & Launch Full Investigation
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
