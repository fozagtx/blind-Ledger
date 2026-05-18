import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Lock, Loader2, Trash2 } from "lucide-react";
import type { Address } from "viem";
import { config, gasOverride } from "../lib/config";
import { payrollPoolAbi } from "../lib/abi";
import { cipherPreview, shortAddr } from "../lib/format";
import { usePayeeList } from "../hooks/usePayrollPool";

function PayeeRow({ addr }: { addr: Address }) {
  const { data: handle } = useReadContract({
    address: config.payrollPool,
    abi: payrollPoolAbi,
    functionName: "getPayeeEncryptedAmount",
    args: [addr],
    query: { refetchInterval: 12_000 },
  });
  const { data: status } = useReadContract({
    address: config.payrollPool,
    abi: payrollPoolAbi,
    functionName: "getPayeeStatus",
    args: [addr],
    query: { refetchInterval: 6_000 },
  });

  const remove = useWriteContract();
  const wait = useWaitForTransactionReceipt({ hash: remove.data });

  const [, requested, claimed] = (status ?? [false, false, false, false, 0n]) as readonly [boolean, boolean, boolean, boolean, bigint];

  async function onRemove() {
    try {
      await remove.writeContractAsync({
        address: config.payrollPool,
        abi: payrollPoolAbi,
        functionName: "removePayee",
        args: [addr],
        ...gasOverride,
      });
    } catch { /* surfaced */ }
  }

  return (
    <tr className="border-t border-blue-300/30 t-vault hover:bg-white/60">
      <td className="py-3 pl-4 pr-4 text-sm font-mono text-navy font-semibold" title={addr}>{shortAddr(addr)}</td>
      <td className="py-3 px-4">
        <span className="inline-flex items-center gap-1.5">
          <Lock className="h-3 w-3 text-blue-700" />
          <span className="font-mono text-sm text-navy">{cipherPreview(handle as bigint | undefined)}</span>
        </span>
      </td>
      <td className="py-3 px-4 text-xs">
        {claimed ? <span className="text-success font-semibold">paid this cycle</span>
          : requested ? <span className="text-amber-700 font-semibold">unlocking</span>
          : <span className="text-neutral-700">waiting</span>}
      </td>
      <td className="py-3 pr-4 pl-4 text-right">
        <button
          disabled={remove.isPending || wait.isLoading}
          onClick={onRemove}
          className="inline-flex items-center gap-1 text-xs text-neutral-700 hover:text-red-500 t-vault font-semibold"
          title="Remove team member"
        >
          {(remove.isPending || wait.isLoading) ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
          remove
        </button>
      </td>
    </tr>
  );
}

export function PayeeListAdmin() {
  const list = usePayeeList();
  if (list.length === 0) {
    return <div className="text-sm text-neutral-700 py-4">No team members yet. Add the first one in the next section.</div>;
  }
  return (
    <div className="rounded-2xl frost overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="text-left">
            <th className="py-3 pl-4 pr-4 label-eyebrow font-normal">Wallet</th>
            <th className="py-3 px-4 label-eyebrow font-normal">Sealed pay</th>
            <th className="py-3 px-4 label-eyebrow font-normal">This cycle</th>
            <th className="py-3 pr-4 pl-4 text-right label-eyebrow font-normal" />
          </tr>
        </thead>
        <tbody>
          {list.map((a) => <PayeeRow key={a} addr={a} />)}
        </tbody>
      </table>
    </div>
  );
}
