import { config } from "./config";

export function shortAddr(a?: string | null): string {
  if (!a) return "—";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export function fmtUsdc(amount?: bigint | null): string {
  if (amount === null || amount === undefined) return "—";
  const d = config.usdcDecimals;
  const whole = amount / 10n ** BigInt(d);
  const frac = amount % 10n ** BigInt(d);
  const fracStr = frac.toString().padStart(d, "0").replace(/0+$/, "");
  const wholeStr = whole.toLocaleString("en-US");
  return fracStr ? `${wholeStr}.${fracStr}` : wholeStr;
}

export function parseUsdc(input: string): bigint {
  const clean = input.trim().replace(/,/g, "");
  if (!/^\d*\.?\d*$/.test(clean) || clean === "" || clean === ".") {
    throw new Error("Invalid amount");
  }
  const [w = "0", f = ""] = clean.split(".");
  const d = config.usdcDecimals;
  const fracPadded = (f + "0".repeat(d)).slice(0, d);
  return BigInt(w) * 10n ** BigInt(d) + BigInt(fracPadded || "0");
}

export function cipherPreview(handle?: bigint | null): string {
  if (!handle) return "0x…";
  const hex = handle.toString(16).padStart(64, "0");
  return `0x${hex.slice(0, 8)}…${hex.slice(-6)}`;
}
