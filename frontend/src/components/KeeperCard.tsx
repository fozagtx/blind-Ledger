import { useState } from "react";
import { isAddress, type Address } from "viem";
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Loader2, ShieldCheck, ShieldX } from "lucide-react";
import { config } from "../lib/config";
import { payrollPoolAbi } from "../lib/abi";
import { shortAddr } from "../lib/format";

export function KeeperCard() {
  const [input, setInput] = useState("");
  const [lookup, setLookup] = useState<Address | undefined>(undefined);
  const valid = isAddress(input);

  const { data: isKeeper, refetch } = useReadContract({
    address: config.payrollPool,
    abi: payrollPoolAbi,
    functionName: "keepers",
    args: lookup ? [lookup] : undefined,
    query: { enabled: !!lookup },
  });

  const write = useWriteContract();
  const wait = useWaitForTransactionReceipt({ hash: write.data });

  async function setStatus(allowed: boolean) {
    if (!lookup) return;
    try {
      await write.writeContractAsync({
        address: config.payrollPool,
        abi: payrollPoolAbi,
        functionName: "setKeeper",
        args: [lookup, allowed],
      });
      await refetch();
    } catch { /* surfaced */ }
  }

  return (
    <div>
      <p className="text-xs text-neutral-700 mb-4 max-w-2xl">
        A schedule keeper is a wallet that's allowed to <em>only</em> roll over the cycle, nothing else. Give it to your scheduled job (e.g. on Vercel), and you never have to think about payday again. It can't touch funds or change salaries.
      </p>

      <div className="flex gap-2 max-w-xl">
        <input
          className="flex-1 input-solid rounded-xl px-3 h-11 text-sm font-mono focus:outline-none focus:border-blue-700 text-navy placeholder:text-neutral-500 t-vault"
          placeholder="0xKeeper wallet…"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            // auto-lookup as you type once the address is valid
            if (isAddress(e.target.value)) setLookup(e.target.value as Address);
            else setLookup(undefined);
          }}
        />
        <button
          disabled={!valid}
          onClick={() => setLookup(input as Address)}
          className="btn-cta text-sm font-semibold px-5 h-11 rounded-xl t-vault"
        >
          {valid ? "Check status" : "Enter a wallet"}
        </button>
      </div>

      {lookup ? (
        <div className="mt-4 max-w-xl flex items-center justify-between rounded-xl frost px-4 py-3">
          <div className="text-sm">
            <span className="font-mono text-navy font-semibold">{shortAddr(lookup)}</span>{" "}
            <span className={isKeeper ? "text-success font-semibold" : "text-neutral-700"}>
              · {isKeeper ? "trusted" : "not trusted"}
            </span>
          </div>
          <div className="flex gap-2">
            {isKeeper ? (
              <button
                disabled={write.isPending || wait.isLoading}
                onClick={() => setStatus(false)}
                className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-500 text-xs px-3 py-1.5 font-semibold t-vault"
              >
                {(write.isPending || wait.isLoading) ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldX className="h-3 w-3" />}
                Revoke
              </button>
            ) : (
              <button
                disabled={write.isPending || wait.isLoading}
                onClick={() => setStatus(true)}
                className="inline-flex items-center gap-1.5 btn-cta text-white text-xs font-semibold px-4 py-1.5 rounded-xl t-vault"
              >
                {(write.isPending || wait.isLoading) ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3" />}
                Trust
              </button>
            )}
          </div>
        </div>
      ) : null}

      {write.error ? (
        <div className="mt-2 text-xs text-red-500 break-all">
          {(write.error as any)?.shortMessage ?? write.error.message}
        </div>
      ) : null}
    </div>
  );
}
