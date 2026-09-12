import { createWalletClient, http, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { BLOCKCHAIN_CONFIG } from "./blockchainConfig";
import { HEAL_SECURE_AUDIT_ABI } from "./contractABI";

const hardhatLocal = defineChain({
  id: 31337,
  name: "Hardhat Local",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [BLOCKCHAIN_CONFIG.rpcUrl],
    },
  },
});

const HARDHAT_PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const account = privateKeyToAccount(HARDHAT_PRIVATE_KEY);

const walletClient = createWalletClient({
  account,
  chain: hardhatLocal,
  transport: http(BLOCKCHAIN_CONFIG.rpcUrl),
});

export async function recordAuditOnBlockchain(
  eventId: string,
  eventType: string,
  eventHash: string,
  previousHash: string
): Promise<string> {
  const transactionHash = await (walletClient as any).writeContract({
    address: BLOCKCHAIN_CONFIG.contractAddress as `0x${string}`,
    abi: HEAL_SECURE_AUDIT_ABI,
    functionName: "recordAudit",
    args: [eventId, eventType, eventHash, previousHash],
  });

  return transactionHash;
}