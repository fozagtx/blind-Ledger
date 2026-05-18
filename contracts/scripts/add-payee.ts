// Programmatic addPayee — encrypts a salary client-side via cofhejs (Node entry)
// and submits to PayrollPool. Useful when the browser FHE init is being
// problematic but you still need to add team members for demos.
//
// Usage:  pnpm add:payee -- 0xRecipient 5000
//   (5000 = USDC, will be parsed with 6 decimals)
//
// Falls back to env vars TARGET_PAYEE and TARGET_SALARY_USDC if no args.

import { cofhejs, Encryptable } from "cofhejs/node";
import {
  createPublicClient,
  createWalletClient,
  http,
  type Address,
  type Hex,
  isAddress,
} from "viem";
import { arbitrumSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";

dotenv.config();

const POOL = (process.env.PAYROLL_POOL_ADDRESS ??
  "0xbc2933EE60D9FcB1d1F7602A01CB54688CFC7028") as Address;

const addPayeeAbi = [
  {
    type: "function",
    name: "addPayee",
    inputs: [
      { name: "payee", type: "address" },
      {
        name: "encAmount",
        type: "tuple",
        components: [
          { name: "ctHash", type: "uint256" },
          { name: "securityZone", type: "uint8" },
          { name: "utype", type: "uint8" },
          { name: "signature", type: "bytes" },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

async function main() {
  const argPayee = process.argv[2] ?? process.env.TARGET_PAYEE;
  const argSalary = process.argv[3] ?? process.env.TARGET_SALARY_USDC ?? "1000";

  if (!argPayee || !isAddress(argPayee)) {
    throw new Error(
      "Usage: pnpm add:payee -- 0xRecipientAddress 5000\n(2nd arg is salary in USDC)"
    );
  }
  const payee = argPayee as Address;
  const salaryUsdc = Number(argSalary);
  if (!Number.isFinite(salaryUsdc) || salaryUsdc <= 0) {
    throw new Error(`Bad salary: "${argSalary}"`);
  }
  const amount = BigInt(Math.round(salaryUsdc * 1_000_000)); // USDC has 6 decimals

  const pk = process.env.PRIVATE_KEY as Hex | undefined;
  if (!pk) throw new Error("PRIVATE_KEY missing from contracts/.env");
  const account = privateKeyToAccount(pk);

  const pub = createPublicClient({ chain: arbitrumSepolia, transport: http() });
  const wallet = createWalletClient({ account, chain: arbitrumSepolia, transport: http() });

  console.log("=== add-payee ===");
  console.log("Admin :", account.address);
  console.log("Pool  :", POOL);
  console.log("Payee :", payee);
  console.log("Salary:", salaryUsdc, "USDC  (raw:", amount.toString(), ")");

  console.log("\n[1/3] Initializing cofhejs (Node, TESTNET)…");
  const initRes = await cofhejs.initializeWithViem({
    viemClient: pub as any,
    viemWalletClient: wallet as any,
    environment: "TESTNET",
    generatePermit: false,
    ignoreErrors: true,
  });
  if (!initRes?.success) {
    console.error("cofhejs init failed:", initRes);
    process.exit(1);
  }
  console.log("    cofhejs ready");

  console.log("\n[2/3] Encrypting salary client-side…");
  const encRes = await cofhejs.encrypt([Encryptable.uint128(amount)]);
  if (!encRes.success) {
    console.error("encrypt failed:", encRes);
    process.exit(1);
  }
  const sealed = encRes.data[0];
  console.log("    sealed amount produced");

  console.log("\n[3/3] Submitting addPayee tx…");
  const hash = await wallet.writeContract({
    address: POOL,
    abi: addPayeeAbi,
    functionName: "addPayee",
    args: [payee, sealed as any],
    maxFeePerGas: 500_000_000n,
    maxPriorityFeePerGas: 0n,
  });
  console.log("    tx:", hash);
  console.log("    https://sepolia.arbiscan.io/tx/" + hash);

  const r = await pub.waitForTransactionReceipt({ hash });
  console.log("\nConfirmed in block", r.blockNumber.toString());
  console.log("Done. Open the dashboard as", payee, "to see Get paid for cycle #1.");
}

main().catch((e) => {
  console.error("\nFAILED:", e?.shortMessage ?? e?.message ?? e);
  process.exit(1);
});
