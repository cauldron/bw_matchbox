modules.define(
  'CommentsPageLoader',
  [
    // Required modules...
    'CommentsPageConstants',
    'CommentsPageData',
    'CommentsPageDataRender',
    'CommentsPagePrepareLoadedData',
    'CommentsPageStates',
    'CommonHelpers',
  ],
  function provide_CommentsLoader(
    provide,
    // Resolved modules...
    CommentsPageConstants,
    CommentsPageData,
    CommentsPageDataRender,
    CommentsPagePrepareLoadedData,
    CommentsPageStates,
    CommonHelpers,
  ) {
    /** @exports CommentsPageLoader
     */
    const CommentsPageLoader = /** @lends CommentsPageLoader */ {
      __id: 'CommentsPageLoader',

      /** Load records data
       */
      loadComments() {
        // const { sharedParams } = CommentsPageData;
        const { readCommentsApiUrl: urlBase } = CommentsPageConstants;
        const params = {
          // user, // str. Username to filter by
          // process, // int. Proxy process ID
          // resolved, // str, either "0" or "1". Whether comment thread is resolved or not
          // thread, // int. Comment thread id
        };
        const urlQuery = CommonHelpers.makeQuery(params, { addQuestionSymbol: true });
        const url = urlBase + urlQuery;
        /* console.log('[CommentsPageLoader:loadComments]: start', {
         *   url,
         *   urlQuery,
         *   params,
         * });
         */
        CommentsPageStates.setLoading(true);
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
              console.error('[CommentsPageLoader:loadComments]: error (on then)', {
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
            /* console.log('[CommentsPageLoader:loadComments]: got comments', {
             *   json,
             *   comments,
             *   threads,
             *   totalThreads,
             *   totalComments,
             * });
             */
            // Store data...
            CommentsPageData.comments = comments;
            CommentsPageData.threads = threads;
            // Update total comments number...
            CommentsPageStates.setTotalCommentsCount(totalComments);
            CommentsPageStates.setTotalThreadsCount(totalThreads);
            CommentsPageStates.setError(undefined); // Clear the error: all is ok
            CommentsPageStates.setHasData(CommentsPageData.hasData || hasData); // Update 'has data' flag
            // Prepare and store data...
            CommentsPagePrepareLoadedData.acceptAndPrepareData();
            CommentsPagePrepareLoadedData.makeDerivedData();
            // Render data...
            CommentsPageDataRender.renderData();
            CommentsPageDataRender.updateVisibleThreadsStatus();
            CommentsPageDataRender.renderDerivedFilters();
          })
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error('[CommentsPageLoader:loadComments]: error (catched)', {
              error,
              url,
              params,
              urlQuery,
              urlBase,
            });
            // eslint-disable-next-line no-debugger
            debugger;
            // Store & display error...
            CommentsPageStates.setError(error);
          })
          .finally(() => {
            CommentsPageStates.setLoading(false);
            /* // TODO: Update all the page dynamic elements?
             * CommentsEvents.invokeEvent('updatePage');
             */
          });
      },
    };

    // Provide module...
    provide(CommentsPageLoader);
  },
);
