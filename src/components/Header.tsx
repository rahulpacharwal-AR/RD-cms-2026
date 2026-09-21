import React, { useState, useRef, useEffect } from 'react';
import { UserRole, PoliceOfficer, PoliceCase } from '../types';
import {
  Shield, Bell, PlusCircle, Search, UserCheck, ChevronDown, CheckCircle2,
  AlertTriangle, X, FileText, UserPlus, Eye, Calendar, MapPin, Phone,
  Clock, ShieldAlert, ArrowRight, FileCheck2
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  currentOfficer: PoliceOfficer;
  onOpenRoleModal: () => void;
  onOpenNewComplaintModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  pendingNotificationsCount: number;
  pendingComplaints?: PoliceCase[];
  pendingIoAssignedCases?: PoliceCase[];
  pendingEnquiries?: PoliceCase[];
  pendingDemandedFinalReports?: PoliceCase[];
  pendingFinalReportsSubmitted?: PoliceCase[];
  onOpenCaseDossier?: (caseId: string) => void;
  onOpenAssignIO?: (caseItem: PoliceCase) => void;
  onAcceptCase?: (caseId: string) => void;
  onGenerateFIR?: (caseItem: PoliceCase) => void;
  onDemandFinalReport?: (caseId: string) => void;
  selectedStationFilter: string;
  onStationFilterChange: (station: string) => void;
  stationsList: string[];
  regionIOs?: PoliceOfficer[];
  selectedShoIOFilter?: string;
  onShoIOFilterChange?: (ioId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  currentOfficer,
  onOpenRoleModal,
  onOpenNewComplaintModal,
  searchQuery,
  onSearchChange,
  pendingNotificationsCount,
  pendingComplaints = [],
  pendingIoAssignedCases = [],
  pendingEnquiries = [],
  pendingDemandedFinalReports = [],
  pendingFinalReportsSubmitted = [],
  onOpenCaseDossier,
  onOpenAssignIO,
  onAcceptCase,
  onGenerateFIR,
  onDemandFinalReport,
  selectedStationFilter,
  onStationFilterChange,
  stationsList,
  regionIOs = [],
  selectedShoIOFilter = 'ALL',
  onShoIOFilterChange
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'IO':
        return 'bg-blue-600/20 text-blue-300 border-blue-400/30';
      case 'SHO':
        return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
      case 'SP':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
      case 'ADMIN':
        return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'IO':
        return 'Investigating Officer (I.O.)';
      case 'SHO':
        return 'SHO / Thana Incharge';
      case 'SP':
        return 'SP / District Head';
      case 'ADMIN':
        return 'State Police Administrator';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0c1a30] text-white border-b border-slate-700/60 shadow-lg backdrop-blur">
      {/* Top Police Branding Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-3">
          
          {/* Brand & Emblem */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 p-0.5 shadow-md flex items-center justify-center shrink-0 border border-amber-300/40">
              <div className="h-full w-full rounded-full bg-[#0c1a30] flex items-center justify-center">
                <Shield className="h-6 w-6 text-amber-400 drop-shadow" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                  HARYANA POLICE
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 text-[11px] font-semibold tracking-wider rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  CMS v3.4
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 font-medium tracking-wide">
                अपराध एवं मामला प्रबंधन प्रणाली • Seva Suraksha Sahyog
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search Complaint No, FIR No, Complainant, Accused, Section..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Actions & Role Switcher */}
          <div className="flex items-center gap-2.5">
            {/* New Complaint Intake Button */}
            <button
              onClick={onOpenNewComplaintModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md hover:shadow-amber-500/20 transition-all transform active:scale-95 cursor-pointer"
              title="Citizen Complaint Intake (MHC / Duty Officer)"
            >
              <PlusCircle className="h-4 w-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Register Complaint</span>
              <span className="sm:hidden">New</span>
            </button>

            {/* Notification Bell with Dropdown (Targeted for SHO and IO) */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsNotificationsOpen((prev) => !prev)}
                className={`relative p-2 rounded-lg border transition-colors cursor-pointer ${
                  isNotificationsOpen
                    ? 'bg-amber-500/20 border-amber-400/60 text-amber-300 ring-2 ring-amber-500/30'
                    : pendingNotificationsCount > 0
                    ? 'bg-slate-800 hover:bg-slate-750 border-amber-500/50 text-amber-300'
                    : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200 hover:text-white'
                }`}
                title={
                  currentRole === 'SHO'
                    ? `${pendingNotificationsCount} New Complaints Awaiting Verification & IO Assignment`
                    : currentRole === 'IO'
                    ? `${pendingNotificationsCount} New Case(s) Assigned to You by SHO Awaiting Acceptance`
                    : 'Notifications'
                }
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                {pendingNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 bg-red-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-[#0c1a30] animate-pulse shadow-sm">
                    {pendingNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 md:w-[440px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden text-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Dropdown Header */}
                  <div className="bg-[#081220] p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                        <Bell className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs sm:text-sm text-white">
                            {currentRole === 'SHO'
                              ? 'SHO Intake Notifications'
                              : currentRole === 'IO'
                              ? 'IO Investigation Assignments'
                              : 'System Notifications'}
                          </h4>
                          {(currentRole === 'SHO' || currentRole === 'IO') && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                              {pendingNotificationsCount} New
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {currentRole === 'SHO'
                            ? 'New citizen complaints awaiting verification & IO allocation'
                            : currentRole === 'IO'
                            ? 'New cases assigned to you by SHO awaiting acceptance'
                            : 'Notifications and operational updates'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsNotificationsOpen(false)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Dropdown Body */}
                  <div className="max-h-[390px] overflow-y-auto divide-y divide-slate-800/80 p-1">
                    {currentRole === 'SHO' ? (
                      pendingComplaints.length === 0 && pendingEnquiries.length === 0 && pendingFinalReportsSubmitted.length === 0 ? (
                        <div className="p-6 text-center space-y-2">
                          <div className="h-10 w-10 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                          <p className="text-xs font-semibold text-slate-300">All Caught Up!</p>
                          <p className="text-[11px] text-slate-500 max-w-[240px] mx-auto">
                            No pending unassigned complaints, enquiry reviews, or final reports in your police station. All cases are updated.
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Pending Final Reports Forwarded by IO */}
                          {pendingFinalReportsSubmitted.map((c) => (
                            <div
                              key={`final-${c.id}`}
                              className="p-3 sm:p-3.5 bg-emerald-950/30 hover:bg-emerald-950/40 border-l-2 border-emerald-500 transition-colors space-y-2.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="font-mono font-bold text-xs text-amber-400 block">
                                    {c.complaintNumber}
                                  </span>
                                  <div className="text-[11px] text-slate-300 mt-0.5">
                                    IO: <strong className="text-emerald-300">{c.currentIO.name}</strong> ({c.currentIO.rank})
                                  </div>
                                </div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white shrink-0 animate-pulse flex items-center gap-1">
                                  <FileCheck2 className="h-3 w-3" /> Final Report Submitted
                                </span>
                              </div>

                              <div className="text-xs space-y-1.5 bg-slate-950/60 p-2.5 rounded-lg border border-emerald-500/30">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-semibold text-slate-200 truncate">
                                    {c.complainant.name}
                                  </span>
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-800 text-emerald-300 shrink-0">
                                    {c.preliminaryEnquiry?.writtenFinalReport?.citizenSatisfaction === 'YES' ? 'संतुष्ट (Yes)' : 'दफ्तर दाखिल / लेन-देन'}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed italic">
                                  "{typeof c.preliminaryEnquiry?.finalReportDocketSummary === 'string' ? c.preliminaryEnquiry.finalReportDocketSummary : c.preliminaryEnquiry?.writtenFinalReport?.ioFindingsAndAnalysis || c.preliminaryEnquiry?.finalReportSummary || 'Official police written report submitted.'}"
                                </p>
                              </div>

                              <div className="pt-0.5">
                                <button
                                  onClick={() => {
                                    setIsNotificationsOpen(false);
                                    onOpenCaseDossier?.(c.id);
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  <span>View Written Final Report (अंतिम आख्या देखें)</span>
                                </button>
                              </div>
                            </div>
                          ))}

                          {/* Pending Enquiry Reports Submitted by IO */}
                          {pendingEnquiries.map((c) => (
                            <div
                              key={`enq-${c.id}`}
                              className="p-3 sm:p-3.5 bg-red-950/20 hover:bg-red-950/30 border-l-2 border-red-500 transition-colors space-y-2.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="font-mono font-bold text-xs text-amber-400 block">
                                    {c.complaintNumber}
                                  </span>
                                  <div className="text-[11px] text-slate-300 mt-0.5">
                                    IO: <strong className="text-amber-300">{c.currentIO.name}</strong> ({c.currentIO.rank})
                                  </div>
                                </div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white shrink-0 animate-pulse">
                                  Enquiry Report Ready
                                </span>
                              </div>

                              <div className="text-xs space-y-1.5 bg-slate-950/60 p-2.5 rounded-lg border border-red-500/30">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-semibold text-slate-200">
                                    {c.complainant.name}
                                  </span>
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-800 text-amber-300">
                                    Rec: {c.preliminaryEnquiry?.recommendation}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed italic">
                                  "{typeof c.preliminaryEnquiry?.ioFinalRemarks === 'string' ? c.preliminaryEnquiry.ioFinalRemarks : (c.preliminaryEnquiry?.ioFinalRemarks as any)?.remarksNarrative || c.preliminaryEnquiry?.enquirySummary || 'Enquiry report prepared and submitted for review.'}"
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-2 pt-0.5">
                                <button
                                  onClick={() => {
                                    setIsNotificationsOpen(false);
                                    onGenerateFIR?.(c);
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>1. Generate FIR</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setIsNotificationsOpen(false);
                                    onDemandFinalReport?.(c.id);
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  <span>2. Ask Final Report</span>
                                </button>
                              </div>
                            </div>
                          ))}

                          {/* Fresh Unassigned Complaints */}
                          {pendingComplaints.map((c) => (
                            <div
                              key={c.id}
                              className="p-3 sm:p-3.5 hover:bg-slate-800/60 transition-colors space-y-2.5"
                            >
                              {/* Docket Number & Station */}
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="font-mono font-bold text-xs text-amber-400 block">
                                    {c.complaintNumber}
                                  </span>
                                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                                    <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                                    <span className="truncate">{c.policeStation}</span>
                                  </div>
                                </div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 shrink-0">
                                  Fresh Complaint
                                </span>
                              </div>

                              {/* Complainant & Incident Preview */}
                              <div className="text-xs space-y-1 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-semibold text-slate-200">
                                    {c.complainant.name}
                                    {c.complainant.fatherMotherName ? ` (s/o ${c.complainant.fatherMotherName})` : ''}
                                  </span>
                                  <span className="font-mono text-slate-400">{c.complainant.mobile}</span>
                                </div>
                                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                                  {c.incidentNarrative}
                                </p>
                                {c.suspects && c.suspects.length > 0 && (
                                  <p className="text-[10px] text-amber-300/80 font-medium pt-0.5">
                                    Suspect: {c.suspects.map((s) => s.name).join(', ')}
                                  </p>
                                )}
                                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                                  <span>{c.incidentDate} at {c.incidentTime}</span>
                                  <span>{c.initialAttachments?.length || 0} Exhibits attached</span>
                                </div>
                              </div>

                              {/* Direct Action Buttons for SHO */}
                              <div className="grid grid-cols-2 gap-2 pt-0.5">
                                <button
                                  onClick={() => {
                                    setIsNotificationsOpen(false);
                                    onOpenCaseDossier?.(c.id);
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
                                >
                                  <Eye className="h-3.5 w-3.5 text-slate-400" />
                                  <span>View Case Detail</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setIsNotificationsOpen(false);
                                    onOpenAssignIO?.(c);
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                                >
                                  <UserPlus className="h-3.5 w-3.5" />
                                  <span>Verify & Assign IO</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </>
                      )
                    ) : currentRole === 'IO' ? (
                      /* IO Role: Cases newly assigned by SHO awaiting acceptance AND Demanded Final Reports */
                      pendingIoAssignedCases.length === 0 && pendingDemandedFinalReports.length === 0 ? (
                        <div className="p-6 text-center space-y-2">
                          <div className="h-10 w-10 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                          <p className="text-xs font-semibold text-slate-300">No Pending Tasks!</p>
                          <p className="text-[11px] text-slate-400 max-w-[250px] mx-auto">
                            All cases assigned to you have been accepted and no final report orders are pending. Check your <strong className="text-amber-300">My Cases</strong> tab to manage active investigations.
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Demanded Final Reports from SHO */}
                          {pendingDemandedFinalReports.map((c) => (
                            <div
                              key={`dem-${c.id}`}
                              className="p-3 sm:p-3.5 bg-amber-950/20 hover:bg-amber-950/30 border-l-2 border-amber-500 transition-colors space-y-2.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="font-mono font-bold text-xs text-amber-400 block">
                                    {c.complaintNumber}
                                  </span>
                                  <div className="text-[11px] text-slate-400 mt-0.5">
                                    Complainant: {c.complainant.name}
                                  </div>
                                </div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-white shrink-0 animate-pulse">
                                  SHO Asked Final Report
                                </span>
                              </div>

                              <div className="text-xs space-y-1 bg-slate-950/60 p-2.5 rounded-lg border border-amber-500/30">
                                <p className="text-[11px] text-amber-200 italic">
                                  "{c.preliminaryEnquiry?.shoDemandNotes || 'SHO has ordered submission of final report / chargesheet.'}"
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-2 pt-0.5">
                                <button
                                  onClick={() => {
                                    setIsNotificationsOpen(false);
                                    onOpenCaseDossier?.(c.id);
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
                                >
                                  <Eye className="h-3.5 w-3.5 text-slate-400" />
                                  <span>Open Docket</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setIsNotificationsOpen(false);
                                    onOpenCaseDossier?.(c.id);
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>Forward Report</span>
                                </button>
                              </div>
                            </div>
                          ))}

                          {/* Newly Assigned Cases */}
                          {pendingIoAssignedCases.map((c) => (
                            <div
                              key={c.id}
                              className="p-3 sm:p-3.5 hover:bg-slate-800/60 transition-colors space-y-2.5"
                            >
                              {/* Docket Number & Station */}
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="font-mono font-bold text-xs text-amber-400 block">
                                    {c.complaintNumber}
                                  </span>
                                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                                    <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                                    <span className="truncate">{c.policeStation}</span>
                                  </div>
                                </div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                  New Case Assigned
                                </span>
                              </div>

                              {/* Complainant & Details Preview */}
                              <div className="text-xs space-y-1 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-semibold text-slate-200">
                                    {c.complainant.name}
                                    {c.complainant.fatherMotherName ? ` (s/o ${c.complainant.fatherMotherName})` : ''}
                                  </span>
                                  <span className="font-mono text-slate-400">{c.complainant.mobile}</span>
                                </div>
                                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                                  {c.incidentNarrative}
                                </p>
                                {c.ioAcceptance?.shoInstructions && (
                                  <div className="p-2 rounded bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200 mt-1">
                                    <strong className="text-amber-300">SHO Directives:</strong> "{c.ioAcceptance.shoInstructions}"
                                  </div>
                                )}
                                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                                  <span>Assigned by: {c.ioAcceptance?.assignedBySHO || 'SHO'}</span>
                                  <span className="text-amber-400 font-semibold">{c.priority} Priority</span>
                                </div>
                              </div>

                              {/* Direct Action Buttons for IO: View and Accept */}
                              <div className="grid grid-cols-2 gap-2 pt-0.5">
                                <button
                                  onClick={() => {
                                    setIsNotificationsOpen(false);
                                    onOpenCaseDossier?.(c.id);
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
                                >
                                  <Eye className="h-3.5 w-3.5 text-slate-400" />
                                  <span>View Case Detail</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setIsNotificationsOpen(false);
                                    onAcceptCase?.(c.id);
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>Accept Case (स्वीकार करें)</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </>
                      )
                    ) : (
                      /* Non-SHO/IO Role explanation */
                      <div className="p-5 text-center space-y-3">
                        <div className="h-10 w-10 mx-auto rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
                          <ShieldAlert className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-200">
                            Workflow Notifications
                          </p>
                          <p className="text-[11px] text-slate-400 leading-relaxed max-w-[280px] mx-auto">
                            Complaints are sent to SHO for verification & IO assignment. Once assigned, notifications are routed to the specific Investigating Officer (IO) to accept the docket.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setIsNotificationsOpen(false);
                            onOpenRoleModal();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Switch Role</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  {currentRole === 'SHO' && pendingComplaints.length > 0 && (
                    <div className="bg-[#081220] p-2.5 border-t border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400">
                        Total {pendingComplaints.length} complaint(s) awaiting your decision
                      </span>
                    </div>
                  )}
                  {currentRole === 'IO' && pendingIoAssignedCases.length > 0 && (
                    <div className="bg-[#081220] p-2.5 border-t border-slate-800 text-center">
                      <span className="text-[10px] text-emerald-300">
                        Total {pendingIoAssignedCases.length} new case(s) waiting for your formal acceptance
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Officer & Role Profile Button */}
            <button
              onClick={onOpenRoleModal}
              className="flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-750 border border-slate-700 text-left transition-all group cursor-pointer"
              title="Click to Switch Role (IO / SHO / SP / ADMIN)"
            >
              <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600 text-amber-300">
                <UserCheck className="h-4 w-4" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
                    {currentOfficer.name}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${getRoleBadgeStyle(currentRole)}`}>
                    {currentRole}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                  {getRoleLabel(currentRole)}
                </p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-200 transition-transform" />
            </button>
          </div>
        </div>

        {/* Sub-bar: Filter by Police Station / Chowki & Mobile Search */}
        <div className="py-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Jurisdiction / थाना:</span>
              <select
                value={selectedStationFilter}
                onChange={(e) => onStationFilterChange(e.target.value)}
                className="bg-slate-800/90 border border-slate-700 text-slate-200 rounded px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                <option value="ALL">All Stations & Chowkis (पूरा ज़िला / All)</option>
                {stationsList.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* SHO Region IO Selector */}
            {currentRole === 'SHO' && regionIOs.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-semibold">IO (जांच अधिकारी):</span>
                <select
                  value={selectedShoIOFilter}
                  onChange={(e) => onShoIOFilterChange?.(e.target.value)}
                  className="bg-slate-800/90 border border-amber-500/60 text-amber-200 font-medium rounded px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                >
                  <option value="ALL">All IOs in Region (सभी जांच अधिकारी)</option>
                  {regionIOs.map((io) => (
                    <option key={io.id} value={io.id}>
                      {io.rank} {io.name} • {io.station.split('(')[0].trim()}
                    </option>
                  ))}
                  <option value="UNASSIGNED">Unassigned Complaints (अनाबंटित)</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 text-slate-300 text-[11px] flex-wrap">
            {currentOfficer.jurisdictionLabel ? (
              <span className="flex items-center gap-1.5 font-medium px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                <span className="text-slate-300">Jurisdiction:</span>
                <strong className="text-amber-300">{currentOfficer.jurisdictionLabel}</strong>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 font-medium px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700">
                <span className="h-2 w-2 rounded-full bg-sky-400"></span>
                <span className="text-slate-300">{currentOfficer.station}</span>
              </span>
            )}
            <span className="font-mono text-amber-300/90 hidden sm:inline px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700">
              Badge: {currentOfficer.badgeNumber}
            </span>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="pb-2.5 lg:hidden">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search complaint, FIR, section, accused..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-800 border border-slate-700 rounded-md text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

      </div>
    </header>
  );
};
