import { PoliceCase, PoliceOfficer, PoliceStationInfo, UserRole } from '../types';

export const POLICE_STATIONS: PoliceStationInfo[] = [
  {
    id: 'ps-civil-lines-karnal',
    name: 'PS Civil Lines, Karnal',
    type: 'POLICE_STATION',
    subDivision: 'Karnal City',
    district: 'Karnal',
    shoName: 'Inspector Rajesh Hooda',
    shoRank: 'Inspector',
    contactNumber: '+91 184 2251010',
    totalActiveCases: 14
  },
  {
    id: 'ps-city-panipat',
    name: 'PS City, Panipat',
    type: 'POLICE_STATION',
    subDivision: 'Panipat City',
    district: 'Panipat',
    shoName: 'Inspector Sanjeev Malik',
    shoRank: 'Inspector',
    contactNumber: '+91 180 2642100',
    totalActiveCases: 18
  },
  {
    id: 'ps-sector-29-gurugram',
    name: 'PS Sector 29, Gurugram',
    type: 'POLICE_STATION',
    subDivision: 'East Gurugram',
    district: 'Gurugram',
    shoName: 'Inspector Virender Singh',
    shoRank: 'Inspector',
    contactNumber: '+91 124 2382029',
    totalActiveCases: 22
  },
  {
    id: 'ps-cyber-faridabad',
    name: 'PS Cyber Crime, Faridabad',
    type: 'CYBER_CRIME_CELL',
    subDivision: 'NIT Faridabad',
    district: 'Faridabad',
    shoName: 'Inspector Neeraj Kumar',
    shoRank: 'Inspector',
    contactNumber: '+91 129 2227100',
    totalActiveCases: 9
  },
  {
    id: 'chowki-model-town',
    name: 'Police Chowki Model Town, Panipat',
    type: 'POLICE_CHOWKI',
    subDivision: 'Panipat City',
    district: 'Panipat',
    shoName: 'SI Devender Rohilla',
    shoRank: 'SI',
    contactNumber: '+91 180 2631555',
    totalActiveCases: 6
  }
];

export const POLICE_OFFICERS: PoliceOfficer[] = [
  // IOs
  {
    id: 'io-vikram',
    name: 'SI Vikram Singh',
    badgeNumber: 'HP-SI-4491',
    rank: 'SI',
    role: 'IO',
    phone: '+91 98120 44910',
    station: 'PS Civil Lines, Karnal',
    activeCasesCount: 4
  },
  {
    id: 'io-ramesh',
    name: 'ASI Ramesh Kumar',
    badgeNumber: 'HP-ASI-8120',
    rank: 'ASI',
    role: 'IO',
    phone: '+91 94160 88214',
    station: 'PS City, Panipat',
    activeCasesCount: 5
  },
  {
    id: 'io-priyanka',
    name: 'SI Priyanka Sharma',
    badgeNumber: 'HP-SI-5521',
    rank: 'SI',
    role: 'IO',
    phone: '+91 97290 11982',
    station: 'PS Sector 29, Gurugram',
    activeCasesCount: 3
  },
  {
    id: 'io-kuldeep',
    name: 'ASI Kuldeep Chahal',
    badgeNumber: 'HP-ASI-3349',
    rank: 'ASI',
    role: 'IO',
    phone: '+91 98132 99401',
    station: 'PS Cyber Crime, Faridabad',
    activeCasesCount: 3
  },
  // SHOs
  {
    id: 'sho-rajesh',
    name: 'Inspector Rajesh Hooda',
    badgeNumber: 'HP-INS-1042',
    rank: 'INSPECTOR',
    role: 'SHO',
    phone: '+91 94161 22345',
    station: 'PS Civil Lines, Karnal',
    activeCasesCount: 14
  },
  {
    id: 'sho-sanjeev',
    name: 'Inspector Sanjeev Malik',
    badgeNumber: 'HP-INS-1188',
    rank: 'INSPECTOR',
    role: 'SHO',
    phone: '+91 94163 77890',
    station: 'PS City, Panipat',
    activeCasesCount: 18
  },
  // SP / District Head
  {
    id: 'sp-surender',
    name: 'Sh. Surender Phogat, IPS',
    badgeNumber: 'IPS-HR-2012-08',
    rank: 'SP_IPS',
    role: 'SP',
    phone: '+91 184 2267000',
    station: 'District Police Headquarters, Karnal',
    activeCasesCount: 45
  },
  // Admin
  {
    id: 'admin-haryanapolice',
    name: 'HQ IT Cell Administrator',
    badgeNumber: 'HP-IT-001',
    rank: 'DSP',
    role: 'ADMIN',
    phone: '+91 172 2587500',
    station: 'State Police Headquarters, Panchkula',
    activeCasesCount: 0
  }
];

export const DEFAULT_OFFICERS: Record<UserRole, PoliceOfficer> = {
  IO: POLICE_OFFICERS[0], // SI Vikram Singh
  SHO: POLICE_OFFICERS[4], // Inspector Rajesh Hooda
  SP: POLICE_OFFICERS[6], // Sh. Surender Phogat, IPS
  ADMIN: POLICE_OFFICERS[7] // HQ IT Cell Administrator
};

