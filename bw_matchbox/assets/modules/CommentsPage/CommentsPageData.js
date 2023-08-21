// @ts-check

import { CommentsPageConstants } from './CommentsPageConstants.js';

const { useDebug } = CommentsPageConstants;

const useFakeData = useDebug && true; // DEBUG: Use fake data for tests
const useFakeCurrentUser = useDebug && true; // DEBUG: Use first of found users instead provided by page

/** @exports CommentsPageData
 */
export const CommentsPageData = {
  __id: 'CommentsPageData',

  // DEBUG
  useFakeData,
  useFakeCurrentUser,

  // Owner page's provided data...
  sharedParams: undefined,

  // Data params...

  // View options (TODO: Should be only in `ThreadCommentsData`)...

  /** Default filter values (updated later)...
   * @type {TThreadCommentsViewParams}
   */
  defaultViewParams: undefined,

  /** @type {TThreadCommentsSortThreadsBy} */
  sortThreadsBy: undefined, // defaultViewParams.sortThreadsBy,
  /* @type {boolean} */
  sortThreadsReversed: undefined, // defaultViewParams.sortThreadsReversed,

  // Filters (Linked to parent component)...
  /** @type {TThreadCommentsFilterByState} */
  filterByState: undefined, // defaultViewParams.filterByState,
  /** @type {TUserName[]} */
  filterByUsers: undefined, // [...defaultViewParams.filterByUsers],
  /** @type {TProcessId[]} */
  filterByProcesses: undefined, // [...defaultViewParams.filterByProcesses],
  /** @type {boolean} */
  filterByMyThreads: undefined, // defaultViewParams.filterByMyThreads,

  // Common params (is it used?)...
  error: undefined,
  isError: false,
  isLoading: true,
  hasData: false,
};
