import React, { useState } from 'react';
import {
  Layers,
  Activity,
  Cpu,
  ShieldCheck,
  Zap,
  Users,
  Award,
  ArrowRight,
  Stethoscope,
  Heart,
  Droplet,
  FileCheck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Database,
  BrainCircuit,
  CheckCircle2,
  Clock,
  AlertCircle,
  GitMerge,
  Microscope,
  BarChart3,
  Pill,
  Thermometer,
  Info,
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [openQuestionIndex, setOpenQuestionIndex] = useState<number | null>(0);

  const judgeQuestions = [
    {
      q: 'Why MAX30102 and OPA2388?',
      a: 'MAX30102 is our primary integrated PPG/SpO2 prototype sensor. OPA2388 is retained as a discrete analog reference architecture for SPICE-based TIA and signal-conditioning analysis.',
      badge: 'Hardware Architecture',
    },
    {
      q: 'Does FAERS / openFDA prove causality?',
      a: 'No. FAERS provides statistical reporting associations and disproportionality signals that contribute to differential interpretation. It does not prove biological causality.',
      badge: 'Pharmacovigilance',
    },
    {
      q: 'Is the ROC-AUC clinically validated?',
      a: 'No. It is an in-silico proof-of-concept model evaluation. Clinical validation is a future phase.',
      badge: 'Machine Learning',
    },
    {
      q: 'Can HealSecure AI diagnose SSI?',
      a: 'No. It provides multimodal wound-abnormality monitoring and AI-assisted SSI-risk stratification for clinician decision support.',
      badge: 'Clinical Scope',
    },
    {
      q: 'What is novel about HealSecure AI?',
      a: 'The system-level integration of local wound physiology, systemic vital signals and medication-associated pharmacovigilance context with explainable AI.',
      badge: 'System Novelty',
    },
    {
      q: 'Is the 48-hour battery life experimentally proven?',
      a: 'It is currently a design target based on duty-cycled operation; hardware runtime validation is part of the next phase.',
      badge: 'Power & Battery',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Hackathon & Project Hero Block */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 rounded-2xl p-6 text-white shadow-lg border border-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
            NATIONAL LEVEL IDEATHON 5.0 | LIFE SCIENCES &amp; AI
          </span>
          <span className="text-xs text-slate-400 font-mono">11 &amp; 12 September 2026 | CBIT, Hyderabad</span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              HealSecure <span className="text-cyan-400">AI</span>
            </h1>
          </div>
          <h2 className="text-sm sm:text-base font-semibold text-cyan-200">
            The Dual-Modal Sentinel for Post-Surgical Recovery &amp; NICU ADR Monitoring
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            An explainable multimodal wearable proof-of-concept integrating local wound physiology, systemic vital signs and medication-associated pharmacovigilance context for clinician decision support.
          </p>
        </div>

        {/* 3 Compact Hero Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800/90 text-slate-200 border border-slate-700">
            <Activity className="w-3.5 h-3.5 text-cyan-400" /> MULTIMODAL SENSING
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-950/90 text-cyan-300 border border-cyan-700/60">
            <BrainCircuit className="w-3.5 h-3.5 text-cyan-300" /> EXPLAINABLE AI
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-700/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> CLINICAL DECISION SUPPORT
          </span>
        </div>

        {/* Team Members Grid */}
        <div className="pt-4 border-t border-slate-700/80">
          <div className="text-xs uppercase tracking-wider font-bold text-cyan-400 mb-3 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-cyan-400" /> Team Helix Freaks (VIT Chennai)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="font-bold text-white">Chakhyusa S. Mittra</div>
              <div className="text-cyan-300 text-[11px]">Biotechnology &amp; Biosensing</div>
              <div className="text-slate-400 text-[10px]">EEE, 2nd Year</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="font-bold text-white">Anwesha Dutta</div>
              <div className="text-cyan-300 text-[11px]">Hardware &amp; Electronics</div>
              <div className="text-slate-400 text-[10px]">EEE, 2nd Year</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="font-bold text-white">Asmita Das</div>
              <div className="text-cyan-300 text-[11px]">Product Design &amp; Software</div>
              <div className="text-slate-400 text-[10px]">CSE Core, 2nd Year</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="font-bold text-white">Balam Chaitra</div>
              <div className="text-cyan-300 text-[11px]">AI, ML &amp; Data Analysis</div>
              <div className="text-slate-400 text-[10px]">CSE AI&amp;ML, 2nd Year</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="font-bold text-white">Atharva S. Bhajipale</div>
              <div className="text-cyan-300 text-[11px]">Business &amp; Pitch</div>
              <div className="text-slate-400 text-[10px]">EEE, 2nd Year</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Core Value Proposition in 10-15 Seconds */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-cyan-600" />
            Core Value Proposition (At a Glance in 15 Seconds)
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200">
            System Concept
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Inputs */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase font-bold text-cyan-700 mb-1">Step 1 • Tri-Source Data</div>
              <div className="font-bold text-slate-900 text-sm mb-1.5">Integrated Inputs</div>
              <ul className="text-[11px] text-slate-600 space-y-1">
                <li>• <strong>Local Wound:</strong> pH + Exudate Moisture + Thermal ΔT</li>
                <li>• <strong>Systemic Vitals:</strong> HR + SpO₂ (MAX30102)</li>
                <li>• <strong>Medication Context:</strong> Rx + openFDA FAERS</li>
              </ul>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-mono">
              Raw physiological + pharmacovigilance context
            </div>
          </div>

          {/* AI Fusion */}
          <div className="p-3.5 rounded-xl border border-cyan-200 bg-cyan-50/40 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase font-bold text-cyan-700 mb-1">Step 2 • Multimodal AI</div>
              <div className="font-bold text-slate-900 text-sm mb-1.5">AI Risk Fusion</div>
              <ul className="text-[11px] text-slate-700 space-y-1">
                <li>• <strong>LSTM-Autoencoder:</strong> Temporal vital anomaly tracking</li>
                <li>• <strong>XGBoost:</strong> Cross-modal feature synthesis</li>
                <li>• <strong>Artifact Filter:</strong> Motion artifact suppression</li>
              </ul>
            </div>
            <div className="mt-3 pt-2 border-t border-cyan-200 text-[10px] text-cyan-700 font-mono">
              Reconciles local vs systemic patterns
            </div>
          </div>

          {/* Explainability */}
          <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/40 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase font-bold text-purple-700 mb-1">Step 3 • Transparency</div>
              <div className="font-bold text-slate-900 text-sm mb-1.5">Explainable SHAP</div>
              <ul className="text-[11px] text-slate-700 space-y-1">
                <li>• <strong>Feature Attribution:</strong> Individual % contributions</li>
                <li>• <strong>No Black-Box:</strong> Clear mathematical weighting</li>
                <li>• <strong>Pharmacology Match:</strong> ROR / PRR disproportionality</li>
              </ul>
            </div>
            <div className="mt-3 pt-2 border-t border-purple-200 text-[10px] text-purple-700 font-mono">
              Verifiable driver breakdown
            </div>
          </div>

          {/* Clinician Output */}
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase font-bold text-emerald-700 mb-1">Step 4 • Clinical Action</div>
              <div className="font-bold text-slate-900 text-sm mb-1.5">Decision Support</div>
              <ul className="text-[11px] text-slate-700 space-y-1">
                <li>• <strong>SSI Warning:</strong> Pre-clinical pH/ΔT notification</li>
                <li>• <strong>ADR Differential:</strong> Drug vs surgical event distinction</li>
                <li>• <strong>Bedside Dashboard:</strong> Non-autonomous clinician aid</li>
              </ul>
            </div>
            <div className="mt-3 pt-2 border-t border-emerald-200 text-[10px] text-emerald-700 font-mono">
              Actionable triage within 15 seconds
            </div>
          </div>
        </div>
      </div>

      {/* 3. Technical "Why This Matters" Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 text-xs text-rose-950 space-y-2">
          <div className="font-bold uppercase tracking-wider text-[11px] text-rose-800 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            The Status Quo: Siloed Signals &amp; Alarm Fatigue
          </div>
          <p className="text-slate-700 text-[11px] leading-relaxed">
            In standard post-surgical and NICU settings, monitors alert on isolated threshold crossings (e.g. an SpO₂ dip or pulse spike). Because bedside monitors lack knowledge of <strong>active prescriptions</strong> or <strong>underlying wound biochemistry</strong>, motion artifacts generate high false alarm rates (~60% alarm fatigue), while adverse drug reactions frequently get misattributed to surgical trauma.
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 text-xs text-emerald-950 space-y-2">
          <div className="font-bold uppercase tracking-wider text-[11px] text-emerald-800 flex items-center gap-1.5">
            <GitMerge className="w-4 h-4 text-emerald-600" />
            HealSecure AI: Context-Aware Temporal Correlation
          </div>
          <p className="text-slate-700 text-[11px] leading-relaxed">
            By continuously correlating systemic hemodynamics with local wound physiology and medication timing, HealSecure AI transitions clinical teams from <em>isolated threshold beeps</em> to <strong>context-aware risk stratification</strong>. If SpO₂ drops while wound pH and ΔT remain normal, the system cross-references the active infusion timeline against openFDA pharmacovigilance data, helping clinicians differentiate drug side effects from surgical complications.
          </p>
        </div>
      </div>

      {/* 4. What Makes HealSecure AI Different? (Comparative Landscape Matrix) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-600" /> What Makes HealSecure AI Different?
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            <strong>Key Innovation:</strong> HealSecure AI integrates local wound biomarkers, systemic physiological signals and medication-associated pharmacovigilance context into a unified, explainable risk-stratification workflow.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="p-3">Capability / Feature</th>
                <th className="p-3">Conventional Monitors</th>
                <th className="p-3">Smart Dressings in Literature</th>
                <th className="p-3 bg-cyan-50/70 text-cyan-900 border-l border-r border-cyan-200">
                  HealSecure AI (Our Concept)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-3 font-semibold text-slate-900">HR / SpO₂ Continuous Monitoring</td>
                <td className="p-3 text-emerald-600 font-medium">✓ Standard (bedside/oximeter)</td>
                <td className="p-3 text-slate-400">— Primarily wound-focused</td>
                <td className="p-3 bg-cyan-50/30 border-l border-r border-cyan-100 font-bold text-emerald-700">✓ Integrated (MAX30102)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Wound Bed pH Tracking</td>
                <td className="p-3 text-slate-400">— Not monitored</td>
                <td className="p-3 text-emerald-600 font-medium">✓ Local wound bed only</td>
                <td className="p-3 bg-cyan-50/30 border-l border-r border-cyan-100 font-bold text-emerald-700">✓ Solid-state IrOx Electrode</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Wound Exudate Moisture</td>
                <td className="p-3 text-slate-400">— Not monitored</td>
                <td className="p-3 text-emerald-600 font-medium">✓ Impedance sensors</td>
                <td className="p-3 bg-cyan-50/30 border-l border-r border-cyan-100 font-bold text-emerald-700">✓ Au Interdigitated (IDE) Array</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Local Thermal Gradient (ΔT)</td>
                <td className="p-3 text-slate-400">— Core temperature only</td>
                <td className="p-3 text-slate-400">— Single-point or none</td>
                <td className="p-3 bg-cyan-50/30 border-l border-r border-cyan-100 font-bold text-emerald-700">✓ Differential NTC Bridge (Wound vs Core)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Medication Prescription Context</td>
                <td className="p-3 text-slate-400">— Siloed in electronic health records</td>
                <td className="p-3 text-slate-400">— None</td>
                <td className="p-3 bg-cyan-50/30 border-l border-r border-cyan-100 font-bold text-cyan-900">✓ Active Prescription Time-Sync</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">FAERS / openFDA Reference Layer</td>
                <td className="p-3 text-slate-400">— None</td>
                <td className="p-3 text-slate-400">— None</td>
                <td className="p-3 bg-cyan-50/30 border-l border-r border-cyan-100 font-bold text-cyan-900">✓ ROR / PRR Disproportionality Metrics</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Temporal Anomaly AI</td>
                <td className="p-3 text-slate-400">— Simple static threshold limits</td>
                <td className="p-3 text-slate-400">— Static threshold detection</td>
                <td className="p-3 bg-cyan-50/30 border-l border-r border-cyan-100 font-bold text-cyan-900">✓ LSTM-Autoencoder Temporal Trends</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Explainability (SHAP Attribution)</td>
                <td className="p-3 text-slate-400">— None</td>
                <td className="p-3 text-slate-400">— None</td>
                <td className="p-3 bg-cyan-50/30 border-l border-r border-cyan-100 font-bold text-cyan-900">✓ Quantified Feature Attribution Breakdown</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Multimodal Fusion Architecture</td>
                <td className="p-3 text-slate-400">— None</td>
                <td className="p-3 text-slate-500">Limited (wound parameters only)</td>
                <td className="p-3 bg-cyan-50/30 border-l border-r border-cyan-100 font-bold text-cyan-900">✓ Unified XGBoost Fusion Classifier</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Indicative Prototype Target BOM</td>
                <td className="p-3 text-slate-600">$500 – $2,500+ (cart hardware)</td>
                <td className="p-3 text-slate-600">$80 – $250 / dressing</td>
                <td className="p-3 bg-cyan-50/30 border-l border-r border-cyan-100 font-bold text-emerald-700">&lt;$50 Indicative Target (1k volume)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. System Architecture Visual & Data Flow Pipeline */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-cyan-600" />
            End-to-End System Architecture: Separated Sensing, Context &amp; Processing Pipeline
          </h3>
          <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
            Physical Hardware + Cloud Knowledge Layer
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 text-xs">
          {/* A: Local Wound Sensing */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-center gap-1.5 text-cyan-700 font-bold text-[11px]">
              <Droplet className="w-3.5 h-3.5" /> A. LOCAL WOUND
            </div>
            <div className="text-slate-800 font-semibold text-xs">Biomarker Array</div>
            <ul className="text-[10px] text-slate-600 space-y-1">
              <li>• IrOx Potentiometric pH</li>
              <li>• Au IDE Exudate Moisture</li>
              <li>• Dual NTC Thermistor ΔT</li>
            </ul>
            <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500">
              Analog: LTC2050 + INA333 → ADS1115 (16-bit ADC)
            </div>
          </div>

          {/* B: Systemic Vitals Sensing */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-center gap-1.5 text-rose-700 font-bold text-[11px]">
              <Heart className="w-3.5 h-3.5" /> B. SYSTEMIC VITALS
            </div>
            <div className="text-slate-800 font-semibold text-xs">Optical Biosensor</div>
            <ul className="text-[10px] text-slate-600 space-y-1">
              <li>• MAX30102 Module</li>
              <li>• Dual 660/880nm LEDs</li>
              <li>• Continuous HR &amp; SpO₂</li>
            </ul>
            <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500">
              Digital I2C Fast-Mode (400 kHz) to ESP32
            </div>
          </div>

          {/* C: Medication Context (Non-Hardware) */}
          <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/60 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-800 font-bold text-[11px]">
              <Pill className="w-3.5 h-3.5" /> C. MEDICATION CONTEXT
            </div>
            <div className="text-slate-800 font-semibold text-xs">Pharmacovigilance</div>
            <ul className="text-[10px] text-slate-600 space-y-1">
              <li>• Active Prescriptions (EHR)</li>
              <li>• openFDA FAERS Reference</li>
              <li>• ROR / PRR Stat Metrics</li>
            </ul>
            <div className="pt-2 border-t border-amber-200 text-[10px] text-amber-800 font-medium">
              *Knowledge layer; not a hardware sensor
            </div>
          </div>

          {/* D: Edge MCU Processing */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-center gap-1.5 text-blue-700 font-bold text-[11px]">
              <Cpu className="w-3.5 h-3.5" /> D. EDGE / MCU
            </div>
            <div className="text-slate-800 font-semibold text-xs">ESP32-PICO Core</div>
            <ul className="text-[10px] text-slate-600 space-y-1">
              <li>• 240 MHz Dual-Core MCU</li>
              <li>• 100 Hz Telemetry Ingestion</li>
              <li>• BLE 5.0 Wireless Pipeline</li>
            </ul>
            <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500">
              Duty-cycle battery management (&ge;48h target)
            </div>
          </div>

          {/* E: AI Fusion & Explainability */}
          <div className="p-3 rounded-xl border border-purple-200 bg-purple-50/60 space-y-2">
            <div className="flex items-center gap-1.5 text-purple-800 font-bold text-[11px]">
              <BrainCircuit className="w-3.5 h-3.5" /> E. AI FUSION
            </div>
            <div className="text-slate-800 font-semibold text-xs">Decision Models</div>
            <ul className="text-[10px] text-slate-600 space-y-1">
              <li>• LSTM-AE (Anomaly)</li>
              <li>• XGBoost (Risk Fusion)</li>
              <li>• SHAP (Attribution)</li>
            </ul>
            <div className="pt-2 border-t border-purple-200 text-[10px] text-purple-800">
              Generates calibrated readmission risk score
            </div>
          </div>

          {/* F: Clinician Output */}
          <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" /> F. CLINICIAN OUTPUT
            </div>
            <div className="text-slate-800 font-semibold text-xs">Bedside Portal</div>
            <ul className="text-[10px] text-slate-600 space-y-1">
              <li>• Calibrated Risk Score</li>
              <li>• SSI vs ADR Differential</li>
              <li>• Transparent SHAP Bars</li>
            </ul>
            <div className="pt-2 border-t border-emerald-200 text-[10px] text-emerald-800 font-medium">
              Actionable triage for clinical staff
            </div>
          </div>
        </div>
      </div>

      {/* 6. Clarify the Role of AI in HealSecure */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
          <BrainCircuit className="w-4 h-4 text-purple-600" />
          Explicit Roles of AI in HealSecure AI (Architecture Breakdown)
        </h3>
        <p className="text-xs text-slate-600">
          To maintain strict scientific and clinical discipline, each machine learning component serves an explicitly defined, bounded functional role. The models <strong>do not autonomously diagnose</strong> patients:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span>1. LSTM-Autoencoder</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">Temporal Anomaly</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <strong>Role:</strong> Unsupervised reconstruction error tracking over sliding 4-hour windows. Detects subtle, coordinated temporal drifts in heart rate and SpO₂ before discrete physiological threshold alarms fire.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span>2. Gradient-Boosted XGBoost</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800">Multimodal Fusion</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <strong>Role:</strong> Supervised non-linear classification that combines normalized wound bed biomarkers (pH, moisture, ΔT), systemic vital anomalies, and medication association weights into a unified Readmission Risk score (0–100%).
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span>3. SHAP (Shapley Additive exPlanations)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">Explainability</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <strong>Role:</strong> Computes exact game-theoretic marginal contributions for each sensor input. Directly explains <em>why</em> a score is elevated (e.g. +28% driven by wound pH, +15% driven by Gentamicin FAERS association), eliminating black-box opacity.
            </p>
          </div>
        </div>
      </div>

      {/* 7. Pharmacovigilance Context: FAERS / openFDA Pipeline */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-amber-600" />
            Pharmacovigilance Context: FAERS / openFDA Reference Layer
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
            Statistical Association ≠ Causality
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-200 text-xs text-amber-950 leading-relaxed">
          <strong>Scientific &amp; Methodological Notice:</strong> FAERS/openFDA is utilized as an external <em>reference knowledge layer</em> for medication-event statistical associations. Disproportionality metrics such as the Reporting Odds Ratio (ROR) and Proportional Reporting Ratio (PRR) reflect statistical reporting signals in post-market spontaneous data; they do <strong>not</strong> establish biological causality for an individual patient.
        </div>

        {/* Pipeline Diagram */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 text-xs">
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-center space-y-1">
            <div className="font-bold text-slate-900 text-[11px]">1. Active Prescription</div>
            <p className="text-[10px] text-slate-600">e.g. Gentamicin infusion documented in patient EHR</p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-center space-y-1">
            <div className="font-bold text-slate-900 text-[11px]">2. Observed Vital Event</div>
            <p className="text-[10px] text-slate-600">e.g. Acute neonatal bradycardia / desaturation event</p>
          </div>

          <div className="p-3 rounded-lg border border-cyan-200 bg-cyan-50 text-center space-y-1">
            <div className="font-bold text-cyan-950 text-[11px]">3. openFDA FAERS Lookup</div>
            <p className="text-[10px] text-cyan-800">Disproportionality signal query (ROR: 3.41, PRR: 2.89)</p>
          </div>

          <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-center space-y-1">
            <div className="font-bold text-emerald-950 text-[11px]">4. Differential Support</div>
            <p className="text-[10px] text-emerald-800">Surfaces documented association for clinician review</p>
          </div>
        </div>
      </div>

      {/* 8. Engineering Readiness ("What We Have Actually Built") */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
          <Microscope className="w-4 h-4 text-cyan-600" />
          Engineering Readiness: Transparent Classification of Completed vs Planned Work
        </h3>
        <p className="text-xs text-slate-600">
          A rigorous, honest accounting of what is currently designed, simulated, bench-prototyped, and targeted for future validation:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* DESIGNED */}
          <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-50/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs">1. DESIGNED</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">Complete</span>
            </div>
            <ul className="text-[11px] text-slate-600 space-y-1">
              <li>• 2-layer flexible FPC patch footprint (50x32mm)</li>
              <li>• Sensor conditioning schematics (LTC2050, INA333)</li>
              <li>• ESP32-PICO pinout and BLE pipeline</li>
              <li>• Multimodal XGBoost + SHAP architecture</li>
            </ul>
          </div>

          {/* SIMULATED */}
          <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-950 text-xs">2. SIMULATED</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-200 text-blue-900">Verified</span>
            </div>
            <ul className="text-[11px] text-blue-800 space-y-1">
              <li>• LTspice AFE frequency response &amp; Bode plots</li>
              <li>• 50 Hz power-line hum active filtering</li>
              <li>• MATLAB 72h continuous multi-modal telemetry</li>
              <li>• In-silico ROC (AUC 0.948) &amp; SHAP decomposition</li>
            </ul>
          </div>

          {/* PROTOTYPE / BENCH */}
          <div className="p-3.5 rounded-xl border border-cyan-200 bg-cyan-50/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-950 text-xs">3. PROTOTYPE / BENCH</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-200 text-cyan-900">In Progress</span>
            </div>
            <ul className="text-[11px] text-cyan-900 space-y-1">
              <li>• MAX30102 optical sensor I2C communication</li>
              <li>• ADS1115 16-bit ADC readout on breadboard</li>
              <li>• ESP32 Bluetooth Low Energy transmission</li>
              <li>• Simulated potentiometric voltage inputs</li>
            </ul>
          </div>

          {/* NEXT STEPS */}
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 text-xs">4. NEXT STEPS</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900">Roadmap</span>
            </div>
            <ul className="text-[11px] text-emerald-800 space-y-1">
              <li>• Integrated flexible PCB fab &amp; assembly</li>
              <li>• Controlled calibration in standard pH buffers</li>
              <li>• Benchtop temperature gradient verification</li>
              <li>• Prospective clinical feasibility study</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 9. Project Status Timeline (Phases 1–7) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-cyan-600" />
          Project Status Timeline (Phases 1–7)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
            <div className="font-bold text-[10px] text-emerald-700">PHASE 1</div>
            <div className="font-bold text-xs">Architecture</div>
            <div className="text-[10px] mt-1 text-emerald-800">✓ Completed</div>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
            <div className="font-bold text-[10px] text-emerald-700">PHASE 2</div>
            <div className="font-bold text-xs">Circuit &amp; SPICE</div>
            <div className="text-[10px] mt-1 text-emerald-800">✓ Completed</div>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
            <div className="font-bold text-[10px] text-emerald-700">PHASE 3</div>
            <div className="font-bold text-xs">In-Silico Models</div>
            <div className="text-[10px] mt-1 text-emerald-800">✓ Completed</div>
          </div>

          <div className="p-2.5 rounded-xl bg-cyan-100/70 border border-cyan-300 text-cyan-950 font-semibold">
            <div className="font-bold text-[10px] text-cyan-700">PHASE 4</div>
            <div className="font-bold text-xs">Bench Prototype</div>
            <div className="text-[10px] mt-1 text-cyan-800">⚙ In Progress</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
            <div className="font-bold text-[10px] text-slate-500">PHASE 5</div>
            <div className="font-bold text-xs">Controlled Bench</div>
            <div className="text-[10px] mt-1 text-slate-500">&rarr; Planned</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
            <div className="font-bold text-[10px] text-slate-500">PHASE 6</div>
            <div className="font-bold text-xs">Clinical Dataset</div>
            <div className="text-[10px] mt-1 text-slate-500">&rarr; Planned</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
            <div className="font-bold text-[10px] text-slate-500">PHASE 7</div>
            <div className="font-bold text-xs">Prospective Trial</div>
            <div className="text-[10px] mt-1 text-slate-500">&rarr; Future</div>
          </div>
        </div>
      </div>

      {/* 10. Current Limitations & Validation Roadmap */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          Current Limitations &amp; Validation Roadmap
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Limitations */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
            <div className="font-bold text-amber-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-700" /> Current Prototype Limitations
            </div>
            <ul className="space-y-1 text-slate-700 text-[11px]">
              <li>• <strong>Prototype Sensing Architecture:</strong> Current physical testing uses benchtop modular breakouts rather than fully packaged sterile flexible skin patches.</li>
              <li>• <strong>Illustrative Clinical Thresholds:</strong> Thresholds (pH &gt; 7.2, ΔT &ge; +1.20°C) represent configurable prototype values that require empirical clinical calibration.</li>
              <li>• <strong>In-Silico AI Evidence:</strong> ROC-AUC (0.948) and SHAP values are established on simulated physiological models, not prospective patient cohorts.</li>
              <li>• <strong>Statistical Association in FAERS:</strong> OpenFDA FAERS data reflects reporting frequency, not guaranteed pharmacological causation.</li>
            </ul>
          </div>

          {/* Validation Roadmap */}
          <div className="p-4 rounded-xl border border-cyan-200 bg-cyan-50/40 space-y-2">
            <div className="font-bold text-cyan-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-700" /> Phased Validation Roadmap
            </div>
            <ol className="space-y-1 text-slate-700 text-[11px] list-decimal list-inside">
              <li><strong>Engineering Validation:</strong> Sensor calibration across standardized chemical buffers (pH 4.0–10.0) and thermal baths.</li>
              <li><strong>Benchtop Signal Quality:</strong> SNR and motion artifact characterization using artificial tissue phantoms.</li>
              <li><strong>Controlled Physiological Testing:</strong> Non-invasive skin testing on healthy adult volunteers for ergonomic comfort.</li>
              <li><strong>Clinical Dataset Development:</strong> Annotation of prospective NICU vital streams against confirmed pharmacology events.</li>
              <li><strong>IRB-Approved Prospective Study:</strong> Formal clinical trial evaluating false alarm suppression and early SSI detection.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* 11. Questions a Judge May Ask (Interactive Accordion) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-cyan-600" />
            Questions a Judge May Ask (Defensible Engineering Responses)
          </h3>
          <span className="text-[10px] font-mono text-slate-500">
            Click question to expand
          </span>
        </div>

        <div className="space-y-2">
          {judgeQuestions.map((item, idx) => {
            const isOpen = openQuestionIndex === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenQuestionIndex(isOpen ? null : idx)}
                  className="w-full p-3.5 text-left text-xs font-semibold flex items-center justify-between gap-3 bg-slate-50/60 hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-700 font-bold">Q{idx + 1}:</span>
                    <span className="text-slate-900">{item.q}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {item.badge}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    )}
                  </div>
                </button>
                {isOpen && (
                  <div className="p-3.5 bg-white border-t border-slate-100 text-xs text-slate-700 leading-relaxed space-y-2">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 12. Peer-Reviewed Prior Art & Literature Citations */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
          <FileCheck className="w-4 h-4 text-purple-600" /> Key Scientific References &amp; Foundation Literature
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="font-semibold text-slate-900 mb-1">[1] IEEE Xplore (2025)</div>
            <p className="text-[11px] text-slate-600">
              "AI-Integrated Smart Bandage with Automated Wound Monitoring and Dynamic Drug Delivery System," doi: 10.1109/ICIIECS.2025.11051581.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="font-semibold text-slate-900 mb-1">[2] Biosensors &amp; Bioelectronics (2024)</div>
            <p className="text-[11px] text-slate-600">
              "A closed-loop smart dressing based on microneedle and electrochemical micropump for early diagnosis and in-time therapy of chronic wound," doi: 10.1016/j.bios.2024.116547.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="font-semibold text-slate-900 mb-1">[3] Materials Today Bio (2024)</div>
            <p className="text-[11px] text-slate-600">
              "A closed-loop patch based on bioinspired infection sensor for wound management," doi: 10.1016/j.mtbio.2024.102400.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="font-semibold text-slate-900 mb-1">[4] Biosensors &amp; Bioelectronics: X (2023)</div>
            <p className="text-[11px] text-slate-600">
              "Matrix metalloproteinase sensing in wound fluids: Are graphene-based field effect transistors a viable alternative?," doi: 10.1016/j.biosx.2023.100305.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
