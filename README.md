# reveal-on-scroll

Reveal elements as you scroll. A tiny, modern alternative to [AOS (Animate On Scroll)](https://github.com/michalsnik/aos) with the same animations and options.
It's typed, half the size, and respects reduced motion.

**[Live demo](https://m-hassan-siddiqui.github.io/reveal-on-scroll/)**

```html
<div data-ros="fade-up">I fade in when you scroll to me.</div>
```

> reveal-on-scroll is an independent project. It isn't affiliated with or endorsed by AOS or its author. Its animations and options follow AOS, so switching takes a quick find-and-replace. Thanks to AOS for the original idea.

## Why

AOS is still downloaded about 174,000 times a week, but it hasn't had a release since 2018. reveal-on-scroll offers the same animations and options, and fixes AOS's long-standing problems:

- **Positions stay right.** When images, fonts or new content load, triggers don't drift. There's no need to call `refresh()` like with AOS.
- **Respects "reduce motion".** For users who turned it on, elements fade instead of moving.
- **Content never gets lost.** With JavaScript off, or if the script fails to load, everything stays visible.
- **Any timing.** Durations and delays can be any number of milliseconds, not just 50 ms steps up to 3000, and easing can be any CSS easing function.
- **Fixed-position children keep working.** Animated elements end with `transform: none`.
- **TypeScript types included.** Ships ESM and UMD builds with zero dependencies.
- **Optional scroll-scrubbed mode,** powered by the browser's native scroll-driven animations.

| Gzipped size | JavaScript | CSS | Total |
|---|---:|---:|---:|
| AOS 2.3.4 | 4.6 kB | 2.1 kB | 6.7 kB |
| reveal-on-scroll | 2.7 kB | 0.9 kB | **3.6 kB** |

## Install

```sh
npm install reveal-on-scroll
```

```js
import ROS from 'reveal-on-scroll';
import 'reveal-on-scroll/style.css';

ROS.init();
```

Or straight from a CDN:

```html
<link rel="stylesheet" href="https://unpkg.com/reveal-on-scroll/dist/reveal-on-scroll.css" />
<script src="https://unpkg.com/reveal-on-scroll/dist/reveal-on-scroll.js"></script>
<script>
  ROS.init();
</script>
```

Load the stylesheet in the `<head>`, so elements are hidden before they first show up on screen.

## Switching from AOS

The animations and options are the same, so switching is a find-and-replace:

| AOS | reveal-on-scroll |
|---|---|
| `npm install aos` | `npm install reveal-on-scroll` |
| `import AOS from 'aos'` | `import ROS from 'reveal-on-scroll'` |
| `import 'aos/dist/aos.css'` | `import 'reveal-on-scroll/style.css'` |
| `AOS.init()`, `AOS.refresh()`, … | `ROS.init()`, `ROS.refresh()`, … |
| `data-aos`, `data-aos-*` attributes | `data-ros`, `data-ros-*` |
| `aos-init`, `aos-animate` classes | `ros-init`, `ros-animate` |
| `aos:in`, `aos:out` events | `ros:in`, `ros:out` |

Types are included, so you can also remove `@types/aos`.

### Other differences from AOS

It supports the options of both AOS 2.3.4 (the npm `latest`) and AOS 3.0 beta (`mirror`, `useClassNames`, events and so on). Besides the names above:

- `throttleDelay` and `debounceDelay` are accepted but not needed: updates run once per animation frame.
- An empty boolean attribute counts as true: `<div data-ros-once>` is the same as `data-ros-once="true"`.
- `ease-*-cubic` and `ease-*-quart` use their real curves. AOS reused the quad curves for them.
- Fade, zoom and slide animations end at `transform: none`. AOS 2.3.4 ended them at `translate3d(0, 0, 0)`, which breaks `position: fixed` children. Flips keep their perspective.
- `ros:out:<id>` fires when an element animates out. AOS 3 beta fired its "in" event there by mistake.
- Events are dispatched on the element and bubble up to `document`; `event.detail` is the element.
- With the default `startEvent`, it starts on `DOMContentLoaded` like AOS 2.3.4. AOS 3 beta waited for the whole page, including images, to load.
- New: `ROS.destroy()`, reduced-motion support, the no-JavaScript fallback and `data-ros-scrub`.

## Animations

| Fade | Zoom | Flip | Slide |
|---|---|---|---|
| `fade` | `zoom-in` | `flip-up` | `slide-up` |
| `fade-up` | `zoom-in-up` | `flip-down` | `slide-down` |
| `fade-down` | `zoom-in-down` | `flip-left` | `slide-left` |
| `fade-left` | `zoom-in-left` | `flip-right` | `slide-right` |
| `fade-right` | `zoom-in-right` | | |
| `fade-up-right` | `zoom-out` | | |
| `fade-up-left` | `zoom-out-up` | | |
| `fade-down-right` | `zoom-out-down` | | |
| `fade-down-left` | `zoom-out-left` | | |
| | `zoom-out-right` | | |

## Options

Set options for every element in `ROS.init({ ... })`, or for one element with a `data-ros-*` attribute.

| Option | Attribute | Default | What it does |
|---|---|---|---|
| `offset` | `data-ros-offset` | `120` | Extra distance in px to scroll past the trigger point. |
| `delay` | `data-ros-delay` | `0` | Delay in ms before animating in. |
| `duration` | `data-ros-duration` | `400` | Animation length in ms. |
| `easing` | `data-ros-easing` | `'ease'` | An easing name (below) or any CSS easing function. |
| `once` | `data-ros-once` | `false` | Animate only the first time. |
| `mirror` | `data-ros-mirror` | `false` | Animate out again when the element leaves through the top. |
| `anchorPlacement` | `data-ros-anchor-placement` | `'top-bottom'` | Which edges have to meet to trigger (below). |
| | `data-ros-anchor` | | Trigger on another element's position, e.g. `"#hero"`. |
| | `data-ros-id` | | Also fire `ros:in:<id>` and `ros:out:<id>`. |
| `disable` | | `false` | `true`, `'phone'`, `'tablet'`, `'mobile'` or a function returning `true` to turn animations off. |
| `startEvent` | | `'DOMContentLoaded'` | Event that starts the script. |
| `initClassName` | | `'ros-init'` | Class added to every element on setup. |
| `animatedClassName` | | `'ros-animate'` | Class added when animating in. |
| `useClassNames` | | `false` | Also add the `data-ros` value as classes (for animate.css and similar). |
| `disableMutationObserver` | | `false` | Stop watching the page for added or changed elements. |

When an element has its own `data-ros-anchor-placement`, its offset defaults to `0`.

**Easings:** `linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out`, `ease-in-back`, `ease-out-back`, `ease-in-out-back`, `ease-in-sine`, `ease-out-sine`, `ease-in-out-sine`, `ease-in-quad`, `ease-out-quad`, `ease-in-out-quad`, `ease-in-cubic`, `ease-out-cubic`, `ease-in-out-cubic`, `ease-in-quart`, `ease-out-quart`, `ease-in-out-quart`.

**Anchor placements** read as `[element edge]-[screen edge]`: `top-bottom` animates when the top of the element reaches the bottom of the screen. The values are `top-bottom`, `top-center`, `top-top`, `center-bottom`, `center-center`, `center-top`, `bottom-bottom`, `bottom-center` and `bottom-top`.

## Events

```js
document.addEventListener('ros:in', ({ detail }) => {
  console.log('animated in:', detail);
});

document.addEventListener('ros:out:hero', () => {
  // fires for the element with data-ros-id="hero"
});
```

In TypeScript, `event.detail` is typed for `ros:in` and `ros:out`.

## API

| Method | What it does |
|---|---|
| `ROS.init(options?)` | Sets up every `[data-ros]` element. Calling it again merges the new options. |
| `ROS.refresh()` | Re-reads each element's attributes. |
| `ROS.refreshHard()` | Finds `[data-ros]` elements again. Only needed with `disableMutationObserver: true`. |
| `ROS.destroy()` | Stops and removes everything the script added. |

All of them are also named exports: `import { init } from 'reveal-on-scroll'`. On the server (SSR) they do nothing.

## Scroll-scrubbed mode

```html
<div data-ros="fade-up" data-ros-scrub>Follows the scroll position</div>
```

With `data-ros-scrub`, the animation's progress is tied to the scroll position instead of playing once. It is driven by the browser's own [scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations), so no JavaScript runs while you scroll. Browsers without support, such as Firefox today, fall back to the normal animation.

Change when it starts and ends with the `--ros-scrub-range` custom property:

```css
.hero [data-ros-scrub] {
  --ros-scrub-range: entry 0% cover 60%;
}
```

## Custom animations

Write a start state, then the end state with `.ros-animate`:

```css
[data-ros='tilt'] {
  opacity: 0;
  transform: rotate(-8deg);
  transition-property: opacity, transform;
}

[data-ros='tilt'].ros-animate {
  opacity: 1;
  transform: none;
}
```

## Accessibility

- **Reduced motion.** When the user has asked for reduced motion, built-in animations become a simple fade.
- **No JavaScript, no problem.** Start states are only applied when scripting is on (`@media (scripting: enabled)`), so with JavaScript off, everything is visible.
- **Failsafe.** If the script never starts (blocked or failed to load), hidden elements appear after 3 seconds. Change the wait with `--ros-failsafe-delay` on `:root`.
- **Hidden elements can't be clicked** until they have animated in.

## Browser support

Current versions of Chrome, Edge, Firefox and Safari. Hiding elements before they animate uses `@media (scripting)`, which needs Chrome 120, Firefox 113 or Safari 17. Older browsers show the content without animating it.

## Development

```sh
npm install
npm run dev        # demo page with live reload
npm test           # unit tests
npm run test:e2e   # browser tests against the built files
npm run build      # dist/
npm run size       # file sizes
```

## License

MIT. Animation names and values follow [AOS](https://github.com/michalsnik/aos) by Michał Sajnóg, which is also MIT-licensed; its notice is included in [LICENSE](LICENSE).
