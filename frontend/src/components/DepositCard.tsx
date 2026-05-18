import { useState } from "react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { ArrowDownToLine, CheckCircle2, Loader2 } from "lucide-react";
import { config } from "../lib/config";
import { erc20Abi, payrollPoolAbi } from "../lib/abi";
import { fmtUsdc, parseUsdc } from "../lib/format";
import { useUsdcAllowance, useUsdcBalance } from "../hooks/usePayrollPool";
import { UsdcLogo } from "./Logos";

export function DepositCard() {
  const { address } = useAccount();
  const { data: balance } = useUsdcBalance(address);
  const { data: allowance } = useUsdcAllowance(address);
  const [amount, setAmount] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const approve = useWriteContract();
  const deposit = useWriteContract();
  const approveWait = useWaitForTransactionReceipt({ hash: approve.data });
  const depositWait = useWaitForTransactionReceipt({ hash: deposit.data });

  let parsed: bigint | null = null;
  try { parsed = amount ? parseUsdc(amount) : null; } catch { parsed = null; }

  const needsApproval = parsed !== null && (allowance ?? 0n) < parsed;
  const insufficient = parsed !== null && balance !== undefined && balance < parsed;

  async function onApprove() {
    if (!parsed) return;
    setErr(null);
    try {
      await approve.writeContractAsync({
        address: config.usdc,
        abi: erc20Abi,
        functionName: "approve",
        args: [config.payrollPool, parsed],
      });
    } catch (e: any) { setErr(e?.shortMessage ?? e?.message ?? String(e)); }
  }

  async function onDeposit() {
    if (!parsed) return;
    setErr(null);
    try {
      await deposit.writeContractAsync({
        address: config.payrollPool,
        abi: payrollPoolAbi,
        functionName: "depositFunds",
        args: [parsed],
      });
      setAmount("");
    } catch (e: any) { setErr(e?.shortMessage ?? e?.message ?? String(e)); }
  }

  return (
    <div className="neumo-card rounded-2xl p-6 max-w-2xl">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="font-semibold display-tight text-navy text-lg">Add funds to the pool</h3>
        <span className="text-[11px] text-neutral-700">
          Your wallet · <span className="tabular-nums text-navy font-semibold">{fmtUsdc(balance)}</span>
        </span>
      </div>
      <p className="text-xs text-neutral-700 mb-2">
        The pool balance is public. Individual pay stays private.
      </p>
      <p className="text-xs text-neutral-700 mb-4 inline-flex items-center gap-1.5 flex-wrap">
        <UsdcLogo className="h-3.5 w-3.5" /> Need testnet USDC?
        <a
          href="https://faucet.circle.com"
          target="_blank"
          rel="noreferrer"
          className="text-blue-700 font-semibold hover:underline"
        >
          Grab some from Circle's faucet →
        </a>
        <span className="text-neutral-600">(pick <span className="text-navy font-semibold">Arbitrum Sepolia</span>).</span>
      </p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            className="w-full input-solid rounded-xl pl-3 pr-14 h-11 text-sm tabular-nums focus:outline-none focus:border-blue-700 text-navy placeholder:text-neutral-500 t-vault"
            placeholder="0.00"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-navy text-xs font-semibold">
            <UsdcLogo className="h-3.5 w-3.5" />
            USDC
          </span>
        </div>
        {/* One active primary button at a time, Approve first if needed, then Add funds. */}
        {needsApproval ? (
          <button
            disabled={!parsed || insufficient || approve.isPending || approveWait.isLoading}
            onClick={onApprove}
            className="inline-flex items-center justify-center gap-2 btn-cta text-sm font-semibold px-5 h-11 rounded-xl t-vault"
          >
            {(approve.isPending || approveWait.isLoading) ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDownToLine className="h-4 w-4" />}
            {approve.isPending || approveWait.isLoading ? "Allowing…" : "Allow USDC"}
          </button>
        ) : (
          <button
            disabled={!parsed || insufficient || deposit.isPending || depositWait.isLoading}
            onClick={onDeposit}
            className="inline-flex items-center justify-center gap-2 btn-cta text-sm font-semibold px-5 h-11 rounded-xl t-vault"
          >
            {(deposit.isPending || depositWait.isLoading) ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDownToLine className="h-4 w-4" />}
            {deposit.isPending || depositWait.isLoading ? "Adding…" : "Add funds"}
          </button>
        )}
      </div>
      {needsApproval && parsed && !insufficient ? (
        <div className="mt-2 text-[11px] text-neutral-700">
          One-time step: lets the pool pull USDC from your wallet. Next click adds the funds.
        </div>
      ) : null}
      {insufficient ? <div className="mt-2 text-xs text-red-500 font-semibold">Not enough USDC in your wallet</div> : null}
      {depositWait.isSuccess ? (
        <div className="mt-2 text-xs text-success inline-flex items-center gap-1 font-semibold">
          <CheckCircle2 className="h-3 w-3" /> Funds added to the pool
        </div>
      ) : null}
      {err ? <div className="mt-2 text-xs text-red-500 break-all">{err}</div> : null}
    </div>
  );
}
