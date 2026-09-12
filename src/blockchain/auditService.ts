import { generateHash } from "./hashService";
import { recordAuditOnBlockchain } from "./blockchainWriteService";
export type AuditEventType =
  | "SENSOR_READING"
  | "AI_ASSESSMENT"
  | "ALERT_GENERATED"
  | "CLINICAL_UPDATE";

export interface AuditEvent {
  eventId: string;
  eventType: AuditEventType;
  timestamp: string;
  data: unknown;
  hash: string;
  previousHash: string;
  transactionHash?: string;
  blockchainStatus: "PENDING" | "CONFIRMED" | "TAMPERED";
}
let eventCounter = 0;

let previousHash =
  "0000000000000000000000000000000000000000000000000000000000000000";

/*
 * Temporary in-memory blockchain audit ledger.
 * Later this will be replaced by persistent blockchain storage.
 */
const auditEvents: AuditEvent[] = [];

export async function createAuditEvent(
  eventType: AuditEventType,
  data: unknown
): Promise<AuditEvent> {
  eventCounter++;

  const eventId = `EVT-${String(eventCounter).padStart(4, "0")}`;

  const timestamp = new Date().toISOString();

  const hashData = {
    eventId,
    eventType,
    timestamp,
    data,
    previousHash,
  };

  const hash = await generateHash(hashData);

  const auditEvent: AuditEvent = {
    eventId,
    eventType,
    timestamp,
    data,
    hash,
    previousHash,
    blockchainStatus: "PENDING",
  };

 previousHash = hash;

// Store event in the audit ledger
auditEvents.push(auditEvent);

// Store audit event on the real blockchain
try {
  const transactionHash = await recordAuditOnBlockchain(
    eventId,
    eventType,
    hash,
    auditEvent.previousHash
  );

  console.log("BLOCKCHAIN TRANSACTION:", transactionHash);
  auditEvent.transactionHash = transactionHash;
  auditEvent.blockchainStatus = "CONFIRMED";
} catch (error) {
  console.error("BLOCKCHAIN WRITE ERROR:", error);
}

window.dispatchEvent(new Event("audit-event-created"));

return auditEvent;
}

/*
 * Return all audit events.
 */
export function getAuditEvents(): AuditEvent[] {
  return [...auditEvents];
}
export async function verifyAuditChain(): Promise<{
  valid: boolean;
  tamperedEventIds: string[];
}> {
  const tamperedEventIds: string[] = [];

  let expectedPreviousHash =
    "0000000000000000000000000000000000000000000000000000000000000000";

  for (const event of auditEvents) {
    const hashData = {
      eventId: event.eventId,
      eventType: event.eventType,
      timestamp: event.timestamp,
      data: event.data,
      previousHash: event.previousHash,
    };

    const recalculatedHash = await generateHash(hashData);

    const hashIsValid = recalculatedHash === event.hash;

    const previousHashIsValid =
      event.previousHash === expectedPreviousHash;

    if (!hashIsValid || !previousHashIsValid) {
      event.blockchainStatus = "TAMPERED";
      tamperedEventIds.push(event.eventId);
    } else {
      event.blockchainStatus = "CONFIRMED";
    }

    expectedPreviousHash = event.hash;
  }

  return {
    valid: tamperedEventIds.length === 0,
    tamperedEventIds,
  };

}
export function simulateTampering(): boolean {
  if (auditEvents.length === 0) {
    return false;
  }

  const event = auditEvents[auditEvents.length - 1];

  event.data = {
    ...(typeof event.data === "object" && event.data !== null
      ? event.data
      : { originalData: event.data }),
    tampered: true,
  };

  return true;
}