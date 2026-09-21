import React, { useState, useMemo, useEffect } from 'react';
import {
  PoliceCase, UserRole, PoliceOfficer, CaseStage, PriorityLevel,
  CrimeCategory, AttachmentFile, ZimniEntry, WitnessStatement,
  SuspectInfo, ForensicReport, ChargesheetRecord, CourtTrialRecord, FIRDetails,
  PreliminaryEnquiry, PoliceWrittenFinalReport
} from './types';
import { INITIAL_CASES, POLICE_STATIONS, DEFAULT_OFFICERS, POLICE_OFFICERS } from './data/initialData';
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
  Lock, Calendar, MapPin, Phone, Layers, ShieldCheck, ChevronRight,
  Bell, UserPlus, X, ArrowRight, Check, FileCheck2, Send, Users
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

  // Floating notification alert for newly registered complaints
  const [newComplaintAlert, setNewComplaintAlert] = useState<{
    caseId: string;
    complaintNumber: string;
    station: string;
    complainantName: string;
    caseItem: PoliceCase;
  } | null>(null);

  // IO Assignment Toast notification (alerts SHO when case is dispatched to IO docket)
  const [ioAssignedToast, setIoAssignedToast] = useState<{
    caseId: string;
    complaintNumber: string;
    assignedIO: PoliceOfficer;
    assignedBySHO: string;
    notes: string;
  } | null>(null);

  // IO Acceptance Success Toast notification
  const [acceptedToast, setAcceptedToast] = useState<{
    caseId: string;
    complaintNumber: string;
    ioName: string;
  } | null>(null);

  // SHO Alert when IO submits Enquiry Report with findings & recommendation
  const [shoEnquiryAlert, setShoEnquiryAlert] = useState<{
    caseId: string;
    complaintNumber: string;
    ioName: string;
    isCognizable: boolean;
    recommendation: string;
    ioRemarks: string;
    recommendedSections?: string;
    caseItem: PoliceCase;
  } | null>(null);

  // IO Alert when SHO demands Final Report / Chargesheet
  const [ioFinalReportDemandAlert, setIoFinalReportDemandAlert] = useState<{
    caseId: string;
    complaintNumber: string;
    shoName: string;
    orderNotes: string;
    caseItem: PoliceCase;
  } | null>(null);

  // SHO Alert when IO forwards Final Report / Chargesheet
  const [shoFinalReportReceivedAlert, setShoFinalReportReceivedAlert] = useState<{
    caseId: string;
    complaintNumber: string;
    ioName: string;
    summary: string;
    writtenReport?: PoliceWrittenFinalReport;
    caseItem: PoliceCase;
  } | null>(null);

  // SHO IO Filter (for filtering cases by specific IO in SHO's region)
  const [selectedShoIOFilter, setSelectedShoIOFilter] = useState<string>('ALL');

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
  const [zimniPresetDate, setZimniPresetDate] = useState<string | undefined>(undefined);
  const [editingZimniEntry, setEditingZimniEntry] = useState<ZimniEntry | null>(null);
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
    setSelectedStation('ALL');
    setSelectedShoIOFilter('ALL');
  };

  // IOs belonging to the current SHO's jurisdiction/region
  const regionIOs = useMemo(() => {
    if (currentRole !== 'SHO') return [];
    const allowedDistricts = currentOfficer.jurisdictionDistricts ||
      (currentOfficer.name.includes('Rajesh') ? ['Karnal', 'Panipat'] : ['Faridabad', 'Gurugram']);
    return POLICE_OFFICERS.filter((officer) =>
      officer.role === 'IO' && officer.jurisdictionDistricts?.some((d) => allowedDistricts.includes(d))
    );
  }, [currentRole, currentOfficer]);

  // Selected case for Dossier view
  const activeDossierCase = useMemo(() => {
    if (!dossierCaseId) return null;
    return cases.find((c) => c.id === dossierCaseId) || null;
  }, [dossierCaseId, cases]);

  // Role-isolated Base Cases for KPI and metrics
  const roleFilteredCases = useMemo(() => {
    return cases.filter((c) => {
      if (currentRole === 'IO') {
        return c.currentIO.name === currentOfficer.name ||
               c.currentIO.id === currentOfficer.id ||
               c.preliminaryEnquiry?.assignedToIO?.name === currentOfficer.name ||
               c.preliminaryEnquiry?.assignedToIO?.id === currentOfficer.id;
      }
      if (currentRole === 'SHO') {
        const allowedDistricts = currentOfficer.jurisdictionDistricts ||
          (currentOfficer.name.includes('Rajesh') ? ['Karnal', 'Panipat'] : ['Faridabad', 'Gurugram']);
        return allowedDistricts.includes(c.district);
      }
      return true;
    });
  }, [cases, currentRole, currentOfficer]);

  // Filtered Cases for Main Registry View
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // Role & Officer Strict Isolation:
      if (currentRole === 'IO') {
        const isMyOfficer = c.currentIO.name === currentOfficer.name || 
                            c.currentIO.id === currentOfficer.id ||
                            c.preliminaryEnquiry?.assignedToIO?.name === currentOfficer.name ||
                            c.preliminaryEnquiry?.assignedToIO?.id === currentOfficer.id;
        if (!isMyOfficer) return false;
      } else if (currentRole === 'SHO') {
        const allowedDistricts = currentOfficer.jurisdictionDistricts ||
          (currentOfficer.name.includes('Rajesh') ? ['Karnal', 'Panipat'] : ['Faridabad', 'Gurugram']);
        if (!allowedDistricts.includes(c.district)) {
          return false;
        }

        // Filter by selected IO in SHO's region
        if (selectedShoIOFilter !== 'ALL') {
          if (selectedShoIOFilter === 'UNASSIGNED') {
            const isUnassigned = !c.currentIO?.id || c.currentIO.id === '' || c.currentIO.name === 'Unassigned';
            if (!isUnassigned) return false;
          } else {
            const targetIO = regionIOs.find((io) => io.id === selectedShoIOFilter);
            const targetName = targetIO?.name || selectedShoIOFilter;
            const matchesIO = c.currentIO.id === selectedShoIOFilter ||
                              c.currentIO.name === targetName ||
                              c.preliminaryEnquiry?.assignedToIO?.id === selectedShoIOFilter ||
                              c.preliminaryEnquiry?.assignedToIO?.name === targetName;
            if (!matchesIO) return false;
          }
        }
      }

      // Station filter
      if (selectedStation !== 'ALL' && c.policeStation !== selectedStation) {
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

  // KPI Metrics Calculations based on role-filtered cases
  const metrics = useMemo(() => {
    const total = roleFilteredCases.length;
    const pendingEnquiry = roleFilteredCases.filter((c) => c.caseStage === 'COMPLAINT_RECEIVED' || c.caseStage === 'PRELIMINARY_ENQUIRY').length;
    const activeFIRs = roleFilteredCases.filter((c) => c.caseStage === 'FIR_REGISTERED' || c.caseStage === 'UNDER_INVESTIGATION').length;
    const custodyCritical = roleFilteredCases.filter((c) => c.statutoryDeadline?.alertLevel === 'CRITICAL' || c.statutoryDeadline?.alertLevel === 'WARNING').length;
    const pendingChargesheets = roleFilteredCases.filter((c) => c.caseStage === 'CHARGESHEET_PREPARED').length;
    const underTrial = roleFilteredCases.filter((c) => c.caseStage === 'UNDER_TRIAL').length;
    const disposed = roleFilteredCases.filter((c) => c.caseStage === 'DISPOSED' || c.caseStage === 'CLOSED_AT_ENQUIRY').length;

    return { total, pendingEnquiry, activeFIRs, custodyCritical, pendingChargesheets, underTrial, disposed };
  }, [roleFilteredCases]);

  // Filter complaints specifically pending verification and IO assignment for SHO
  const shoPendingComplaints = useMemo(() => {
    return cases.filter((c) => {
      if (c.caseStage !== 'COMPLAINT_RECEIVED') return false;
      if (currentRole === 'SHO') {
        const allowedDistricts = currentOfficer.jurisdictionDistricts ||
          (currentOfficer.name.includes('Rajesh') ? ['Karnal', 'Panipat'] : ['Faridabad', 'Gurugram']);
        return allowedDistricts.includes(c.district);
      }
      return true;
    });
  }, [cases, currentRole, currentOfficer]);

  // Filter cases assigned to IO awaiting formal acceptance
  const ioPendingAssignedCases = useMemo(() => {
    return cases.filter((c) => {
      if (c.ioAcceptance?.status !== 'PENDING_ACCEPTANCE') return false;
      if (currentRole === 'IO') {
        return c.currentIO.name === currentOfficer.name || c.currentIO.id === currentOfficer.id;
      }
      return true;
    });
  }, [cases, currentRole, currentOfficer]);

  // Accepted cases for current IO in "My Cases"
  const myAcceptedCases = useMemo(() => {
    return cases.filter((c) => {
      return (c.currentIO.name === currentOfficer.name || c.currentIO.id === currentOfficer.id) &&
        c.ioAcceptance?.status !== 'PENDING_ACCEPTANCE';
    });
  }, [cases, currentOfficer]);

  // Filter complaints pending SHO review on Enquiry Report submitted by IO
  const shoPendingEnquiries = useMemo(() => {
    return cases.filter((c) => {
      if (c.preliminaryEnquiry?.shoActionRequested !== 'PENDING_SHO_REVIEW') return false;
      if (currentRole === 'SHO') {
        const allowedDistricts = currentOfficer.jurisdictionDistricts ||
          (currentOfficer.name.includes('Rajesh') ? ['Karnal', 'Panipat'] : ['Faridabad', 'Gurugram']);
        return allowedDistricts.includes(c.district);
      }
      return true;
    });
  }, [cases, currentRole, currentOfficer]);

  // Filter complaints where IO submitted complete final report / chargesheet awaiting SHO review
  const shoPendingFinalReports = useMemo(() => {
    return cases.filter((c) => {
      if (c.preliminaryEnquiry?.shoActionRequested !== 'FINAL_REPORT_SUBMITTED') return false;
      if (currentRole === 'SHO') {
        const allowedDistricts = currentOfficer.jurisdictionDistricts ||
          (currentOfficer.name.includes('Rajesh') ? ['Karnal', 'Panipat'] : ['Faridabad', 'Gurugram']);
        return allowedDistricts.includes(c.district);
      }
      return true;
    });
  }, [cases, currentRole, currentOfficer]);

  // Filter cases where SHO asked IO for Final Report / Chargesheet
  const ioDemandedFinalReports = useMemo(() => {
    return cases.filter((c) => {
      if (c.preliminaryEnquiry?.shoActionRequested !== 'SHO_ASKED_FINAL_REPORT' || c.preliminaryEnquiry?.finalReportSubmittedByIO) return false;
      if (currentRole === 'IO') {
        return c.currentIO.name === currentOfficer.name || c.currentIO.id === currentOfficer.id;
      }
      return true;
    });
  }, [cases, currentRole, currentOfficer]);

  // Notifications count dynamically reflects the current role:
  // - For SHO: new citizen complaints awaiting verification, enquiry reports submitted by IO, and final reports
  // - For IO: new cases assigned by SHO awaiting acceptance, and cases where SHO asked for final report
  const pendingNotificationsCount =
    currentRole === 'SHO'
      ? shoPendingComplaints.length + shoPendingEnquiries.length + shoPendingFinalReports.length
      : currentRole === 'IO'
      ? ioPendingAssignedCases.length + ioDemandedFinalReports.length
      : 0;

  // Actions Callbacks
  const handleCreateComplaint = (newCase: PoliceCase) => {
    setCases((prev) => [newCase, ...prev]);
    // Trigger notification alert specifically for SHO
    setNewComplaintAlert({
      caseId: newCase.id,
      complaintNumber: newCase.complaintNumber,
      station: newCase.policeStation,
      complainantName: newCase.complainant.name,
      caseItem: newCase
    });
  };

  const handleAssignIO = (caseId: string, assignedIO: PoliceOfficer, priority: PriorityLevel, crimeNature: CrimeCategory, notes: string) => {
    if (newComplaintAlert && newComplaintAlert.caseId === caseId) {
      setNewComplaintAlert(null);
    }
    const targetCase = cases.find((c) => c.id === caseId);
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            priority,
            crimeNature,
            currentIO: assignedIO,
            caseStage: 'PRELIMINARY_ENQUIRY',
            ioAcceptance: {
              status: 'PENDING_ACCEPTANCE',
              assignedAt: new Date().toISOString(),
              assignedBySHO: currentOfficer.name,
              shoInstructions: notes
            },
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
                officerName: currentOfficer.name,
                officerRank: currentOfficer.rank,
                officerPhone: currentOfficer.phone,
                actionTaken: 'Enquiry Assigned by SHO (Sent to IO Docket)',
                findings: `Complaint verified by SHO. Assigned to IO ${assignedIO.name} (${assignedIO.rank}) with directives: ${notes}. Awaiting formal acceptance by IO.`
              }
            ]
          };
        }
        return c;
      })
    );

    // Show toast for SHO indicating notification sent to IO
    setIoAssignedToast({
      caseId,
      complaintNumber: targetCase?.complaintNumber || 'Case',
      assignedIO,
      assignedBySHO: currentOfficer.name,
      notes
    });
  };

  const handleAcceptCase = (caseId: string) => {
    const targetCase = cases.find((c) => c.id === caseId);
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const nextZimniNo = (c.enquiryTimelineZimni?.length || 0) + 1;
          return {
            ...c,
            ioAcceptance: {
              status: 'ACCEPTED',
              assignedAt: c.ioAcceptance?.assignedAt || new Date().toISOString(),
              assignedBySHO: c.ioAcceptance?.assignedBySHO || 'SHO',
              acceptedAt: new Date().toISOString(),
              shoInstructions: c.ioAcceptance?.shoInstructions
            },
            enquiryTimelineZimni: [
              ...(c.enquiryTimelineZimni || []),
              {
                id: `zimni-accept-${Date.now()}`,
                zimniNumber: nextZimniNo,
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                officerName: currentOfficer.name,
                officerRank: currentOfficer.rank,
                officerPhone: currentOfficer.phone,
                actionTaken: 'Case Formally Accepted & Charge Assumed by IO',
                findings: `Investigation docket officially accepted by IO ${currentOfficer.name}. Directives noted: "${c.ioAcceptance?.shoInstructions || 'Spot verification & enquiry'}". Commenced preliminary enquiry.`
              }
            ]
          };
        }
        return c;
      })
    );

    // Ensure all stage tabs are active so the user immediately sees the accepted case in their docket!
    if (currentRole === 'IO') {
      setSelectedStageTab('ALL');
    }

    setAcceptedToast({
      caseId,
      complaintNumber: targetCase?.complaintNumber || 'Case',
      ioName: currentOfficer.name
    });
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

    if (shoEnquiryAlert && shoEnquiryAlert.caseId === caseId) {
      setShoEnquiryAlert(null);
    }
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

  const handleUpdateZimni = (caseId: string, updatedEntry: ZimniEntry, isEnquiry: boolean) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const inEnquiry = c.enquiryTimelineZimni.some((z) => z.id === updatedEntry.id);
          const inFull = c.fullInvestigationZimni.some((z) => z.id === updatedEntry.id);

          let newEnquiry = c.enquiryTimelineZimni;
          let newFull = c.fullInvestigationZimni;

          if (inEnquiry) {
            newEnquiry = c.enquiryTimelineZimni.map((z) => (z.id === updatedEntry.id ? updatedEntry : z));
          } else if (inFull) {
            newFull = c.fullInvestigationZimni.map((z) => (z.id === updatedEntry.id ? updatedEntry : z));
          } else if (isEnquiry) {
            newEnquiry = [...newEnquiry, updatedEntry];
          } else {
            newFull = [...newFull, updatedEntry];
          }

          return {
            ...c,
            enquiryTimelineZimni: newEnquiry,
            fullInvestigationZimni: newFull
          };
        }
        return c;
      })
    );
  };

  const handleDeleteZimni = (caseId: string, entryId: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            enquiryTimelineZimni: (c.enquiryTimelineZimni || []).filter((z) => z.id !== entryId),
            fullInvestigationZimni: (c.fullInvestigationZimni || []).filter((z) => z.id !== entryId)
          };
        }
        return c;
      })
    );
    setTargetCaseForAction((prev) => {
      if (!prev || prev.id !== caseId) return prev;
      return {
        ...prev,
        enquiryTimelineZimni: (prev.enquiryTimelineZimni || []).filter((z) => z.id !== entryId),
        fullInvestigationZimni: (prev.fullInvestigationZimni || []).filter((z) => z.id !== entryId)
      };
    });
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

  // Submit Preliminary Enquiry Report with IO's Final Words & Recommendation on FIR
  const handleSubmitEnquiryReport = (caseId: string, enquiryReport: PreliminaryEnquiry) => {
    const targetCase = cases.find((c) => c.id === caseId);
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const submissionZimni: ZimniEntry = {
      id: `zimni-report-${Date.now()}`,
      zimniNumber: (targetCase?.enquiryTimelineZimni?.length || 0) + 1,
      date: currentDate,
      time: currentTime,
      officerName: currentOfficer.name,
      officerRank: currentOfficer.rank,
      officerPhone: currentOfficer.phone,
      actionTaken: 'Preliminary Enquiry Report Submitted to SHO (जांच आख्या प्रेषित)',
      findings: `[FINAL WORDS OF IO / निष्कर्ष]: Cognizable: ${enquiryReport.isCognizable ? 'YES (संज्ञेय)' : 'NO (असंज्ञेय)'} • Genuineness: ${enquiryReport.genuinenessStatus} • FIR Recommendation: ${enquiryReport.recommendation} • Recommended Penal Sections: ${(typeof enquiryReport.ioFinalRemarks === 'object' ? (enquiryReport.ioFinalRemarks as any)?.recommendedSections : enquiryReport.suggestedSections) || 'None'} • IO Finding Narrative: ${(typeof enquiryReport.ioFinalRemarks === 'object' ? (enquiryReport.ioFinalRemarks as any)?.remarksNarrative : enquiryReport.ioFinalRemarks) || enquiryReport.enquirySummary}`
    };

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            caseStage: 'ENQUIRY_REPORT_SUBMITTED',
            preliminaryEnquiry: {
              ...c.preliminaryEnquiry,
              ...enquiryReport,
              shoActionRequested: 'PENDING_SHO_REVIEW',
              ioFinalRemarks: enquiryReport.ioFinalRemarks
            },
            enquiryTimelineZimni: [...(c.enquiryTimelineZimni || []), submissionZimni]
          };
        }
        return c;
      })
    );

    if (targetCase) {
      setShoEnquiryAlert({
        caseId,
        complaintNumber: targetCase.complaintNumber,
        ioName: currentOfficer.name,
        isCognizable: enquiryReport.isCognizable,
        recommendation: enquiryReport.recommendation,
        ioRemarks: (typeof enquiryReport.ioFinalRemarks === 'object' ? (enquiryReport.ioFinalRemarks as any)?.remarksNarrative : enquiryReport.ioFinalRemarks) || enquiryReport.enquirySummary,
        recommendedSections: (typeof enquiryReport.ioFinalRemarks === 'object' ? (enquiryReport.ioFinalRemarks as any)?.recommendedSections : enquiryReport.suggestedSections) || enquiryReport.suggestedSections,
        caseItem: {
          ...targetCase,
          caseStage: 'ENQUIRY_REPORT_SUBMITTED',
          preliminaryEnquiry: {
            ...targetCase.preliminaryEnquiry,
            ...enquiryReport,
            shoActionRequested: 'PENDING_SHO_REVIEW'
          }
        }
      });
    }
  };

  // SHO Action: Demanding Final Report / Chargesheet from IO
  const handleShoDemandFinalReport = (caseId: string, instructions?: string) => {
    const targetCase = cases.find((c) => c.id === caseId);
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const orderNotes = instructions || 'Complete all statements (180 BNSS), forensic reports, and forward final report / chargesheet docket.';

    const demandZimni: ZimniEntry = {
      id: `zimni-demand-${Date.now()}`,
      zimniNumber: (targetCase?.enquiryTimelineZimni?.length || 0) + 1,
      date: currentDate,
      time: currentTime,
      officerName: currentOfficer.name,
      officerRank: currentOfficer.rank,
      officerPhone: currentOfficer.phone,
      actionTaken: 'SHO Directive: Demanded Final Report / Chargesheet (अंतिम रिपोर्ट तलब)',
      findings: `SHO reviewed the preliminary enquiry docket and issued formal directive: Asking for Final report/chargesheet with complete evidence files, witness statements, and suspect details. SHO Instructions: "${orderNotes}"`
    };

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            preliminaryEnquiry: {
              ...c.preliminaryEnquiry!,
              shoActionRequested: 'SHO_ASKED_FINAL_REPORT',
              shoDemandNotes: orderNotes,
              finalReportSubmittedByIO: false
            },
            enquiryTimelineZimni: [...(c.enquiryTimelineZimni || []), demandZimni]
          };
        }
        return c;
      })
    );

    if (shoEnquiryAlert && shoEnquiryAlert.caseId === caseId) {
      setShoEnquiryAlert(null);
    }

    if (targetCase) {
      setIoFinalReportDemandAlert({
        caseId,
        complaintNumber: targetCase.complaintNumber,
        shoName: currentOfficer.name,
        orderNotes,
        caseItem: {
          ...targetCase,
          preliminaryEnquiry: {
            ...targetCase.preliminaryEnquiry!,
            shoActionRequested: 'SHO_ASKED_FINAL_REPORT',
            shoDemandNotes: orderNotes,
            finalReportSubmittedByIO: false
          }
        }
      });
    }
  };

  // IO Action: Forwarding Complete Written Final Report / Chargesheet to SHO
  const handleForwardFinalReport = (caseId: string, summary: string, writtenReport?: PoliceWrittenFinalReport) => {
    const targetCase = cases.find((c) => c.id === caseId);
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const totalStatements = targetCase?.witnessStatements?.length || 0;
    const totalEvidences = targetCase?.evidenceFiles?.length || 0;
    const totalSuspects = targetCase?.suspects?.length || 0;
    const totalForensics = targetCase?.forensicReports?.length || 0;

    const isClosureReport =
      writtenReport?.concludingRecommendation?.includes('दफ्तर दाखिल') ||
      writtenReport?.concludingRecommendation?.includes('दाखिल') ||
      writtenReport?.concludingRecommendation?.toLowerCase().includes('closure') ||
      summary?.includes('दफ्तर दाखिल') ||
      summary?.toLowerCase().includes('closure') ||
      targetCase?.caseStage === 'CLOSED_AT_ENQUIRY' ||
      targetCase?.preliminaryEnquiry?.recommendation === 'RECOMMEND_CLOSURE';

    const nextStage: CaseStage = isClosureReport ? 'CLOSED_AT_ENQUIRY' : 'CHARGESHEET_PREPARED';

    const forwardZimni: ZimniEntry = {
      id: `zimni-forward-${Date.now()}`,
      zimniNumber: (targetCase?.enquiryTimelineZimni?.length || 0) + 1,
      date: currentDate,
      time: currentTime,
      officerName: currentOfficer.name,
      officerRank: currentOfficer.rank,
      officerPhone: currentOfficer.phone,
      actionTaken: isClosureReport
        ? 'Final Enquiry Report (Case Closed / दफ्तर दाखिल) Forwarded to SHO'
        : 'Written Final Report / Chargesheet Forwarded to SHO (अंतिम आख्या SHO को प्रेषित)',
      findings: isClosureReport
        ? `IO compiled and submitted official final enquiry report recommending closure / filing to record (दफ्तर दाखिल / Civil dispute / Compromise). Citizen satisfaction: ${writtenReport?.citizenSatisfaction || 'Recorded'}. Summary: ${summary}. Full investigation inactive as matter is resolved at enquiry stage.`
        : `IO compiled official written final report (अंतिम जांच आख्या) taking automatic reference from attached documents, witness statements, and suspect details. Attached: ${totalStatements} statements, ${totalEvidences} exhibits/CCTV, ${totalSuspects} suspect dossiers, and ${totalForensics} forensic reports. Compilation Summary: ${summary}`
    };

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            caseStage: nextStage,
            preliminaryEnquiry: {
              ...c.preliminaryEnquiry!,
              shoActionRequested: 'FINAL_REPORT_SUBMITTED',
              finalReportSubmittedByIO: true,
              finalReportDocketSummary: summary,
              writtenFinalReport: writtenReport || c.preliminaryEnquiry?.writtenFinalReport,
              closureReason: isClosureReport
                ? (writtenReport?.concludingRecommendation || summary || 'Case closed at preliminary enquiry (दफ्तर दाखिल / समझौता / सिविल प्रकृति)')
                : c.preliminaryEnquiry?.closureReason,
              recommendation: isClosureReport ? 'RECOMMEND_CLOSURE' : (c.preliminaryEnquiry?.recommendation || 'RECOMMEND_FIR')
            },
            enquiryTimelineZimni: [...(c.enquiryTimelineZimni || []), forwardZimni]
          };
        }
        return c;
      })
    );

    if (ioFinalReportDemandAlert && ioFinalReportDemandAlert.caseId === caseId) {
      setIoFinalReportDemandAlert(null);
    }

    if (targetCase) {
      setShoFinalReportReceivedAlert({
        caseId,
        complaintNumber: targetCase.complaintNumber,
        ioName: currentOfficer.name,
        summary,
        writtenReport: writtenReport || targetCase.preliminaryEnquiry?.writtenFinalReport,
        caseItem: {
          ...targetCase,
          caseStage: nextStage,
          preliminaryEnquiry: {
            ...targetCase.preliminaryEnquiry!,
            shoActionRequested: 'FINAL_REPORT_SUBMITTED',
            finalReportSubmittedByIO: true,
            finalReportDocketSummary: summary,
            writtenFinalReport: writtenReport || targetCase.preliminaryEnquiry?.writtenFinalReport,
            closureReason: isClosureReport
              ? (writtenReport?.concludingRecommendation || summary || 'Case closed at preliminary enquiry (दफ्तर दाखिल / समझौता / सिविल प्रकृति)')
              : targetCase.preliminaryEnquiry?.closureReason,
            recommendation: isClosureReport ? 'RECOMMEND_CLOSURE' : (targetCase.preliminaryEnquiry?.recommendation || 'RECOMMEND_FIR')
          }
        }
      });
    }
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
        pendingNotificationsCount={pendingNotificationsCount}
        pendingComplaints={shoPendingComplaints}
        pendingIoAssignedCases={ioPendingAssignedCases}
        pendingEnquiries={shoPendingEnquiries}
        pendingDemandedFinalReports={ioDemandedFinalReports}
        pendingFinalReportsSubmitted={shoPendingFinalReports}
        onOpenCaseDossier={(id) => setDossierCaseId(id)}
        onOpenAssignIO={(c) => openActionForCase(c, 'ASSIGN_IO')}
        onAcceptCase={handleAcceptCase}
        onGenerateFIR={(c) => openActionForCase(c, 'GENERATE_FIR')}
        onDemandFinalReport={handleShoDemandFinalReport}
        selectedStationFilter={selectedStation}
        onStationFilterChange={setSelectedStation}
        regionIOs={regionIOs}
        selectedShoIOFilter={selectedShoIOFilter}
        onShoIOFilterChange={setSelectedShoIOFilter}
        stationsList={[
          'ALL',
          ...(currentRole === 'SHO'
            ? POLICE_STATIONS.filter((s) =>
                (currentOfficer.jurisdictionDistricts ||
                  (currentOfficer.name.includes('Rajesh') ? ['Karnal', 'Panipat'] : ['Faridabad', 'Gurugram'])
                ).includes(s.district)
              ).map((s) => s.name)
            : POLICE_STATIONS.map((s) => s.name))
        ]}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Real-time Notification Banner for Newly Registered Complaints (for SHO) */}
        {newComplaintAlert && (
          <div className="bg-gradient-to-r from-[#0c1a30] via-slate-900 to-[#162744] text-white p-4 rounded-2xl border-2 border-amber-500/70 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top duration-200">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <Bell className="h-5 w-5 animate-bounce" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px] uppercase tracking-wider animate-pulse">
                    {currentRole === 'SHO' ? 'SHO Alert: New Complaint' : 'Complaint Intake Dispatched'}
                  </span>
                  <span className="font-mono font-bold text-amber-300 text-xs">
                    {newComplaintAlert.complaintNumber}
                  </span>
                  <span className="text-slate-400 text-xs">• {newComplaintAlert.station}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 font-medium">
                  {currentRole === 'SHO' ? (
                    <>
                      Citizen complaint from <strong className="text-white">{newComplaintAlert.complainantName}</strong> has been registered. Please verify case facts and assign an Investigating Officer (IO).
                    </>
                  ) : (
                    <>
                      Citizen complaint registered by MHC at Thana counter. Notification has been routed to <strong className="text-amber-300">SHO {newComplaintAlert.station}</strong> for verification & IO assignment.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              {currentRole === 'SHO' ? (
                <>
                  <button
                    onClick={() => {
                      setDossierCaseId(newComplaintAlert.caseId);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer shadow-sm"
                  >
                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                    <span>View Case Detail</span>
                  </button>
                  <button
                    onClick={() => {
                      openActionForCase(newComplaintAlert.caseItem, 'ASSIGN_IO');
                      setNewComplaintAlert(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <UserPlus className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>Verify & Assign IO</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    const shoOfficer = POLICE_OFFICERS.find((o) => o.role === 'SHO' && (o.station === newComplaintAlert.station || o.station.includes('Karnal'))) || DEFAULT_OFFICERS['SHO'];
                    handleSelectRole('SHO', shoOfficer);
                    openActionForCase(newComplaintAlert.caseItem, 'ASSIGN_IO');
                    setNewComplaintAlert(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <span>Switch to SHO View & Assign IO</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => setNewComplaintAlert(null)}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Dismiss Alert"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Real-time Notification Banner for Case Assigned to IO by SHO */}
        {ioAssignedToast && (
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-[#0c1a30] text-white p-4 rounded-2xl border-2 border-emerald-500/70 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top duration-200">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <CheckCircle2 className="h-5 w-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider">
                    Dispatched to IO Docket
                  </span>
                  <span className="font-mono font-bold text-amber-300 text-xs">
                    {ioAssignedToast.complaintNumber}
                  </span>
                  <span className="text-slate-400 text-xs">• IO: {ioAssignedToast.assignedIO.name} ({ioAssignedToast.assignedIO.rank})</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 font-medium">
                  Case verified by SHO <strong className="text-white">{ioAssignedToast.assignedBySHO}</strong> and assigned to <strong className="text-emerald-300">{ioAssignedToast.assignedIO.name}</strong>. Notification dispatched to IO for formal acceptance.
                </p>
                {ioAssignedToast.notes && (
                  <p className="text-[11px] text-amber-200/90 italic">
                    SHO Directives: "{ioAssignedToast.notes}"
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              <button
                onClick={() => {
                  setDossierCaseId(ioAssignedToast.caseId);
                }}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer shadow-sm"
              >
                <Eye className="h-3.5 w-3.5 text-slate-400" />
                <span>View Case Detail</span>
              </button>
              {currentRole !== 'IO' || currentOfficer.name !== ioAssignedToast.assignedIO.name ? (
                <button
                  onClick={() => {
                    handleSelectRole('IO', ioAssignedToast.assignedIO);
                    setIoAssignedToast(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <span>Switch to IO ({ioAssignedToast.assignedIO.name}) & View</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleAcceptCase(ioAssignedToast.caseId);
                    setIoAssignedToast(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Accept Case Now</span>
                </button>
              )}
              <button
                onClick={() => setIoAssignedToast(null)}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Real-time Notification Banner for Case Acceptance */}
        {acceptedToast && (
          <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white p-4 rounded-2xl border-2 border-emerald-400/80 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top duration-200">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/30 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider">
                    Investigation Formally Assumed
                  </span>
                  <span className="font-mono font-bold text-amber-300 text-xs">
                    {acceptedToast.complaintNumber}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-100 font-medium">
                  Case officially accepted by IO <strong className="text-emerald-300">{acceptedToast.ioName}</strong>! Preliminary enquiry initiated and the case is now active under your <strong className="text-white">My Cases</strong> docket.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              <button
                onClick={() => {
                  setDossierCaseId(acceptedToast.caseId);
                  setAcceptedToast(null);
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Open Dossier</span>
              </button>
              <button
                onClick={() => setAcceptedToast(null)}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Real-time Notification Banner for IO Enquiry Report Submission (Alert to SHO) */}
        {shoEnquiryAlert && (
          <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 text-white p-4 rounded-2xl border-2 border-red-500/80 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top duration-200">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-500/20 border border-red-400/50 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                <Send className="h-5 w-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px] uppercase tracking-wider animate-pulse">
                    जांच अधिकारी (IO) आख्या संज्ञान • SHO Action Required
                  </span>
                  <span className="font-mono font-bold text-amber-300 text-xs">
                    {shoEnquiryAlert.complaintNumber}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${shoEnquiryAlert.isCognizable ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-200'}`}>
                    {shoEnquiryAlert.isCognizable ? '⚖️ Cognizable Offence' : 'Non-Cognizable / Civil'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-100 font-medium">
                  IO <strong className="text-amber-300">{shoEnquiryAlert.ioName}</strong> has submitted the Preliminary Enquiry report with recommendation: <strong className="text-emerald-400">{shoEnquiryAlert.recommendation}</strong>.
                </p>
                <p className="text-xs text-slate-300 bg-black/40 p-2 rounded-lg border border-red-500/30 line-clamp-2">
                  <strong className="text-amber-400">Final Words of IO:</strong> "{shoEnquiryAlert.ioRemarks}"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0 flex-wrap">
              <button
                onClick={() => {
                  setDossierCaseId(shoEnquiryAlert.caseId);
                  setShoEnquiryAlert(null);
                }}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer shadow-sm"
              >
                <Eye className="h-3.5 w-3.5 text-slate-400" />
                <span>View Full Docket</span>
              </button>
              <button
                onClick={() => {
                  const targetCase = cases.find(c => c.id === shoEnquiryAlert.caseId);
                  if (targetCase) {
                    setTargetCaseForAction(targetCase);
                    setIsGenerateFIROpen(true);
                  }
                  setShoEnquiryAlert(null);
                }}
                className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <FileCheck2 className="h-3.5 w-3.5" />
                <span>1. Generate FIR</span>
              </button>
              <button
                onClick={() => {
                  handleShoDemandFinalReport(shoEnquiryAlert.caseId, 'SHO Orders: Complete all witness statements, forensic reports, and suspect custody. Forward complete final report / chargesheet docket.');
                  setShoEnquiryAlert(null);
                }}
                className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>2. Ask for Final Report</span>
              </button>
              <button
                onClick={() => setShoEnquiryAlert(null)}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Real-time Notification Banner for IO: SHO Demanding Final Report / Chargesheet */}
        {ioFinalReportDemandAlert && (
          <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 text-white p-4 rounded-2xl border-2 border-amber-500/80 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top duration-200">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <AlertTriangle className="h-5 w-5 animate-bounce" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-amber-600 text-white font-bold text-[10px] uppercase tracking-wider animate-pulse">
                    थाना प्रभारी (SHO) संज्ञान: अंतिम रिपोर्ट / चालान तलब किया गया
                  </span>
                  <span className="font-mono font-bold text-amber-300 text-xs">
                    {ioFinalReportDemandAlert.complaintNumber}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-100 font-medium">
                  SHO <strong className="text-amber-300">{ioFinalReportDemandAlert.shoName}</strong> is asking for the Final Report / Chargesheet for this complaint.
                </p>
                <p className="text-xs text-amber-200 bg-black/40 p-2 rounded-lg border border-amber-500/30">
                  <strong className="text-white">Directive:</strong> "{ioFinalReportDemandAlert.orderNotes}"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0 flex-wrap">
              <button
                onClick={() => {
                  setDossierCaseId(ioFinalReportDemandAlert.caseId);
                  setIoFinalReportDemandAlert(null);
                }}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer shadow-sm"
              >
                <Eye className="h-3.5 w-3.5 text-slate-400" />
                <span>Open Docket</span>
              </button>
              <button
                onClick={() => {
                  setDossierCaseId(ioFinalReportDemandAlert.caseId);
                  setIoFinalReportDemandAlert(null);
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer animate-pulse"
              >
                <FileCheck2 className="h-3.5 w-3.5" />
                <span>Forward Final Report / Chargesheet</span>
              </button>
              <button
                onClick={() => setIoFinalReportDemandAlert(null)}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Real-time Notification Banner for SHO: IO Forwarded Complete Final Report */}
        {shoFinalReportReceivedAlert && (
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-blue-950 text-white p-4 rounded-2xl border-2 border-emerald-500/80 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top duration-200">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <FileCheck2 className="h-5 w-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 ${
                    shoFinalReportReceivedAlert.caseItem.caseStage === 'CLOSED_AT_ENQUIRY'
                      ? 'bg-slate-700 border border-emerald-400'
                      : 'bg-emerald-600'
                  }`}>
                    <FileCheck2 className="h-3 w-3" />
                    {shoFinalReportReceivedAlert.caseItem.caseStage === 'CLOSED_AT_ENQUIRY'
                      ? 'अंतिम रिपोर्ट प्रेषित • दफ्तर दाखिल (Case Closed at Enquiry)'
                      : 'अंतिम रिपोर्ट प्रेषित (Final Report Submitted by IO)'}
                  </span>
                  <span className="font-mono font-bold text-amber-300 text-xs">
                    {shoFinalReportReceivedAlert.complaintNumber}
                  </span>
                  {shoFinalReportReceivedAlert.caseItem.caseStage === 'CLOSED_AT_ENQUIRY' && (
                    <span className="px-2 py-0.5 rounded bg-emerald-900/90 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                      पूर्ण विवेचना निष्क्रीय (Full Investigation Inactive)
                    </span>
                  )}
                  {shoFinalReportReceivedAlert.writtenReport && (
                    <span className="px-2 py-0.5 rounded bg-emerald-800/80 border border-emerald-400/40 text-emerald-200 text-[10px] font-bold">
                      लिखित प्रपत्र संलग्न (Official Police Format Ready)
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-100 font-medium">
                  IO <strong className="text-emerald-300">{shoFinalReportReceivedAlert.ioName}</strong> has compiled and forwarded the complete official written final report {shoFinalReportReceivedAlert.caseItem.caseStage === 'CLOSED_AT_ENQUIRY' ? '(recommending Case Closure / दफ्तर दाखिल after enquiry)' : 'taking automatic reference from attached documents, statements, and suspect details'}.
                </p>
                <p className="text-xs text-slate-300 bg-black/40 p-2 rounded-lg border border-emerald-500/30 line-clamp-2">
                  <strong className="text-emerald-400">Compilation Summary:</strong> "{shoFinalReportReceivedAlert.summary}"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0 flex-wrap">
              <button
                onClick={() => {
                  setDossierCaseId(shoFinalReportReceivedAlert.caseId);
                  setShoFinalReportReceivedAlert(null);
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>View Written Final Report (अंतिम आख्या देखें)</span>
              </button>
              <button
                onClick={() => setShoFinalReportReceivedAlert(null)}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* SHO Dedicated Notification Queue Section */}
        {currentRole === 'SHO' && shoPendingComplaints.length > 0 && (
          <section className="bg-gradient-to-br from-[#0c1a30] via-slate-900 to-[#14233c] border-2 border-amber-500/60 rounded-2xl p-4 sm:p-5 text-white shadow-xl space-y-3.5 relative overflow-hidden backdrop-blur">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-400/40 uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="h-3.5 w-3.5" />
                  थाना प्रभारी (SHO) संज्ञान आवश्यक
                </span>
                <span className="text-xs text-amber-200/90 font-semibold">
                  {shoPendingComplaints.length} Fresh Citizen Complaint(s) Awaiting Verification & IO Assignment
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Jurisdiction: {currentOfficer.jurisdictionLabel || currentOfficer.station}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              New citizen complaints registered at the reception desk. As SHO, please verify the complainant details, inspect attached exhibits, and assign an Investigating Officer (IO) for spot enquiry.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
              {shoPendingComplaints.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-950/70 border border-slate-700/80 hover:border-amber-500/60 rounded-xl p-3.5 flex flex-col justify-between gap-3 shadow-md transition-colors"
                >
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-400 text-xs">{c.complaintNumber}</span>
                      <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-bold border border-red-500/30">
                        {c.priority} Priority
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-100 text-xs block">
                        {c.complainant.name} {c.complainant.fatherMotherName ? `s/o ${c.complainant.fatherMotherName}` : ''}
                      </span>
                      <span className="text-slate-400 text-[11px] font-mono">{c.complainant.mobile}</span>
                    </div>

                    <p className="text-slate-300 text-[11px] line-clamp-2 leading-relaxed bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      {c.incidentNarrative}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>{c.incidentDate} at {c.incidentTime}</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-medium">
                        {c.initialAttachments?.length || 0} Exhibit(s)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => setDossierCaseId(c.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 text-slate-400" />
                      <span>View Case Detail</span>
                    </button>
                    <button
                      onClick={() => openActionForCase(c, 'ASSIGN_IO')}
                      className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Verify & Assign IO</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SHO Dedicated Notification Queue for IO Enquiry Reports Awaiting Order (Generate FIR or Demand Final Report) */}
        {currentRole === 'SHO' && shoPendingEnquiries.length > 0 && (
          <section className="bg-gradient-to-br from-[#260a0a] via-slate-900 to-[#1c0808] border-2 border-red-500/80 rounded-2xl p-4 sm:p-5 text-white shadow-xl space-y-3.5 relative overflow-hidden backdrop-blur">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-900/50 pb-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="px-2.5 py-0.5 rounded bg-red-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Send className="h-3.5 w-3.5" />
                  थाना प्रभारी (SHO) संज्ञान: जांच आख्या प्राप्त
                </span>
                <span className="text-xs text-red-200 font-semibold">
                  {shoPendingEnquiries.length} Preliminary Enquiry Report(s) Submitted by IO Awaiting SHO Decision
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Jurisdiction: {currentOfficer.jurisdictionLabel || currentOfficer.station}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Investigating Officers have concluded field enquiry and recorded their final words regarding cognizable offence status and FIR generation. As SHO, please review IO conclusions and take immediate decision to either <strong>Generate FIR (प्राथमिकी दर्ज करें)</strong> or <strong>Ask for Final Report / Chargesheet (अंतिम रिपोर्ट तलब करें)</strong>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
              {shoPendingEnquiries.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-950/85 border border-red-500/50 hover:border-red-400 rounded-xl p-3.5 flex flex-col justify-between gap-3 shadow-md transition-colors"
                >
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-400 text-xs">{c.complaintNumber}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.preliminaryEnquiry?.isCognizable
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {c.preliminaryEnquiry?.isCognizable ? '⚖️ Cognizable' : 'Non-Cognizable'}
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-100 text-xs block">
                        Complainant: {c.complainant.name}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        Assigned IO: <strong className="text-amber-300">{c.currentIO.name}</strong> ({c.currentIO.rank})
                      </span>
                    </div>

                    {/* IO Final Words Box */}
                    <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-red-300">IO Recommendation:</span>
                        <span className="font-bold text-white uppercase text-[10px] px-2 py-0.5 rounded bg-red-900/80">
                          {c.preliminaryEnquiry?.recommendation}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-200 leading-relaxed italic">
                        "{typeof c.preliminaryEnquiry?.ioFinalRemarks === 'string' ? c.preliminaryEnquiry.ioFinalRemarks : (c.preliminaryEnquiry?.ioFinalRemarks as any)?.remarksNarrative || c.preliminaryEnquiry?.enquirySummary}"
                      </p>
                      {(typeof c.preliminaryEnquiry?.ioFinalRemarks === 'string' ? c.preliminaryEnquiry.suggestedSections : (c.preliminaryEnquiry?.ioFinalRemarks as any)?.recommendedSections || c.preliminaryEnquiry?.suggestedSections) && (
                        <p className="text-[10px] text-amber-300 font-mono">
                          Suggested Sections: {typeof c.preliminaryEnquiry?.ioFinalRemarks === 'string' ? c.preliminaryEnquiry.suggestedSections : (c.preliminaryEnquiry?.ioFinalRemarks as any)?.recommendedSections || c.preliminaryEnquiry?.suggestedSections}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openActionForCase(c, 'GENERATE_FIR')}
                        className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
                      >
                        <FileCheck2 className="h-3.5 w-3.5" />
                        <span>1. Generate FIR</span>
                      </button>
                      <button
                        onClick={() => handleShoDemandFinalReport(c.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>2. Ask Final Report</span>
                      </button>
                    </div>
                    <button
                      onClick={() => setDossierCaseId(c.id)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 text-slate-400" />
                      <span>View Enquiry Docket</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SHO Dedicated Notification Queue Section for Pending Final Reports Forwarded by IO */}
        {currentRole === 'SHO' && shoPendingFinalReports.length > 0 && (
          <section className="bg-gradient-to-br from-[#0c2419] via-slate-900 to-[#081a13] border-2 border-emerald-500/80 rounded-2xl p-4 sm:p-5 text-white shadow-xl space-y-3.5 relative overflow-hidden backdrop-blur">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-900/50 pb-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="px-2.5 py-0.5 rounded bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck2 className="h-3.5 w-3.5" />
                  थाना प्रभारी (SHO) संज्ञान: अंतिम जांच आख्या / फाइनल रिपोर्ट प्राप्त
                </span>
                <span className="text-xs text-emerald-200 font-semibold">
                  {shoPendingFinalReports.length} Final Report(s) Submitted by IO Awaiting SHO Endorsement
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Jurisdiction: {currentOfficer.jurisdictionLabel || currentOfficer.station}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Investigating Officers have compiled the official written final reports taking automatic reference from all attached case documents, witness statements, and suspect depositions. As SHO, please review the final findings and issue orders (दफ्तर दाखिल / Closure or अभियोग पंजीकृत / Forward to Court).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
              {shoPendingFinalReports.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-950/85 border border-emerald-500/50 hover:border-emerald-400 rounded-xl p-3.5 flex flex-col justify-between gap-3 shadow-md transition-colors"
                >
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-400 text-xs">{c.complaintNumber}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <FileCheck2 className="h-3 w-3" /> Report Ready
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-100 text-xs block">
                        Complainant: {c.complainant.name}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        Assigned IO: <strong className="text-emerald-300">{c.currentIO.name}</strong> ({c.currentIO.rank})
                      </span>
                    </div>

                    {/* Report Summary & Attached Reference Box */}
                    <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-emerald-300">Citizen Satisfaction:</span>
                        <span className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                          c.preliminaryEnquiry?.writtenFinalReport?.citizenSatisfaction === 'YES'
                            ? 'bg-emerald-800/80 text-emerald-100'
                            : 'bg-amber-900/80 text-amber-200'
                        }`}>
                          {c.preliminaryEnquiry?.writtenFinalReport?.citizenSatisfaction === 'YES' ? 'संतुष्ट (Yes)' : 'दफ्तर दाखिल / Settlement'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-200 leading-relaxed italic line-clamp-3">
                        "{typeof c.preliminaryEnquiry?.finalReportDocketSummary === 'string' ? c.preliminaryEnquiry.finalReportDocketSummary : c.preliminaryEnquiry?.writtenFinalReport?.ioFindingsAndAnalysis || 'Official police written report submitted.'}"
                      </p>
                      {c.preliminaryEnquiry?.writtenFinalReport?.attachedDocumentsReference && (
                        <p className="text-[10px] text-emerald-300 font-sans border-t border-emerald-800/40 pt-1 line-clamp-1">
                          📎 साक्ष्य संदर्भ: {c.preliminaryEnquiry.writtenFinalReport.attachedDocumentsReference}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => setDossierCaseId(c.id)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View Written Final Report (अंतिम आख्या देखें)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {currentRole === 'IO' && ioPendingAssignedCases.length > 0 && (
          <section className="bg-gradient-to-br from-[#0c2419] via-slate-900 to-[#102a24] border-2 border-emerald-500/70 rounded-2xl p-4 sm:p-5 text-white shadow-xl space-y-3.5 relative overflow-hidden backdrop-blur">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-400/40 uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="h-3.5 w-3.5" />
                  जाँच अधिकारी (IO) संज्ञान: नया केस आवंटन
                </span>
                <span className="text-xs text-emerald-200/90 font-semibold">
                  {ioPendingAssignedCases.length} New Case(s) Assigned to You by SHO Awaiting Acceptance
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Officer: {currentOfficer.name} ({currentOfficer.rank})
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              The Station House Officer (SHO) has verified these complaints and assigned you as the Investigating Officer (IO). Please review SHO instructions, inspect citizen complaints, and formally accept the docket to begin the investigation.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
              {ioPendingAssignedCases.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-950/80 border border-emerald-500/40 hover:border-emerald-400 rounded-xl p-3.5 flex flex-col justify-between gap-3 shadow-md transition-colors"
                >
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-400 text-xs">{c.complaintNumber}</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        New Assigned
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-100 text-xs block">
                        {c.complainant.name} {c.complainant.fatherMotherName ? `s/o ${c.complainant.fatherMotherName}` : ''}
                      </span>
                      <span className="text-slate-400 text-[11px] font-mono">{c.complainant.mobile}</span>
                    </div>

                    <p className="text-slate-300 text-[11px] line-clamp-2 leading-relaxed bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      {c.incidentNarrative}
                    </p>

                    {c.ioAcceptance?.shoInstructions && (
                      <div className="p-2 rounded bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-200">
                        <strong className="text-amber-300">SHO Directives:</strong> "{c.ioAcceptance.shoInstructions}"
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>Assigned by SHO: {c.ioAcceptance?.assignedBySHO || 'SHO'}</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 font-medium">
                        {c.priority} Priority
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => setDossierCaseId(c.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 text-slate-400" />
                      <span>View Case Detail</span>
                    </button>
                    <button
                      onClick={() => handleAcceptCase(c.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Accept Case</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* IO Section: Cases where SHO Demanded Final Report / Chargesheet */}
        {currentRole === 'IO' && ioDemandedFinalReports.length > 0 && (
          <section className="bg-gradient-to-br from-[#281804] via-slate-900 to-[#1e1302] border-2 border-amber-500/80 rounded-2xl p-4 sm:p-5 text-white shadow-xl space-y-3.5 relative overflow-hidden backdrop-blur">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-900/40 pb-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
                <span className="px-2.5 py-0.5 rounded bg-amber-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  थाना प्रभारी (SHO) निर्देश: अंतिम रिपोर्ट / चालान तलब
                </span>
                <span className="text-xs text-amber-200 font-semibold">
                  {ioDemandedFinalReports.length} Case(s) - SHO has Demanded Final Report / Chargesheet Docket
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Officer: {currentOfficer.name} ({currentOfficer.rank})
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              The SHO has formally ordered the submission of the Final Report / Chargesheet for the following cases. Please review statements u/s 180 BNSS, forensic proofs, and suspect dossiers, then click <strong>Forward Final Report</strong> to submit the complete dossier to the SHO.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
              {ioDemandedFinalReports.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-950/85 border border-amber-500/50 hover:border-amber-400 rounded-xl p-3.5 flex flex-col justify-between gap-3 shadow-md transition-colors"
                >
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-400 text-xs">{c.complaintNumber}</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                        Final Report Demanded
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-100 text-xs block">
                        Complainant: {c.complainant.name}
                      </span>
                      <p className="text-slate-400 text-[11px] line-clamp-1">{c.incidentNarrative}</p>
                    </div>

                    {c.preliminaryEnquiry?.shoDemandNotes && (
                      <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-200 space-y-1">
                        <strong className="text-amber-300 block">SHO Directive:</strong>
                        <p className="italic">"{c.preliminaryEnquiry.shoDemandNotes}"</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>Statements: {c.witnessStatements?.length || 0}</span>
                      <span>Exhibits: {c.evidenceFiles?.length || 0}</span>
                      <span>Suspects: {c.suspects?.length || 0}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => setDossierCaseId(c.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 text-slate-400" />
                      <span>Open Docket</span>
                    </button>
                    <button
                      onClick={() => setDossierCaseId(c.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer animate-pulse"
                    >
                      <FileCheck2 className="h-3.5 w-3.5" />
                      <span>Forward Report</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

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

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* IO Specific Role Docket Badge (No toggle, strict assigned isolation) */}
              {currentRole === 'IO' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold shadow-2xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>My Assigned Docket ({filteredCases.length})</span>
                </div>
              )}

              {/* SHO Region IO Selector Dropdown */}
              {currentRole === 'SHO' && regionIOs.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <label htmlFor="docket-sho-io-filter" className="text-xs font-semibold text-slate-700 hidden sm:flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-amber-600" />
                    <span>Investigating Officer:</span>
                  </label>
                  <select
                    id="docket-sho-io-filter"
                    value={selectedShoIOFilter}
                    onChange={(e) => setSelectedShoIOFilter(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-semibold text-slate-800 focus:ring-1 focus:ring-amber-500 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All IOs in Region ({regionIOs.length} Officers)</option>
                    {regionIOs.map((io) => (
                      <option key={io.id} value={io.id}>
                        {io.rank} {io.name} • {io.station.split('(')[0].trim()}
                      </option>
                    ))}
                    <option value="UNASSIGNED">Unassigned Complaints</option>
                  </select>
                </div>
              )}

              {/* Priority Filter */}
              <select
                value={selectedPriorityFilter}
                onChange={(e) => setSelectedPriorityFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:ring-1 focus:ring-amber-500 focus:outline-none cursor-pointer"
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

                        {c.ioAcceptance?.status === 'PENDING_ACCEPTANCE' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <Clock className="h-3 w-3 text-amber-700 animate-pulse" />
                            Pending IO Acceptance
                          </span>
                        )}

                        {c.ioAcceptance?.status === 'ACCEPTED' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                            IO Accepted
                          </span>
                        )}

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
                      {c.ioAcceptance?.status === 'PENDING_ACCEPTANCE' && (currentRole === 'IO' || currentRole === 'ADMIN') && (
                        <button
                          onClick={() => handleAcceptCase(c.id)}
                          className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1 cursor-pointer animate-pulse"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Accept Case
                        </button>
                      )}

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
      {isRoleModalOpen && (
        <RoleLoginModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          currentRole={currentRole}
          currentOfficer={currentOfficer}
          onSelectRole={handleSelectRole}
        />
      )}

      {/* MODAL 2: New Citizen Complaint Intake */}
      {isNewComplaintOpen && (
        <NewComplaintModal
          isOpen={isNewComplaintOpen}
          onClose={() => setIsNewComplaintOpen(false)}
          onSubmit={handleCreateComplaint}
          receivingOfficerName={currentOfficer.name}
          receivingOfficerRank={currentOfficer.rank}
        />
      )}

      {/* MODAL 3: Master Case Dossier (View Icon Click) */}
      {!!dossierCaseId && activeDossierCase && (
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
          onOpenAddZimni={(isEnquiry, presetDate, editingEntry) => {
            setTargetCaseForAction(activeDossierCase);
            setIsEnquiryZimniMode(isEnquiry);
            setZimniPresetDate(presetDate);
            setEditingZimniEntry(editingEntry || null);
            setIsAddZimniOpen(true);
          }}
          onDeleteZimni={handleDeleteZimni}
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
          onAcceptCase={handleAcceptCase}
          onSubmitEnquiryReport={handleSubmitEnquiryReport}
          onShoDemandFinalReport={handleShoDemandFinalReport}
          onForwardFinalReport={handleForwardFinalReport}
        />
      )}

      {/* MODAL 4: Assign IO */}
      {isAssignIOOpen && targetCaseForAction && (
        <AssignIOModal
          isOpen={isAssignIOOpen}
          onClose={() => setIsAssignIOOpen(false)}
          caseItem={targetCaseForAction}
          onAssign={handleAssignIO}
          currentShoName={currentOfficer.name}
        />
      )}

      {/* MODAL 5: Change IO Transfer */}
      {isChangeIOOpen && targetCaseForAction && (
        <ChangeIOModal
          isOpen={isChangeIOOpen}
          onClose={() => setIsChangeIOOpen(false)}
          caseItem={targetCaseForAction}
          onTransferIO={handleTransferIO}
          approvingAuthorityName={currentOfficer.name}
        />
      )}

      {/* MODAL 6: FIR Generation */}
      {isGenerateFIROpen && targetCaseForAction && (
        <FIRGenerationModal
          isOpen={isGenerateFIROpen}
          onClose={() => setIsGenerateFIROpen(false)}
          caseItem={targetCaseForAction}
          onGenerateFIR={handleConvertFIR}
          approvingShoName={currentOfficer.name}
        />
      )}

      {/* MODAL 7: Add Zimni (Mini or Parcha) */}
      {isAddZimniOpen && targetCaseForAction && (
        <AddZimniModal
          isOpen={isAddZimniOpen}
          onClose={() => {
            setIsAddZimniOpen(false);
            setEditingZimniEntry(null);
            setZimniPresetDate(undefined);
          }}
          caseItem={targetCaseForAction}
          isEnquiryZimni={isEnquiryZimniMode}
          onAddZimni={handleAddZimni}
          onUpdateZimni={handleUpdateZimni}
          currentOfficerName={currentOfficer.name}
          currentOfficerRank={currentOfficer.rank}
          currentOfficerPhone={currentOfficer.phone}
          presetDate={zimniPresetDate}
          editingEntry={editingZimniEntry}
        />
      )}

      {/* MODAL 8: Add Evidence */}
      {isAddEvidenceOpen && targetCaseForAction && (
        <AddEvidenceModal
          isOpen={isAddEvidenceOpen}
          onClose={() => setIsAddEvidenceOpen(false)}
          caseItem={targetCaseForAction}
          onAddEvidence={handleAddEvidence}
          currentOfficerName={currentOfficer.name}
        />
      )}

      {/* MODAL 9: Add Witness / Suspect Statement */}
      {isAddStatementOpen && targetCaseForAction && (
        <AddStatementModal
          isOpen={isAddStatementOpen}
          onClose={() => setIsAddStatementOpen(false)}
          caseItem={targetCaseForAction}
          onAddStatement={handleAddStatement}
          onAddSuspect={handleAddSuspect}
          currentOfficerName={currentOfficer.name}
        />
      )}

      {/* MODAL 10: Forensic Report */}
      {isForensicOpen && targetCaseForAction && (
        <ForensicReportModal
          isOpen={isForensicOpen}
          onClose={() => setIsForensicOpen(false)}
          caseItem={targetCaseForAction}
          onAddForensic={handleAddForensic}
        />
      )}

      {/* MODAL 11: Accused Arrest & Custody */}
      {isCustodyBailOpen && targetCaseForAction && (
        <CustodyBailModal
          isOpen={isCustodyBailOpen}
          onClose={() => setIsCustodyBailOpen(false)}
          caseItem={targetCaseForAction}
          onUpdateSuspectCustody={handleUpdateCustody}
        />
      )}

      {/* MODAL 12: Chargesheet Preparation & Senior Review */}
      {isChargesheetOpen && targetCaseForAction && (
        <ChargesheetModal
          isOpen={isChargesheetOpen}
          onClose={() => setIsChargesheetOpen(false)}
          caseItem={targetCaseForAction}
          currentRole={currentRole}
          currentOfficerName={currentOfficer.name}
          onSaveChargesheet={handleSaveChargesheet}
        />
      )}

      {/* MODAL 13: Court Hearing & Disposal */}
      {isCourtHearingOpen && targetCaseForAction && (
        <CourtHearingModal
          isOpen={isCourtHearingOpen}
          onClose={() => setIsCourtHearingOpen(false)}
          caseItem={targetCaseForAction}
          onUpdateCourtTrial={handleUpdateCourtTrial}
        />
      )}

    </div>
  );
}
