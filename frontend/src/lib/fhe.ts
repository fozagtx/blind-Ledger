import { cofhejs, Encryptable, FheTypes } from "cofhejs/web";
import type { PublicClient, WalletClient } from "viem";

let initialized = false;
let initPromise: Promise<void> | null = null;

/// Initialize cofhejs against the connected viem clients. Idempotent.
export async function initFHE(publicClient: PublicClient, walletClient: WalletClient): Promise<void> {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const res = await cofhejs.initializeWithViem({
      viemClient: publicClient as any,
      viemWalletClient: walletClient as any,
      environment: "TESTNET",
    });
    if (!res?.success) {
      initPromise = null;
      throw new Error(`cofhejs init failed: ${res?.error ?? "unknown"}`);
    }
    initialized = true;
  })();

  return initPromise;
}

export function isFHEReady(): boolean {
  return initialized;
}

/// Encrypt a uint128 salary amount client-side. Returns the calldata struct
/// the contract expects for InEuint128.
export async function encryptUint128(value: bigint) {
  if (!initialized) throw new Error("cofhejs not initialized");
  const res = await cofhejs.encrypt([Encryptable.uint128(value)]);
  if (!res.success) throw new Error(`encrypt failed: ${res.error}`);
  return res.data[0];
}

/// Unseal a ciphertext handle off-chain (no on-chain tx). Caller must have
/// been granted access via FHE.allow on that handle.
export async function unsealUint128(handle: bigint): Promise<bigint> {
  if (!initialized) throw new Error("cofhejs not initialized");
  const res = await cofhejs.unseal(handle, FheTypes.Uint128);
  if (!res.success) throw new Error(`unseal failed: ${res.error}`);
  return res.data as bigint;
}
