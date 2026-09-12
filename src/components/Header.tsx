import React from 'react';
import { Activity, Cpu, FileText, Layers, Stethoscope, AlertTriangle, ShieldCheck, Lock, UserCheck } from 'lucide-react';
import { ClinicianProfile } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSimulating: boolean;
  setIsSimulating: (val: boolean) => void;
  riskScore: number;
  selectedScenarioId: string;
  onSelectScenario: (id: string) => void;
  currentClinician?: ClinicianProfile | null;
  onLockTerminal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isSimulating,
  setIsSimulating,
  riskScore,
  selectedScenarioId,
  currentClinician,
  onLockTerminal,
}) => {
  const getRiskColor = (score: number) => {
    if (score >= 70) return 'bg-rose-500/15 text-rose-600 border-rose-200';
    if (score >= 40) return 'bg-amber-500/15 text-amber-700 border-amber-200';
    return 'bg-emerald-500/15 text-emerald-700 border-emerald-200';
  };

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-50">
      {/* Top Banner: Medical & Hackathon Context */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
            NATIONAL LEVEL IDEATHON 5.0 | LIFE SCIENCES &amp; AI
          </span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-slate-300 font-medium hidden sm:inline">Team Helix Freaks (VIT Chennai)</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-cyan-400 border border-slate-700 hidden md:inline">
            Prototype Simulation Stage
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          {currentClinician && (
            <span className="text-cyan-300 font-mono hidden lg:inline">
              Clinician: <strong>{currentClinician.name}</strong> ({currentClinician.staffId})
            </span>
          )}
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
            {isSimulating ? 'In-Silico Stream (100 Hz)' : 'Simulation Paused'}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400 font-mono">Indicative BOM: &lt;$50 Target</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900">
                  HealSecure <span className="text-cyan-600">AI</span>
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                  Dual-Modal Sentinel
                </span>
              </div>
              <p className="text-xs text-slate-600 hidden lg:block font-medium">
                The Dual-Modal Sentinel for Post-Surgical Recovery &amp; NICU ADR Monitoring
              </p>
              <div className="hidden xl:flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded border border-slate-200">
                  Multimodal Sensing
                </span>
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 bg-cyan-50 text-cyan-800 rounded border border-cyan-200">
                  Explainable AI
                </span>
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                  Clinical Decision Support
                </span>
              </div>
            </div>
          </div>

          {/* Readmission Risk Status Badge */}
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${getRiskColor(riskScore)}`}>
              {riskScore >= 70 ? (
                <AlertTriangle className="w-4 h-4 text-rose-500 animate-bounce" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              )}
              <span>Readmission Risk: </span>
              <span className="font-mono font-bold text-sm">{Math.round(riskScore)}%</span>
            </div>

            {/* Telemetry Stream Toggle */}
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm flex items-center gap-1.5 ${
                isSimulating
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                  : 'bg-cyan-600 hover:bg-cyan-700 text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              {isSimulating ? 'Pause Stream' : 'Resume Stream'}
            </button>

            {/* Authenticated Clinical Staff Badge & Lock Terminal Action */}
            {currentClinician && (
              <div className="flex items-center gap-2.5 pl-2.5 border-l border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-300 flex items-center justify-center text-xs font-bold font-mono shadow-xs">
                    {currentClinician.avatarInitials}
                  </div>
                  <div className="hidden xl:block text-left">
                    <div className="text-xs font-bold text-slate-800 leading-tight">
                      {currentClinician.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono leading-tight">
                      {currentClinician.title}
                    </div>
                  </div>
                </div>

                <button
                  onClick={onLockTerminal}
                  title="Lock Terminal / Sign Out (Returns to Clinical Passkey Gate)"
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 hover:border-rose-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Lock Terminal</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 border-t border-slate-100 pt-1 -mb-px overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'simulation'
                ? 'border-cyan-600 text-cyan-700 bg-cyan-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-cyan-600" />
            1. Dual-Modal Simulation &amp; AI
          </button>

          <button
            onClick={() => setActiveTab('circuits')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'circuits'
                ? 'border-cyan-600 text-cyan-700 bg-cyan-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Cpu className="w-4 h-4 text-blue-600" />
            2. LTspice Circuit Schematics &amp; Netlists
          </button>

          <button
            onClick={() => setActiveTab('matlab')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'matlab'
                ? 'border-cyan-600 text-cyan-700 bg-cyan-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-600" />
            3. MATLAB Plotting Studio (.m)
          </button>

          <button
            onClick={() => setActiveTab('bom')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'bom'
                ? 'border-cyan-600 text-cyan-700 bg-cyan-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            4. Indicative Hardware BOM (&lt;$50 Target)
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'border-cyan-600 text-cyan-700 bg-cyan-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-600" />
            5. System Architecture &amp; Ideathon Deck
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-cyan-600 text-cyan-700 bg-cyan-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-cyan-600" />
            6. Secure Audit &amp; Data Integrity
          </button>
        </div>
      </div>
    </header>
  );
};
