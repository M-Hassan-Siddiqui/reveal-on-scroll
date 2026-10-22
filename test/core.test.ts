import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ROS from '../src/index.js';

// happy-dom has no layout, so tests give each element a position and size.
function box(attributes: Record<string, string>, top: number, height = 200): HTMLElement {
  const el = document.createElement('div');
  for (const [name, value] of Object.entries(attributes)) el.setAttribute(name, value);
  Object.defineProperty(el, 'offsetTop', { configurable: true, get: () => top });
  Object.defineProperty(el, 'offsetHeight', { configurable: true, get: () => height });
  Object.defineProperty(el, 'offsetParent', { configurable: true, get: () => null });
  document.body.append(el);
  return el;
}

function setViewport(scrollY: number, height = 800): void {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: scrollY });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: height });
}

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

async function scrollTo(y: number): Promise<void> {
  setViewport(y);
  window.dispatchEvent(new Event('scroll'));
  await nextFrame();
}

/** Lets the MutationObserver deliver, then waits for the frame it schedules. */
async function settle(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await nextFrame();
}

const animated = (el: Element) => el.classList.contains('ros-animate');

beforeEach(() => {
  setViewport(0);
});

afterEach(() => {
  ROS.destroy();
  document.body.innerHTML = '';
});

describe('init', () => {
  it('sets up elements and animates the ones already in view', () => {
    const visible = box({ 'data-ros': 'fade-up' }, 100);
    const below = box({ 'data-ros': 'fade-up' }, 2000);

    ROS.init();

    expect(document.documentElement.hasAttribute('data-ros-ready')).toBe(true);
    expect(visible.classList.contains('ros-init')).toBe(true);
    expect(animated(visible)).toBe(true);
    expect(animated(below)).toBe(false);
    expect(visible.style.getPropertyValue('--ros-duration')).toBe('400ms');
    expect(visible.style.getPropertyValue('--ros-delay')).toBe('0ms');
    expect(visible.style.getPropertyValue('--ros-easing')).toBe('ease');
  });

  it('uses global options and per-element attributes', () => {
    const plain = box({ 'data-ros': 'fade' }, 0);
    const custom = box(
      { 'data-ros': 'fade', 'data-ros-duration': '1000', 'data-ros-delay': '250', 'data-ros-easing': 'ease-in-back' },
      0,
    );

    ROS.init({ duration: 600, easing: 'ease-out-cubic' });

    expect(plain.style.getPropertyValue('--ros-duration')).toBe('600ms');
    expect(plain.style.getPropertyValue('--ros-easing')).toBe('cubic-bezier(0.215, 0.61, 0.355, 1)');
    expect(custom.style.getPropertyValue('--ros-duration')).toBe('1000ms');
    expect(custom.style.getPropertyValue('--ros-delay')).toBe('250ms');
    expect(custom.style.getPropertyValue('--ros-easing')).toBe('cubic-bezier(0.6, -0.28, 0.735, 0.045)');
  });

  it('waits for a custom start event', () => {
    const el = box({ 'data-ros': 'fade' }, 0);

    ROS.init({ startEvent: 'app:ready' });
    expect(animated(el)).toBe(false);

    document.dispatchEvent(new Event('app:ready'));
    expect(animated(el)).toBe(true);
  });

  it('removes the attributes when disabled', () => {
    const el = box({ 'data-ros': 'fade', 'data-ros-duration': '600' }, 0);

    ROS.init({ disable: true });

    expect(el.hasAttribute('data-ros')).toBe(false);
    expect(el.hasAttribute('data-ros-duration')).toBe(false);
    expect(document.documentElement.hasAttribute('data-ros-ready')).toBe(false);
  });

  it('calls a disable function', () => {
    const el = box({ 'data-ros': 'fade' }, 0);
    const disable = vi.fn(() => true);

    ROS.init({ disable });

    expect(disable).toHaveBeenCalled();
    expect(el.hasAttribute('data-ros')).toBe(false);
  });
});