export const INITIAL_CASES: PoliceCase[] = [
  // 1. FRESH COMPLAINT: Citizen brought complaint, MHC registered, SHO notification pending assignment
  {
    id: 'case-2026-001',
    complaintNumber: 'HR-CMP-2026-0921',
    caseStage: 'COMPLAINT_RECEIVED',
    dateReceived: '2026-09-19',
    timeReceived: '08:45 AM',
    receivingOfficerName: 'HC Manjeet Singh',
    receivingOfficerRank: 'MHC / HC No. 642',
    policeStation: 'PS Civil Lines, Karnal',
    district: 'Karnal',
    priority: 'HIGH',
    crimeNature: 'CYBER_FRAUD',
    incidentDate: '2026-09-18',
    incidentTime: '04:30 PM',
    incidentLocation: 'Sector 14 Market, Karnal',
    incidentNarrative: 'Complainant was duped of ₹4,85,000/- via fraudulent bank KYC APK link sent on WhatsApp posing as SBI Chief Compliance Officer. Money was transferred to an unknown Yes Bank account within 8 minutes.',
    complainant: {
      name: 'Sunil Dutt Sharma',
      fatherMotherName: 'Late Sh. Krishan Chand Sharma',
      mobile: '+91 98960 12345',
      email: 'sunil.sharma.karnal@gmail.com',
      designationOrOccupation: 'Retired Government School Principal',
      address: 'H.No. 412, Sector 14, Urban Estate, Karnal - 132001',
      idProofType: 'Aadhaar Card',
      idProofNumber: 'XXXX-XXXX-8921'
    },
    suspects: [
      {
        id: 'susp-01',
        name: 'Rohan Sharma (Impersonator)',
        fatherName: 'Unknown',
        mobile: '+91 70189 44102',
        address: 'Nuh / Jamtara network link (Suspected)',
        description: 'Spoke fluent Hindi, claimed to be SBI Customer Care Manager, IP registered in Jamtara hub',
        status: 'UNDER_SURVEILLANCE'
      }
    ],
    initialAttachments: [
      {
        id: 'att-01',
        title: 'Bank Account Statement Showing Debit',
        fileType: 'DOCUMENT',
        fileName: 'SBI_Passbook_Statement_18Sep.pdf',
        fileSize: '1.4 MB',
        uploadDate: '2026-09-19 08:50 AM',
        uploadedBy: 'HC Manjeet Singh (MHC)',
        notes: 'Includes transaction IDs: UPI/YESB/99214022194'
      },
      {
        id: 'att-02',
        title: 'WhatsApp Chat Screenshots & APK File',
        fileType: 'PHOTO',
        fileName: 'WhatsApp_Chat_Malicious_APK.jpg',
        fileSize: '840 KB',
        uploadDate: '2026-09-19 08:52 AM',
        uploadedBy: 'HC Manjeet Singh (MHC)'
      }
    ],
    currentIO: {
      id: '',
      name: 'Unassigned',
      rank: '-',
      phone: '-',
      station: 'PS Civil Lines, Karnal'
    },
    ioTransferHistory: [],
    enquiryTimelineZimni: [],
    fullInvestigationZimni: [],
    witnessStatements: [],
    evidenceFiles: [],
    forensicReports: [],
    updatedAt: '2026-09-19 08:55 AM'
  },

  // 2. PRELIMINARY ENQUIRY: IO assigned, site visit done, mini diary Day 01 & 02 logged, ready for FIR decision
  {
    id: 'case-2026-002',
    complaintNumber: 'HR-CMP-2026-0814',
    caseStage: 'PRELIMINARY_ENQUIRY',
    dateReceived: '2026-09-17',
    timeReceived: '10:15 AM',
    receivingOfficerName: 'MHC Balwan Singh',
    receivingOfficerRank: 'MHC No. 312',
    policeStation: 'PS City, Panipat',
    policeChowki: 'Police Chowki Model Town, Panipat',
    district: 'Panipat',
    priority: 'HIGH',
    crimeNature: 'THEFT_BURGLARY',
    incidentDate: '2026-09-16',
    incidentTime: '11:45 PM',
    incidentLocation: 'Jewellery Shop #14, Main Market, Model Town, Panipat',
    incidentNarrative: 'Night burglary in jewellery shop after breaking back wall shutter locks. Gold ornaments worth approx ₹18 Lakhs and cash ₹2.5 Lakhs reported stolen.',
    complainant: {
      name: 'Virender Verma',
      fatherMotherName: 'Sh. Ram Lal Verma',
      mobile: '+91 94160 55123',
      designationOrOccupation: 'Proprietor, Verma Jewellers',
      address: 'Shop 14, Main Market, Model Town, Panipat',
      idProofType: 'PAN Card',
      idProofNumber: 'ABCXXXX12K'
    },
    suspects: [
      {
        id: 'susp-02',
        name: 'Golu @ Gurmeet',
        fatherName: 'Sh. Harphool Singh',
        mobile: '+91 98129 00412',
        address: 'Village Kabri, Distt. Panipat',
        description: 'Height 5ft 7in, scar on left cheek, previous record in PS City Panipat',
        status: 'IDENTIFIED',
        custodyType: 'NOT_ARRESTED'
      }
    ],
    initialAttachments: [
      {
        id: 'att-03',
        title: 'CCTV Footage Snapshot of Burglar',
        fileType: 'PHOTO',
        fileName: 'CCTV_Camera3_BackShutter_2345hrs.jpg',
        fileSize: '3.2 MB',
        uploadDate: '2026-09-17 10:25 AM',
        uploadedBy: 'MHC Balwan Singh',
        geoTag: {
          latitude: 29.3909,
          longitude: 76.9635,
          locationName: 'Model Town Panipat'
        }
      }
    ],
    preliminaryEnquiry: {
      assignedToIO: {
        id: 'io-ramesh',
        name: 'ASI Ramesh Kumar',
        rank: 'ASI',
        phone: '+91 94160 88214',
        assignedDate: '2026-09-17 11:00 AM'
      },
      siteVisitDate: '2026-09-17 12:30 PM',
      siteVisitLocation: 'Shop 14, Main Market, Model Town, Panipat',
      siteVisitObservations: 'Inspected scene with mobile forensic kit. Shutter latch broken with iron crowbar. Iron safe forced open. CCTV DVR hard drive was not tampered.',
      isCognizable: true,
      genuinenessStatus: 'GENUINE',
      enquirySummary: 'Prima facie cognizable offence made out under sections of theft in dwelling/shop by night. CCTV shows suspect matching profile of Golu @ Gurmeet with an accomplice.',
      recommendation: 'RECOMMEND_FIR',
      recommendationDate: '2026-09-18 05:00 PM'
    },
    currentIO: {
      id: 'io-ramesh',
      name: 'ASI Ramesh Kumar',
      rank: 'ASI',
      phone: '+91 94160 88214',
      station: 'PS City, Panipat'
    },
    ioTransferHistory: [],
    enquiryTimelineZimni: [
      {
        id: 'zimni-pe-01',
        zimniNumber: 1,
        date: '2026-09-17',
        time: '11:15 AM',
        officerName: 'ASI Ramesh Kumar',
        officerRank: 'ASI',
        officerPhone: '+91 94160 88214',
        actionTaken: 'Complaint review & Initial Briefing',
        findings: 'Received complaint copy through SHO endorsement. Reached complainant shop within 40 minutes with Head Constable Suraj.',
        locationVisited: 'Police Chowki Model Town to Crime Scene'
      },
      {
        id: 'zimni-pe-02',
        zimniNumber: 2,
        date: '2026-09-17',
        time: '02:45 PM',
        officerName: 'ASI Ramesh Kumar',
        officerRank: 'ASI',
        officerPhone: '+91 94160 88214',
        actionTaken: 'Complainant & Night Guard Examination',
        findings: 'Recorded statement of night watchman Surender Singh. Saw two masked men on motorcycle around 11:30 PM.',
        locationVisited: 'Shop premises & Market lane'
      },
      {
        id: 'zimni-pe-03',
        zimniNumber: 3,
        date: '2026-09-18',
        time: '10:30 AM',
        officerName: 'ASI Ramesh Kumar',
        officerRank: 'ASI',
        officerPhone: '+91 94160 88214',
        actionTaken: 'Stock Invoices & Loss Assessment Verification',
        findings: 'Verified purchase bills of stolen jewellery items. Complainant handed over stamped inventory list showing 280 grams gold and cash book entry.',
        locationVisited: 'Verma Jewellers, Panipat'
      }
    ],
    fullInvestigationZimni: [],
    witnessStatements: [
      {
        id: 'ws-01',
        personName: 'Surender Singh (Night Chowkidar)',
        role: 'WITNESS',
        dateRecorded: '2026-09-17 03:00 PM',
        recordedByOfficer: 'ASI Ramesh Kumar',
        mode: 'TEXT_TRANSCRIPT',
        statementText: 'I was stationed at the east gate of Model Town market. At about 11:35 PM, a black Splendor motorcycle without number plate entered the lane. Two boys got off carrying a canvas bag. One was limping slightly.',
        verified: true
      }
    ],
    evidenceFiles: [
      {
        id: 'ev-pe-01',
        title: 'Crowbar and broken padlock seized from crime scene',
        fileType: 'PHOTO',
        fileName: 'Seized_Crowbar_Padlock_01.jpg',
        fileSize: '2.8 MB',
        uploadDate: '2026-09-17 04:15 PM',
        uploadedBy: 'ASI Ramesh Kumar',
        geoTag: {
          latitude: 29.3912,
          longitude: 76.9638,
          locationName: 'Shop #14 Model Town Panipat'
        },
        notes: 'Handed to MHC Malkhana for fingerprint processing'
      }
    ],
    forensicReports: [],
    updatedAt: '2026-09-18 05:30 PM'
  },

  // 3. FIR REGISTERED & UNDER ACTIVE INVESTIGATION: All complaint docs auto carried forward, statutory deadline active
  {
    id: 'case-2026-003',
    complaintNumber: 'HR-CMP-2026-0702',
    caseStage: 'UNDER_INVESTIGATION',
    dateReceived: '2026-08-25',
    timeReceived: '02:20 PM',
    receivingOfficerName: 'HC Sandeep Nain',
    receivingOfficerRank: 'MHC No. 881',
    policeStation: 'PS Civil Lines, Karnal',
    district: 'Karnal',
    priority: 'CRITICAL',
    crimeNature: 'CHEATING_SCAM',
    incidentDate: '2026-08-20',
    incidentTime: '11:00 AM',
    incidentLocation: 'Sector 12 Court Complex & GT Road, Karnal',
    incidentNarrative: 'Multi-victim immigration visa racket. Accused running fake overseas consultancy "Global Pathways" duped 14 youths of ₹92 Lakhs on promise of Canada Work Visas using forged biometric letters.',
    complainant: {
      name: 'Gurpreet Singh Randhawa',
      fatherMotherName: 'Sh. Baljeet Singh',
      mobile: '+91 98965 44321',
      designationOrOccupation: 'Farmer / Youth Applicant',
      address: 'Village Nilokheri, Karnal - 132117',
      idProofType: 'Aadhaar Card',
      idProofNumber: 'XXXX-XXXX-4412'
    },
    suspects: [
      {
        id: 'susp-03',
        name: 'Harish Juneja @ Harry',
        fatherName: 'Sh. Omprakash Juneja',
        mobile: '+91 98124 77102',
        address: 'Flat 402, Royal Residency, Karnal',
        description: 'Age 38, fair complexion, driving white Fortuner HR-05-AW-9900',
        status: 'ARRESTED',
        arrestDate: '2026-08-28 07:30 PM',
        custodyType: 'JUDICIAL_CUSTODY',
        bailDetails: 'Regular bail petition dismissed by Addl Sessions Judge on 05-09-2026'
      },
      {
        id: 'susp-04',
        name: 'Monika Sharma (Associate)',
        fatherName: 'Sh. Ramesh Sharma',
        mobile: '+91 94662 33119',
        address: 'Mohali Sector 70, Punjab',
        description: 'Forged visa stamping coordinator, presently untraced',
        status: 'ABSCONDING',
        custodyType: 'NOT_ARRESTED'
      }
    ],
    initialAttachments: [
      {
        id: 'att-04',
        title: 'Forged Canadian Embassy Letters with Fake QR Codes',
        fileType: 'DOCUMENT',
        fileName: 'Forged_Visa_Letter_Samples.pdf',
        fileSize: '4.1 MB',
        uploadDate: '2026-08-25 02:40 PM',
        uploadedBy: 'HC Sandeep Nain'
      }
    ],
    preliminaryEnquiry: {
      assignedToIO: {
        id: 'io-vikram',
        name: 'SI Vikram Singh',
        rank: 'SI',
        phone: '+91 98120 44910',
        assignedDate: '2026-08-25 03:00 PM'
      },
      isCognizable: true,
      genuinenessStatus: 'GENUINE',
      enquirySummary: 'Verified with Canadian High Commission fraud alert desk. The letters are complete counterfeits. Substantial money trail identified in HDFC bank.',
      recommendation: 'RECOMMEND_FIR',
      recommendationDate: '2026-08-26 11:30 AM'
    },
    firDetails: {
      firNumber: 'FIR No. 342/2026',
      registeredDate: '2026-08-26',
      registeredTime: '12:15 PM',
      policeStation: 'PS Civil Lines, Karnal',
      district: 'Karnal',
      applicableSections: [
        'BNS 318(4) - Cheating & Dishonestly Inducing Delivery of Property',
        'BNS 338 - Forgery of Valuable Security',
        'BNS 336(3) - Using as Genuine a Forged Document',
        'BNS 61(2) - Criminal Conspiracy'
      ],
      firSummary: 'Registered upon PE report of SI Vikram Singh. Huge immigration fraud involving forged overseas visas and multi-lakh financial transactions.',
      generatedByOfficer: 'SI Vikram Singh',
      approvedBySHO: 'Inspector Rajesh Hooda'
    },
    currentIO: {
      id: 'io-vikram',
      name: 'SI Vikram Singh',
      rank: 'SI',
      phone: '+91 98120 44910',
      station: 'PS Civil Lines, Karnal'
    },
    ioTransferHistory: [
      {
        id: 'tr-01',
        previousOfficerName: 'ASI Baldev Raj',
        previousOfficerRank: 'ASI',
        newOfficerName: 'SI Vikram Singh',
        newOfficerRank: 'SI',
        transferDate: '2026-08-27',
        transferReason: 'SPECIAL_INVESTIGATION_TEAM',
        orderReferenceNo: 'SP-KNL-ORDER-882/CRIME'
      }
    ],
    enquiryTimelineZimni: [
      {
        id: 'zim-pe-301',
        zimniNumber: 1,
        date: '2026-08-25',
        time: '04:00 PM',
        officerName: 'SI Vikram Singh',
        officerRank: 'SI',
        officerPhone: '+91 98120 44910',
        actionTaken: 'Complainant & Victim statements recorded',
        findings: 'Collected 7 bank transfer receipts from Nilokheri complainants totaling ₹38,50,000/-.'
      }
    ],
    fullInvestigationZimni: [
      {
        id: 'zim-full-01',
        zimniNumber: 1,
        date: '2026-08-26',
        time: '01:00 PM',
        officerName: 'SI Vikram Singh',
        officerRank: 'SI',
        officerPhone: '+91 98120 44910',
        actionTaken: 'FIR formal registration & Bank freezing notices',
        findings: 'Dispatched section 106 BNSS notice to HDFC Bank Sector 12 Karnal to freeze account of Global Pathways consultancy.'
      },
      {
        id: 'zim-full-02',
        zimniNumber: 2,
        date: '2026-08-28',
        time: '08:00 PM',
        officerName: 'SI Vikram Singh',
        officerRank: 'SI',
        officerPhone: '+91 98120 44910',
        actionTaken: 'Raid and Arrest of prime accused Harish Juneja',
        findings: 'Raid conducted at flat #402, Royal Residency Karnal. Accused intercepted trying to flee with laptop and 11 Indian Passports. Arrest memo prepared.',
        locationVisited: 'Royal Residency, Karnal'
      },
      {
        id: 'zim-full-03',
        zimniNumber: 3,
        date: '2026-09-02',
        time: '11:00 AM',
        officerName: 'SI Vikram Singh',
        officerRank: 'SI',
        officerPhone: '+91 98120 44910',
        actionTaken: 'Search of Consultancy Office & Recovery of Stamps',
        findings: 'Seized 14 fake rubber stamps of Canadian Immigration authorities, 1 Dell Inspiron Laptop, and ₹6,40,000/- cash from secret vault.'
      }
    ],
    witnessStatements: [
      {
        id: 'ws-02',
        personName: 'Manpreet Kaur',
        role: 'WITNESS',
        dateRecorded: '2026-08-29 02:00 PM',
        recordedByOfficer: 'SI Vikram Singh',
        mode: 'TEXT_TRANSCRIPT',
        statementText: 'I paid ₹6.5 Lakhs cash to Harish Juneja in presence of his receptionist Monika. He gave me a printed file with false biometrics schedule.',
        verified: true
      }
    ],
    evidenceFiles: [
      {
        id: 'ev-full-01',
        title: 'Seized Fake Embossing Seals & 11 Passports',
        fileType: 'PHOTO',
        fileName: 'Seized_Embassy_Stamps_Recovered.jpg',
        fileSize: '3.6 MB',
        uploadDate: '2026-09-02 01:15 PM',
        uploadedBy: 'SI Vikram Singh',
        geoTag: {
          latitude: 29.6857,
          longitude: 76.9905,
          locationName: 'Sector 12 Karnal'
        }
      }
    ],
    forensicReports: [
      {
        id: 'fsl-01',
        reportType: 'DIGITAL_FORENSICS',
        title: 'Hard Disk Analysis of Seized Consultancy Laptop',
        laboratoryName: 'State Cyber Forensic Science Laboratory, Madhuban, Karnal',
        dateRequested: '2026-09-03',
        dateReceived: '2026-09-14',
        status: 'REPORT_RECEIVED',
        findingsSummary: 'FSL confirmed 42 forged embassy PDF templates created using Adobe Photoshop and CorelDraw found on serial number CN-0T769K hard drive. WhatsApp chats linking payments to bank accounts verified.',
        officerNotes: 'Vital corroboration against accused Harish Juneja'
      },
      {
        id: 'fsl-02',
        reportType: 'CDR_ANALYSIS',
        title: 'CDR and Tower Dump Analysis of Accused Mobile',
        laboratoryName: 'District Cyber Cell, Karnal',
        dateRequested: '2026-08-29',
        dateReceived: '2026-09-05',
        status: 'REPORT_RECEIVED',
        findingsSummary: 'Frequent contacts with absconding co-accused Monika Sharma in Mohali and hawala operator in Karol Bagh Delhi.',
        officerNotes: 'Raiding party dispatched to Mohali'
      }
    ],
    statutoryDeadline: {
      statutoryDaysTotal: 90,
      startDate: '2026-08-28', // Arrest date
      deadlineDate: '2026-11-26',
      daysRemaining: 68,
      isExpired: false,
      alertLevel: 'NORMAL'
    },
    updatedAt: '2026-09-15 04:20 PM'
  },

  // 4. CHARGESHEET PREPARED & UNDER SENIOR REVIEW: IO prepared challan, awaiting SHO & SP approval
  {
    id: 'case-2026-004',
    complaintNumber: 'HR-CMP-2026-0511',
    caseStage: 'CHARGESHEET_PREPARED',
    dateReceived: '2026-06-25',
    timeReceived: '04:00 PM',
    receivingOfficerName: 'HC Satish',
    receivingOfficerRank: 'MHC No. 519',
    policeStation: 'PS Sector 29, Gurugram',
    district: 'Gurugram',
    priority: 'HIGH',
    crimeNature: 'EXTORTION',
    incidentDate: '2026-06-24',
    incidentTime: '08:30 PM',
    incidentLocation: 'Golf Course Road, DLF Phase 1, Gurugram',
    incidentNarrative: 'Businessman extorted for ₹25 Lakhs protection money by Lawrence gang henchmen with threat to life via international VoIP number.',
    complainant: {
      name: 'Deepak Singhal',
      fatherMotherName: 'Sh. Banwari Lal Singhal',
      mobile: '+91 98110 99882',
      designationOrOccupation: 'Managing Director, Horizon Infra',
      address: 'Villa 18, Magnolia Park, Golf Course Road, Gurugram',
      idProofType: 'Aadhaar Card',
      idProofNumber: 'XXXX-XXXX-1100'
    },
    suspects: [
      {
        id: 'susp-05',
        name: 'Ajay @ Shooter',
        fatherName: 'Sh. Mahender Singh',
        mobile: '+91 79881 22910',
        address: 'Village Jharsa, Gurugram',
        description: 'Identified on CCTV delivering threat letter and bullet envelope',
        status: 'ARRESTED',
        arrestDate: '2026-06-29 05:00 PM',
        custodyType: 'JUDICIAL_CUSTODY'
      }
    ],
    initialAttachments: [
      {
        id: 'att-05',
        title: 'Envelope containing handwritten threat letter & live round',
        fileType: 'PHOTO',
        fileName: 'Extortion_Letter_Cartridge.jpg',
        fileSize: '3.1 MB',
        uploadDate: '2026-06-25 04:15 PM',
        uploadedBy: 'HC Satish'
      }
    ],
    firDetails: {
      firNumber: 'FIR No. 198/2026',
      registeredDate: '2026-06-26',
      registeredTime: '10:00 AM',
      policeStation: 'PS Sector 29, Gurugram',
      district: 'Gurugram',
      applicableSections: [
        'BNS 308(2) - Extortion by Putting in Fear of Death',
        'BNS 351(2) - Criminal Intimidation',
        'Arms Act 1959 Sec 25/54/59'
      ],
      firSummary: 'FIR registered upon verification of extortion threat letter and recovered 7.65mm pistol cartridge.',
      generatedByOfficer: 'SI Priyanka Sharma',
      approvedBySHO: 'Inspector Virender Singh'
    },
    currentIO: {
      id: 'io-priyanka',
      name: 'SI Priyanka Sharma',
      rank: 'SI',
      phone: '+91 97290 11982',
      station: 'PS Sector 29, Gurugram'
    },
    ioTransferHistory: [],
    enquiryTimelineZimni: [],
    fullInvestigationZimni: [
      {
        id: 'zim-ext-01',
        zimniNumber: 1,
        date: '2026-06-26',
        time: '11:00 AM',
        officerName: 'SI Priyanka Sharma',
        officerRank: 'SI',
        officerPhone: '+91 97290 11982',
        actionTaken: 'Inspected residential gate & collected CCTV',
        findings: 'Obtained clear face capture of motorcycle rider wearing helmet delivering white envelope.'
      },
      {
        id: 'zim-ext-02',
        zimniNumber: 2,
        date: '2026-06-29',
        time: '06:00 PM',
        officerName: 'SI Priyanka Sharma',
        officerRank: 'SI',
        officerPhone: '+91 97290 11982',
        actionTaken: 'Naka interception and arrest',
        findings: 'Intercepted Pulsar motorcycle HR-26-CP-1402 near Jharsa flyover. Accused Ajay apprehended with countrymade .32 pistol and 4 live rounds.'
      }
    ],
    witnessStatements: [
      {
        id: 'ws-ext-01',
        personName: 'Ramesh Security Guard',
        role: 'WITNESS',
        dateRecorded: '2026-06-27 11:00 AM',
        recordedByOfficer: 'SI Priyanka Sharma',
        mode: 'TEXT_TRANSCRIPT',
        statementText: 'The delivery boy threw the envelope at the guard post and warned that if boss does not call the given Dubai number, consequences will follow.',
        verified: true
      }
    ],
    evidenceFiles: [
      {
        id: 'ev-ext-01',
        title: 'Seized .32 Countrymade Pistol & 4 Live Cartridges',
        fileType: 'PHOTO',
        fileName: 'Recovered_Pistol_Memo.jpg',
        fileSize: '2.5 MB',
        uploadDate: '2026-06-29 07:00 PM',
        uploadedBy: 'SI Priyanka Sharma'
      }
    ],
    forensicReports: [
      {
        id: 'fsl-ballistics-01',
        reportType: 'FSL_BALLISTICS',
        title: 'Ballistics & Firearm Fingerprint Analysis',
        laboratoryName: 'Regional Forensic Science Laboratory, Bhondsi, Gurugram',
        dateRequested: '2026-07-02',
        dateReceived: '2026-08-10',
        status: 'REPORT_RECEIVED',
        findingsSummary: 'FSL confirmed the cartridge recovered from complainant envelope matches chamber marks of the seized firearm recovered from Ajay @ Shooter.',
        officerNotes: 'Concrete forensic link establishing accused possession'
      }
    ],
    statutoryDeadline: {
      statutoryDaysTotal: 90,
      startDate: '2026-06-29',
      deadlineDate: '2026-09-27',
      daysRemaining: 8,
      isExpired: false,
      alertLevel: 'CRITICAL' // Approaching 90 days!
    },
    chargesheet: {
      chargesheetNumber: 'CHALLAN-2026-198-SEC29',
      draftPreparedDate: '2026-09-16',
      investigatingOfficerName: 'SI Priyanka Sharma',
      applicableSections: ['BNS 308(2)', 'BNS 351(2)', 'Arms Act Sec 25/54/59'],
      accusedPersonsCharged: ['Ajay @ Shooter s/o Mahender Singh'],
      listOfWitnesses: [
        'Complainant Deepak Singhal (PW-1)',
        'Guard Ramesh (PW-2)',
        'SI Priyanka Sharma (IO / PW-3)',
        'Dr. M.K. Yadav (Ballistics Ballistic Expert / PW-4)'
      ],
      materialEvidences: [
        'Ex.P1: Extortion letter',
        'Ex.P2: .32 countrymade pistol',
        'Ex.P3: 4 live cartridges & 1 test fired cartridge',
        'Ex.P4: FSL Ballistic Report RFSL/BND/2026/410'
      ],
      shoReviewStatus: 'APPROVED',
      shoRemarks: 'Investigation complete in all respects. Forensic ballistic report confirms firing pins. Approved for SP review.',
      spApprovalStatus: 'PENDING',
      spRemarks: 'Challan under review by District Prosecution Officer / SP Office'
    },
    updatedAt: '2026-09-18 11:15 AM'
  },

  // 5. COURT SUBMISSION & UNDER TRIAL: Charges framed, prosecution evidence in CJM court
  {
    id: 'case-2026-005',
    complaintNumber: 'HR-CMP-2026-0210',
    caseStage: 'UNDER_TRIAL',
    dateReceived: '2026-03-10',
    timeReceived: '11:30 AM',
    receivingOfficerName: 'HC Ramesh Chander',
    receivingOfficerRank: 'MHC No. 102',
    policeStation: 'PS Cyber Crime, Faridabad',
    district: 'Faridabad',
    priority: 'HIGH',
    crimeNature: 'CYBER_FRAUD',
    incidentDate: '2026-03-08',
    incidentTime: '02:00 PM',
    incidentLocation: 'Sector 15, Faridabad',
    incidentNarrative: 'Online investment Ponzi portal "GrowWealth Alpha" cheated 45 investors of ₹1.6 Crore through fake trading app on Google Playstore.',
    complainant: {
      name: 'Anil Bhatia',
      fatherMotherName: 'Sh. Chaman Lal Bhatia',
      mobile: '+91 98119 22001',
      designationOrOccupation: 'Chartered Accountant',
      address: 'B-304, Palm Court, Sector 15, Faridabad',
      idProofType: 'Aadhaar Card',
      idProofNumber: 'XXXX-XXXX-9901'
    },
    suspects: [
      {
        id: 'susp-06',
        name: 'Pradeep Goyal',
        fatherName: 'Sh. Kishan Goyal',
        mobile: '+91 99100 88219',
        address: 'Sector 21C, Faridabad',
        description: 'Chief operator of fraudulent cloud server & account aggregator',
        status: 'ARRESTED',
        arrestDate: '2026-03-22',
        custodyType: 'JUDICIAL_CUSTODY'
      }
    ],
    initialAttachments: [],
    firDetails: {
      firNumber: 'FIR No. 44/2026',
      registeredDate: '2026-03-12',
      registeredTime: '03:00 PM',
      policeStation: 'PS Cyber Crime, Faridabad',
      district: 'Faridabad',
      applicableSections: ['BNS 318(4) - Cheating', 'BNS 61(2) - Conspiracy', 'IT Act 2000 Sec 66D'],
      firSummary: 'Sophisticated cyber scam involving spurious trading portal and shell mule accounts.',
      generatedByOfficer: 'ASI Kuldeep Chahal',
      approvedBySHO: 'Inspector Neeraj Kumar'
    },
    currentIO: {
      id: 'io-kuldeep',
      name: 'ASI Kuldeep Chahal',
      rank: 'ASI',
      phone: '+91 98132 99401',
      station: 'PS Cyber Crime, Faridabad'
    },
    ioTransferHistory: [],
    enquiryTimelineZimni: [],
    fullInvestigationZimni: [],
    witnessStatements: [],
    evidenceFiles: [],
    forensicReports: [],
    chargesheet: {
      chargesheetNumber: 'CHALLAN-CYBER-2026-044',
      draftPreparedDate: '2026-06-10',
      submissionDate: '2026-06-18',
      investigatingOfficerName: 'ASI Kuldeep Chahal',
      applicableSections: ['BNS 318(4)', 'BNS 61(2)', 'IT Act 66D'],
      accusedPersonsCharged: ['Pradeep Goyal'],
      listOfWitnesses: ['Anil Bhatia', 'Bank Compliance Officer', 'IO ASI Kuldeep Chahal'],
      materialEvidences: ['Server logs', 'Payment gateway dump', 'Seized mobile phones'],
      shoReviewStatus: 'APPROVED',
      spApprovalStatus: 'APPROVED'
    },
    courtTrial: {
      courtCaseNumber: 'CIS-CHI-491-2026',
      cnrNumber: 'HRFB01-008921-2026',
      courtName: 'Court of Chief Judicial Magistrate, Faridabad',
      presidingJudge: 'Sh. Ravinder Kumar, CJM',
      dateOfInstitution: '2026-06-20',
      currentTrialStage: 'PROSECUTION_EVIDENCE',
      hearings: [
        {
          id: 'hrg-01',
          hearingDate: '2026-07-15',
          courtName: 'Court of CJM, Faridabad',
          judgeDesignation: 'CJM Faridabad',
          purpose: 'SUMMONS_SERVICE',
          proceedingSummary: 'Accused produced from Central Jail Neemka through video conference. Copy of challan u/s 207 CrPC supplied to defense counsel.',
          nextHearingDate: '2026-08-04',
          nextHearingPurpose: 'Framing of Charges',
          officerPresent: 'ASI Kuldeep Chahal (IO)'
        },
        {
          id: 'hrg-02',
          hearingDate: '2026-08-04',
          courtName: 'Court of CJM, Faridabad',
          judgeDesignation: 'CJM Faridabad',
          purpose: 'FRAMING_OF_CHARGES',
          proceedingSummary: 'Charges framed against accused Pradeep Goyal under BNS 318(4) and IT Act 66D. Accused pleaded not guilty and claimed trial.',
          nextHearingDate: '2026-09-24',
          nextHearingPurpose: 'Prosecution Witness PW-1 & PW-2 Examination',
          officerPresent: 'ASI Kuldeep Chahal (IO)'
        }
      ]
    },
    updatedAt: '2026-08-05 02:30 PM'
  },

  // 6. CLOSED / DISPOSED CASE: Trial completed with conviction, final dossier ready
  {
    id: 'case-2026-006',
    complaintNumber: 'HR-CMP-2025-0189',
    caseStage: 'DISPOSED',
    dateReceived: '2025-11-04',
    timeReceived: '09:00 AM',
    receivingOfficerName: 'HC Joginder',
    receivingOfficerRank: 'MHC No. 711',
    policeStation: 'PS Civil Lines, Karnal',
    district: 'Karnal',
    priority: 'HIGH',
    crimeNature: 'THEFT_BURGLARY',
    incidentDate: '2025-11-03',
    incidentTime: '03:15 PM',
    incidentLocation: 'Sector 6 Commercial Hub, Karnal',
    incidentNarrative: 'Armed snatching of gold chain and purse from a teacher returning from school near DAV institution.',
    complainant: {
      name: 'Sushma Malik',
      fatherMotherName: 'W/o Sh. Ramesh Malik',
      mobile: '+91 94165 88990',
      designationOrOccupation: 'Government Senior Secondary Teacher',
      address: 'H.No. 120, Sector 6, Karnal',
      idProofType: 'Aadhaar Card',
      idProofNumber: 'XXXX-XXXX-3344'
    },
    suspects: [
      {
        id: 'susp-07',
        name: 'Monu @ Tinda',
        fatherName: 'Sh. Jagdish Chander',
        mobile: '+91 98120 77123',
        address: 'Railway Colony, Karnal',
        description: 'Repeat offender with 3 prior snatching convictions',
        status: 'ARRESTED',
        arrestDate: '2025-11-06',
        custodyType: 'JUDICIAL_CUSTODY'
      }
    ],
    initialAttachments: [],
    firDetails: {
      firNumber: 'FIR No. 512/2025',
      registeredDate: '2025-11-04',
      registeredTime: '10:30 AM',
      policeStation: 'PS Civil Lines, Karnal',
      district: 'Karnal',
      applicableSections: ['BNS 304(2) - Snatching', 'BNS 351 - Criminal Intimidation'],
      firSummary: 'Registered upon immediate spot enquiry and CCTV footage identification.',
      generatedByOfficer: 'SI Vikram Singh',
      approvedBySHO: 'Inspector Rajesh Hooda'
    },
    currentIO: {
      id: 'io-vikram',
      name: 'SI Vikram Singh',
      rank: 'SI',
      phone: '+91 98120 44910',
      station: 'PS Civil Lines, Karnal'
    },
    ioTransferHistory: [],
    enquiryTimelineZimni: [],
    fullInvestigationZimni: [],
    witnessStatements: [],
    evidenceFiles: [],
    forensicReports: [],
    chargesheet: {
      chargesheetNumber: 'CHALLAN-2025-512',
      draftPreparedDate: '2025-12-10',
      submissionDate: '2025-12-15',
      investigatingOfficerName: 'SI Vikram Singh',
      applicableSections: ['BNS 304(2)'],
      accusedPersonsCharged: ['Monu @ Tinda'],
      listOfWitnesses: ['Sushma Malik (PW-1)', 'SI Vikram Singh (PW-2)'],
      materialEvidences: ['Ex.P1: Recovered Gold Chain', 'Ex.P2: Pulsar Motorcycle'],
      shoReviewStatus: 'APPROVED',
      spApprovalStatus: 'APPROVED'
    },
    courtTrial: {
      courtCaseNumber: 'CIS-CHI-1102-2025',
      cnrNumber: 'HRKN01-004412-2025',
      courtName: 'Court of Additional Chief Judicial Magistrate, Karnal',
      presidingJudge: 'Sh. Sanjeev Arya, ACJM',
      dateOfInstitution: '2025-12-18',
      currentTrialStage: 'DISPOSED',
      hearings: [],
      finalOutcome: 'CONVICTION',
      judgmentDate: '2026-08-14',
      punishmentAwarded: 'Rigorous Imprisonment for 3 Years under BNS 304(2)',
      fineAmount: 15000,
      certifiedCopyUrl: 'Judgment_Order_Case_512_Karnal.pdf'
    },
    updatedAt: '2026-08-14 05:00 PM'
  }
];
