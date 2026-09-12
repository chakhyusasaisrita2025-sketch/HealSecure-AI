import { ClinicalScenario, DrugRecord, FAERSAssociation } from '../types';

export const INITIAL_DRUGS: DrugRecord[] = [
  {
    id: 'gentamicin',
    name: 'Gentamicin Sulfate',
    genericName: 'Gentamicin',
    class: 'Aminoglycoside Antibiotic',
    dosage: '4.5 mg/kg IV q24h',
    route: 'IV Infusion',
    startTime: 'Post-Op Day 1, 06:00',
    faersMatchCount: 1420,
    knownADRs: ['Apnea', 'Bradycardia', 'Desaturation', 'Nephrotoxicity', 'Ototoxicity'],
  },
  {
    id: 'vancomycin',
    name: 'Vancomycin HCl',
    genericName: 'Vancomycin',
    class: 'Glycopeptide Antibiotic',
    dosage: '15 mg/kg IV q12h',
    route: 'IV Infusion',
    startTime: 'Post-Op Day 1, 08:00',
    faersMatchCount: 2310,
    knownADRs: ['Tachycardia', 'Flushing', 'Hypotension', 'Desaturation', 'Red-man Syndrome'],
  },
  {
    id: 'fentanyl',
    name: 'Fentanyl Citrate',
    genericName: 'Fentanyl',
    class: 'Synthetic Opioid Analgesic',
    dosage: '1.5 mcg/kg/hr IV',
    route: 'Continuous IV',
    startTime: 'Intraoperative, 11:30',
    faersMatchCount: 1850,
    knownADRs: ['Respiratory Depression', 'Bradycardia', 'Desaturation', 'Chest Wall Rigidity'],
  },
  {
    id: 'cefotaxime',
    name: 'Cefotaxime Sodium',
    genericName: 'Cefotaxime',
    class: '3rd Gen Cephalosporin',
    dosage: '50 mg/kg IV q12h',
    route: 'IV Push',
    startTime: 'Post-Op Day 2, 09:00',
    faersMatchCount: 420,
    knownADRs: ['Rash', 'Eosinophilia', 'Mild Diarrhea'],
  },
  {
    id: 'caffeine',
    name: 'Caffeine Citrate',
    genericName: 'Caffeine Citrate',
    class: 'Methylxanthine (CNS Stimulant)',
    dosage: '5 mg/kg enteral q24h',
    route: 'Enteral Tube',
    startTime: 'Day of Life 3, 14:00',
    faersMatchCount: 310,
    knownADRs: ['Tachycardia', 'Jitteriness', 'Tachypnea', 'Insomnia'],
  },
  {
    id: 'furosemide',
    name: 'Furosemide (Lasix)',
    genericName: 'Furosemide',
    class: 'Loop Diuretic',
    dosage: '1 mg/kg IV q24h',
    route: 'IV Bolus',
    startTime: 'Post-Op Day 2, 07:00',
    faersMatchCount: 980,
    knownADRs: ['Hypokalemia', 'Hyponatremia', 'Dehydration', 'Ototoxicity synergy'],
  },
];

