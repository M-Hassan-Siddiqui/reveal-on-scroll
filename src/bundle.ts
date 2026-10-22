// Build entry: the same API as index.ts, plus the stylesheet so Vite emits dist/reveal-on-scroll.css.
import './style.css';

export * from './index.js';
export { default } from './index.js';
