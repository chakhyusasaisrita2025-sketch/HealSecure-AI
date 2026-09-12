import { CLINICAL_SCENARIOS } from '../data/clinicalData';

export interface TelemetryData {
  heartRate: number;
  spo2: number;
  systemicTemp: number;
  respiratoryRate: number;
  ph: number;
  moisture: number;
  woundTemp: number;
  deltaT: number;
  ssiRisk: number;
  adrRisk: number;
  fusedRisk: number;
  scenarioId: string;
  scenarioTitle: string;
  isAlarm: boolean;
  statusText: string;
  timestamp: number;
}

// Initial state from first clinical scenario
const initialScenario = CLINICAL_SCENARIOS[0];
const initialDeltaT = parseFloat(
  (initialScenario.biomarkers.woundTemp - initialScenario.vitals.systemicTemp).toFixed(2)
);

let currentTelemetry: TelemetryData = {
  heartRate: initialScenario.vitals.heartRate,
  spo2: initialScenario.vitals.spo2,
  systemicTemp: initialScenario.vitals.systemicTemp,
  respiratoryRate: initialScenario.vitals.respiratoryRate,
  ph: initialScenario.biomarkers.ph,
  moisture: initialScenario.biomarkers.moisture,
  woundTemp: initialScenario.biomarkers.woundTemp,
  deltaT: initialDeltaT,
  ssiRisk: 12,
  adrRisk: 8,
  fusedRisk: 10,
  scenarioId: initialScenario.id,
  scenarioTitle: initialScenario.title,
  isAlarm: false,
  statusText: 'NORMAL',
  timestamp: Date.now(),
};

type TelemetryListener = (data: TelemetryData) => void;
const listeners: Set<TelemetryListener> = new Set();

export function getTelemetry(): TelemetryData {
  return { ...currentTelemetry };
}

export function updateTelemetry(partial: Partial<TelemetryData>): TelemetryData {
  const next: TelemetryData = {
    ...currentTelemetry,
    ...partial,
    timestamp: Date.now(),
  };

  // Auto-evaluate alarm status if not explicitly overridden
  if (partial.isAlarm === undefined) {
    next.isAlarm = next.fusedRisk >= 70 || next.deltaT > 1.2 || next.ph > 7.4 || next.spo2 < 90;
  }
  if (partial.statusText === undefined) {
    if (next.fusedRisk >= 70) next.statusText = 'CRITICAL ALARM';
    else if (next.fusedRisk >= 45) next.statusText = 'WARNING ELEVATED';
    else next.statusText = 'STABLE NORMAL';
  }

  currentTelemetry = next;
  listeners.forEach((listener) => {
    try {
      listener(currentTelemetry);
    } catch (err) {
      console.error('Error in telemetry listener:', err);
    }
  });

  // Also dispatch a browser custom event for decoupling
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('healsecure-telemetry-update', { detail: currentTelemetry })
    );
  }

  return currentTelemetry;
}

