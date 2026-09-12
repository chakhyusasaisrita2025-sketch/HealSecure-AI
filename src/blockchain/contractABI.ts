export const HEAL_SECURE_AUDIT_ABI = [
  {
    type: "function",
    name: "recordAudit",
    stateMutability: "nonpayable",
    inputs: [
      { name: "eventId", type: "string" },
      { name: "eventType", type: "string" },
      { name: "eventHash", type: "string" },
      { name: "previousHash", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getAuditCount",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "getAuditRecord",
    stateMutability: "view",
    inputs: [
      { name: "index", type: "uint256" },
    ],
    outputs: [
      { name: "eventId", type: "string" },
      { name: "eventType", type: "string" },
      { name: "eventHash", type: "string" },
      { name: "previousHash", type: "string" },
      { name: "timestamp", type: "uint256" },
    ],
  },
] as const;