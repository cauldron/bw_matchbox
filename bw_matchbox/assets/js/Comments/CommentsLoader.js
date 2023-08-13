modules.define(
  'CommentsLoader',
  [
    // Required modules...
    'CommentsConstants',
    'CommentsData',
    'CommentsDataRender',
    'CommentsHelpers',
    'CommentsStates',
    'CommonHelpers',
  ],
  function provide_CommentsLoader(
    provide,
    // Resolved modules...
    CommentsConstants,
    CommentsData,
    CommentsDataRender,
    CommentsHelpers,
    CommentsStates,
    CommonHelpers,
  ) {
    /* // Data types decription (TS-style):
     * interface TCommentProcess {
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
     *   process: TCommentProcess;
     * }
     * interface TLocalThread extends TThread {
     *   commentIds: number[];
     * }
     * type TCommentsHash = Record<TTreadId, TComment>;
     * type TThreadsHash = Record<TTreadId, TLocalThread>;
     *
     */

    /** @exports CommentsLoader
     */
    const CommentsLoader = /** @lends CommentsLoader */ {
      __id: 'CommentsLoader',

      /** acceptData -- Prepare, store and render data...
       */
      acceptData() {
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
        console.log('[CommentsLoader:acceptData]', {
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
        console.log('[CommentsLoader:acceptData]: done', {
          comments,
          threads,
          commentsHash,
          threadsHash,
          commentsByThreads,
        });
        // TODO: Create threads...
        CommentsDataRender.renderData();
      },

      /** Load records data
       */
      loadComments() {
        // const { sharedParams } = CommentsData;
        const { readCommentsApiUrl: urlBase } = CommentsConstants;
        const params = {
          // user, // str. Username to filter by
          // process, // int. Proxy process ID
          // resolved, // str, either "0" or "1". Whether comment thread is resolved or not
          // thread, // int. Comment thread id
        };
        const urlQuery = CommonHelpers.makeQuery(params, { addQuestionSymbol: true });
        const url = urlBase + urlQuery;
        console.log('[CommentsLoader:loadComments]: start', {
          url,
          urlQuery,
          params,
        });
        CommentsStates.setLoading(true);
        fetch(url)
          .then((res) => {
            const { ok, status, statusText } = res;
            if (!ok) {
              // Something went wrong?
              const reason =
                [statusText, status && 'status: ' + status].filter(Boolean).join(', ') ||
                'Unknown error';
              const error = new Error('Data loading error: ' + reason);
              // eslint-disable-next-line no-console
              console.error('[CommentsLoader:loadComments]: error (on then)', {
                reason,
                res,
                url,
                params,
                urlQuery,
                urlBase,
              });
              // eslint-disable-next-line no-debugger
              debugger;
              throw error;
            }
            // All is ok...
            return res.json();
          })
          .then((json) => {
            const {
              comments,
              threads,
              total_comments: totalComments,
              total_threads: totalThreads,
            } = json;
            const hasData = Array.isArray(comments) && !!comments.length;
            console.log('[CommentsLoader:loadComments]: got comments', {
              json,
              comments,
              threads,
              totalThreads,
              totalComments,
            });
            // Store data...
            CommentsData.comments = comments;
            CommentsData.threads = threads;
            // Update total comments number...
            CommentsStates.setTotalCommentsCount(totalComments);
            CommentsStates.setTotalThreadsCount(totalThreads);
            CommentsStates.setError(undefined); // Clear the error: all is ok
            CommentsStates.setHasData(CommentsData.hasData || hasData); // Update 'has data' flag
            // Prepare, store and render data...
            this.acceptData();
          })
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error('[CommentsLoader:loadComments]: error (catched)', {
              error,
              url,
              params,
              urlQuery,
              urlBase,
            });
            // eslint-disable-next-line no-debugger
            debugger;
            // Store & display error...
            CommentsStates.setError(error);
          })
          .finally(() => {
            CommentsStates.setLoading(false);
            /* // TODO: Update all the page dynamic elements?
             * CommentsEvents.invokeEvent('updatePage');
             */
          });
      },
    };

    // Provide module...
    provide(CommentsLoader);
  },
);
