import React from 'react';
import { UserRole, PoliceOfficer } from '../types';
import { Shield, Bell, PlusCircle, Search, UserCheck, ChevronDown, CheckCircle2, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  currentOfficer: PoliceOfficer;
  onOpenRoleModal: () => void;
  onOpenNewComplaintModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  pendingNotificationsCount: number;
  onOpenNotifications: () => void;
  selectedStationFilter: string;
  onStationFilterChange: (station: string) => void;
  stationsList: string[];
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  currentOfficer,
  onOpenRoleModal,
  onOpenNewComplaintModal,
  searchQuery,
  onSearchChange,
  pendingNotificationsCount,
  onOpenNotifications,
  selectedStationFilter,
  onStationFilterChange,
  stationsList
}) => {
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

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
              title="Notifications / Pending Actions"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              {pendingNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 bg-red-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-[#0c1a30] animate-pulse">
                  {pendingNotificationsCount}
                </span>
              )}
            </button>

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
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-medium">Jurisdiction / थाना:</span>
            <select
              value={selectedStationFilter}
              onChange={(e) => onStationFilterChange(e.target.value)}
              className="bg-slate-800/90 border border-slate-700 text-slate-200 rounded px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="ALL">All Stations & Chowkis (पूरा ज़िला / All)</option>
              {stationsList.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 text-slate-300 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              Karnal & Panipat Range
            </span>
            <span className="hidden md:flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-sky-400"></span>
              Gurugram & Faridabad Commissionerate
            </span>
            <span className="font-mono text-amber-300/90 hidden sm:inline">
              Officer: {currentOfficer.badgeNumber}
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
