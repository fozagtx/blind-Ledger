import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait()],
  define: {
    global: "globalThis",
  },
  optimizeDeps: {
    // cofhejs ships tfhe wasm — let Vite handle it through the wasm plugin
    // rather than pre-bundling.
    exclude: ["cofhejs", "tfhe"],
    esbuildOptions: {
      target: "es2020",
    },
  },
  build: {
    target: "es2020",
  },
});
