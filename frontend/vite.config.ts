import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait()],
  define: {
    global: "globalThis",
  },
  worker: {
    // tfhe@1.5.x uses wasm-bindgen-rayon for parallelism — its bundled worker
    // script is in IIFE format which clashes with Rollup code-splitting.
    // Forcing ES module workers makes Rollup happy.
    format: "es",
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
    rollupOptions: {
      output: {
        // Keep rollup from inlining the tfhe worker into a single chunk.
        manualChunks(id) {
          if (id.includes("node_modules/.pnpm/tfhe@")) return "tfhe";
          if (id.includes("node_modules/.pnpm/cofhejs@")) return "cofhejs";
        },
      },
    },
  },
});
