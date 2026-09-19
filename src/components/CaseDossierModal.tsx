import React, { useState } from 'react';
import { PoliceCase, UserRole, PoliceOfficer } from '../types';
import { STAGE_CONFIG, PRIORITY_CONFIG, CRIME_CATEGORY_LABELS } from '../utils/policeHelpers';
import {
  X, Shield, FileText, User, Calendar, MapPin, AlertTriangle, CheckCircle2,
  BookOpen, Camera, Mic, Microscope, Lock, Scale, Printer, ArrowRight,
  RefreshCw, Plus, ExternalLink, Clock, FileCheck2, UserCheck, Gavel, Eye
} from 'lucide-react';

interface CaseDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: PoliceCase | null;
  currentRole: UserRole;
  currentOfficer: PoliceOfficer;
  onOpenAssignIO: () => void;
  onOpenChangeIO: () => void;
  onOpenGenerateFIR: () => void;
  onOpenAddZimni: (isEnquiry: boolean) => void;
  onOpenAddEvidence: () => void;
  onOpenAddStatement: () => void;
  onOpenForensic: () => void;
  onOpenCustodyBail: () => void;
  onOpenChargesheet: () => void;
  onOpenCourtHearing: () => void;
  onCloseCaseAtEnquiry: (caseId: string, reason: string) => void;
}

