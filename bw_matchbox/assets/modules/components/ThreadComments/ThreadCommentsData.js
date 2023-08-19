// @ts-check

import { defaultViewParams, defaultDebugParams } from './ThreadCommentsDefaults.js';

export const ThreadCommentsData = {
  // DEBUG: useFakeData, useFakeCurrentUser
  ...defaultDebugParams,

  /** Default filter values...
   * @type {TThreadCommentsViewParams}
   */
  defaultViewParams: { ...defaultViewParams },

  // Shared params...

  /** @type {string} */
  currentUser: undefined,
  /** @type {string} */
  role: undefined,

  // Data params...

  /* // API params (regexp, for refactor):
   * \<\(comments\|threads\|commentsHash\|threadsHash\|commentsByThreads\|users\|processIds\|processesHash\)\>
   */

  // Comments and threads data...
  /** @type {TComment[]} */
  comments: [],
  /** @type {TThread[]} */
  threads: [],
  /** @type {Record<TThreadId, TComment>} */
  commentsHash: {},
  /** @type {Record<TThreadId, TThread>} */
  threadsHash: {},
  /** @type {Record<TThreadId, TCommentId[]>} */
  commentsByThreads: {},

  // Collected data...
  /** All users
   * @type {TUserName[]}
   */
  users: [],
  /** @type {TProcessId[]} */
  processIds: [],
  /** @type {Record<TProcessId, TProcess>} */
  processesHash: {},

  // View options...

  /** @type {TThreadCommentsSortThreadsBy} */
  sortThreadsBy: defaultViewParams.sortThreadsBy,
  /* @type {boolean} */
  sortThreadsReversed: defaultViewParams.sortThreadsReversed,

  // Filters (Linked to parent component)...
  /** @type {TThreadCommentsFilterByState} */
  filterByState: defaultViewParams.filterByState,
  /** @type {TUserName[]} */
  filterByUsers: [...defaultViewParams.filterByUsers],
  /** @type {TProcessId[]} */
  filterByProcesses: [...defaultViewParams.filterByProcesses],
  /** @type {boolean} */
  filterByMyThreads: defaultViewParams.filterByMyThreads,

  // Page state...
  totalComments: 0,
  totalThreads: 0,

  // Commpn params...
  error: undefined,
  isError: false,
  isLoading: true,
  hasData: false,
};
