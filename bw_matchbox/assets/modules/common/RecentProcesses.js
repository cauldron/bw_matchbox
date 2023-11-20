// @ts-check

import { dailyTicks } from './CommonConstants.js';
import { getCookie, setCookie } from './CommonCookies.js';

/* TODO:
 * - 2023.11.20, 17:10 -- To store process names in local storage instead of cookies?
 */

/** The count of actual process records to store (0 - use all the records) */
const actualCount = 20;

/** Days to keep actual records (0 don't actualize by time) */
const actualDays = 10;

/** Cookie name to store process list */
const cookieName = 'recent-processes';

/** Helper function to sort processes by timestamp (the latest entries are first)
 * @param {TRecentProcess} a
 * @param {TRecentProcess} b
 * @return number
 */
function sortProcessItemsByTimestampIterator(a, b) {
  return b.timestamp - a.timestamp;
}

/** Sort processes list by timestamp.
 * @param {TRecentProcesses} processesList
 * @return {TRecentProcesses}
 */
function sortRecentProcesses(processesList) {
  // const cloned = [...processesList];
  processesList.sort(sortProcessItemsByTimestampIterator);
  return processesList;
}

/** Actualize processes list (remain {actualCount} last records for {actualDays} last days)
 * @param {TRecentProcesses} sortedList - Processes list should be sorted by date first
 * @return {TRecentProcesses}
 */
function actualizeRecentProcecess(sortedList) {
  // Filter out outdated records...
  const actualizedList = [];
  const earliestValidTimestamp = actualDays && Date.now() - dailyTicks * actualDays;
  for (
    let i = 0;
    i < sortedList.length &&
    // Actualize by time if specified...
    (!actualCount || actualizedList.length < actualCount);
    i++
  ) {
    const item = sortedList[i];
    // If dated later than earliest valid timestamp...
    if (!actualDays || !item.timestamp || item.timestamp > earliestValidTimestamp) {
      actualizedList.push(item);
    }
  }
  return actualizedList;
}

/** Get all stored processes.
 * @return {TRecentProcesses}
 */
export function getRecentProcesses() {
  const json = getCookie(cookieName);
  const processesList = /** @type {TRecentProcesses} */ (json ? JSON.parse(json) : []);
  return processesList;
}

/** Sort and actualize processes list
 * @param {TRecentProcesses} processesList
 * @return {TRecentProcesses}
 */
function sortAndActualizeRecentProcesses(processesList) {
  const clonedList = [...processesList];
  // Sort and actualize records (remove outdated ones)?
  sortRecentProcesses(clonedList);
  const actualizedList = actualizeRecentProcecess(clonedList);
  return actualizedList;
}
/** Get actual and sorted processes
 * @return {TRecentProcesses}
 */
export function getActualSortedRecentProcesses() {
  const processesList = getRecentProcesses();
  const actualizedList = sortAndActualizeRecentProcesses(processesList);
  return actualizedList;
}

/** Add or update process
 * @param {number} id
 * @param {string} name
 * @return {TRecentProcesses}
 */
export function storeProcess(id, name) {
  /** @type TRecentProcess */
  const record = {
    id,
    name,
    timestamp: Date.now(),
  };
  const processesList = getRecentProcesses();
  /* console.log('[RecentProcesses:storeProcess] start', {
   *   record,
   *   id,
   *   name,
   *   processesList,
   * });
   */
  // Has the record found and updated?
  let alreadyUpdated = false;
  // Update record in the list (if exists)...
  const updatedProcesses = processesList.map((item) => {
    if (item.id === id) {
      // Record has already existed...
      alreadyUpdated = true;
      /* console.log('[RecentProcesses:storeProcess] replace record', {
       *   item,
       *   record,
       *   id,
       *   name,
       *   processesList,
       * });
       */
      return record;
    }
    return item;
  });
  // Otherwise add the item into the list...
  if (!alreadyUpdated) {
    /* console.log('[RecentProcesses:storeProcess] add new record', {
     *   record,
     *   id,
     *   name,
     *   processesList,
     * });
     */
    updatedProcesses.unshift(record);
  }
  // Actualize the list...
  const actualizedList = sortAndActualizeRecentProcesses(updatedProcesses);
  // Save cookie...
  const json = JSON.stringify(actualizedList);
  setCookie(cookieName, json);
  // Return the updated list...
  return actualizedList;
}
