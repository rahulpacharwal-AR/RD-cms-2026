import React, { useState, useMemo } from 'react';
import { PoliceCase, UserRole, PoliceOfficer, StatementMediaAttachment, ZimniEntry, PreliminaryEnquiry, PoliceWrittenFinalReport } from '../types';
import { STAGE_CONFIG, PRIORITY_CONFIG, CRIME_CATEGORY_LABELS } from '../utils/policeHelpers';
import {
  X, Shield, FileText, User, Calendar, MapPin, AlertTriangle, CheckCircle2,
  BookOpen, Camera, Mic, Microscope, Lock, Scale, Printer, ArrowRight,
  RefreshCw, Plus, ExternalLink, Clock, FileCheck2, UserCheck, Gavel, Eye,
  Video, Volume2, Pen, Download, Paperclip, Maximize2, Minimize2, Edit3, Trash2, Sparkles,
  ChevronDown, ChevronUp, Send, Filter, ShieldAlert, Ban, ShieldCheck
} from 'lucide-react';
import { SubmitEnquiryReportModal } from './SubmitEnquiryReportModal';
import { ForwardFinalReportModal } from './ForwardFinalReportModal';

interface CaseDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: PoliceCase | null;
  currentRole: UserRole;
  currentOfficer: PoliceOfficer;
  onOpenAssignIO: () => void;
  onOpenChangeIO: () => void;
  onOpenGenerateFIR: () => void;
  onOpenAddZimni: (isEnquiry: boolean, presetDate?: string, editingEntry?: ZimniEntry | null) => void;
  onDeleteZimni?: (caseId: string, entryId: string) => void;
  onOpenAddEvidence: () => void;
  onOpenAddStatement: () => void;
  onOpenForensic: () => void;
  onOpenCustodyBail: () => void;
  onOpenChargesheet: () => void;
  onOpenCourtHearing: () => void;
  onCloseCaseAtEnquiry: (caseId: string, reason: string) => void;
  onAcceptCase?: (caseId: string) => void;
  onSubmitEnquiryReport?: (caseId: string, enquiryReport: PreliminaryEnquiry) => void;
  onShoDemandFinalReport?: (caseId: string, instructions?: string) => void;
  onForwardFinalReport?: (caseId: string, summary: string, writtenReport?: PoliceWrittenFinalReport) => void;
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
  onDeleteZimni,
  onOpenAddEvidence,
  onOpenAddStatement,
  onOpenForensic,
  onOpenCustodyBail,
  onOpenChargesheet,
  onOpenCourtHearing,
  onCloseCaseAtEnquiry,
  onAcceptCase,
  onSubmitEnquiryReport,
  onShoDemandFinalReport,
  onForwardFinalReport
}) => {
  const [activeTab, setActiveTab] = useState<'FLOW' | 'OVERVIEW' | 'ENQUIRY' | 'FIR' | 'ZIMNI' | 'EVIDENCE' | 'STATEMENTS' | 'CUSTODY' | 'TRIAL'>('OVERVIEW');
  const [closureReasonInput, setClosureReasonInput] = useState('');
  const [showClosureForm, setShowClosureForm] = useState(false);
  const [selectedMediaModal, setSelectedMediaModal] = useState<StatementMediaAttachment | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  // Modals for Submit Enquiry Report and Forward Final Report
  const [isSubmitEnquiryModalOpen, setIsSubmitEnquiryModalOpen] = useState(false);
  const [isForwardFinalReportModalOpen, setIsForwardFinalReportModalOpen] = useState(false);

  // Day filter & collapsible accordion states
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('ALL');
  const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>({});

  // Toast notification for actions/deletions inside modal
  const [timelineNotificationToast, setTimelineNotificationToast] = useState<string | null>(null);

  // Inline delete confirmation state (bypasses window.confirm for iframe safety)
  const [deletingZimniId, setDeletingZimniId] = useState<string | null>(null);

  // SHO Demanding Final Report inline notes prompt
  const [showDemandPrompt, setShowDemandPrompt] = useState(false);
  const [shoDemandNotes, setShoDemandNotes] = useState('');

  // Unified Timeline of all enquiry logs + all case diary zimni entries
  // Automatically synced and grouped by Day/Date
  const allTimelineEntries = useMemo(() => {
    const list: Array<{
      entry: ZimniEntry;
      isEnquiry: boolean;
      typeLabel: string;
      badgeColor: string;
    }> = [];

    (caseItem?.enquiryTimelineZimni || []).forEach((e) => {
      list.push({
        entry: e,
        isEnquiry: true,
        typeLabel: 'Enquiry Diary (प्रारंभिक जांच)',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300'
      });
    });

    (caseItem?.fullInvestigationZimni || []).forEach((z) => {
      list.push({
        entry: z,
        isEnquiry: false,
        typeLabel: `Parcha Zimni #${z.zimniNumber} (केस डायरी)`,
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-300'
      });
    });

    // Sort chronologically by date and time
    return list.sort((a, b) => {
      const dateCmp = a.entry.date.localeCompare(b.entry.date);
      if (dateCmp !== 0) return dateCmp;
      return a.entry.time.localeCompare(b.entry.time);
    });
  }, [caseItem?.enquiryTimelineZimni, caseItem?.fullInvestigationZimni]);

  // Group by Date to form Day 01, Day 02... with multiple same-day actions
  const groupedTimelineByDay = useMemo(() => {
    const groups: Record<string, typeof allTimelineEntries> = {};
    allTimelineEntries.forEach((item) => {
      const d = item.entry.date;
      if (!groups[d]) groups[d] = [];
      groups[d].push(item);
    });

    const dates = Object.keys(groups).sort((a, b) => a.localeCompare(b));
    return dates.map((date, idx) => ({
      dayNumber: idx + 1,
      date,
      entries: groups[date]
    }));
  }, [allTimelineEntries]);

  // Filtered by selected day dropdown
  const filteredTimelineByDay = useMemo(() => {
    if (selectedDayFilter === 'ALL') return groupedTimelineByDay;
    return groupedTimelineByDay.filter(
      (g) => g.date === selectedDayFilter || `Day 0${g.dayNumber}` === selectedDayFilter
    );
  }, [groupedTimelineByDay, selectedDayFilter]);

  if (!isOpen || !caseItem) return null;

  const toggleDayCollapse = (date: string) => {
    setCollapsedDays((prev) => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  const expandAllDays = () => {
    setCollapsedDays({});
  };

  const collapseAllDays = () => {
    const all: Record<string, boolean> = {};
    groupedTimelineByDay.forEach((g) => {
      all[g.date] = true;
    });
    setCollapsedDays(all);
  };

  const docketSummaryStr = typeof caseItem?.preliminaryEnquiry?.finalReportDocketSummary === 'string'
    ? caseItem.preliminaryEnquiry.finalReportDocketSummary
    : '';

  const isClosedAtEnquiry =
    caseItem.caseStage === 'CLOSED_AT_ENQUIRY' ||
    Boolean(caseItem.preliminaryEnquiry?.closureReason) ||
    (caseItem.preliminaryEnquiry?.finalReportSubmittedByIO && (
      caseItem.preliminaryEnquiry?.writtenFinalReport?.concludingRecommendation?.includes('दाखिल') ||
      caseItem.preliminaryEnquiry?.writtenFinalReport?.concludingRecommendation?.toLowerCase().includes('closure') ||
      caseItem.preliminaryEnquiry?.recommendation === 'RECOMMEND_CLOSURE' ||
      caseItem.preliminaryEnquiry?.finalReportSummary?.includes('दाखिल') ||
      caseItem.preliminaryEnquiry?.finalReportSummary?.toLowerCase().includes('closure') ||
      docketSummaryStr.includes('दाखिल') ||
      docketSummaryStr.toLowerCase().includes('closure')
    )) ||
    (caseItem.caseStage === 'DISPOSED' && !caseItem.firDetails);

  const stage = (isClosedAtEnquiry && !caseItem.firDetails)
    ? STAGE_CONFIG['CLOSED_AT_ENQUIRY']
    : STAGE_CONFIG[caseItem.caseStage];
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
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isMaximized ? 'p-0' : 'p-2 sm:p-4'} bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150`}>
      <div className={`bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-200 ${
        isMaximized ? 'w-full h-full max-w-none max-h-none rounded-none my-0' : 'max-w-6xl w-full rounded-2xl my-4 max-h-[94vh]'
      }`}>
        
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
            {isClosedAtEnquiry ? (
              <span className="text-emerald-900 font-bold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                प्रकरण प्रारंभिक जांच स्तर पर निस्तारित / दफ्तर दाखिल (Closed at Enquiry • Full Investigation Inactive)
              </span>
            ) : (
              <>
                {caseItem.caseStage === 'COMPLAINT_RECEIVED' && (
                  <span className="text-amber-900">Complaint registered, awaiting IO assignment for inquiry</span>
                )}
                {caseItem.caseStage === 'IO_ASSIGNED' && (
                  <span className="text-blue-900">Enquiry officer assigned, spot visit and initial inquiry in progress</span>
                )}
                {caseItem.caseStage === 'PRELIMINARY_ENQUIRY' && (
                  <span className="text-purple-900">14-day statutory preliminary enquiry under BNSS active</span>
                )}
                {caseItem.caseStage === 'FIR_REGISTERED' && (
                  <span className="text-red-900 font-semibold">FIR registered, formal criminal investigation initiated</span>
                )}
                {caseItem.caseStage === 'UNDER_INVESTIGATION' && (
                  <span className="text-amber-900">Investigation active: daily Zimni diary, evidence collection, FSL, and arrests</span>
                )}
                {caseItem.caseStage === 'CHARGESHEET_PREPARED' && (
                  <span className="text-purple-900">Chargesheet compiled, awaiting senior review and court filing</span>
                )}
                {caseItem.caseStage === 'CHARGESHEET_SUBMITTED_TO_COURT' && (
                  <span className="text-indigo-900">Challan submitted to Judicial Magistrate, awaiting trial dates</span>
                )}
                {caseItem.caseStage === 'UNDER_TRIAL' && (
                  <span className="text-amber-900">Case under trial in designated court: track witness evidence & next hearing dates</span>
                )}
                {caseItem.caseStage === 'DISPOSED' && (
                  <span className="text-emerald-900 font-bold">Case disposed & completed by Court of Law</span>
                )}
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {isClosedAtEnquiry ? (
              <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>जांच उपरांत निस्तारित (Closed at Enquiry • Full Investigation Inactive)</span>
              </span>
            ) : (
              <>
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
              </>
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
            Enquiry & Timeline ({allTimelineEntries.length})
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
            Case Diary / Parcha Zimni ({caseItem.fullInvestigationZimni.length})
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
              
              {/* Top Banner: Fresh Complaint Awaiting SHO Verification & IO Assignment */}
              {caseItem.caseStage === 'COMPLAINT_RECEIVED' && (
                <div className="p-4 rounded-xl border-2 border-amber-500 bg-amber-50/90 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-amber-200/80 border border-amber-400 flex items-center justify-center text-amber-800 shrink-0 mt-0.5">
                      <UserCheck className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-xs sm:text-sm text-amber-950">
                          Fresh Complaint Received • Awaiting SHO Verification & IO Assignment
                        </h4>
                        <span className="px-2 py-0.2 rounded bg-red-600 text-white text-[10px] font-bold">
                          SHO Action Required
                        </span>
                      </div>
                      <p className="text-xs text-amber-900/90 leading-relaxed">
                        Recorded at {caseItem.policeStation}. Please inspect the complainant's statement, examine attached evidence files, and designate an Investigating Officer (IO) to commence the Preliminary Enquiry.
                      </p>
                    </div>
                  </div>
                  {(currentRole === 'SHO' || currentRole === 'ADMIN') && (
                    <button
                      onClick={onOpenAssignIO}
                      className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 rounded-lg text-xs font-bold shrink-0 shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck className="h-4 w-4 stroke-[2.5]" />
                      <span>Verify & Assign IO Now</span>
                    </button>
                  )}
                </div>
              )}

              {/* Top Banner: New Case Assigned Awaiting IO Acceptance */}
              {caseItem.ioAcceptance?.status === 'PENDING_ACCEPTANCE' && (
                <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/95 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-emerald-200/80 border border-emerald-400 flex items-center justify-center text-emerald-800 shrink-0 mt-0.5">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-xs sm:text-sm text-emerald-950">
                          New Case Assigned by SHO ({caseItem.ioAcceptance.assignedBySHO}) • Acceptance Required
                        </h4>
                        <span className="px-2 py-0.5 rounded bg-amber-600 text-white text-[10px] font-bold animate-pulse">
                          Pending IO Acceptance
                        </span>
                      </div>
                      <p className="text-xs text-emerald-900/90 leading-relaxed">
                        Assigned to <strong>{caseItem.currentIO.name}</strong> ({caseItem.currentIO.rank}). {caseItem.ioAcceptance.shoInstructions ? `SHO Directives: "${caseItem.ioAcceptance.shoInstructions}"` : 'Please accept the case docket to assume formal investigative charge.'}
                      </p>
                    </div>
                  </div>
                  {(currentRole === 'IO' || currentRole === 'ADMIN') && onAcceptCase && (
                    <button
                      onClick={() => onAcceptCase(caseItem.id)}
                      className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-lg text-xs font-bold shrink-0 shadow-md flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
                      <span>Accept Case & Take Charge</span>
                    </button>
                  )}
                </div>
              )}

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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Haryana Police Procedural Workflow Engine
                  </h3>
                  <p className="text-xs text-slate-500">
                    Visual tracker highlighting statutory investigation lifecycle and terminal disposal states
                  </p>
                </div>
                {isClosedAtEnquiry ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>जांच उपरांत बंद • पूर्ण विवेचना निष्क्रीय</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                    <span>विवेचना प्रक्रिया सक्रिय (Active Pipeline)</span>
                  </span>
                )}
              </div>

              {/* Special Statutory Closure Banner for Closed Cases */}
              {isClosedAtEnquiry && (
                <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950 text-white rounded-xl border-2 border-emerald-500/60 shadow-md space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-sm text-emerald-100">
                        प्रकरण प्रारंभिक जांच (PE) स्तर पर अंतिम आख्या द्वारा निस्तारित / दफ्तर दाखिल
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-xs">
                      <CheckCircle2 className="h-3 w-3" /> Case Closed at Enquiry Stage
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    जांच अधिकारी (IO) द्वारा थाना प्रभारी (SHO) को अंतिम जांच आख्या (दफ्तर दाखिल / समझौता / सिविल विवाद) प्रस्तुत कर दी गई है। BNSS व हरियाणा पुलिस कार्यप्रणाली अनुसार, चूंकि प्रकरण प्रारंभिक जांच स्तर पर ही समाप्त हो गया है, अतः इसके उपरांत वाले सभी प्रक्रियात्मक चरण — <strong>औपचारिक FIR, पूर्ण विवेचना (Full Investigation), दैनिक केस डायरी (Parcha Zimni), न्यायालय चालान व अदालती विचारण</strong> — स्वतः <strong>निष्क्रीय (INACTIVE)</strong> हैं।
                  </p>
                  {(caseItem.preliminaryEnquiry?.writtenFinalReport?.concludingRecommendation ||
                    caseItem.preliminaryEnquiry?.closureReason ||
                    caseItem.preliminaryEnquiry?.finalReportSummary ||
                    docketSummaryStr) && (
                    <div className="text-[11px] bg-black/40 p-2.5 rounded-lg border border-emerald-500/30 text-emerald-200">
                      <strong>अंतिम निष्कर्ष व संस्तुति:</strong> "
                      {caseItem.preliminaryEnquiry?.writtenFinalReport?.concludingRecommendation ||
                        caseItem.preliminaryEnquiry?.closureReason ||
                        caseItem.preliminaryEnquiry?.finalReportSummary ||
                        docketSummaryStr}
                      "
                    </div>
                  )}
                </div>
              )}

              {/* Flow Steps Visualizer */}
              <div className="space-y-4 max-w-2xl mx-auto py-2">
                {isClosedAtEnquiry ? (
                  /* ================= CLOSED AT ENQUIRY WORKFLOW (SUBSEQUENT STEPS INACTIVE) ================= */
                  [
                    {
                      id: 'COMPLAINT_RECEIVED',
                      stepNumber: 1,
                      title: '1. Citizen Complaint Received (नागरिक परिवाद प्राप्त)',
                      sub: 'Registered by MHC / Duty Officer with Complainant, Suspect & Initial Evidences',
                      isCompleted: true,
                      isTerminalClosed: false,
                      isInactive: false
                    },
                    {
                      id: 'IO_ASSIGNED',
                      stepNumber: 2,
                      title: '2. SHO Reviews & Assigns Enquiry Officer (IO) (जांच अधिकारी नियुक्त)',
                      sub: `Assigned to ${caseItem.currentIO?.name || 'Enquiry Officer'} (${caseItem.currentIO?.rank || 'ASI'}). Priority & Spot Visit Directions Issued.`,
                      isCompleted: true,
                      isTerminalClosed: false,
                      isInactive: false
                    },
                    {
                      id: 'PRELIMINARY_ENQUIRY',
                      stepNumber: 3,
                      title: '3. Preliminary Enquiry (PE) by IO (प्रारंभिक जांच)',
                      sub: 'Spot inspection, day-wise timeline zimni, witness/complainant depositions, and genuineness assessment completed.',
                      isCompleted: true,
                      isTerminalClosed: false,
                      isInactive: false
                    },
                    {
                      id: 'FINAL_REPORT_CLOSED',
                      stepNumber: 4,
                      title: '4. अंतिम जांच आख्या SHO को प्रेषित (Final Report Submitted • दफ्तर दाखिल / Case Closed)',
                      sub: caseItem.preliminaryEnquiry?.writtenFinalReport?.concludingRecommendation
                        ? `IO द्वारा आधिकारिक लिखित अंतिम आख्या SHO को प्रस्तुत। संस्तुति: "${caseItem.preliminaryEnquiry.writtenFinalReport.concludingRecommendation.slice(0, 150)}..." परिवाद प्रारंभिक जांच उपरांत दफ्तर दाखिल / बंद।`
                        : caseItem.preliminaryEnquiry?.closureReason
                        ? `प्रकरण प्रारंभिक जांच स्तर पर दफ्तर दाखिल। कारण: ${caseItem.preliminaryEnquiry.closureReason}`
                        : 'IO द्वारा अंतिम रिपोर्ट प्रस्तुत कर परिवाद को दफ्तर दाखिल (File to record / Closed) करने की संस्तुति की गई।',
                      isCompleted: true,
                      isTerminalClosed: true,
                      isInactive: false
                    },
                    {
                      id: 'FIR_REGISTERED',
                      stepNumber: 5,
                      title: '5. SHO / SP Decision: Formal FIR Registered (प्राथमिकी / FIR)',
                      sub: 'निष्क्रीय (INACTIVE): जांच में संज्ञेय अपराध न पाए जाने अथवा आपसी समझौते के कारण औपचारिक FIR दर्ज नहीं की गई। (Bypassed - No FIR registered).',
                      isCompleted: false,
                      isTerminalClosed: false,
                      isInactive: true
                    },
                    {
                      id: 'UNDER_INVESTIGATION',
                      stepNumber: 6,
                      title: '6. Full Investigation & Daily Zimni Diary (पूर्ण विवेचना / केस डायरी)',
                      sub: 'निष्क्रीय (INACTIVE): प्रकरण प्रारंभिक जांच में ही निस्तारित होने के कारण पूर्ण विवेचना, पर्चा जिमनी, FSL/CDR व गिरफ्तारी की प्रक्रियाएं पूर्णतः निष्क्रीय हैं। (Bypassed - Full investigation inactive).',
                      isCompleted: false,
                      isTerminalClosed: false,
                      isInactive: true
                    },
                    {
                      id: 'CHARGESHEET_PREPARED',
                      stepNumber: 7,
                      title: '7. Chargesheet (Challan) & Senior Review (न्यायालय चालान)',
                      sub: 'निष्क्रीय (INACTIVE): दांडिक अभियोग न होने से न्यायालय चालान की प्रक्रिया लागू नहीं है। (Bypassed - No chargesheet applicable).',
                      isCompleted: false,
                      isTerminalClosed: false,
                      isInactive: true
                    },
                    {
                      id: 'UNDER_TRIAL',
                      stepNumber: 8,
                      title: '8. Court Submission & Trial Tracking (अदालती विचारण)',
                      sub: 'निष्क्रीय (INACTIVE): न्यायालय में विचारण प्रक्रिया लागू नहीं है। (Bypassed - No court trial).',
                      isCompleted: false,
                      isTerminalClosed: false,
                      isInactive: true
                    },
                    {
                      id: 'DISPOSED',
                      stepNumber: 9,
                      title: '9. Final Court Judgment & Judicial Disposal (न्यायिक निर्णय)',
                      sub: 'निष्क्रीय (INACTIVE): न्यायिक निस्तारण लागू नहीं; प्रकरण पुलिस स्तर पर जांच उपरांत ही अंतिम रूप से निस्तारित। (Bypassed - Disposed at enquiry).',
                      isCompleted: false,
                      isTerminalClosed: false,
                      isInactive: true
                    }
                  ].map((step, idx) => {
                    return (
                      <div key={step.id} className="relative flex items-start gap-4">
                        {/* Line connector */}
                        {idx < 8 && (
                          <div className={`absolute left-4 top-8 ${
                            step.isInactive || idx >= 3
                              ? 'w-0 h-10 border-l-2 border-dashed border-slate-300'
                              : 'w-0.5 h-10 bg-emerald-500'
                          }`}></div>
                        )}

                        {/* Icon bubble */}
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 ${
                          step.isTerminalClosed
                            ? 'bg-emerald-700 text-white ring-4 ring-emerald-200 shadow-md animate-pulse'
                            : step.isInactive
                            ? 'bg-slate-100 text-slate-400 border border-slate-300'
                            : 'bg-emerald-600 text-white shadow-xs'
                        }`}>
                          {step.isTerminalClosed ? (
                            <ShieldCheck className="h-4.5 w-4.5 text-white" />
                          ) : step.isInactive ? (
                            <Ban className="h-4 w-4 text-slate-400" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </div>

                        {/* Content Box */}
                        {step.isTerminalClosed ? (
                          <div className="flex-1 p-4 rounded-xl border-2 border-emerald-500 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-white shadow-sm text-xs space-y-2">
                            <div className="flex items-center justify-between flex-wrap gap-1">
                              <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                {step.title}
                              </h4>
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                                <CheckCircle2 className="h-3 w-3" /> DISPOSED AT ENQUIRY (निस्तारित)
                              </span>
                            </div>
                            <p className="text-slate-700 font-medium leading-relaxed">{step.sub}</p>
                            
                            <div className="pt-2 border-t border-emerald-200 flex items-center justify-between flex-wrap gap-2 text-[11px]">
                              <span className="text-emerald-800 font-semibold">
                                {caseItem.preliminaryEnquiry?.writtenFinalReport?.citizenSatisfaction === 'YES'
                                  ? 'नागरिक संतुष्टि: संतुष्ट (Compromise / Satisfied)'
                                  : 'नागरिक संतुष्टि: दर्ज (Report on Record)'}
                              </span>
                              <button
                                type="button"
                                onClick={() => setActiveTab('ENQUIRY')}
                                className="text-emerald-800 hover:text-emerald-950 font-bold underline flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                लिखित अंतिम आख्या देखें (View Written Final Report)
                              </button>
                            </div>
                          </div>
                        ) : step.isInactive ? (
                          <div className="flex-1 p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 opacity-60 text-xs">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-slate-500 line-through decoration-slate-400">
                                {step.title}
                              </h4>
                              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <Ban className="h-3 w-3" /> निष्क्रीय (INACTIVE)
                              </span>
                            </div>
                            <p className="text-slate-500 mt-0.5 italic">{step.sub}</p>
                          </div>
                        ) : (
                          <div className="flex-1 p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-slate-800">
                                {step.title}
                              </h4>
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> COMPLETED
                              </span>
                            </div>
                            <p className="text-slate-600 mt-0.5">{step.sub}</p>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  /* ================= STANDARD ACTIVE INVESTIGATION WORKFLOW ================= */
                  [
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
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PRELIMINARY ENQUIRY */}
          {activeTab === 'ENQUIRY' && (
            <div className="space-y-6">
              {caseItem.preliminaryEnquiry ? (
                <div className="space-y-4">
                  {/* SHO Action Required Alert Banner */}
                  {caseItem.preliminaryEnquiry.shoActionRequested === 'PENDING_SHO_REVIEW' && (
                    <div className="p-4 bg-gradient-to-r from-red-50 to-amber-50 border-2 border-red-300 rounded-xl shadow-xs space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="h-5 w-5 text-red-600 animate-bounce" />
                          <div>
                            <h4 className="font-bold text-sm text-red-950">
                              SHO Action Required: Enquiry Report Submitted by IO
                            </h4>
                            <p className="text-xs text-red-700">
                              जांच अधिकारी ने शिकायत की विस्तृत जांच आख्या प्रस्तुत कर दी है। कृपया अवलोकन कर निर्णय लें।
                            </p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-600 text-white animate-pulse">
                          Awaiting SHO Decision
                        </span>
                      </div>

                      {/* Prompt to input demand notes if demanding final report */}
                      {showDemandPrompt ? (
                        <div className="p-3 bg-white rounded-lg border border-amber-300 space-y-2">
                          <label className="block text-xs font-bold text-slate-800">
                            Instructions for IO for Final Report / Chargesheet (IO के लिए निर्देश):
                          </label>
                          <textarea
                            value={shoDemandNotes}
                            onChange={(e) => setShoDemandNotes(e.target.value)}
                            placeholder="e.g. Please compile complete evidence docket, record 161 statements of remaining witnesses, and forward the final chargesheet docket."
                            className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                            rows={2}
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setShowDemandPrompt(false)}
                              className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (onShoDemandFinalReport) {
                                  onShoDemandFinalReport(caseItem.id, shoDemandNotes.trim());
                                }
                                setShowDemandPrompt(false);
                              }}
                              className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
                            >
                              Confirm Demand Final Report (अंतिम रिपोर्ट मांगें)
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap pt-1">
                          <button
                            type="button"
                            onClick={onOpenGenerateFIR}
                            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <FileCheck2 className="h-4 w-4" /> 1. Generate FIR (FIR दर्ज करने का आदेश)
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDemandPrompt(true)}
                            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <FileText className="h-4 w-4" /> 2. Ask for Final Report / Chargesheet (अंतिम रिपोर्ट मांगें)
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowClosureForm(true)}
                            className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-xs font-medium transition-all cursor-pointer"
                          >
                            Close Complaint (शिकायत नस्तीबद्ध करें)
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* If SHO already asked for final report */}
                  {caseItem.preliminaryEnquiry.shoActionRequested === 'SHO_ASKED_FINAL_REPORT' && (
                    <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                          <div>
                            <h4 className="font-bold text-sm text-amber-950">
                              SHO Instruction: Demanded Final Report / Chargesheet
                            </h4>
                            <p className="text-xs text-amber-800">
                              एसएचओ ने संपूर्ण साक्ष्य, बयानों एवं संदेही विवरण के साथ अंतिम रिपोर्ट / चालान अग्रेषित करने का निर्देश दिया है।
                            </p>
                          </div>
                        </div>
                        {!caseItem.preliminaryEnquiry.finalReportSubmittedByIO && (
                          <button
                            type="button"
                            onClick={() => setIsForwardFinalReportModalOpen(true)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                          >
                            <FileCheck2 className="h-4 w-4" /> Forward Final Report (चालान अग्रेषित करें)
                          </button>
                        )}
                      </div>
                      {caseItem.preliminaryEnquiry.shoDemandNotes && (
                        <div className="p-2.5 bg-white rounded border border-amber-200 text-xs text-slate-800">
                          <strong>SHO Note:</strong> {caseItem.preliminaryEnquiry.shoDemandNotes}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Real-time Banner / Display for Official Written Final Report Submitted by IO */}
                  {(caseItem.preliminaryEnquiry.writtenFinalReport || caseItem.preliminaryEnquiry.finalReportSubmittedByIO) && (
                    <div className="bg-gradient-to-br from-emerald-950/90 via-slate-900 to-slate-950 border-2 border-emerald-500/80 rounded-2xl p-5 text-white shadow-xl space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/60 pb-3">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="px-2.5 py-0.5 rounded bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                            <FileCheck2 className="h-3.5 w-3.5" />
                            अंतिम जांच आख्या • Official Police Written Final Report
                          </span>
                          <span className="text-xs text-emerald-300 font-semibold font-mono">
                            Status: अग्रेषित (Forwarded to SHO)
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsForwardFinalReportModalOpen(true)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Edit Report (संपादित करें)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            <span>Print (प्रिंट)</span>
                          </button>
                        </div>
                      </div>

                      {/* Document Preview Layout (Authentic Haryana Police Format) */}
                      {caseItem.preliminaryEnquiry.writtenFinalReport ? (
                        <div className="bg-white text-slate-950 rounded-xl p-5 sm:p-6 border-2 border-slate-900 font-serif space-y-4 shadow-inner">
                          
                          {/* Citizen Detail Table */}
                          <div className="border border-slate-900 divide-y divide-slate-900 text-xs sm:text-sm">
                            <div className="p-2 font-bold tracking-wider text-center uppercase bg-slate-100 flex items-center justify-between">
                              <span>{caseItem.preliminaryEnquiry.writtenFinalReport.department}</span>
                              <span className="text-[11px] font-sans font-normal text-slate-600">हरियाणा पुलिस</span>
                            </div>
                            <div className="p-1.5 font-bold uppercase bg-slate-50 text-[11px] tracking-wide">
                              CITIZEN DETAIL-
                            </div>
                            <div className="p-2 flex items-start gap-2">
                              <span className="font-bold shrink-0">NAME-</span>
                              <span>{caseItem.preliminaryEnquiry.writtenFinalReport.citizenName}</span>
                            </div>
                            <div className="p-2 flex items-center gap-2">
                              <span className="font-bold shrink-0">MOBILE NO.-</span>
                              <span className="font-mono">{caseItem.preliminaryEnquiry.writtenFinalReport.citizenMobile}</span>
                            </div>
                            <div className="p-2 flex items-start gap-2">
                              <span className="font-bold shrink-0">ADDRESS-</span>
                              <span>{caseItem.preliminaryEnquiry.writtenFinalReport.citizenAddress}</span>
                            </div>
                            <div className="p-2 flex items-start gap-2">
                              <span className="font-bold shrink-0">शिकायत मे लगाये गये आरोप-</span>
                              <span>{caseItem.preliminaryEnquiry.writtenFinalReport.complaintAllegations}</span>
                            </div>
                            <div className="p-2 flex items-center justify-between">
                              <div>
                                <span className="font-bold">DATE OF REPORT- </span>
                                <span className="font-mono">{caseItem.preliminaryEnquiry.writtenFinalReport.reportDate}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold">CITIZEN SATISFACTION- </span>
                                <span className={`px-2 py-0.5 rounded font-bold font-sans text-xs ${
                                  caseItem.preliminaryEnquiry.writtenFinalReport.citizenSatisfaction === 'YES'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {caseItem.preliminaryEnquiry.writtenFinalReport.citizenSatisfaction}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Heading */}
                          <div className="text-center pt-2">
                            <h4 className="font-bold text-sm sm:text-base underline uppercase tracking-wide">
                              {caseItem.preliminaryEnquiry.writtenFinalReport.enquiryHeading}
                            </h4>
                          </div>

                          {/* Body Paragraphs */}
                          <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-justify">
                            <p>
                              <strong>1. परिवाद अध्ययन व नोटिस: </strong>
                              {caseItem.preliminaryEnquiry.writtenFinalReport.noticeAndStudyNarrative}
                            </p>

                            {caseItem.preliminaryEnquiry.writtenFinalReport.previousComplaintsReference && (
                              <p>
                                <strong>2. पूर्व परिवादों का परीक्षण: </strong>
                                {caseItem.preliminaryEnquiry.writtenFinalReport.previousComplaintsReference}
                              </p>
                            )}

                            <div className="p-3 bg-slate-50 rounded border border-slate-200">
                              <strong className="block mb-1 text-slate-900">3. उत्तरवादी/विपक्षी पक्ष के बयान व पूछताछ:</strong>
                              <p className="whitespace-pre-line text-slate-800">
                                {caseItem.preliminaryEnquiry.writtenFinalReport.respondentStatements}
                              </p>
                            </div>

                            {/* Attached Documents Reference Block */}
                            <div className="p-3 bg-emerald-50 rounded border border-emerald-300">
                              <strong className="block mb-1 text-emerald-950 flex items-center gap-1.5">
                                <Paperclip className="h-4 w-4 text-emerald-700" />
                                4. संलग्न दस्तावेजों व साक्ष्यों का परीक्षण (Attached Documents Reference):
                              </strong>
                              <p className="whitespace-pre-line text-emerald-950">
                                {caseItem.preliminaryEnquiry.writtenFinalReport.attachedDocumentsReference}
                              </p>
                            </div>

                            <p>
                              <strong>5. परिवादी के बयान व परीक्षण: </strong>
                              {caseItem.preliminaryEnquiry.writtenFinalReport.complainantStatementNarrative}
                            </p>

                            <div className="p-3 bg-amber-50 rounded border border-amber-300">
                              <strong className="block mb-1 text-amber-950">6. जांच अधिकारी का निष्कर्ष व विश्लेषण:</strong>
                              <p className="whitespace-pre-line text-amber-950 font-medium">
                                {caseItem.preliminaryEnquiry.writtenFinalReport.ioFindingsAndAnalysis}
                              </p>
                            </div>

                            <div className="p-3 bg-slate-100 rounded border border-slate-300 font-bold">
                              <span className="block mb-1 text-slate-900">7. अंतिम संस्तुति व प्रार्थना:</span>
                              <p className="whitespace-pre-line text-slate-950">
                                {caseItem.preliminaryEnquiry.writtenFinalReport.concludingRecommendation}
                              </p>
                            </div>
                          </div>

                          {/* Sign-off */}
                          <div className="pt-4 border-t border-slate-300 flex items-end justify-between text-xs sm:text-sm">
                            <p className="font-bold">रिपोर्ट सेवा में सादर प्रेषित है।</p>
                            <div className="text-right">
                              <p className="font-bold">{caseItem.preliminaryEnquiry.writtenFinalReport.officerSignatureRank}</p>
                              <p>{caseItem.preliminaryEnquiry.writtenFinalReport.officerSignatureName}</p>
                              <p className="text-slate-600">{caseItem.preliminaryEnquiry.writtenFinalReport.officerStation}</p>
                              <p className="font-sans text-[11px] text-slate-500">दिनांक {caseItem.preliminaryEnquiry.writtenFinalReport.officerDate}</p>
                            </div>
                          </div>

                        </div>
                      ) : (
                        <div className="p-4 bg-emerald-900/40 rounded-xl border border-emerald-500/40 text-xs text-emerald-200">
                          <p><strong>Compilation Summary:</strong> {caseItem.preliminaryEnquiry.finalReportSummary || 'Final report compiled and forwarded by IO.'}</p>
                          <p className="text-[11px] text-emerald-300/80 mt-1">Submitted at: {caseItem.preliminaryEnquiry.finalReportForwardedAt || 'N/A'}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Main Preliminary Enquiry Card */}
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

                    {/* IO Final Words & Recommendation Block */}
                    {caseItem.preliminaryEnquiry.ioFinalRemarks && (
                      <div className="p-4 bg-gradient-to-r from-amber-50/80 to-slate-50 rounded-xl border-2 border-amber-300/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-amber-600" />
                            IO Final Words & Legal Conclusion (जांच अधिकारी के अंतिम शब्द व विधिक राय)
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Submitted: {caseItem.preliminaryEnquiry.enquiryCompletedDate || 'Recorded'}
                          </span>
                        </div>
                        <p className="text-slate-900 leading-relaxed font-serif bg-white p-3 rounded-lg border border-amber-200 text-xs">
                          {typeof caseItem.preliminaryEnquiry.ioFinalRemarks === 'string'
                            ? caseItem.preliminaryEnquiry.ioFinalRemarks
                            : (caseItem.preliminaryEnquiry.ioFinalRemarks as any)?.remarksNarrative || caseItem.preliminaryEnquiry.enquirySummary}
                        </p>
                        {caseItem.preliminaryEnquiry.suggestedSections && (
                          <div className="text-[11px] text-slate-700">
                            <strong>Suggested Sections:</strong> <span className="font-mono text-amber-900">{caseItem.preliminaryEnquiry.suggestedSections}</span>
                          </div>
                        )}
                      </div>
                    )}

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

              {/* Unified Day-Wise Enquiry & Investigation Timeline Log */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-amber-600" />
                      Enquiry & Investigation Timeline Log (दिन-वार जांच एवं केस डायरी)
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      All daily actions & case diary entries grouped by Day. Multiple actions can be added to the same day.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenAddZimni(true)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> + New Day / Action (+ नई कार्रवाई)
                    </button>
                  </div>
                </div>

                {/* Toast alert if an entry was deleted or updated */}
                {timelineNotificationToast && (
                  <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{timelineNotificationToast}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTimelineNotificationToast(null)}
                      className="text-emerald-700 hover:text-emerald-950 text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Day Filter Dropdown & Live Sync Status Bar */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Detailed Dropdown for Days */}
                    <div className="flex items-center gap-2 flex-wrap flex-1 min-w-[320px]">
                      <div className="flex items-center gap-1.5 text-xs text-slate-800 font-bold shrink-0">
                        <Filter className="h-3.5 w-3.5 text-amber-600" />
                        <span>Day Filter (दिन विवरण ड्रॉपडाउन):</span>
                      </div>
                      <select
                        value={selectedDayFilter}
                        onChange={(e) => setSelectedDayFilter(e.target.value)}
                        className="flex-1 min-w-[240px] px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none shadow-xs"
                      >
                        <option value="ALL">All Days (सभी दिन - {groupedTimelineByDay.length} Days total)</option>
                        {groupedTimelineByDay.map((g) => {
                          const actionsPreview = g.entries.map((e) => e.entry.actionTaken).slice(0, 2).join(', ');
                          const moreCount = g.entries.length > 2 ? ` +${g.entries.length - 2} more` : '';
                          return (
                            <option key={g.date} value={g.date}>
                              Day 0{g.dayNumber} ({g.date}) — {g.entries.length} Action{g.entries.length > 1 ? 's' : ''}: {actionsPreview}{moreCount}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Quick Expand/Collapse toggles & Counts */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[11px]">
                        <button
                          type="button"
                          onClick={expandAllDays}
                          className="px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 font-medium border border-slate-200 cursor-pointer shadow-2xs"
                        >
                          Expand All (सभी खोलें)
                        </button>
                        <button
                          type="button"
                          onClick={collapseAllDays}
                          className="px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 font-medium border border-slate-200 cursor-pointer shadow-2xs"
                        >
                          Collapse All (समेटें)
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 font-semibold">
                          Enquiry: {caseItem.enquiryTimelineZimni.length}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-300 font-semibold">
                          Parcha: {caseItem.fullInvestigationZimni.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Selected Day Detail Summary Card (shows if a specific day is selected) */}
                  {selectedDayFilter !== 'ALL' && (() => {
                    const activeSelectedDay = groupedTimelineByDay.find(
                      (g) => g.date === selectedDayFilter || `Day 0${g.dayNumber}` === selectedDayFilter
                    );
                    if (!activeSelectedDay) return null;
                    const officers = [...new Set(activeSelectedDay.entries.map((e) => e.entry.officerName))];
                    const locations = [...new Set(activeSelectedDay.entries.map((e) => e.entry.locationVisited).filter(Boolean))];

                    return (
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-3 shadow-xs space-y-2 animate-in fade-in">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-amber-600 text-white font-black text-xs uppercase tracking-wide">
                              Day 0{activeSelectedDay.dayNumber} Details
                            </span>
                            <span className="font-mono text-xs font-bold text-slate-800 flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-amber-600" />
                              {activeSelectedDay.date}
                            </span>
                            <span className="text-xs text-amber-900 font-bold bg-white/80 px-2 py-0.5 rounded border border-amber-200">
                              {activeSelectedDay.entries.length} {activeSelectedDay.entries.length === 1 ? 'Action' : 'Actions'} logged
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onOpenAddZimni(activeSelectedDay.entries[0]?.isEnquiry ?? true, activeSelectedDay.date)}
                              className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5" /> + Add More Action on Day 0{activeSelectedDay.dayNumber} (+ इस दिन अन्य कार्रवाई)
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedDayFilter('ALL')}
                              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold cursor-pointer"
                            >
                              Show All Days (सभी दिन दिखाएं)
                            </button>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-amber-200/60">
                          <div>
                            <span className="font-bold text-slate-900">Officers Active:</span> {officers.join(', ')}
                          </div>
                          {locations.length > 0 && (
                            <div>
                              <span className="font-bold text-slate-900">Locations Visited:</span> {locations.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {filteredTimelineByDay.length === 0 ? (
                  <div className="p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                    <BookOpen className="h-8 w-8 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-600 font-medium">No timeline remarks or zimni entries found for the selected view.</p>
                    <p className="text-[11px] text-slate-400">Click below to record new investigation actions and observations.</p>
                    <button
                      onClick={() => onOpenAddZimni(true)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 mt-2 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Record Day 01 Action (कार्रवाई दर्ज करें)
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTimelineByDay.map((dayGroup) => (
                      <div
                        key={dayGroup.date}
                        className="bg-slate-50/90 rounded-xl border border-slate-200 overflow-hidden shadow-xs"
                      >
                        {/* Day Group Header with Collapsible Accordion */}
                        <div
                          onClick={() => toggleDayCollapse(dayGroup.date)}
                          className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-850 select-none transition-colors"
                        >
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <button
                              type="button"
                              className="p-0.5 rounded hover:bg-slate-700 text-slate-300"
                              title={collapsedDays[dayGroup.date] ? 'Expand day' : 'Collapse day'}
                            >
                              {collapsedDays[dayGroup.date] ? (
                                <ChevronDown className="h-4 w-4 text-amber-400" />
                              ) : (
                                <ChevronUp className="h-4 w-4 text-amber-400" />
                              )}
                            </button>
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs tracking-wide uppercase">
                              Day 0{dayGroup.dayNumber}
                            </span>
                            <span className="font-mono text-xs text-slate-200 flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-amber-400" />
                              {dayGroup.date}
                            </span>
                            <span className="text-[11px] text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                              {dayGroup.entries.length} {dayGroup.entries.length === 1 ? 'Action' : 'Actions'} Recorded ({dayGroup.entries.length} कार्रवाई)
                            </span>
                            {collapsedDays[dayGroup.date] && (
                              <span className="text-[11px] text-amber-300 italic font-medium">
                                (Click to expand day actions)
                              </span>
                            )}
                          </div>

                          {/* Add More Action to this specific Day */}
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => onOpenAddZimni(dayGroup.entries[0]?.isEnquiry ?? true, dayGroup.date)}
                              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                              title="Add another action that happened on this exact same day"
                            >
                              <Plus className="h-3 w-3" /> Add More Action (+ इसी दिन अन्य कार्रवाई)
                            </button>
                          </div>
                        </div>

                        {/* Chronological Actions within this Day - collapsible */}
                        {!collapsedDays[dayGroup.date] && (
                          <div className="p-3.5 space-y-3 animate-in fade-in duration-100">
                            {dayGroup.entries.map((item) => (
                              <div
                                key={item.entry.id}
                                className="relative pl-6 pb-2 before:absolute before:left-2 before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-300 last:before:hidden"
                              >
                                {/* Step dot */}
                                <div className={`absolute left-0.5 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white shadow-xs ${
                                  item.isEnquiry ? 'bg-amber-600' : 'bg-blue-600'
                                }`} />

                                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                                  {/* Entry header */}
                                  <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-xs font-bold text-slate-700 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
                                        <Clock className="h-3 w-3 text-slate-500" />
                                        {item.entry.time}
                                      </span>
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.badgeColor}`}>
                                        {item.typeLabel}
                                      </span>
                                    </div>

                                    {/* Action Buttons: Edit and Delete with Working Confirmation */}
                                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        type="button"
                                        onClick={() => onOpenAddZimni(item.isEnquiry, item.entry.date, item.entry)}
                                        className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 text-xs font-medium border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                                        title="Edit this timeline entry"
                                      >
                                        <Edit3 className="h-3 w-3 text-amber-600" /> Edit (संपादित करें)
                                      </button>

                                      {onDeleteZimni && (
                                        deletingZimniId === item.entry.id ? (
                                          <div
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-2 bg-rose-100 border-2 border-rose-400 px-3 py-1 rounded-lg text-xs shadow-md animate-in fade-in"
                                          >
                                            <AlertTriangle className="h-3.5 w-3.5 text-rose-700 shrink-0" />
                                            <span className="text-rose-950 font-bold text-xs">Confirm Delete? (हटाएं?)</span>
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteZimni(caseItem.id, item.entry.id);
                                                setDeletingZimniId(null);
                                                setTimelineNotificationToast('Action successfully removed from case timeline docket (कार्रवाई हटाई गई).');
                                                setTimeout(() => setTimelineNotificationToast(null), 3500);
                                              }}
                                              className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs cursor-pointer shadow-xs"
                                            >
                                              Yes, Delete (हाँ, हटाएं)
                                            </button>
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setDeletingZimniId(null);
                                              }}
                                              className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold cursor-pointer"
                                            >
                                              Cancel (रद्द)
                                            </button>
                                          </div>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setDeletingZimniId(item.entry.id);
                                            }}
                                            className="px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 text-xs font-semibold border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                                            title="Delete this timeline entry"
                                          >
                                            <Trash2 className="h-3 w-3 text-rose-600" />
                                            <span>Delete (हटाएं)</span>
                                          </button>
                                        )
                                      )}
                                    </div>
                                  </div>

                                  {/* Action Title */}
                                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                    <span>Action Taken:</span>
                                    <span className="text-amber-950 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                      {item.entry.actionTaken}
                                    </span>
                                  </div>

                                  {/* Findings */}
                                  <p className="text-slate-800 leading-relaxed font-serif bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/80 text-xs">
                                    {item.entry.findings}
                                  </p>

                                  {/* Footer details */}
                                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                                    <span className="flex items-center gap-1">
                                      <User className="h-3 w-3 text-slate-400" />
                                      Officer: <strong>{item.entry.officerName}</strong> ({item.entry.officerRank})
                                    </span>
                                    {item.entry.locationVisited && (
                                      <span className="flex items-center gap-1 text-slate-600">
                                        <MapPin className="h-3 w-3 text-red-500" />
                                        {item.entry.locationVisited}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}

                            {/* Quick Add More Action at bottom of Day Group */}
                            <div className="pt-2">
                              <button
                                type="button"
                                onClick={() => onOpenAddZimni(dayGroup.entries[0]?.isEnquiry ?? true, dayGroup.date)}
                                className="w-full py-2 bg-amber-50/80 hover:bg-amber-100 border border-dashed border-amber-300 rounded-lg text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Plus className="h-3.5 w-3.5 text-amber-700" />
                                <span>+ Add More Action on Day 0{dayGroup.dayNumber} ({dayGroup.date}) (+ इसी दिन अन्य कार्रवाई जोड़ें)</span>
                              </button>
                            </div>
                          </div>
                        )}
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-amber-600" />
                    Official Case Diary (Parcha Zimni / पर्चा जिमनी)
                  </h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Chronological record of daily investigation mandated under Police Rules. All Zimnis automatically sync into the Enquiry & Case Timeline by Day.
                  </p>
                </div>
                <button
                  onClick={() => onOpenAddZimni(false)}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> + New Parcha Zimni
                </button>
              </div>

              {/* Sync notification */}
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-xs text-blue-900">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                  <strong>Automatic Day Timeline Integration:</strong> Any Zimni recorded here automatically organizes into the <strong>Enquiry & Timeline</strong> tab by its calendar day.
                </span>
                <span className="font-bold text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  {caseItem.fullInvestigationZimni.length} Zimnis
                </span>
              </div>

              {caseItem.fullInvestigationZimni.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 text-center space-y-2">
                  <p className="text-slate-500 italic">No post-FIR Parcha Zimni recorded yet.</p>
                  <button
                    onClick={() => onOpenAddZimni(false)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-semibold text-xs cursor-pointer"
                  >
                    Start Zimni #1
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {caseItem.fullInvestigationZimni.map((zim) => (
                    <div key={zim.id} className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-amber-900 text-sm">
                            Zimni No. {zim.zimniNumber}
                          </span>
                          <span className="font-mono text-slate-500 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                            {zim.date} • {zim.time}
                          </span>
                        </div>

                        {/* Edit and Delete Buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenAddZimni(false, zim.date, zim)}
                            className="px-2.5 py-1 rounded-md bg-white hover:bg-amber-100 text-slate-700 hover:text-amber-900 text-xs font-medium border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Edit this Parcha Zimni"
                          >
                            <Edit3 className="h-3 w-3 text-amber-600" /> Edit (संपादित करें)
                          </button>

                          {onDeleteZimni && (
                            deletingZimniId === zim.id ? (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-2 bg-rose-100 border-2 border-rose-400 px-3 py-1 rounded-lg text-xs shadow-md animate-in fade-in"
                              >
                                <AlertTriangle className="h-3.5 w-3.5 text-rose-700 shrink-0" />
                                <span className="text-rose-950 font-bold text-xs">Delete Zimni? (हटाएं?)</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteZimni(caseItem.id, zim.id);
                                    setDeletingZimniId(null);
                                    setTimelineNotificationToast(`Parcha Zimni #${zim.zimniNumber} deleted successfully.`);
                                    setTimeout(() => setTimelineNotificationToast(null), 3500);
                                  }}
                                  className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs cursor-pointer shadow-xs"
                                >
                                  Yes, Delete (हाँ, हटाएं)
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletingZimniId(null);
                                  }}
                                  className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold cursor-pointer"
                                >
                                  Cancel (रद्द)
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingZimniId(zim.id);
                                }}
                                className="px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 text-xs font-semibold border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Delete this Zimni"
                              >
                                <Trash2 className="h-3 w-3 text-rose-600" />
                                <span>Delete (हटाएं)</span>
                              </button>
                            )
                          )}
                        </div>
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
                <div className="space-y-4">
                  {caseItem.witnessStatements.map((ws) => (
                    <div key={ws.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm">{ws.personName}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ws.role === 'SUSPECT' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {ws.role}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-semibold flex items-center gap-1">
                            {ws.mode === 'AUDIO' && <Volume2 className="h-3 w-3" />}
                            {ws.mode === 'VIDEO' && <Video className="h-3 w-3" />}
                            {ws.mode === 'HANDWRITTEN_MEMO' && <Pen className="h-3 w-3" />}
                            {ws.mode === 'MULTI_MEDIA' && <Paperclip className="h-3 w-3" />}
                            <span>{ws.mode}</span>
                          </span>
                          {ws.attachments && ws.attachments.length > 0 && (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              {ws.attachments.length} Media Attached
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400 font-mono text-[11px]">{ws.dateRecorded}</span>
                      </div>

                      <p className="text-slate-800 leading-relaxed font-serif bg-white p-3 rounded-lg border border-slate-100 text-xs">
                        "{ws.statementText}"
                      </p>

                      {/* Standalone handwritten data URL if present */}
                      {ws.handwrittenDataUrl && (
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                            <Pen className="h-3.5 w-3.5 text-amber-600" />
                            Handwritten Statement / Signature Record
                          </span>
                          <div className="bg-slate-50 p-2 rounded border border-slate-100 flex justify-center">
                            <img
                              src={ws.handwrittenDataUrl}
                              alt="Handwritten Statement"
                              className="max-h-40 rounded cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setSelectedMediaModal({
                                id: 'hw',
                                type: 'HANDWRITTEN',
                                title: `Handwritten Statement - ${ws.personName}`,
                                dataUrl: ws.handwrittenDataUrl!,
                                recordedAt: ws.dateRecorded
                              })}
                            />
                          </div>
                        </div>
                      )}

                      {/* Multiple Recorded Attachments (Audio, Video, Handwritten Memos) */}
                      {ws.attachments && ws.attachments.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                            <Paperclip className="h-3.5 w-3.5 text-blue-600" />
                            Recorded Media Evidence ({ws.attachments.length} Files):
                          </span>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {ws.attachments.map((att) => (
                              <div
                                key={att.id}
                                className="p-3 bg-white rounded-lg border border-slate-200 space-y-2 shadow-xs"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    {att.type === 'AUDIO' && <Volume2 className="h-4 w-4 text-blue-600" />}
                                    {att.type === 'VIDEO' && <Video className="h-4 w-4 text-purple-600" />}
                                    {att.type === 'HANDWRITTEN' && <Pen className="h-4 w-4 text-amber-600" />}
                                    {att.type === 'PHOTO' && <Camera className="h-4 w-4 text-emerald-600" />}
                                    <span className="font-semibold text-slate-800 text-[11px] truncate">
                                      {att.title}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {att.recordedAt}
                                  </span>
                                </div>

                                {att.type === 'AUDIO' && (
                                  <div className="pt-1">
                                    <audio controls src={att.dataUrl} className="w-full h-8" />
                                  </div>
                                )}

                                {att.type === 'VIDEO' && (
                                  <div className="pt-1">
                                    <video controls src={att.dataUrl} className="w-full max-h-48 rounded-lg bg-black object-contain" />
                                  </div>
                                )}

                                {(att.type === 'HANDWRITTEN' || att.type === 'PHOTO') && (
                                  <div className="pt-1 flex flex-col items-center">
                                    <img
                                      src={att.dataUrl}
                                      alt={att.title}
                                      className="max-h-36 rounded border border-slate-100 object-contain cursor-pointer hover:opacity-95"
                                      onClick={() => setSelectedMediaModal(att)}
                                    />
                                    <button
                                      onClick={() => setSelectedMediaModal(att)}
                                      className="mt-1.5 text-[10px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                    >
                                      <Maximize2 className="h-3 w-3" /> Click to Expand Full View
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Legacy recording URL indicator */}
                      {ws.recordingUrl && (!ws.attachments || ws.attachments.length === 0) && (
                        <div className="p-2 rounded bg-blue-50/70 border border-blue-200 text-[11px] text-blue-900 font-mono flex items-center gap-1.5">
                          <Paperclip className="h-3.5 w-3.5 text-blue-600" />
                          <span>Media Record: {ws.recordingUrl}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                        <span>Medium: <strong className="text-slate-700">{ws.mode}</strong></span>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-emerald-600 font-medium">
                            <CheckCircle2 className="h-3 w-3" /> Section 180 BNSS Verified
                          </span>
                          <span>Recorded by: <strong className="text-slate-700">{ws.recordedByOfficer}</strong></span>
                        </div>
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
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0 flex-wrap gap-3">
          <span>Haryana Police CMS • Case ID: <strong className="text-slate-800">{caseItem.id}</strong></span>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Red Button: Submit Complaint / Enquiry Report to SHO */}
            <button
              type="button"
              onClick={() => setIsSubmitEnquiryModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer border-2 border-red-500 hover:shadow-lg"
              title="Submit Investigating Officer's findings, cognizable assessment, and FIR recommendation to SHO"
            >
              <Send className="h-4 w-4" />
              <span>Submit Complaint (जांच आख्या SHO को भेजें)</span>
            </button>

            {/* Forward Final Report button (shown if SHO demanded it) */}
            {caseItem.preliminaryEnquiry?.shoActionRequested === 'SHO_ASKED_FINAL_REPORT' && !caseItem.preliminaryEnquiry?.finalReportSubmittedByIO && (
              <button
                type="button"
                onClick={() => setIsForwardFinalReportModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer border border-emerald-500 animate-pulse"
                title="Compile and forward complete final report docket to SHO"
              >
                <FileCheck2 className="h-3.5 w-3.5" />
                <span>Forward Final Report / Chargesheet (चालान अग्रेषित करें)</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs transition-colors cursor-pointer"
            >
              Close Docket
            </button>
          </div>
        </div>

        {/* Lightbox / Full view modal for recorded statement media */}
        {selectedMediaModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-5 space-y-4 shadow-2xl text-white">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-400" />
                  <div>
                    <h3 className="font-bold text-sm text-white">{selectedMediaModal.title}</h3>
                    <p className="text-[11px] text-slate-400">
                      Type: {selectedMediaModal.type} • Recorded: {selectedMediaModal.recordedAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedMediaModal.dataUrl && (
                    <a
                      href={selectedMediaModal.dataUrl}
                      download={`Statement_${selectedMediaModal.type}_${Date.now()}`}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 text-xs"
                      title="Download Evidence"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    onClick={() => setSelectedMediaModal(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex justify-center items-center bg-black/50 rounded-xl p-3 min-h-[250px] max-h-[70vh] overflow-auto">
                {selectedMediaModal.type === 'AUDIO' && (
                  <div className="w-full max-w-md p-4 space-y-3 text-center">
                    <Volume2 className="h-12 w-12 text-blue-400 mx-auto animate-pulse" />
                    <audio controls autoPlay src={selectedMediaModal.dataUrl} className="w-full" />
                  </div>
                )}

                {selectedMediaModal.type === 'VIDEO' && (
                  <video
                    controls
                    autoPlay
                    src={selectedMediaModal.dataUrl}
                    className="max-h-[60vh] max-w-full rounded-lg"
                  />
                )}

                {(selectedMediaModal.type === 'HANDWRITTEN' || selectedMediaModal.type === 'PHOTO') && (
                  <img
                    src={selectedMediaModal.dataUrl}
                    alt={selectedMediaModal.title}
                    className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-lg bg-white"
                  />
                )}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setSelectedMediaModal(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Submit Enquiry Report Modal */}
        {isSubmitEnquiryModalOpen && (
          <SubmitEnquiryReportModal
            isOpen={isSubmitEnquiryModalOpen}
            onClose={() => setIsSubmitEnquiryModalOpen(false)}
            caseItem={caseItem}
            onSubmitReport={(cId, report) => {
              if (onSubmitEnquiryReport) {
                onSubmitEnquiryReport(cId, report);
              }
              setIsSubmitEnquiryModalOpen(false);
            }}
            currentOfficerName={currentOfficer.name}
            currentOfficerRank={currentOfficer.rank}
            currentOfficerPhone={currentOfficer.phone}
          />
        )}

        {/* Forward Final Report / Chargesheet Modal */}
        {isForwardFinalReportModalOpen && (
          <ForwardFinalReportModal
            isOpen={isForwardFinalReportModalOpen}
            onClose={() => setIsForwardFinalReportModalOpen(false)}
            caseItem={caseItem}
            onForwardFinalReport={(cId, summary, writtenReport) => {
              if (onForwardFinalReport) {
                onForwardFinalReport(cId, summary, writtenReport);
              }
              setIsForwardFinalReportModalOpen(false);
            }}
            currentOfficerName={currentOfficer.name}
            currentOfficerRank={currentOfficer.rank}
          />
        )}

      </div>
    </div>
  );
};
