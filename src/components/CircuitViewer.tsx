import React, { useState } from 'react';
import { CIRCUITS_DATA } from '../data/circuitsData';
import { CircuitDef } from '../types';
import {
  Download,
  Copy,
  Check,
  Cpu,
  Layers,
  Activity,
  FileCode,
  BookOpen,
  Eye,
  Sliders,
  Info,
} from 'lucide-react';

export const CircuitViewer: React.FC = () => {
  const [selectedCircuit, setSelectedCircuit] = useState<CircuitDef>(CIRCUITS_DATA[0]);
  const [activeTab, setActiveTab] = useState<'schematic' | 'waveforms' | 'netlist' | 'equations'>('schematic');
  const [copiedNetlist, setCopiedNetlist] = useState(false);
  const [copiedAsc, setCopiedAsc] = useState(false);
  const [activeTestpoint, setActiveTestpoint] = useState<string>('OUT');

  const copyToClipboard = (text: string, type: 'cir' | 'asc') => {
    navigator.clipboard.writeText(text);
    if (type === 'cir') {
      setCopiedNetlist(true);
      setTimeout(() => setCopiedNetlist(false), 2000);
    } else {
      setCopiedAsc(true);
      setTimeout(() => setCopiedAsc(false), 2000);
    }
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 1. Circuit Header & Selector */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              LTspice Analog Front-End (AFE) Circuit Schematics &amp; SPICE Simulation
            </h2>
            <p className="text-xs text-slate-500">
              Hardware schematics, netlists, and frequency responses for HealSecure AI's dual-modal biosensors.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadFile(`${selectedCircuit.id}.cir`, selectedCircuit.netlistCir)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> Download .cir
            </button>
            <button
              onClick={() => downloadFile(`${selectedCircuit.id}.asc`, selectedCircuit.ltspiceAsc)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> Download LTspice .asc
            </button>
          </div>
        </div>

        {/* Prototype Implementation vs SPICE Modeling Note */}
        <div className="mb-3.5 p-3 rounded-xl bg-blue-50/70 border border-blue-200/70 text-xs text-blue-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <strong className="text-blue-950">Hardware Prototype Architecture Note:</strong> For benchtop embedded prototyping, the <strong>MAX30102 integrated optical sensor</strong> (I2C) serves as the primary plug-and-play PPG module. The discrete <strong>OPA2388 Transimpedance Amplifier</strong> circuit is provided as an alternative high-precision analog reference design for detailed SPICE noise, bandwidth, and ambient light rejection simulations.
          </div>
        </div>

        {/* 4 Circuit Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {CIRCUITS_DATA.map((circuit) => {
            const isSelected = selectedCircuit.id === circuit.id;
            return (
              <button
                key={circuit.id}
                onClick={() => setSelectedCircuit(circuit)}
                className={`p-3 rounded-xl border text-left transition-all text-xs flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 shadow-sm text-blue-950 font-medium ring-1 ring-blue-500'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/40 text-slate-700'
                }`}
              >
                <div className="font-semibold text-slate-900 mb-1">{circuit.title}</div>
                <div className="text-[11px] text-slate-500 line-clamp-2">{circuit.subsystem}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Circuit Detail Viewer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Navigation Tabs for this Circuit */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50/70">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('schematic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'schematic'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Schematic Diagram
            </button>
            <button
              onClick={() => setActiveTab('waveforms')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'waveforms'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" /> SPICE Waveforms &amp; Bode
            </button>
            <button
              onClick={() => setActiveTab('netlist')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'netlist'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" /> Netlist (.cir / .asc)
            </button>
            <button
              onClick={() => setActiveTab('equations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'equations'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Theory &amp; Equations
            </button>
          </div>

          <span className="text-xs font-mono text-slate-500 hidden sm:inline">
            Supply: 3.3V Unipolar • Ground: 0V (GND)
          </span>
        </div>

        {/* Tab Content: 1. Schematic Diagram */}
        {activeTab === 'schematic' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">{selectedCircuit.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">{selectedCircuit.description}</p>
            </div>

            {/* Render Schematic SVG Canvas */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-inner relative overflow-x-auto">
              <div className="min-w-[700px] flex flex-col items-center">
                {/* SVG Schematic Canvas */}
                <svg viewBox="0 0 740 320" className="w-full max-w-[740px] text-slate-200 font-mono text-[11px]">
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
                    </marker>
                  </defs>

                  {/* Grid Lines */}
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="0.8" fill="#1e293b" />
                  </pattern>
                  <rect width="740" height="320" fill="url(#grid)" />

                  {/* Title block */}
                  <rect x="520" y="260" width="210" height="50" fill="#0f172a" stroke="#334155" strokeWidth="1" rx="4" />
                  <text x="530" y="280" fill="#38bdf8" fontWeight="bold">HEALSECURE AI AFE</text>
                  <text x="530" y="298" fill="#94a3b8" fontSize="9">REV 2.1 | LTSPICE CAD</text>

                  {/* SCHEMATIC 1: pH Sensor AFE */}
                  {selectedCircuit.schematicSvgType === 'ph' && (
                    <g>
                      {/* Input Biosensor Section */}
                      <rect x="30" y="90" width="90" height="80" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" rx="6" />
                      <text x="40" y="115" fill="#f8fafc" fontWeight="bold">IrOx / AgCl</text>
                      <text x="40" y="132" fill="#94a3b8" fontSize="9">pH Electrode</text>
                      <text x="40" y="150" fill="#cbd5e1" fontSize="9">Zin &gt; 100MΩ</text>

                      {/* Wire to Opamp Buffer */}
                      <path d="M 120 130 L 180 130" stroke="#38bdf8" strokeWidth="2" />
                      {/* Testpoint TP1 */}
                      <circle
                        cx="150"
                        cy="130"
                        r="6"
                        fill={activeTestpoint === 'TP1' ? '#f43f5e' : '#0284c7'}
                        stroke="#fff"
                        strokeWidth="1.5"
                        className="cursor-pointer"
                        onClick={() => setActiveTestpoint('TP1')}
                      />
                      <text x="140" y="115" fill="#38bdf8" fontSize="10">TP1</text>

                      {/* OpAmp U1A: Sub-pA Buffer (Triangle) */}
                      <polygon points="180,95 180,165 240,130" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                      <text x="188" y="120" fill="#38bdf8" fontWeight="bold">+</text>
                      <text x="188" y="150" fill="#38bdf8" fontWeight="bold">-</text>
                      <text x="195" y="134" fill="#94a3b8" fontSize="9">U1A</text>
                      <text x="185" y="80" fill="#e2e8f0" fontSize="10">LTC2050 (Ib&lt;1pA)</text>

                      {/* Buffer feedback line */}
                      <path d="M 240 130 L 260 130 L 260 180 L 160 180 L 160 152 L 180 152" fill="none" stroke="#38bdf8" strokeWidth="1.5" />

                      {/* Sallen-Key Low Pass Filter Network */}
                      <path d="M 240 130 L 300 130" stroke="#38bdf8" strokeWidth="2" />
                      {/* R1 */}
                      <rect x="300" y="122" width="35" height="16" fill="#0284c7" stroke="#38bdf8" />
                      <text x="305" y="112" fill="#94a3b8" fontSize="9">R1 160k</text>

                      <path d="M 335 130 L 380 130" stroke="#38bdf8" strokeWidth="2" />
                      {/* Node between R1 & R2 */}
                      <circle cx="380" cy="130" r="3" fill="#38bdf8" />

                      {/* R2 */}
                      <rect x="380" y="122" width="35" height="16" fill="#0284c7" stroke="#38bdf8" />
                      <text x="385" y="112" fill="#94a3b8" fontSize="9">R2 160k</text>

                      {/* C1 feedback cap */}
                      <path d="M 380 130 L 380 60 L 530 60 L 530 130" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                      <line x1="440" y1="52" x2="440" y2="68" stroke="#38bdf8" strokeWidth="2" />
                      <line x1="448" y1="52" x2="448" y2="68" stroke="#38bdf8" strokeWidth="2" />
                      <text x="430" y="44" fill="#94a3b8" fontSize="9">C1 140nF</text>

                      {/* C2 shunt cap to GND */}
                      <path d="M 430 130 L 430 190" stroke="#38bdf8" strokeWidth="1.5" />
                      <line x1="422" y1="190" x2="438" y2="190" stroke="#38bdf8" strokeWidth="2" />
                      <line x1="422" y1="196" x2="438" y2="196" stroke="#38bdf8" strokeWidth="2" />
                      {/* GND Symbol */}
                      <line x1="425" y1="202" x2="435" y2="202" stroke="#94a3b8" strokeWidth="1.5" />
                      <text x="445" y="195" fill="#94a3b8" fontSize="9">C2 70nF</text>

                      {/* OpAmp U1B: Sallen-Key Buffer */}
                      <polygon points="450,95 450,165 510,130" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                      <text x="458" y="120" fill="#38bdf8" fontWeight="bold">+</text>
                      <text x="458" y="150" fill="#38bdf8" fontWeight="bold">-</text>
                      <text x="465" y="134" fill="#94a3b8" fontSize="9">U1B</text>
                      <text x="450" y="80" fill="#e2e8f0" fontSize="10">fc = 10 Hz LPF</text>

                      {/* SK Output to Level Shifter */}
                      <path d="M 510 130 L 580 130" stroke="#38bdf8" strokeWidth="2" />
                      <circle
                        cx="540"
                        cy="130"
                        r="6"
                        fill={activeTestpoint === 'TP2' ? '#f43f5e' : '#0284c7'}
                        stroke="#fff"
                        strokeWidth="1.5"
                        className="cursor-pointer"
                        onClick={() => setActiveTestpoint('TP2')}
                      />
                      <text x="530" y="115" fill="#38bdf8" fontSize="10">TP2</text>

                      {/* Output Level Shift Stage */}
                      <rect x="580" y="100" width="100" height="60" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" rx="6" />
                      <text x="590" y="125" fill="#f8fafc" fontWeight="bold">ADC Level Shift</text>
                      <text x="590" y="142" fill="#10b981" fontSize="9">0.25V - 3.05V Out</text>

                      <path d="M 680 130 L 710 130" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow)" />
                      <text x="685" y="120" fill="#10b981" fontWeight="bold">ESP32 ADC</text>
                    </g>
                  )}

                  {/* SCHEMATIC 2: Exudate Moisture Impedance */}
                  {selectedCircuit.schematicSvgType === 'moisture' && (
                    <g>
                      {/* AC Excitation Generator */}
                      <circle cx="80" cy="130" r="30" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
                      <path d="M 65 130 Q 72 115 80 130 T 95 130" fill="none" stroke="#f59e0b" strokeWidth="2" />
                      <text x="55" y="85" fill="#f59e0b" fontWeight="bold">10 kHz AC</text>
                      <text x="50" y="175" fill="#94a3b8" fontSize="9">200mVpp Sine</text>

                      {/* Series Protection */}
                      <path d="M 110 130 L 160 130" stroke="#f59e0b" strokeWidth="2" />
                      <rect x="160" y="122" width="35" height="16" fill="#b45309" stroke="#f59e0b" />
                      <text x="165" y="112" fill="#94a3b8" fontSize="9">R_lim 10k</text>

                      {/* Interdigitated Array Bio-Impedance Sensor */}
                      <path d="M 195 130 L 250 130" stroke="#f59e0b" strokeWidth="2" />
                      <rect x="250" y="90" width="90" height="80" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" rx="6" />
                      <text x="260" y="115" fill="#f8fafc" fontWeight="bold">Wound IDA</text>
                      <text x="260" y="132" fill="#94a3b8" fontSize="9">R_exudate || C</text>
                      <text x="260" y="150" fill="#cbd5e1" fontSize="9">0.5k - 50k Ω</text>

                      {/* Instrumentation Amp AD8220 */}
                      <path d="M 340 130 L 400 130" stroke="#f59e0b" strokeWidth="2" />
                      <polygon points="400,95 400,165 460,130" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
                      <text x="410" y="134" fill="#94a3b8" fontSize="9">AD8220</text>
                      <text x="395" y="80" fill="#e2e8f0" fontSize="10">Inst. Amp</text>

                      {/* Precision Rectifier & Envelope Filter */}
                      <path d="M 460 130 L 520 130" stroke="#f59e0b" strokeWidth="2" />
                      <rect x="520" y="100" width="100" height="60" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" rx="6" />
                      <text x="530" y="125" fill="#f8fafc" fontWeight="bold">Active Rectifier</text>
                      <text x="530" y="142" fill="#10b981" fontSize="9">Envelope LPF (50Hz)</text>

                      {/* Output to ADC */}
                      <path d="M 620 130 L 680 130" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow)" />
                      <text x="635" y="120" fill="#10b981" fontWeight="bold">V_DC (Exudate)</text>
                    </g>
                  )}

                  {/* SCHEMATIC 3: Differential Temperature Bridge */}
                  {selectedCircuit.schematicSvgType === 'temp' && (
                    <g>
                      {/* Precision 2.5V Voltage Ref */}
                      <rect x="30" y="105" width="80" height="50" fill="#1e293b" stroke="#f97316" strokeWidth="1.5" rx="4" />
                      <text x="40" y="125" fill="#f8fafc" fontWeight="bold">LM4040</text>
                      <text x="40" y="142" fill="#f97316" fontSize="9">2.500V Ref</text>

                      <path d="M 110 130 L 170 130" stroke="#f97316" strokeWidth="2" />

                      {/* Wheatstone Bridge Diamond */}
                      {/* Top Node */}
                      <circle cx="250" cy="70" r="3" fill="#f97316" />
                      <path d="M 170 130 L 250 70" stroke="#f97316" strokeWidth="2" />

                      {/* Arm 1: R1 10k & NTC_Wound */}
                      <path d="M 250 70 L 210 130" stroke="#f97316" strokeWidth="2" />
                      <rect x="200" y="90" width="20" height="15" fill="#c2410c" stroke="#f97316" />
                      <text x="160" y="102" fill="#94a3b8" fontSize="9">R1 10k</text>

                      <path d="M 210 130 L 250 190" stroke="#f97316" strokeWidth="2" />
                      <rect x="200" y="150" width="20" height="15" fill="#ea580c" stroke="#f97316" />
                      <text x="140" y="162" fill="#ea580c" fontSize="9">NTC_Wound</text>

                      {/* Arm 2: R2 10k & NTC_Systemic */}
                      <path d="M 250 70 L 290 130" stroke="#f97316" strokeWidth="2" />
                      <rect x="280" y="90" width="20" height="15" fill="#c2410c" stroke="#f97316" />
                      <text x="305" y="102" fill="#94a3b8" fontSize="9">R2 10k</text>

                      <path d="M 290 130 L 250 190" stroke="#f97316" strokeWidth="2" />
                      <rect x="280" y="150" width="20" height="15" fill="#94a3b8" stroke="#f97316" />
                      <text x="305" y="162" fill="#94a3b8" fontSize="9">NTC_Systemic</text>

                      {/* Bottom Node GND */}
                      <circle cx="250" cy="190" r="3" fill="#f97316" />
                      <line x1="250" y1="190" x2="250" y2="210" stroke="#f97316" strokeWidth="1.5" />
                      <line x1="242" y1="210" x2="258" y2="210" stroke="#94a3b8" strokeWidth="1.5" />

                      {/* Differential lines to INA333 */}
                      <path d="M 210 130 L 360 115" stroke="#f97316" strokeWidth="1.8" />
                      <path d="M 290 130 L 360 145" stroke="#f97316" strokeWidth="1.8" />

                      {/* INA333 Instrumentation Amp */}
                      <polygon points="360,95 360,165 420,130" fill="#0f172a" stroke="#f97316" strokeWidth="2" />
                      <text x="370" y="134" fill="#94a3b8" fontSize="9">INA333</text>
                      <text x="355" y="80" fill="#e2e8f0" fontSize="10">Gain = 101 (RG=1k)</text>

                      {/* Output to ADC */}
                      <path d="M 420 130 L 520 130" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow)" />
                      <text x="440" y="120" fill="#10b981" fontWeight="bold">V_ΔT (200mV/°C)</text>
                    </g>
                  )}

                  {/* SCHEMATIC 4: PPG Optical Front-End */}
                  {selectedCircuit.schematicSvgType === 'ppg' && (
                    <g>
                      {/* Photodiode PIN */}
                      <rect x="40" y="100" width="80" height="60" fill="#1e293b" stroke="#ec4899" strokeWidth="1.5" rx="4" />
                      <text x="50" y="125" fill="#f8fafc" fontWeight="bold">Si PIN PD</text>
                      <text x="50" y="142" fill="#ec4899" fontSize="9">Red/IR Current</text>

                      <path d="M 120 130 L 180 130" stroke="#ec4899" strokeWidth="2" />

                      {/* Transimpedance OpAmp U5A */}
                      <polygon points="180,95 180,165 240,130" fill="#0f172a" stroke="#ec4899" strokeWidth="2" />
                      <text x="188" y="120" fill="#ec4899" fontWeight="bold">-</text>
                      <text x="188" y="150" fill="#ec4899" fontWeight="bold">+</text>
                      <text x="195" y="134" fill="#94a3b8" fontSize="9">TIA</text>
                      <text x="175" y="80" fill="#e2e8f0" fontSize="10">OPA2388 TIA</text>

                      {/* TIA Feedback R_TIA = 1M */}
                      <path d="M 240 130 L 260 130 L 260 55 L 160 55 L 160 120 L 180 120" fill="none" stroke="#ec4899" strokeWidth="1.5" />
                      <rect x="195" y="47" width="30" height="16" fill="#be185d" stroke="#ec4899" />
                      <text x="198" y="40" fill="#94a3b8" fontSize="9">R_TIA 1MΩ</text>

                      {/* AC High Pass Filter (fc = 0.5 Hz) */}
                      <path d="M 240 130 L 320 130" stroke="#ec4899" strokeWidth="2" />
                      <line x1="320" y1="120" x2="320" y2="140" stroke="#ec4899" strokeWidth="2" />
                      <line x1="328" y1="120" x2="328" y2="140" stroke="#ec4899" strokeWidth="2" />
                      <text x="310" y="110" fill="#94a3b8" fontSize="9">C_HP 3.3uF</text>

                      {/* Active Sallen-Key Low Pass Filter (fc = 5.0 Hz) */}
                      <path d="M 328 130 L 410 130" stroke="#ec4899" strokeWidth="2" />
                      <polygon points="410,95 410,165 470,130" fill="#0f172a" stroke="#ec4899" strokeWidth="2" />
                      <text x="425" y="134" fill="#94a3b8" fontSize="9">SK LPF</text>
                      <text x="405" y="80" fill="#e2e8f0" fontSize="10">0.5 - 5Hz Passband</text>

                      {/* Output to ADC */}
                      <path d="M 470 130 L 570 130" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow)" />
                      <text x="490" y="120" fill="#10b981" fontWeight="bold">PPG AC Pulse</text>
                    </g>
                  )}
                </svg>

                {/* Testpoint Interactive Inspector */}
                <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs w-full flex flex-wrap items-center justify-between gap-3 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span className="text-slate-300">Active Testpoint:</span>
                    <span className="text-cyan-300 font-bold">{activeTestpoint}</span>
                  </div>
                  <div className="text-slate-400">
                    Stage Function: {selectedCircuit.subsystem}
                  </div>
                  <div className="text-emerald-400">
                    Signal Condition: Cleaned &amp; Normalized for ESP32 ADC
                  </div>
                </div>
              </div>
            </div>

            {/* Key Engineering Specifications Grid */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" /> Key Design Specifications
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {selectedCircuit.keySpecs.map((spec, i) => (
                  <div key={i} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700">
                    {spec}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: 2. SPICE Waveforms & Bode Plot */}
        {activeTab === 'waveforms' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Transient Response Graph */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-inner">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-mono">
                  <span className="text-cyan-400 font-bold">.tran 0 0.1 0 1u (Transient Response)</span>
                  <span className="text-slate-400">Vin(t) vs Vout(t)</span>
                </div>

                <div className="h-56 relative flex items-end">
                  <svg viewBox="0 0 400 180" className="w-full h-full">
                    {/* Horizontal grid lines */}
                    <line x1="0" y1="30" x2="400" y2="30" stroke="#1e293b" />
                    <line x1="0" y1="90" x2="400" y2="90" stroke="#1e293b" />
                    <line x1="0" y1="150" x2="400" y2="150" stroke="#1e293b" />

                    {/* Vin curve (gray/dashed) */}
                    <path
                      d={selectedCircuit.simulationData.transientTime
                        .map((t, idx) => {
                          const x = (idx / (selectedCircuit.simulationData.transientTime.length - 1)) * 400;
                          const vin = selectedCircuit.simulationData.vin[idx];
                          const y = 90 - vin * 250;
                          return `${idx === 0 ? 'M' : 'L'} ${x} ${Math.max(10, Math.min(170, y))}`;
                        })
                        .join(' ')}
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="1.2"
                      strokeDasharray="4 4"
                    />

                    {/* Vout curve (cyan/bold) */}
                    <path
                      d={selectedCircuit.simulationData.transientTime
                        .map((t, idx) => {
                          const x = (idx / (selectedCircuit.simulationData.transientTime.length - 1)) * 400;
                          const vout = selectedCircuit.simulationData.vout[idx];
                          const y = 170 - (vout / 3.3) * 150;
                          return `${idx === 0 ? 'M' : 'L'} ${x} ${Math.max(10, Math.min(170, y))}`;
                        })
                        .join(' ')}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.4"
                    />
                  </svg>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 pt-2 border-t border-slate-800">
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="w-2.5 h-0.5 bg-slate-400 inline-block" /> Raw Input Vin
                  </span>
                  <span className="flex items-center gap-1 text-cyan-400 font-bold">
                    <span className="w-2.5 h-1 bg-cyan-400 inline-block" /> Conditioned Output Vout
                  </span>
                </div>
              </div>

              {/* Frequency Response Bode Plot */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-inner">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-mono">
                  <span className="text-blue-400 font-bold">.ac dec 20 0.1 100k (Bode Magnitude)</span>
                  <span className="text-slate-400">|H(f)| Gain (dB)</span>
                </div>

                <div className="h-56 relative flex items-end">
                  <svg viewBox="0 0 400 180" className="w-full h-full">
                    {/* Grid */}
                    <line x1="0" y1="40" x2="400" y2="40" stroke="#1e293b" />
                    <line x1="0" y1="100" x2="400" y2="100" stroke="#1e293b" />
                    <line x1="0" y1="160" x2="400" y2="160" stroke="#1e293b" />

                    {/* Cutoff marker at x=140 */}
                    <line x1="140" y1="10" x2="140" y2="170" stroke="#f43f5e" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="145" y="25" fill="#f43f5e" fontSize="9" fontFamily="monospace">fc Cutoff</text>

                    {/* Bode Curve */}
                    <path
                      d={selectedCircuit.simulationData.freq
                        .map((f, idx) => {
                          const x = (idx / (selectedCircuit.simulationData.freq.length - 1)) * 400;
                          const gain = selectedCircuit.simulationData.gainDb[idx];
                          // map gain (-60dB to +20dB) to Y (170 to 20)
                          const y = 170 - ((gain + 60) / 80) * 150;
                          return `${idx === 0 ? 'M' : 'L'} ${x} ${Math.max(10, Math.min(170, y))}`;
                        })
                        .join(' ')}
                      fill="none"
                      stroke="#60a5fa"
                      strokeWidth="2.2"
                    />
                  </svg>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 pt-2 border-t border-slate-800">
                  <span>0.1 Hz (Passband: 0 dB)</span>
                  <span className="text-rose-400 font-bold">Simulated 50 Hz attenuation: -46.2 dB</span>
                  <span>100 kHz</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: 3. Netlist (.cir / .asc) */}
        {activeTab === 'netlist' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 font-mono">
                Standard SPICE netlist syntax compatible with LTspice XVII, LTspice 24, Ngspice, and PSpice.
              </span>
              <button
                onClick={() => copyToClipboard(selectedCircuit.netlistCir, 'cir')}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                {copiedNetlist ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedNetlist ? 'Copied to Clipboard!' : 'Copy SPICE Netlist'}
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto border border-slate-800 max-h-96 leading-relaxed">
              {selectedCircuit.netlistCir}
            </pre>
          </div>
        )}

        {/* Tab Content: 4. Theory & Equations */}
        {activeTab === 'equations' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" /> Analytical Design Equations &amp; Principles
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-4xl mb-4">
                {selectedCircuit.principle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedCircuit.designEquations.map((eq, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-2">
                  <div className="font-mono text-sm font-bold text-blue-700 bg-white p-2.5 rounded-lg border border-slate-200 text-center shadow-xs">
                    {eq.formula}
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{eq.explanation}</p>
                </div>
              ))}
            </div>

            {/* Components Subsystem Table */}
            <div className="mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                Subsystem Component Bill (LTspice Hierarchy)
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/75 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Designator</th>
                      <th className="py-2.5 px-3">Nominal Value</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Footprint / Package</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedCircuit.componentsList.map((comp, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-mono font-bold text-blue-700">{comp.ref}</td>
                        <td className="py-2 px-3 font-mono text-slate-900">{comp.value}</td>
                        <td className="py-2 px-3 text-slate-600">{comp.desc}</td>
                        <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{comp.package}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
