import React, { useState } from 'react';
import { PoliceCase, PoliceOfficer, IOTransferHistory } from '../types';
import { POLICE_OFFICERS } from '../data/initialData';
import { X, RefreshCw, UserCheck, Shield, FileText, Maximize2, Minimize2 } from 'lucide-react';

interface ChangeIOModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: PoliceCase | null;
  onTransferIO: (caseId: string, transferRecord: IOTransferHistory, newIOOfficer: PoliceOfficer) => void;
  approvingAuthorityName: string;
}

export const ChangeIOModal: React.FC<ChangeIOModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  onTransferIO,
  approvingAuthorityName
}) => {
  const currentIO = caseItem?.currentIO;
  const otherIOs = POLICE_OFFICERS.filter((o) => o.role === 'IO' && (!currentIO || o.name !== currentIO.name));

  const [selectedNewIoId, setSelectedNewIoId] = useState(otherIOs[0]?.id || '');
  const [transferReason, setTransferReason] = useState<IOTransferHistory['transferReason']>('ROUTINE_TRANSFER');
  const [orderReferenceNo, setOrderReferenceNo] = useState(`ORDER-HP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [remarks, setRemarks] = useState('Case file, digital case diary (Zimni), and seized malkhana items to be handed over within 24 hours.');
  const [isMaximized, setIsMaximized] = useState(false);

  if (!isOpen || !caseItem || !currentIO) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOfficer = POLICE_OFFICERS.find((o) => o.id === selectedNewIoId) || otherIOs[0];
    if (!newOfficer) return;

    const transferRecord: IOTransferHistory = {
      id: `tr-${Date.now()}`,
      previousOfficerName: currentIO.name,
      previousOfficerRank: currentIO.rank,
      newOfficerName: newOfficer.name,
      newOfficerRank: newOfficer.rank,
      transferDate: new Date().toISOString().split('T')[0],
      transferReason,
      orderReferenceNo
    };

    onTransferIO(caseItem.id, transferRecord, newOfficer);
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isMaximized ? 'p-0' : 'p-4'} bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150`}>
      <div className={`bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-200 ${
        isMaximized ? 'w-full h-full max-w-none max-h-none rounded-none my-0' : 'max-w-lg w-full rounded-2xl max-h-[92vh]'
      }`}>
        
        {/* Header */}
        <div className="bg-[#0c1a30] text-white px-6 py-4 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Reassign Investigating Officer (I.O. Change)
              </h2>
              <p className="text-xs text-slate-300">
                Case: {caseItem.firDetails?.firNumber || caseItem.complaintNumber} • Transfer digital case file
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-slate-50/50 overflow-y-auto flex-1">
          
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
              Current Assigned Officer:
            </span>
            <p className="text-xs font-bold text-slate-900">
              {currentIO.name} ({currentIO.rank}) - {currentIO.station}
            </p>
            <p className="text-slate-600 text-[11px]">
              All past Zimni diaries, evidence files, and witness records will automatically transfer to the new officer.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select New Investigating Officer *
            </label>
            <select
              value={selectedNewIoId}
              onChange={(e) => setSelectedNewIoId(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 font-medium focus:ring-1 focus:ring-amber-500"
            >
              {otherIOs.map((io) => (
                <option key={io.id} value={io.id}>
                  {io.name} ({io.rank}) - {io.badgeNumber} [{io.station}]
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Reassignment *
              </label>
              <select
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value as any)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              >
                <option value="ROUTINE_TRANSFER">Routine Police Transfer (स्थानांतरण)</option>
                <option value="MEDICAL_LEAVE">Medical Leave / Sickness (चिकित्सा अवकाश)</option>
                <option value="RETIREMENT">Superannuation / Retired (सेवानिवृत्ति)</option>
                <option value="ADMINISTRATIVE_ORDER">Administrative / SP Order (प्रशासनिक आदेश)</option>
                <option value="SPECIAL_INVESTIGATION_TEAM">SIT Constituted (विशेष जांच दल)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Order Reference No. *
              </label>
              <input
                type="text"
                required
                value={orderReferenceNo}
                onChange={(e) => setOrderReferenceNo(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Handover Remarks & Directives
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
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
              className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Confirm IO Change & Transfer File
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
