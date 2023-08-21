// @ts-check

import { useDebug } from '../../common/CommonConstants.js';

const useFakeData = useDebug && true; // DEBUG: Use fake data for tests
const useFakeCurrentUser = useDebug && true; // DEBUG: Use first of found users instead provided by page

export const defaultDebugParams = {
  // DEBUG
  useFakeData,
  useFakeCurrentUser,
};

/** Default filter values...
 * @type {TThreadCommentsViewParams}
 */
export const defaultViewParams = {
  /** @type {TThreadCommentsSortThreadsBy} */
  sortThreadsBy: 'modifiedDate',
  /** @type {boolean} */
  sortThreadsReversed: false,

  // Filters (Linked to parent component)...
  /** @type {TThreadCommentsFilterByState} */
  filterByState: 'none',
  /** @type {TUserName[]} */
  filterByUsers: /*DEBUG* / useFakeData && useDebug
      ? ['Anthony Jones'] // DEBUG: Test multiple selectors initalization
      : */ [],
  /** @type {TProcessId[]} */
  filterByProcesses: [],
  /** @type {boolean} */
  filterByMyThreads: false,
};
