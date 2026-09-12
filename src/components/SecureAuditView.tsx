import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Lock,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Database,
  Clock,
  Hash,
  Info,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Activity,
  Stethoscope,
  Terminal,
} from 'lucide-react';
import { AuditRecord, ClinicianProfile } from '../types';
import {
  INITIAL_AUDIT_RECORDS,
  calculateSha256,
  canonicalStringify,
} from '../data/auditData';

interface SecureAuditViewProps {
  currentClinician?: ClinicianProfile;
}

export const SecureAuditView: React.FC<SecureAuditViewProps> = ({ currentClinician }) => {
  // State for the interactive tamper demonstration sandbox
  const [demoPayload, setDemoPayload] = useState<Record<string, unknown>>({
    recordId: 'HS-2048',
    event: 'MULTIMODAL_DATA_INGEST',
    riskState: 'MONITOR',
    vitals: { heartRate: 142, spo2: 97, respRate: 44 },
    biomarkers: { ph: 6.55, tempDelta: 0.35, moisturePct: 42 },
    timestamp: 'SIMULATED',
  });

  const [storedHash, setStoredHash] = useState<string>('');
  const [currentHash, setCurrentHash] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<'VERIFIED' | 'MISMATCH' | null>('VERIFIED');
  const [isTampered, setIsTampered] = useState<boolean>(false);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>('HS-2048');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  // Compute baseline stored hash on mount
  useEffect(() => {
    const originalJson = canonicalStringify({
      recordId: 'HS-2048',
      event: 'MULTIMODAL_DATA_INGEST',
      riskState: 'MONITOR',
      vitals: { heartRate: 142, spo2: 97, respRate: 44 },
      biomarkers: { ph: 6.55, tempDelta: 0.35, moisturePct: 42 },
      timestamp: 'SIMULATED',
    });

    calculateSha256(originalJson).then((hash) => {
      setStoredHash(hash);
      setCurrentHash(hash);
      setVerificationResult('VERIFIED');
    });
  }, []);

  // Recalculate current hash whenever demo payload changes
  useEffect(() => {
    const jsonStr = canonicalStringify(demoPayload);
    calculateSha256(jsonStr).then((hash) => {
      setCurrentHash(hash);
      if (storedHash) {
        if (hash.toLowerCase() === storedHash.toLowerCase()) {
          setVerificationResult('VERIFIED');
        } else {
          setVerificationResult('MISMATCH');
        }
      }
    });
  }, [demoPayload, storedHash]);

  // Simulate tampering
  const handleTamper = () => {
    setIsTampered(true);
    setDemoPayload((prev) => ({
      ...prev,
      riskState: 'SUPPRESSED_ALERT_ANOMALY',
      biomarkers: {
        ...(prev.biomarkers as Record<string, unknown>),
        ph: 7.95, // Altered pH biomarker
      },
    }));
  };

  // Reset to authentic original payload
  const handleReset = () => {
    const original = {
      recordId: 'HS-2048',
      event: 'MULTIMODAL_DATA_INGEST',
      riskState: 'MONITOR',
      vitals: { heartRate: 142, spo2: 97, respRate: 44 },
      biomarkers: { ph: 6.55, tempDelta: 0.35, moisturePct: 42 },
      timestamp: 'SIMULATED',
    };
    setIsTampered(false);
    setDemoPayload(original);
  };

  // Manual verify interaction
  const handleVerifyClick = () => {
    const jsonStr = canonicalStringify(demoPayload);
    calculateSha256(jsonStr).then((hash) => {
      if (hash.toLowerCase() === storedHash.toLowerCase()) {
        setVerificationResult('VERIFIED');
      } else {
        setVerificationResult('MISMATCH');
      }
    });
  };

  const filteredRecords = useMemo(() => {
    if (activeFilter === 'ALL') return INITIAL_AUDIT_RECORDS;
    return INITIAL_AUDIT_RECORDS.filter((r) => r.category === activeFilter);
  }, [activeFilter]);

  return (
    <div className="space-y-6">
      {/* 1. Hero Header & Scope Framing */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                SECURE AUDIT &amp; DATA INTEGRITY
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Cryptographic integrity and traceability layer — proof-of-concept
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {currentClinician && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                Session Actor: {currentClinician.name} ({currentClinician.staffId})
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Demo records only — no real patient-identifiable information.
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
              SHA-256 Proof-of-Concept
            </span>
          </div>
        </div>

        {/* Pipeline Integration Visualization */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 mb-5">
          <div className="text-[11px] font-mono uppercase font-bold text-slate-500 mb-2.5 flex items-center justify-between">
            <span>Clinical Pipeline Integration Architecture</span>
            <span className="text-[10px] text-cyan-700 font-semibold lowercase">observability layer decoupled from risk weights</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
              <Activity className="w-4 h-4 mx-auto text-cyan-600 mb-1" />
              <div className="font-bold text-[11px] text-slate-800">1. Multimodal Sensing</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Patch pH, ΔT &amp; PPG</div>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
              <Cpu className="w-4 h-4 mx-auto text-blue-600 mb-1" />
              <div className="font-bold text-[11px] text-slate-800">2. Edge Processing</div>
              <div className="text-[10px] text-slate-500 mt-0.5">AFE &amp; Motion Filter</div>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
              <Layers className="w-4 h-4 mx-auto text-indigo-600 mb-1" />
              <div className="font-bold text-[11px] text-slate-800">3. AI Risk Fusion</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Dual-Modal Engine</div>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
              <FileCheck className="w-4 h-4 mx-auto text-purple-600 mb-1" />
              <div className="font-bold text-[11px] text-slate-800">4. Explainability</div>
              <div className="text-[10px] text-slate-500 mt-0.5">SHAP Attribution</div>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
              <Stethoscope className="w-4 h-4 mx-auto text-emerald-600 mb-1" />
              <div className="font-bold text-[11px] text-slate-800">5. Decision Support</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Bedside Triage Aid</div>
            </div>

            <div className="p-2.5 rounded-lg bg-cyan-50/90 border border-cyan-300 shadow-xs ring-1 ring-cyan-400">
              <ShieldCheck className="w-4 h-4 mx-auto text-cyan-700 mb-1" />
              <div className="font-bold text-[11px] text-cyan-900">6. Secure Audit Trail</div>
              <div className="text-[10px] text-cyan-700 mt-0.5">Integrity &amp; Hashes</div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-200/80 flex items-start gap-2 leading-relaxed">
            <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Pipeline Integrity Note:</strong> The audit trail operates as an independent observability and data integrity record around the clinical decision-support workflow. The audit mechanism never modifies the calculated SSI, ADR, or unified readmission risk scores.
            </span>
          </div>
        </div>

        {/* Data Architecture Lifecyle Chain */}
        <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200">
          <div className="text-[10px] font-mono uppercase font-bold text-cyan-400 mb-2">
            Data Architecture &amp; Integrity Lifecycle (Target Representation)
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
              Sensor/Clinical Data
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
              Encrypted Data Payload
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
              Secure Data Store
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
              Audit Event
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="px-2 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold">
              Cryptographic Hash
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="px-2 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold">
              Tamper-Evident Audit Record
            </span>
          </div>
        </div>
      </div>

      {/* 2. Conceptual Separation Grid (Confidentiality, Integrity, Traceability, Future Ledger) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Confidentiality */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                <Lock className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                1. Confidentiality
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-2">
              Sensitive patient clinical telemetry would be encrypted at rest and in transit (AES-256 / TLS 1.3) in a production deployment.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[10px] font-mono text-blue-700 bg-blue-50/50 p-2 rounded">
            Target Architecture: Encrypted Data Store
          </div>
        </div>

        {/* Integrity */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between ring-1 ring-cyan-500/20">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-200">
                <Hash className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                2. Integrity
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-2">
              Cryptographic hashes detect whether an audit event or decision-support payload has changed. Hashing verifies integrity; it does not encrypt.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[10px] font-mono text-cyan-800 bg-cyan-50/50 p-2 rounded">
            Implemented PoC: SHA-256 Digest Matching
          </div>
        </div>

        {/* Traceability */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Clock className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                3. Traceability
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-2">
              Timestamped audit events record the lifecycle of clinical actions: data ingestion, risk inference, explanation generation, and clinician review.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[10px] font-mono text-indigo-800 bg-indigo-50/50 p-2 rounded">
            Implemented PoC: Immutable Chronological Log
          </div>
        </div>

        {/* Future Blockchain Option */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                <Database className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                4. Future Ledger
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-2">
              A permissioned distributed ledger may be used in future hospital deployments to anchor hashes. Not implemented in this prototype.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[10px] font-mono text-purple-800 bg-purple-50/50 p-2 rounded">
            Proposed Concept: External Hash Anchor
          </div>
        </div>
      </div>

      {/* 3. Interactive Cryptographic Hash & Tamper-Detection Demonstration */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-600" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Interactive Tamper Detection Sandbox
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Demonstrating how SHA-256 cryptographic hashes immediately detect any unauthorized modification of clinical audit records.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTamper}
              disabled={isTampered}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                isTampered
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Simulate Record Tampering
            </button>

            <button
              onClick={handleReset}
              disabled={!isTampered}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                !isTampered
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Authentic Payload
            </button>

            <button
              onClick={handleVerifyClick}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              VERIFY INTEGRITY
            </button>
          </div>
        </div>

        {/* Sandbox Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left: Payload JSON View */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-slate-700 font-bold flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-cyan-600" />
                Simulated Audit Payload (Record ID: HS-2048)
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                isTampered
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                {isTampered ? 'MODIFIED / TAMPERED' : 'AUTHENTIC STATE'}
              </span>
            </div>

            <div className="bg-slate-950 text-slate-200 p-3.5 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
              <pre className="text-[11px] leading-relaxed">
                {canonicalStringify(demoPayload)}
              </pre>
            </div>

            <p className="text-[11px] text-slate-500 leading-normal">
              <strong>SHA-256 cryptographic hash — integrity verification</strong> (Note: Do not use hashing as encryption; hashing produces a deterministic digest to detect payload alteration).
            </p>
          </div>

          {/* Right: Cryptographic Verification Comparison */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {/* Stored Hash */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-slate-500" />
                    Stored Reference Hash (Recorded at Ingestion)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">SHA-256 (256-bit hex)</span>
                </div>
                <div className="font-mono text-[11px] text-slate-800 bg-white p-2 rounded border border-slate-200 break-all select-all">
                  {storedHash || 'Computing...'}
                </div>
              </div>

              {/* Calculated Hash */}
              <div className={`p-3.5 rounded-xl border space-y-1 ${
                verificationResult === 'MISMATCH'
                  ? 'bg-rose-50/70 border-rose-200'
                  : 'bg-cyan-50/50 border-cyan-200'
              }`}>
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-bold flex items-center gap-1.5 ${
                    verificationResult === 'MISMATCH' ? 'text-rose-900' : 'text-cyan-900'
                  }`}>
                    <Hash className="w-3.5 h-3.5" />
                    Dynamically Calculated Hash (Current Payload)
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Live Digest</span>
                </div>
                <div className={`font-mono text-[11px] p-2 rounded border break-all select-all ${
                  verificationResult === 'MISMATCH'
                    ? 'bg-white text-rose-700 border-rose-300 font-bold'
                    : 'bg-white text-cyan-800 border-cyan-200'
                }`}>
                  {currentHash || 'Computing...'}
                </div>
              </div>
            </div>

            {/* Verification Status Banner */}
            {verificationResult === 'VERIFIED' ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <div className="flex items-center gap-2 text-sm font-black text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ✓ INTEGRITY VERIFIED
                </div>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  "No modification detected in the simulated audit record."
                </p>
                <div className="text-[10px] text-emerald-600/90 font-mono mt-1 pt-1 border-t border-emerald-200/60">
                  Stored digest matches recalculated SHA-256 payload digest bit-for-bit.
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 space-y-1 animate-pulse">
                <div className="flex items-center gap-2 text-sm font-black text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  ⚠ INTEGRITY MISMATCH
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  "Simulated record content differs from its stored hash."
                </p>
                <div className="text-[10px] text-rose-600/90 font-mono mt-1 pt-1 border-t border-rose-200">
                  Bit inversion or field alteration detected. The payload differs from the recorded audit state.
                </div>
              </div>
            )}

            <p className="text-[10px] text-slate-400 italic text-center">
              This should be a demonstration of tamper detection, not a claim of production security.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Simulated Audit Log Events Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Simulated Audit Trail Records
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Chronological log of decision-support events, actors, and cryptographic verification hashes.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {['ALL', 'Ingestion', 'Inference', 'Explainability', 'Clinical Action'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  activeFilter === cat
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Table / List */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-mono">Record ID</th>
                  <th className="py-2.5 px-3">Event Type</th>
                  <th className="py-2.5 px-3">Category &amp; Actor</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3 font-mono">SHA-256 Digest</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((rec) => {
                  const isExpanded = expandedRecordId === rec.recordId;
                  return (
                    <React.Fragment key={rec.recordId}>
                      <tr className={`hover:bg-slate-50/80 transition-colors ${
                        isExpanded ? 'bg-cyan-50/20' : ''
                      }`}>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {rec.recordId}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                          {rec.eventType}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              {rec.category}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {rec.actor}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 text-[11px] font-mono whitespace-nowrap">
                          {rec.timestamp}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                            {rec.storedHash.substring(0, 8)}...{rec.storedHash.substring(rec.storedHash.length - 4)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            VERIFIED
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => setExpandedRecordId(isExpanded ? null : rec.recordId)}
                            className="p-1 rounded text-slate-400 hover:text-cyan-700 hover:bg-cyan-50 transition-colors"
                            title="Inspect JSON Payload"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/60 border-b border-slate-200">
                          <td colSpan={7} className="p-4">
                            <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span className="font-bold text-slate-700">
                                  Full Canonical Payload &amp; Full Digest
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  Actor: {rec.actor}
                                </span>
                              </div>

                              <div className="bg-slate-950 text-slate-200 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                                <pre>{canonicalStringify(rec.payloadJson)}</pre>
                              </div>

                              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-slate-600 border-t border-slate-100">
                                <div>
                                  <span className="text-slate-400">Full SHA-256: </span>
                                  <span className="select-all text-slate-800 break-all">{rec.storedHash}</span>
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  Canonical JSON stringified before digest computation
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. Security Architecture & Future Permissioned Ledger Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Security Architecture Explanation Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-sm text-slate-900">
              Security Architecture
            </h3>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            HealSecure AI structures decision-support observability around five distinct defense-in-depth principles:
          </p>

          <ul className="text-xs text-slate-700 space-y-2 font-medium">
            <li className="flex items-start gap-2">
              <span className="text-cyan-600 font-bold">•</span>
              <span><strong>Encrypted storage</strong> → protects confidentiality (planned for production deployments).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-600 font-bold">•</span>
              <span><strong>SHA-256 hash</strong> → supports integrity verification (demonstrated in this proof-of-concept).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-600 font-bold">•</span>
              <span><strong>Timestamped audit events</strong> → supports traceability (demonstrated in this proof-of-concept).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-600 font-bold">•</span>
              <span><strong>Role-based access</strong> → planned for production hospital IT deployment.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-600 font-bold">•</span>
              <span><strong>Permissioned ledger anchoring</strong> → future deployment option.</span>
            </li>
          </ul>

          <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100 font-mono">
            Scope framing: Proposed &amp; planned capabilities are distinguished from implemented software PoC.
          </div>
        </div>

        {/* Future Permissioned Ledger Note Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                  <Database className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-sm text-slate-900">
                  Future Permissioned Ledger
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                Future Concept
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Proposed architecture for multi-hospital clinical consortiums or independent regulatory inspection:
            </p>

            {/* Architecture Flow */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono space-y-1.5">
              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">1</span>
                <span>Audit Event (Decision Support Log)</span>
              </div>
              <div className="pl-2.5 text-slate-400">↓</div>
              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center text-[10px] font-bold">2</span>
                <span>SHA-256 Hash Digest</span>
              </div>
              <div className="pl-2.5 text-slate-400">↓</div>
              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center text-[10px] font-bold">3</span>
                <span>Permissioned Ledger Anchor</span>
              </div>
              <div className="pl-2.5 text-slate-400">↓</div>
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold">4</span>
                <span>Immutable Audit Reference</span>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
            <strong>Explicit Notice:</strong> Future deployment concept — not implemented in current prototype. No blockchain networks, transactions, or wallets are simulated or claimed in this browser runtime.
          </div>
        </div>
      </div>

      {/* 6. Regulatory & Security Final Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 leading-relaxed">
        <strong>Security &amp; Integrity Disclaimer:</strong> Security features shown here demonstrate cryptographic integrity and auditability concepts using synthetic records. Production deployment would require secure key management, encrypted storage, authentication/authorization, threat modeling, security testing, privacy controls, and regulatory assessment.
      </div>
    </div>
  );
};
