import React, { useState, useMemo, useEffect } from 'react';
import {
  PoliceCase, UserRole, PoliceOfficer, CaseStage, PriorityLevel,
  CrimeCategory, AttachmentFile, ZimniEntry, WitnessStatement,
  SuspectInfo, ForensicReport, ChargesheetRecord, CourtTrialRecord, FIRDetails
} from './types';
import { INITIAL_CASES, POLICE_STATIONS, DEFAULT_OFFICERS } from './data/initialData';
import { STAGE_CONFIG, PRIORITY_CONFIG, CRIME_CATEGORY_LABELS } from './utils/policeHelpers';
import { Header } from './components/Header';
import { RoleLoginModal } from './components/RoleLoginModal';
import { NewComplaintModal } from './components/NewComplaintModal';
import { CaseDossierModal } from './components/CaseDossierModal';
import { AssignIOModal } from './components/AssignIOModal';
import { ChangeIOModal } from './components/ChangeIOModal';
import { FIRGenerationModal } from './components/FIRGenerationModal';
import { AddZimniModal } from './components/AddZimniModal';
import { AddEvidenceModal } from './components/AddEvidenceModal';
import { AddStatementModal } from './components/AddStatementModal';
import { ForensicReportModal } from './components/ForensicReportModal';
import { CustodyBailModal } from './components/CustodyBailModal';
import { ChargesheetModal } from './components/ChargesheetModal';
import { CourtHearingModal } from './components/CourtHearingModal';

import {
  Shield, Plus, Search, Filter, Eye, UserCheck, RefreshCw,
  BookOpen, FileText, Scale, AlertTriangle, Clock, CheckCircle2,
  Lock, Calendar, MapPin, Phone, Layers, ShieldCheck, ChevronRight
} from 'lucide-react';

