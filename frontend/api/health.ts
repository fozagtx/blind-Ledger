import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    ok: true,
    service: "blind-ledger",
    time: new Date().toISOString(),
    hasKeeper: !!process.env.KEEPER_PRIVATE_KEY,
    hasRpc: !!process.env.ARBITRUM_SEPOLIA_RPC_URL,
    hasPool: !!process.env.PAYROLL_POOL_ADDRESS,
    hasCronSecret: !!process.env.CRON_SECRET,
  });
}
