import React, { useState } from 'react';
import { PoliceCase, WitnessStatement, SuspectInfo } from '../types';
import { X, Mic, FileText, User, Shield, CheckCircle2, UserPlus } from 'lucide-react';

interface AddStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: PoliceCase | null;
  onAddStatement: (caseId: string, statement: WitnessStatement) => void;
  onAddSuspect?: (caseId: string, suspect: SuspectInfo) => void;
  currentOfficerName: string;
}

export const AddStatementModal: React.FC<AddStatementModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  onAddStatement,
  onAddSuspect,
  currentOfficerName
}) => {
  if (!isOpen || !caseItem) return null;

  const [personName, setPersonName] = useState('');
  const [role, setRole] = useState<WitnessStatement['role']>('WITNESS');
  const [mode, setMode] = useState<WitnessStatement['mode']>('TEXT_TRANSCRIPT');
  const [statementText, setStatementText] = useState('');
  const [recordingUrl, setRecordingUrl] = useState('');

  // Also if suspect, allow adding to suspect roster directly
  const [alsoAddToSuspects, setAlsoAddToSuspects] = useState(false);
  const [suspectFatherName, setSuspectFatherName] = useState('');
  const [suspectMobile, setSuspectMobile] = useState('');
  const [suspectAddress, setSuspectAddress] = useState('');
  const [suspectDescription, setSuspectDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim() || !statementText.trim()) {
      alert('Please fill the person name and statement narrative.');
      return;
    }

    const newStatement: WitnessStatement = {
      id: `ws-${Date.now()}`,
      personName: personName.trim(),
      role,
      dateRecorded: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      recordedByOfficer: currentOfficerName || caseItem.currentIO.name,
      mode,
      statementText: statementText.trim(),
      recordingUrl: recordingUrl.trim() || undefined,
      verified: true
    };

    onAddStatement(caseItem.id, newStatement);

    if (role === 'SUSPECT' && alsoAddToSuspects && onAddSuspect) {
      const newSuspect: SuspectInfo = {
        id: `susp-${Date.now()}`,
        name: personName.trim(),
        fatherName: suspectFatherName.trim() || 'Unknown',
        mobile: suspectMobile.trim() || 'N/A',
        address: suspectAddress.trim() || 'Address verified during examination',
        description: suspectDescription.trim() || 'Examined under statement',
        status: 'IDENTIFIED',
        custodyType: 'NOT_ARRESTED'
      };
      onAddSuspect(caseItem.id, newSuspect);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#0c1a30] text-white px-6 py-4 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Record Statement (बयान दर्ज करें)
              </h2>
              <p className="text-xs text-slate-300">
                Witness / Suspect Statement u/s 180 BNSS / 161 CrPC
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
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Person Examined (Name) *
              </label>
              <input
                type="text"
                required
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="e.g. Surender Singh (Chowkidar)"
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Role in Case *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              >
                <option value="WITNESS">Eyewitness / Witness (गवाह)</option>
                <option value="COMPLAINANT">Complainant / Victim (पीड़ित)</option>
                <option value="SUSPECT">Suspect / Accused (संदिग्ध / आरोपी)</option>
                <option value="INFORMER">Secret Informer / Panch (मुखबिर / पंच)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Recording Medium *
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              >
                <option value="TEXT_TRANSCRIPT">Typed English / Hindi Transcript</option>
                <option value="AUDIO">Audio Recording + Notes</option>
                <option value="VIDEO">Video Recorded Statement</option>
                <option value="HANDWRITTEN_MEMO">Handwritten Signed Memo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Media Reference / Filename
              </label>
              <input
                type="text"
                value={recordingUrl}
                onChange={(e) => setRecordingUrl(e.target.value)}
                placeholder="e.g. Statement_Audio_Rec_01.m4a"
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-mono text-[11px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Statement Narrative / Deposition (बयान का पूर्ण विवरण) *
            </label>
            <textarea
              rows={5}
              required
              value={statementText}
              onChange={(e) => setStatementText(e.target.value)}
              placeholder="State word-for-word account given by the examined person: what was seen, time, identities recognized, weapon/vehicle details, sequence of events..."
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 leading-relaxed"
            ></textarea>
          </div>

          {/* If suspect, prompt to create profile card */}
          {role === 'SUSPECT' && onAddSuspect && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-red-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alsoAddToSuspects}
                  onChange={(e) => setAlsoAddToSuspects(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <UserPlus className="h-3.5 w-3.5 text-red-600" />
                Also register as Official Suspect Profile in this Case
              </label>

              {alsoAddToSuspects && (
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <input
                    type="text"
                    value={suspectFatherName}
                    onChange={(e) => setSuspectFatherName(e.target.value)}
                    placeholder="Father's Name (s/o)"
                    className="bg-white border border-slate-300 rounded p-1.5"
                  />
                  <input
                    type="text"
                    value={suspectMobile}
                    onChange={(e) => setSuspectMobile(e.target.value)}
                    placeholder="Mobile number"
                    className="bg-white border border-slate-300 rounded p-1.5"
                  />
                  <input
                    type="text"
                    value={suspectAddress}
                    onChange={(e) => setSuspectAddress(e.target.value)}
                    placeholder="Address / Area"
                    className="col-span-2 bg-white border border-slate-300 rounded p-1.5"
                  />
                  <input
                    type="text"
                    value={suspectDescription}
                    onChange={(e) => setSuspectDescription(e.target.value)}
                    placeholder="Physical marks / photo ID"
                    className="col-span-2 bg-white border border-slate-300 rounded p-1.5"
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
              className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Save Verified Statement
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
