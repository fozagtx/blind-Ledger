import { ReactNode } from "react";
import { RainbowKitProvider, getDefaultConfig, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { arbitrumSepolia } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config as appConfig } from "../lib/config";

const wagmiConfig = getDefaultConfig({
  appName: "Blind Ledger",
  projectId: appConfig.walletConnectProjectId || "00000000000000000000000000000000",
  chains: [arbitrumSepolia],
  ssr: false,
});

const queryClient = new QueryClient();

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#6a86ff",
            accentColorForeground: "white",
            borderRadius: "medium",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
