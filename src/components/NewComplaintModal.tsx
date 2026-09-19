import React, { useState, useRef } from 'react';
import { PoliceCase, CrimeCategory, PriorityLevel, AttachmentFile } from '../types';
import { POLICE_STATIONS } from '../data/initialData';
import { generateComplaintId } from '../utils/policeHelpers';
import { X, ShieldAlert, User, MapPin, Calendar, FileText, Upload, Plus, Trash2, Camera, AlertCircle, FolderOpen, Image, Film, Music, Check } from 'lucide-react';

interface NewComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newCase: PoliceCase) => void;
  receivingOfficerName: string;
  receivingOfficerRank: string;
}

export const NewComplaintModal: React.FC<NewComplaintModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  receivingOfficerName,
  receivingOfficerRank
}) => {
  if (!isOpen) return null;

  // Form State
  const [stationName, setStationName] = useState('PS Civil Lines, Karnal');
  const [priority, setPriority] = useState<PriorityLevel>('HIGH');
  const [crimeNature, setCrimeNature] = useState<CrimeCategory>('CYBER_FRAUD');

  // Complainant
  const [complainantName, setComplainantName] = useState('');
  const [fatherMotherName, setFatherMotherName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [designation, setDesignation] = useState('');
  const [address, setAddress] = useState('');
  const [idProofType, setIdProofType] = useState('Aadhaar Card');
  const [idProofNumber, setIdProofNumber] = useState('');

  // Incident
  const [incidentDate, setIncidentDate] = useState('2026-09-19');
  const [incidentTime, setIncidentTime] = useState('11:00 AM');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [incidentNarrative, setIncidentNarrative] = useState('');

  // Suspects
  const [suspectName, setSuspectName] = useState('');
  const [suspectFatherName, setSuspectFatherName] = useState('');
  const [suspectMobile, setSuspectMobile] = useState('');
  const [suspectAddress, setSuspectAddress] = useState('');
  const [suspectDescription, setSuspectDescription] = useState('');

  // Initial Attachments / Evidences with Local File Support
  const [attachments, setAttachments] = useState<Array<{
    title: string;
    fileType: 'PHOTO' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
    fileName: string;
    fileSize: string;
    fileUrl?: string;
  }>>([
    {
      title: 'Complainant Signed Written Application',
      fileType: 'DOCUMENT',
      fileName: 'Signed_Complaint_Letter.pdf',
      fileSize: '1.2 MB'
    }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [newAttTitle, setNewAttTitle] = useState('');
  const [newAttType, setNewAttType] = useState<'PHOTO' | 'VIDEO' | 'AUDIO' | 'DOCUMENT'>('PHOTO');
  const [newAttFileName, setNewAttFileName] = useState('');

  // Handle files selected from local device dialog or drag-and-drop
  const handleFilesPicked = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newItems: Array<{
      title: string;
      fileType: 'PHOTO' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
      fileName: string;
      fileSize: string;
      fileUrl?: string;
    }> = [];

    Array.from(fileList).forEach((file) => {
      let fType: 'PHOTO' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' = 'DOCUMENT';
      if (file.type.startsWith('image/')) fType = 'PHOTO';
      else if (file.type.startsWith('video/')) fType = 'VIDEO';
      else if (file.type.startsWith('audio/')) fType = 'AUDIO';

      const readableSize =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.max(1, Math.round(file.size / 1024))} KB`;

      // Clean readable title
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const cleanTitle = baseName.replace(/[_-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

      // Object URL for in-app viewing & thumbnails
      const localUrl = URL.createObjectURL(file);

      newItems.push({
        title: cleanTitle || file.name,
        fileType: fType,
        fileName: file.name,
        fileSize: readableSize,
        fileUrl: localUrl
      });
    });

    setAttachments((prev) => [...prev, ...newItems]);
    // clear manual inputs if set
    setNewAttTitle('');
    setNewAttFileName('');
  };

  const handleAddAttachment = () => {
    // If user clicked Add without entering filename, trigger the local file picker directly
    if (!newAttFileName.trim()) {
      fileInputRef.current?.click();
      return;
    }

    setAttachments([
      ...attachments,
      {
        title: newAttTitle.trim() || newAttFileName.trim(),
        fileType: newAttType,
        fileName: newAttFileName.trim(),
        fileSize: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`
      }
    ]);
    setNewAttTitle('');
    setNewAttFileName('');
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments(attachments.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complainantName.trim() || !mobile.trim() || !incidentNarrative.trim()) {
      alert('Please fill the mandatory complainant name, mobile number, and incident details.');
      return;
    }

    const complaintNumber = generateComplaintId();
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const selectedStation = POLICE_STATIONS.find((s) => s.name === stationName) || POLICE_STATIONS[0];

    const initialAttList: AttachmentFile[] = attachments.map((att, i) => ({
      id: `att-${Date.now()}-${i}`,
      title: att.title,
      fileType: att.fileType,
      fileName: att.fileName,
      fileSize: att.fileSize,
      fileUrl: att.fileUrl,
      uploadDate: `${currentDate} ${currentTime}`,
      uploadedBy: `${receivingOfficerName} (${receivingOfficerRank})`
    }));

    const newCase: PoliceCase = {
      id: `case-${Date.now()}`,
      complaintNumber,
      caseStage: 'COMPLAINT_RECEIVED',
      dateReceived: currentDate,
      timeReceived: currentTime,
      receivingOfficerName: receivingOfficerName || 'HC Manjeet Singh',
      receivingOfficerRank: receivingOfficerRank || 'MHC No. 442',
      policeStation: selectedStation.name,
      district: selectedStation.district,
      priority,
      crimeNature,
      incidentDate,
      incidentTime,
      incidentLocation: incidentLocation || selectedStation.name,
      incidentNarrative,
      complainant: {
        name: complainantName,
        fatherMotherName: fatherMotherName || 'Not Stated',
        mobile,
        email: email || undefined,
        designationOrOccupation: designation || 'Citizen',
        address: address || 'Local Resident',
        idProofType,
        idProofNumber: idProofNumber || 'N/A'
      },
      suspects: suspectName.trim()
        ? [
            {
              id: `susp-${Date.now()}`,
              name: suspectName,
              fatherName: suspectFatherName || 'Unknown',
              mobile: suspectMobile || 'Unknown',
              address: suspectAddress || 'Unknown',
              description: suspectDescription || 'Details pending enquiry',
              status: 'IDENTIFIED',
              custodyType: 'NOT_ARRESTED'
            }
          ]
        : [],
      initialAttachments: initialAttList,
      currentIO: {
        id: '',
        name: 'Unassigned',
        rank: '-',
        phone: '-',
        station: selectedStation.name
      },
      ioTransferHistory: [],
      enquiryTimelineZimni: [],
      fullInvestigationZimni: [],
      witnessStatements: [],
      evidenceFiles: [],
      forensicReports: [],
      updatedAt: `${currentDate} ${currentTime}`
    };

    onSubmit(newCase);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#0c1a30] text-white px-6 py-4 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Citizen Complaint Registration Desk (MHC / Thana)
                </h2>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[11px] font-bold rounded border border-amber-400/30">
                  Step 1 / शिकायत पंजीकरण
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Receiving Officer: {receivingOfficerName} ({receivingOfficerRank}) • Automatic SHO Notification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 bg-slate-50/50">
          
          {/* Section A: Police Station & Category */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-amber-600" />
              1. Jurisdiction & Classification / थाना एवं अपराध श्रेणी
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Police Station / Chowki *
                </label>
                <select
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-1 focus:ring-amber-500"
                >
                  {POLICE_STATIONS.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.district})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Crime Category (Nature of Offence) *
                </label>
                <select
                  value={crimeNature}
                  onChange={(e) => setCrimeNature(e.target.value as CrimeCategory)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-1 focus:ring-amber-500"
                >
                  <option value="THEFT_BURGLARY">Theft / Burglary (चोरी / नकबजनी)</option>
                  <option value="CYBER_FRAUD">Cyber Fraud / Online Scam (साइबर अपराध)</option>
                  <option value="CHEATING_SCAM">Cheating / Forgery (धोखाधड़ी)</option>
                  <option value="MURDER_HOMICIDE">Murder / Heinous (हत्या / जघन्य)</option>
                  <option value="ASSAULT_HURT">Physical Assault / Hurt (मारपीट)</option>
                  <option value="WOMEN_SAFETY">Crime Against Women (महिला अपराध)</option>
                  <option value="EXTORTION">Extortion / Threat (रंगदारी)</option>
                  <option value="NDPS_DRUGS">NDPS / Narcotics (ड्रग्स)</option>
                  <option value="OTHER">Other Offence (अन्य)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Initial Priority Level *
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-1 focus:ring-amber-500"
                >
                  <option value="NORMAL">Normal (सामान्य)</option>
                  <option value="URGENT">Urgent (आवश्यक)</option>
                  <option value="HIGH">High Priority (उच्च प्राथमिकता)</option>
                  <option value="CRITICAL">Critical / Heinous (अति-संवेदनशील)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section B: Complainant Details */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-blue-600" />
              2. Complainant Details / शिकायतकर्ता का विवरण
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name / नाम *
                </label>
                <input
                  type="text"
                  required
                  value={complainantName}
                  onChange={(e) => setComplainantName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra Verma"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Father's / Mother's Name *
                </label>
                <input
                  type="text"
                  value={fatherMotherName}
                  onChange={(e) => setFatherMotherName(e.target.value)}
                  placeholder="e.g. Sh. Om Prakash Verma"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number / मोबाइल *
                </label>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 98XXX XXXXX"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Designation / Occupation
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Shopkeeper / Govt Employee"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ID Proof (Type & No.)
                </label>
                <div className="flex gap-1.5">
                  <select
                    value={idProofType}
                    onChange={(e) => setIdProofType(e.target.value)}
                    className="w-1/2 text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  >
                    <option value="Aadhaar Card">Aadhaar</option>
                    <option value="Voter ID">Voter ID</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Driving Licence">DL</option>
                  </select>
                  <input
                    type="text"
                    value={idProofNumber}
                    onChange={(e) => setIdProofNumber(e.target.value)}
                    placeholder="Proof Number"
                    className="w-1/2 text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="citizen@example.com"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Complete Residential Address / पता *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House No., Street, Colony/Village, Tehsil, District Haryana"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Section C: Incident Details & What Happened */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-amber-600" />
              3. Incident Particulars / घटना का विवरण
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Incident *
                </label>
                <input
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Time of Incident *
                </label>
                <input
                  type="text"
                  value={incidentTime}
                  onChange={(e) => setIncidentTime(e.target.value)}
                  placeholder="e.g. 10:30 PM"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Exact Location / Crime Spot *
                </label>
                <input
                  type="text"
                  value={incidentLocation}
                  onChange={(e) => setIncidentLocation(e.target.value)}
                  placeholder="e.g. Near Bus Stand, Main Market Sector 13"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  What Happened? (Detailed Application Narrative) / घटना का पूरा ब्यौरा *
                </label>
                <textarea
                  rows={3}
                  required
                  value={incidentNarrative}
                  onChange={(e) => setIncidentNarrative(e.target.value)}
                  placeholder="Write clear narrative as stated in citizen application: manner of incident, losses incurred, weapon/vehicle details, sequence of events..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 leading-relaxed focus:ring-1 focus:ring-amber-500"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Section D: Suspect / Accused Details (If known) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-red-600" />
              4. Suspect / Accused Details (If Named/Known) / संदिग्ध या आरोपी का नाम
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Suspect / Accused Name
                </label>
                <input
                  type="text"
                  value={suspectName}
                  onChange={(e) => setSuspectName(e.target.value)}
                  placeholder="e.g. Vicky @ Kala (or Unknown)"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Father's Name (s/o)
                </label>
                <input
                  type="text"
                  value={suspectFatherName}
                  onChange={(e) => setSuspectFatherName(e.target.value)}
                  placeholder="Father's name if known"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Suspect Mobile / Contact
                </label>
                <input
                  type="text"
                  value={suspectMobile}
                  onChange={(e) => setSuspectMobile(e.target.value)}
                  placeholder="Mobile / social handle"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Address / Residence Area
                </label>
                <input
                  type="text"
                  value={suspectAddress}
                  onChange={(e) => setSuspectAddress(e.target.value)}
                  placeholder="Village / locality / suspected hideout"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Suspect Description / Identification Marks / Photo ID Details
                </label>
                <input
                  type="text"
                  value={suspectDescription}
                  onChange={(e) => setSuspectDescription(e.target.value)}
                  placeholder="Height, build, tattoo/scar, vehicle driven, clothes worn, photo ID if available"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Section E: Evidence Attachments (Photo, Video, Audio, Document) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Upload className="h-3.5 w-3.5 text-emerald-600" />
                5. Evidences & Attachments Provided by Complainant
              </h3>
              <span className="text-[11px] text-slate-500">
                Photo • Video • Audio • Document
              </span>
            </div>

            {/* Hidden native file input triggered by browse button */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
              className="hidden"
              onChange={(e) => handleFilesPicked(e.target.files)}
            />

            {/* Interactive Local File Browse & Drag-Drop Box */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                handleFilesPicked(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 ${
                isDragOver
                  ? 'border-emerald-500 bg-emerald-50/70 scale-[0.99]'
                  : 'border-slate-300 hover:border-amber-500 hover:bg-amber-50/30 bg-slate-50/50'
              }`}
            >
              <div className="h-10 w-10 rounded-full bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shadow-xs">
                <FolderOpen className="h-5 w-5 text-amber-700" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Browse & Pick Local Files (फ़ाइल चुनें)
                  </button>
                  <span className="text-xs text-slate-500 font-medium">या यहाँ Drag & Drop करें</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Select Photos (JPG/PNG), CCTV Clips (MP4), Voice Notes (MP3/M4A), or PDF Documents
                </p>
              </div>
            </div>

            {/* List of current attachments */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-700 block">
                Attached Files ({attachments.length}):
              </span>
              {attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {att.fileType === 'PHOTO' ? (
                      att.fileUrl ? (
                        <img
                          src={att.fileUrl}
                          alt={att.title}
                          className="h-9 w-9 rounded object-cover border border-slate-300 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <Image className="h-4 w-4" />
                        </div>
                      )
                    ) : att.fileType === 'VIDEO' ? (
                      <div className="h-8 w-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Film className="h-4 w-4" />
                      </div>
                    ) : att.fileType === 'AUDIO' ? (
                      <div className="h-8 w-8 rounded bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        <Music className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-bold text-[9px] uppercase tracking-wider">
                          {att.fileType}
                        </span>
                        <span className="font-semibold text-slate-800 truncate">{att.title}</span>
                      </div>
                      <span className="text-slate-400 font-mono text-[11px] truncate block">
                        {att.fileName} • {att.fileSize}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(idx)}
                    className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors shrink-0 ml-2"
                    title="Remove attachment"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick manual entry option */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
              <span className="text-[11px] font-semibold text-slate-600 block">
                Or manually specify physical exhibit / paper seized:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <input
                  type="text"
                  value={newAttTitle}
                  onChange={(e) => setNewAttTitle(e.target.value)}
                  placeholder="Exhibit description"
                  className="text-xs bg-white border border-slate-300 rounded p-1.5 md:col-span-2"
                />
                <select
                  value={newAttType}
                  onChange={(e) => setNewAttType(e.target.value as any)}
                  className="text-xs bg-white border border-slate-300 rounded p-1.5"
                >
                  <option value="PHOTO">Photo (फ़ोटो)</option>
                  <option value="VIDEO">Video (वीडियो)</option>
                  <option value="AUDIO">Audio (ऑडियो)</option>
                  <option value="DOCUMENT">Document (दस्तावेज़)</option>
                </select>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newAttFileName}
                    onChange={(e) => setNewAttFileName(e.target.value)}
                    placeholder="Exhibit_ID or filename"
                    className="w-full text-xs bg-white border border-slate-300 rounded p-1.5"
                  />
                  <button
                    type="button"
                    onClick={handleAddAttachment}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium text-xs hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              Generate Complaint & Forward to SHO
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
