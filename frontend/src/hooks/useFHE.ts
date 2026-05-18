import { useCallback, useEffect, useState } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { initFHE, isFHEReady, resetFHE } from "../lib/fhe";

type State = "idle" | "initializing" | "ready" | "error";

export function useFHE() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [state, setState] = useState<State>(isFHEReady() ? "ready" : "idle");
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!publicClient || !walletClient) return;
    if (state === "ready" || state === "initializing") return;

    setState("initializing");
    setError(null);
    initFHE(publicClient, walletClient)
      .then(() => setState("ready"))
      .catch((e) => {
        setError(e?.message ?? String(e));
        setState("error");
      });
  }, [publicClient, walletClient, state, retryCount]);

  const retry = useCallback(() => {
    resetFHE();
    setState("idle");
    setError(null);
    setRetryCount((n) => n + 1);
  }, []);

  return { state, error, ready: state === "ready", retry };
}
