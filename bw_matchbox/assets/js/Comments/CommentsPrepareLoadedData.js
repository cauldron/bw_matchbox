modules.define(
  'CommentsPrepareLoadedData',
  [
    // Required modules...
    'CommentsData',
    'CommentsDataRender',
    'CommentsHelpers',
  ],
  function provide_CommentsPrepareLoadedData(
    provide,
    // Resolved modules...
    CommentsData,
    CommentsDataRender,
    CommentsHelpers,
  ) {
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
     * interface TThread extends TThread {
     *   commentIds: number[];
     * }
     * type TCommentsHash = Record<TTreadId, TComment>;
     * type TThreadsHash = Record<TTreadId, TThread>;
     *
     */

    /** @exports CommentsPrepareLoadedData
     */
    const CommentsPrepareLoadedData = /** @lends CommentsPrepareLoadedData */ {
      __id: 'CommentsPrepareLoadedData',

      makeDerivedData() {
        const {
          comments,
          threads,
          // commentsHash,
          // threadsHash,
          // commentsByThreads,
        } = CommentsData;
        console.log('[CommentsPrepareLoadedData:makeDerivedData]', {
          comments,
          threads,
        });
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
        console.log('[CommentsPrepareLoadedData:makeDerivedData] done', {
          users,
          processesHash,
          processIds,
        });
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
        console.log('[CommentsPrepareLoadedData:acceptAndPrepareData]', {
          comments,
          threads,
          commentsHash,
          threadsHash,
        });
        // Prepare comments lists for threads...
        const commentsByThreads = {};
        comments.forEach((comment) => {
          const { id, thread: threadId } = comment;
          const commentIds = commentsByThreads[threadId] || (commentsByThreads[threadId] = []);
          commentIds.push(id);
        });
        // Save comments data to store...
        CommentsData.commentsByThreads = commentsByThreads;
        console.log('[CommentsPrepareLoadedData:acceptAndPrepareData]: done', {
          comments,
          threads,
          commentsHash,
          threadsHash,
          commentsByThreads,
        });
      },
    };

    // Provide module...
    provide(CommentsPrepareLoadedData);
  },
);
