import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import type { Address, Hash } from "viem";
import { config } from "../lib/config";
import { payrollPoolAbi } from "../lib/abi";

// Block the contract was deployed at — capped lookback so first fetch isn't huge.
// (Arb Sepolia block at deploy time was ~155M; we just use a generous fromBlock.)
const DEPLOY_BLOCK = 155_000_000n;

export type ActivityEvent = {
  id: string;            // tx hash + log index
  kind:
    | "FundsDeposited"
    | "PayeeAdded"
    | "PayeeRemoved"
    | "ClaimRequested"
    | "SalaryClaimed"
    | "PeriodAdvanced"
    | "KeeperSet"
    | "PeriodIntervalUpdated";
  block: bigint;
  txHash: Hash;
  ts?: number;           // block timestamp (filled in best-effort)
  args: Record<string, unknown>;
};

export function useHistory() {
  const publicClient = usePublicClient();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicClient) return;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // Find the lowest block we should query from.
        const head = await publicClient!.getBlockNumber();
        const fromBlock = head > DEPLOY_BLOCK ? DEPLOY_BLOCK : 0n;

        const logs = await publicClient!.getContractEvents({
          address: config.payrollPool,
          abi: payrollPoolAbi,
          fromBlock,
          toBlock: "latest",
        });

        // Resolve block timestamps in batches (just for the unique blocks we have).
        const uniqueBlocks = Array.from(new Set(logs.map((l) => l.blockNumber!)));
        const blockTimes = new Map<bigint, number>();
        await Promise.all(
          uniqueBlocks.map(async (bn) => {
            try {
              const b = await publicClient!.getBlock({ blockNumber: bn });
              blockTimes.set(bn, Number(b.timestamp));
            } catch {
              /* ignore — timestamp is optional */
            }
          })
        );

        const mapped: ActivityEvent[] = logs.map((l: any) => ({
          id: `${l.transactionHash}:${l.logIndex}`,
          kind: l.eventName,
          block: l.blockNumber,
          txHash: l.transactionHash,
          ts: blockTimes.get(l.blockNumber),
          args: l.args ?? {},
        }));
        // Newest first
        mapped.sort((a, b) => Number(b.block - a.block));

        if (!cancelled) setEvents(mapped);
      } catch (e: any) {
        if (!cancelled) setError(e?.shortMessage ?? e?.message ?? String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    // Poll every 15s for new activity. Cheap because we always re-fetch the same range.
    const t = setInterval(load, 15_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [publicClient]);

  return { events, loading, error };
}

export function useMyClaimHistory(address?: Address) {
  const { events, loading, error } = useHistory();
  const mine = events.filter(
    (e) =>
      (e.kind === "ClaimRequested" || e.kind === "SalaryClaimed") &&
      address &&
      (e.args.payee as string)?.toLowerCase() === address.toLowerCase()
  );
  return { events: mine, loading, error };
}
