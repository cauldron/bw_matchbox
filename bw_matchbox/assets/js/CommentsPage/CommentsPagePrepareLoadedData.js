modules.define(
  'CommentsPagePrepareLoadedData',
  [
    // Required modules...
    'CommentsPageData',
    'CommentsPageHelpers',
  ],
  function provide_CommentsPrepareLoadedData(
    provide,
    // Resolved modules...
    CommentsPageData,
    CommentsPageHelpers,
  ) {
    /** @exports CommentsPagePrepareLoadedData
     */
    const CommentsPagePrepareLoadedData = /** @lends CommentsPagePrepareLoadedData */ {
      __id: 'CommentsPagePrepareLoadedData',

      makeDerivedData() {
        const { comments, threads, sharedParams, useFakeCurrentUser } = CommentsPageData;
        /* console.log('[CommentsPagePrepareLoadedData:makeDerivedData]', {
         *   comments,
         *   threads,
         * });
         */
        const users = comments.reduce((users, { user }) => {
          if (!users.includes(user)) {
            users.push(user);
          }
          return users;
        }, []);
        const processesHash = {};
        const processIds = threads.reduce((processIds, { process }) => {
          const { id } = process;
          if (!processIds.includes(id)) {
            processesHash[id] = process;
            processIds.push(id);
          }
          return processIds;
        }, []);
        /* console.log('[CommentsPagePrepareLoadedData:makeDerivedData] done', {
         *   users,
         *   processesHash,
         *   processIds,
         * });
         */
        CommentsPageData.users = users;
        // DEBUG: Set first given user as current user
        if (useFakeCurrentUser) {
          sharedParams.currentUser = users[0];
        }
        CommentsPageData.processesHash = processesHash;
        CommentsPageData.processIds = processIds;
      },

      /** acceptAndPrepareData -- Prepare, store and render data...
       */
      acceptAndPrepareData() {
        const { comments, threads } = CommentsPageData;
        CommentsPageHelpers.sortThreads(threads);
        comments.sort(CommentsPageHelpers.sortCommentsCompare);
        // Create hashes...
        const commentsHash = comments.reduce((hash, comment) => {
          hash[comment.id] = comment;
          return hash;
        }, {});
        const threadsHash = threads.reduce((hash, thread) => {
          hash[thread.id] = thread;
          return hash;
        }, {});
        // Save created hashes...
        CommentsPageData.commentsHash = commentsHash;
        CommentsPageData.threadsHash = threadsHash;
        /* console.log('[CommentsPagePrepareLoadedData:acceptAndPrepareData]', {
         *   comments,
         *   threads,
         *   commentsHash,
         *   threadsHash,
         * });
         */
        // Prepare comments lists for threads...
        const commentsByThreads = {};
        comments.forEach((comment) => {
          const { id, thread: threadId } = comment;
          const commentIds = commentsByThreads[threadId] || (commentsByThreads[threadId] = []);
          commentIds.push(id);
        });
        // Save comments data to store...
        CommentsPageData.commentsByThreads = commentsByThreads;
        /* console.log('[CommentsPagePrepareLoadedData:acceptAndPrepareData]: done', {
         *   comments,
         *   threads,
         *   commentsHash,
         *   threadsHash,
         *   commentsByThreads,
         * });
         */
      },
    };

    // Provide module...
    provide(CommentsPagePrepareLoadedData);
  },
);