export function subscribeTelemetry(listener: TelemetryListener): () => void {
  listeners.add(listener);
  // Emit current value immediately
  listener(currentTelemetry);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Helper to format exactly 16 characters for LCD row (pads with spaces or truncates)
 */
export function pad16(str: string): string {
  if (str.length >= 16) return str.slice(0, 16);
  return str.padEnd(16, ' ');
}

/**
 * Helper to format exactly 20 characters for LCD row (pads with spaces or truncates)
 */
export function pad20(str: string): string {
  if (str.length >= 20) return str.slice(0, 20);
  return str.padEnd(20, ' ');
}

export type LcdDisplayMode = 'vitals_biomarkers' | 'risk_alarm' | 'auto_cycle' | 'custom';

/**
 * Generates 16x2 LCD display lines based on telemetry data and selected mode
 */
export function format16x2Lines(
  data: TelemetryData,
  mode: LcdDisplayMode,
  cyclePage: number = 0,
  customLine1: string = 'HR:{hr}  O2:{spo2}%',
  customLine2: string = 'pH:{ph} dT:+{dT}C'
): { line1: string; line2: string } {
  const hrStr = String(Math.round(data.heartRate)).padStart(3, ' ');
  const o2Str = String(Math.round(data.spo2)).padStart(2, ' ');
  const phStr = data.ph.toFixed(2);
  const dTStr = (data.deltaT >= 0 ? '+' : '') + data.deltaT.toFixed(1) + 'C';
  const riskStr = String(Math.round(data.fusedRisk)).padStart(2, ' ') + '%';

  switch (mode) {
    case 'vitals_biomarkers':
      return {
        line1: pad16(`HR:${hrStr} SpO2:${o2Str}%`),
        line2: pad16(`pH:${phStr} dT:${dTStr}`),
      };

    case 'risk_alarm':
      return {
        line1: pad16(`ReadmRisk: ${riskStr}`),
        line2: pad16(data.isAlarm ? '!* CRIT ALARM *!' : 'Status: STABLE'),
      };

    case 'auto_cycle': {
      // 3 rotating pages
      const page = cyclePage % 3;
      if (page === 0) {
        // Page 0: Primary Vitals
        return {
          line1: pad16(`HR:${hrStr} SpO2:${o2Str}%`),
          line2: pad16(`T:${data.systemicTemp.toFixed(1)}C RR:${data.respiratoryRate}`),
        };
      } else if (page === 1) {
        // Page 1: Wound Biomarkers
        return {
          line1: pad16(`pH:${phStr}  dT:${dTStr}`),
          line2: pad16(`Moist:${Math.round(data.moisture)}% ${data.ph > 7.3 ? 'ALKAL' : 'NORM '}`),
        };
      } else {
        // Page 2: Sentinel AI Risk
        return {
          line1: pad16(`SSI:${Math.round(data.ssiRisk)}% ADR:${Math.round(data.adrRisk)}%`),
          line2: pad16(`Fused:${riskStr} ${data.isAlarm ? 'ALERT' : 'SAFE'}`),
        };
      }
    }

    case 'custom': {
      const replaceVars = (tmpl: string) => {
        return tmpl
          .replace(/\{hr\}/g, String(Math.round(data.heartRate)))
          .replace(/\{spo2\}/g, String(Math.round(data.spo2)))
          .replace(/\{temp\}/g, data.systemicTemp.toFixed(1))
          .replace(/\{ph\}/g, data.ph.toFixed(2))
          .replace(/\{moisture\}/g, String(Math.round(data.moisture)))
          .replace(/\{dT\}/g, data.deltaT.toFixed(1))
          .replace(/\{deltaT\}/g, data.deltaT.toFixed(1))
          .replace(/\{risk\}/g, String(Math.round(data.fusedRisk)))
          .replace(/\{status\}/g, data.isAlarm ? 'ALARM' : 'OK')
          .replace(/\{scenario\}/g, data.scenarioId);
      };

      return {
        line1: pad16(replaceVars(customLine1)),
        line2: pad16(replaceVars(customLine2)),
      };
    }
  }
}

/**
 * Generates 20x4 LCD display lines based on telemetry data
 */
export function format20x4Lines(data: TelemetryData): [string, string, string, string] {
  const hrStr = String(Math.round(data.heartRate)).padStart(3, ' ');
  const o2Str = String(Math.round(data.spo2)).padStart(2, ' ');
  const phStr = data.ph.toFixed(2);
  const dTStr = (data.deltaT >= 0 ? '+' : '') + data.deltaT.toFixed(2) + 'C';
  const riskStr = String(Math.round(data.fusedRisk)).padStart(2, ' ') + '%';

  return [
    pad20(`HEALSECURE SENTINEL`),
    pad20(`HR:${hrStr}bpm SpO2:${o2Str}%`),
    pad20(`pH:${phStr}  dT:${dTStr}`),
    pad20(`Risk:${riskStr} ${data.isAlarm ? '!CRIT ALARM!' : 'STATUS: OK'}`),
  ];
}

/**
 * Formats a compact CSV string suitable for microcontrollers:
 * Format: $HS,HR,SPO2,STEMP,PH,MOIST,DELTAT,RISK,ALARM\n
 */
export function formatCsvPacket(data: TelemetryData): string {
  return `$HS,${Math.round(data.heartRate)},${Math.round(data.spo2)},${data.systemicTemp.toFixed(
    1
  )},${data.ph.toFixed(2)},${Math.round(data.moisture)},${data.deltaT.toFixed(1)},${Math.round(
    data.fusedRisk
  )},${data.isAlarm ? 1 : 0}\n`;
}

/**
 * Formats JSON packet:
 */
export function formatJsonPacket(data: TelemetryData): string {
  return (
    JSON.stringify({
      hr: Math.round(data.heartRate),
      spo2: Math.round(data.spo2),
      sysT: parseFloat(data.systemicTemp.toFixed(1)),
      ph: parseFloat(data.ph.toFixed(2)),
      moist: Math.round(data.moisture),
      dT: parseFloat(data.deltaT.toFixed(2)),
      ssi: Math.round(data.ssiRisk),
      adr: Math.round(data.adrRisk),
      risk: Math.round(data.fusedRisk),
      alarm: data.isAlarm ? 1 : 0,
      status: data.statusText,
    }) + '\n'
  );
}
