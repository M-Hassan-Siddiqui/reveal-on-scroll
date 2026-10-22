import { isPhone, isTablet } from './device.js';
import { cssEasing } from './easing.js';
import {
  documentTop,
  elementHeight,
  inPosition,
  isPlacement,
  nextAnimated,
  outPosition,
} from './geometry.js';
import type { AnchorPlacement, RosOptions } from './types.js';

type Settings = Required<RosOptions>;

const DEFAULTS: Settings = {
  disable: false,
  startEvent: 'DOMContentLoaded',
  initClassName: 'ros-init',
  animatedClassName: 'ros-animate',
  useClassNames: false,
  disableMutationObserver: false,
  debounceDelay: 50,
  throttleDelay: 99,
  offset: 120,
  delay: 0,
  duration: 400,
  easing: 'ease',
  once: false,
  mirror: false,
  anchorPlacement: 'top-bottom',
};

const SELECTOR = '[data-ros]';
/** Set on `<html>` while the script runs. The stylesheet's no-JavaScript fallback keys off it. */
const READY = 'data-ros-ready';
/** Changing any of these re-reads all elements. */
const WATCHED = [
  'data-ros',
  'data-ros-offset',
  'data-ros-delay',
  'data-ros-duration',
  'data-ros-easing',
  'data-ros-once',
  'data-ros-mirror',
  'data-ros-anchor',
  'data-ros-anchor-placement',
  'data-ros-id',
];

interface Item {
  el: Element;
  /** Element whose position triggers the animation: `data-ros-anchor`, or the element itself. */
  anchor: Element;
  placement: AnchorPlacement;
  inOffset: number;
  outOffset: number;
  once: boolean;
  mirror: boolean;
  id: string | null;
  classes: string[];
  animated: boolean;
}

let settings: Settings = { ...DEFAULTS };
let items: Item[] = [];
let running = false;
let frame = 0;
let needsHardRefresh = false;
let cancelStart: (() => void) | undefined;
let stopListening: (() => void) | undefined;

const hasDom = (): boolean => typeof window !== 'undefined' && typeof document !== 'undefined';

/** Set up every `[data-ros]` element. Options are merged with those from earlier calls, like AOS. */
export function init(options: RosOptions = {}): void {
  if (!hasDom()) return;
  stop();
  settings = { ...settings, ...options };
  if (isDisabled()) {
    // Wait for the DOM so elements below the script are found too.
    cancelStart = whenReady('DOMContentLoaded', disable);
    return;
  }
  cancelStart = whenReady(settings.startEvent, () => (running ? refresh() : start()));
}

/** Re-read each element's options and update. Pass `true` to start right away if `init()` is still waiting. */
export function refresh(initialize = false): void {
  if (!hasDom()) return;
  if (!running) {
    if (initialize) {
      cancelStart?.();
      cancelStart = undefined;
      start();
    }
    return;
  }
  items = items.map((item) => prepare(item.el)).filter(isItem);
  update();
}

/** Find `[data-ros]` elements again, then update. Only needed with `disableMutationObserver`. */
export function refreshHard(): void {
  if (!hasDom() || !running) return;
  if (isDisabled()) {
    stop();
    disable();
    return;
  }
  needsHardRefresh = false;
  items = [...document.querySelectorAll(SELECTOR)].map(prepare).filter(isItem);
  update();
}

/** Stop and remove everything the script added. Elements go back to their hidden start state. */
export function destroy(): void {
  if (!hasDom()) return;
  stop();
  for (const el of document.querySelectorAll(SELECTOR)) {
    el.classList.remove(...[settings.initClassName, settings.animatedClassName, ...customClasses(el)].filter(Boolean));
    const style = styleOf(el);
    style?.removeProperty('--ros-duration');
    style?.removeProperty('--ros-delay');
    style?.removeProperty('--ros-easing');
  }
  document.documentElement.removeAttribute(READY);
  items = [];
  settings = { ...DEFAULTS };
}

function start(): void {
  running = true;
  document.documentElement.setAttribute(READY, '');
  refreshHard();
  if (running) stopListening = listen();
}

function stop(): void {
  running = false;
  cancelStart?.();
  cancelStart = undefined;
  stopListening?.();
  stopListening = undefined;
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  needsHardRefresh = false;
}

function whenReady(event: string, callback: () => void): () => void {
  const ready =
    event === 'load'
      ? document.readyState === 'complete'
      : event === 'DOMContentLoaded' && document.readyState !== 'loading';
  if (ready) {
    callback();
    return () => {};
  }
  const target: EventTarget = event === 'load' ? window : document;
  target.addEventListener(event, callback);
  return () => target.removeEventListener(event, callback);
}

function listen(): () => void {
  const passive = { passive: true } as const;
  window.addEventListener('scroll', schedule, passive);
  window.addEventListener('resize', schedule, passive);
  // Images, iframes and videos loading can move content. `load` doesn't bubble, so capture it.
  document.addEventListener('load', schedule, { capture: true, passive: true });
  document.fonts?.addEventListener?.('loadingdone', schedule);

  const resizes = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : undefined;
  resizes?.observe(document.documentElement);
  if (document.body) resizes?.observe(document.body);

  const mutations =
    !settings.disableMutationObserver && typeof MutationObserver === 'function'
      ? new MutationObserver(onMutations)
      : undefined;
  mutations?.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: WATCHED,
  });

  return () => {
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    document.removeEventListener('load', schedule, { capture: true });
    document.fonts?.removeEventListener?.('loadingdone', schedule);
    resizes?.disconnect();
    mutations?.disconnect();
  };
}

