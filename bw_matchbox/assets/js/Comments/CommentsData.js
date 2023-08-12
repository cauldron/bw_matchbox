modules.define(
  'CommentsData',
  [
    // Required modules...
    // 'CommentsConstants',
  ],
  function provide_CommentsData(
    provide,
    // Resolved modules...
    // CommentsConstants,
  ) {
    /** @exports CommentsData
     */
    const CommentsData = /** @lends CommentsData */ {
      __id: 'CommentsData',

      // Owner page's provided data...
      sharedParams: undefined,

      // Data params...

      // Comments and threads data...
      comments: [], // TComment[]
      threads: [], // TLocalThread[]
      commentsHash: {}, // Record<TTreadId, TComment>
      threadsHash: {}, // Record<TTreadId, TLocalThread>
      commentsByThreads: {}, // Record<TTreadId, TCommentId[]>

      // View options...
      sortThreadsBy: 'modifiedDate',
      reversedThreadsSorts: true,

      // Page state...
      totalComments: 0,
      totalThreads: 0,
      // currentPage: 0,
      error: undefined,
      isError: false,
      isLoading: true,
      hasData: false,

      // Handlers to call on each page update (see `processes-list-states.js`)...
      updatePageHandlers: [],
    };

    // Provide module...
    provide(CommentsData);
  },
);
