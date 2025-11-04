import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ⚙️ Optimized Vite config for low-memory Windows builds
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    target: "esnext",
    minify: false,             // ❌ turn off heavy minification
    cssMinify: false,          // ❌ skip CSS minifier
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
      // Disable parallel optimization for memory safety
      legalComments: "none",
    },
  },
});
