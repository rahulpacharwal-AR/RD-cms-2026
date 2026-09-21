import { CaseStage, CrimeCategory, PriorityLevel, StatutoryDeadlineAlert } from '../types';

export const STAGE_CONFIG: Record<CaseStage, { label: string; hindiLabel: string; color: string; bgColor: string; stepNumber: number }> = {
  COMPLAINT_RECEIVED: {
    label: 'Complaint Received',
    hindiLabel: 'शिकायत दर्ज',
    color: 'text-amber-700 border-amber-300',
    bgColor: 'bg-amber-50',
    stepNumber: 1
  },
  IO_ASSIGNED: {
    label: 'IO Assigned for Enquiry',
    hindiLabel: 'जांच अधिकारी नियुक्त',
    color: 'text-sky-700 border-sky-300',
    bgColor: 'bg-sky-50',
    stepNumber: 2
  },
  PRELIMINARY_ENQUIRY: {
    label: 'Preliminary Enquiry (PE)',
    hindiLabel: 'प्रारंभिक जांच जारी',
    color: 'text-blue-700 border-blue-300',
    bgColor: 'bg-blue-50',
    stepNumber: 3
  },
  ENQUIRY_REPORT_SUBMITTED: {
    label: 'Enquiry Report Under Review',
    hindiLabel: 'जांच रिपोर्ट समीक्षाधीन',
    color: 'text-indigo-700 border-indigo-300',
    bgColor: 'bg-indigo-50',
    stepNumber: 4
  },
  CLOSED_AT_ENQUIRY: {
    label: 'Disposed at Enquiry (No FIR)',
    hindiLabel: 'जांच उपरांत निस्तारित / दफ्तर दाखिल (बिना FIR)',
    color: 'text-slate-800 border-slate-300',
    bgColor: 'bg-slate-100',
    stepNumber: 4
  },
  FIR_REGISTERED: {
    label: 'FIR Registered',
    hindiLabel: 'प्रथम सूचना रिपोर्ट दर्ज',
    color: 'text-emerald-800 border-emerald-300',
    bgColor: 'bg-emerald-50',
    stepNumber: 5
  },
  UNDER_INVESTIGATION: {
    label: 'Full Investigation (तफ्तीश)',
    hindiLabel: 'विवेचना / तफ्तीश जारी',
    color: 'text-teal-800 border-teal-300',
    bgColor: 'bg-teal-50',
    stepNumber: 6
  },
  CHARGESHEET_PREPARED: {
    label: 'Chargesheet / Challan Drafted',
    hindiLabel: 'चालान समीक्षाधीन',
    color: 'text-purple-800 border-purple-300',
    bgColor: 'bg-purple-50',
    stepNumber: 7
  },
  CHARGESHEET_SUBMITTED_TO_COURT: {
    label: 'Submitted in Court',
    hindiLabel: 'अदालत में दाखिल',
    color: 'text-violet-800 border-violet-300',
    bgColor: 'bg-violet-50',
    stepNumber: 8
  },
  UNDER_TRIAL: {
    label: 'Under Trial (Court)',
    hindiLabel: 'न्यायालय विचारणाधीन',
    color: 'text-orange-800 border-orange-300',
    bgColor: 'bg-orange-50',
    stepNumber: 9
  },
  DISPOSED: {
    label: 'Disposed / Decided',
    hindiLabel: 'अंतिम निस्तारित',
    color: 'text-emerald-900 border-emerald-400',
    bgColor: 'bg-emerald-100',
    stepNumber: 10
  }
};

export const PRIORITY_CONFIG: Record<PriorityLevel, { label: string; color: string; badge: string }> = {
  NORMAL: {
    label: 'Normal',
    color: 'text-slate-600',
    badge: 'bg-slate-100 text-slate-700 border-slate-300'
  },
  URGENT: {
    label: 'Urgent',
    color: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  HIGH: {
    label: 'High Priority',
    color: 'text-orange-600',
    badge: 'bg-orange-100 text-orange-800 border-orange-300'
  },
  CRITICAL: {
    label: 'Critical / Heinous',
    color: 'text-red-700',
    badge: 'bg-red-100 text-red-800 border-red-300 font-semibold'
  }
};

export const CRIME_CATEGORY_LABELS: Record<CrimeCategory, string> = {
  THEFT_BURGLARY: 'Theft / Burglary (चोरी / नकबजनी)',
  CYBER_FRAUD: 'Cyber Fraud / Online Scam (साइबर अपराध)',
  CHEATING_SCAM: 'Cheating / Forgery (धोखाधड़ी / जालसाजी)',
  MURDER_HOMICIDE: 'Murder / Attempt to Murder (हत्या / हत्या का प्रयास)',
  ASSAULT_HURT: 'Physical Assault / Hurt (मारपीट)',
  WOMEN_SAFETY: 'Crime Against Women (महिला सुरक्षा)',
  NDPS_DRUGS: 'NDPS / Narcotics (मादक पदार्थ)',
  EXTORTION: 'Extortion / Threat (रंगदारी / धमकी)',
  OTHER: 'General / Miscellaneous (अन्य अपराध)'
};

export function calculateStatutoryDeadline(arrestDateStr: string, daysTotal: 60 | 90 = 90): StatutoryDeadlineAlert {
  const arrestDate = new Date(arrestDateStr);
  const deadlineDate = new Date(arrestDate);
  deadlineDate.setDate(deadlineDate.getDate() + daysTotal);

  const today = new Date();
  const diffTime = deadlineDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isExpired = daysRemaining <= 0;

  let alertLevel: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
  if (daysRemaining <= 15) {
    alertLevel = 'CRITICAL';
  } else if (daysRemaining <= 30) {
    alertLevel = 'WARNING';
  }

  return {
    statutoryDaysTotal: daysTotal,
    startDate: arrestDateStr,
    deadlineDate: deadlineDate.toISOString().split('T')[0],
    daysRemaining: Math.max(0, daysRemaining),
    isExpired,
    alertLevel
  };
}

export function generateComplaintId(): string {
  const random = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  return `HR-CMP-${year}-${random}`;
}

export function generateFIRNumber(stationName: string): string {
  const random = Math.floor(100 + Math.random() * 900);
  const year = new Date().getFullYear();
  const stationShort = stationName.includes('Karnal') ? 'KNL' : stationName.includes('Panipat') ? 'PNP' : 'GGN';
  return `FIR No. ${random}/${year} (${stationShort})`;
}
