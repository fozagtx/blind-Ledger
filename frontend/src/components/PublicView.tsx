import { Lock } from "lucide-react";
import { usePoolOverview } from "../hooks/usePayrollPool";
import { cipherPreview, fmtUsdc } from "../lib/format";

function fmtCountdown(secs: number): string {
  if (secs <= 0) return "ready";
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function KV({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="label-eyebrow">{label}</div>
      <div className={`mt-1.5 text-xl tabular-nums display-tight font-semibold ${highlight ? "text-success" : "text-navy"}`}>
        {value}
      </div>
      {sub ? <div className="text-[11px] text-neutral-700 mt-0.5">{sub}</div> : null}
    </div>
  );
}

export function PublicView() {
  const o = usePoolOverview();
  const now = Math.floor(Date.now() / 1000);
  const next = o.nextPeriodAt ? Number(o.nextPeriodAt) : 0;
  const remaining = next - now;
  const ready = next > 0 && remaining <= 0;

  return (
    <section className="grid grid-cols-1 md:grid-cols-12 rounded-2xl overflow-hidden border border-blue-300/40 bg-white/50">
      {/* Hero: total sealed pay */}
      <div className="md:col-span-8 cipher-card p-8 md:p-10 flex flex-col justify-between min-h-[220px]">
        <div className="flex items-center gap-2 label-eyebrow">
          <Lock className="h-3 w-3 text-blue-700" /> Total payroll · sealed
        </div>
        <div>
          <div className="font-mono text-4xl md:text-[44px] leading-none text-navy break-all display-tight">
            {cipherPreview(o.aggregateHandle)}
          </div>
          <div className="mt-3 text-xs text-neutral-800 max-w-md">
            The sum of every salary, locked. Only the admin can peek at the total, but anyone can verify the math is right.
          </div>
        </div>
      </div>

      {/* Siblings */}
      <div className="md:col-span-4 bg-white px-6 md:px-7 py-2 divide-y divide-blue-300/40 border-l border-blue-300/40">
        <KV
          label="Available"
          value={<>{fmtUsdc(o.remainingBalance)} <span className="text-base text-neutral-700 font-normal">USDC</span></>}
          sub="Anyone can see this. By design."
        />
        <KV
          label="People paid"
          value={o.payeeCount?.toString() ?? "—"}
          sub="Wallets only, no names"
        />
        <KV
          label={`Cycle #${o.currentPeriod?.toString() ?? "—"}`}
          value={next > 0 ? fmtCountdown(remaining) : "—"}
          sub={ready ? "payday ready" : next > 0 ? "until next payday" : "no schedule set"}
          highlight={ready}
        />
      </div>
    </section>
  );
}
