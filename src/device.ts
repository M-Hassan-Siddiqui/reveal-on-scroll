// User-agent checks behind the `disable: 'phone' | 'tablet' | 'mobile'` options. They are
// heuristics, like in AOS; a function (e.g. a media query check) is more reliable.
const PHONE = /iPhone|iPod|Android.*Mobile|Windows Phone|IEMobile|BlackBerry|BB10|Opera Mini|webOS/i;
const TABLET = /iPad|Tablet|Silk|Kindle|PlayBook|Android/i;

export function isPhone(nav: Navigator = navigator): boolean {
  return PHONE.test(nav.userAgent);
}

export function isTablet(nav: Navigator = navigator): boolean {
  if (isPhone(nav)) return false;
  // iPadOS 13+ sends a desktop Mac user agent.
  return TABLET.test(nav.userAgent) || (/Macintosh/.test(nav.userAgent) && nav.maxTouchPoints > 1);
}
