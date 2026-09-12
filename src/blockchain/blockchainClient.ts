import { createPublicClient, http } from "viem";
import { BLOCKCHAIN_CONFIG } from "./blockchainConfig";
import { HEAL_SECURE_AUDIT_ABI } from "./contractABI";

export const blockchainClient = createPublicClient({
  transport: http(BLOCKCHAIN_CONFIG.rpcUrl),
});

export async function getOnChainAuditCount(): Promise<number> {
  const count = await blockchainClient.readContract({
    address: BLOCKCHAIN_CONFIG.contractAddress as `0x${string}`,
    abi: HEAL_SECURE_AUDIT_ABI,
    functionName: "getAuditCount",
  });

  return Number(count);
}
export interface OnChainAuditRecord {
  eventId: string;
  eventType: string;
  eventHash: string;
  previousHash: string;
  timestamp: number;
}

export async function getOnChainAuditRecords(): Promise<OnChainAuditRecord[]> {
  const count = await getOnChainAuditCount();

  const records: OnChainAuditRecord[] = [];

  for (let i = 0; i < count; i++) {
    const record = await blockchainClient.readContract({
      address: BLOCKCHAIN_CONFIG.contractAddress as `0x${string}`,
      abi: HEAL_SECURE_AUDIT_ABI,
      functionName: "getAuditRecord",
      args: [BigInt(i)],
    });

    records.push({
      eventId: record[0],
      eventType: record[1],
      eventHash: record[2],
      previousHash: record[3],
      timestamp: Number(record[4]),
    });
  }

  return records;
}