export const FAERS_DATABASE: Record<string, FAERSAssociation[]> = {
  Desaturation: [
    {
      drugName: 'Fentanyl',
      symptom: 'Desaturation',
      reportingOddsRatio: 4.82,
      proportionalReportingRatio: 4.15,
      chiSquare: 189.4,
      caseReports: 684,
      confidenceScore: 92,
      clinicalRelevance: 'High',
      mechanism: 'Mu-opioid receptor agonism in brainstem respiratory control centers causing central hypoventilation.',
    },
    {
      drugName: 'Gentamicin',
      symptom: 'Desaturation',
      reportingOddsRatio: 3.41,
      proportionalReportingRatio: 3.02,
      chiSquare: 112.7,
      caseReports: 423,
      confidenceScore: 84,
      clinicalRelevance: 'High',
      mechanism: 'Neuromuscular junction presynaptic acetylcholine release blockade triggering respiratory muscle fatigue.',
    },
    {
      drugName: 'Vancomycin',
      symptom: 'Desaturation',
      reportingOddsRatio: 2.15,
      proportionalReportingRatio: 1.94,
      chiSquare: 48.3,
      caseReports: 219,
      confidenceScore: 68,
      clinicalRelevance: 'Moderate',
      mechanism: 'Rapid histamine release and bronchospastic reaction during infusion.',
    },
  ],
  Bradycardia: [
    {
      drugName: 'Fentanyl',
      symptom: 'Bradycardia',
      reportingOddsRatio: 4.18,
      proportionalReportingRatio: 3.75,
      chiSquare: 142.1,
      caseReports: 512,
      confidenceScore: 89,
      clinicalRelevance: 'High',
      mechanism: 'Central vagal tone stimulation and sympathetic outflow inhibition.',
    },
    {
      drugName: 'Gentamicin',
      symptom: 'Bradycardia',
      reportingOddsRatio: 2.95,
      proportionalReportingRatio: 2.61,
      chiSquare: 78.4,
      caseReports: 304,
      confidenceScore: 78,
      clinicalRelevance: 'Moderate',
      mechanism: 'Autonomic instability secondary to vestibular/cochlear ion transport toxicity and hypocalcemia.',
    },
  ],
  Apnea: [
    {
      drugName: 'Fentanyl',
      symptom: 'Apnea',
      reportingOddsRatio: 5.62,
      proportionalReportingRatio: 4.98,
      chiSquare: 230.5,
      caseReports: 810,
      confidenceScore: 95,
      clinicalRelevance: 'High',
      mechanism: 'Chemoreceptor sensitivity blunting to arterial pCO2 in neonates.',
    },
    {
      drugName: 'Gentamicin',
      symptom: 'Apnea',
      reportingOddsRatio: 3.88,
      proportionalReportingRatio: 3.32,
      chiSquare: 135.2,
      caseReports: 462,
      confidenceScore: 86,
      clinicalRelevance: 'High',
      mechanism: 'Synergistic neuromuscular blockade especially when co-administered with anesthetics or muscle relaxants.',
    },
  ],
  Tachycardia: [
    {
      drugName: 'Caffeine Citrate',
      symptom: 'Tachycardia',
      reportingOddsRatio: 4.35,
      proportionalReportingRatio: 3.90,
      chiSquare: 156.0,
      caseReports: 490,
      confidenceScore: 91,
      clinicalRelevance: 'High',
      mechanism: 'Non-selective adenosine receptor antagonism + phosphodiesterase inhibition elevating intracellular cAMP.',
    },
    {
      drugName: 'Vancomycin',
      symptom: 'Tachycardia',
      reportingOddsRatio: 3.10,
      proportionalReportingRatio: 2.85,
      chiSquare: 89.6,
      caseReports: 345,
      confidenceScore: 79,
      clinicalRelevance: 'Moderate',
      mechanism: 'Compensatory reflex tachycardia responding to peripheral vasodilatation (histamine release).',
    },
  ],
  Jitteriness: [
    {
      drugName: 'Caffeine Citrate',
      symptom: 'Jitteriness',
      reportingOddsRatio: 4.90,
      proportionalReportingRatio: 4.40,
      chiSquare: 178.2,
      caseReports: 520,
      confidenceScore: 93,
      clinicalRelevance: 'High',
      mechanism: 'Cortical and subcortical excitation due to excessive CNS phosphodiesterase blockade.',
    },
  ],
};

