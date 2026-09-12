import { network } from "hardhat";

const { viem } = await network.connect();

async function main() {
  console.log("Deploying HealSecureAudit...");

  const auditContract = await viem.deployContract("HealSecureAudit");

  console.log("HealSecureAudit deployed to:", auditContract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});