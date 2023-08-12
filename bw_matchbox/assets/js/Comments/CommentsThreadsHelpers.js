modules.define(
  'CommentsThreadsHelpers',
  [
    // Required modules...
    'CommentsData',
  ],
  function provide_CommentsThreadsHelpers(
    provide,
    // Resolved modules...
    CommentsData,
  ) {
    /** @exports CommentsThreadsHelpers
     */
    const CommentsThreadsHelpers = {
      __id: 'CommentsThreadsHelpers',

      isThreadVisible(threadId) {
        const { filterByState, threadsHash } = CommentsData;
        const thread = threadsHash[threadId];
        const { resolved } = thread;
        if (filterByState === 'resolved' && !resolved) {
          return false;
        }
        if (filterByState === 'open' && resolved) {
          return false;
        }
        return true;
      },
    };

    // Provide module...
    provide(CommentsThreadsHelpers);
  },
);
