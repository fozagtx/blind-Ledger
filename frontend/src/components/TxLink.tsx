import { ArrowUpRight } from "lucide-react";
import { config } from "../lib/config";

/// Inline Arbiscan link for a tx hash. Renders nothing if hash is undefined.
export function TxLink({
  hash,
  label = "View on Arbiscan",
}: {
  hash: `0x${string}` | undefined;
  label?: string;
}) {
  if (!hash) return null;
  const explorer = config.chainId === 421614 ? "https://sepolia.arbiscan.io" : "https://arbiscan.io";
  const short = `${hash.slice(0, 6)}…${hash.slice(-4)}`;
  return (
    <a
      href={`${explorer}/tx/${hash}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-mono font-semibold t-vault"
      title={hash}
    >
      {short}
      <ArrowUpRight className="h-3 w-3" />
      <span className="sr-only">{label}</span>
    </a>
  );
}