export const CLINICAL_SCENARIOS: ClinicalScenario[] = [
  {
    id: 'normal',
    title: '1. Normal Post-Surgical Recovery',
    category: 'Normal',
    description: 'Patient on prophylactic antibiotics, healthy wound healing with normal physiology.',
    vitals: {
      heartRate: 138,
      spo2: 98,
      systemicTemp: 36.8,
      respiratoryRate: 42,
    },
    biomarkers: {
      ph: 6.5,
      moisture: 38,
      woundTemp: 36.9,
      tempDelta: 0.1,
      mmpActivity: 12,
    },
    activeDrugs: ['gentamicin', 'cefotaxime'],
    expectedDiagnosis: 'Unremarkable healing. Wound acid mantle intact (pH 6.5). No systemic vital instability.',
    clinicalNote: 'Patch biosensors confirm normal physiological homeostasis. No alert dispatched.',
  },
  {
    id: 'early_ssi',
    title: '2. Early SSI Risk Flag (Simulated Pre-Clinical Window)',
    category: 'SSI',
    description: 'Simulated local inflammatory pattern with alkaline pH shift, increased moisture and localized thermal gradient. This scenario demonstrates the concept of earlier warning from local wound physiology; clinical lead-time requires prospective validation.',
    vitals: {
      heartRate: 144,
      spo2: 97,
      systemicTemp: 37.0, // Normal systemic temp - fever has NOT appeared yet!
      respiratoryRate: 45,
    },
    biomarkers: {
      ph: 7.9, // Alkaline shift from 6.5 -> 7.9
      moisture: 72, // Exudate accumulation
      woundTemp: 38.8, // Hyperemic local heat
      tempDelta: 1.8, // Delta > 1.2°C indicates localized hyperemia
      mmpActivity: 84,
    },
    activeDrugs: ['gentamicin', 'cefotaxime'],
    expectedDiagnosis: 'Elevated SSI-risk pattern requiring clinician wound assessment. (Simulated early SSI-risk pattern identified before systemic deterioration.)',
    clinicalNote: 'Simulated alkaline pH shift (7.9) + localized ΔT (+1.8°C) exceeds illustrative threshold. Recommends clinician bedside wound examination.',
  },
  {
    id: 'gentamicin_adr',
    title: '3. Gentamicin-Induced Adverse Drug Reaction (ADR)',
    category: 'ADR',
    description: 'Sudden desaturation and bradycardia episode in neonate with healthy wound bed (normal pH and thermal symmetry).',
    vitals: {
      heartRate: 92, // Severe bradycardia (normal neonate 120-160)
      spo2: 83, // Severe desaturation (hypoxia)
      systemicTemp: 36.6,
      respiratoryRate: 22, // Bradypnea / near-apnea
    },
    biomarkers: {
      ph: 6.4, // Wound is completely healthy & acidic!
      moisture: 35,
      woundTemp: 36.7,
      tempDelta: 0.1, // No hyperemia!
      mmpActivity: 10,
    },
    activeDrugs: ['gentamicin', 'fentanyl', 'cefotaxime'],
    expectedDiagnosis: 'Medication-associated adverse-event signal detected; clinical assessment recommended. Statistical reporting association with Gentamicin + Fentanyl neuromuscular/respiratory suppression via openFDA FAERS disproportionality metrics.',
    clinicalNote: 'Normal wound biomarkers indicate absence of acute local wound inflammation. FAERS knowledge layer identifies Gentamicin (ROR 3.41) & Fentanyl (ROR 4.82) statistical reporting associations. Urgent bedside clinical assessment advised.',
  },
  {
    id: 'vancomycin_hemodynamic',
    title: '4. Vancomycin Infusion Reaction (Tachycardia & Flushing)',
    category: 'ADR',
    description: 'Rapid elevation in heart rate with cutaneous flushing during glycopeptide infusion.',
    vitals: {
      heartRate: 184, // Tachycardia
      spo2: 91,
      systemicTemp: 37.3,
      respiratoryRate: 58,
    },
    biomarkers: {
      ph: 6.6,
      moisture: 42,
      woundTemp: 37.5,
      tempDelta: 0.2,
      mmpActivity: 15,
    },
    activeDrugs: ['vancomycin', 'caffeine', 'cefotaxime'],
    expectedDiagnosis: 'Medication-associated adverse-event signal detected; clinical assessment recommended. Histaminergic degranulation profile associated with rapid Vancomycin administration (Red-Man syndrome characteristics in FAERS data).',
    clinicalNote: 'FAERS reference layer ranks Vancomycin (ROR 3.10) & Caffeine interaction. Recommends checking infusion rate and physician evaluation for antihistamine protocol.',
  },
  {
    id: 'dual_crisis',
    title: '5. Dual-Crisis (Concomitant SSI Risk + Drug Toxicity)',
    category: 'Dual',
    description: 'Deep wound infection biomarkers exacerbated by acute opioid and aminoglycoside pharmacotherapy risk flags.',
    vitals: {
      heartRate: 104, // Relative bradycardia
      spo2: 86, // Hypoxemia
      systemicTemp: 38.6, // Systemic fever
      respiratoryRate: 28,
    },
    biomarkers: {
      ph: 8.3, // Severe alkalosis (local inflammatory exudate)
      moisture: 88, // Heavy purulent exudate
      woundTemp: 40.5,
      tempDelta: 1.9, // Severe local hyperemia
      mmpActivity: 120,
    },
    activeDrugs: ['gentamicin', 'fentanyl', 'vancomycin'],
    expectedDiagnosis: 'Critical multimodal risk state: Combined localized wound biomarker derangement and medication-associated adverse-event signal.',
    clinicalNote: 'Simulated Risk Score > 90%. System dispatches urgent dual-specialty notification for attending pediatric surgeon and neonatologist evaluation.',
  },
];
