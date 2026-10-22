# Changelog

## 0.1.1 (unreleased)

No changes to the library. This release also checks the automated publishing setup.

- Live demo page on GitHub Pages, with a favicon.
- CI: job timeouts, cached Playwright browser downloads, and a retry when the browser install stalls.

## 0.1.0 (2026-10-22)

First release: a modern alternative to AOS with the same animations and options (from AOS 2.3.4 and 3.0.0-beta).

- `data-ros` attributes, `ros-init` / `ros-animate` classes, `ros:in` / `ros:out` events, and a `ROS` object with `init()`, `refresh()`, `refreshHard()` and `destroy()`.
- Positions are read every frame while scrolling, so triggers stay right when content above loads or changes.
- Respects `prefers-reduced-motion`: animations become a fade.
- Content stays visible without JavaScript or when the script fails to load.
- Any duration, delay or CSS easing function.
- Events dispatched on the element; `ros:out:<id>` fires on animate-out.
- Optional scroll-scrubbed mode with `data-ros-scrub`.
- TypeScript types, ESM and UMD builds, no dependencies.
