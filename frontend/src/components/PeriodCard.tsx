import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { FastForward, Loader2 } from "lucide-react";
import { config } from "../lib/config";
import { payrollPoolAbi } from "../lib/abi";
import { usePoolOverview } from "../hooks/usePayrollPool";

function fmtSecs(secs: number): string {
  if (secs <= 0) return "ready now";
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function PeriodCard() {
  const { address } = useAccount();
  const o = usePoolOverview();
  const { data: isKeeper } = useReadContract({
    address: config.payrollPool,
    abi: payrollPoolAbi,
    functionName: "keepers",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  const next = o.nextPeriodAt ? Number(o.nextPeriodAt) : 0;
  const remaining = next - now;
  const canAdvance = remaining <= 0;
  const isOwner = !!address && !!o.owner && address.toLowerCase() === o.owner.toLowerCase();
  const allowed = isOwner || !!isKeeper;

  const advance = useWriteContract();
  const wait = useWaitForTransactionReceipt({ hash: advance.data });

  async function onAdvance() {
    try {
      await advance.writeContractAsync({
        address: config.payrollPool,
        abi: payrollPoolAbi,
        functionName: "advancePeriod",
      });
    } catch {
      /* surfaced via advance.error */
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3 gap-x-8">
        <div>
          <div className="label-eyebrow">This cycle</div>
          <div className="mt-1 text-2xl tabular-nums display-tight text-navy font-semibold">
            #{o.currentPeriod?.toString() ?? "—"}
          </div>
        </div>
        <div>
          <div className="label-eyebrow">Next payday</div>
          <div className={`mt-1 text-2xl tabular-nums display-tight font-semibold ${canAdvance ? "text-success" : "text-navy"}`}>
            {next > 0 ? fmtSecs(remaining) : "—"}
          </div>
        </div>
        <div>
          <div className="label-eyebrow">Frequency</div>
          <div className="mt-1 text-2xl tabular-nums display-tight text-navy font-semibold">
            {o.periodInterval ? `every ${fmtSecs(Number(o.periodInterval))}` : "—"}
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-neutral-700 max-w-2xl">
        Paydays roll over automatically on schedule. You can also trigger one manually here once it's ready, but never earlier than the cycle allows.
      </p>

      {allowed ? (
        <button
          disabled={!canAdvance || advance.isPending || wait.isLoading}
          onClick={onAdvance}
          className="mt-4 inline-flex items-center justify-center gap-2 btn-ghost text-sm font-semibold px-5 h-11 rounded-xl t-vault"
        >
          {(advance.isPending || wait.isLoading) ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-700" />
          ) : (
            <FastForward className={`h-4 w-4 ${canAdvance ? "text-success" : "text-neutral-700"}`} />
          )}
          Run payday now
        </button>
      ) : null}
      {advance.error ? (
        <div className="mt-2 text-xs text-red-500 break-all">{(advance.error as any)?.shortMessage ?? advance.error.message}</div>
      ) : null}
    </div>
  );
}
