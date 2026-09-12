export interface PatientVitals {
  heartRate: number; // bpm (e.g. 120-160 for neonates)
  spo2: number; // % (e.g. 92-100)
  systemicTemp: number; // °C (e.g. 36.5-37.5)
  respiratoryRate: number; // breaths/min (e.g. 30-55)
}

export interface WoundBiomarkers {
  ph: number; // pH units (healthy: 5.5 - 6.8, infected: 7.2 - 8.8)
  moisture: number; // % (0-100, exudate saturation)
  woundTemp: number; // °C
  tempDelta: number; // °C (woundTemp - systemicTemp, > 1.2°C indicates hyperemia/SSI)
  mmpActivity?: number; // ng/mL (matrix metalloproteinase indicator)
}

export interface DrugRecord {
  id: string;
  name: string;
  genericName: string;
  class: string;
  dosage: string;
  route: string;
  startTime: string;
  faersMatchCount: number;
  knownADRs: string[];
}

export interface FAERSAssociation {
  drugName: string;
  symptom: string;
  reportingOddsRatio: number; // ROR (e.g. 3.42)
  proportionalReportingRatio: number; // PRR
  chiSquare: number;
  caseReports: number;
  confidenceScore: number; // 0 - 100%
  clinicalRelevance: 'High' | 'Moderate' | 'Low';
  mechanism: string;
}

export interface SHAPContribution {
  feature: string;
  value: string;
  impact: number; // positive increases risk, negative decreases
  category: 'Systemic ADR' | 'Local SSI' | 'Interaction';
}

export interface ClinicalScenario {
  id: string;
  title: string;
  description: string;
  category: 'Normal' | 'SSI' | 'ADR' | 'Dual';
  vitals: PatientVitals;
  biomarkers: WoundBiomarkers;
  activeDrugs: string[]; // Drug IDs
  expectedDiagnosis: string;
  clinicalNote: string;
}

export interface CircuitDef {
  id: string;
  title: string;
  subsystem: string;
  description: string;
  principle: string;
  keySpecs: string[];
  schematicSvgType: 'ph' | 'moisture' | 'temp' | 'ppg';
  netlistCir: string;
  ltspiceAsc: string;
  designEquations: { formula: string; explanation: string }[];
  componentsList: { ref: string; value: string; desc: string; package: string }[];
  simulationData: {
    transientTime: number[];
    vin: number[];
    vout: number[];
    freq: number[];
    gainDb: number[];
    phaseDeg: number[];
  };
}

export interface MatlabScriptDef {
  id: string;
  filename: string;
  title: string;
  purpose: string;
  category: 'Signal Processing' | 'AI & SHAP' | 'SPICE Validation';
  scriptCode: string;
  plotType: 'time_series' | 'roc_shap' | 'bode_psd';
  explanation: string;
}

export interface BOMComponent {
  id: string;
  category: 'Sensors' | 'Analog Front-End' | 'MCU & Wireless' | 'Power' | 'Passives' | 'Patch Substrate';
  itemNumber: number;
  name: string;
  mpn: string;
  manufacturer: string;
  description: string;
  packageFootprint: string;
  quantity: number;
  unitCostUSD: number;
  datasheetUrl?: string;
  criticalSpec: string;
}

export interface AuditRecord {
  recordId: string; // e.g. "HS-2048"
  eventType: string; // e.g. "Multimodal Data Ingest"
  category: 'Ingestion' | 'Inference' | 'Explainability' | 'Clinical Action';
  timestamp: string; // simulated ISO or formatted timestamp
  payloadSummary: string;
  payloadJson: Record<string, unknown>;
  storedHash: string; // SHA-256 hex string
  calculatedHash?: string;
  status: 'VERIFIED' | 'MISMATCH' | 'PENDING';
  actor: string;
}

export interface ClinicianProfile {
  id: string;
  name: string;
  title: string;
  department: string;
  staffId: string;
  passkey: string;
  role: 'Physician' | 'Surgeon' | 'Nurse' | 'Bioengineer';
  avatarInitials: string;
}

export interface ClinicalSession {
  clinician: ClinicianProfile;
  authenticatedAt: string;
  terminalId: string;
}
