import { expect, test, type Page } from '@playwright/test';

const FIXTURE = '/e2e/fixture.html';

/** Scrolls the window so the element's top edge sits `fromTop` px below the top of the screen. */
async function placeAt(page: Page, selector: string, fromTop: number): Promise<void> {
  await page.evaluate(
    ([sel, offset]) => {
      const el = document.querySelector<HTMLElement>(sel as string)!;
      window.scrollTo(0, el.offsetTop - (offset as number));
    },
    [selector, fromTop],
  );
}

test.describe('with the script running', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FIXTURE);
  });

  test('animates elements already in view and hides the rest', async ({ page }) => {
    await expect(page.locator('#top')).toHaveClass(/ros-animate/);
    await expect(page.locator('#top')).toHaveCSS('opacity', '1');
    await expect(page.locator('#below')).not.toHaveClass(/ros-animate/);
    await expect(page.locator('#below')).toHaveCSS('opacity', '0');
  });

  test('animates in on scroll and out again when scrolling back up', async ({ page }) => {
    const below = page.locator('#below');
    await placeAt(page, '#below', 200);
    await expect(below).toHaveClass(/ros-animate/);
    await expect(below).toHaveCSS('opacity', '1');
    await expect(below).toHaveCSS('transform', 'none');

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(below).not.toHaveClass(/ros-animate/);
  });

  test('keeps once elements visible after scrolling back up', async ({ page }) => {
    const once = page.locator('#once');
    await placeAt(page, '#once', 200);
    await expect(once).toHaveClass(/ros-animate/);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(100);
    await expect(once).toHaveClass(/ros-animate/);
  });

  test('animates mirrored elements out through the top', async ({ page }) => {
    const mirror = page.locator('#mirror');
    await placeAt(page, '#mirror', 300);
    await expect(mirror).toHaveClass(/ros-animate/);

    // Bottom edge 100px above the screen: past the out point (bottom - 120px offset).
    await placeAt(page, '#mirror', -300);
    await expect(mirror).not.toHaveClass(/ros-animate/);

    await placeAt(page, '#mirror', 300);
    await expect(mirror).toHaveClass(/ros-animate/);
  });

  test('fires ros:in and ros:out events on document', async ({ page }) => {
    await placeAt(page, '#below', 200);
    await expect(page.locator('#below')).toHaveClass(/ros-animate/);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.locator('#below')).not.toHaveClass(/ros-animate/);

    const events = await page.evaluate(() => (window as unknown as { rosEvents: string[][] }).rosEvents);
    expect(events).toContainEqual(['in', 'top']);
    expect(events).toContainEqual(['in', 'below']);
    expect(events).toContainEqual(['out', 'below']);
  });

  test('updates when content is added above, without scrolling', async ({ page }) => {
    const below = page.locator('#below');
    await placeAt(page, '#below', 200);
    await expect(below).toHaveClass(/ros-animate/);

    // New content pushes the element far below the screen: it should animate out.
    // (Scroll anchoring is off so the browser doesn't scroll to compensate.)
    await page.evaluate(() => {
      document.documentElement.style.overflowAnchor = 'none';
      document.body.style.overflowAnchor = 'none';
      const block = document.createElement('div');
      block.id = 'inserted';
      block.style.height = '3000px';
      document.querySelector('#below')!.before(block);
    });
    await expect(below).not.toHaveClass(/ros-animate/);

    await page.evaluate(() => document.querySelector('#inserted')!.remove());
    await expect(below).toHaveClass(/ros-animate/);
  });

  test('updates when content above changes size, without scrolling', async ({ page }) => {
    const below = page.locator('#below');
    await placeAt(page, '#below', 200);
    await expect(below).toHaveClass(/ros-animate/);

    // Only a style change (no DOM mutation the script watches): the page height changes.
    await page.evaluate(() => {
      document.documentElement.style.overflowAnchor = 'none';
      document.body.style.overflowAnchor = 'none';
      document.querySelector<HTMLElement>('.spacer')!.style.height = '4500px';
    });
    await expect(below).not.toHaveClass(/ros-animate/);
  });

  test('reduced motion: elements fade without moving', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('#below')).toHaveCSS('opacity', '0');
    await expect(page.locator('#below')).toHaveCSS('transform', 'none');
  });

  test('scrub mode follows the scroll position', async ({ page }) => {
    const supported = await page.evaluate(() => CSS.supports('animation-timeline: view()'));
    test.skip(!supported, 'This browser has no CSS scroll-driven animations; scrub falls back to the normal mode.');

    const viewport = page.viewportSize()!.height;
    // Range is entry 10% → cover 45%: from 20px to (viewport + 200) * 0.45 px past the bottom edge.
    const start = 20;
    const end = (viewport + 200) * 0.45;
    await placeAt(page, '#scrub', viewport - (start + end) / 2);
    await page.evaluate(() => new Promise(requestAnimationFrame));

    const opacity = Number(await page.locator('#scrub').evaluate((el) => getComputedStyle(el).opacity));
    expect(opacity).toBeGreaterThan(0.3);
    expect(opacity).toBeLessThan(0.7);
  });
});

test('content stays visible if the script fails to load', async ({ page }) => {
  await page.route('**/dist/reveal-on-scroll.js', (route) => route.abort());
  await page.goto(FIXTURE);
  await expect(page.locator('#below')).toHaveCSS('opacity', '1', { timeout: 6000 });
});

test('content is visible with JavaScript turned off', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(FIXTURE);
  await expect(page.locator('#below')).toHaveCSS('opacity', '1', { timeout: 1000 });
  await context.close();
});
