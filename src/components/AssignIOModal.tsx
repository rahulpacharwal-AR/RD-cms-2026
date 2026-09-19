import React, { useState } from 'react';
import { PoliceCase, PoliceOfficer, PriorityLevel, CrimeCategory } from '../types';
import { POLICE_OFFICERS } from '../data/initialData';
import { X, UserCheck, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface AssignIOModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: PoliceCase | null;
  onAssign: (caseId: string, ioOfficer: PoliceOfficer, priority: PriorityLevel, crimeNature: CrimeCategory, instructions: string) => void;
  currentShoName: string;
}

export const AssignIOModal: React.FC<AssignIOModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  onAssign,
  currentShoName
}) => {
  if (!isOpen || !caseItem) return null;

  const availableIOs = POLICE_OFFICERS.filter((o) => o.role === 'IO');
  const [selectedIoId, setSelectedIoId] = useState(availableIOs[0]?.id || '');
  const [priority, setPriority] = useState<PriorityLevel>(caseItem.priority || 'HIGH');
  const [crimeNature, setCrimeNature] = useState<CrimeCategory>(caseItem.crimeNature || 'CYBER_FRAUD');
  const [instructions, setInstructions] = useState(
    'Conduct immediate spot inspection, record statement of complainant, verify genuineness of allegations, and submit preliminary enquiry report within 3 days.'
  );

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const io = availableIOs.find((o) => o.id === selectedIoId) || availableIOs[0];
    onAssign(caseItem.id, io, priority, crimeNature, instructions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#0c1a30] text-white px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                SHO: Assign Enquiry Officer (I.O.)
              </h2>
              <p className="text-xs text-slate-300">
                Complaint: {caseItem.complaintNumber} • {caseItem.policeStation}
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
        <form onSubmit={handleConfirm} className="p-6 space-y-4 bg-slate-50/50">
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-1">
            <p className="font-semibold text-blue-900">
              Complainant: {caseItem.complainant.name} ({caseItem.complainant.mobile})
            </p>
            <p className="text-blue-800 line-clamp-2">
              Incident: {caseItem.incidentNarrative}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Investigating Officer (I.O.) *
            </label>
            <select
              value={selectedIoId}
              onChange={(e) => setSelectedIoId(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 font-medium focus:ring-1 focus:ring-amber-500"
            >
              {availableIOs.map((io) => (
                <option key={io.id} value={io.id}>
                  {io.name} ({io.rank}) - {io.badgeNumber} [{io.activeCasesCount} active cases]
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Station: {caseItem.policeStation}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority Level *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              >
                <option value="NORMAL">Normal</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High Priority</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Crime Nature Category *
              </label>
              <select
                value={crimeNature}
                onChange={(e) => setCrimeNature(e.target.value as CrimeCategory)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              >
                <option value="THEFT_BURGLARY">Theft / Burglary</option>
                <option value="CYBER_FRAUD">Cyber Fraud / Scam</option>
                <option value="CHEATING_SCAM">Cheating / Forgery</option>
                <option value="MURDER_HOMICIDE">Murder / Heinous</option>
                <option value="ASSAULT_HURT">Physical Assault</option>
                <option value="WOMEN_SAFETY">Crime Against Women</option>
                <option value="EXTORTION">Extortion / Threat</option>
                <option value="NDPS_DRUGS">NDPS / Drugs</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              SHO Orders & Preliminary Enquiry Directions
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
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
              className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              Confirm Assignment & Mark "IO Assigned"
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
