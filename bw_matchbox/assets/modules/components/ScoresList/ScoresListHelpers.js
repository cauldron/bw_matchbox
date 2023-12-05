// @ts-check

import { fractionDigits, sortFieldsAsString } from './ScoresListConstants.js';

/** @param {number} number */
export function formatNumberToString(number) {
  /** @type {string} */
  let result = String(number);
  if (fractionDigits) {
    const absNumber = Math.abs(number);
    if (absNumber >= 0.1 && absNumber <= 10) {
      result = number.toFixed(fractionDigits).replace(/0+$/, '');
    } else {
      result = number.toExponential(fractionDigits);
    }
  }
  return result;
}

/**
 * @param {string} aStr
 * @param {string} bStr
 * @return TSortResult
 */
export function sortStringsIterator(aStr, bStr) {
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

/**
 * @param {TSortData} sortData
 * @param {TScoresDataItem} a
 * @param {TScoresDataItem} b
 * @return TSortResult
 */
export function sortDataItemIterator(sortData, a, b) {
  const { sortMode, sortReversed } = sortData;
  const asString = sortFieldsAsString.includes(sortMode);
  let result = 0;
  const aVal = a[sortMode];
  const bVal = b[sortMode];
  /* console.log('[ScoresListHelpers:sortDataItemIterator]', {
   *   sortMode,
   *   sortReversed,
   *   asString,
   *   result,
   *   aVal,
   *   bVal,
   *   a,
   *   b,
   * });
   */
  if (asString) {
    // Strings...
    result = sortStringsIterator(String(aVal), String(bVal));
  } else {
    // Numbers...
    result = Number(bVal) - Number(aVal);
  }
  if (sortReversed) {
    result = /** @type {TSortResult} */ (-result);
  }
  return result;
}
