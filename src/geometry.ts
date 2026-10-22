import type { AnchorPlacement } from './types.js';

const PLACEMENTS: ReadonlySet<string> = new Set<AnchorPlacement>([
  'top-bottom',
  'top-center',
  'top-top',
  'center-bottom',
  'center-center',
  'center-top',
  'bottom-bottom',
  'bottom-center',
  'bottom-top',
]);

const EDGE = { top: 0, center: 0.5, bottom: 1 } as const;

export function isPlacement(value: unknown): value is AnchorPlacement {
  return typeof value === 'string' && PLACEMENTS.has(value);
}

/** Scroll position (`window.scrollY`) from which an element is animated in. Same formula as AOS. */
export function inPosition(
  top: number,
  height: number,
  viewport: number,
  placement: AnchorPlacement,
  offset: number,
): number {
  const [element, screen] = placement.split('-') as [keyof typeof EDGE, keyof typeof EDGE];
  return top + height * EDGE[element] - viewport * EDGE[screen] + offset;
}

/** Scroll position from which a mirrored element has left through the top and animates out. */
export function outPosition(top: number, height: number, offset: number): number {
  return top + height - offset;
}

/** Whether an element should be animated after a scroll update. Same rules as AOS. */
export function nextAnimated(
  animated: boolean,
  scrollY: number,
  inAt: number,
  outAt: number,
  once: boolean,
  mirror: boolean,
): boolean {
  if (mirror && !once && scrollY >= outAt) return false;
  if (scrollY >= inAt) return true;
  return once ? animated : false;
}

/**
 * Distance from the top of the document, from layout offsets like AOS. Unlike
 * `getBoundingClientRect()` this ignores transforms, so an element's own start transform
 * (e.g. `fade-down` moving it up 100px) never changes when it triggers.
 */
export function documentTop(el: Element): number {
  if (!(el instanceof HTMLElement)) return el.getBoundingClientRect().top + window.scrollY;
  let top = el.offsetTop;
  let parent = el.offsetParent;
  while (parent instanceof HTMLElement) {
    top += parent.offsetTop;
    // Content inside a scrolled box has moved up by the box's scroll position.
    if (parent !== document.body) top -= parent.scrollTop;
    parent = parent.offsetParent;
  }
  return top;
}

export function elementHeight(el: Element): number {
  return el instanceof HTMLElement ? el.offsetHeight : el.getBoundingClientRect().height;
}
