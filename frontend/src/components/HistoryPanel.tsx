import { useAccount } from "wagmi";
import {
  ArrowDownToLine,
  Bot,
  Clock,
  Loader2,
  Lock,
  Settings,
  Trash2,
  Unlock,
  UserPlus,
} from "lucide-react";
import { useHistory, useMyClaimHistory, type ActivityEvent } from "../hooks/useHistory";
import { fmtUsdc, shortAddr } from "../lib/format";
import { TxLink } from "./TxLink";

function timeAgo(ts?: number): string {
  if (!ts) return "just now";
  const diff = Math.floor(Date.now() / 1000) - ts;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const d = Math.floor(diff / 86400);
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

function rowFor(e: ActivityEvent): {
  Icon: typeof Lock;
  iconCls: string;
  title: React.ReactNode;
  meta?: string;
} {
  const a = e.args as any;
  switch (e.kind) {
    case "FundsDeposited":
      return {
        Icon: ArrowDownToLine,
        iconCls: "text-success bg-emerald-50 border-emerald-200",
        title: (
          <>
            <span className="font-semibold text-navy">Funds added</span>
            <span className="tabular-nums font-mono"> · {fmtUsdc(a.amount)} USDC</span>
          </>
        ),
        meta: a.from ? `from ${shortAddr(a.from)}` : undefined,
      };
    case "PayeeAdded":
      return {
        Icon: UserPlus,
        iconCls: "text-blue-700 bg-blue-100 border-blue-200",
        title: (
          <>
            <span className="font-semibold text-navy">Team member added</span>
            <span className="font-mono text-neutral-700"> · {shortAddr(a.payee)}</span>
          </>
        ),
        meta: "salary sealed",
      };
    case "PayeeRemoved":
      return {
        Icon: Trash2,
        iconCls: "text-red-600 bg-red-50 border-red-200",
        title: (
          <>
            <span className="font-semibold text-navy">Team member removed</span>
            <span className="font-mono text-neutral-700"> · {shortAddr(a.payee)}</span>
          </>
        ),
      };
    case "ClaimRequested":
      return {
        Icon: Lock,
        iconCls: "text-amber-700 bg-amber-50 border-amber-200",
        title: (
          <>
            <span className="font-semibold text-navy">Unseal requested</span>
            <span className="font-mono text-neutral-700"> · {shortAddr(a.payee)}</span>
          </>
        ),
        meta: `cycle #${(a.period as bigint)?.toString() ?? "?"}`,
      };
    case "SalaryClaimed":
      return {
        Icon: Unlock,
        iconCls: "text-success bg-emerald-50 border-emerald-200",
        title: (
          <>
            <span className="font-semibold text-navy">Pay sent</span>
            <span className="font-mono text-neutral-700"> · {shortAddr(a.payee)}</span>
            <span className="tabular-nums font-mono"> · {fmtUsdc(a.amount)} USDC</span>
          </>
        ),
        meta: `cycle #${(a.period as bigint)?.toString() ?? "?"}`,
      };
    case "PeriodAdvanced":
      return {
        Icon: Clock,
        iconCls: "text-blue-700 bg-blue-100 border-blue-200",
        title: (
          <>
            <span className="font-semibold text-navy">
              New cycle #{(a.newPeriod as bigint)?.toString() ?? "?"} started
            </span>
          </>
        ),
        meta: a.by ? `by ${shortAddr(a.by)}` : undefined,
      };
    case "KeeperSet":
      return {
        Icon: Bot,
        iconCls: "text-blue-700 bg-blue-100 border-blue-200",
        title: (
          <>
            <span className="font-semibold text-navy">
              Keeper {a.allowed ? "trusted" : "revoked"}
            </span>
            <span className="font-mono text-neutral-700"> · {shortAddr(a.keeper)}</span>
          </>
        ),
      };
    case "PeriodIntervalUpdated":
      return {
        Icon: Settings,
        iconCls: "text-neutral-700 bg-neutral-50 border-neutral-200",
        title: (
          <>
            <span className="font-semibold text-navy">Schedule changed</span>
            <span className="tabular-nums font-mono"> · every {(a.newInterval as bigint)?.toString()}s</span>
          </>
        ),
      };
  }
}

function Row({ e }: { e: ActivityEvent }) {
  const r = rowFor(e);
  const Icon = r.Icon;
  return (
    <li className="flex items-start gap-3 py-3.5 border-t border-blue-300/30 first:border-t-0">
      <div className={`h-8 w-8 rounded-lg border grid place-items-center shrink-0 ${r.iconCls}`}>
        <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm leading-snug">{r.title}</div>
        <div className="mt-0.5 text-[11px] text-neutral-700 inline-flex items-center gap-2 flex-wrap">
          <span>{timeAgo(e.ts)}</span>
          {r.meta ? <><span className="text-neutral-400">·</span><span>{r.meta}</span></> : null}
          <span className="text-neutral-400">·</span>
          <TxLink hash={e.txHash} />
        </div>
      </div>
    </li>
  );
}

export function HistoryPanelAdmin() {
  const { events, loading, error } = useHistory();
  return <HistoryView events={events} loading={loading} error={error} empty="No on-chain activity yet. Deposit funds or add a team member to start the timeline." />;
}

export function HistoryPanelPayee() {
  const { address } = useAccount();
  const { events, loading, error } = useMyClaimHistory(address);
  return <HistoryView events={events} loading={loading} error={error} empty="You haven't claimed anything yet. Head to Get paid when a cycle is ready." />;
}

function HistoryView({
  events,
  loading,
  error,
  empty,
}: {
  events: ActivityEvent[];
  loading: boolean;
  error: string | null;
  empty: string;
}) {
  return (
    <div className="rounded-2xl neumo-card p-5">
      {loading && events.length === 0 ? (
        <div className="text-sm text-neutral-700 inline-flex items-center gap-2 py-3">
          <Loader2 className="h-4 w-4 animate-spin text-blue-700" />
          Loading on-chain activity…
        </div>
      ) : error ? (
        <div className="text-sm text-red-500 break-all">Couldn't load activity: {error}</div>
      ) : events.length === 0 ? (
        <div className="text-sm text-neutral-700 py-3">{empty}</div>
      ) : (
        <ul className="flex flex-col">
          {events.map((e) => <Row key={e.id} e={e} />)}
        </ul>
      )}
    </div>
  );
}
