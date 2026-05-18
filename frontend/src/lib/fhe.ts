import { cofhejs, Encryptable, FheTypes } from "cofhejs/web";
import type { PublicClient, WalletClient } from "viem";

let initialized = false;
let initPromise: Promise<void> | null = null;
let lastInitError: string | null = null;

/// Initialize cofhejs without generating a permit (fast, no wallet signature).
/// A permit is created lazily, only when unseal is actually called.
export async function initFHE(publicClient: PublicClient, walletClient: WalletClient): Promise<void> {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      console.info("[fhe] initializing cofhejs against TESTNET…");
      const res = await cofhejs.initializeWithViem({
        viemClient: publicClient as any,
        viemWalletClient: walletClient as any,
        environment: "TESTNET",
        generatePermit: false,   // do NOT prompt for signature on first load
        ignoreErrors: true,      // surface partial init rather than hanging
      });
      if (!res?.success) {
        const msg = `cofhejs init failed: ${res?.error ?? "unknown"}`;
        console.error("[fhe]", msg, res);
        lastInitError = msg;
        initPromise = null;
        throw new Error(msg);
      }
      console.info("[fhe] cofhejs ready");
      initialized = true;
      lastInitError = null;
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      console.error("[fhe] init threw:", msg, e);
      lastInitError = msg;
      initPromise = null;
      throw e;
    }
  })();

  return initPromise;
}

export function isFHEReady(): boolean {
  return initialized;
}

export function getInitError(): string | null {
  return lastInitError;
}

/// Reset and retry. Useful when init failed.
export function resetFHE(): void {
  initialized = false;
  initPromise = null;
  lastInitError = null;
}

/// Generate the permit on demand. Prompts the user for a wallet signature once.
/// Idempotent — cofhejs caches the permit internally.
let permitPromise: Promise<void> | null = null;
async function ensurePermit(): Promise<void> {
  if (permitPromise) return permitPromise;
  permitPromise = (async () => {
    try {
      const res = await cofhejs.createPermit();
      if (!res?.success) {
        permitPromise = null;
        throw new Error(`createPermit failed: ${res?.error ?? "unknown"}`);
      }
    } catch (e) {
      permitPromise = null;
      throw e;
    }
  })();
  return permitPromise;
}

/// Encrypt a uint128 salary client-side. Returns the calldata struct the
/// contract expects for InEuint128. Does NOT require a permit.
export async function encryptUint128(value: bigint) {
  if (!initialized) throw new Error("cofhejs not initialized");
  const res = await cofhejs.encrypt([Encryptable.uint128(value)]);
  if (!res.success) throw new Error(`encrypt failed: ${res.error}`);
  return res.data[0];
}

/// Unseal a ciphertext handle off-chain (no on-chain tx). Caller must have been
/// granted access via FHE.allow on that handle. First call prompts a one-time
/// signature for the permit.
export async function unsealUint128(handle: bigint): Promise<bigint> {
  if (!initialized) throw new Error("cofhejs not initialized");
  await ensurePermit();
  const res = await cofhejs.unseal(handle, FheTypes.Uint128);
  if (!res.success) throw new Error(`unseal failed: ${res.error}`);
  return res.data as bigint;
}
