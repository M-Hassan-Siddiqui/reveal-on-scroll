/**
 * Which part of the element has to reach which part of the screen before it animates:
 * `[element edge]-[screen edge]`. For example `top-bottom` means "when the top of the
 * element reaches the bottom of the screen".
 */
export type AnchorPlacement =
  | 'top-bottom'
  | 'top-center'
  | 'top-top'
  | 'center-bottom'
  | 'center-center'
  | 'center-top'
  | 'bottom-bottom'
  | 'bottom-center'
  | 'bottom-top';

/** The named easings from AOS. */
export type EasingName =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'ease-in-back'
  | 'ease-out-back'
  | 'ease-in-out-back'
  | 'ease-in-sine'
  | 'ease-out-sine'
  | 'ease-in-out-sine'
  | 'ease-in-quad'
  | 'ease-out-quad'
  | 'ease-in-out-quad'
  | 'ease-in-cubic'
  | 'ease-out-cubic'
  | 'ease-in-out-cubic'
  | 'ease-in-quart'
  | 'ease-out-quart'
  | 'ease-in-out-quart';

export interface RosOptions {
  /**
   * Turn animations off and show everything. `'phone'`, `'tablet'` and `'mobile'` use a
   * user-agent check; a function is called when `init()` runs.
   * @default false
   */
  disable?: boolean | 'phone' | 'tablet' | 'mobile' | (() => boolean);
  /**
   * Event that starts the script. `'DOMContentLoaded'` and `'load'` also work when they
   * have already happened; any other name is listened for on `document`.
   * @default 'DOMContentLoaded'
   */
  startEvent?: string;
  /** Class added to every element when it is set up. @default 'ros-init' */
  initClassName?: string;
  /** Class added when an element animates in. The stylesheet targets `ros-animate`. @default 'ros-animate' */
  animatedClassName?: string;
  /** Also add the `data-ros` value as classes when animating in (for libraries like animate.css). @default false */
  useClassNames?: boolean;
  /** Stop watching the page for added, removed or changed `[data-ros]` elements. @default false */
  disableMutationObserver?: boolean;
  /** Accepted for AOS compatibility. Not used: updates are synced to animation frames. */
  debounceDelay?: number;
  /** Accepted for AOS compatibility. Not used: updates are synced to animation frames. */
  throttleDelay?: number;
  /** Extra distance in px the page has to scroll past the trigger point. @default 120 */
  offset?: number;
  /** Delay in ms before animating in. @default 0 */
  delay?: number;
  /** Animation length in ms. @default 400 */
  duration?: number;
  /** A named AOS easing or any CSS easing function, e.g. `cubic-bezier(.2, .8, .2, 1)`. @default 'ease' */
  easing?: EasingName | (string & {});
  /** Animate only the first time the element is reached. @default false */
  once?: boolean;
  /** Animate out again when the element leaves through the top of the screen. @default false */
  mirror?: boolean;
  /** Which edges have to meet before the element animates. @default 'top-bottom' */
  anchorPlacement?: AnchorPlacement;
}

/** Events fired on each element. They bubble, so you can listen on `document`; `detail` is the element. */
export interface RosEventMap {
  'ros:in': CustomEvent<Element>;
  'ros:out': CustomEvent<Element>;
}

declare global {
  interface DocumentEventMap extends RosEventMap {}
  interface HTMLElementEventMap extends RosEventMap {}
}
