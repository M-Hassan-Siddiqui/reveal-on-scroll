// Prints the size of each built file, raw and compressed. Run `npm run build` first.
import { readFileSync } from 'node:fs';
import { brotliCompressSync, gzipSync } from 'node:zlib';

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;

for (const file of ['dist/reveal-on-scroll.js', 'dist/reveal-on-scroll.css', 'dist/index.js']) {
  const content = readFileSync(new URL(`../${file}`, import.meta.url));
  const gzip = gzipSync(content, { level: 9 }).length;
  const brotli = brotliCompressSync(content).length;
  console.log(`${file.padEnd(14)} ${kb(content.length).padStart(8)}  gzip ${kb(gzip).padStart(7)}  brotli ${kb(brotli).padStart(7)}`);
}
