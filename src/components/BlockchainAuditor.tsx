import React, { useEffect, useState } from "react";
import {
  getAuditEvents,
  verifyAuditChain,
  simulateTampering,
  AuditEvent,
} from "../blockchain/auditService";
import {
  getOnChainAuditRecords,
  OnChainAuditRecord,
} from "../blockchain/blockchainClient";
export const BlockchainAuditor: React.FC = () => {
  const [events, setEvents] = useState<AuditEvent[]>(getAuditEvents());
const [onChainRecords, setOnChainRecords] = useState<OnChainAuditRecord[]>([]);
const [blockchainMismatch, setBlockchainMismatch] = useState(false);
 useEffect(() => {
  const loadBlockchainRecords = async () => {
    try {
      const records = await getOnChainAuditRecords();
      setOnChainRecords(records);
    } catch (error) {
      console.error("ON-CHAIN READ ERROR:", error);
    }
  };

  const handleAuditEventCreated = async () => {
  await verifyAuditChain();

  const localEvents = getAuditEvents();
  setEvents(localEvents);

  try {
    const records = await getOnChainAuditRecords();
    setOnChainRecords(records);

    const mismatch = localEvents.some((localEvent) => {
      const onChainEvent = records.find(
        (record) => record.eventId === localEvent.eventId
      );

      if (!onChainEvent) {
        return false;
      }

      return (
        localEvent.hash !== onChainEvent.eventHash ||
        localEvent.previousHash !== onChainEvent.previousHash
      );
    });

    setBlockchainMismatch(mismatch);
  } catch (error) {
    console.error("ON-CHAIN READ ERROR:", error);
  }
};

  loadBlockchainRecords();

  window.addEventListener("audit-event-created", handleAuditEventCreated);

  return () => {
    window.removeEventListener(
      "audit-event-created",
      handleAuditEventCreated
    );
  };
}, []);

  const refreshEvents = async () => {
  await verifyAuditChain();

  const localEvents = getAuditEvents();
  setEvents(localEvents);

  try {
    const records = await getOnChainAuditRecords();
    setOnChainRecords(records);

    const mismatch = localEvents.some((localEvent) => {
      const onChainEvent = records.find(
        (record) => record.eventId === localEvent.eventId
      );

      if (!onChainEvent) {
        return false;
      }

      return (
        localEvent.hash !== onChainEvent.eventHash ||
        localEvent.previousHash !== onChainEvent.previousHash
      );
    });

    setBlockchainMismatch(mismatch);
  } catch (error) {
    console.error("ON-CHAIN READ ERROR:", error);
  }
};
const handleSimulateTampering = () => {
  simulateTampering();
  setEvents(getAuditEvents());
};

  const verifiedEvents = events.filter(
    (event) => event.blockchainStatus !== "TAMPERED"
  );

  const tamperedEvents = events.filter(
    (event) => event.blockchainStatus === "TAMPERED"
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Blockchain Auditor
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Integrity and audit verification layer for HealSecure AI
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
  <p className="text-xs text-slate-500 uppercase font-semibold">
    Blockchain Status
  </p>

  <p
    className={`text-xl font-bold mt-2 ${
      tamperedEvents.length > 0 || blockchainMismatch
        ? "text-red-600"
        : "text-emerald-600"
    }`}
  >
    {tamperedEvents.length > 0 || blockchainMismatch
      ? "TAMPERED"
      : "VERIFIED"}
  </p>

  {blockchainMismatch && (
    <p className="text-xs text-red-500 mt-2">
      Local record differs from blockchain
    </p>
  )}
</div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-slate-500 uppercase font-semibold">
            Total Events
          </p>

          <p className="text-2xl font-bold text-slate-800 mt-2">
            {events.length}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-slate-500 uppercase font-semibold">
            Verified Events
          </p>

          <p className="text-2xl font-bold text-emerald-600 mt-2">
            {verifiedEvents.length}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-slate-500 uppercase font-semibold">
            Tampered Events
          </p>

          <p className="text-2xl font-bold text-red-600 mt-2">
            {tamperedEvents.length}
          </p>
        </div>

      </div>

      {/* Audit Ledger */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">

        <div className="p-5 border-b border-slate-200 flex items-center justify-between">

          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Audit Ledger
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Cryptographically chained HealSecure AI events
            </p>
          </div>

          <button
            onClick={refreshEvents}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition"
          >
            Refresh
          </button>

        </div>

        <div className="p-5">

          {events.length === 0 ? (

            <div className="text-center py-10">

              <p className="text-slate-400 text-sm">
                No audit events yet.
              </p>

              <p className="text-xs text-slate-400 mt-2">
                Create an audit event from the simulation to see it here.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {[...events].reverse().map((event) => (

                <div
                  key={event.eventId}
                  className="border border-slate-200 rounded-xl p-4"
                >

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                    <div>
                      <div className="flex items-center gap-3">

                        <span className="font-mono font-bold text-slate-800">
                          {event.eventId}
                        </span>

                        <span className="px-2 py-1 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200 text-xs font-semibold">
                          {event.eventType}
                        </span>

                      </div>

                      <p className="text-xs text-slate-400 mt-2">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        event.blockchainStatus === "TAMPERED"
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      }`}
                    >
                      {event.blockchainStatus === "TAMPERED"
                        ? "TAMPERED"
                        : "VERIFIED"}
                    </span>

                  </div>

                  {/* Hash information */}
                  <div className="mt-4 space-y-2">

                    <div className="bg-slate-50 rounded-lg p-3">

                      <p className="text-[10px] uppercase font-bold text-slate-500">
                        Event Hash
                      </p>

                      <p className="font-mono text-xs text-slate-700 break-all mt-1">
                        {event.hash}
                      </p>

                    </div>
                    {event.transactionHash && (
  <div className="bg-slate-50 rounded-lg p-3">
    <p className="text-[10px] uppercase font-bold text-slate-500">
      Blockchain Transaction
    </p>

    <p className="font-mono text-xs text-slate-700 break-all mt-1">
      {event.transactionHash}
    </p>
  </div>
)}

                    <div className="bg-slate-50 rounded-lg p-3">

                      <p className="text-[10px] uppercase font-bold text-slate-500">
                        Previous Hash
                      </p>

                      <p className="font-mono text-xs text-slate-700 break-all mt-1">
                        {event.previousHash}
                      </p>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>
<div className="mt-6 border-t border-slate-200 pt-5">
  <h3 className="text-md font-bold text-slate-800">
    On-Chain Records
  </h3>

  <p className="text-sm text-slate-500 mt-1">
    Records read directly from the HealSecureAudit smart contract
  </p>

  {onChainRecords.length === 0 ? (
    <p className="text-sm text-slate-400 mt-4">
      No blockchain records found.
    </p>
  ) : (
    <div className="space-y-3 mt-4">
      {[...onChainRecords].reverse().map((record) => (
        <div
          key={record.eventId}
          className="bg-slate-50 border border-slate-200 rounded-lg p-4"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-slate-800">
                {record.eventId}
              </span>

              <span className="px-2 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold">
                {record.eventType}
              </span>
            </div>

            <span className="text-xs text-slate-400">
              Block timestamp:{" "}
              {new Date(record.timestamp * 1000).toLocaleString()}
            </span>
          </div>

          <div className="mt-3 space-y-2">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">
                On-Chain Event Hash
              </p>

              <p className="font-mono text-xs text-slate-700 break-all mt-1">
                {record.eventHash}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">
                On-Chain Previous Hash
              </p>

              <p className="font-mono text-xs text-slate-700 break-all mt-1">
                {record.previousHash}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">

        <button
          onClick={refreshEvents}
          className="px-5 py-2.5 rounded-lg bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition"
        >
          Verify Integrity
        </button>

        <button
  onClick={handleSimulateTampering}
  className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
>
  Simulate Tampering
</button>

      </div>

    </div>
  );
};