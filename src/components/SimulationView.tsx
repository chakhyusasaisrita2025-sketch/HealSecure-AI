import React, { useState, useEffect, useRef } from 'react';
import {
  PatientVitals,
  WoundBiomarkers,
  ClinicalScenario,
  DrugRecord,
  FAERSAssociation,
  SHAPContribution,
} from '../types';
import { CLINICAL_SCENARIOS, INITIAL_DRUGS, FAERS_DATABASE } from '../data/clinicalData';
import { createAuditEvent } from '../blockchain/auditService';
import {
  AlertCircle,
  Pill,
  Heart,
  Droplet,
  Thermometer,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Send,
  Info,
  Cable,
} from 'lucide-react';
import { updateTelemetry } from '../services/telemetryStream';

interface SimulationViewProps {
  isSimulating: boolean;
  onRiskScoreUpdate: (score: number) => void;
}

export const SimulationView: React.FC<SimulationViewProps> = ({ isSimulating, onRiskScoreUpdate }) => {
  // Active Scenario state
  const [selectedScenario, setSelectedScenario] = useState<ClinicalScenario>(CLINICAL_SCENARIOS[0]);

  // Real-time controllable parameters
  const [vitals, setVitals] = useState<PatientVitals>(CLINICAL_SCENARIOS[0].vitals);
  const [biomarkers, setBiomarkers] = useState<WoundBiomarkers>(CLINICAL_SCENARIOS[0].biomarkers);
  const [activeDrugIds, setActiveDrugIds] = useState<string[]>(CLINICAL_SCENARIOS[0].activeDrugs);

  // Clinician alert modal simulation
  const [alertSent, setAlertSent] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Canvas waveform reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const waveOffsetRef = useRef(0);

  // Load a scenario
  const applyScenario = (scenario: ClinicalScenario) => {
    setSelectedScenario(scenario);
    setVitals({ ...scenario.vitals });
    setBiomarkers({ ...scenario.biomarkers });
    setActiveDrugIds([...scenario.activeDrugs]);
    setAlertSent(false);
    setAlertMessage(null);
  };

  // Toggle drug
  const toggleDrug = (drugId: string) => {
    setActiveDrugIds((prev) =>
      prev.includes(drugId) ? prev.filter((id) => id !== drugId) : [...prev, drugId]
    );
  };

  // Compute calculated ΔT
  const calculatedDeltaT = parseFloat((biomarkers.woundTemp - vitals.systemicTemp).toFixed(2));

  // Determine active symptoms
  const activeSymptoms: string[] = [];
  if (vitals.spo2 < 90) activeSymptoms.push('Desaturation');
  if (vitals.heartRate < 100) activeSymptoms.push('Bradycardia');
  if (vitals.heartRate > 165) activeSymptoms.push('Tachycardia');
  if (vitals.respiratoryRate < 25) activeSymptoms.push('Apnea');

  // Query openFDA FAERS Reverse Matcher
  const faersMatches: FAERSAssociation[] = [];
  activeSymptoms.forEach((sym) => {
    const records = FAERS_DATABASE[sym] || [];
    records.forEach((rec) => {
      // Check if current drug is active
      const isActive = activeDrugIds.some((id) => {
        const drug = INITIAL_DRUGS.find((d) => d.id === id);
        return drug && drug.genericName.toLowerCase().includes(rec.drugName.toLowerCase());
      });
      if (isActive) {
        faersMatches.push(rec);
      }
    });
  });

  // Calculate SSI Risk Score (0-100)
  // Localized alkaline shift + hyperemia delta + exudate
  let ssiScore = 0;
  if (biomarkers.ph > 7.0) ssiScore += Math.min(45, (biomarkers.ph - 7.0) * 35);
  if (calculatedDeltaT > 0.8) ssiScore += Math.min(35, (calculatedDeltaT - 0.5) * 25);
  if (biomarkers.moisture > 60) ssiScore += (biomarkers.moisture - 60) * 0.5;
  ssiScore = Math.min(100, Math.max(5, ssiScore));

  // Calculate ADR Risk Score (0-100)
  let adrScore = 0;
  if (activeSymptoms.length > 0 && faersMatches.length > 0) {
    const maxROR = Math.max(...faersMatches.map((m) => m.reportingOddsRatio));
    adrScore = Math.min(95, 30 + maxROR * 12 + activeSymptoms.length * 10);
  } else if (activeSymptoms.length > 0) {
    adrScore = 40; // symptom without known drug association
  } else {
    adrScore = 8;
  }

  // Fused Readmission Risk Score (Unified Model)
  const fusedRisk = Math.min(100, Math.max(10, Math.round(0.55 * ssiScore + 0.45 * adrScore)));

  // Report risk score to parent
  useEffect(() => {
    onRiskScoreUpdate(fusedRisk);
  }, [fusedRisk, onRiskScoreUpdate]);

  // Synchronize telemetry with Arduino & LCD Hardware Portal
  useEffect(() => {
    updateTelemetry({
      scenarioId: selectedScenario.id,
      scenarioTitle: selectedScenario.title,
      heartRate: vitals.heartRate,
      spo2: vitals.spo2,
      systemicTemp: vitals.systemicTemp,
      respiratoryRate: vitals.respiratoryRate,
      ph: biomarkers.ph,
      moisture: biomarkers.moisture,
      woundTemp: biomarkers.woundTemp,
      deltaT: calculatedDeltaT,
      ssiRisk: Math.round(ssiScore),
      adrRisk: Math.round(adrScore),
      fusedRisk: fusedRisk,
    });
  }, [
    vitals,
    biomarkers,
    calculatedDeltaT,
    ssiScore,
    adrScore,
    fusedRisk,
    selectedScenario.id,
    selectedScenario.title,
  ]);

  // Compute real-time SHAP feature attribution
  const shapContributions: SHAPContribution[] = [
    {
      feature: 'Wound pH Alkalinization',
      value: `pH ${biomarkers.ph.toFixed(1)} (Normal 6.5)`,
      impact: biomarkers.ph > 7.2 ? parseFloat(((biomarkers.ph - 6.8) * 22).toFixed(1)) : -4.2,
      category: 'Local SSI',
    },
    {
      feature: 'Hyperemia Thermal Gradient (ΔT)',
      value: `+${calculatedDeltaT}°C (Alarm > 1.2°C)`,
      impact: calculatedDeltaT > 1.0 ? parseFloat((calculatedDeltaT * 15).toFixed(1)) : -3.5,
      category: 'Local SSI',
    },
    {
      feature: 'Exudate Bio-Impedance Wetness',
      value: `${biomarkers.moisture}% Saturation`,
      impact: biomarkers.moisture > 65 ? parseFloat(((biomarkers.moisture - 50) * 0.4).toFixed(1)) : -2.0,
      category: 'Local SSI',
    },
    {
      feature: 'Pulse Oximetry Desaturation (SpO2)',
      value: `${vitals.spo2}% (Normal > 95%)`,
      impact: vitals.spo2 < 92 ? parseFloat(((95 - vitals.spo2) * 2.8).toFixed(1)) : -5.0,
      category: 'Systemic ADR',
    },
    {
      feature: 'Cardiovascular Brady/Tachycardia',
      value: `${vitals.heartRate} bpm`,
      impact: vitals.heartRate < 105 || vitals.heartRate > 170 ? 18.5 : -4.0,
      category: 'Systemic ADR',
    },
    {
      feature: 'openFDA FAERS Drug Association',
      value: faersMatches.length > 0 ? `${faersMatches[0].drugName} (ROR ${faersMatches[0].reportingOddsRatio})` : 'No Match',
      impact: faersMatches.length > 0 ? 21.0 : -6.0,
      category: 'Interaction',
    },
  ];

  // Animate real-time physiological canvas waveforms
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      if (isSimulating) {
        waveOffsetRef.current += vitals.heartRate / 120;
      }

      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#090d16'; // Deep clinical dark
      ctx.fillRect(0, 0, width, height);

      // Draw subtle grid lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Waveform 1: PPG Pulse Oximetry Wave (Green)
      const ppgY = height * 0.28;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const t = (x + waveOffsetRef.current * 4) * 0.05;
        const cycle = t % (2 * Math.PI);
        // Arterial waveform approximation with dicrotic notch
        let wave = Math.sin(cycle);
        if (cycle > 1.2 && cycle < 2.4) {
          wave += 0.4 * Math.sin(cycle * 3);
        }
        // Amplitude modulated by SpO2
        const amp = (vitals.spo2 / 100) * 32;
        const y = ppgY - wave * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Label 1
      ctx.fillStyle = '#34d399';
      ctx.font = '11px "Fira Code", monospace';
      ctx.fillText(`PPG PLETH (HR: ${vitals.heartRate} bpm | SpO2: ${vitals.spo2}%)`, 12, ppgY - 36);

      // Waveform 2: Wound Biomarker Trajectory (Cyan - pH & Orange - Temp)
      const woundY = height * 0.72;
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const drift = Math.sin((x + waveOffsetRef.current) * 0.01) * 6;
        const phNorm = ((biomarkers.ph - 5.5) / 4.0) * 45;
        const y = woundY - phNorm + drift;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Waveform 3: Hyperemia Delta T
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const noise = Math.sin((x * 0.1) + waveOffsetRef.current * 0.5) * 3;
        const tempNorm = (calculatedDeltaT / 2.5) * 35;
        const y = woundY + 25 - tempNorm + noise;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Label 2
      ctx.fillStyle = '#38bdf8';
      ctx.font = '11px "Fira Code", monospace';
      ctx.fillText(`WOUND pH: ${biomarkers.ph.toFixed(2)} (Acidic/Alkaline)`, 12, woundY - 50);

      ctx.fillStyle = '#fb923c';
      ctx.fillText(`LOCAL HYPEREMIA ΔT: +${calculatedDeltaT}°C`, 260, woundY - 50);

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isSimulating, vitals, biomarkers, calculatedDeltaT]);

  // Dispatch Clinician Alert
  const handleDispatchAlert = async () => {
    setAlertSent(true);
    const timeStr = new Date().toLocaleTimeString();
    try {
  await createAuditEvent("AI_ASSESSMENT", {
    scenarioId: selectedScenario.id,
    ssiRisk: Math.round(ssiScore),
    adrRisk: Math.round(adrScore),
    fusedRisk,
    activeSymptoms,
    faersMatchCount: faersMatches.length,
    deltaT: calculatedDeltaT,
    woundPh: biomarkers.ph,
    moisture: biomarkers.moisture,
  });
} catch (error) {
  console.error("AUDIT ERROR:", error);
}
try {
  await createAuditEvent("ALERT_GENERATED", {
    scenarioId: selectedScenario.id,
    fusedRisk,
    alertType: "CLINICIAN_SMS_AND_BEDSIDE_PAGER",
    alertTime: timeStr,
  });
} catch (error) {
  console.error("ALERT AUDIT ERROR:", error);
}
    if (fusedRisk >= 70) {
      setAlertMessage(
        `🚨 [CRITICAL SENTINEL ALERT] Dispatched at ${timeStr} to NICU Attending: Readmission Risk ${fusedRisk}%. Detected: ${
          activeSymptoms.length > 0 ? activeSymptoms.join(', ') : 'Biomarker Shift'
        }. Probable Cause: ${
          faersMatches.length > 0 ? `${faersMatches[0].drugName} (FAERS ROR ${faersMatches[0].reportingOddsRatio})` : 'Surgical Site Infection'
        }.`
      );
    } else if (fusedRisk >= 40) {
      setAlertMessage(
        `⚠️ [MODERATE WATCH ALERT] Dispatched at ${timeStr}: Readmission Risk ${fusedRisk}%. SSI Hyperemia ΔT: +${calculatedDeltaT}°C, pH: ${biomarkers.ph.toFixed(1)}.`
      );
    } else {
      setAlertMessage(`ℹ️ [ROUTINE STATUS] Dispatched at ${timeStr}: Patient vitals and wound bed stable.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Clinical & Regulatory Disclaimer Banner */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3 shadow-xs">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-bold uppercase tracking-wider text-[11px] text-amber-950 flex items-center gap-2">
            <span>Clinical Decision-Support &amp; Research Disclaimer</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-mono text-[10px]">
              Prototype / Research Platform
            </span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Prototype / research concept. HealSecure AI is intended as a clinical decision-support research platform and is not a standalone diagnostic device. Sensor thresholds, AI performance and clinical utility require prospective validation. All physiological traces, risk scores, and biomarker streams presented herein are in-silico simulation models.
          </p>
          <p className="text-[10px] text-amber-700 font-medium pt-1">
            * Thresholds shown are illustrative/prototype values and require patient-specific and clinical calibration. Neonatal HR and SpO₂ alert boundaries are configurable according to patient gestational age, clinical context, and clinician-defined limits.
          </p>
        </div>
      </div>

      {/* 1. Clinical Scenarios Quick Selector */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-600" />
              Pre-Configured Clinical Scenarios (In-Silico Simulation Demonstration)
            </h2>
            <p className="text-xs text-slate-500">
              Select an illustrative benchmark case to simulate multi-modal biosensing and FAERS pharmacovigilance association.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent('healsecure-navigate-tab', { detail: 'arduino' })
                );
              }}
              className="text-xs text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition shadow-xs cursor-pointer"
            >
              <Cable className="w-3.5 h-3.5 text-cyan-600" />
              <span>Arduino &amp; LCD Portal</span>
            </button>

            <button
              onClick={() => applyScenario(CLINICAL_SCENARIOS[0])}
              className="text-xs text-slate-600 hover:text-cyan-700 flex items-center gap-1 font-medium px-2 py-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset to Baseline
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {CLINICAL_SCENARIOS.map((sc) => {
            const isSelected = selectedScenario.id === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => applyScenario(sc)}
                className={`p-3 text-left rounded-xl border transition-all text-xs flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-600 bg-cyan-50/60 shadow-sm text-cyan-950 font-medium ring-1 ring-cyan-500'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/40 text-slate-700'
                }`}
              >
                <div>
                  <div className="font-semibold text-slate-900 mb-1 flex items-center justify-between">
                    <span>{sc.title}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        sc.category === 'Normal'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sc.category === 'SSI'
                          ? 'bg-amber-100 text-amber-800'
                          : sc.category === 'ADR'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {sc.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{sc.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Top Dual-Modal Physiological Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Heart Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500" /> Heart Rate
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">PPG / AFE</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-2xl font-black font-mono ${
                vitals.heartRate < 100
                  ? 'text-rose-600'
                  : vitals.heartRate > 165
                  ? 'text-amber-600'
                  : 'text-slate-900'
              }`}
            >
              {vitals.heartRate}
            </span>
            <span className="text-xs text-slate-500 font-medium">bpm</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Neonatal Ref: 120 - 160 bpm</p>
        </div>

        {/* SpO2 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-500" /> SpO₂ Pulse
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">MAX30102</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-2xl font-black font-mono ${
                vitals.spo2 < 90 ? 'text-rose-600' : vitals.spo2 < 94 ? 'text-amber-600' : 'text-slate-900'
              }`}
            >
              {vitals.spo2}
            </span>
            <span className="text-xs text-slate-500 font-medium">%</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Illustrative Alert: &lt; 90% (Hypoxia)</p>
        </div>

        {/* Wound Bed pH */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5 text-cyan-500" /> Wound pH
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-50 text-cyan-700 font-bold">IrOx AFE</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-2xl font-black font-mono ${
                biomarkers.ph > 7.3 ? 'text-rose-600' : biomarkers.ph > 7.0 ? 'text-amber-600' : 'text-emerald-700'
              }`}
            >
              {biomarkers.ph.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 font-medium">pH</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Illustrative Normal: 5.5 - 6.8</p>
        </div>

        {/* Hyperemia Temp Delta (ΔT) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-orange-500" /> Hyperemia ΔT
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-orange-50 text-orange-700 font-bold">INA333</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-2xl font-black font-mono ${
                calculatedDeltaT >= 1.2 ? 'text-rose-600' : calculatedDeltaT >= 0.8 ? 'text-amber-600' : 'text-slate-900'
              }`}
            >
              +{calculatedDeltaT}
            </span>
            <span className="text-xs text-slate-500 font-medium">°C</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Illustrative Alert: ΔT ≥ +1.20°C</p>
        </div>

        {/* Wound Moisture Exudate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5 text-blue-500" /> Exudate Wetness
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700">IDE 10kHz</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-slate-900">{biomarkers.moisture}</span>
            <span className="text-xs text-slate-500 font-medium">%</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Impedance: {(45 / (biomarkers.moisture / 20)).toFixed(1)} kΩ</p>
        </div>

        {/* Systemic Body Temp */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-slate-600" /> Systemic Temp
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">Core</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-2xl font-black font-mono ${
                vitals.systemicTemp > 38.0 ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {vitals.systemicTemp.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 font-medium">°C</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Wound: {biomarkers.woundTemp.toFixed(1)}°C</p>
        </div>
      </div>

      {/* 3. Live Telemetry Waveforms & Interactive Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Oscilloscope Canvas */}
        <div className="lg:col-span-2 bg-slate-950 rounded-2xl p-4 border border-slate-800 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                Real-Time Telemetry Stream (100 SPS ESP32 ADC)
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Pleth
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" /> pH
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" /> ΔT
              </span>
            </div>
          </div>

          <div className="w-full h-64 relative">
            <canvas ref={canvasRef} width={760} height={256} className="w-full h-full rounded-lg" />
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Scan Sweep: 25 mm/sec</span>
            <span>AFE Filter: 10Hz Sallen-Key Butterworth + 50Hz Notch</span>
            <span>Sub-pA LTC2050 Active</span>
          </div>
        </div>

        {/* Live Biomarker Control Sliders */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyan-600" /> Interactive Sensor Sliders
              </h3>
              <span className="text-[11px] text-cyan-600 font-semibold">Live Override</span>
            </div>

            <div className="space-y-3.5">
              {/* Heart Rate Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Heart Rate</span>
                  <span className="font-mono font-bold text-slate-900">{vitals.heartRate} bpm</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="200"
                  value={vitals.heartRate}
                  onChange={(e) => setVitals({ ...vitals, heartRate: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              {/* SpO2 Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">SpO₂ Oxygenation</span>
                  <span className="font-mono font-bold text-slate-900">{vitals.spo2}%</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="100"
                  value={vitals.spo2}
                  onChange={(e) => setVitals({ ...vitals, spo2: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Wound pH Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Wound Bed pH</span>
                  <span className="font-mono font-bold text-cyan-700">{biomarkers.ph.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="5.0"
                  max="9.5"
                  step="0.1"
                  value={biomarkers.ph}
                  onChange={(e) => setBiomarkers({ ...biomarkers, ph: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                />
              </div>

              {/* Wound Temp Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Wound Temp (Local)</span>
                  <span className="font-mono font-bold text-orange-600">{biomarkers.woundTemp.toFixed(1)}°C</span>
                </div>
                <input
                  type="range"
                  min="36.0"
                  max="41.0"
                  step="0.1"
                  value={biomarkers.woundTemp}
                  onChange={(e) => setBiomarkers({ ...biomarkers, woundTemp: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>

              {/* Exudate Moisture Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Exudate Saturation</span>
                  <span className="font-mono font-bold text-blue-600">{biomarkers.moisture}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={biomarkers.moisture}
                  onChange={(e) => setBiomarkers({ ...biomarkers, moisture: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Dual-modal correlation engine active</span>
            <span className="font-bold text-slate-700">ΔT: +{calculatedDeltaT}°C</span>
          </div>
        </div>
      </div>

      {/* 4. Parallel AI Engines & openFDA FAERS Reverse Matcher */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Medications & openFDA Reverse ADR Engine (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Infant Medications Box */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-purple-600" /> Active Infant Pharmacotherapy List (NICU Bedside Log)
              </h3>
              <span className="text-xs text-slate-500">{activeDrugIds.length} Prescribed Drugs</span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Over 70% of NICU infants receive concurrent multi-drug regimens. Toggle medications to evaluate real-time drug-symptom correlation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INITIAL_DRUGS.map((drug) => {
                const isActive = activeDrugIds.includes(drug.id);
                return (
                  <button
                    key={drug.id}
                    onClick={() => toggleDrug(drug.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all text-xs flex items-center justify-between ${
                      isActive
                        ? 'border-purple-300 bg-purple-50/70 text-purple-950 font-medium'
                        : 'border-slate-200 bg-slate-50/50 text-slate-500 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{drug.name}</div>
                      <div className="text-[10px] text-slate-500">{drug.dosage} • {drug.route}</div>
                    </div>
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isActive ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {isActive ? '✓' : '+'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* openFDA FAERS Reverse Event-to-Drug Engine */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-600" />
                openFDA FAERS Pharmacovigilance Reference Layer (ADR Risk Correlation)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-100 text-cyan-800 font-semibold">
                FAERS Knowledge Base
              </span>
            </div>

            <div className="text-xs text-slate-600 mb-3">
              When vital anomalies occur, the system queries the curated FDA Adverse Event Reporting System (FAERS) disproportionality metrics (Reporting Odds Ratio ROR &amp; Proportional Reporting Ratio PRR) mapped against active prescriptions.
            </div>

            {activeSymptoms.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>No acute systemic vital abnormalities detected. Heart rate, SpO₂, and respiration are within normal physiological bounds.</span>
              </div>
            ) : faersMatches.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  Detected Vital Sign Flag: <strong>{activeSymptoms.join(', ')}</strong>. No direct adverse event matches found for currently active medications in the reference layer. Potential non-pharmacological clinical cause.
                </span>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                  Ranked Medication Adverse Event Associations (By Reporting Odds Ratio):
                </div>

                {faersMatches.map((match, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-rose-200 bg-rose-50/40 text-xs flex flex-col space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-rose-950 text-sm">{match.drugName}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-medium">
                          Symptom: {match.symptom}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-rose-700 text-sm">
                          ROR: {match.reportingOddsRatio.toFixed(2)}x
                        </span>
                        <span className="text-[10px] text-slate-500 block">PRR: {match.proportionalReportingRatio.toFixed(2)}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-700 leading-relaxed">
                      <strong className="text-slate-900">Mechanism:</strong> {match.mechanism}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-rose-200/60">
                      <span>FDA FAERS Reports: {match.caseReports} indexed cases</span>
                      <span className="font-bold text-rose-700">Association Index: {match.confidenceScore}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Fused Readmission Risk & SHAP Explainability (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Fused Risk Score Gauge */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-600" /> Unified Readmission Risk Score
                </h3>
                <span className="text-xs text-slate-400">Fused 0-100%</span>
              </div>

              <div className="flex items-center gap-4 my-3">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke={fusedRisk >= 70 ? '#e11d48' : fusedRisk >= 40 ? '#f59e0b' : '#10b981'}
                      strokeWidth="8"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * fusedRisk) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <span className="absolute text-xl font-mono font-black text-slate-900">{fusedRisk}%</span>
                </div>

                <div className="space-y-1">
                  <div
                    className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                      fusedRisk >= 70
                        ? 'bg-rose-100 text-rose-800'
                        : fusedRisk >= 40
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {fusedRisk >= 70 ? 'CRITICAL RISK - ACTION REQUIRED' : fusedRisk >= 40 ? 'MODERATE RISK - WATCHLIST' : 'LOW RISK - STABLE'}
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">
                    {fusedRisk >= 70
                      ? 'Cross-validated threshold breached. High probability of acute ADR or Surgical Site Infection.'
                      : fusedRisk >= 40
                      ? 'Early pre-clinical biomarker shift observed. Continuous telemetry recommended.'
                      : 'Physiological parameters within baseline post-operative margins.'}
                  </p>
                </div>
              </div>

              {/* Sub-Risk Breakdown */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-500">Wound SSI Probability</div>
                  <div className="font-mono font-bold text-slate-900">{Math.round(ssiScore)}%</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-500">Adverse Drug Reaction (ADR)</div>
                  <div className="font-mono font-bold text-slate-900">{Math.round(adrScore)}%</div>
                </div>
              </div>
            </div>

            {/* Clinician Notification Button */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={handleDispatchAlert}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                Simulate Clinician SMS / Bedside Pager Alert
              </button>

              {alertSent && alertMessage && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono leading-relaxed border border-slate-800">
                  {alertMessage}
                </div>
              )}
            </div>
          </div>

          {/* SHAP Feature Contribution Waterfall */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-cyan-600" /> Simulation Example: SHAP Feature Attribution
              </h3>
              <span className="text-[10px] font-mono text-slate-500">TreeExplainer</span>
            </div>

            <p className="text-[11px] text-slate-500 mb-3">
              Decomposing sensor contributions to model predictions (illustrates model feature attribution; does not prove biological causality).
            </p>

            <div className="space-y-2">
              {shapContributions.map((shap, i) => {
                const isPositive = shap.impact > 0;
                const barWidth = Math.min(100, Math.abs(shap.impact) * 3);
                return (
                  <div key={i} className="text-xs">
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="font-medium text-slate-800 truncate">{shap.feature}</span>
                      <span className={`font-mono font-bold ${isPositive ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {isPositive ? `+${shap.impact}%` : `${shap.impact}%`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden flex">
                        {isPositive ? (
                          <div
                            className="bg-rose-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${barWidth}%` }}
                          />
                        ) : (
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${barWidth}%` }}
                          />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono w-24 text-right truncate">
                        {shap.value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
