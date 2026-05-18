import { useEffect, useRef, useState } from "react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { CheckCircle2, Eye, Loader2, Lock, Unlock } from "lucide-react";
import { config } from "../lib/config";
import { payrollPoolAbi } from "../lib/abi";
import { cipherPreview, fmtUsdc } from "../lib/format";
import { unsealUint128 } from "../lib/fhe";
import { useFHE } from "../hooks/useFHE";
import { usePayeeEncryptedAmount, usePayeeStatus } from "../hooks/usePayrollPool";

type Step =
  | "idle"
  | "requesting"
  | "waitingRequest"
  | "unsealing"
  | "finalizing"
  | "waitingFinalize"
  | "done"
  | "error";

export function ClaimCard() {
  const { address } = useAccount();
  const fhe = useFHE();
  const { data: handle } = usePayeeEncryptedAmount(address);
  const { data: status, refetch: refetchStatus } = usePayeeStatus(address);
  const [step, setStep] = useState<Step>("idle");
  const [err, setErr] = useState<string | null>(null);
  const [peeked, setPeeked] = useState<bigint | null>(null);
  const [claimedAmount, setClaimedAmount] = useState<bigint | null>(null);

  const finalizeStartedRef = useRef(false);
  const unsealAfterFinalizeRef = useRef(false);

  const reqTx = useWriteContract();
  const finTx = useWriteContract();
  const reqWait = useWaitForTransactionReceipt({ hash: reqTx.data });
  const finWait = useWaitForTransactionReceipt({ hash: finTx.data });

  const [, requested, claimed, ready, period] =
    (status ?? [false, false, false, false, 0n]) as readonly [boolean, boolean, boolean, boolean, bigint];

  const lastPeriodRef = useRef<bigint | undefined>(undefined);
  useEffect(() => {
    if (period === undefined) return;
    if (lastPeriodRef.current !== undefined && lastPeriodRef.current !== period) {
      setStep("idle");
      setErr(null);
      setClaimedAmount(null);
      setPeeked(null);
      finalizeStartedRef.current = false;
      unsealAfterFinalizeRef.current = false;
    }
    lastPeriodRef.current = period;
  }, [period]);

  useEffect(() => {
    if (reqWait.isSuccess && step === "waitingRequest") {
      setStep("unsealing");
      refetchStatus();
    }
  }, [reqWait.isSuccess, step, refetchStatus]);

  useEffect(() => {
    if (step !== "unsealing" || !ready || finalizeStartedRef.current) return;
    finalizeStartedRef.current = true;
    setStep("finalizing");
    (async () => {
      try {
        await finTx.writeContractAsync({
          address: config.payrollPool,
          abi: payrollPoolAbi,
          functionName: "finalizeClaim",
        });
        setStep("waitingFinalize");
      } catch (e: any) {
        finalizeStartedRef.current = false;
        setErr(e?.shortMessage ?? e?.message ?? String(e));
        setStep("error");
      }
    })();
  }, [step, ready, finTx]);

  useEffect(() => {
    if (!finWait.isSuccess || step !== "waitingFinalize" || unsealAfterFinalizeRef.current) return;
    unsealAfterFinalizeRef.current = true;
    (async () => {
      try {
        if (handle) {
          const v = await unsealUint128(handle as bigint);
          setClaimedAmount(v);
        }
      } catch { /* non-fatal */ }
      setStep("done");
      refetchStatus();
    })();
  }, [finWait.isSuccess, step, handle, refetchStatus]);

  async function onClaim() {
    if (claimed) return;
    setErr(null);
    setClaimedAmount(null);
    finalizeStartedRef.current = false;
    unsealAfterFinalizeRef.current = false;
    try {
      if (!requested) {
        setStep("requesting");
        await reqTx.writeContractAsync({
          address: config.payrollPool,
          abi: payrollPoolAbi,
          functionName: "requestClaim",
        });
        setStep("waitingRequest");
      } else {
        setStep("unsealing");
      }
    } catch (e: any) {
      setErr(e?.shortMessage ?? e?.message ?? String(e));
      setStep("error");
    }
  }

  async function onPeek() {
    if (!handle || !fhe.ready) return;
    setErr(null);
    try {
      const v = await unsealUint128(handle as bigint);
      setPeeked(v);
    } catch (e: any) {
      setErr(e?.shortMessage ?? e?.message ?? String(e));
    }
  }

  const busy =
    step === "requesting" ||
    step === "waitingRequest" ||
    step === "unsealing" ||
    step === "finalizing" ||
    step === "waitingFinalize";

  return (
    <div className="neumo-card rounded-2xl p-7 max-w-2xl">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="font-semibold display-tight text-navy text-lg inline-flex items-center gap-2">
          {claimed ? <Unlock className="h-4 w-4 text-success" /> : <Lock className="h-4 w-4 text-blue-700" />}
          Your sealed pay
        </h3>
        <span className="text-[11px] text-neutral-700 font-semibold">Cycle #{period?.toString() ?? "—"}</span>
      </div>
      <p className="text-xs text-neutral-700 mb-5">
        Only you can open this. The admin can see the total of everyone's pay (also sealed), but they can't see <em>your</em> number.
      </p>

      <div className="rounded-2xl cipher-card p-6 mb-5">
        <div className="label-eyebrow mb-2 flex items-center gap-1.5">
          <Lock className="h-3 w-3 text-blue-700" /> Sealed pay packet
        </div>
        <div className="font-mono text-2xl md:text-3xl text-navy break-all display-tight">
          {cipherPreview(handle as bigint | undefined)}
        </div>
        {peeked !== null && claimedAmount === null ? (
          <div className="mt-3 text-sm text-blue-700 font-semibold">
            You peeked · <span className="tabular-nums font-mono">{fmtUsdc(peeked)} USDC</span>{" "}
            <span className="text-neutral-700 text-xs font-normal">just looking, no money moves</span>
          </div>
        ) : null}
        {claimedAmount !== null ? (
          <div className="mt-3 text-success text-base inline-flex items-center gap-1.5 font-semibold">
            <Unlock className="h-4 w-4" />
            Paid · <span className="tabular-nums font-semibold font-mono">{fmtUsdc(claimedAmount)} USDC</span>
          </div>
        ) : null}
      </div>

      <div className="flex gap-2">
        <button
          disabled={!fhe.ready || !handle || busy}
          onClick={onPeek}
          className="inline-flex items-center justify-center gap-2 btn-ghost text-sm font-semibold px-5 h-11 rounded-xl t-vault"
        >
          <Eye className="h-4 w-4 text-blue-700" />
          Peek
        </button>
        <button
          disabled={!fhe.ready || claimed || busy}
          onClick={onClaim}
          className="flex-1 inline-flex items-center justify-center gap-2 btn-cta text-sm font-semibold px-5 h-11 rounded-xl t-vault"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : claimed ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Unlock className="h-4 w-4" />
          )}
          {step === "requesting"
            ? "Sign to unlock…"
            : step === "waitingRequest"
            ? "Asking the network…"
            : step === "unsealing"
            ? "Unsealing your pay…"
            : step === "finalizing"
            ? "Sign to receive…"
            : step === "waitingFinalize"
            ? "Sending the money…"
            : claimed
            ? "Paid this cycle"
            : "Get paid"}
        </button>
      </div>

      <div className="mt-4 text-[11px] text-neutral-700 leading-relaxed">
        One button, two short signatures: first the network unseals your pay (takes a few seconds), then it sends to your wallet. Your number stays private the whole time, only the actual transfer is public, and that's normal.
      </div>

      {err ? <div className="mt-3 text-xs text-red-500 break-all">{err}</div> : null}
    </div>
  );
}
