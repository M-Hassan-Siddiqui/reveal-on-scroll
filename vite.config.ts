import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/bundle.ts',
      // Global for <script> tags: `ROS.init()`.
      name: 'ROS',
      formats: ['es', 'umd'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'reveal-on-scroll.js'),
      cssFileName: 'reveal-on-scroll',
    },
    rolldownOptions: {
      output: { exports: 'named' },
    },
    sourcemap: true,
  },
  plugins: [
    {
      // TypeScript 7 rejects `import 'reveal-on-scroll/style.css'` without a declaration file, so ship one.
      name: 'css-declaration',
      generateBundle() {
        this.emitFile({ type: 'asset', fileName: 'style.css.d.ts', source: 'export {};\n' });
      },
    },
  ],
  test: {
    environment: 'happy-dom',
    include: ['test/**/*.test.ts'],
  },
});
