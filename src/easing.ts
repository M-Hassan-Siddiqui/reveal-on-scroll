/**
 * CSS values for the AOS easings that aren't CSS keywords. `linear`, `ease`, `ease-in`,
 * `ease-out` and `ease-in-out` are passed through unchanged. Cubic and quart use their
 * real curves; AOS reused the quad curves for them.
 */
const EASINGS = new Map<string, string>([
  ['ease-in-back', 'cubic-bezier(0.6, -0.28, 0.735, 0.045)'],
  ['ease-out-back', 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'],
  ['ease-in-out-back', 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'],
  ['ease-in-sine', 'cubic-bezier(0.47, 0, 0.745, 0.715)'],
  ['ease-out-sine', 'cubic-bezier(0.39, 0.575, 0.565, 1)'],
  ['ease-in-out-sine', 'cubic-bezier(0.445, 0.05, 0.55, 0.95)'],
  ['ease-in-quad', 'cubic-bezier(0.55, 0.085, 0.68, 0.53)'],
  ['ease-out-quad', 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'],
  ['ease-in-out-quad', 'cubic-bezier(0.455, 0.03, 0.515, 0.955)'],
  ['ease-in-cubic', 'cubic-bezier(0.55, 0.055, 0.675, 0.19)'],
  ['ease-out-cubic', 'cubic-bezier(0.215, 0.61, 0.355, 1)'],
  ['ease-in-out-cubic', 'cubic-bezier(0.645, 0.045, 0.355, 1)'],
  ['ease-in-quart', 'cubic-bezier(0.895, 0.03, 0.685, 0.22)'],
  ['ease-out-quart', 'cubic-bezier(0.165, 0.84, 0.44, 1)'],
  ['ease-in-out-quart', 'cubic-bezier(0.77, 0, 0.175, 1)'],
]);

/** Turns an AOS easing name into a CSS value. Anything else (e.g. `cubic-bezier(...)`) is used as is. */
export function cssEasing(value: string): string {
  return EASINGS.get(value) ?? value;
}
