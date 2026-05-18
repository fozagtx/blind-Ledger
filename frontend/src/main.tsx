import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { WalletProvider } from "./components/WalletProvider";
import "@fontsource-variable/instrument-sans";
import "@fontsource/instrument-serif";
import "@fontsource/space-mono";
import "./index.css";
import "@rainbow-me/rainbowkit/styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WalletProvider>
      <App />
    </WalletProvider>
  </React.StrictMode>
);
