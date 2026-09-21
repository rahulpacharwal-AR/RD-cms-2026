import React, { useState } from 'react';
import { PoliceCase, ForensicReport } from '../types';
import { X, Microscope, FileText, CheckCircle2, Maximize2, Minimize2 } from 'lucide-react';

interface ForensicReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: PoliceCase | null;
  onAddForensic: (caseId: string, report: ForensicReport) => void;
}

export const ForensicReportModal: React.FC<ForensicReportModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  onAddForensic
}) => {
  const [reportType, setReportType] = useState<ForensicReport['reportType']>('DIGITAL_FORENSICS');
  const [title, setTitle] = useState('');
  const [laboratoryName, setLaboratoryName] = useState('Forensic Science Laboratory (FSL), Madhuban, Karnal');
  const [status, setStatus] = useState<ForensicReport['status']>('REPORT_RECEIVED');
  const [findingsSummary, setFindingsSummary] = useState('');
  const [officerNotes, setOfficerNotes] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);

  if (!isOpen || !caseItem) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !findingsSummary.trim()) {
      alert('Please fill report title and findings summary.');
      return;
    }

    const newReport: ForensicReport = {
      id: `fsl-${Date.now()}`,
      reportType,
      title: title.trim(),
      laboratoryName: laboratoryName.trim(),
      dateRequested: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
      dateReceived: status === 'REPORT_RECEIVED' ? new Date().toISOString().split('T')[0] : undefined,
      status,
      findingsSummary: findingsSummary.trim(),
      officerNotes: officerNotes.trim() || undefined
    };

    onAddForensic(caseItem.id, newReport);
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
            <div className="h-9 w-9 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400">
              <Microscope className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Attach Forensic, FSL, CDR or Medical Report
              </h2>
              <p className="text-xs text-slate-300">
                Scientific & Technical Evidence Documentation
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-slate-50/50 overflow-y-auto flex-1">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Report Category *
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              >
                <option value="DIGITAL_FORENSICS">Digital Forensics (साइबर / मोबाइल डेटा)</option>
                <option value="CDR_ANALYSIS">CDR / Tower Dump (कॉल डिटेल रिकॉर्ड)</option>
                <option value="FSL_BALLISTICS">FSL Ballistics / Arms (आग्नेयास्त्र / कारतूस)</option>
                <option value="FSL_CHEMICAL">FSL Chemical / Viscera (रासायनिक जांच)</option>
                <option value="FINGERPRINT">Fingerprint Bureau (अंगुलिचिह्न)</option>
                <option value="MEDICAL_MLC">Medico-Legal Certificate (MLC)</option>
                <option value="POST_MORTEM">Post-Mortem Report (PMR)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              >
                <option value="REPORT_RECEIVED">Report Received (रिपोर्ट प्राप्त)</option>
                <option value="DISPATCHED_TO_LAB">Dispatched / Sample in Lab</option>
                <option value="REQUESTED">Docket Sent to Expert</option>
                <option value="INCONCLUSIVE">Inconclusive / Supplementary Needed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Report Subject / Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Call Detail Record of mobile +91-98XXX linking tower near crime scene"
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Analyzing Lab / Agency Name
            </label>
            <input
              type="text"
              value={laboratoryName}
              onChange={(e) => setLaboratoryName(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Key Scientific Findings & Opinion *
            </label>
            <textarea
              rows={4}
              required
              value={findingsSummary}
              onChange={(e) => setFindingsSummary(e.target.value)}
              placeholder="Summary of scientific conclusions: matching weapon ballistic striations, IMEI movement, IP address origin, injury type..."
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 leading-relaxed"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Investigating Officer Correlation Notes
            </label>
            <input
              type="text"
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              placeholder="How this report substantiates the charges against accused"
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
            />
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
              <CheckCircle2 className="h-3.5 w-3.5" /> Attach Scientific Report
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
