// @ts-check

import { useDebug } from '../../common/CommonConstants.js';

const useFakeData = useDebug && false; // DEBUG: Use fake data for tests
const useFakeCurrentUser = useDebug && true; // DEBUG: Use first of found users instead provided by page

/** Default filter values... */
const defaultParams = {
  /** @type {TSortThreadsBy} */
  sortThreadsBy: 'modifiedDate',
  // TODO: Should be a list

  /* // On `CommentsPageData`
   * [>* @type {'none' | 'resolved' | 'open'} <]
   * filterByState: 'none',
   * [>* @type {string[]} <]
   * filterByUsers:
   *   [>DEBUG<] useFakeData && useDebug
   *     ? ['Puccio Bernini', 'Melissa Fisher'] // DEBUG: Test multiple selectors initalization
   *     : [],
   * [>* @type {string[]} <]
   * filterByProcesses: [],
   * [>* @type {boolean} <]
   * filterByMyThreads: false,
   */
};

export const ThreadCommentsData = {
  // DEBUG
  useFakeData,
  useFakeCurrentUser,

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
  sortThreadsBy: defaultParams.sortThreadsBy,
  sortThreadsReversed: false,

  defaultParams,

  /* // On `CommentsPageData`
   * // Filters...
   * filterByState: defaultParams.filterByState, // 'none' 'resolved', 'open'
   * [>* @type {string[]} <]
   * filterByUsers: [...defaultParams.filterByUsers],
   * [>* @type {string[]} <]
   * filterByProcesses: [...defaultParams.filterByProcesses],
   * [>* @type {boolean} <]
   * filterByMyThreads: defaultParams.filterByMyThreads,
   */

  // Page state...
  totalComments: 0,
  totalThreads: 0,

  // currentPage: 0,
  error: undefined,
  isError: false,
  isLoading: true,
  hasData: false,
};
