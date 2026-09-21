import React, { useState, useEffect } from 'react';
import { PoliceCase, PoliceWrittenFinalReport } from '../types';
import {
  X, FileCheck2, ShieldCheck, CheckCircle2, User, FileText,
  Lock, Eye, Send, AlertTriangle, Paperclip, Printer, Edit3,
  Sparkles, Plus, Copy, RotateCcw, Building2, Phone, MapPin, Download
} from 'lucide-react';

interface ForwardFinalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: PoliceCase | null;
  onForwardFinalReport: (caseId: string, summary: string, writtenReport?: PoliceWrittenFinalReport) => void;
  currentOfficerName: string;
  currentOfficerRank: string;
}

export const ForwardFinalReportModal: React.FC<ForwardFinalReportModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  onForwardFinalReport,
  currentOfficerName,
  currentOfficerRank
}) => {
  const currentDateFormatted = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '.'); // e.g., 20.09.2026

  const officerName = currentOfficerName || caseItem?.currentIO?.name || 'जांच अधिकारी';
  const officerRank = currentOfficerRank || caseItem?.currentIO?.rank || 'उप निरीक्षक (SI)';
  const stationName = caseItem?.policeStation || 'थाना चांदनी बाग, पानीपत';

  // 1. Auto-build attached documents reference text
  const buildAttachedDocsReference = (): string => {
    const lines: string[] = [];
    if (caseItem?.initialAttachments && caseItem.initialAttachments.length > 0) {
      caseItem.initialAttachments.forEach((att, idx) => {
        lines.push(
          `${idx + 1}. संलग्न परिवाद दस्तावेज: ${att.fileName || att.title} (प्रकार: ${att.fileType}${att.notes ? `, विवरण: ${att.notes}` : ''})`
        );
      });
    }
    if (caseItem?.evidenceFiles && caseItem.evidenceFiles.length > 0) {
      caseItem.evidenceFiles.forEach((ev, idx) => {
        const offset = (caseItem.initialAttachments?.length || 0) + idx + 1;
        lines.push(
          `${offset}. संकलित प्रदर्श/साक्ष्य मेमो: ${ev.title} (फाइल: ${ev.fileName}, प्रकार: ${ev.fileType}, दिनांक: ${ev.uploadDate}${ev.notes ? `, विवरण: ${ev.notes}` : ''})`
        );
      });
    }
    if (lines.length === 0) {
      return 'दौरान जांच परिवादी द्वारा परिवाद के समर्थन में कोई पुख्ता बैंकिंग/अनुबंध या ऑडियो-वीडियो साक्ष्य प्रस्तुत नहीं किया गया। अभिलेखीय साक्ष्यों का परीक्षण किया गया।';
    }
    return `दौरान जांच पत्रावली के साथ संलग्न निम्नलिखित दस्तावेजों व प्रदर्शों का सूक्ष्मता से अवलोकन व परीक्षण किया गया:-\n${lines.join('\n')}`;
  };

  // 2. Auto-build respondent/suspect statements narrative
  const buildRespondentStatements = (): string => {
    const list: string[] = [];
    if (caseItem?.suspects && caseItem.suspects.length > 0) {
      caseItem.suspects.forEach((s) => {
        list.push(
          `उत्तरवादी ${s.name}${s.fatherName ? ` पुत्र ${s.fatherName}` : ''} वासी ${s.address || 'स्थानीय'} को शामिल जांच करके पूछताछ की गई व कथन अंकित किए गए। उत्तरवादी ने अपने बयान में अंकित करवाया कि- परिवादी द्वारा लगाए गए आरोप निराधार व झूठे हैं। दोनों पक्षों के मध्य पूर्व में आपसी कार्य व पैसों के लेन-देन का विवाद रहा है, जिसमें कोई आपराधिक मारपीट अथवा गाली-गलौज नहीं हुई।`
        );
      });
    }
    const accusedStatements = (caseItem?.witnessStatements || []).filter(
      (w) => w.role === 'SUSPECT'
    );
    if (accusedStatements.length > 0) {
      accusedStatements.forEach((ws) => {
        list.push(
          `उत्तरवादी/संदेही ${ws.personName} ने अपने हस्ताक्षरित बयान में कथन किया कि- "${ws.statementText}"`
        );
      });
    }
    if (list.length === 0) {
      return `उत्तरवादी पक्ष को शामिल जांच करके पूछताछ की गई। उत्तरवादी ने अपने बयान में अंकित करवाया कि परिवादी द्वारा प्रस्तुत परिवाद व्यक्तिगत द्वेष व लेन-देन के दबाव बनाने के उद्देश्य से दिया गया है।`;
    }
    return list.join('\n\n');
  };

  // 3. Auto-build complainant statements
  const buildComplainantStatement = (): string => {
    const compStmt = (caseItem?.witnessStatements || []).find(
      (w) => w.role === 'COMPLAINANT' || (caseItem?.complainant?.name && w.personName.toLowerCase().includes(caseItem.complainant.name.toLowerCase()))
    );
    if (compStmt) {
      return `परिवादी ${caseItem?.complainant?.name || 'परिवादी'} ने अपने हस्तलिखित बयान पेश किए जिसमें परिवादी ने कथन किया कि- "${compStmt.statementText}"। हस्तलिखित बयान व मूल परिवाद अवलोकनार्थ पत्रावली में संलग्न है।`;
    }
    return `परिवादी ${caseItem?.complainant?.name || 'परिवादी'} ने अपने हस्तलिखित बयान पेश किए जिसमें परिवादी ने लिखा कि मेरे द्वारा कराए गए कार्य व विवाद के संबंध में विपक्षी पक्ष से राशि बकाया है। परिवादी ने आरोप लगाए, परंतु मौके पर मारपीट अथवा जातिसूचक अभद्र व्यवहार का कोई स्वतंत्र साक्ष्य पेश नहीं कर सका।`;
  };

  // 4. Auto-build findings & recommendation based on PE evaluation
  const isCognizable = caseItem?.preliminaryEnquiry?.isCognizable ?? false;
  const isGenuine = caseItem?.preliminaryEnquiry?.genuinenessStatus === 'GENUINE';

  const defaultFindings = isCognizable
    ? `समस्त जांच, गवाहों के बयानों, संलग्न दस्तावेजों व मौका निरीक्षण से पाया गया कि परिवादी के आरोपों में प्रथम दृष्टया संज्ञेय अपराध के साक्ष्य पाए गए हैं। आरोपीगण के विरुद्ध संकलित साक्ष्यों के आधार पर कानूनी अभियोग दर्ज किया जाना न्यायोचित है।`
    : `समस्त जांच, गवाहों के बयानों, पत्रावली में संलग्न दस्तावेजों के अवलोकन एवं दोनों पक्षों को आमने-सामने बैठाकर की गई पूछताछ से स्पष्ट हुआ कि परिवादी व उत्तरवादी के मध्य मूल विवाद आपसी कार्य/ठेकेदारी व पैसों के लेन-देन का है। परिवादी द्वारा परिवाद में लगाए गए मारपीट अथवा जातिगत आधार पर प्रताड़ित करने संबंधी कोई भी स्वतंत्र साक्ष्य अथवा चिकित्सीय/दस्तावेजी साक्ष्य पेश नहीं किया गया है।`;

  const defaultRecommendation = isCognizable
    ? `अतः उक्त परिवाद में अभियोग (FIR) दर्ज कर सुसंगत धाराओं में अग्रिम अन्वेषण व न्यायालय में चालान प्रस्तुत करने के सादर आदेश फरमाए जाएं।\n\nरिपोर्ट सेवा में सादर प्रेषित है।`
    : `अतः उक्त परिवाद से मामला पूर्णतः आपसी पैसों के लेन-देन व सिविल प्रकृति का पाया गया है, जो किसी दांडिक कानूनी कार्यवाही का मोहताज नहीं है। परिवाद को दफ्तर दाखिल करने के सादर आदेश फरमाए जाएं।\n\nरिपोर्ट सेवा में सादर प्रेषित है।`;

  // State initialization with auto-carried details
  const [department, setDepartment] = useState('DEPARTMENT - HARYANA POLICE');
  const [citizenName, setCitizenName] = useState(
    `${caseItem?.complainant?.name || ''}${caseItem?.complainant?.fatherMotherName ? ` पुत्र/पुत्री ${caseItem.complainant.fatherMotherName}` : ''}`
  );
  const [citizenMobile, setCitizenMobile] = useState(caseItem?.complainant?.mobile || '');
  const [citizenAddress, setCitizenAddress] = useState(caseItem?.complainant?.address || '');
  const [complaintAllegations, setComplaintAllegations] = useState(
    caseItem?.incidentNarrative || 'आपसी विवाद, गाली-गलौज व रुपयों के लेन-देन बारे।'
  );
  const [reportDate, setReportDate] = useState(currentDateFormatted);
  const [citizenSatisfaction, setCitizenSatisfaction] = useState<'YES' | 'NO' | 'PENDING'>('NO');

  const [enquiryHeading, setEnquiryHeading] = useState(
    'FINAL REPORT ON THE ENQUIRY CONDUCTED BY THE INVESTIGATING OFFICER'
  );
  const [noticeAndStudyNarrative, setNoticeAndStudyNarrative] = useState(
    `जांच रिपोर्ट परिवाद नम्बरी ${caseItem?.complaintNumber || ''} दिनांक ${caseItem?.dateReceived || ''} बाबत "${(caseItem?.incidentNarrative || '').slice(0, 100)}..." वासी ${caseItem?.complainant?.address || 'स्थानीय'} की जांच मेरे द्वारा अमल में लाई गई। दौरान जांच परिवाद का गहन अध्ययन किया गया व परिवादी तथा उत्तरवादी को शामिल जांच होने के लिये विधिवत नोटिस दिए गए।`
  );
  const [previousComplaintsReference, setPreviousComplaintsReference] = useState(
    `परिवादी ने इससे पूर्व भी थाना व उच्चाधिकारियों के समक्ष परिवाद प्रस्तुत किए थे। थाना अभिलेख अनुसार पूर्व परिवादों की जांच उपरान्त निर्णय पत्रावली से मेल खाते हैं तथा पूर्व जांचों का विवरण भी तलब कर अवलोकन किया गया।`
  );
  const [respondentStatements, setRespondentStatements] = useState(buildRespondentStatements());
  const [attachedDocumentsReference, setAttachedDocumentsReference] = useState(buildAttachedDocsReference());
  const [complainantStatementNarrative, setComplainantStatementNarrative] = useState(buildComplainantStatement());
  const [ioFindingsAndAnalysis, setIoFindingsAndAnalysis] = useState(defaultFindings);
  const [concludingRecommendation, setConcludingRecommendation] = useState(defaultRecommendation);

  // View Mode: 'DOCUMENT_VIEW' (official formatted printable layout) vs 'FORM_EDITOR' (editable blocks)
  const [activeMode, setActiveMode] = useState<'DOCUMENT_VIEW' | 'FORM_EDITOR'>('DOCUMENT_VIEW');

  if (!isOpen || !caseItem) return null;

  // Quick preset helper
  const applyPreset = (type: 'CIVIL_CLOSURE' | 'COGNIZABLE_FIR') => {
    if (type === 'CIVIL_CLOSURE') {
      setCitizenSatisfaction('NO');
      setIoFindingsAndAnalysis(
        `समस्त जांच, गवाहों के बयानों, पत्रावली में संलग्न दस्तावेजों के अवलोकन एवं दोनों पक्षों को आमने-सामने बैठाकर की गई पूछताछ से स्पष्ट हुआ कि परिवादी व उत्तरवादी के मध्य मूल विवाद आपसी कार्य/ठेकेदारी व पैसों के लेन-देन का है। परिवादी द्वारा परिवाद में लगाए गए मारपीट अथवा जातिगत आधार पर प्रताड़ित करने संबंधी कोई भी स्वतंत्र साक्ष्य अथवा चिकित्सीय/दस्तावेजी साक्ष्य पेश नहीं किया गया है।`
      );
      setConcludingRecommendation(
        `अतः उक्त परिवाद से मामला पूर्णतः आपसी पैसों के लेन-देन व सिविल विवाद का पाया गया है, जो किसी दांडिक कानूनी कार्यवाही का मोहताज नहीं है। परिवाद को दफ्तर दाखिल करने के सादर आदेश फरमाए जाएं।\n\nरिपोर्ट सेवा में सादर प्रेषित है।`
      );
    } else {
      setCitizenSatisfaction('YES');
      setIoFindingsAndAnalysis(
        `समस्त जांच, गवाहों के बयानों, संलग्न दस्तावेजों, प्रदर्शों व मौका निरीक्षण से पाया गया कि परिवादी के आरोपों में प्रथम दृष्टया संज्ञेय अपराध के ठोस साक्ष्य मौजूद हैं। अभियुक्तों द्वारा आपराधिक कृत्य कारित किया जाना परिलक्षित होता है।`
      );
      setConcludingRecommendation(
        `अतः उक्त परिवाद में अभियोग (FIR) दर्ज कर सुसंगत भारतीय न्याय संहिता (BNS) की धाराओं में अन्वेषण पूर्ण कर न्यायालय में चालान प्रस्तुत करने के सादर आदेश फरमाए जाएं।\n\nरिपोर्ट सेवा में सादर प्रेषित है।`
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const writtenReport: PoliceWrittenFinalReport = {
      department,
      citizenName,
      citizenMobile,
      citizenAddress,
      complaintAllegations,
      reportDate,
      citizenSatisfaction,
      enquiryHeading,
      noticeAndStudyNarrative,
      previousComplaintsReference,
      respondentStatements,
      attachedDocumentsReference,
      complainantStatementNarrative,
      ioFindingsAndAnalysis,
      concludingRecommendation,
      officerSignatureName: officerName,
      officerSignatureRank: officerRank,
      officerStation: stationName,
      officerDate: reportDate
    };

    const briefSummary = `${ioFindingsAndAnalysis.slice(0, 180)}... [संस्तुति: ${concludingRecommendation.includes('दफ्तर दाखिल') ? 'दफ्तर दाखिल (Closure)' : 'अभियोग दर्ज/चालान (FIR/Chargesheet)'}]`;

    onForwardFinalReport(caseItem.id, briefSummary, writtenReport);
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  const totalAttachments = (caseItem.initialAttachments?.length || 0) + (caseItem.evidenceFiles?.length || 0);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-4xl w-full max-h-[96vh] flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-[#0c1a30] to-emerald-950 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                  अंतिम जांच आख्या प्रपत्र • Official Police Final Report
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  Ref: Attached Docs Auto-Linked
                </span>
              </div>
              <p className="text-xs text-slate-300">
                हरियाणा पुलिस परिवाद अंतिम आख्या (Haryana Police Written Format) • Docket: {caseItem.complaintNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="bg-slate-800 p-0.5 rounded-lg border border-slate-700 flex items-center text-xs">
              <button
                type="button"
                onClick={() => setActiveMode('DOCUMENT_VIEW')}
                className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  activeMode === 'DOCUMENT_VIEW'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  प्रपत्र दृश्य (Document View)
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('FORM_EDITOR')}
                className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  activeMode === 'FORM_EDITOR'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Edit3 className="h-3.5 w-3.5" />
                  संपादक (Editor)
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* SHO Directive Alert Callout */}
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 text-xs text-amber-950 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0" />
            <span>
              <strong>SHO Directive (थाना प्रभारी निर्देश): </strong>
              {caseItem.preliminaryEnquiry?.shoDemandNotes || caseItem.preliminaryEnquiry?.shoInstructions || 'सम्पूर्ण साक्ष्यों, संलग्न दस्तावेजों एवं बयानों के संदर्भ सहित लिखित अंतिम रिपोर्ट तैयार कर अग्रेषित करें।'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
            <span className="text-slate-500 font-medium hidden sm:inline">त्वरित प्रारूप (Quick Presets):</span>
            <button
              type="button"
              onClick={() => applyPreset('CIVIL_CLOSURE')}
              className="px-2 py-0.5 rounded bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold cursor-pointer"
              title="Set findings for civil money dispute / closure"
            >
              दफ्तर दाखिल (Closure)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('COGNIZABLE_FIR')}
              className="px-2 py-0.5 rounded bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold cursor-pointer"
              title="Set findings for cognizable offence / FIR recommendation"
            >
              चालान/FIR संस्तुति
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70">
          
          {activeMode === 'DOCUMENT_VIEW' ? (
            /* ==================== 1. OFFICIAL DOCUMENT FORMAT (LIKE ATTACHED PDF) ==================== */
            <div className="max-w-3xl mx-auto bg-white border-2 border-slate-800 p-6 sm:p-8 rounded-xl shadow-lg space-y-6 font-serif text-slate-950 printable-police-final-report">
              
              {/* Header Box */}
              <div className="border border-slate-900 divide-y divide-slate-900 text-xs sm:text-sm">
                
                {/* Department */}
                <div className="p-2 font-bold tracking-wider text-center uppercase bg-slate-50 flex items-center justify-between">
                  <span>{department}</span>
                  <span className="text-[11px] font-sans font-normal text-slate-600">हरियाणा पुलिस • अपराध अभिलेख</span>
                </div>

                {/* Citizen Detail Heading */}
                <div className="p-1.5 font-bold uppercase bg-slate-100 text-[11px] tracking-wide">
                  CITIZEN DETAIL-
                </div>

                {/* Name */}
                <div className="p-2 flex items-start gap-2">
                  <span className="font-bold shrink-0">NAME-</span>
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    className="w-full border-b border-dashed border-slate-300 focus:border-slate-800 outline-none font-medium bg-transparent"
                  />
                </div>

                {/* Mobile No */}
                <div className="p-2 flex items-center gap-2">
                  <span className="font-bold shrink-0">MOBILE NO.-</span>
                  <input
                    type="text"
                    value={citizenMobile}
                    onChange={(e) => setCitizenMobile(e.target.value)}
                    className="w-full border-b border-dashed border-slate-300 focus:border-slate-800 outline-none font-medium bg-transparent"
                  />
                </div>

                {/* Address */}
                <div className="p-2 flex items-start gap-2">
                  <span className="font-bold shrink-0">ADDRESS-</span>
                  <textarea
                    rows={2}
                    value={citizenAddress}
                    onChange={(e) => setCitizenAddress(e.target.value)}
                    className="w-full border-b border-dashed border-slate-300 focus:border-slate-800 outline-none font-medium bg-transparent resize-none"
                  />
                </div>

                {/* Allegations */}
                <div className="p-2 flex items-start gap-2">
                  <span className="font-bold shrink-0 text-slate-950">शिकायत मे लगाये गये आरोप-</span>
                  <textarea
                    rows={2}
                    value={complaintAllegations}
                    onChange={(e) => setComplaintAllegations(e.target.value)}
                    className="w-full border-b border-dashed border-slate-300 focus:border-slate-800 outline-none font-medium bg-transparent resize-none leading-relaxed"
                  />
                </div>

                {/* Date of Report */}
                <div className="p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">DATE OF REPORT-</span>
                    <input
                      type="text"
                      value={reportDate}
                      onChange={(e) => setReportDate(e.target.value)}
                      className="border-b border-dashed border-slate-300 focus:border-slate-800 outline-none font-medium w-28 bg-transparent"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 font-sans">थाना: {stationName}</span>
                </div>

                {/* Citizen Satisfaction */}
                <div className="p-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-bold">CITIZEN SATISFACTION-</span>
                    <div className="flex items-center gap-3 font-sans text-xs">
                      <label className="flex items-center gap-1 cursor-pointer font-bold">
                        <input
                          type="radio"
                          name="satisfaction"
                          checked={citizenSatisfaction === 'YES'}
                          onChange={() => setCitizenSatisfaction('YES')}
                        />
                        YES (संतुष्ट)
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer font-bold">
                        <input
                          type="radio"
                          name="satisfaction"
                          checked={citizenSatisfaction === 'NO'}
                          onChange={() => setCitizenSatisfaction('NO')}
                        />
                        NO (असंतुष्ट / लेन-देन विवाद)
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="satisfaction"
                          checked={citizenSatisfaction === 'PENDING'}
                          onChange={() => setCitizenSatisfaction('PENDING')}
                        />
                        PENDING
                      </label>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-sans">दौराने जांच फीडबैक</span>
                </div>

              </div>

              {/* Title Section */}
              <div className="text-center pt-2">
                <h3 className="font-bold text-sm sm:text-base underline uppercase tracking-wide">
                  {enquiryHeading}
                </h3>
              </div>

              {/* Report Body Paragraphs (Editable inline) */}
              <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-justify">
                
                {/* 1. Study of Complaint & Notices */}
                <div className="relative group">
                  <div className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>1. परिवाद अध्ययन व नोटिस तामील (Notice & Intake Narrative):</span>
                    <span className="opacity-0 group-hover:opacity-100 text-emerald-700">क्लिक करके संपादित करें (Click to edit)</span>
                  </div>
                  <textarea
                    rows={3}
                    value={noticeAndStudyNarrative}
                    onChange={(e) => setNoticeAndStudyNarrative(e.target.value)}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 p-2.5 rounded border border-transparent hover:border-slate-300 focus:border-slate-800 focus:bg-white outline-none leading-relaxed text-justify"
                  />
                </div>

                {/* 2. Previous Complaints Record */}
                <div className="relative group">
                  <div className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>2. पूर्व परिवादों का परीक्षण (Previous Complaints History):</span>
                    <span className="opacity-0 group-hover:opacity-100 text-emerald-700">क्लिक करके संपादित करें</span>
                  </div>
                  <textarea
                    rows={2}
                    value={previousComplaintsReference}
                    onChange={(e) => setPreviousComplaintsReference(e.target.value)}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 p-2.5 rounded border border-transparent hover:border-slate-300 focus:border-slate-800 focus:bg-white outline-none leading-relaxed text-justify"
                  />
                </div>

                {/* 3. Respondent Statements */}
                <div className="relative group">
                  <div className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>3. उत्तरवादी/विपक्षी पक्ष के बयान व पूछताछ (Respondent Statements & Confrontation):</span>
                    <span className="opacity-0 group-hover:opacity-100 text-emerald-700">क्लिक करके संपादित करें</span>
                  </div>
                  <textarea
                    rows={4}
                    value={respondentStatements}
                    onChange={(e) => setRespondentStatements(e.target.value)}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 p-2.5 rounded border border-transparent hover:border-slate-300 focus:border-slate-800 focus:bg-white outline-none leading-relaxed text-justify"
                  />
                </div>

                {/* 4. Attached Documents Reference (KEY REQUIREMENT: Auto taken from attached documents) */}
                <div className="relative group bg-emerald-50/30 p-2.5 rounded-lg border border-emerald-200/80">
                  <div className="text-[10px] font-sans font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Paperclip className="h-3 w-3" />
                      4. पत्रावली में संलग्न दस्तावेजों व साक्ष्यों का परीक्षण (Attached Documents & Evidence Reference):
                    </span>
                    <span className="text-emerald-700 font-normal">
                      {totalAttachments} दस्तावेज केस से स्वतः लिंक
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={attachedDocumentsReference}
                    onChange={(e) => setAttachedDocumentsReference(e.target.value)}
                    className="w-full bg-white p-2.5 rounded border border-emerald-300 focus:border-emerald-600 outline-none leading-relaxed text-justify text-xs text-slate-900"
                  />
                </div>

                {/* 5. Complainant Statements */}
                <div className="relative group">
                  <div className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>5. परिवादी के बयान व साक्ष्य प्रस्तुत करने का अवसर (Complainant Submission):</span>
                    <span className="opacity-0 group-hover:opacity-100 text-emerald-700">क्लिक करके संपादित करें</span>
                  </div>
                  <textarea
                    rows={3}
                    value={complainantStatementNarrative}
                    onChange={(e) => setComplainantStatementNarrative(e.target.value)}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 p-2.5 rounded border border-transparent hover:border-slate-300 focus:border-slate-800 focus:bg-white outline-none leading-relaxed text-justify"
                  />
                </div>

                {/* 6. Concluding Findings & Analysis of IO */}
                <div className="relative group bg-amber-50/40 p-2.5 rounded-lg border border-amber-200/80">
                  <div className="text-[10px] font-sans font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>6. जांच अधिकारी का अंतिम विश्लेषण व निष्कर्ष (IO Findings & Analysis):</span>
                    <span className="text-amber-800 font-normal">निष्कर्ष</span>
                  </div>
                  <textarea
                    rows={4}
                    value={ioFindingsAndAnalysis}
                    onChange={(e) => setIoFindingsAndAnalysis(e.target.value)}
                    className="w-full bg-white p-2.5 rounded border border-amber-300 focus:border-amber-600 outline-none leading-relaxed text-justify text-xs text-slate-950 font-medium"
                  />
                </div>

                {/* 7. Concluding Recommendation */}
                <div className="relative group bg-slate-50 p-2.5 rounded-lg border border-slate-300">
                  <div className="text-[10px] font-sans font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>7. अंतिम संस्तुति व प्रार्थना (Concluding Order Recommendation):</span>
                    <span className="text-slate-600">SHO संज्ञानार्थ</span>
                  </div>
                  <textarea
                    rows={3}
                    value={concludingRecommendation}
                    onChange={(e) => setConcludingRecommendation(e.target.value)}
                    className="w-full bg-white p-2.5 rounded border border-slate-400 focus:border-slate-800 outline-none leading-relaxed text-justify text-xs text-slate-950 font-bold"
                  />
                </div>

              </div>

              {/* Signature Block (Matching Page 3 of User Document) */}
              <div className="pt-6 border-t border-slate-300 flex items-end justify-between text-xs sm:text-sm">
                <div className="space-y-1">
                  <p className="font-bold">रिपोर्ट सेवा में पेश है।</p>
                  <p className="text-[11px] text-slate-500 font-sans">
                    प्रस्तुतकर्ता: हरियाणा पुलिस अन्वेषण इकाई
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <div className="h-10 border-b border-dashed border-slate-400 flex items-end justify-end pb-1">
                    <span className="font-serif italic text-slate-400 text-xs">[हस्ताक्षर / Signed Digitally]</span>
                  </div>
                  <p className="font-bold text-slate-950">{officerRank},</p>
                  <p className="text-slate-800">{stationName}।</p>
                  <p className="font-sans text-[11px] text-slate-600">दिनांक {reportDate}</p>
                </div>
              </div>

            </div>
          ) : (
            /* ==================== 2. FORM EDITOR MODE ==================== */
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Edit3 className="h-4 w-4 text-emerald-600" />
                  प्रपत्र विवरण संपादन (Edit Final Report Fields)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">विभागीय शीर्षक (Department)</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">रिपोर्ट दिनांक (Report Date)</label>
                    <input
                      type="text"
                      value={reportDate}
                      onChange={(e) => setReportDate(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-slate-800 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">परिवादी नाम व वल्दियत (Citizen Name & Parentage)</label>
                    <input
                      type="text"
                      value={citizenName}
                      onChange={(e) => setCitizenName(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">मोबाइल नंबर (Mobile No)</label>
                    <input
                      type="text"
                      value={citizenMobile}
                      onChange={(e) => setCitizenMobile(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-slate-800 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">परिवादी का पूरा पता (Citizen Address)</label>
                  <input
                    type="text"
                    value={citizenAddress}
                    onChange={(e) => setCitizenAddress(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">शिकायत में लगाए गए आरोप (Complaint Allegations)</label>
                  <textarea
                    rows={2}
                    value={complaintAllegations}
                    onChange={(e) => setComplaintAllegations(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-800 text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5 text-emerald-600" />
                      संलग्न दस्तावेजों व साक्ष्यों का संदर्भ (Attached Documents Reference)
                    </label>
                    <button
                      type="button"
                      onClick={() => setAttachedDocumentsReference(buildAttachedDocsReference())}
                      className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Re-Sync with Case Documents
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={attachedDocumentsReference}
                    onChange={(e) => setAttachedDocumentsReference(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-emerald-300 text-slate-900 text-xs font-serif leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">उत्तरवादी/विपक्षी के बयान (Respondent Statements)</label>
                  <textarea
                    rows={4}
                    value={respondentStatements}
                    onChange={(e) => setRespondentStatements(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-800 text-xs font-serif leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">परिवादी के बयान (Complainant Statement)</label>
                  <textarea
                    rows={3}
                    value={complainantStatementNarrative}
                    onChange={(e) => setComplainantStatementNarrative(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-800 text-xs font-serif leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1">जांच अधिकारी का अंतिम विश्लेषण व निष्कर्ष (IO Findings & Analysis)</label>
                  <textarea
                    rows={4}
                    value={ioFindingsAndAnalysis}
                    onChange={(e) => setIoFindingsAndAnalysis(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-amber-300 text-slate-900 text-xs font-serif leading-relaxed font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">अंतिम संस्तुति व प्रार्थना (Order Recommendation)</label>
                  <textarea
                    rows={3}
                    value={concludingRecommendation}
                    onChange={(e) => setConcludingRecommendation(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-400 text-slate-950 text-xs font-serif leading-relaxed font-bold"
                  />
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between shrink-0 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF (प्रिंट करें)</span>
            </button>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-600 hidden sm:inline">
              Officer: <strong>{officerName}</strong> ({officerRank})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-200 cursor-pointer"
            >
              Cancel (रद्द करें)
            </button>

            {/* SEND TO SHO BUTTON */}
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:from-emerald-700 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer border border-emerald-500 hover:shadow-xl"
            >
              <Send className="h-4 w-4" />
              <span>Submit to SHO (SHO को अंतिम आख्या भेजें)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
