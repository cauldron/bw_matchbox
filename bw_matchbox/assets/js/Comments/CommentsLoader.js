modules.define(
  'CommentsLoader',
  [
    // Required modules...
    'CommonHelpers',
    'CommentsConstants',
    'CommentsData',
    'CommentsStates',
    'CommentsDataRender',
  ],
  function provide_CommentsLoader(
    provide,
    // Resolved modules...
    CommonHelpers,
    CommentsConstants,
    CommentsData,
    CommentsStates,
    CommentsDataRender,
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
     *   content: string; // '...'
     *   position: number; // 10
     *   resolved: boolean; // true
     *   thread_id: number; // 13
     *   thread_name: string; // 'Consequatur exercita'
     *   thread_reporter: string; // 'Reporter Name'
     *   user: string; // 'Ida Trombetta'
     *   process: TCommentProcess;
     * }
     * interface TThread {
     *   comments: TComment[];
     *   id: number;
     *   name: string;
     *   reporter: string;
     * }
     */

    /** Local helpers... */
    const helpers = {
      /** Compare two threads objects
       * @param {<TThread>} a
       * @param {<TThread>} b
       * @return {-1, 0, 1}
       */
      sortThreads(a, b) {
        const cmpKey = 'name'; // TODO: Use different sort keys depending on configuration?
        const aVal = a[cmpKey];
        const bVal = b[cmpKey];
        return aVal === bVal ? 0 : aVal < bVal ? -1 : 1;
      },

      /** Compare two comments objects
       * @param {<TComment>} a
       * @param {<TComment>} b
       * @return {-1, 0, 1}
       */
      sortComments(a, b) {
        return a.position - b.position;
      },
    };

    /** @exports CommentsLoader
     */
    const CommentsLoader = /** @lends CommentsLoader */ {
      __id: 'CommentsLoader',

      /** acceptData -- Prepare, store and render data...
       * @param {<TComment[]>} comments
       */
      acceptData(comments) {
        const threads = [];
        comments.forEach((comment) => {
          const {
            thread_id, // 13
            thread_name, // 'Consequatur exercita'
            thread_reporter, // 'Reporter Name'
            // content, // '...'
            // position, // 10
            // resolved, // true
            // user, // 'Ida Trombetta'
            // process, // TCommentProcess
          } = comment;
          if (!threads[thread_id]) {
            /** @type {<TThread>} */
            threads[thread_id] = {
              comments: [],
              id: thread_id,
              name: thread_name,
              reporter: thread_reporter,
            };
          }
          threads[thread_id].comments.push(comment);
        });
        // Sort all the comments and threads...
        threads.sort(helpers.sortThreads);
        threads.forEach(({ comments }) => {
          comments.sort(helpers.sortComments);
        });
        console.log('[CommentsLoader:acceptData]: start', {
          comments,
          threads,
        });
        // Save data...
        CommentsData.threads = threads;
        CommentsData.comments = comments;
        // TODO: Create threads...
        CommentsDataRender.renderData();
      },

      /** Load records data
       */
      loadComments() {
        // const { sharedParams } = CommentsData;
        const { commentsApiUrl: urlBase } = CommentsConstants;
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
              data: comments,
              total_comments: totalComments,
              total_threads: totalThreads,
            } = json;
            const hasData = Array.isArray(comments) && !!comments.length;
            console.log('[CommentsLoader:loadComments]: got comments', {
              json,
              comments,
              totalThreads,
              totalComments,
            });
            // Update total comments number...
            CommentsStates.setTotalCommentsCount(totalComments);
            CommentsStates.setTotalThreadsCount(totalThreads);
            CommentsStates.setError(undefined); // Clear the error: all is ok
            CommentsStates.setHasData(CommentsData.hasData || hasData); // Update 'has data' flag
            // Prepare, store and render data...
            this.acceptData(comments);
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
            // Update all the page dynamic elements?
            CommentsStates.updatePage();
          });
      },
    };

    // Provide module...
    provide(CommentsLoader);
  },
);
