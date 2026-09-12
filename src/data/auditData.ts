import { AuditRecord } from '../types';

/**
 * Pure TypeScript SHA-256 implementation fallback
 * Ensures robust hashing even in non-secure browser contexts (e.g. raw IP or test runners)
 */
function fallbackSha256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  // Initial hash values: first 32 bits of the fractional parts of the square roots of the first 8 primes
  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  // First 32 bits of the fractional parts of the cube roots of the first 64 primes 2..311
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  for (let i = 0; i < ascii.length; i++) {
    const j = (i >> 2);
    words[j] = (words[j] || 0) | ((ascii.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8));
  }

  words[asciiBitLength >> 5] = (words[asciiBitLength >> 5] || 0) | (0x80 << (24 - (asciiBitLength % 32)));
  words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;

  const w: number[] = [];
  for (let i = 0; i < words.length; i += 16) {
    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let j = 0; j < 64; j++) {
      if (j < 16) {
        w[j] = words[i + j] || 0;
      } else {
        const gamma0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        const gamma1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + gamma0 + w[j - 7] + gamma1) | 0;
      }

      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + ch + k[j] + w[j]) | 0;
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
    h5 = (h5 + f) | 0;
    h6 = (h6 + g) | 0;
    h7 = (h7 + h) | 0;
  }

  const hexParts = [h0, h1, h2, h3, h4, h5, h6, h7].map((num) => {
    return ((num >>> 0) + maxWord).toString(16).slice(-8);
  });

  return hexParts.join('');
}

/**
 * Calculates SHA-256 hex string using Web Crypto API when available,
 * falling back gracefully to the synchronous fallback algorithm.
 */
export async function calculateSha256(text: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(text);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback on any Web Crypto API exception
    }
  }
  return fallbackSha256(text);
}

/**
 * Synchronous hash calculation helper for instant initial rendering
 */
export function calculateSha256Sync(text: string): string {
  return fallbackSha256(text);
}

/**
 * Canonical JSON serialization to guarantee consistent SHA-256 hashing
 */
export function canonicalStringify(obj: unknown): string {
  return JSON.stringify(obj, Object.keys(obj as object).sort(), 2);
}

// Initial demo payloads with deterministic IDs
const INITIAL_PAYLOAD_2048 = {
  recordId: 'HS-2048',
  event: 'MULTIMODAL_DATA_INGEST',
  riskState: 'MONITOR',
  vitals: { heartRate: 142, spo2: 97, respRate: 44 },
  biomarkers: { ph: 6.55, tempDelta: 0.35, moisturePct: 42 },
  timestamp: 'SIMULATED',
};

const INITIAL_PAYLOAD_2049 = {
  recordId: 'HS-2049',
  event: 'RISK_ASSESSMENT_GENERATED',
  fusedScore: 24,
  ssiScore: 18,
  adrScore: 31,
  classification: 'LOW_RISK_MONITOR',
  timestamp: 'SIMULATED',
};

const INITIAL_PAYLOAD_2050 = {
  recordId: 'HS-2050',
  event: 'DECISION_SUPPORT_EXPLANATION_GENERATED',
  topDrivers: [
    'Wound pH Stability (-14%)',
    'Local Thermoregulation (-11%)',
    'Gentamicin Therapeutic Window (+8%)',
  ],
  timestamp: 'SIMULATED',
};

const INITIAL_PAYLOAD_2051 = {
  recordId: 'HS-2051',
  event: 'CLINICIAN_VIEWED_ASSESSMENT',
  viewMode: 'Bedside Decision-Support Console',
  clinicianRole: 'NICU Attending / Fellow',
  timestamp: 'SIMULATED',
};

const INITIAL_PAYLOAD_2052 = {
  recordId: 'HS-2052',
  event: 'ALERT_ACKNOWLEDGED',
  alertAction: 'Vigilance Routine Confirmed',
  loggedStatus: 'ACKNOWLEDGED',
  timestamp: 'SIMULATED',
};

export const INITIAL_AUDIT_RECORDS: AuditRecord[] = [
  {
    recordId: 'HS-2048',
    eventType: 'Multimodal Data Ingest',
    category: 'Ingestion',
    timestamp: '2026-09-11 12:45:00 UTC (Simulated)',
    payloadSummary: 'Ingested raw patch telemetry (pH 6.55, ΔT +0.35°C, HR 142 bpm, SpO₂ 97%)',
    payloadJson: INITIAL_PAYLOAD_2048,
    storedHash: calculateSha256Sync(canonicalStringify(INITIAL_PAYLOAD_2048)),
    status: 'VERIFIED',
    actor: 'Edge Gateway (Patch Node #12)',
  },
  {
    recordId: 'HS-2049',
    eventType: 'Risk Assessment Generated',
    category: 'Inference',
    timestamp: '2026-09-11 12:45:02 UTC (Simulated)',
    payloadSummary: 'Generated dual-modal fused risk assessment (Unified: 24%, SSI: 18%, ADR: 31%)',
    payloadJson: INITIAL_PAYLOAD_2049,
    storedHash: calculateSha256Sync(canonicalStringify(INITIAL_PAYLOAD_2049)),
    status: 'VERIFIED',
    actor: 'Dual-Modal Risk Engine (In-Silico POC)',
  },
  {
    recordId: 'HS-2050',
    eventType: 'Decision-Support Explanation Generated',
    category: 'Explainability',
    timestamp: '2026-09-11 12:45:03 UTC (Simulated)',
    payloadSummary: 'Attributed mathematical weights: pH stability (-14%), ΔT (-11%), Gentamicin (+8%)',
    payloadJson: INITIAL_PAYLOAD_2050,
    storedHash: calculateSha256Sync(canonicalStringify(INITIAL_PAYLOAD_2050)),
    status: 'VERIFIED',
    actor: 'SHAP Feature Attribution Module',
  },
  {
    recordId: 'HS-2051',
    eventType: 'Clinician Viewed Assessment',
    category: 'Clinical Action',
    timestamp: '2026-09-11 12:46:15 UTC (Simulated)',
    payloadSummary: 'Attending physician accessed patient summary card and cross-referenced FAERS ROR',
    payloadJson: INITIAL_PAYLOAD_2051,
    storedHash: calculateSha256Sync(canonicalStringify(INITIAL_PAYLOAD_2051)),
    status: 'VERIFIED',
    actor: 'Attending Clinician (Session #C419)',
  },
  {
    recordId: 'HS-2052',
    eventType: 'Alert Acknowledged',
    category: 'Clinical Action',
    timestamp: '2026-09-11 12:47:00 UTC (Simulated)',
    payloadSummary: 'Clinician acknowledged baseline monitoring status and maintained active regimen',
    payloadJson: INITIAL_PAYLOAD_2052,
    storedHash: calculateSha256Sync(canonicalStringify(INITIAL_PAYLOAD_2052)),
    status: 'VERIFIED',
    actor: 'NICU Duty Fellow (Session #C419)',
  },
];
