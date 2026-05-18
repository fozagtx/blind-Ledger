import { useEffect, useState } from "react";
import { isAddress, type Address } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";
import { config } from "../lib/config";
import { payrollPoolAbi } from "../lib/abi";
import { parseUsdc } from "../lib/format";
import { encryptUint128 } from "../lib/fhe";
import { useFHE } from "../hooks/useFHE";
import { UsdcLogo } from "./Logos";

type Step = "idle" | "encrypting" | "submitting" | "confirming" | "done" | "error";

export function AddPayeeCard() {
  const fhe = useFHE();
  const [addr, setAddr] = useState("");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [err, setErr] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  const write = useWriteContract();
  const wait = useWaitForTransactionReceipt({ hash: txHash });

  const validAddr = isAddress(addr);
  let parsed: bigint | null = null;
  try { parsed = amount ? parseUsdc(amount) : null; } catch { parsed = null; }

  async function onSubmit() {
    if (!validAddr || !parsed) return;
    if (!fhe.ready) {
      setErr("Encryption engine still warming up. Try again in a second.");
      return;
    }
    setErr(null);
    try {
      setStep("encrypting");
      const enc = await encryptUint128(parsed);
      setStep("submitting");
      const hash = await write.writeContractAsync({
        address: config.payrollPool,
        abi: payrollPoolAbi,
        functionName: "addPayee",
        args: [addr as Address, enc as any],
      });
      setTxHash(hash);
      setStep("confirming");
    } catch (e: any) {
      setStep("error");
      setErr(e?.shortMessage ?? e?.message ?? String(e));
    }
  }

  useEffect(() => {
    if (wait.isSuccess && step === "confirming") {
      setStep("done");
      setAddr("");
      setAmount("");
      setTxHash(undefined);
    }
  }, [wait.isSuccess, step]);

  const busy = step === "encrypting" || step === "submitting" || step === "confirming";

  return (
    <div className="neumo-card rounded-2xl p-6">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="font-semibold display-tight text-navy text-lg">Add a team member</h3>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-blue-700 font-semibold">
          <Lock className="h-3 w-3" /> Sealed in your browser
        </span>
      </div>
      <p className="text-xs text-neutral-700 mb-4">
        Type their wallet and their salary. The number gets sealed inside your browser before it ever touches the network. We can't see it. You can't accidentally leak it.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-2">
        <input
          className="input-solid rounded-xl px-3 h-11 text-sm font-mono focus:outline-none focus:border-blue-700 text-navy placeholder:text-neutral-500 t-vault"
          placeholder="0xWallet address…"
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
        />
        <div className="relative">
          <input
            className="w-full input-solid rounded-xl pl-3 pr-24 h-11 text-sm tabular-nums focus:outline-none focus:border-blue-700 text-navy placeholder:text-neutral-500 t-vault"
            placeholder="Salary per cycle"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-navy text-xs font-semibold">
            <UsdcLogo className="h-3.5 w-3.5" />
            USDC <span className="text-neutral-700 font-normal">/ cycle</span>
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <button
          disabled={!validAddr || !parsed || busy}
          onClick={onSubmit}
          className="inline-flex items-center justify-center gap-2 btn-cta text-sm font-semibold px-6 h-11 rounded-xl t-vault"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
          {step === "encrypting" ? "Sealing pay…"
            : step === "submitting" ? "Adding…"
            : step === "confirming" ? "Almost done…"
            : !fhe.ready ? "Warming up…"
            : !validAddr ? "Enter a valid wallet"
            : !parsed ? "Enter a salary"
            : "Seal and add"}
        </button>
      </div>

      {step === "done" ? (
        <div className="mt-3 text-xs text-success inline-flex items-center gap-1 font-semibold">
          <CheckCircle2 className="h-3 w-3" /> Added, their pay is sealed and on the schedule
        </div>
      ) : null}
      {err ? <div className="mt-3 text-xs text-red-500 break-all">{err}</div> : null}
    </div>
  );
}
