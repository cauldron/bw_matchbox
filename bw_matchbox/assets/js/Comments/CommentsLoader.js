modules.define(
  'CommentsLoader',
  [
    // Required modules...
    'CommentsConstants',
    'CommentsData',
    'CommentsDataRender',
    'CommentsPrepareLoadedData',
    'CommentsStates',
    'CommonHelpers',
  ],
  function provide_CommentsLoader(
    provide,
    // Resolved modules...
    CommentsConstants,
    CommentsData,
    CommentsDataRender,
    CommentsPrepareLoadedData,
    CommentsStates,
    CommonHelpers,
  ) {
    /** @exports CommentsLoader
     */
    const CommentsLoader = /** @lends CommentsLoader */ {
      __id: 'CommentsLoader',

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
        /* console.log('[CommentsLoader:loadComments]: start', {
         *   url,
         *   urlQuery,
         *   params,
         * });
         */
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
            /* console.log('[CommentsLoader:loadComments]: got comments', {
             *   json,
             *   comments,
             *   threads,
             *   totalThreads,
             *   totalComments,
             * });
             */
            // Store data...
            CommentsData.comments = comments;
            CommentsData.threads = threads;
            // Update total comments number...
            CommentsStates.setTotalCommentsCount(totalComments);
            CommentsStates.setTotalThreadsCount(totalThreads);
            CommentsStates.setError(undefined); // Clear the error: all is ok
            CommentsStates.setHasData(CommentsData.hasData || hasData); // Update 'has data' flag
            // Prepare and store data...
            CommentsPrepareLoadedData.acceptAndPrepareData();
            CommentsPrepareLoadedData.makeDerivedData();
            // Render data...
            CommentsDataRender.renderData();
            CommentsDataRender.renderDerivedFilters();
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
