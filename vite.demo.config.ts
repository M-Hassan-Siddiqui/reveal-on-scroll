import { defineConfig } from 'vite';

// Builds demo/ as a static site for GitHub Pages. A relative base lets it work under /reveal-on-scroll/.
export default defineConfig({
  root: 'demo',
  base: './',
  build: {
    outDir: '../demo-dist',
    emptyOutDir: true,
  },
});
