import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { config } from "../lib/config";
import { erc20Abi, payrollPoolAbi } from "../lib/abi";
import type { Address } from "viem";

const POOL = { address: config.payrollPool, abi: payrollPoolAbi } as const;

export function usePoolOverview() {
  const q = useReadContracts({
    allowFailure: false,
    contracts: [
      { ...POOL, functionName: "owner" },
      { ...POOL, functionName: "getPayeeCount" },
      { ...POOL, functionName: "getRemainingBalance" },
      { ...POOL, functionName: "getAggregatePayroll" },
      { ...POOL, functionName: "currentPeriod" },
      { ...POOL, functionName: "lastPeriodAt" },
      { ...POOL, functionName: "periodInterval" },
      { ...POOL, functionName: "nextPeriodAt" },
    ],
    query: { refetchInterval: 8_000 },
  });

  if (!q.data) {
    return {
      isLoading: q.isLoading,
      owner: undefined,
      payeeCount: undefined,
      remainingBalance: undefined,
      aggregateHandle: undefined,
      currentPeriod: undefined,
      lastPeriodAt: undefined,
      periodInterval: undefined,
      nextPeriodAt: undefined,
    } as const;
  }

  const [owner, payeeCount, remainingBalance, aggregateHandle, currentPeriod, lastPeriodAt, periodInterval, nextPeriodAt] =
    q.data as [Address, bigint, bigint, bigint, bigint, bigint, bigint, bigint];

  return {
    isLoading: false,
    owner,
    payeeCount,
    remainingBalance,
    aggregateHandle,
    currentPeriod,
    lastPeriodAt,
    periodInterval,
    nextPeriodAt,
  } as const;
}

export function usePayeeList() {
  const { data: count } = useReadContract({
    ...POOL,
    functionName: "getPayeeCount",
    query: { refetchInterval: 8_000 },
  });
  const n = count ? Number(count) : 0;
  const contracts = Array.from({ length: n }, (_, i) => ({
    ...POOL,
    functionName: "getPayeeAt" as const,
    args: [BigInt(i)] as const,
  }));
  const q = useReadContracts({
    allowFailure: false,
    contracts,
    query: { enabled: n > 0, refetchInterval: 8_000 },
  });
  return (q.data as Address[] | undefined) ?? [];
}

export function usePayeeStatus(address?: Address) {
  return useReadContract({
    ...POOL,
    functionName: "getPayeeStatus",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 4_000 },
  });
}

export function usePayeeEncryptedAmount(address?: Address) {
  return useReadContract({
    ...POOL,
    functionName: "getPayeeEncryptedAmount",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 12_000 },
  });
}

export function useUsdcBalance(address?: Address) {
  return useReadContract({
    address: config.usdc,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 8_000 },
  });
}

export function useUsdcAllowance(owner?: Address) {
  return useReadContract({
    address: config.usdc,
    abi: erc20Abi,
    functionName: "allowance",
    args: owner ? [owner, config.payrollPool] : undefined,
    query: { enabled: !!owner, refetchInterval: 4_000 },
  });
}

export function useIsRole() {
  const { address } = useAccount();
  const { owner } = usePoolOverview();
  const status = usePayeeStatus(address);
  const isOwner = !!address && !!owner && address.toLowerCase() === owner.toLowerCase();
  // viem returns a "named tuple" for multi-output view fns: array with named props.
  // Access by index is stable; exists is the first output.
  const existsFlag = (status.data as readonly unknown[] | undefined)?.[0];
  const isPayee = existsFlag === true;
  return { address, isOwner, isPayee };
}
