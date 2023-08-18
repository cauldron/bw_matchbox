/* // Data types decription (TS-style):
 * interface TProcess {
 *   database: string; // 'new1'
 *   id: number; // 5300
 *   location: string; // 'United States'
 *   name: string; // 'Proxy for Ethalfluralin'
 *   product?: string; // null
 *   unit: string; // 'USD'
 *   url: string; // '/process/5300'
 * }
 * interface TComment {
 *   id: number; // 2
 *   position: number; // 1
 *   thread: number; // 1
 *   user: string; // 'Puccio Bernini'
 *   content: string; // '...'
 * }
 * interface TThread {
 *   id: number; // 1
 *   created: TDateStr; // 'Sat, 12 Aug 2023 12:36:08 GMT'
 *   modified: TDateStr; // 'Sat, 12 Aug 2023 12:36:08 GMT'
 *   name: string; // 'Возмутиться кпсс гул'
 *   reporter: string; // '阿部 篤司'
 *   resolved: boolean; // false
 *   process: TProcess;
 * }
 * type TCommentsHash = Record<TTreadId, TComment>;
 * type TThreadsHash = Record<TTreadId, TThread>;
 * type TCommentsByThreads = Record<TTreadId, TCommentId[]>;
 */

modules.define(
  'CommentsPageData',
  [
    // Required modules...
    'CommentsPageConstants',
  ],
  function provide_CommentsData(
    provide,
    // Resolved modules...
    CommentsPageConstants,
  ) {
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
    const CommentsPageData = /** @lends CommentsPageData */ {
      __id: 'CommentsPageData',

      // DEBUG
      useFakeData,
      useFakeCurrentUser,

      // Owner page's provided data...
      sharedParams: undefined,

      // Data params...

      // Comments and threads data...
      comments: [], // TComment[]
      threads: [], // TThread[]
      commentsHash: {}, // TCommentsHash = Record<TTreadId, TComment>
      threadsHash: {}, // TThreadsHash = Record<TTreadId, TThread>
      commentsByThreads: {}, // TCommentsByThreads = Record<TTreadId, TCommentId[]>

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

    // Provide module...
    provide(CommentsPageData);
  },
);
