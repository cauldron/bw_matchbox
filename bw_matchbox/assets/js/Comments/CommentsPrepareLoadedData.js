modules.define(
  'CommentsPrepareLoadedData',
  [
    // Required modules...
    'CommentsData',
    'CommentsHelpers',
  ],
  function provide_CommentsPrepareLoadedData(
    provide,
    // Resolved modules...
    CommentsData,
    CommentsHelpers,
  ) {
    /** @exports CommentsPrepareLoadedData
     */
    const CommentsPrepareLoadedData = /** @lends CommentsPrepareLoadedData */ {
      __id: 'CommentsPrepareLoadedData',

      makeDerivedData() {
        const { comments, threads } = CommentsData;
        /* console.log('[CommentsPrepareLoadedData:makeDerivedData]', {
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
        /* console.log('[CommentsPrepareLoadedData:makeDerivedData] done', {
         *   users,
         *   processesHash,
         *   processIds,
         * });
         */
        CommentsData.users = users;
        CommentsData.processesHash = processesHash;
        CommentsData.processIds = processIds;
      },

      /** acceptAndPrepareData -- Prepare, store and render data...
       */
      acceptAndPrepareData() {
        const { comments, threads } = CommentsData;
        CommentsHelpers.sortThreads(threads);
        comments.sort(CommentsHelpers.sortCommentsCompare);
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
        CommentsData.commentsHash = commentsHash;
        CommentsData.threadsHash = threadsHash;
        /* console.log('[CommentsPrepareLoadedData:acceptAndPrepareData]', {
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
        CommentsData.commentsByThreads = commentsByThreads;
        /* console.log('[CommentsPrepareLoadedData:acceptAndPrepareData]: done', {
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
    provide(CommentsPrepareLoadedData);
  },
);
