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

      isThreadVisible(threadId) {
        const {
          filterByState,
          filterByUsers,
          filterByProcesses,
          threadsHash,
          commentsByThreads,
          commentsHash,
        } = CommentsData;
        const thread = threadsHash[threadId];
        const { resolved, process } = thread;
        console.log('[CommentsThreadsHelpers:isThreadVisible]', {
          filterByUsers,
          filterByProcesses,
        });
        // Filter with `filterByState`...
        if (filterByState === 'resolved' && !resolved) {
          return false;
        }
        if (filterByState === 'open' && resolved) {
          return false;
        }
        // Filter with `filterByUsers`...
        if (filterByUsers.length) {
          const commentIds = commentsByThreads[threadId];
          const commentUsersList = commentIds.map((userId) => commentsHash[userId].user);
          // TODO: Optimize search?
          const commonUsers = commentUsersList
            .map((user) => {
              return filterByUsers.includes(user) && user;
            })
            .filter(Boolean);
          const hasCommonUsers = !!commonUsers.length;
          console.log('[CommentsThreadsHelpers:isThreadVisible]', {
            hasCommonUsers,
            commentUsersList,
            commonUsers,
            filterByUsers,
            commentIds,
          });
          if (!hasCommonUsers) {
            return false;
          }
        }
        // Filter with `filterByProcesses`...
        if (filterByProcesses.length) {
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
