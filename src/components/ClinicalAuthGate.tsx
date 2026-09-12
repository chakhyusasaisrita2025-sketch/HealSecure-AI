import React, { useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  Lock,
  Stethoscope,
  Building2,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Fingerprint,
  CheckCircle2,
  Info,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { ClinicianProfile, ClinicalSession } from '../types';
import { AUTHORIZED_CLINICIANS, verifyClinicalPasskey } from '../data/clinicianData';

interface ClinicalAuthGateProps {
  onAuthenticated: (session: ClinicalSession) => void;
}

export const ClinicalAuthGate: React.FC<ClinicalAuthGateProps> = ({ onAuthenticated }) => {
  const [passkeyInput, setPasskeyInput] = useState<string>('');
  const [showPasskey, setShowPasskey] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [selectedClinicianId, setSelectedClinicianId] = useState<string | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (!passkeyInput.trim()) {
      setErrorMessage('Please enter an authorized clinical passkey to access bedside telemetry.');
      return;
    }

    setIsVerifying(true);

    // Simulate verification delay for realism
    setTimeout(() => {
      const match = verifyClinicalPasskey(passkeyInput);
      setIsVerifying(false);

      if (match) {
        const session: ClinicalSession = {
          clinician: match,
          authenticatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          terminalId: 'NICU-STATION-04',
        };
        onAuthenticated(session);
      } else {
        setErrorMessage(
          'Access Denied: Unrecognized Clinical Passkey. Only authorized hospital personnel with registered bedside credentials may enter.'
        );
      }
    }, 350);
  };

  const handleSelectBadge = (clinician: ClinicianProfile) => {
    setSelectedClinicianId(clinician.id);
    setPasskeyInput(clinician.passkey);
    setErrorMessage(null);
  };

  const handleQuickSignIn = (clinician: ClinicianProfile) => {
    setSelectedClinicianId(clinician.id);
    setPasskeyInput(clinician.passkey);
    setErrorMessage(null);
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      const session: ClinicalSession = {
        clinician,
        authenticatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        terminalId: 'NICU-STATION-04',
      };
      onAuthenticated(session);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between p-4 sm:p-6 lg:p-8 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white relative overflow-hidden">
      {/* Background ambient medical grid motif */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Top Clinical Header Bar */}
      <header className="max-w-5xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800/80 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-cyan-600/20">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">HealSecure AI</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-cyan-950 text-cyan-300 rounded border border-cyan-800">
                CLINICAL GATEWAY
              </span>
            </div>
            <p className="text-xs text-slate-400">
              The Dual-Modal Sentinel for Post-Surgical Recovery &amp; NICU ADR Monitoring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/80">
          <Building2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Station: <strong className="text-slate-200">NICU-WS-04</strong></span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Gateway Online
          </span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="max-w-4xl w-full mx-auto my-6 relative z-10">
        <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
          {/* Access Warning Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 border-b border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider font-bold mb-1">
                <Lock className="w-4 h-4" />
                RESTRICTED CLINICAL ACCESS
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Clinical Personnel Passkey Sign-In
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                This system contains real-time post-surgical biosensing telemetry and algorithmic risk scores. Access is restricted to credentialed clinical staff.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-700/80 rounded-xl p-3 text-right hidden sm:block">
              <div className="text-[10px] uppercase font-mono text-slate-400">Security Standard</div>
              <div className="text-xs font-bold text-cyan-300 font-mono flex items-center justify-end gap-1.5 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Passkey Verification
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Primary Passkey Input Form */}
            <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
              <div>
                <label
                  htmlFor="clinical-passkey-input"
                  className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-bold mb-2 flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-cyan-400" />
                    Enter Clinical Passkey / Badge Code
                  </span>
                  <span className="text-[11px] font-normal text-slate-400 lowercase">
                    case-insensitive
                  </span>
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Fingerprint className="w-5 h-5 text-cyan-400/80" />
                  </div>
                  <input
                    id="clinical-passkey-input"
                    type={showPasskey ? 'text' : 'password'}
                    value={passkeyInput}
                    onChange={(e) => {
                      setPasskeyInput(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="e.g. NICU-8831 or SURG-4209"
                    className="w-full pl-11 pr-24 py-3.5 bg-slate-950 border border-slate-600 rounded-xl text-white placeholder-slate-500 font-mono text-base tracking-wider focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-inner"
                    autoComplete="off"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasskey(!showPasskey)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors text-xs font-mono"
                    tabIndex={-1}
                  >
                    {showPasskey ? (
                      <span className="flex items-center gap-1">
                        <EyeOff className="w-4 h-4" />
                        Hide
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        Show
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Error feedback banner */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600/80 text-rose-200 text-xs flex items-start gap-2.5 animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong className="font-bold">Authentication Failed: </strong>
                    {errorMessage}
                  </div>
                </div>
              )}

              {/* Authenticate Submit Button */}
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:from-cyan-700 active:to-blue-700 text-white font-bold text-sm tracking-wide shadow-lg shadow-cyan-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Clinical Credentials...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>VERIFY PASSKEY &amp; UNLOCK CLINICAL CONSOLE</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                <span>Universal Demo Passkey: <strong className="text-cyan-400">HEAL-2026</strong></span>
                <span>Audit Tag: <strong className="text-slate-300">SESSION-GATE-101</strong></span>
              </div>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase font-mono">
                <span className="bg-slate-800 px-3 text-slate-400">
                  Or select authorized clinical staff badge (Fast Demo Sign-In)
                </span>
              </div>
            </div>

            {/* Authorized Clinical Staff Badges Grid */}
            <div>
              <div className="text-xs font-semibold text-slate-300 mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  Credentialed Clinical Roster (Ready-to-Use Passkeys)
                </span>
                <span className="text-[11px] text-slate-400">
                  Click any profile for instant clinical sign-in
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AUTHORIZED_CLINICIANS.map((clinician) => {
                  const isSelected = selectedClinicianId === clinician.id;
                  return (
                    <div
                      key={clinician.id}
                      onClick={() => handleSelectBadge(clinician)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-cyan-950/60 border-cyan-500 shadow-md shadow-cyan-950'
                          : 'bg-slate-900/80 border-slate-700 hover:border-slate-600 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                            clinician.role === 'Physician'
                              ? 'bg-blue-900/60 text-blue-300 border border-blue-700'
                              : clinician.role === 'Surgeon'
                              ? 'bg-rose-900/60 text-rose-300 border border-rose-700'
                              : clinician.role === 'Nurse'
                              ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                              : 'bg-purple-900/60 text-purple-300 border border-purple-700'
                          }`}>
                            {clinician.avatarInitials}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              {clinician.name}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {clinician.title}
                            </div>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {clinician.staffId}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 mt-1">
                        <div className="text-[11px] font-mono text-slate-400">
                          Passkey: <span className="font-bold text-cyan-300">{clinician.passkey}</span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickSignIn(clinician);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-200 border border-slate-700 hover:border-cyan-500 transition-all flex items-center gap-1"
                        >
                          <span>Sign In</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Security Compliance Strip */}
          <div className="bg-slate-900/90 border-t border-slate-700 p-4 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                Simulated 256-bit TLS Gateway &amp; SHA-256 Audit Trail Protection Active.
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              Session Timeout: <strong>Bedside Lockout Enabled</strong>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-5xl w-full mx-auto text-center relative z-10 text-[11px] text-slate-400 border-t border-slate-800/80 pt-4">
        <p>
          HealSecure AI • Clinical Decision Support Research Prototype • National Level Ideathon 5.0 | CBIT Hyderabad
        </p>
        <p className="text-slate-400 mt-0.5">
          Demo records only — no real patient-identifiable information. For demonstration and research evaluation.
        </p>
      </footer>
    </div>
  );
};
