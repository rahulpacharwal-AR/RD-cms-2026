import React, { useState } from 'react';
import { PoliceCase, PreliminaryEnquiry } from '../types';
import {
  X, Send, ShieldAlert, CheckCircle2, AlertTriangle, FileText,
  HelpCircle, User, Scale, BookOpen, AlertCircle
} from 'lucide-react';

interface SubmitEnquiryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: PoliceCase | null;
  onSubmitReport: (caseId: string, enquiryReport: PreliminaryEnquiry) => void;
  currentOfficerName: string;
  currentOfficerRank: string;
  currentOfficerPhone: string;
}

const QUICK_FINDING_PRESETS = [
  {
    label: 'Cognizable & Genuine (FIR Recommended)',
    cognizable: true,
    genuineness: 'GENUINE' as const,
    recommendation: 'RECOMMEND_FIR' as const,
    sections: 'BNS 303(2), BNS 318(4)',
    text: 'मौका मुआयना, गवाहों के बयान व उपलब्ध सीसीटीवी/तकनीकी साक्ष्य से प्रथम दृष्टया संज्ञेय अपराध घटित होना पाया गया है। आरोपी के विरुद्ध अपराध प्रमाणित होता है। अतः नियमित FIR दर्ज कर विधिवत विवेचना प्रारंभ करने की संस्तुति की जाती है।'
  },
  {
    label: 'Civil Dispute (Closure Recommended)',
    cognizable: false,
    genuineness: 'CIVIL_NATURE' as const,
    recommendation: 'RECOMMEND_CLOSURE' as const,
    sections: '',
    text: 'जांच से पाया गया कि यह मामला पूर्णतः आपसी व्यापारिक लेनदेन एवं सिविल अनुबंध के उल्लंघन का है। इसमें कोई आपराधिक षड्यंत्र या संज्ञेय अपराध नहीं पाया गया। शिकायत को सिविल प्रकृति का मानकर नस्तीबद्ध करने की संस्तुति की जाती है।'
  },
  {
    label: 'False / Malicious (Closure Recommended)',
    cognizable: false,
    genuineness: 'FALSE_REPORT' as const,
    recommendation: 'RECOMMEND_CLOSURE' as const,
    sections: '',
    text: 'शिकायतकर्ता द्वारा लगाए गए आरोप निराधार व रंजिशन पाए गए। संदिग्ध की उपस्थिति के सीसीटीवी एवं कॉल डिटेल से अपराध के समय अन्यत्र होना पुष्ट हुआ। शिकायत को झूठी व निराधार मानकर निरस्त करने की संस्तुति की जाती है।'
  }
];

