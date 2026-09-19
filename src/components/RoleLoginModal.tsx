import React from 'react';
import { UserRole, PoliceOfficer } from '../types';
import { POLICE_OFFICERS } from '../data/initialData';
import { X, Shield, User, Award, CheckCircle2, ChevronRight, FileSpreadsheet, Lock } from 'lucide-react';

interface RoleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  currentOfficer: PoliceOfficer;
  onSelectRole: (role: UserRole, officer: PoliceOfficer) => void;
}

export const RoleLoginModal: React.FC<RoleLoginModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  currentOfficer,
  onSelectRole
}) => {
  if (!isOpen) return null;

  const rolesConfig: Array<{
    role: UserRole;
    title: string;
    hindiTitle: string;
    description: string;
    defaultOfficerId: string;
    badgeColor: string;
    badgeBg: string;
    borderColor: string;
    keyPermissions: string[];
  }> = [
    {
      role: 'IO',
      title: 'Investigation Officer (I.O.)',
      hindiTitle: 'जांच अधिकारी (सब-इंस्पेक्टर / एएसआई)',
      description: 'Ground-level investigation: site visit inspection, witness & suspect statements, daily Zimni case diary, evidence collection, and drafting chargesheet.',
      defaultOfficerId: 'io-vikram',
      badgeColor: 'text-blue-700',
      badgeBg: 'bg-blue-100',
      borderColor: 'border-blue-300 hover:border-blue-500',
      keyPermissions: [
        'Record Mini Zimni & Full Zimni Diary',
        'Upload Crime Scene & Geo-tagged Evidence',
        'Record Witness Statements & Transcripts',
        'Recommend FIR or Case Closure',
        'Draft Chargesheet (Challan) for Court'
      ]
    },
    {
      role: 'SHO',
      title: 'Station House Officer (S.H.O.)',
      hindiTitle: 'थाना / चौकी प्रभारी (इंस्पेक्टर)',
      description: 'Thana & Chowki supervision: receives new complaints, assigns IO with priority and crime nature, converts Preliminary Enquiry into FIR, and handles IO transfers.',
      defaultOfficerId: 'sho-rajesh',
      badgeColor: 'text-amber-800',
      badgeBg: 'bg-amber-100',
      borderColor: 'border-amber-300 hover:border-amber-500',
      keyPermissions: [
        'New Complaint Intake & Verification',
        'Assign IO & Set Priority (Urgent/High)',
        'Order Preliminary Enquiry (PE)',
        'Approve/Reject FIR Registration',
        'Change / Reassign IO (Transfer/Medical)',
        'Review Chargesheet before SP Submission'
      ]
    },
    {
      role: 'SP',
      title: 'SP / District Head',
      hindiTitle: 'पुलिस अधीक्षक / ज़िला प्रमुख (आई.पी.एस.)',
      description: 'Complete District Supervisory Oversight: monitors all Police Stations & Chowkis, approves critical FIRs, enforces 60/90-day statutory deadlines, and approves Court Challans.',
      defaultOfficerId: 'sp-surender',
      badgeColor: 'text-emerald-800',
      badgeBg: 'bg-emerald-100',
      borderColor: 'border-emerald-300 hover:border-emerald-500',
      keyPermissions: [
        'District-wide Jurisdiction & Surveillance',
        'Monitor 60/90 Days Statutory Bail Deadlines',
        'Approve Chargesheet / Order Re-investigation',
        'Oversee Heinous Crime Special Units',
        'Court Trial & Final Disposal Review'
      ]
    },
    {
      role: 'ADMIN',
      title: 'System Administrator (IT Cell)',
      hindiTitle: 'सिस्टम व्यवस्थापक / आईटी सेल',
      description: 'App Administrator & Developer view: Manage Thana/Chowki rosters, personnel directory, system parameters, data reset, and complete audit trail.',
      defaultOfficerId: 'admin-haryanapolice',
      badgeColor: 'text-purple-800',
      badgeBg: 'bg-purple-100',
      borderColor: 'border-purple-300 hover:border-purple-500',
      keyPermissions: [
        'Manage Police Stations & Chowkis',
        'Staff Roster & Officer Transfers',
        'Global Case Registry & System Parameters',
        'Data Export & Reset Options'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#0c1a30] text-white px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Switch Active Police Role / भूमिका बदलें
              </h2>
              <p className="text-xs text-slate-300">
                Test the complete Haryana Police case lifecycle across all 4 command levels
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

        {/* Roles Grid */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/50">
          <p className="text-xs font-medium text-slate-600 mb-2">
            Select a designated role to simulate case handling, approvals, and field investigations:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rolesConfig.map((item) => {
              const isSelected = currentRole === item.role;
              const officer = POLICE_OFFICERS.find((o) => o.id === item.defaultOfficerId) || POLICE_OFFICERS[0];

              return (
                <div
                  key={item.role}
                  onClick={() => {
                    onSelectRole(item.role, officer);
                    onClose();
                  }}
                  className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer bg-white text-left ${
                    isSelected
                      ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                      : `${item.borderColor} hover:shadow-md hover:bg-slate-50/80`
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-3 right-3 flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Current
                    </span>
                  )}

                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${item.badgeBg} ${item.badgeColor} border`}>
                      {item.role}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-[11px] text-amber-700 font-medium mb-1">
                    {item.hindiTitle}
                  </p>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                    {item.description}
                  </p>

                  <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200/80 mb-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                      <span className="font-semibold flex items-center gap-1">
                        <User className="h-3 w-3 text-slate-500" />
                        {officer.name}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {officer.badgeNumber}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {officer.station}
                    </p>
                  </div>

                  {/* Permissions Checklist */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Authorized Actions:
                    </span>
                    <ul className="text-[11px] text-slate-600 space-y-0.5">
                      {item.keyPermissions.slice(0, 3).map((perm, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                          {perm}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-700 group">
                    <span>Select Role</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Logged in as: <strong className="text-slate-800">{currentOfficer.name} ({currentRole})</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
