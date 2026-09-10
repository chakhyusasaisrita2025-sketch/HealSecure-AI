import React, { useState } from 'react';
import { Header } from './components/Header';
import { SimulationView } from './components/SimulationView';
import { CircuitViewer } from './components/CircuitViewer';
import { MatlabPlotter } from './components/MatlabPlotter';
import { BOMViewer } from './components/BOMViewer';
import { ArchitectureView } from './components/ArchitectureView';
import { CLINICAL_SCENARIOS } from './data/clinicalData';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('simulation');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [riskScore, setRiskScore] = useState<number>(14);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(CLINICAL_SCENARIOS[0].id);

  return (
    <div className="min-h-screen bg-slate-100/75 text-slate-900 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSimulating={isSimulating}
        setIsSimulating={setIsSimulating}
        riskScore={riskScore}
        selectedScenarioId={selectedScenarioId}
        onSelectScenario={setSelectedScenarioId}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'simulation' && (
          <SimulationView
            isSimulating={isSimulating}
            onRiskScoreUpdate={setRiskScore}
          />
        )}

        {activeTab === 'circuits' && <CircuitViewer />}

        {activeTab === 'matlab' && <MatlabPlotter />}

        {activeTab === 'bom' && <BOMViewer />}

        {activeTab === 'architecture' && <ArchitectureView />}
      </main>

      {/* Engineering Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">HealSecure AI</span>
              <span>•</span>
              <span>The Dual-Modal Sentinel for Post-Surgical Recovery &amp; NICU ADRs</span>
            </div>

            <div className="flex items-center gap-4 text-slate-500">
              <span>National Level Ideathon 5.0 | CBIT Hyderabad</span>
              <span>•</span>
              <span className="font-mono text-cyan-700 font-bold">Team Helix Freaks (VIT Chennai)</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 text-center sm:text-left border-t border-slate-100 pt-2 leading-relaxed">
            <strong>Clinical Disclaimer:</strong> Prototype / research concept. HealSecure AI is intended as a clinical decision-support research platform and is not a standalone diagnostic device. Sensor thresholds, AI performance and clinical utility require prospective validation.
          </div>
        </div>
      </footer>
    </div>
  );
}