describe('scrolling', () => {
  it('animates in at the trigger point and out again above it', async () => {
    // Trigger: 2000 - 800 + 120 = 1320
    const el = box({ 'data-ros': 'fade-up' }, 2000);
    ROS.init();

    await scrollTo(1319);
    expect(animated(el)).toBe(false);
    await scrollTo(1320);
    expect(animated(el)).toBe(true);
    await scrollTo(1000);
    expect(animated(el)).toBe(false);
  });

  it('keeps once elements animated', async () => {
    const el = box({ 'data-ros': 'fade-up', 'data-ros-once': 'true' }, 2000);
    ROS.init();

    await scrollTo(1500);
    await scrollTo(0);
    expect(animated(el)).toBe(true);
  });

  it('treats an empty boolean attribute as true', async () => {
    const el = box({ 'data-ros': 'fade-up', 'data-ros-once': '' }, 2000);
    ROS.init();

    await scrollTo(1500);
    await scrollTo(0);
    expect(animated(el)).toBe(true);
  });

  it('animates mirrored elements out through the top', async () => {
    // In: 1320. Out: 2000 + 200 - 120 = 2080.
    const el = box({ 'data-ros': 'zoom-in', 'data-ros-mirror': 'true' }, 2000);
    ROS.init();

    await scrollTo(1500);
    expect(animated(el)).toBe(true);
    await scrollTo(2080);
    expect(animated(el)).toBe(false);
    await scrollTo(1500);
    expect(animated(el)).toBe(true);
  });

  it('drops the default offset for elements with their own anchor placement', async () => {
    // center-center: 1000 - 800 + 400 + 100, no offset.
    const el = box({ 'data-ros': 'fade', 'data-ros-anchor-placement': 'center-center' }, 1000);
    ROS.init();

    await scrollTo(699);
    expect(animated(el)).toBe(false);
    await scrollTo(700);
    expect(animated(el)).toBe(true);
  });

  it('uses the position of data-ros-anchor', async () => {
    box({ id: 'trigger' }, 3000);
    const el = box({ 'data-ros': 'fade', 'data-ros-anchor': '#trigger' }, 0);
    ROS.init();

    expect(animated(el)).toBe(false);
    await scrollTo(3000 - 800 + 120);
    expect(animated(el)).toBe(true);
  });

  it('ignores an invalid anchor selector', () => {
    const el = box({ 'data-ros': 'fade', 'data-ros-anchor': '##' }, 0);
    ROS.init();
    expect(animated(el)).toBe(true);
  });
});

describe('events', () => {
  it('fires ros:in and ros:out, also with the element id', async () => {
    const el = box({ 'data-ros': 'fade', 'data-ros-id': 'hero' }, 2000);
    const seen: Array<[string, unknown]> = [];
    const listeners = new AbortController();
    for (const type of ['ros:in', 'ros:out', 'ros:in:hero', 'ros:out:hero']) {
      document.addEventListener(type, (event) => seen.push([type, (event as CustomEvent).detail]), {
        signal: listeners.signal,
      });
    }

    ROS.init();
    await scrollTo(1500);
    await scrollTo(0);
    listeners.abort();

    expect(seen).toEqual([
      ['ros:in', el],
      ['ros:in:hero', el],
      ['ros:out', el],
      ['ros:out:hero', el],
    ]);
  });

  it('dispatches on the element itself', async () => {
    const el = box({ 'data-ros': 'fade' }, 2000);
    const listener = vi.fn();
    el.addEventListener('ros:in', listener);

    ROS.init();
    await scrollTo(1500);

    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('classes', () => {
  it('adds the data-ros value as classes with useClassNames', async () => {
    const el = box({ 'data-ros': 'animate__animated animate__bounce' }, 2000);
    ROS.init({ useClassNames: true });

    await scrollTo(1500);
    expect([...el.classList]).toEqual(['ros-init', 'ros-animate', 'animate__animated', 'animate__bounce']);
    await scrollTo(0);
    expect([...el.classList]).toEqual(['ros-init']);
  });

  it('supports custom class names', () => {
    const el = box({ 'data-ros': 'fade' }, 0);
    ROS.init({ initClassName: 'ready', animatedClassName: 'shown' });
    expect([...el.classList]).toEqual(['ready', 'shown']);
  });
});

describe('dynamic content', () => {
  it('picks up elements added later', async () => {
    ROS.init();
    const el = box({ 'data-ros': 'fade' }, 0);

    await settle();
    expect(animated(el)).toBe(true);
  });

  it('re-reads attributes when they change', async () => {
    const el = box({ 'data-ros': 'fade', 'data-ros-duration': '400' }, 0);
    ROS.init();

    el.setAttribute('data-ros-duration', '900');
    await settle();
    expect(el.style.getPropertyValue('--ros-duration')).toBe('900ms');
  });

  it('refreshHard finds new elements when the observer is off', () => {
    ROS.init({ disableMutationObserver: true });
    const el = box({ 'data-ros': 'fade' }, 0);

    expect(animated(el)).toBe(false);
    ROS.refreshHard();
    expect(animated(el)).toBe(true);
  });
});

describe('destroy', () => {
  it('removes everything the script added and stops listening', async () => {
    const el = box({ 'data-ros': 'fade' }, 2000);
    ROS.init();
    await scrollTo(1500);
    expect(animated(el)).toBe(true);

    ROS.destroy();

    expect(el.classList.length).toBe(0);
    expect(el.style.getPropertyValue('--ros-duration')).toBe('');
    expect(document.documentElement.hasAttribute('data-ros-ready')).toBe(false);
    await scrollTo(1500);
    expect(animated(el)).toBe(false);
  });

  it('resets options to the defaults', () => {
    ROS.init({ duration: 900 });
    ROS.destroy();
    const el = box({ 'data-ros': 'fade' }, 0);
    ROS.init();
    expect(el.style.getPropertyValue('--ros-duration')).toBe('400ms');
  });
});
