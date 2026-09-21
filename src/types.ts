export type UserRole = 'IO' | 'SHO' | 'SP' | 'ADMIN';

export type CaseStage =
  | 'COMPLAINT_RECEIVED'
  | 'IO_ASSIGNED'
  | 'PRELIMINARY_ENQUIRY'
  | 'ENQUIRY_REPORT_SUBMITTED'
  | 'CLOSED_AT_ENQUIRY'
  | 'FIR_REGISTERED'
  | 'UNDER_INVESTIGATION'
  | 'CHARGESHEET_PREPARED'
  | 'CHARGESHEET_SUBMITTED_TO_COURT'
  | 'UNDER_TRIAL'
  | 'DISPOSED';

export type PriorityLevel = 'NORMAL' | 'URGENT' | 'HIGH' | 'CRITICAL';

export type CrimeCategory =
  | 'THEFT_BURGLARY'
  | 'CYBER_FRAUD'
  | 'CHEATING_SCAM'
  | 'MURDER_HOMICIDE'
  | 'ASSAULT_HURT'
  | 'WOMEN_SAFETY'
  | 'NDPS_DRUGS'
  | 'EXTORTION'
  | 'OTHER';

export interface ComplainantInfo {
  name: string;
  fatherMotherName: string;
  mobile: string;
  email?: string;
  designationOrOccupation: string;
  address: string;
  idProofType?: string;
  idProofNumber?: string;
}

export interface SuspectInfo {
  id: string;
  name: string;
  fatherName: string;
  mobile: string;
  address: string;
  description: string;
  photoIdUrl?: string;
  status: 'IDENTIFIED' | 'UNDER_SURVEILLANCE' | 'ARRESTED' | 'ABSCONDING' | 'EXONERATED';
  arrestDate?: string;
  custodyType?: 'POLICE_REMAND' | 'JUDICIAL_CUSTODY' | 'BAIL_GRANTED' | 'NOT_ARRESTED';
  bailDetails?: string;
}

export interface AttachmentFile {
  id: string;
  title: string;
  fileType: 'PHOTO' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  fileUrl?: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  uploadedBy: string;
  geoTag?: {
    latitude: number;
    longitude: number;
    locationName: string;
  };
  notes?: string;
}

export interface StatementMediaAttachment {
  id: string;
  type: 'AUDIO' | 'VIDEO' | 'HANDWRITTEN' | 'PHOTO';
  title: string;
  dataUrl: string; // Base64 or Blob URL for playback / viewing
  mimeType?: string;
  durationSeconds?: number;
  recordedAt: string;
  fileSize?: string;
}

export interface WitnessStatement {
  id: string;
  personName: string;
  role: 'WITNESS' | 'COMPLAINANT' | 'SUSPECT' | 'INFORMER';
  dateRecorded: string;
  recordedByOfficer: string;
  mode: 'TEXT_TRANSCRIPT' | 'AUDIO' | 'VIDEO' | 'HANDWRITTEN_MEMO' | 'MULTI_MEDIA';
  statementText: string;
  recordingUrl?: string;
  attachments?: StatementMediaAttachment[];
  handwrittenDataUrl?: string;
  verified: boolean;
}

export interface ZimniEntry {
  id: string;
  zimniNumber: number; // Zimni 1, 2, 3...
  date: string;
  time: string;
  officerName: string;
  officerRank: string;
  officerPhone: string;
  actionTaken: string;
  findings: string;
  locationVisited?: string;
  attachmentsCount?: number;
}

export interface ForensicReport {
  id: string;
  reportType: 'FSL_BALLISTICS' | 'FSL_CHEMICAL' | 'DIGITAL_FORENSICS' | 'CDR_ANALYSIS' | 'POST_MORTEM' | 'MEDICAL_MLC' | 'FINGERPRINT';
  title: string;
  laboratoryName: string;
  dateRequested: string;
  dateReceived?: string;
  status: 'REQUESTED' | 'DISPATCHED_TO_LAB' | 'REPORT_RECEIVED' | 'INCONCLUSIVE';
  findingsSummary: string;
  reportFileUrl?: string;
  officerNotes?: string;
}

