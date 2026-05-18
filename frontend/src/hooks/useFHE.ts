import { useEffect, useState } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { initFHE, isFHEReady } from "../lib/fhe";

type State = "idle" | "initializing" | "ready" | "error";

export function useFHE() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [state, setState] = useState<State>(isFHEReady() ? "ready" : "idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicClient || !walletClient) return;
    if (state === "ready" || state === "initializing") return;

    setState("initializing");
    initFHE(publicClient, walletClient)
      .then(() => setState("ready"))
      .catch((e) => {
        setError(e?.message ?? String(e));
        setState("error");
      });
  }, [publicClient, walletClient, state]);

  return { state, error, ready: state === "ready" };
}
