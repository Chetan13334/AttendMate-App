/// <reference types="vitest" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy(),
    // tailwindcss(), // ✅ Removed Tailwind Vite plugin
  ],
  css: {
    // postcss: './postcss.config.js', // keep your PostCSS config - removed as postcss.config.js is deleted
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
})