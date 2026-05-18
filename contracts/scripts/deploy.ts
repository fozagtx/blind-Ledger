import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const usdc = process.env.USDC_ADDRESS;
  if (!usdc) throw new Error("USDC_ADDRESS not set in env");

  const periodInterval = BigInt(process.env.PERIOD_INTERVAL_SECONDS ?? "2592000");
  const keeperAddress = process.env.KEEPER_ADDRESS;

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:        ", deployer.address);
  console.log("USDC:            ", usdc);
  console.log("Period interval: ", periodInterval.toString(), "seconds");
  if (keeperAddress) console.log("Keeper:          ", keeperAddress);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:         ", ethers.formatEther(balance), "ETH");

  const Pool = await ethers.getContractFactory("PayrollPool");
  const pool = await Pool.deploy(usdc, periodInterval);
  await pool.waitForDeployment();
  const address = await pool.getAddress();
  console.log("\nPayrollPool deployed:", address);

  if (keeperAddress) {
    console.log("Authorizing keeper...");
    const tx = await pool.setKeeper(keeperAddress, true);
    await tx.wait();
    console.log("Keeper authorized:", keeperAddress);
  }

  // Write address to frontend env so it picks it up automatically
  const frontendEnv = path.resolve(__dirname, "../../frontend/.env.local");
  const network = (await ethers.provider.getNetwork()).chainId.toString();
  const envLine =
    `VITE_PAYROLL_POOL_ADDRESS=${address}\n` +
    `VITE_USDC_ADDRESS=${usdc}\n` +
    `VITE_CHAIN_ID=${network}\n`;
  fs.writeFileSync(frontendEnv, envLine);
  console.log("Wrote frontend env:", frontendEnv);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
