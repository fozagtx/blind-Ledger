import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createPublicClient, createWalletClient, http, type Address, type Hex } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// Minimal ABI - only what this function calls/reads
const abi = [
  { type: "function", name: "advancePeriod", inputs: [], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "currentPeriod", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "nextPeriodAt", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  {
    type: "function",
    name: "keepers",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ type: "bool" }],
    stateMutability: "view",
  },
] as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel cron auth: Vercel adds Authorization: Bearer <CRON_SECRET>.
  const expected = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  const pk = process.env.KEEPER_PRIVATE_KEY as Hex | undefined;
  const rpc = process.env.ARBITRUM_SEPOLIA_RPC_URL;
  const pool = process.env.PAYROLL_POOL_ADDRESS as Address | undefined;
  if (!pk || !rpc || !pool) {
    return res.status(500).json({ ok: false, error: "missing env: KEEPER_PRIVATE_KEY / ARBITRUM_SEPOLIA_RPC_URL / PAYROLL_POOL_ADDRESS" });
  }

  const account = privateKeyToAccount(pk);
  const publicClient = createPublicClient({ chain: arbitrumSepolia, transport: http(rpc) });
  const walletClient = createWalletClient({ account, chain: arbitrumSepolia, transport: http(rpc) });

  // Pre-flight checks so we get a clean log instead of a generic revert
  const [isKeeper, currentPeriod, nextAt] = await Promise.all([
    publicClient.readContract({ address: pool, abi, functionName: "keepers", args: [account.address] }),
    publicClient.readContract({ address: pool, abi, functionName: "currentPeriod" }),
    publicClient.readContract({ address: pool, abi, functionName: "nextPeriodAt" }),
  ]);

  if (!isKeeper) {
    return res.status(403).json({
      ok: false,
      error: "keeper not authorized on contract",
      keeper: account.address,
    });
  }

  const now = BigInt(Math.floor(Date.now() / 1000));
  if (now < (nextAt as bigint)) {
    return res.status(200).json({
      ok: true,
      skipped: true,
      reason: "period not ready yet",
      currentPeriod: (currentPeriod as bigint).toString(),
      nextPeriodAt: (nextAt as bigint).toString(),
      now: now.toString(),
    });
  }

  try {
    const hash = await walletClient.writeContract({
      address: pool,
      abi,
      functionName: "advancePeriod",
    });
    return res.status(200).json({
      ok: true,
      skipped: false,
      previousPeriod: (currentPeriod as bigint).toString(),
      txHash: hash,
      keeper: account.address,
    });
  } catch (e: any) {
    return res.status(500).json({
      ok: false,
      error: e?.shortMessage ?? e?.message ?? String(e),
    });
  }
}
