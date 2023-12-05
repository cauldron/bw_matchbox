// @ts-check

import { fractionDigits } from './ScoresListConstants.js';

/** @param {number} number */
export function formatNumberToString(number) {
  return fractionDigits ? number.toExponential(fractionDigits) : String(number);
}

/**
 * @param {TScoresDataItem} a
 * @param {TScoresDataItem} b
 * @return {-1 | 0 | 1}
 */
export function sortScoresDataIterator(a, b) {
  const aStr = a.category;
  const bStr = b.category;
  const aStrU = aStr.toLowerCase();
  const bStrU = bStr.toLowerCase();
  // First try to compare case-insensitive...
  return aStrU > bStrU
    ? 1
    : aStrU < bStrU
    ? -1
    : // If unified strings are equal, then try to compare case-sensitive...
    aStr > bStr
    ? 1
    : aStr < bStr
    ? -1
    : 0;
}
