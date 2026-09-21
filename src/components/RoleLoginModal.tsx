import React, { useState } from 'react';
import { UserRole, PoliceOfficer } from '../types';
import { POLICE_OFFICERS } from '../data/initialData';
import { X, Shield, User, Award, CheckCircle2, ChevronRight, FileSpreadsheet, Lock, Maximize2, Minimize2, MapPin, Briefcase } from 'lucide-react';

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
  const [isMaximized, setIsMaximized] = useState(false);

  if (!isOpen) return null;

  // IO Officers list: Kuldeep, Priyanka, Ramesh, Vikram
  const ioOfficers = POLICE_OFFICERS.filter((o) => o.role === 'IO');
  
  // SHO Officers list: Inspector Rajesh Hooda and SI Ravikant
  const shoOfficers = POLICE_OFFICERS.filter((o) => o.role === 'SHO');

  // SP & Admin
  const spOfficer = POLICE_OFFICERS.find((o) => o.role === 'SP') || POLICE_OFFICERS[6];
  const adminOfficer = POLICE_OFFICERS.find((o) => o.role === 'ADMIN') || POLICE_OFFICERS[7];

  const handleChooseOfficer = (role: UserRole, officer: PoliceOfficer) => {
    onSelectRole(role, officer);
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isMaximized ? 'p-0' : 'p-3 sm:p-4'} bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150`}>
      <div className={`bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-200 ${
        isMaximized ? 'w-full h-full max-w-none max-h-none rounded-none my-0' : 'max-w-4xl w-full rounded-2xl max-h-[94vh]'
      }`}>
        
        {/* Header */}
        <div className="bg-[#0c1a30] text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Switch Role & Active Officer / पद व अधिकारी बदलें
              </h2>
              <p className="text-xs text-slate-300">
                Select Investigating Officer (IO), Thana Incharge (SHO), District SP, or Administrator
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isMaximized ? "Restore Size" : "Maximize Screen"}
            >
              {isMaximized ? <Minimize2 className="h-4.5 w-4.5" /> : <Maximize2 className="h-4.5 w-4.5" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Current Active Officer Strip */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-5 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Currently Active:</span>
            <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-300 shadow-xs flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-amber-600" />
              {currentOfficer.name} ({currentRole})
            </span>
            <span className="text-slate-500 hidden sm:inline">• {currentOfficer.badgeNumber}</span>
          </div>
          {currentOfficer.jurisdictionLabel && (
            <span className="text-slate-600 bg-amber-50 border border-amber-200 text-[11px] font-medium px-2 py-0.5 rounded">
              Jurisdiction: {currentOfficer.jurisdictionLabel}
            </span>
          )}
        </div>

        {/* Roles & Officers Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          
          {/* 1. SHO SECTION (Rajesh Hooda - Karnal/Panipat & SI Ravikant - Faridabad/Gurugram) */}
          <div className="bg-white rounded-xl border-2 border-amber-200/80 p-4 sm:p-5 shadow-xs">
            <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                    SHO
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Station House Officer (S.H.O.) / थाना प्रभारी
                  </h3>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Complaints intake, verify & assign IO, approve FIR registration, review preliminary enquiries, and chargesheets.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                Select Jurisdiction SHO
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-3">
              {shoOfficers.map((officer) => {
                const isCurrent = currentRole === 'SHO' && currentOfficer.id === officer.id;
                const isRajesh = officer.id === 'sho-rajesh';

                return (
                  <div
                    key={officer.id}
                    onClick={() => handleChooseOfficer('SHO', officer)}
                    className={`relative p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                      isCurrent
                        ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20 shadow-md'
                        : 'border-slate-200 bg-white hover:border-amber-400 hover:bg-slate-50/90 shadow-xs'
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="h-3 w-3" /> Active SHO
                      </span>
                    )}

                    <div className="flex items-start gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border ${
                        isCurrent
                          ? 'bg-amber-600 text-white border-amber-700'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        {isRajesh ? 'RH' : 'RK'}
                      </div>
                      <div className="flex-1 min-w-0 pr-12">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {officer.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {officer.rank} • Badge: {officer.badgeNumber}
                        </p>
                      </div>
                    </div>

                    {/* Jurisdiction Pill */}
                    <div className="mt-3 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <MapPin className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        <span>Case Control: {officer.jurisdictionDistricts?.join(' & ')}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {isRajesh 
                          ? 'नियंत्रण: करनाल व पानीपत ज़िले के समस्त केस व थाने'
                          : 'नियंत्रण: फरीदाबाद व गुरुग्राम ज़िले के समस्त केस व थाने'}
                      </p>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Station: {officer.station.split('(')[0].trim()}</span>
                      <span className="font-semibold text-slate-700">{officer.activeCasesCount} cases</span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
                      <span>{isCurrent ? 'Currently Acting SHO' : 'Switch to this SHO'}</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. IO SECTION (Kuldeep, Priyanka, Ramesh, Vikram) */}
          <div className="bg-white rounded-xl border-2 border-blue-200/80 p-4 sm:p-5 shadow-xs">
            <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                    IO
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Investigating Officer (I.O.) / जांच अधिकारी
                  </h3>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Spot inspections, witness statements, daily Zimni diaries, evidence uploads, and chargesheet drafting.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                Select IO: Kuldeep / Priyanka / Ramesh / Vikram
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
              {ioOfficers.map((officer) => {
                const isCurrent = currentRole === 'IO' && currentOfficer.id === officer.id;
                
                // Short nickname for rapid identification
                let nickname = 'Vikram';
                if (officer.id === 'io-kuldeep') nickname = 'Kuldeep (कुलदीप)';
                else if (officer.id === 'io-priyanka') nickname = 'Priyanka (प्रियंका)';
                else if (officer.id === 'io-ramesh') nickname = 'Ramesh (रमेश)';
                else if (officer.id === 'io-vikram') nickname = 'Vikram (विक्रम)';

                return (
                  <div
                    key={officer.id}
                    onClick={() => handleChooseOfficer('IO', officer)}
                    className={`relative p-3 rounded-xl border-2 transition-all cursor-pointer text-left flex flex-col justify-between ${
                      isCurrent
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-md'
                        : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-slate-50/90 shadow-xs'
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-bold text-blue-800 bg-blue-200/80 px-1.5 py-0.5 rounded-full">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Active
                      </span>
                    )}

                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`h-7 w-7 rounded-md flex items-center justify-center font-bold text-xs shrink-0 border ${
                          isCurrent
                            ? 'bg-blue-600 text-white border-blue-700'
                            : 'bg-blue-100 text-blue-800 border-blue-200'
                        }`}>
                          IO
                        </div>
                        <span className="text-xs font-bold text-blue-900 truncate">
                          {nickname}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {officer.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {officer.badgeNumber} • {officer.rank}
                      </p>

                      <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200">
                        <div className="flex items-center gap-1 text-slate-700 font-medium">
                          <MapPin className="h-3 w-3 text-blue-600 shrink-0" />
                          <span className="truncate">{officer.station}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          District: {officer.jurisdictionDistricts?.[0] || 'Haryana'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-blue-700">
                      <span>{isCurrent ? 'Current IO' : 'Select IO'}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. SP & ADMIN SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SP / District Head */}
            <div
              onClick={() => handleChooseOfficer('SP', spOfficer)}
              className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer text-left bg-white ${
                currentRole === 'SP'
                  ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-md'
                  : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50/90 shadow-xs'
              }`}
            >
              {currentRole === 'SP' && (
                <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" /> Active SP
                </span>
              )}

              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                  SP
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Superintendent of Police (S.P.)
                </h3>
              </div>
              <p className="text-xs text-slate-600 mb-2.5">
                District supervisory oversight, statutory 60/90 days bail deadlines, challan sanction, and court trail monitoring.
              </p>

              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 text-xs">
                <p className="font-bold text-slate-800">{spOfficer.name}</p>
                <p className="text-[11px] text-slate-500">{spOfficer.station} • {spOfficer.badgeNumber}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span>{currentRole === 'SP' ? 'Currently Logged in as SP' : 'Switch to SP Role'}</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>

            {/* ADMIN */}
            <div
              onClick={() => handleChooseOfficer('ADMIN', adminOfficer)}
              className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer text-left bg-white ${
                currentRole === 'ADMIN'
                  ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-500/20 shadow-md'
                  : 'border-slate-200 hover:border-purple-400 hover:bg-slate-50/90 shadow-xs'
              }`}
            >
              {currentRole === 'ADMIN' && (
                <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold text-purple-800 bg-purple-200/80 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" /> Active Admin
                </span>
              )}

              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                  ADMIN
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  State IT Cell Administrator
                </h3>
              </div>
              <p className="text-xs text-slate-600 mb-2.5">
                Full statewide access across all ranges, stations roster, officer personnel directory, and system audit logs.
              </p>

              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 text-xs">
                <p className="font-bold text-slate-800">{adminOfficer.name}</p>
                <p className="text-[11px] text-slate-500">{adminOfficer.station} • {adminOfficer.badgeNumber}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700">
                <span>{currentRole === 'ADMIN' ? 'Currently Logged in as Admin' : 'Switch to Admin Role'}</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="bg-slate-100 px-5 sm:px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Active Command: <strong className="text-slate-800">{currentOfficer.name} ({currentRole})</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