export interface PreliminaryEnquiry {
  assignedToIO: {
    id: string;
    name: string;
    rank: string;
    phone: string;
    assignedDate: string;
  };
  siteVisitDate?: string;
  siteVisitLocation?: string;
  siteVisitObservations?: string;
  isCognizable: boolean;
  genuinenessStatus: 'GENUINE' | 'DOUBTFUL' | 'CIVIL_NATURE' | 'FALSE_REPORT' | 'PENDING';
  enquirySummary: string;
  recommendation: 'RECOMMEND_FIR' | 'RECOMMEND_CLOSURE' | 'FURTHER_ENQUIRY_NEEDED';
  recommendationDate?: string;
  closureReason?: string;
  ioFinalRemarks?: string | {
    remarksNarrative?: string;
    recommendedSections?: string;
    isCognizableOffence?: boolean;
    evidenceEvaluation?: string;
  };
  suggestedSections?: string;
  submittedAt?: string;
  submittedByOfficer?: string;
  shoActionRequested?: 'PENDING_SHO_REVIEW' | 'SHO_ORDERED_FIR' | 'SHO_ASKED_FINAL_REPORT' | 'SHO_ORDERED_CLOSURE' | 'FINAL_REPORT_SUBMITTED';
  shoInstructions?: string;
  shoDemandNotes?: string;
  enquiryCompletedDate?: string;
  shoActionTimestamp?: string;
  finalReportSubmittedByIO?: boolean;
  finalReportForwardedAt?: string;
  finalReportSummary?: string;
  writtenFinalReport?: PoliceWrittenFinalReport;
  finalReportDocketSummary?: {
    evidenceCount: number;
    statementCount: number;
    suspectCount: number;
    zimniCount: number;
  } | string;
}

export interface PoliceWrittenFinalReport {
  department: string;
  citizenName: string;
  citizenFatherName?: string;
  citizenMobile: string;
  citizenAddress: string;
  complaintAllegations: string;
  reportDate: string;
  citizenSatisfaction: 'YES' | 'NO' | 'PENDING';
  enquiryHeading: string;
  noticeAndStudyNarrative: string;
  previousComplaintsReference?: string;
  respondentStatements: string;
  attachedDocumentsReference: string;
  complainantStatementNarrative: string;
  ioFindingsAndAnalysis: string;
  concludingRecommendation: string;
  officerSignatureName: string;
  officerSignatureRank: string;
  officerStation: string;
  officerDate: string;
}

export interface FIRDetails {
  firNumber: string;
  registeredDate: string;
  registeredTime: string;
  policeStation: string;
  district: string;
  applicableSections: string[]; // e.g. ["BNS 303(2)", "BNS 318(4)"]
  firSummary: string;
  generatedByOfficer: string;
  approvedBySHO: string;
}

export interface IOTransferHistory {
  id: string;
  previousOfficerName: string;
  previousOfficerRank: string;
  newOfficerName: string;
  newOfficerRank: string;
  transferDate: string;
  transferReason: 'ROUTINE_TRANSFER' | 'RETIREMENT' | 'MEDICAL_LEAVE' | 'ADMINISTRATIVE_ORDER' | 'SPECIAL_INVESTIGATION_TEAM';
  orderReferenceNo: string;
}