function onMutations(records: MutationRecord[]): void {
  if (!needsHardRefresh && records.some(touchesItems)) needsHardRefresh = true;
  // Any DOM change can move elements, so update positions either way.
  schedule();
}

function touchesItems(record: MutationRecord): boolean {
  if (record.type === 'attributes') return true;
  for (const node of [...record.addedNodes, ...record.removedNodes]) {
    if (node instanceof Element && (node.matches(SELECTOR) || node.querySelector(SELECTOR))) return true;
  }
  return false;
}

function schedule(): void {
  if (!running || frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    if (needsHardRefresh) refreshHard();
    else update();
  });
}

function update(): void {
  const scrollY = window.scrollY;
  const viewport = window.innerHeight;
  // Read every position before changing any class, so the page is laid out at most once.
  const next = items.map((item) => {
    const top = documentTop(item.anchor);
    const height = elementHeight(item.anchor);
    const inAt = inPosition(top, height, viewport, item.placement, item.inOffset);
    const outAt = item.mirror ? outPosition(top, height, item.outOffset) : Infinity;
    return nextAnimated(item.animated, scrollY, inAt, outAt, item.once, item.mirror);
  });
  items.forEach((item, i) => {
    if (next[i] !== item.animated) toggle(item, !item.animated);
  });
  // Elements that animate only once need no more work.
  items = items.filter((item) => !(item.once && item.animated));
}

function toggle(item: Item, animated: boolean): void {
  item.animated = animated;
  if (animated) item.el.classList.add(...item.classes);
  else item.el.classList.remove(...item.classes);
  const type = animated ? 'ros:in' : 'ros:out';
  emit(item.el, type);
  if (item.id) emit(item.el, `${type}:${item.id}`);
}

function emit(el: Element, type: string): void {
  el.dispatchEvent(new CustomEvent(type, { bubbles: true, detail: el }));
}

function prepare(el: Element): Item | null {
  const s = settings;
  if (s.initClassName) el.classList.add(s.initClassName);
  const style = styleOf(el);
  style?.setProperty('--ros-duration', `${readNumber(el, 'duration') ?? s.duration}ms`);
  style?.setProperty('--ros-delay', `${readNumber(el, 'delay') ?? s.delay}ms`);
  style?.setProperty('--ros-easing', cssEasing(read(el, 'easing') || s.easing));

  const once = readBoolean(el, 'once', s.once);
  const animated = s.animatedClassName !== '' && el.classList.contains(s.animatedClassName);
  if (once && animated) return null;

  const placement = read(el, 'anchor-placement');
  const offset = readNumber(el, 'offset');
  return {
    el,
    anchor: anchorOf(el),
    placement: isPlacement(placement) ? placement : s.anchorPlacement,
    // Like AOS: an element with its own anchor placement doesn't get the global offset.
    inOffset: offset ?? (placement ? 0 : s.offset),
    outOffset: offset ?? s.offset,
    once,
    mirror: readBoolean(el, 'mirror', s.mirror),
    id: read(el, 'id'),
    classes: [s.animatedClassName, ...customClasses(el)].filter(Boolean),
    animated,
  };
}

/** Like AOS: strip the attributes so the stylesheet no longer hides anything. */
function disable(): void {
  for (const el of document.querySelectorAll(SELECTOR)) {
    for (const name of ['data-ros', 'data-ros-easing', 'data-ros-duration', 'data-ros-delay']) {
      el.removeAttribute(name);
    }
    el.classList.remove(...[settings.initClassName, settings.animatedClassName].filter(Boolean));
  }
}

function isDisabled(): boolean {
  const { disable } = settings;
  if (typeof disable === 'function') return disable() === true;
  if (disable === 'phone') return isPhone();
  if (disable === 'tablet') return isTablet();
  if (disable === 'mobile') return isPhone() || isTablet();
  return disable === true;
}

function anchorOf(el: Element): Element {
  const selector = read(el, 'anchor');
  if (!selector) return el;
  try {
    return document.querySelector(selector) ?? el;
  } catch {
    // Invalid selector: fall back to the element itself.
    return el;
  }
}

function customClasses(el: Element): string[] {
  return settings.useClassNames ? (el.getAttribute('data-ros') ?? '').split(/\s+/).filter(Boolean) : [];
}

function read(el: Element, key: string): string | null {
  return el.getAttribute(`data-ros-${key}`);
}

function readNumber(el: Element, key: string): number | undefined {
  const value = read(el, key);
  if (value === null || value.trim() === '') return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

/** `data-ros-once`, `data-ros-once=""` and `data-ros-once="true"` are true; `"false"` is false. */
function readBoolean(el: Element, key: string, fallback: boolean): boolean {
  const value = read(el, key);
  if (value === '' || value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
}

function styleOf(el: Element): CSSStyleDeclaration | undefined {
  return (el as Partial<ElementCSSInlineStyle>).style;
}

function isItem(item: Item | null): item is Item {
  return item !== null;
}
