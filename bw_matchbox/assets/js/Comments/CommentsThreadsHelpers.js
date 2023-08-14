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

      /** createProcessName
       * @param {<TProcess>} process
       * @return {string}
       */
      createProcessName(process) {
        const { id, name } = process;
        return `${name} #${id}`;
      },

      /** Filter visible comment ids
       * @param {TCommentId} commentId
       * @return {boolean} - Is comment visible?
       */
      isCommentVisible(commentId) {
        /* // TODO: Tho hide some comments (here we hide comment for 'MyCommentThreads' filter
         * const {
         *   filterByMyCommentThreads, // NOTE: Should override other filters
         *   sharedParams,
         *   commentsHash,
         * } = CommentsData;
         * if (filterByMyCommentThreads) {
         *   const { currentUser } = sharedParams;
         *   const comment = commentsHash[commentId];
         *   const { user } = comment;
         *   if (user !== currentUser) {
         *     return false;
         *   }
         * }
         */
        return true;
      },

      /** Filter threads for current filters
       * @param {TThreadId} threadId
       * @return {boolean} - Is thread visible?
       */
      isThreadVisible(threadId) {
        let {
          // Those filters can be overrided if `filterByMyCommentThreads` has set
          filterByState,
          filterByUsers,
          filterByProcesses,
        } = CommentsData;
        const {
          filterByMyCommentThreads, // NOTE: Should override other filters
          threadsHash,
          commentsByThreads,
          commentsHash,
          sharedParams,
        } = CommentsData;
        const { currentUser } = sharedParams;
        const thread = threadsHash[threadId];
        const { resolved, process } = thread;
        /* console.log('[CommentsThreadsHelpers:isThreadVisible]', {
         *   currentUser,
         *   sharedParams,
         *   filterByState,
         *   filterByUsers,
         *   filterByProcesses,
         *   filterByMyCommentThreads,
         * });
         */
        if (filterByMyCommentThreads) {
          // Filter for current user' and open threads
          filterByState = 'open';
          filterByUsers = [currentUser];
          filterByProcesses = undefined;
          /* console.log('[CommentsThreadsHelpers:isThreadVisible] filterByMyCommentThreads', {
           *   currentUser,
           *   sharedParams,
           *   filterByState,
           *   filterByUsers,
           *   filterByProcesses,
           *   filterByMyCommentThreads,
           * });
           */
        }
        // Filter with `filterByState`...
        if (filterByState) {
          if (filterByState === 'resolved' && !resolved) {
            return false;
          }
          if (filterByState === 'open' && resolved) {
            return false;
          }
        }
        // Filter with `filterByUsers`...
        if (Array.isArray(filterByUsers) && filterByUsers.length) {
          const commentIds = commentsByThreads[threadId];
          const commentUsersList = commentIds.map((userId) => commentsHash[userId].user);
          // TODO: Optimize search?
          const commonUsers = commentUsersList
            .map((user) => {
              return filterByUsers.includes(user) && user;
            })
            .filter(Boolean);
          const hasCommonUsers = !!commonUsers.length;
          if (!hasCommonUsers) {
            return false;
          }
        }
        // Filter with `filterByProcesses`...
        if (Array.isArray(filterByProcesses) && filterByProcesses.length) {
          if (!filterByProcesses.includes(process.id)) {
            return false;
          }
        }
        return true;
      },
    };

    // Provide module...
    provide(CommentsThreadsHelpers);
  },
);
