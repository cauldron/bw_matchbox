// @ts-check

import { dailyTicks } from './CommonConstants.js';

/**
 * @param {string} name
 * @param {string} [value]
 * @param {number} [days]
 */
export function setCookie(name, value, days) {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * dailyTicks);
    expires = 'expires=' + date.toUTCString();
  }
  const cookie = [
    // prettier-ignore
    name + '=' + (value || ''),
    expires,
    'path=/',
  ]
    .filter(Boolean)
    .join('; ');
  document.cookie = cookie;
  /* console.log('[CommonCookies:setCookie]', {
   *   cookie,
   *   name,
   *   value,
   *   days,
   *   cookies: document.cookie,
   * });
   */
}

/**
 * @param {string} name
 * @return {string | undefined}
 */
export function getCookie(name) {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    // TODO: Use `trim`?
    while (c.charAt(0) == ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) == 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return undefined;
}

/**
 * @param {string} name
 */
export function eraseCookie(name) {
  document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