export const SubmitEnquiryReportModal: React.FC<SubmitEnquiryReportModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  onSubmitReport,
  currentOfficerName,
  currentOfficerRank,
  currentOfficerPhone
}) => {
  const existing = caseItem?.preliminaryEnquiry;

  const [isCognizable, setIsCognizable] = useState<boolean>(
    existing ? existing.isCognizable : true
  );
  const [genuinenessStatus, setGenuinenessStatus] = useState<'GENUINE' | 'DOUBTFUL' | 'CIVIL_NATURE' | 'FALSE_REPORT'>(
    (existing?.genuinenessStatus as any) || 'GENUINE'
  );
  const [recommendation, setRecommendation] = useState<'RECOMMEND_FIR' | 'RECOMMEND_CLOSURE' | 'FURTHER_ENQUIRY_NEEDED'>(
    existing?.recommendation || 'RECOMMEND_FIR'
  );
  const [suggestedSections, setSuggestedSections] = useState<string>(
    existing?.suggestedSections || 'BNS 303(2), BNS 318(4)'
  );
  const [ioFinalRemarks, setIoFinalRemarks] = useState<string>(
    typeof existing?.ioFinalRemarks === 'string'
      ? existing.ioFinalRemarks
      : (existing?.ioFinalRemarks as any)?.remarksNarrative || existing?.enquirySummary || ''
  );
  const [closureReason, setClosureReason] = useState<string>(
    existing?.closureReason || ''
  );

  if (!isOpen || !caseItem) return null;

  const applyPreset = (preset: typeof QUICK_FINDING_PRESETS[0]) => {
    setIsCognizable(preset.cognizable);
    setGenuinenessStatus(preset.genuineness);
    setRecommendation(preset.recommendation);
    if (preset.sections) setSuggestedSections(preset.sections);
    setIoFinalRemarks(preset.text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ioFinalRemarks.trim()) {
      alert('Please enter IO final words / concluding findings.');
      return;
    }

    const compiledEnquiry: PreliminaryEnquiry = {
      assignedToIO: existing?.assignedToIO || {
        id: caseItem.currentIO.id,
        name: currentOfficerName || caseItem.currentIO.name,
        rank: currentOfficerRank || caseItem.currentIO.rank,
        phone: currentOfficerPhone || caseItem.currentIO.phone,
        assignedDate: new Date().toISOString().split('T')[0]
      },
      siteVisitDate: existing?.siteVisitDate || new Date().toISOString().split('T')[0],
      siteVisitLocation: existing?.siteVisitLocation || caseItem.incidentLocation,
      siteVisitObservations: existing?.siteVisitObservations || ioFinalRemarks.trim(),
      isCognizable,
      genuinenessStatus,
      enquirySummary: ioFinalRemarks.trim(),
      recommendation,
      recommendationDate: new Date().toISOString().split('T')[0],
      ioFinalRemarks: ioFinalRemarks.trim(),
      suggestedSections: isCognizable && recommendation === 'RECOMMEND_FIR' ? suggestedSections.trim() : undefined,
      closureReason: recommendation === 'RECOMMEND_CLOSURE' ? (closureReason.trim() || ioFinalRemarks.trim()) : undefined,
      submittedAt: new Date().toLocaleString(),
      submittedByOfficer: `${currentOfficerName || caseItem.currentIO.name} (${currentOfficerRank || caseItem.currentIO.rank})`,
      shoActionRequested: 'PENDING_SHO_REVIEW'
    };

    onSubmitReport(caseItem.id, compiledEnquiry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header - Red / Crimson Police Dossier style */}
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-[#0c1a30] text-white px-6 py-4 flex items-center justify-between border-b border-red-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-300">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Submit IO Enquiry Findings to SHO
                <span className="text-xs bg-red-800/80 text-red-200 px-2 py-0.5 rounded border border-red-700">
                  जांच निष्कर्ष व अंतिम आख्या
                </span>
              </h2>
              <p className="text-xs text-red-200">
                Complaint No: <strong className="text-white font-mono">{caseItem.complaintNumber}</strong> • {caseItem.policeStation}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-red-800/50 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Informational banner */}
        <div className="bg-red-50 border-b border-red-200 px-6 py-2.5 text-xs text-red-900 flex items-center gap-2 shrink-0">
          <AlertCircle className="h-4 w-4 text-red-700 shrink-0" />
          <span>
            Upon submission, an instant alert will be dispatched to <strong>SHO {caseItem.policeStation}</strong> with your final words. The SHO will decide whether to register an FIR or demand the complete Final Report/Chargesheet.
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 bg-slate-50/50">
          
          {/* Quick presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <span>Quick Standard Presets (त्वरित मानक निष्कर्ष):</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_FINDING_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-red-50 hover:border-red-300 border border-slate-200 text-[11px] font-medium text-slate-700 transition-colors text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>⚡</span> {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question 1: Is Offence Cognizable? */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-red-600" />
                1. Is the Allegation Cognizable? (क्या संज्ञेय अपराध बनता है?) *
              </label>
              <span className="text-[10px] text-slate-500">Police authority under BNSS 173</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsCognizable(true)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                  isCognizable
                    ? 'border-red-600 bg-red-50/70 ring-2 ring-red-500/20 text-red-950 font-bold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="cognizable"
                  checked={isCognizable}
                  onChange={() => setIsCognizable(true)}
                  className="mt-0.5 text-red-600 focus:ring-red-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">YES - Cognizable (संज्ञेय अपराध)</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Police has direct authority to investigate & register FIR
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsCognizable(false)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                  !isCognizable
                    ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20 text-amber-950 font-bold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="cognizable"
                  checked={!isCognizable}
                  onChange={() => setIsCognizable(false)}
                  className="mt-0.5 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">NO - Non-Cognizable / Civil (असंज्ञेय / दीवानी)</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    NCR / Civil nature / Police intervention not permissible
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Question 2: Genuineness Status */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <label className="block text-xs font-bold text-slate-900">
              2. Genuineness of Complaint (शिकायत की सत्यता / वास्तविकता) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'GENUINE', label: 'Genuine & True', hindi: 'सत्य व प्रमाणिक', color: 'border-emerald-500 bg-emerald-50 text-emerald-900' },
                { key: 'CIVIL_NATURE', label: 'Civil Dispute', hindi: 'दीवानी / आपसी विवाद', color: 'border-blue-500 bg-blue-50 text-blue-900' },
                { key: 'FALSE_REPORT', label: 'False / Malicious', hindi: 'झूठी व दुर्भावनापूर्ण', color: 'border-red-500 bg-red-50 text-red-900' },
                { key: 'DOUBTFUL', label: 'Doubtful Evidence', hindi: 'संदेहास्पद / साक्ष्य अभाव', color: 'border-amber-500 bg-amber-50 text-amber-900' }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setGenuinenessStatus(item.key as any)}
                  className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                    genuinenessStatus === item.key
                      ? `${item.color} font-bold ring-2 ring-red-500/20`
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">{item.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{item.hindi}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Question 3: IO Recommendation / Suggestion on FIR */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <label className="block text-xs font-bold text-slate-900">
              3. IO Suggestion on FIR Registration (FIR दर्ज करने पर जांच अधिकारी का स्पष्ट सुझाव) *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRecommendation('RECOMMEND_FIR')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  recommendation === 'RECOMMEND_FIR'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  FIR Recommended
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  FIR दर्ज करने की संस्तुति (Cognizable offence established)
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRecommendation('RECOMMEND_CLOSURE')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  recommendation === 'RECOMMEND_CLOSURE'
                    ? 'border-red-600 bg-red-50 text-red-950 font-bold ring-2 ring-red-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                  <X className="h-4 w-4 text-red-600" />
                  Closure / Dismissal
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  शिकायत नस्तीबद्ध/बंद करने की संस्तुति (False/Civil dispute)
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRecommendation('FURTHER_ENQUIRY_NEEDED')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  recommendation === 'FURTHER_ENQUIRY_NEEDED'
                    ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Further Enquiry
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  अतिरिक्त जांच/तकनीकी साक्ष्य अपेक्षित (FSL/CDR pending)
                </p>
              </button>
            </div>
          </div>

          {/* Suggested Sections (Only if recommending FIR) */}
          {recommendation === 'RECOMMEND_FIR' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Suggested Sections under BNS / Special Acts (सुझाई गई कानूनी धाराएं) *
              </label>
              <input
                type="text"
                required
                value={suggestedSections}
                onChange={(e) => setSuggestedSections(e.target.value)}
                placeholder="e.g. BNS 303(2), BNS 318(4), BNS 115(2), IT Act 66D"
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-800 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
              />
              <div className="mt-1 flex flex-wrap gap-1">
                {['BNS 303(2) (Theft)', 'BNS 318(4) (Cheating)', 'BNS 115(2) (Hurt)', 'BNS 351(2) (Threat)', 'IT Act 66D (Cyber)'].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => {
                      if (!suggestedSections.includes(sec.split(' ')[0])) {
                        setSuggestedSections(suggestedSections ? `${suggestedSections}, ${sec}` : sec);
                      }
                    }}
                    className="px-2 py-0.5 rounded bg-slate-200/70 hover:bg-slate-300 text-[10px] text-slate-700"
                  >
                    + {sec}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Final Words / Remarks of IO */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-900">
                Final Words & Concluding Remarks of IO (जांच अधिकारी के अंतिम शब्द व स्पष्ट निष्कर्ष) *
              </label>
              <span className="text-[10px] text-red-600 font-semibold">Mandatory for SHO's perusal</span>
            </div>
            <textarea
              rows={4}
              required
              value={ioFinalRemarks}
              onChange={(e) => setIoFinalRemarks(e.target.value)}
              placeholder="जांच में पाए गए मुख्य तथ्य, साक्ष्य एवं निष्कर्ष का संक्षेप लिखें जिससे SHO निर्णय ले सकें..."
              className="w-full text-xs bg-white border border-slate-300 rounded-xl p-3 text-slate-800 leading-relaxed focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none font-serif"
            ></textarea>
          </div>

          {/* Officer signature line */}
          <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-700 flex items-center justify-between border border-slate-200">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              <div>
                <span>Submitting Investigating Officer: </span>
                <strong className="text-slate-900">{currentOfficerName || caseItem.currentIO.name}</strong> ({currentOfficerRank || caseItem.currentIO.rank})
              </div>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Thana: {caseItem.policeStation}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
            >
              Cancel (रद्द करें)
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer border border-red-500"
            >
              <Send className="h-4 w-4" />
              <span>Submit Findings to SHO (SHO को निष्कर्ष प्रेषित करें)</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
