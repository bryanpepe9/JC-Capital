import { defineConfig } from 'vite'

// JC Capital — Vite configuration
// Single-page immersive site. Static assets live in /public and are referenced
// from the root (e.g. /images/founder.jpg). Build output goes to /dist.
export default defineConfig({
  root: '.',
  build: {
    target: 'es2019',
    outDir: 'dist',
    assetsInlineLimit: 4096,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 900,
  },
  server: {
    host: true,
    open: false,
  },
})
