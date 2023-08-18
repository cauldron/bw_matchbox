import { CommentsPageConstants } from './CommentsPageConstants.js';

const { useDebug } = CommentsPageConstants;

const useFakeData = useDebug && false; // DEBUG: Use fake data for tests
const useFakeCurrentUser = useDebug && true; // DEBUG: Use first of found users instead provided by page

/** Default filter values... */
const defaultParams = {
  /** @type {'name' | 'modifiedDate'} */
  sortThreadsBy: 'modifiedDate',

  /** @type {'none' | 'resolved' | 'open'} */
  filterByState: 'none',
  /** @type {string[]} */
  filterByUsers:
    /*DEBUG*/ useFakeData && useDebug
      ? ['Puccio Bernini', 'Melissa Fisher'] // DEBUG: Test multiple selectors initalization
      : [],
  /** @type {string[]} */
  filterByProcesses: [],
  /** @type {boolean} */
  filterByMyThreads: false,
};

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

  /* // Moved to `ThreadCommentsData`
   * // Comments and threads data...
   * comments: [], // TComment[]
   * threads: [], // TThread[]
   * commentsHash: {}, // TCommentsHash = Record<TThreadId, TComment>
   * threadsHash: {}, // TThreadsHash = Record<TThreadId, TThread>
   * commentsByThreads: {}, // TCommentsByThreads = Record<TThreadId, TCommentId[]>
   */

  // Collected data...
  users: [],
  processIds: [],
  processesHash: {},

  // View options...
  sortThreadsBy: defaultParams.sortThreadsBy,
  sortThreadsReversed: false,

  defaultParams,

  // Filters...
  filterByState: defaultParams.filterByState, // 'none' 'resolved', 'open'
  /** @type {string[]} */
  filterByUsers: [...defaultParams.filterByUsers],
  /** @type {string[]} */
  filterByProcesses: [...defaultParams.filterByProcesses],
  /** @type {boolean} */
  filterByMyThreads: defaultParams.filterByMyThreads,

  // Page state...
  totalComments: 0,
  totalThreads: 0,
  // currentPage: 0,
  error: undefined,
  isError: false,
  isLoading: true,
  hasData: false,
};