export interface StatutoryDeadlineAlert {
  statutoryDaysTotal: 60 | 90; // 60 days or 90 days
  startDate: string; // usually FIR date or first arrest date
  deadlineDate: string;
  daysRemaining: number;
  isExpired: boolean;
  alertLevel: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

export interface ChargesheetRecord {
  chargesheetNumber: string;
  draftPreparedDate: string;
  submissionDate?: string;
  investigatingOfficerName: string;
  applicableSections: string[];
  accusedPersonsCharged: string[];
  listOfWitnesses: string[];
  materialEvidences: string[];
  shoReviewStatus: 'PENDING' | 'REVISION_REQUESTED' | 'APPROVED';
  shoRemarks?: string;
  spApprovalStatus: 'PENDING' | 'REVISION_REQUESTED' | 'APPROVED';
  spRemarks?: string;
  revisionInstructions?: string;
}

export interface CourtHearing {
  id: string;
  hearingDate: string;
  courtName: string;
  judgeDesignation: string;
  purpose: 'SUMMONS_SERVICE' | 'FRAMING_OF_CHARGES' | 'PROSECUTION_EVIDENCE' | 'STATEMENT_OF_ACCUSED' | 'DEFENSE_EVIDENCE' | 'FINAL_ARGUMENTS' | 'JUDGMENT';
  proceedingSummary: string;
  nextHearingDate?: string;
  nextHearingPurpose?: string;
  officerPresent: string;
}

export interface CourtTrialRecord {
  courtCaseNumber: string;
  cnrNumber?: string;
  courtName: string;
  presidingJudge: string;
  dateOfInstitution: string;
  currentTrialStage: 'CASE_REGISTERED' | 'SUMMONING' | 'CHARGES_FRAMED' | 'PROSECUTION_EVIDENCE' | 'DEFENSE_EVIDENCE' | 'ARGUMENTS' | 'JUDGMENT_RESERVED' | 'DISPOSED';
  hearings: CourtHearing[];
  finalOutcome?: 'CONVICTION' | 'ACQUITTAL' | 'COMPROMISED' | 'QUASHED';
  judgmentDate?: string;
  punishmentAwarded?: string;
  fineAmount?: number;
  certifiedCopyUrl?: string;
}

export interface IOAcceptanceRecord {
  status: 'PENDING_ACCEPTANCE' | 'ACCEPTED';
  assignedAt: string;
  assignedBySHO: string;
  acceptedAt?: string;
  shoInstructions?: string;
}

export interface PoliceCase {
  id: string;
  complaintNumber: string;
  caseStage: CaseStage;
  dateReceived: string;
  timeReceived: string;
  receivingOfficerName: string;
  receivingOfficerRank: string; // e.g. "MHC / HC"
  policeStation: string;
  policeChowki?: string;
  district: string;
  priority: PriorityLevel;
  crimeNature: CrimeCategory;
  incidentDate: string;
  incidentTime: string;
  incidentLocation: string;
  incidentNarrative: string;
  complainant: ComplainantInfo;
  suspects: SuspectInfo[];
  initialAttachments: AttachmentFile[];
  preliminaryEnquiry?: PreliminaryEnquiry;
  firDetails?: FIRDetails;
  currentIO: {
    id: string;
    name: string;
    rank: string;
    phone: string;
    email?: string;
    station: string;
  };
  ioAcceptance?: IOAcceptanceRecord;
  ioTransferHistory: IOTransferHistory[];
  enquiryTimelineZimni: ZimniEntry[]; // Day 01, Day 02 mini diary during enquiry
  fullInvestigationZimni: ZimniEntry[]; // Full Parcha Zimni after FIR
  witnessStatements: WitnessStatement[];
  evidenceFiles: AttachmentFile[];
  forensicReports: ForensicReport[];
  statutoryDeadline?: StatutoryDeadlineAlert;
  chargesheet?: ChargesheetRecord;
  courtTrial?: CourtTrialRecord;
  closureReport?: {
    dateClosed: string;
    closedByOfficer: string;
    approvingAuthority: string;
    reason: string;
    documentUrl?: string;
  };
  updatedAt: string;
}

export interface PoliceStationInfo {
  id: string;
  name: string;
  type: 'POLICE_STATION' | 'POLICE_CHOWKI' | 'CYBER_CRIME_CELL';
  subDivision: string;
  district: string;
  shoName: string;
  shoRank: string;
  contactNumber: string;
  totalActiveCases: number;
}

export interface PoliceOfficer {
  id: string;
  name: string;
  badgeNumber: string;
  rank: 'ASI' | 'SI' | 'INSPECTOR' | 'DSP' | 'SP_IPS' | 'MHC_HC';
  role: UserRole;
  phone: string;
  station: string;
  activeCasesCount: number;
  jurisdictionDistricts?: string[]; // e.g. ['Karnal', 'Panipat'] or ['Faridabad', 'Gurugram']
  jurisdictionLabel?: string;
}