export default function App() {
  // Master Case State with LocalStorage Persistence
  const [cases, setCases] = useState<PoliceCase[]>(() => {
    try {
      const saved = localStorage.getItem('haryana_police_cases_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_CASES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('haryana_police_cases_v1', JSON.stringify(cases));
    } catch {
      // fallback
    }
  }, [cases]);

  // Authentication / Role
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  const [currentOfficer, setCurrentOfficer] = useState<PoliceOfficer>(DEFAULT_OFFICERS['ADMIN']);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState('ALL');
  const [selectedStageTab, setSelectedStageTab] = useState<'ALL' | 'COMPLAINTS' | 'ENQUIRY' | 'INVESTIGATION' | 'CUSTODY_ALERTS' | 'CHARGESHEET' | 'TRIAL' | 'DISPOSED'>('ALL');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('ALL');

  // Modals Active State
  const [isNewComplaintOpen, setIsNewComplaintOpen] = useState(false);
  const [dossierCaseId, setDossierCaseId] = useState<string | null>(null);

  // Sub-modals targeting a specific case
  const [targetCaseForAction, setTargetCaseForAction] = useState<PoliceCase | null>(null);
  const [isAssignIOOpen, setIsAssignIOOpen] = useState(false);
  const [isChangeIOOpen, setIsChangeIOOpen] = useState(false);
  const [isGenerateFIROpen, setIsGenerateFIROpen] = useState(false);
  const [isAddZimniOpen, setIsAddZimniOpen] = useState(false);
  const [isEnquiryZimniMode, setIsEnquiryZimniMode] = useState(false);
  const [isAddEvidenceOpen, setIsAddEvidenceOpen] = useState(false);
  const [isAddStatementOpen, setIsAddStatementOpen] = useState(false);
  const [isForensicOpen, setIsForensicOpen] = useState(false);
  const [isCustodyBailOpen, setIsCustodyBailOpen] = useState(false);
  const [isChargesheetOpen, setIsChargesheetOpen] = useState(false);
  const [isCourtHearingOpen, setIsCourtHearingOpen] = useState(false);

  // Switch Role
  const handleSelectRole = (role: UserRole, officer: PoliceOfficer) => {
    setCurrentRole(role);
    setCurrentOfficer(officer);
  };

  // Selected case for Dossier view
  const activeDossierCase = useMemo(() => {
    if (!dossierCaseId) return null;
    return cases.find((c) => c.id === dossierCaseId) || null;
  }, [dossierCaseId, cases]);

  // Filtered Cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // Station filter
      if (selectedStation !== 'ALL' && c.policeStation !== selectedStation) {
        return false;
      }

      // Role isolation: IO only sees assigned cases by default if selected
      if (currentRole === 'IO' && selectedStation === 'MY_CASES' && c.currentIO.name !== currentOfficer.name) {
        return false;
      }

      // Priority filter
      if (selectedPriorityFilter !== 'ALL' && c.priority !== selectedPriorityFilter) {
        return false;
      }

      // Stage category tabs
      if (selectedStageTab === 'COMPLAINTS') {
        if (c.caseStage !== 'COMPLAINT_RECEIVED' && c.caseStage !== 'IO_ASSIGNED') return false;
      } else if (selectedStageTab === 'ENQUIRY') {
        if (c.caseStage !== 'PRELIMINARY_ENQUIRY' && c.caseStage !== 'ENQUIRY_REPORT_SUBMITTED') return false;
      } else if (selectedStageTab === 'INVESTIGATION') {
        if (c.caseStage !== 'FIR_REGISTERED' && c.caseStage !== 'UNDER_INVESTIGATION') return false;
      } else if (selectedStageTab === 'CUSTODY_ALERTS') {
        if (!c.statutoryDeadline) return false;
      } else if (selectedStageTab === 'CHARGESHEET') {
        if (c.caseStage !== 'CHARGESHEET_PREPARED' && c.caseStage !== 'CHARGESHEET_SUBMITTED_TO_COURT') return false;
      } else if (selectedStageTab === 'TRIAL') {
        if (c.caseStage !== 'UNDER_TRIAL') return false;
      } else if (selectedStageTab === 'DISPOSED') {
        if (c.caseStage !== 'DISPOSED' && c.caseStage !== 'CLOSED_AT_ENQUIRY') return false;
      }

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesNumber = c.complaintNumber.toLowerCase().includes(query);
        const matchesFIR = c.firDetails?.firNumber.toLowerCase().includes(query);
        const matchesComplainant = c.complainant.name.toLowerCase().includes(query);
        const matchesMobile = c.complainant.mobile.includes(query);
        const matchesIO = c.currentIO.name.toLowerCase().includes(query);
        const matchesSuspect = c.suspects.some((s) => s.name.toLowerCase().includes(query));
        const matchesNarrative = c.incidentNarrative.toLowerCase().includes(query);
        const matchesStation = c.policeStation.toLowerCase().includes(query);
        const matchesSections = c.firDetails?.applicableSections.some((s) => s.toLowerCase().includes(query));

        return matchesNumber || matchesFIR || matchesComplainant || matchesMobile || matchesIO || matchesSuspect || matchesNarrative || matchesStation || matchesSections;
      }

      return true;
    });
  }, [cases, selectedStation, selectedStageTab, selectedPriorityFilter, searchQuery, currentRole, currentOfficer]);

  // KPI Metrics Calculations
  const metrics = useMemo(() => {
    const total = cases.length;
    const pendingEnquiry = cases.filter((c) => c.caseStage === 'COMPLAINT_RECEIVED' || c.caseStage === 'PRELIMINARY_ENQUIRY').length;
    const activeFIRs = cases.filter((c) => c.caseStage === 'FIR_REGISTERED' || c.caseStage === 'UNDER_INVESTIGATION').length;
    const custodyCritical = cases.filter((c) => c.statutoryDeadline?.alertLevel === 'CRITICAL' || c.statutoryDeadline?.alertLevel === 'WARNING').length;
    const pendingChargesheets = cases.filter((c) => c.caseStage === 'CHARGESHEET_PREPARED').length;
    const underTrial = cases.filter((c) => c.caseStage === 'UNDER_TRIAL').length;
    const disposed = cases.filter((c) => c.caseStage === 'DISPOSED' || c.caseStage === 'CLOSED_AT_ENQUIRY').length;

    return { total, pendingEnquiry, activeFIRs, custodyCritical, pendingChargesheets, underTrial, disposed };
  }, [cases]);

  // Actions Callbacks
  const handleCreateComplaint = (newCase: PoliceCase) => {
    setCases((prev) => [newCase, ...prev]);
    // Auto-open dossier for quick view
    setDossierCaseId(newCase.id);
  };

  const handleAssignIO = (caseId: string, assignedIO: PoliceOfficer, priority: PriorityLevel, crimeNature: CrimeCategory, notes: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            priority,
            crimeNature,
            currentIO: assignedIO,
            caseStage: 'PRELIMINARY_ENQUIRY',
            preliminaryEnquiry: {
              assignedToIO: {
                id: assignedIO.id,
                name: assignedIO.name,
                rank: assignedIO.rank,
                phone: assignedIO.phone,
                assignedDate: new Date().toISOString().split('T')[0]
              },
              enquirySummary: `Preliminary enquiry ordered by SHO. Directions: ${notes}`,
              isCognizable: false,
              genuinenessStatus: 'PENDING',
              recommendation: 'FURTHER_ENQUIRY_NEEDED'
            },
            enquiryTimelineZimni: [
              {
                id: `zimni-${Date.now()}`,
                zimniNumber: 1,
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                officerName: assignedIO.name,
                officerRank: assignedIO.rank,
                officerPhone: assignedIO.phone,
                actionTaken: 'Enquiry Assigned by SHO & Docket Received',
                findings: `Complaint handed over for spot verification, complainant examination, and cognizable offence check. Directives: ${notes}`
              }
            ]
          };
        }
        return c;
      })
    );
  };

  const handleTransferIO = (caseId: string, transferRecord: any, newIO: PoliceOfficer) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            currentIO: newIO,
            ioTransferHistory: [transferRecord, ...c.ioTransferHistory]
          };
        }
        return c;
      })
    );
  };

  const handleConvertFIR = (caseId: string, firDetails: FIRDetails) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            firDetails,
            caseStage: 'FIR_REGISTERED',
            fullInvestigationZimni: [
              {
                id: `zimni-${Date.now()}`,
                zimniNumber: 1,
                date: firDetails.registeredDate,
                time: firDetails.registeredTime,
                officerName: c.currentIO.name,
                officerRank: c.currentIO.rank,
                officerPhone: c.currentIO.phone,
                actionTaken: 'Formal FIR Registered and Investigation Commenced',
                findings: `Pursuant to findings of Preliminary Enquiry, cognizable offence was established. FIR registered under sections ${firDetails.applicableSections.join(', ')}. Full investigation initiated.`
              }
            ]
          };
        }
        return c;
      })
    );
  };

  const handleAddZimni = (caseId: string, entry: ZimniEntry, isEnquiry: boolean) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          if (isEnquiry) {
            return {
              ...c,
              enquiryTimelineZimni: [...c.enquiryTimelineZimni, entry]
            };
          } else {
            return {
              ...c,
              caseStage: 'UNDER_INVESTIGATION',
              fullInvestigationZimni: [...c.fullInvestigationZimni, entry]
            };
          }
        }
        return c;
      })
    );
  };

  const handleAddEvidence = (caseId: string, evidence: AttachmentFile) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            evidenceFiles: [...c.evidenceFiles, evidence]
          };
        }
        return c;
      })
    );
  };

  const handleAddStatement = (caseId: string, statement: WitnessStatement) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            witnessStatements: [...c.witnessStatements, statement]
          };
        }
        return c;
      })
    );
  };

  const handleAddSuspect = (caseId: string, suspect: SuspectInfo) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            suspects: [...c.suspects, suspect]
          };
        }
        return c;
      })
    );
  };

  const handleAddForensic = (caseId: string, report: ForensicReport) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            forensicReports: [...c.forensicReports, report]
          };
        }
        return c;
      })
    );
  };

  const handleUpdateCustody = (caseId: string, updatedSuspects: SuspectInfo[]) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const firstArrested = updatedSuspects.find((s) => s.status === 'ARRESTED' && s.arrestDate);
          let statutoryDeadline = c.statutoryDeadline;

          if (firstArrested && firstArrested.arrestDate) {
            const arrestD = new Date(firstArrested.arrestDate);
            const deadlineD = new Date(arrestD.getTime() + 90 * 86400000);
            const now = new Date();
            const daysRemaining = Math.max(0, Math.ceil((deadlineD.getTime() - now.getTime()) / 86400000));
            const alertLevel = daysRemaining <= 15 ? 'CRITICAL' : daysRemaining <= 30 ? 'WARNING' : 'NORMAL';

            statutoryDeadline = {
              startDate: firstArrested.arrestDate,
              deadlineDate: deadlineD.toISOString().split('T')[0],
              daysRemaining,
              alertLevel,
              statutoryDaysTotal: 90,
              isExpired: daysRemaining === 0
            };
          }

          return {
            ...c,
            suspects: updatedSuspects,
            statutoryDeadline
          };
        }
        return c;
      })
    );
  };

  const handleSaveChargesheet = (caseId: string, chargesheet: ChargesheetRecord) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const newStage: CaseStage =
            chargesheet.spApprovalStatus === 'APPROVED'
              ? 'CHARGESHEET_SUBMITTED_TO_COURT'
              : 'CHARGESHEET_PREPARED';

          return {
            ...c,
            chargesheet,
            caseStage: newStage
          };
        }
        return c;
      })
    );
  };

  const handleUpdateCourtTrial = (caseId: string, courtTrial: CourtTrialRecord) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const newStage: CaseStage =
            courtTrial.currentTrialStage === 'DISPOSED' ? 'DISPOSED' : 'UNDER_TRIAL';

          return {
            ...c,
            courtTrial,
            caseStage: newStage
          };
        }
        return c;
      })
    );
  };

  const handleCloseCaseAtEnquiry = (caseId: string, reason: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            caseStage: 'CLOSED_AT_ENQUIRY',
            preliminaryEnquiry: c.preliminaryEnquiry
              ? {
                  ...c.preliminaryEnquiry,
                  recommendation: 'RECOMMEND_CLOSURE',
                  closureReason: reason,
                  enquirySummary: `${c.preliminaryEnquiry.enquirySummary} • Closed with reason: ${reason}`
                }
              : undefined
          };
        }
        return c;
      })
    );
  };

  // Quick Open Modal Helpers
  const openActionForCase = (c: PoliceCase, action: string) => {
    setTargetCaseForAction(c);
    if (action === 'ASSIGN_IO') setIsAssignIOOpen(true);
    if (action === 'CHANGE_IO') setIsChangeIOOpen(true);
    if (action === 'GENERATE_FIR') setIsGenerateFIROpen(true);
    if (action === 'ADD_ZIMNI_ENQUIRY') {
      setIsEnquiryZimniMode(true);
      setIsAddZimniOpen(true);
    }
    if (action === 'ADD_ZIMNI_INVESTIGATION') {
      setIsEnquiryZimniMode(false);
      setIsAddZimniOpen(true);
    }
    if (action === 'ADD_EVIDENCE') setIsAddEvidenceOpen(true);
    if (action === 'ADD_STATEMENT') setIsAddStatementOpen(true);
    if (action === 'FORENSIC') setIsForensicOpen(true);
    if (action === 'CUSTODY_BAIL') setIsCustodyBailOpen(true);
    if (action === 'CHARGESHEET') setIsChargesheetOpen(true);
    if (action === 'COURT') setIsCourtHearingOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 flex flex-col font-sans selection:bg-amber-200 selection:text-amber-950">
      
      {/* Top Police Header Bar */}
      <Header
        currentRole={currentRole}
        currentOfficer={currentOfficer}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        onOpenNewComplaintModal={() => setIsNewComplaintOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        pendingNotificationsCount={cases.filter((c) => c.caseStage === 'COMPLAINT_RECEIVED').length}
        onOpenNotifications={() => setSelectedStageTab('COMPLAINTS')}
        selectedStationFilter={selectedStation}
        onStationFilterChange={setSelectedStation}
        stationsList={['ALL', ...POLICE_STATIONS.map((s) => s.name)]}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* KPI Analytical Status Bar */}
        <section aria-label="Investigation Status Indicators" className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          
          <button
            onClick={() => setSelectedStageTab('ALL')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              selectedStageTab === 'ALL'
                ? 'bg-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
                : 'bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Dockets</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl sm:text-2xl font-black text-slate-900">{metrics.total}</span>
              <Layers className="h-4 w-4 text-slate-400" />
            </div>
            <span className="text-[10px] text-slate-500">All registered cases</span>
          </button>

          <button
            onClick={() => setSelectedStageTab('COMPLAINTS')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              selectedStageTab === 'COMPLAINTS'
                ? 'bg-blue-50 border-blue-600 shadow-md ring-2 ring-blue-600/10'
                : 'bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">Complaints Intake</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl sm:text-2xl font-black text-blue-900">{metrics.pendingEnquiry}</span>
              <UserCheck className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-[10px] text-blue-700">Awaiting IO / Enquiry</span>
          </button>

          <button
            onClick={() => setSelectedStageTab('INVESTIGATION')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              selectedStageTab === 'INVESTIGATION'
                ? 'bg-emerald-50 border-emerald-600 shadow-md ring-2 ring-emerald-600/10'
                : 'bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Active FIRs</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl sm:text-2xl font-black text-emerald-900">{metrics.activeFIRs}</span>
              <BookOpen className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-[10px] text-emerald-700">Daily Zimni ongoing</span>
          </button>

          <button
            onClick={() => setSelectedStageTab('CUSTODY_ALERTS')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              selectedStageTab === 'CUSTODY_ALERTS'
                ? 'bg-red-50 border-red-600 shadow-md ring-2 ring-red-600/10'
                : 'bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-700">
              <Clock className="h-3 w-3 text-red-600 animate-pulse" />
              <span>60/90d Watch</span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl sm:text-2xl font-black text-red-900">{metrics.custodyCritical}</span>
              <Lock className="h-4 w-4 text-red-600" />
            </div>
            <span className="text-[10px] text-red-700 font-semibold">Statutory default alert</span>
          </button>

          <button
            onClick={() => setSelectedStageTab('CHARGESHEET')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              selectedStageTab === 'CHARGESHEET'
                ? 'bg-purple-50 border-purple-600 shadow-md ring-2 ring-purple-600/10'
                : 'bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">Chargesheets</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl sm:text-2xl font-black text-purple-900">{metrics.pendingChargesheets}</span>
              <Scale className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-[10px] text-purple-700">Pending SP Sanction</span>
          </button>

          <button
            onClick={() => setSelectedStageTab('TRIAL')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              selectedStageTab === 'TRIAL'
                ? 'bg-amber-50 border-amber-600 shadow-md ring-2 ring-amber-600/10'
                : 'bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">Court Trial</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl sm:text-2xl font-black text-amber-900">{metrics.underTrial}</span>
              <Calendar className="h-4 w-4 text-amber-600" />
            </div>
            <span className="text-[10px] text-amber-700">Hearing & Witnesses</span>
          </button>

          <button
            onClick={() => setSelectedStageTab('DISPOSED')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              selectedStageTab === 'DISPOSED'
                ? 'bg-emerald-50 border-emerald-700 shadow-md ring-2 ring-emerald-700/10'
                : 'bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Disposed</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl sm:text-2xl font-black text-emerald-950">{metrics.disposed}</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            </div>
            <span className="text-[10px] text-emerald-800">Decided / Closed</span>
          </button>

        </section>

        {/* Action Header & Workflow Stage Filter Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Controls Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#0c1a30] text-amber-400 flex items-center justify-center font-black shadow-inner">
                HP
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  Crime & Criminal Tracking Network Docket (CCTNS Haryana)
                </h2>
                <p className="text-xs text-slate-500">
                  Showing {filteredCases.length} case files • Role: <strong>{currentRole}</strong> • Station: {selectedStation}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Priority Filter */}
              <select
                value={selectedPriorityFilter}
                onChange={(e) => setSelectedPriorityFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              >
                <option value="ALL">All Priorities</option>
                <option value="HIGH">Heinous / High Priority</option>
                <option value="URGENT">Urgent Investigation</option>
                <option value="NORMAL">Normal Priority</option>
              </select>

              {/* Citizen Complaint Intake Button */}
              <button
                onClick={() => setIsNewComplaintOpen(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> New Complaint Registration
              </button>
            </div>

          </div>

          {/* Workflow Stage Horizontal Nav Bar */}
          <div className="bg-slate-50/80 px-4 sm:px-6 py-2 border-b border-slate-200 flex items-center gap-1 overflow-x-auto text-xs">
            <button
              onClick={() => setSelectedStageTab('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
                selectedStageTab === 'ALL' ? 'bg-[#0c1a30] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Stages ({cases.length})
            </button>
            <button
              onClick={() => setSelectedStageTab('COMPLAINTS')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
                selectedStageTab === 'COMPLAINTS' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              1. New Complaints ({cases.filter((c) => c.caseStage === 'COMPLAINT_RECEIVED' || c.caseStage === 'IO_ASSIGNED').length})
            </button>
            <button
              onClick={() => setSelectedStageTab('ENQUIRY')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
                selectedStageTab === 'ENQUIRY' ? 'bg-amber-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              2. Preliminary Enquiry ({cases.filter((c) => c.caseStage === 'PRELIMINARY_ENQUIRY' || c.caseStage === 'ENQUIRY_REPORT_SUBMITTED').length})
            </button>
            <button
              onClick={() => setSelectedStageTab('INVESTIGATION')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
                selectedStageTab === 'INVESTIGATION' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              3. FIR & Zimni Investigation ({cases.filter((c) => c.caseStage === 'FIR_REGISTERED' || c.caseStage === 'UNDER_INVESTIGATION').length})
            </button>
            <button
              onClick={() => setSelectedStageTab('CUSTODY_ALERTS')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
                selectedStageTab === 'CUSTODY_ALERTS' ? 'bg-red-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              4. 60/90 Days Custody Alert ({cases.filter((c) => c.statutoryDeadline).length})
            </button>
            <button
              onClick={() => setSelectedStageTab('CHARGESHEET')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
                selectedStageTab === 'CHARGESHEET' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              5. Chargesheet / Challan ({cases.filter((c) => c.caseStage === 'CHARGESHEET_PREPARED' || c.caseStage === 'CHARGESHEET_SUBMITTED_TO_COURT').length})
            </button>
            <button
              onClick={() => setSelectedStageTab('TRIAL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
                selectedStageTab === 'TRIAL' ? 'bg-amber-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              6. Court Under Trial ({cases.filter((c) => c.caseStage === 'UNDER_TRIAL').length})
            </button>
            <button
              onClick={() => setSelectedStageTab('DISPOSED')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
                selectedStageTab === 'DISPOSED' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              7. Disposed Cases ({cases.filter((c) => c.caseStage === 'DISPOSED' || c.caseStage === 'CLOSED_AT_ENQUIRY').length})
            </button>
          </div>

          {/* Cases High-Density List */}
          {filteredCases.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No police dockets match active filters</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try clearing search query, resetting station filter, or switching stage tabs.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStation('ALL');
                  setSelectedStageTab('ALL');
                  setSelectedPriorityFilter('ALL');
                }}
                className="px-3.5 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredCases.map((c) => {
                const stage = STAGE_CONFIG[c.caseStage];
                const priority = PRIORITY_CONFIG[c.priority];
                const hasStatutoryAlert = c.statutoryDeadline?.alertLevel === 'CRITICAL';

                return (
                  <div
                    key={c.id}
                    className={`p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      hasStatutoryAlert ? 'bg-red-50/30' : ''
                    }`}
                  >
                    {/* Left details */}
                    <div className="space-y-2 flex-1 min-w-0">
                      
                      {/* Top badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-black text-xs sm:text-sm text-slate-950">
                          {c.firDetails?.firNumber ? (
                            <span className="text-emerald-900 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                              FIR: {c.firDetails.firNumber}
                            </span>
                          ) : (
                            <span className="text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {c.complaintNumber}
                            </span>
                          )}
                        </span>

                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${stage.bgColor} ${stage.color}`}>
                          {stage.label} ({stage.hindiLabel})
                        </span>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${priority.badge}`}>
                          {priority.label}
                        </span>

                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {CRIME_CATEGORY_LABELS[c.crimeNature]}
                        </span>

                        {c.statutoryDeadline && (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 ${
                            c.statutoryDeadline.alertLevel === 'CRITICAL'
                              ? 'bg-red-600 text-white animate-pulse'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            <Clock className="h-3 w-3" />
                            {c.statutoryDeadline.daysRemaining}d to Chargesheet
                          </span>
                        )}
                      </div>

                      {/* Complainant & Incident summary */}
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">
                          {c.complainant.name} (s/o {c.complainant.fatherMotherName}) • 📞 {c.complainant.mobile}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-0.5 leading-relaxed font-serif">
                          "{c.incidentNarrative}"
                        </p>
                      </div>

                      {/* Meta footer row */}
                      <div className="flex items-center gap-4 text-[11px] text-slate-500 flex-wrap pt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {c.policeStation}
                        </span>
                        <span>•</span>
                        <span>Date: {c.incidentDate}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Shield className="h-3 w-3 text-amber-600" />
                          IO: <strong>{c.currentIO.name}</strong> ({c.currentIO.rank})
                        </span>
                        {c.suspects.length > 0 && (
                          <>
                            <span>•</span>
                            <span>
                              Suspects: {c.suspects.map((s) => s.name).join(', ')}
                            </span>
                          </>
                        )}
                        {c.firDetails?.applicableSections && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-slate-700">
                              Sec: {c.firDetails.applicableSections.join(', ')}
                            </span>
                          </>
                        )}
                      </div>

                    </div>

                    {/* Right side actions: User's View (Eye) Icon + Step by Step Actions */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      
                      {/* Explicit User Requirement: "ek view icon ho uspe click krne pe uski complete detail dikhe" */}
                      <button
                        id={`view-dossier-${c.id}`}
                        onClick={() => setDossierCaseId(c.id)}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ring-1 ring-slate-800"
                        title="View Complete Police Docket / Files"
                      >
                        <Eye className="h-4 w-4 text-amber-400" />
                        <span>View Docket</span>
                      </button>

                      {/* Contextual fast actions based on role */}
                      {c.caseStage === 'COMPLAINT_RECEIVED' && (currentRole === 'SHO' || currentRole === 'ADMIN') && (
                        <button
                          onClick={() => openActionForCase(c, 'ASSIGN_IO')}
                          className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <UserCheck className="h-3.5 w-3.5" /> Assign IO
                        </button>
                      )}

                      {c.caseStage === 'PRELIMINARY_ENQUIRY' && (currentRole === 'SHO' || currentRole === 'SP' || currentRole === 'ADMIN') && (
                        <button
                          onClick={() => openActionForCase(c, 'GENERATE_FIR')}
                          className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          Convert to FIR
                        </button>
                      )}

                      {(c.caseStage === 'FIR_REGISTERED' || c.caseStage === 'UNDER_INVESTIGATION') && (
                        <button
                          onClick={() => openActionForCase(c, 'ADD_ZIMNI_INVESTIGATION')}
                          className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <BookOpen className="h-3.5 w-3.5" /> + Zimni
                        </button>
                      )}

                      {c.caseStage === 'CHARGESHEET_PREPARED' && (currentRole === 'SP' || currentRole === 'SHO' || currentRole === 'ADMIN') && (
                        <button
                          onClick={() => openActionForCase(c, 'CHARGESHEET')}
                          className="px-3 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Scale className="h-3.5 w-3.5" /> Review Challan
                        </button>
                      )}

                      {c.caseStage === 'UNDER_TRIAL' && (
                        <button
                          onClick={() => openActionForCase(c, 'COURT')}
                          className="px-3 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Calendar className="h-3.5 w-3.5" /> Hearing
                        </button>
                      )}

                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Informative Officer Guidance Panel */}
        <section aria-label="Haryana Police SOP & Legal Workflow Reference" className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              Haryana Police Case Management System • Operational Guidelines (BNSS / BNS Compliance)
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Government of Haryana • Home Department</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-slate-600">
            <div className="space-y-1">
              <strong className="text-slate-900 block">1. Preliminary Enquiry (PE)</strong>
              <p className="leading-relaxed">
                As per Supreme Court directives, Preliminary Enquiry is mandatory in commercial, matrimonial, and medical negligence matters before lodging FIR. Time limit: 14 days maximum.
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-slate-900 block">2. Case Diary (Parcha Zimni)</strong>
              <p className="leading-relaxed">
                Investigating Officer (IO) must record chronological daily remarks with timestamps, spot visits, recovered physical proofs, and statements u/s 180 BNSS.
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-slate-900 block">3. Statutory 60/90 Days Clock</strong>
              <p className="leading-relaxed">
                Starts immediately on date of arrest. Chargesheet must be submitted to the court within 90 days for heinous crimes (or 60 days) to prevent accused getting default bail u/s 187 BNSS.
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-slate-900 block">4. Senior Supervisory Approval</strong>
              <p className="leading-relaxed">
                SHO inspects the completed Challan for legal soundness. SP / District Head grants final sanction before filing before the designated Chief Judicial Magistrate (CJM).
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#0c1a30] border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-400">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
          <p>Haryana Police Crime & Criminal Tracking Network System (CCTNS) • Government of Haryana</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.confirm('Reset all case records back to default sample dockets?')) {
                  localStorage.removeItem('haryana_police_cases_v1');
                  setCases(INITIAL_CASES);
                }
              }}
              className="text-[11px] text-amber-400/80 hover:text-amber-300 underline cursor-pointer"
            >
              Reset Sample Dockets
            </button>
            <span className="text-slate-600">•</span>
            <span className="text-[11px] text-slate-500">Auto-saved to browser storage</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">Automated Workflow Engine for Investigating Officers (IO), Station House Officers (SHO), and Superintendents of Police (SP)</p>
      </footer>

      {/* MODAL 1: Role Authentication Switcher */}
      <RoleLoginModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        currentRole={currentRole}
        currentOfficer={currentOfficer}
        onSelectRole={handleSelectRole}
      />

      {/* MODAL 2: New Citizen Complaint Intake */}
      <NewComplaintModal
        isOpen={isNewComplaintOpen}
        onClose={() => setIsNewComplaintOpen(false)}
        onSubmit={handleCreateComplaint}
        receivingOfficerName={currentOfficer.name}
        receivingOfficerRank={currentOfficer.rank}
      />

      {/* MODAL 3: Master Case Dossier (View Icon Click) */}
      <CaseDossierModal
        isOpen={!!dossierCaseId}
        onClose={() => setDossierCaseId(null)}
        caseItem={activeDossierCase}
        currentRole={currentRole}
        currentOfficer={currentOfficer}
        onOpenAssignIO={() => {
          setTargetCaseForAction(activeDossierCase);
          setIsAssignIOOpen(true);
        }}
        onOpenChangeIO={() => {
          setTargetCaseForAction(activeDossierCase);
          setIsChangeIOOpen(true);
        }}
        onOpenGenerateFIR={() => {
          setTargetCaseForAction(activeDossierCase);
          setIsGenerateFIROpen(true);
        }}
        onOpenAddZimni={(isEnquiry) => {
          setTargetCaseForAction(activeDossierCase);
          setIsEnquiryZimniMode(isEnquiry);
          setIsAddZimniOpen(true);
        }}
        onOpenAddEvidence={() => {
          setTargetCaseForAction(activeDossierCase);
          setIsAddEvidenceOpen(true);
        }}
        onOpenAddStatement={() => {
          setTargetCaseForAction(activeDossierCase);
          setIsAddStatementOpen(true);
        }}
        onOpenForensic={() => {
          setTargetCaseForAction(activeDossierCase);
          setIsForensicOpen(true);
        }}
        onOpenCustodyBail={() => {
          setTargetCaseForAction(activeDossierCase);
          setIsCustodyBailOpen(true);
        }}
        onOpenChargesheet={() => {
          setTargetCaseForAction(activeDossierCase);
          setIsChargesheetOpen(true);
        }}
        onOpenCourtHearing={() => {
          setTargetCaseForAction(activeDossierCase);
          setIsCourtHearingOpen(true);
        }}
        onCloseCaseAtEnquiry={handleCloseCaseAtEnquiry}
      />

      {/* MODAL 4: Assign IO */}
      <AssignIOModal
        isOpen={isAssignIOOpen}
        onClose={() => setIsAssignIOOpen(false)}
        caseItem={targetCaseForAction}
        onAssign={handleAssignIO}
        currentShoName={currentOfficer.name}
      />

      {/* MODAL 5: Change IO Transfer */}
      <ChangeIOModal
        isOpen={isChangeIOOpen}
        onClose={() => setIsChangeIOOpen(false)}
        caseItem={targetCaseForAction}
        onTransferIO={handleTransferIO}
        approvingAuthorityName={currentOfficer.name}
      />

      {/* MODAL 6: FIR Generation */}
      <FIRGenerationModal
        isOpen={isGenerateFIROpen}
        onClose={() => setIsGenerateFIROpen(false)}
        caseItem={targetCaseForAction}
        onGenerateFIR={handleConvertFIR}
        approvingShoName={currentOfficer.name}
      />

      {/* MODAL 7: Add Zimni (Mini or Parcha) */}
      <AddZimniModal
        isOpen={isAddZimniOpen}
        onClose={() => setIsAddZimniOpen(false)}
        caseItem={targetCaseForAction}
        isEnquiryZimni={isEnquiryZimniMode}
        onAddZimni={handleAddZimni}
        currentOfficerName={currentOfficer.name}
        currentOfficerRank={currentOfficer.rank}
        currentOfficerPhone={currentOfficer.phone}
      />

      {/* MODAL 8: Add Evidence */}
      <AddEvidenceModal
        isOpen={isAddEvidenceOpen}
        onClose={() => setIsAddEvidenceOpen(false)}
        caseItem={targetCaseForAction}
        onAddEvidence={handleAddEvidence}
        currentOfficerName={currentOfficer.name}
      />

      {/* MODAL 9: Add Witness / Suspect Statement */}
      <AddStatementModal
        isOpen={isAddStatementOpen}
        onClose={() => setIsAddStatementOpen(false)}
        caseItem={targetCaseForAction}
        onAddStatement={handleAddStatement}
        onAddSuspect={handleAddSuspect}
        currentOfficerName={currentOfficer.name}
      />

      {/* MODAL 10: Forensic Report */}
      <ForensicReportModal
        isOpen={isForensicOpen}
        onClose={() => setIsForensicOpen(false)}
        caseItem={targetCaseForAction}
        onAddForensic={handleAddForensic}
      />

      {/* MODAL 11: Accused Arrest & Custody */}
      <CustodyBailModal
        isOpen={isCustodyBailOpen}
        onClose={() => setIsCustodyBailOpen(false)}
        caseItem={targetCaseForAction}
        onUpdateSuspectCustody={handleUpdateCustody}
      />

      {/* MODAL 12: Chargesheet Preparation & Senior Review */}
      <ChargesheetModal
        isOpen={isChargesheetOpen}
        onClose={() => setIsChargesheetOpen(false)}
        caseItem={targetCaseForAction}
        currentRole={currentRole}
        currentOfficerName={currentOfficer.name}
        onSaveChargesheet={handleSaveChargesheet}
      />

      {/* MODAL 13: Court Hearing & Disposal */}
      <CourtHearingModal
        isOpen={isCourtHearingOpen}
        onClose={() => setIsCourtHearingOpen(false)}
        caseItem={targetCaseForAction}
        onUpdateCourtTrial={handleUpdateCourtTrial}
      />

    </div>
  );
}