export const CaseDossierModal: React.FC<CaseDossierModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  currentRole,
  currentOfficer,
  onOpenAssignIO,
  onOpenChangeIO,
  onOpenGenerateFIR,
  onOpenAddZimni,
  onOpenAddEvidence,
  onOpenAddStatement,
  onOpenForensic,
  onOpenCustodyBail,
  onOpenChargesheet,
  onOpenCourtHearing,
  onCloseCaseAtEnquiry
}) => {
  if (!isOpen || !caseItem) return null;

  const [activeTab, setActiveTab] = useState<'FLOW' | 'OVERVIEW' | 'ENQUIRY' | 'FIR' | 'ZIMNI' | 'EVIDENCE' | 'STATEMENTS' | 'CUSTODY' | 'TRIAL'>('OVERVIEW');
  const [closureReasonInput, setClosureReasonInput] = useState('');
  const [showClosureForm, setShowClosureForm] = useState(false);

  const stage = STAGE_CONFIG[caseItem.caseStage];
  const priority = PRIORITY_CONFIG[caseItem.priority];

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmClose = () => {
    if (!closureReasonInput.trim()) {
      alert('Please provide a legitimate closure reason.');
      return;
    }
    onCloseCaseAtEnquiry(caseItem.id, closureReasonInput.trim());
    setShowClosureForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full border border-slate-200 overflow-hidden my-4 max-h-[94vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="bg-[#0c1a30] text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base sm:text-lg font-black tracking-tight text-white">
                  {caseItem.firDetails?.firNumber || caseItem.complaintNumber}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${stage.bgColor} ${stage.color}`}>
                  {stage.label} ({stage.hindiLabel})
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${priority.badge}`}>
                  {priority.label}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {caseItem.policeStation} • Received: {caseItem.dateReceived} at {caseItem.timeReceived} • MHC: {caseItem.receivingOfficerName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-lg border border-slate-700 text-xs font-semibold transition-colors"
              title="Print Police Case File / Parcha Zimni"
            >
              <Printer className="h-3.5 w-3.5" /> Print Dossier
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Action Toolbar Banner (Contextual based on Stage & Role) */}
        <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-950">Next Required Action:</span>
            {caseItem.caseStage === 'COMPLAINT_RECEIVED' && (
              <span className="text-amber-900">SHO must assign Enquiry Officer (IO) & set priority</span>
            )}
            {caseItem.caseStage === 'PRELIMINARY_ENQUIRY' && (
              <span className="text-amber-900">IO is conducting site visit, recording Zimni timeline & verifying cognizable grounds</span>
            )}
            {caseItem.caseStage === 'FIR_REGISTERED' || caseItem.caseStage === 'UNDER_INVESTIGATION' && (
              <span className="text-amber-900">Full investigation ongoing: record daily Zimni, forensic reports & custody status</span>
            )}
            {caseItem.caseStage === 'CHARGESHEET_PREPARED' && (
              <span className="text-amber-900">Draft Challan prepared: awaiting Senior Supervisory (SHO & SP) Approval</span>
            )}
            {caseItem.caseStage === 'UNDER_TRIAL' && (
              <span className="text-amber-900">Case under trial in designated court: track witness evidence & next hearing dates</span>
            )}
            {caseItem.caseStage === 'DISPOSED' && (
              <span className="text-emerald-900 font-bold">Case disposed & completed by Court of Law</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {caseItem.caseStage === 'COMPLAINT_RECEIVED' && (currentRole === 'SHO' || currentRole === 'ADMIN') && (
              <button
                onClick={onOpenAssignIO}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shadow-sm flex items-center gap-1.5"
              >
                <UserCheck className="h-3.5 w-3.5" /> Assign IO for Enquiry
              </button>
            )}

            {caseItem.caseStage === 'PRELIMINARY_ENQUIRY' && (
              <>
                <button
                  onClick={() => onOpenAddZimni(true)}
                  className="px-2.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold text-xs flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Mini Zimni (Timeline)
                </button>
                <button
                  onClick={onOpenAddEvidence}
                  className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-xs flex items-center gap-1"
                >
                  <Camera className="h-3.5 w-3.5" /> Upload Evidence
                </button>
                <button
                  onClick={onOpenAddStatement}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs flex items-center gap-1"
                >
                  <Mic className="h-3.5 w-3.5" /> Record Statement
                </button>

                {(currentRole === 'SHO' || currentRole === 'SP' || currentRole === 'ADMIN') && (
                  <>
                    <button
                      onClick={onOpenGenerateFIR}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-sm flex items-center gap-1"
                    >
                      <FileCheck2 className="h-3.5 w-3.5" /> Convert to FIR
                    </button>
                    <button
                      onClick={() => setShowClosureForm(true)}
                      className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold text-xs"
                    >
                      Close Complaint
                    </button>
                  </>
                )}
              </>
            )}

            {(caseItem.caseStage === 'FIR_REGISTERED' || caseItem.caseStage === 'UNDER_INVESTIGATION') && (
              <>
                <button
                  onClick={() => onOpenAddZimni(false)}
                  className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1"
                >
                  <BookOpen className="h-3.5 w-3.5" /> + Parcha Zimni
                </button>
                <button
                  onClick={onOpenAddEvidence}
                  className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-xs flex items-center gap-1"
                >
                  <Camera className="h-3.5 w-3.5" /> Evidence
                </button>
                <button
                  onClick={onOpenForensic}
                  className="px-2.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-semibold text-xs flex items-center gap-1"
                >
                  <Microscope className="h-3.5 w-3.5" /> FSL / CDR
                </button>
                <button
                  onClick={onOpenCustodyBail}
                  className="px-2.5 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg font-semibold text-xs flex items-center gap-1"
                >
                  <Lock className="h-3.5 w-3.5" /> Arrest / Custody
                </button>
                {(currentRole === 'SHO' || currentRole === 'SP' || currentRole === 'ADMIN') && (
                  <button
                    onClick={onOpenChangeIO}
                    className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs flex items-center gap-1"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Change IO
                  </button>
                )}
                <button
                  onClick={onOpenChargesheet}
                  className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg font-bold text-xs flex items-center gap-1"
                >
                  <Scale className="h-3.5 w-3.5" /> Draft Chargesheet
                </button>
              </>
            )}

            {caseItem.caseStage === 'CHARGESHEET_PREPARED' && (
              <button
                onClick={onOpenChargesheet}
                className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold text-xs shadow-sm flex items-center gap-1.5"
              >
                <Scale className="h-3.5 w-3.5" /> Senior Review Chargesheet
              </button>
            )}

            {(caseItem.caseStage === 'CHARGESHEET_SUBMITTED_TO_COURT' || caseItem.caseStage === 'UNDER_TRIAL') && (
              <button
                onClick={onOpenCourtHearing}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shadow-sm flex items-center gap-1.5"
              >
                <Calendar className="h-3.5 w-3.5" /> Record Court Hearing / Trial
              </button>
            )}
          </div>
        </div>

        {/* Closure Form Overlay if triggered */}
        {showClosureForm && (
          <div className="p-4 bg-slate-100 border-b border-slate-300 text-xs space-y-2">
            <span className="font-bold text-slate-800 block">
              Close Complaint after Preliminary Enquiry (Civil Nature / False Complaint / Compromised):
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={closureReasonInput}
                onChange={(e) => setClosureReasonInput(e.target.value)}
                placeholder="Reason for closure: e.g. Matter found purely civil in nature, mutually settled, false allegations"
                className="flex-1 bg-white border border-slate-300 rounded p-2 text-xs"
              />
              <button
                onClick={handleConfirmClose}
                className="px-3 py-2 bg-red-700 hover:bg-red-800 text-white rounded font-bold"
              >
                Confirm Closure
              </button>
              <button
                onClick={() => setShowClosureForm(false)}
                className="px-3 py-2 bg-slate-300 hover:bg-slate-400 text-slate-800 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 sm:px-6 flex items-center gap-1 overflow-x-auto text-xs shrink-0">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3 py-2.5 font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'OVERVIEW' ? 'border-amber-600 text-amber-700 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview & Complainant
          </button>

          <button
            onClick={() => setActiveTab('FLOW')}
            className={`px-3 py-2.5 font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'FLOW' ? 'border-amber-600 text-amber-700 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Workflow Diagram
          </button>

          <button
            onClick={() => setActiveTab('ENQUIRY')}
            className={`px-3 py-2.5 font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'ENQUIRY' ? 'border-amber-600 text-amber-700 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Preliminary Enquiry ({caseItem.enquiryTimelineZimni.length})
          </button>

          {caseItem.firDetails && (
            <button
              onClick={() => setActiveTab('FIR')}
              className={`px-3 py-2.5 font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'FIR' ? 'border-amber-600 text-amber-700 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              FIR & Legal Sections
            </button>
          )}

          <button
            onClick={() => setActiveTab('ZIMNI')}
            className={`px-3 py-2.5 font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'ZIMNI' ? 'border-amber-600 text-amber-700 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Case Diary / Zimni ({caseItem.fullInvestigationZimni.length + caseItem.enquiryTimelineZimni.length})
          </button>

          <button
            onClick={() => setActiveTab('EVIDENCE')}
            className={`px-3 py-2.5 font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'EVIDENCE' ? 'border-amber-600 text-amber-700 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Evidences & FSL ({caseItem.initialAttachments.length + caseItem.evidenceFiles.length + caseItem.forensicReports.length})
          </button>

          <button
            onClick={() => setActiveTab('STATEMENTS')}
            className={`px-3 py-2.5 font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'STATEMENTS' ? 'border-amber-600 text-amber-700 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Statements ({caseItem.witnessStatements.length})
          </button>

          <button
            onClick={() => setActiveTab('CUSTODY')}
            className={`px-3 py-2.5 font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'CUSTODY' ? 'border-amber-600 text-amber-700 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Suspects & 60/90d Alert
          </button>

          <button
            onClick={() => setActiveTab('TRIAL')}
            className={`px-3 py-2.5 font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'TRIAL' ? 'border-amber-600 text-amber-700 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Chargesheet & Court
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              
              {/* Top Banner: Statutory Alert if active */}
              {caseItem.statutoryDeadline && (
                <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                  caseItem.statutoryDeadline.alertLevel === 'CRITICAL'
                    ? 'bg-red-50 border-red-300 text-red-950'
                    : caseItem.statutoryDeadline.alertLevel === 'WARNING'
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <Clock className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm">
                        Statutory Chargesheet Limit (BNSS Sec 187 / CrPC 167(2)): {caseItem.statutoryDeadline.daysRemaining} Days Remaining
                      </h4>
                      <p className="text-xs opacity-80">
                        Total Period: {caseItem.statutoryDeadline.statutoryDaysTotal} Days • Start: {caseItem.statutoryDeadline.startDate} • Final Deadline: {caseItem.statutoryDeadline.deadlineDate}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onOpenChargesheet}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold shrink-0 hover:bg-black"
                  >
                    Draft Challan Now
                  </button>
                </div>
              )}

              {/* 3-Column Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Complainant Card */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <User className="h-3 w-3 text-blue-600" /> Complainant Particulars
                  </span>
                  <p className="font-bold text-sm text-slate-900">
                    {caseItem.complainant.name}
                  </p>
                  <p className="text-slate-600">
                    s/o / w/o: {caseItem.complainant.fatherMotherName}
                  </p>
                  <p className="text-slate-700 font-medium">
                    📞 {caseItem.complainant.mobile}
                  </p>
                  <p className="text-slate-500 line-clamp-2">
                    🏠 {caseItem.complainant.address}
                  </p>
                  <div className="pt-1 text-[11px] text-slate-400">
                    Occupation: {caseItem.complainant.designationOrOccupation}
                  </div>
                </div>

                {/* Incident Card */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-amber-600" /> Incident Particulars
                  </span>
                  <p className="font-bold text-sm text-slate-900">
                    {CRIME_CATEGORY_LABELS[caseItem.crimeNature]}
                  </p>
                  <p className="text-slate-600">
                    Date & Time: {caseItem.incidentDate} at {caseItem.incidentTime}
                  </p>
                  <p className="text-slate-700">
                    📍 {caseItem.incidentLocation}
                  </p>
                  <div className="pt-1 text-[11px] text-slate-400">
                    Jurisdiction: {caseItem.policeStation}
                  </div>
                </div>

                {/* Assigned Officers Card */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <Shield className="h-3 w-3 text-emerald-600" /> Investigating Officer
                    </span>
                    {(currentRole === 'SHO' || currentRole === 'SP' || currentRole === 'ADMIN') && (
                      <button
                        onClick={onOpenChangeIO}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                      >
                        <RefreshCw className="h-2.5 w-2.5" /> Reassign
                      </button>
                    )}
                  </div>
                  <p className="font-bold text-sm text-slate-900">
                    {caseItem.currentIO.name}
                  </p>
                  <p className="text-slate-600">
                    Rank: {caseItem.currentIO.rank} • Station: {caseItem.currentIO.station}
                  </p>
                  <p className="text-slate-700 font-mono">
                    📞 {caseItem.currentIO.phone}
                  </p>
                  {caseItem.ioTransferHistory.length > 0 && (
                    <div className="pt-1 text-[10px] text-amber-700 font-medium">
                      Transferred from {caseItem.ioTransferHistory[0].previousOfficerName}
                    </div>
                  )}
                </div>

              </div>

              {/* What Happened Narrative */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Incident Narrative / What Happened (घटना का विवरण)
                </h3>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 font-serif">
                  "{caseItem.incidentNarrative}"
                </p>
              </div>

              {/* Suspects Quick Preview */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Accused / Suspects Profile ({caseItem.suspects.length})
                  </h3>
                  <button
                    onClick={() => setActiveTab('CUSTODY')}
                    className="text-xs font-semibold text-amber-700 hover:text-amber-800"
                  >
                    Manage Custody →
                  </button>
                </div>

                {caseItem.suspects.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No named suspects initially provided.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {caseItem.suspects.map((susp) => (
                      <div key={susp.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm">{susp.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            susp.status === 'ARRESTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {susp.status}
                          </span>
                        </div>
                        <p className="text-slate-600">s/o: {susp.fatherName} • 📞 {susp.mobile}</p>
                        <p className="text-slate-600">Address: {susp.address}</p>
                        <p className="text-slate-500 italic">{susp.description}</p>
                        {susp.arrestDate && (
                          <p className="text-red-700 font-semibold text-[11px] pt-1">
                            Arrested: {susp.arrestDate} ({susp.custodyType})
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: WORKFLOW DIAGRAM */}
          {activeTab === 'FLOW' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Haryana Police Procedural Workflow Engine
                </h3>
                <p className="text-xs text-slate-500">
                  Visual tracker highlighting the current position of this case along the statutory investigation lifecycle
                </p>
              </div>

              {/* Flow Steps Visualizer */}
              <div className="space-y-4 max-w-2xl mx-auto py-2">
                {[
                  { id: 'COMPLAINT_RECEIVED', title: '1. Citizen Complaint Received', sub: 'Registered by MHC / Duty Officer with Complainant, Suspect & Evidences' },
                  { id: 'IO_ASSIGNED', title: '2. SHO Reviews & Assigns Enquiry Officer (IO)', sub: 'Priority, Crime Nature & Spot Visit Directions Issued' },
                  { id: 'PRELIMINARY_ENQUIRY', title: '3. Preliminary Enquiry (PE)', sub: 'Spot visit, Day 01/02 Timeline Zimni, Witness Statements & Genuineness Check' },
                  { id: 'FIR_REGISTERED', title: '4. SHO / SP Decision: Formal FIR Registered', sub: 'Sections Applied (BNS), Automatic Data Carry-Forward, Case ID Assigned' },
                  { id: 'UNDER_INVESTIGATION', title: '5. Full Investigation & Daily Zimni Diary', sub: 'Parcha Zimni, FSL Ballistics/Chemical, CDR Tower Dump, Arrest & Remand' },
                  { id: 'CHARGESHEET_PREPARED', title: '6. Chargesheet (Challan) & Senior Review', sub: 'List of PWs, Material Exhibits, SHO Scrutiny & SP District Head Sanction' },
                  { id: 'UNDER_TRIAL', title: '7. Court Submission & Trial Tracking', sub: 'Framing of Charges, Witness Examinations, Next Hearing Dates Tracking' },
                  { id: 'DISPOSED', title: '8. Final Judgment & Case Disposal', sub: 'Conviction / Acquittal Recorded, Sentence Imposed, Dossier Archived' }
                ].map((step, idx) => {
                  const isCurrent = caseItem.caseStage === step.id || (step.id === 'FIR_REGISTERED' && caseItem.caseStage === 'UNDER_INVESTIGATION');
                  const stepNumber = idx + 1;
                  const currentStepNum = stage.stepNumber;
                  const isCompleted = currentStepNum > stepNumber;

                  return (
                    <div key={step.id} className="relative flex items-start gap-4">
                      {/* Line connector */}
                      {idx < 7 && (
                        <div className={`absolute left-4 top-8 w-0.5 h-10 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}></div>
                      )}

                      {/* Icon bubble */}
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 ${
                        isCurrent
                          ? 'bg-amber-600 text-white ring-4 ring-amber-200 shadow-md animate-pulse'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : stepNumber}
                      </div>

                      {/* Content */}
                      <div className={`flex-1 p-3 rounded-xl border text-xs ${
                        isCurrent
                          ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-300'
                          : isCompleted
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-white border-slate-200 opacity-60'
                      }`}>
                        <div className="flex items-center justify-between">
                          <h4 className={`font-bold ${isCurrent ? 'text-amber-950 text-sm' : 'text-slate-800'}`}>
                            {step.title}
                          </h4>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded bg-amber-600 text-white text-[10px] font-bold">
                              ACTIVE STAGE
                            </span>
                          )}
                          {isCompleted && (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                              COMPLETED
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 mt-0.5">{step.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: PRELIMINARY ENQUIRY */}
          {activeTab === 'ENQUIRY' && (
            <div className="space-y-6">
              {caseItem.preliminaryEnquiry ? (
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900">
                      Preliminary Enquiry (PE) Findings & Recommendation
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                      caseItem.preliminaryEnquiry.recommendation === 'RECOMMEND_FIR'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {caseItem.preliminaryEnquiry.recommendation}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Assigned IO</span>
                      <strong className="text-slate-900">{caseItem.preliminaryEnquiry.assignedToIO.name} ({caseItem.preliminaryEnquiry.assignedToIO.rank})</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Cognizable Offence?</span>
                      <strong className={caseItem.preliminaryEnquiry.isCognizable ? 'text-emerald-700 font-bold' : 'text-slate-700'}>
                        {caseItem.preliminaryEnquiry.isCognizable ? 'YES (Cognizable Made Out)' : 'NO (Non-Cognizable)'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Genuineness Status</span>
                      <strong className="text-slate-900">{caseItem.preliminaryEnquiry.genuinenessStatus}</strong>
                    </div>
                  </div>

                  {caseItem.preliminaryEnquiry.siteVisitLocation && (
                    <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200/60 space-y-1">
                      <span className="font-bold text-blue-900 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-blue-700" />
                        Site Visit Observation ({caseItem.preliminaryEnquiry.siteVisitDate})
                      </span>
                      <p className="text-blue-950 leading-relaxed">
                        {caseItem.preliminaryEnquiry.siteVisitObservations}
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="font-bold text-slate-700 block mb-1">Enquiry Officer Summary:</span>
                    <p className="text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                      {caseItem.preliminaryEnquiry.enquirySummary}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-white rounded-xl border border-slate-200 text-center space-y-3">
                  <p className="text-xs text-slate-500">Preliminary Enquiry has not yet commenced for this complaint.</p>
                  {(currentRole === 'SHO' || currentRole === 'ADMIN') && (
                    <button
                      onClick={onOpenAssignIO}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs inline-flex items-center gap-1.5"
                    >
                      <UserCheck className="h-4 w-4" /> Assign IO to Start Enquiry
                    </button>
                  )}
                </div>
              )}

              {/* Mini Zimni Timeline Entries */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-amber-600" />
                    Enquiry Timeline Log (Day 01, Day 02... Mini Case Diary)
                  </h4>
                  <button
                    onClick={() => onOpenAddZimni(true)}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add Timeline Entry
                  </button>
                </div>

                {caseItem.enquiryTimelineZimni.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No timeline remarks logged yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {caseItem.enquiryTimelineZimni.map((zimni) => (
                      <div key={zimni.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-slate-500 text-[11px]">
                          <span className="font-bold text-slate-900 text-xs">
                            Day 0{zimni.zimniNumber}: {zimni.actionTaken}
                          </span>
                          <span className="font-mono">{zimni.date} at {zimni.time}</span>
                        </div>
                        <p className="text-slate-800 leading-relaxed font-serif bg-white p-2 rounded border border-slate-100">
                          {zimni.findings}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                          <span>Officer: {zimni.officerName} ({zimni.officerRank})</span>
                          {zimni.locationVisited && <span>📍 {zimni.locationVisited}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: FIR DETAILS */}
          {activeTab === 'FIR' && caseItem.firDetails && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Formal Police FIR</span>
                    <h3 className="text-lg font-black text-slate-900">{caseItem.firDetails.firNumber}</h3>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-300">
                    Officially Registered
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Registered Date</span>
                    <strong className="text-slate-900">{caseItem.firDetails.registeredDate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Time of FIR</span>
                    <strong className="text-slate-900">{caseItem.firDetails.registeredTime}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Police Station</span>
                    <strong className="text-slate-900">{caseItem.firDetails.policeStation}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Approved By</span>
                    <strong className="text-slate-900">{caseItem.firDetails.approvedBySHO}</strong>
                  </div>
                </div>

                {/* Applicable Sections */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-700 block">Applicable Sections of Law (BNS / Special Acts):</span>
                  <div className="flex flex-wrap gap-2">
                    {caseItem.firDetails.applicableSections.map((sec, i) => (
                      <span key={i} className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-300 font-bold text-xs rounded-lg shadow-2xs">
                        ⚖️ {sec}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-700 block mb-1">FIR Gist / Endorsement Narrative:</span>
                  <p className="text-slate-800 bg-slate-50 p-3.5 rounded-lg border border-slate-200 leading-relaxed font-serif">
                    {caseItem.firDetails.firSummary}
                  </p>
                </div>
              </div>

              {/* Transfer History */}
              {caseItem.ioTransferHistory.length > 0 && (
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
                    IO Transfer & Reassignment Trail
                  </h4>
                  <div className="space-y-2">
                    {caseItem.ioTransferHistory.map((tr) => (
                      <div key={tr.id} className="p-3 bg-blue-50/40 rounded-lg border border-blue-200/80 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">
                            Transferred from {tr.previousOfficerName} ({tr.previousOfficerRank}) ➔ {tr.newOfficerName} ({tr.newOfficerRank})
                          </p>
                          <p className="text-slate-500 text-[11px]">
                            Reason: {tr.transferReason} • Order Ref: {tr.orderReferenceNo}
                          </p>
                        </div>
                        <span className="text-slate-400 font-mono text-[11px]">{tr.transferDate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ZIMNI CASE DIARY */}
          {activeTab === 'ZIMNI' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-amber-600" />
                    Official Case Diary (Parcha Zimni / पर्चा जिमनी)
                  </h3>
                  <p className="text-slate-500 text-[11px]">
                    Chronological record of daily investigation mandated under Police Rules
                  </p>
                </div>
                <button
                  onClick={() => onOpenAddZimni(false)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> + New Parcha Zimni
                </button>
              </div>

              {caseItem.fullInvestigationZimni.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 text-center space-y-2">
                  <p className="text-slate-500 italic">No post-FIR Parcha Zimni recorded yet.</p>
                  <button
                    onClick={() => onOpenAddZimni(false)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-semibold text-xs"
                  >
                    Start Zimni #1
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {caseItem.fullInvestigationZimni.map((zim) => (
                    <div key={zim.id} className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-black text-amber-900 text-sm">
                          Zimni No. {zim.zimniNumber}
                        </span>
                        <span className="font-mono text-slate-500 font-semibold">
                          {zim.date} • {zim.time}
                        </span>
                      </div>

                      <div className="font-bold text-slate-900">
                        Action: {zim.actionTaken}
                      </div>

                      <p className="text-slate-800 leading-relaxed font-serif bg-white p-3 rounded-lg border border-slate-200/80">
                        {zim.findings}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>Investigating Officer: <strong>{zim.officerName} ({zim.officerRank})</strong></span>
                        {zim.locationVisited && <span>📍 {zim.locationVisited}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: EVIDENCES, FORENSIC & CDR */}
          {activeTab === 'EVIDENCE' && (
            <div className="space-y-6 text-xs">
              
              {/* Evidence Media List */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <Camera className="h-4 w-4 text-emerald-600" />
                    Physical & Media Evidences ({caseItem.initialAttachments.length + caseItem.evidenceFiles.length})
                  </h3>
                  <button
                    onClick={onOpenAddEvidence}
                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Upload Evidence
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[...caseItem.initialAttachments, ...caseItem.evidenceFiles].map((ev) => (
                    <div key={ev.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            {ev.fileType}
                          </span>
                          <span className="font-bold text-slate-900">{ev.title}</span>
                        </div>
                        {ev.fileUrl && (
                          <a
                            href={ev.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-semibold flex items-center gap-1 shrink-0"
                          >
                            <ExternalLink className="h-2.5 w-2.5" /> Open File
                          </a>
                        )}
                      </div>

                      {ev.fileUrl && ev.fileType === 'PHOTO' && (
                        <div className="pt-1">
                          <img
                            src={ev.fileUrl}
                            alt={ev.title}
                            className="h-28 w-full object-cover rounded-lg border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      <p className="text-slate-400 font-mono text-[11px]">
                        {ev.fileName} ({ev.fileSize}) • {ev.uploadDate}
                      </p>
                      {ev.geoTag && (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                          <MapPin className="h-3 w-3" /> {ev.geoTag.locationName} [{ev.geoTag.latitude}, {ev.geoTag.longitude}]
                        </div>
                      )}
                      {ev.notes && <p className="text-slate-600 text-[11px] italic">"{ev.notes}"</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Scientific & Forensic Reports */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <Microscope className="h-4 w-4 text-purple-600" />
                    Forensic Lab (FSL), CDR & Medical Reports ({caseItem.forensicReports.length})
                  </h3>
                  <button
                    onClick={onOpenForensic}
                    className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Attach FSL / CDR Report
                  </button>
                </div>

                {caseItem.forensicReports.length === 0 ? (
                  <p className="text-slate-400 italic py-2">No scientific reports attached yet.</p>
                ) : (
                  <div className="space-y-3">
                    {caseItem.forensicReports.map((fsl) => (
                      <div key={fsl.id} className="p-4 bg-purple-50/50 rounded-xl border border-purple-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-purple-950 text-sm">{fsl.title}</span>
                          <span className="px-2 py-0.5 rounded bg-purple-200 text-purple-900 font-bold text-[10px]">
                            {fsl.reportType}
                          </span>
                        </div>
                        <p className="text-purple-900 font-medium">Lab: {fsl.laboratoryName}</p>
                        <p className="text-slate-800 bg-white p-2.5 rounded border border-purple-100 leading-relaxed font-serif">
                          {fsl.findingsSummary}
                        </p>
                        {fsl.officerNotes && (
                          <p className="text-[11px] text-slate-500 italic">IO Note: {fsl.officerNotes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 7: STATEMENTS */}
          {activeTab === 'STATEMENTS' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <Mic className="h-4 w-4 text-blue-600" />
                    Statements of Witness & Suspects (u/s 180 BNSS / 161 CrPC)
                  </h3>
                  <p className="text-slate-500 text-[11px]">
                    Recorded by Investigating Officer during spot enquiry and interrogation
                  </p>
                </div>
                <button
                  onClick={onOpenAddStatement}
                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold text-xs flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> + Record Statement
                </button>
              </div>

              {caseItem.witnessStatements.length === 0 ? (
                <p className="text-slate-400 italic py-4 text-center">No statements recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {caseItem.witnessStatements.map((ws) => (
                    <div key={ws.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{ws.personName}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ws.role === 'SUSPECT' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {ws.role}
                          </span>
                        </div>
                        <span className="text-slate-400 font-mono text-[11px]">{ws.dateRecorded}</span>
                      </div>

                      <p className="text-slate-800 leading-relaxed font-serif bg-white p-3 rounded-lg border border-slate-100">
                        "{ws.statementText}"
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                        <span>Medium: <strong>{ws.mode}</strong></span>
                        <span>Recorded by: <strong>{ws.recordedByOfficer}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: SUSPECTS, CUSTODY & 60/90D ALERT */}
          {activeTab === 'CUSTODY' && (
            <div className="space-y-6 text-xs">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <Lock className="h-4 w-4 text-red-600" />
                    Suspects, Arrest & Custody Status
                  </h3>
                  <button
                    onClick={onOpenCustodyBail}
                    className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold text-xs flex items-center gap-1"
                  >
                    Update Custody / Bail
                  </button>
                </div>

                <div className="space-y-3">
                  {caseItem.suspects.map((s) => (
                    <div key={s.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-base">{s.name}</span>
                        <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                          s.status === 'ARRESTED' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {s.status}
                        </span>
                      </div>
                      <p className="text-slate-600">s/o: {s.fatherName} • 📞 {s.mobile}</p>
                      <p className="text-slate-600">Address: {s.address}</p>
                      <p className="text-slate-500 italic">Physical Description: {s.description}</p>
                      {s.arrestDate && (
                        <div className="p-2.5 bg-red-50 rounded-lg border border-red-200 text-red-950 font-medium">
                          Arrest Date: {s.arrestDate} • Remand Stage: {s.custodyType}
                          {s.bailDetails && <p className="text-[11px] text-red-800 mt-1">Bail Notes: {s.bailDetails}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: CHARGESHEET & TRIAL */}
          {activeTab === 'TRIAL' && (
            <div className="space-y-6 text-xs">
              
              {/* Chargesheet Block */}
              {caseItem.chargesheet ? (
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Challan / Chargesheet</span>
                      <h3 className="text-base font-bold text-slate-900">{caseItem.chargesheet.chargesheetNumber}</h3>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded font-bold text-xs ${
                      caseItem.chargesheet.spApprovalStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      SP Sanction: {caseItem.chargesheet.spApprovalStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Prepared Date</span>
                      <strong className="text-slate-900">{caseItem.chargesheet.draftPreparedDate}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">SHO Review</span>
                      <strong className="text-slate-900">{caseItem.chargesheet.shoReviewStatus}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">SP Review</span>
                      <strong className="text-slate-900">{caseItem.chargesheet.spApprovalStatus}</strong>
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-700 block mb-1">List of Witnesses (PWs):</span>
                    <ul className="list-disc pl-5 space-y-0.5 text-slate-800">
                      {caseItem.chargesheet.listOfWitnesses.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-bold text-slate-700 block mb-1">Material Exhibits:</span>
                    <ul className="list-disc pl-5 space-y-0.5 text-slate-800">
                      {caseItem.chargesheet.materialEvidences.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-white rounded-xl border border-slate-200 text-center space-y-2">
                  <p className="text-slate-500">Chargesheet has not been drafted yet.</p>
                  <button
                    onClick={onOpenChargesheet}
                    className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded font-bold text-xs"
                  >
                    Draft Chargesheet (Challan)
                  </button>
                </div>
              )}

              {/* Court Trial Block */}
              {caseItem.courtTrial && (
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Court Proceedings</span>
                      <h3 className="text-base font-bold text-slate-900">{caseItem.courtTrial.courtCaseNumber}</h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-xs">
                      {caseItem.courtTrial.currentTrialStage}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                    <p><strong>Court:</strong> {caseItem.courtTrial.courtName}</p>
                    <p><strong>Judge:</strong> {caseItem.courtTrial.presidingJudge}</p>
                    {caseItem.courtTrial.cnrNumber && <p className="font-mono"><strong>CNR:</strong> {caseItem.courtTrial.cnrNumber}</p>}
                  </div>

                  {/* Hearings */}
                  <div className="space-y-2">
                    <span className="font-bold text-slate-700 block">Trial Hearing History:</span>
                    {caseItem.courtTrial.hearings.map((h) => (
                      <div key={h.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{h.hearingDate}: {h.purpose}</span>
                          <span className="text-slate-500 text-[11px]">{h.courtName}</span>
                        </div>
                        <p className="text-slate-800 font-serif bg-white p-2 rounded border border-slate-100">
                          {h.proceedingSummary}
                        </p>
                        {h.nextHearingDate && (
                          <p className="text-amber-800 font-bold text-[11px]">
                            Next Date (NDOH): {h.nextHearingDate} ({h.nextHearingPurpose})
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Final Disposal Outcome */}
                  {caseItem.courtTrial.finalOutcome && (
                    <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2">
                      <span className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                        <Gavel className="h-4 w-4 text-emerald-700" />
                        Final Judicial Outcome: {caseItem.courtTrial.finalOutcome}
                      </span>
                      {caseItem.courtTrial.punishmentAwarded && (
                        <p className="text-emerald-900 font-medium">
                          Punishment Awarded: {caseItem.courtTrial.punishmentAwarded}
                        </p>
                      )}
                      {caseItem.courtTrial.fineAmount && (
                        <p className="text-emerald-900">
                          Fine Imposed: ₹{caseItem.courtTrial.fineAmount.toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Haryana Police CMS • Case ID: <strong className="text-slate-800">{caseItem.id}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs transition-colors"
          >
            Close Docket
          </button>
        </div>

      </div>
    </div>
  );
};
