import React, { useState, useMemo } from 'react';
import { MATLAB_SCRIPTS } from '../data/matlabData';
import { MatlabScriptDef } from '../types';
import {
  Download,
  Copy,
  Check,
  Activity,
  Code,
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

export const MatlabPlotter: React.FC = () => {
  const [selectedScript, setSelectedScript] = useState<MatlabScriptDef>(MATLAB_SCRIPTS[0]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeView, setActiveView] = useState<'figure' | 'code'>('figure');

  // Interactive Parameters for MATLAB Plot Studio
  const [noiseLevel, setNoiseLevel] = useState<number>(0.08);
  const [infectionHour, setInfectionHour] = useState<number>(36);
  const [adrSeverity, setAdrSeverity] = useState<number>(52);

  const copyCode = () => {
    navigator.clipboard.writeText(selectedScript.scriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const downloadScript = () => {
    const blob = new Blob([selectedScript.scriptCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedScript.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate dynamic points for Plot 1 (72h Trajectory)
  const timeSeriesData = useMemo(() => {
    const points = 120; // 0 to 72 hours
    const times: number[] = [];
    const rawPh: number[] = [];
    const filtPh: number[] = [];
    const rawDeltaT: number[] = [];
    const filtDeltaT: number[] = [];
    const rawHr: number[] = [];
    const rawSpo2: number[] = [];

    for (let i = 0; i <= points; i++) {
      const t = (i / points) * 72;
      times.push(t);

      // (A) pH
      const phInfection = 1.55 / (1 + Math.exp(-(t - infectionHour) / 4.5));
      const nPh = (Math.sin(i * 1.7) + Math.cos(i * 0.9)) * noiseLevel;
      const rPh = 6.4 + 0.1 * Math.sin((2 * Math.PI * t) / 24) + phInfection + nPh;
      const fPh = 6.4 + 0.1 * Math.sin((2 * Math.PI * t) / 24) + phInfection;
      rawPh.push(rPh);
      filtPh.push(fPh);

      // (B) Delta T
      const dTInfection = 1.65 / (1 + Math.exp(-(t - (infectionHour - 2)) / 4.0));
      const ndT = Math.sin(i * 2.3) * noiseLevel * 0.7;
      rawDeltaT.push(0.15 + dTInfection + ndT);
      filtDeltaT.push(0.15 + dTInfection);

      // (C) HR (Sudden drop at t=58h)
      const adrDip = -adrSeverity * Math.exp(-Math.pow(t - 58, 2) / (2 * 1.8 * 1.8));
      const hrBase = 142 + 4 * Math.sin((2 * Math.PI * t) / 6);
      rawHr.push(hrBase + adrDip + Math.sin(i * 3.1) * 3);

      // (D) SpO2
      const spo2Dip = -(adrSeverity * 0.28) * Math.exp(-Math.pow(t - 58, 2) / (2 * 2.2 * 2.2));
      rawSpo2.push(Math.max(75, Math.min(100, 98.2 + spo2Dip + Math.cos(i * 2.7) * 0.8)));
    }
    return { times, rawPh, filtPh, rawDeltaT, filtDeltaT, rawHr, rawSpo2 };
  }, [noiseLevel, infectionHour, adrSeverity]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Script Selector */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-600" />
              MATLAB Plotting Studio &amp; Numerical Analysis (.m)
            </h2>
            <p className="text-xs text-slate-500">
              In-silico MATLAB simulation scripts generating publication-style proof-of-concept figures, synthetic ROC-AUC curves, and SHAP waterfalls.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyCode}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-all shadow-xs"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCode ? 'Copied Code!' : 'Copy .m Code'}
            </button>
            <button
              onClick={downloadScript}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> Download {selectedScript.filename}
            </button>
          </div>
        </div>

        {/* 3 Script Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {MATLAB_SCRIPTS.map((script) => {
            const isSelected = selectedScript.id === script.id;
            return (
              <button
                key={script.id}
                onClick={() => setSelectedScript(script)}
                className={`p-3.5 rounded-xl border text-left transition-all text-xs flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-600 bg-amber-50/70 shadow-sm text-amber-950 font-medium ring-1 ring-amber-500'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/40 text-slate-700'
                }`}
              >
                <div>
                  <div className="font-semibold text-slate-900 mb-1 flex items-center justify-between">
                    <span>{script.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                      {script.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{script.purpose}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Parameter Sliders & Live View Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50/70 gap-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveView('figure')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeView === 'figure'
                  ? 'bg-white text-amber-800 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-amber-600" /> Interactive MATLAB Figure
            </button>
            <button
              onClick={() => setActiveView('code')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeView === 'code'
                  ? 'bg-white text-amber-800 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-slate-600" /> MATLAB Script Source Code
            </button>
          </div>

          {/* Interactive Sliders for Plot Studio */}
          {activeView === 'figure' && selectedScript.plotType === 'time_series' && (
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Noise (σ):</span>
                <input
                  type="range"
                  min="0.01"
                  max="0.25"
                  step="0.01"
                  value={noiseLevel}
                  onChange={(e) => setNoiseLevel(Number(e.target.value))}
                  className="w-20 h-1 bg-slate-300 rounded appearance-none cursor-pointer accent-amber-600"
                />
                <span className="font-mono text-slate-800">{noiseLevel.toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Infection Onset:</span>
                <input
                  type="range"
                  min="24"
                  max="48"
                  value={infectionHour}
                  onChange={(e) => setInfectionHour(Number(e.target.value))}
                  className="w-20 h-1 bg-slate-300 rounded appearance-none cursor-pointer accent-amber-600"
                />
                <span className="font-mono text-slate-800">{infectionHour}h</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">ADR Severity:</span>
                <input
                  type="range"
                  min="20"
                  max="65"
                  value={adrSeverity}
                  onChange={(e) => setAdrSeverity(Number(e.target.value))}
                  className="w-20 h-1 bg-slate-300 rounded appearance-none cursor-pointer accent-rose-600"
                />
                <span className="font-mono text-slate-800">{adrSeverity} bpm</span>
              </div>
            </div>
          )}
        </div>

        {/* View 1: Authentic MATLAB Figure Window */}
        {activeView === 'figure' && (
          <div className="p-6 space-y-4 bg-slate-100/60">
            {/* MATLAB Window Frame */}
            <div className="rounded-xl border border-slate-300 bg-white shadow-md overflow-hidden">
              {/* MATLAB Figure Menu Bar (Authentic styling) */}
              <div className="bg-slate-200/90 border-b border-slate-300 px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-700 font-sans">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-amber-600 inline-block" /> Figure 1: {selectedScript.title}
                  </span>
                  <div className="hidden sm:flex items-center gap-3 text-slate-600 text-[10px]">
                    <span>File</span>
                    <span>Edit</span>
                    <span>View</span>
                    <span>Insert</span>
                    <span>Tools</span>
                    <span>Desktop</span>
                    <span>Window</span>
                    <span>Help</span>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-slate-500">MATLAB R2024b Engine</span>
              </div>

              {/* Figure Canvas Area */}
              <div className="p-6 bg-white space-y-6">
                {/* PLOT TYPE 1: 72h Multi-Modal Time Series */}
                {selectedScript.plotType === 'time_series' && (
                  <div className="space-y-4">
                    <div className="text-center font-serif text-sm font-bold text-slate-900">
                      HealSecure AI: Simulated 72-Hour Multimodal Sentinel Telemetry (Synchronized Streams)
                    </div>
                    <p className="text-[10px] text-slate-500 text-center -mt-2">
                      Simulated multimodal telemetry demonstrating how correlated local and systemic abnormalities may evolve over time. (In-silico model data; not real patient records).
                    </p>

                    {/* Subplot 1: Wound pH */}
                    <div className="border border-slate-300 rounded p-3 relative bg-slate-50/30">
                      <div className="flex justify-between text-[11px] font-mono text-slate-600 mb-1">
                        <span className="font-bold text-purple-900">Subplot(4,1,1): Wound Bed Potentiometric pH</span>
                        <span className="text-rose-600 font-bold">--- SSI Alarm (pH &gt; 7.2)</span>
                      </div>
                      <svg viewBox="0 0 700 80" className="w-full h-20">
                        {/* Grid lines */}
                        <line x1="0" y1="20" x2="700" y2="20" stroke="#e2e8f0" strokeDasharray="2 2" />
                        <line x1="0" y1="50" x2="700" y2="50" stroke="#e2e8f0" strokeDasharray="2 2" />
                        {/* Threshold yline(7.2) */}
                        <line x1="0" y1="36" x2="700" y2="36" stroke="#e11d48" strokeWidth="1.5" strokeDasharray="4 4" />
                        {/* Infection onset vertical line */}
                        <line
                          x1={(infectionHour / 72) * 700}
                          y1="0"
                          x2={(infectionHour / 72) * 700}
                          y2="80"
                          stroke="#334155"
                          strokeWidth="1.2"
                          strokeDasharray="2 2"
                        />
                        <text x={(infectionHour / 72) * 700 + 6} y="14" fill="#334155" fontSize="9" fontFamily="monospace">
                          Pre-Clinical SSI ({infectionHour}h)
                        </text>

                        {/* Raw noisy line (gray) */}
                        <path
                          d={timeSeriesData.times
                            .map((t, idx) => {
                              const x = (t / 72) * 700;
                              const ph = timeSeriesData.rawPh[idx];
                              // map pH (6.0 to 8.5) to Y (75 to 5)
                              const y = 75 - ((ph - 6.0) / 2.5) * 70;
                              return `${idx === 0 ? 'M' : 'L'} ${x} ${Math.max(5, Math.min(75, y))}`;
                            })
                            .join(' ')}
                          fill="none"
                          stroke="#cbd5e1"
                          strokeWidth="1.0"
                        />

                        {/* Filtered pH line (MATLAB Purple #7E2F8E) */}
                        <path
                          d={timeSeriesData.times
                            .map((t, idx) => {
                              const x = (t / 72) * 700;
                              const ph = timeSeriesData.filtPh[idx];
                              const y = 75 - ((ph - 6.0) / 2.5) * 70;
                              return `${idx === 0 ? 'M' : 'L'} ${x} ${Math.max(5, Math.min(75, y))}`;
                            })
                            .join(' ')}
                          fill="none"
                          stroke="#7e2f8e"
                          strokeWidth="2.2"
                        />
                      </svg>
                    </div>

                    {/* Subplot 2: Wound Hyperemia Delta T */}
                    <div className="border border-slate-300 rounded p-3 relative bg-slate-50/30">
                      <div className="flex justify-between text-[11px] font-mono text-slate-600 mb-1">
                        <span className="font-bold text-orange-900">Subplot(4,1,2): Hyperemia Thermal Gradient ΔT (°C)</span>
                        <span className="text-rose-600 font-bold">--- Hyperemia Alarm (ΔT &gt; 1.20°C)</span>
                      </div>
                      <svg viewBox="0 0 700 80" className="w-full h-20">
                        <line x1="0" y1="25" x2="700" y2="25" stroke="#e2e8f0" strokeDasharray="2 2" />
                        <line x1="0" y1="55" x2="700" y2="55" stroke="#e2e8f0" strokeDasharray="2 2" />
                        {/* Alarm line at ΔT = 1.2 */}
                        <line x1="0" y1="35" x2="700" y2="35" stroke="#e11d48" strokeWidth="1.5" strokeDasharray="4 4" />

                        {/* Filtered Delta T line (MATLAB Orange #D95319) */}
                        <path
                          d={timeSeriesData.times
                            .map((t, idx) => {
                              const x = (t / 72) * 700;
                              const dt = timeSeriesData.filtDeltaT[idx];
                              // map 0.0 to 2.2C to 75 to 5
                              const y = 75 - (dt / 2.2) * 70;
                              return `${idx === 0 ? 'M' : 'L'} ${x} ${Math.max(5, Math.min(75, y))}`;
                            })
                            .join(' ')}
                          fill="none"
                          stroke="#d95319"
                          strokeWidth="2.2"
                        />
                      </svg>
                    </div>

                    {/* Subplot 3: Heart Rate (HR) */}
                    <div className="border border-slate-300 rounded p-3 relative bg-slate-50/30">
                      <div className="flex justify-between text-[11px] font-mono text-slate-600 mb-1">
                        <span className="font-bold text-rose-900">Subplot(4,1,3): Neonatal Heart Rate (HR bpm)</span>
                        <span className="text-rose-600 font-bold">--- Bradycardia Threshold (&lt; 100 bpm)</span>
                      </div>
                      <svg viewBox="0 0 700 80" className="w-full h-20">
                        <line x1="0" y1="30" x2="700" y2="30" stroke="#e2e8f0" strokeDasharray="2 2" />
                        <line x1="0" y1="60" x2="700" y2="60" stroke="#e2e8f0" strokeDasharray="2 2" />
                        {/* Brady threshold at 100 bpm */}
                        <line x1="0" y1="58" x2="700" y2="58" stroke="#e11d48" strokeWidth="1.5" strokeDasharray="4 4" />
                        {/* Event line at t=58h */}
                        <line x1={(58 / 72) * 700} y1="0" x2={(58 / 72) * 700} y2="80" stroke="#be185d" strokeWidth="1.5" />
                        <text x={(58 / 72) * 700 - 130} y="14" fill="#be185d" fontSize="9" fontFamily="monospace" fontWeight="bold">
                          Gentamicin ADR (58h)
                        </text>

                        {/* HR Curve */}
                        <path
                          d={timeSeriesData.times
                            .map((t, idx) => {
                              const x = (t / 72) * 700;
                              const hr = timeSeriesData.rawHr[idx];
                              // map 80 to 160 bpm to 75 to 5
                              const y = 75 - ((hr - 80) / 80) * 70;
                              return `${idx === 0 ? 'M' : 'L'} ${x} ${Math.max(5, Math.min(75, y))}`;
                            })
                            .join(' ')}
                          fill="none"
                          stroke="#e11d48"
                          strokeWidth="2.0"
                        />
                      </svg>
                    </div>

                    {/* Subplot 4: SpO2 Pulse Oximetry */}
                    <div className="border border-slate-300 rounded p-3 relative bg-slate-50/30">
                      <div className="flex justify-between text-[11px] font-mono text-slate-600 mb-1">
                        <span className="font-bold text-emerald-900">Subplot(4,1,4): Pulse Oximetry SpO₂ (%)</span>
                        <span className="text-rose-600 font-bold">--- Desaturation Alarm (&lt; 90%)</span>
                      </div>
                      <svg viewBox="0 0 700 80" className="w-full h-20">
                        <line x1="0" y1="30" x2="700" y2="30" stroke="#e2e8f0" strokeDasharray="2 2" />
                        {/* Desaturation line at 90% */}
                        <line x1="0" y1="52" x2="700" y2="52" stroke="#e11d48" strokeWidth="1.5" strokeDasharray="4 4" />

                        {/* SpO2 Curve (MATLAB Green #77AC30) */}
                        <path
                          d={timeSeriesData.times
                            .map((t, idx) => {
                              const x = (t / 72) * 700;
                              const spo2 = timeSeriesData.rawSpo2[idx];
                              // map 75% to 100% to 75 to 5
                              const y = 75 - ((spo2 - 75) / 25) * 70;
                              return `${idx === 0 ? 'M' : 'L'} ${x} ${Math.max(5, Math.min(75, y))}`;
                            })
                            .join(' ')}
                          fill="none"
                          stroke="#77ac30"
                          strokeWidth="2.0"
                        />
                      </svg>
                      <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                        <span>0 Hours (Post-Op)</span>
                        <span>Time (Hours)</span>
                        <span>72 Hours</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* PLOT TYPE 2: ROC-AUC & SHAP Waterfall */}
                {selectedScript.plotType === 'roc_shap' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* ROC Curves */}
                    <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/40">
                      <div className="font-serif text-center font-bold text-xs text-slate-900 mb-1">
                        Simulation-Based ROC Analysis of Multimodal Risk Fusion
                      </div>
                      <p className="text-[10px] text-slate-500 text-center mb-2">
                        Illustrative in-silico comparison; false-alarm reduction has not been clinically validated.
                      </p>
                      <svg viewBox="0 0 320 240" className="w-full h-56 font-mono text-[10px]">
                        <rect x="35" y="10" width="270" height="200" fill="#fff" stroke="#94a3b8" />
                        <line x1="35" y1="210" x2="305" y2="10" stroke="#94a3b8" strokeDasharray="3 3" />

                        {/* HealSecure Dual-Modal (Blue - In-silico AUC = 0.948) */}
                        <path
                          d="M 35 210 Q 40 40 305 10"
                          fill="none"
                          stroke="#0072bd"
                          strokeWidth="2.8"
                        />

                        {/* Wound-Only (Orange - AUC = 0.741) */}
                        <path
                          d="M 35 210 Q 70 90 305 10"
                          fill="none"
                          stroke="#d95319"
                          strokeWidth="2.0"
                          strokeDasharray="4 4"
                        />

                        {/* Vitals-Only (Purple - AUC = 0.692) */}
                        <path
                          d="M 35 210 Q 110 120 305 10"
                          fill="none"
                          stroke="#7e2f8e"
                          strokeWidth="2.0"
                          strokeDasharray="2 2"
                        />

                        {/* Axes labels */}
                        <text x="110" y="228" fill="#475569" fontSize="9">False Positive Rate (1-Spec)</text>
                        <text x="5" y="115" fill="#475569" fontSize="9" transform="rotate(-90 15 115)">True Positive Rate (Sens)</text>
                      </svg>

                      {/* Legend */}
                      <div className="mt-2 space-y-1 text-[11px] font-mono">
                        <div className="flex items-center gap-2 text-[#0072bd] font-bold">
                          <span className="w-3 h-0.5 bg-[#0072bd] inline-block" /> HealSecure Dual-Modal (Illustrative in-silico AUC = 0.948)
                        </div>
                        <div className="flex items-center gap-2 text-[#d95319]">
                          <span className="w-3 h-0.5 bg-[#d95319] inline-block" /> Wound Biomarkers Only (Illustrative in-silico AUC = 0.741)
                        </div>
                        <div className="flex items-center gap-2 text-[#7e2f8e]">
                          <span className="w-3 h-0.5 bg-[#7e2f8e] inline-block" /> Systemic Vitals Only (Illustrative in-silico AUC = 0.692)
                        </div>
                      </div>
                    </div>

                    {/* SHAP Bar Plot */}
                    <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/40 flex flex-col justify-between">
                      <div className="font-serif text-center font-bold text-xs text-slate-900 mb-1">
                        SHAP-Style Feature Attribution — Simulation
                      </div>
                      <p className="text-[10px] text-slate-500 text-center mb-2">
                        Decomposing sensor contributions to model predictions (illustrates model feature attribution; does not prove biological causality).
                      </p>

                      <div className="space-y-2.5 my-auto text-xs font-mono">
                        {[
                          { name: 'Wound pH Shift (6.4 -> 7.95)', val: '+0.28', pct: 85, pos: true },
                          { name: 'Hyperemia Temp Delta (ΔT = +1.8°C)', val: '+0.22', pct: 68, pos: true },
                          { name: 'FAERS Gentamicin Match (ROR 3.41)', val: '+0.15', pct: 48, pos: true },
                          { name: 'Exudate Moisture Saturation (72%)', val: '+0.16', pct: 52, pos: true },
                          { name: 'SpO2 Desaturation (83%)', val: '+0.12', pct: 38, pos: true },
                          { name: 'Neonatal Bradycardia (92 bpm)', val: '+0.09', pct: 28, pos: true },
                          { name: 'Baseline Post-Op Stability', val: '-0.04', pct: 15, pos: false },
                        ].map((item, i) => (
                          <div key={i}>
                            <div className="flex justify-between text-[11px] mb-0.5">
                              <span className="text-slate-700 truncate">{item.name}</span>
                              <span className={`font-bold ${item.pos ? 'text-[#0072bd]' : 'text-[#77ac30]'}`}>
                                {item.val}
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 h-2.5 rounded">
                              <div
                                className={`h-full rounded ${item.pos ? 'bg-[#0072bd]' : 'bg-[#77ac30]'}`}
                                style={{ width: `${item.pct}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="text-[10px] text-slate-500 font-mono text-center pt-2 border-t border-slate-200">
                        xline(0) | Mean |SHAP Value| (Impact on Unified Readmission Risk)
                      </div>
                    </div>
                  </div>
                )}

                {/* PLOT TYPE 3: Bode & FFT PSD */}
                {selectedScript.plotType === 'bode_psd' && (
                  <div className="space-y-4">
                    <div className="text-center font-serif text-sm font-bold text-slate-900">
                      Analog Front-End and Signal-Conditioning Simulation (50 Hz Hum Rejection)
                    </div>
                    <p className="text-[10px] text-slate-500 text-center -mt-2">
                      In-silico circuit simulation demonstrating theoretical transfer function and noise attenuation.
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Bode Magnitude */}
                      <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/40">
                        <div className="text-[11px] font-mono font-bold text-[#0072bd] mb-1">
                          Subplot(2,1,1): Sallen-Key Low-Pass Filter Magnitude |H(f)|
                        </div>
                        <svg viewBox="0 0 340 140" className="w-full h-36 font-mono text-[9px]">
                          <rect x="25" y="10" width="300" height="110" fill="#fff" stroke="#94a3b8" />
                          <line x1="25" y1="30" x2="325" y2="30" stroke="#e2e8f0" />
                          <line x1="25" y1="70" x2="325" y2="70" stroke="#e2e8f0" />
                          <line x1="25" y1="110" x2="325" y2="110" stroke="#e2e8f0" />

                          {/* 50 Hz marker */}
                          <line x1="220" y1="10" x2="220" y2="120" stroke="#e11d48" strokeDasharray="3 3" />
                          <text x="215" y="24" fill="#e11d48">Simulated 50 Hz (-46.2 dB)</text>

                          {/* 2nd Order Curve */}
                          <path
                            d="M 25 30 L 140 30 Q 180 30 220 78 T 325 118"
                            fill="none"
                            stroke="#0072bd"
                            strokeWidth="2.5"
                          />
                        </svg>
                        <div className="text-[10px] font-mono text-slate-500 mt-1">
                          Simulated 50 Hz attenuation: -46.2 dB (SPICE model)
                        </div>
                      </div>

                      {/* FFT PSD */}
                      <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/40">
                        <div className="text-[11px] font-mono font-bold text-[#77ac30] mb-1">
                          Subplot(2,1,2): Simulation: Raw vs Filtered Spectral Content
                        </div>
                        <svg viewBox="0 0 340 140" className="w-full h-36 font-mono text-[9px]">
                          <rect x="25" y="10" width="300" height="110" fill="#fff" stroke="#94a3b8" />

                          {/* Raw noise with 50Hz peak (gray) */}
                          <path
                            d="M 25 80 L 40 40 L 45 90 L 180 90 L 185 20 L 190 95 L 325 90"
                            fill="none"
                            stroke="#94a3b8"
                            strokeWidth="1.2"
                          />

                          {/* Filtered signal peak at 2.2 Hz (green) */}
                          <path
                            d="M 25 90 L 40 40 L 50 110 L 325 115"
                            fill="none"
                            stroke="#77ac30"
                            strokeWidth="2.2"
                          />
                          <text x="45" y="32" fill="#77ac30" fontWeight="bold">Heartbeat (2.2 Hz)</text>
                          <text x="175" y="22" fill="#94a3b8">Simulated 50Hz Hum</text>
                        </svg>
                        <div className="text-[10px] font-mono text-slate-500 mt-1">
                          Simulated mains-hum contamination effectively attenuated
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* View 2: Syntax Highlighted MATLAB Code */}
        {activeView === 'code' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 font-mono">
                Full, executable script ready for MATLAB (R2018a - R2024b) or GNU Octave.
              </span>
              <button
                onClick={copyCode}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? 'Copied Code!' : 'Copy MATLAB Script'}
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto border border-slate-800 max-h-96 leading-relaxed">
              {selectedScript.scriptCode}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
