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

function Stat({
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
    <div>
      <div className="label-eyebrow">{label}</div>
      <div
        className={`mt-1 text-lg tabular-nums display-tight font-semibold ${
          highlight ? "text-success" : "text-navy"
        }`}
      >
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
    <section className="rounded-2xl border border-blue-300/40 bg-white/60 overflow-hidden">
      {/* Cipher header — compact, inline label + handle, live pill on the right */}
      <div className="cipher-card px-6 py-5 flex flex-wrap items-center justify-between gap-3 border-b border-blue-300/40">
        <div className="min-w-0 flex-1">
          <div className="label-eyebrow flex items-center gap-1.5 mb-1.5">
            <Lock className="h-3 w-3 text-blue-700" /> Total payroll · sealed
          </div>
          <div className="font-mono text-xl md:text-2xl leading-none text-navy break-all display-tight">
            {cipherPreview(o.aggregateHandle)}
          </div>
        </div>
        <span className="text-[10px] text-neutral-700 px-2 py-0.5 rounded-full bg-white/80 font-semibold inline-flex items-center gap-1 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          live
        </span>
      </div>

      {/* Stats — three columns, hairline-separated, tabular numbers */}
      <div className="grid grid-cols-3 divide-x divide-blue-300/40 bg-white">
        <div className="px-5 py-4">
          <Stat
            label="Pool"
            value={
              <>
                {fmtUsdc(o.remainingBalance)}{" "}
                <span className="text-sm text-neutral-700 font-normal">USDC</span>
              </>
            }
            sub="public"
          />
        </div>
        <div className="px-5 py-4">
          <Stat label="Team" value={o.payeeCount?.toString() ?? "—"} sub="wallets only" />
        </div>
        <div className="px-5 py-4">
          <Stat
            label={`Cycle #${o.currentPeriod?.toString() ?? "—"}`}
            value={next > 0 ? fmtCountdown(remaining) : "—"}
            sub={ready ? "payday ready" : next > 0 ? "to next payday" : "no schedule"}
            highlight={ready}
          />
        </div>
      </div>
    </section>
  );
}
