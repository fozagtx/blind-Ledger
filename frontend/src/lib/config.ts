import { arbitrumSepolia } from "viem/chains";
import type { Address } from "viem";

const poolAddr = import.meta.env.VITE_PAYROLL_POOL_ADDRESS as Address | undefined;
const usdcAddr = import.meta.env.VITE_USDC_ADDRESS as Address | undefined;

if (!poolAddr) {
  // Soft warn, UI will surface a clearer message
  console.warn("VITE_PAYROLL_POOL_ADDRESS not set. Did you run `pnpm deploy` in /contracts?");
}

export const config = {
  chain: arbitrumSepolia,
  chainId: 421614,
  payrollPool: poolAddr ?? ("0x0000000000000000000000000000000000000000" as Address),
  usdc: (usdcAddr ?? "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d") as Address,
  walletConnectProjectId: (import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "") as string,
  usdcDecimals: 6,
  usdcSymbol: "USDC",
  // Circle's faucet, judges will need this
  usdcFaucet: "https://faucet.circle.com",
};

export const isConfigured = poolAddr !== undefined && poolAddr !== "0x0000000000000000000000000000000000000000";
