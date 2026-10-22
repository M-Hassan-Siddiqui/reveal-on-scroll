import { describe, expect, it } from 'vitest';
import { cssEasing } from '../src/easing.js';
import { inPosition, isPlacement, nextAnimated, outPosition } from '../src/geometry.js';
import type { AnchorPlacement } from '../src/types.js';

describe('inPosition', () => {
  // Element 1000px from the top, 200px tall; 800px viewport; 120px offset.
  // Expected values written out the way AOS computes them: top - viewport + adjustment + offset.
  const cases: Array<[AnchorPlacement, number]> = [
    ['top-bottom', 1000 - 800 + 120],
    ['center-bottom', 1000 - 800 + 100 + 120],
    ['bottom-bottom', 1000 - 800 + 200 + 120],
    ['top-center', 1000 - 800 + 400 + 120],
    ['center-center', 1000 - 800 + 400 + 100 + 120],
    ['bottom-center', 1000 - 800 + 400 + 200 + 120],
    ['top-top', 1000 - 800 + 800 + 120],
    ['center-top', 1000 - 800 + 800 + 100 + 120],
    ['bottom-top', 1000 - 800 + 800 + 200 + 120],
  ];

  it.each(cases)('%s', (placement, expected) => {
    expect(inPosition(1000, 200, 800, placement, 120)).toBe(expected);
  });
});

describe('outPosition', () => {
  it('is reached when the bottom edge passes the offset below the top of the screen', () => {
    expect(outPosition(1000, 200, 120)).toBe(1080);
  });
});

describe('nextAnimated', () => {
  const inAt = 500;
  const outAt = 1500;

  it('animates in from the trigger point and back out above it', () => {
    expect(nextAnimated(false, 499, inAt, Infinity, false, false)).toBe(false);
    expect(nextAnimated(false, 500, inAt, Infinity, false, false)).toBe(true);
    expect(nextAnimated(true, 499, inAt, Infinity, false, false)).toBe(false);
  });

  it('keeps once elements animated', () => {
    expect(nextAnimated(true, 0, inAt, Infinity, true, false)).toBe(true);
    expect(nextAnimated(false, 0, inAt, Infinity, true, false)).toBe(false);
  });

  it('animates mirrored elements out past the out point', () => {
    expect(nextAnimated(true, 1000, inAt, outAt, false, true)).toBe(true);
    expect(nextAnimated(true, 1500, inAt, outAt, false, true)).toBe(false);
  });

  it('ignores mirror when once is set', () => {
    expect(nextAnimated(true, 2000, inAt, outAt, true, true)).toBe(true);
  });
});

describe('isPlacement', () => {
  it('accepts the nine placements only', () => {
    expect(isPlacement('center-center')).toBe(true);
    expect(isPlacement('middle-bottom')).toBe(false);
    expect(isPlacement(null)).toBe(false);
  });
});

describe('cssEasing', () => {
  it('maps AOS names and passes CSS values through', () => {
    expect(cssEasing('ease-in-back')).toBe('cubic-bezier(0.6, -0.28, 0.735, 0.045)');
    expect(cssEasing('ease-out')).toBe('ease-out');
    expect(cssEasing('cubic-bezier(0.2, 0.8, 0.2, 1)')).toBe('cubic-bezier(0.2, 0.8, 0.2, 1)');
    expect(cssEasing('constructor')).toBe('constructor');
  });
});
