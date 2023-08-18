import * as CommonHelpers from '../../common/CommonHelpers.js';

import * as ThreadCommentsConstants from './ThreadCommentsConstants.js';
import { ThreadCommentsData } from './ThreadCommentsData.js';
import { ThreadCommentsRender } from './ThreadCommentsRender.js';
// import { ThreadCommentsPrepareLoadedData } from './ThreadCommentsPrepareLoadedData.js';
// import { ThreadCommentsStates } from './ThreadCommentsStates.js';

export const ThreadCommentsLoader = /** @lends ThreadCommentsLoader */ {
  __id: 'ThreadCommentsLoader',

  /** Load records data
   */
  loadComments() {
    // const { sharedParams } = ThreadCommentsData;
    const { readCommentsApiUrl: urlBase } = ThreadCommentsConstants;
    const params = {
      // user, // str. Username to filter by
      // process, // int. Proxy process ID
      // resolved, // str, either "0" or "1". Whether comment thread is resolved or not
      // thread, // int. Comment thread id
    };
    const urlQuery = CommonHelpers.makeQuery(params, { addQuestionSymbol: true });
    const url = urlBase + urlQuery;
    /* console.log('[ThreadCommentsLoader:loadComments]: start', {
     *   url,
     *   urlQuery,
     *   params,
     * });
     */
    ThreadCommentsStates.setLoading(true);
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
          console.error('[ThreadCommentsLoader:loadComments]: error (on then)', {
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
        /* console.log('[ThreadCommentsLoader:loadComments]: got comments', {
         *   json,
         *   comments,
         *   threads,
         *   totalThreads,
         *   totalComments,
         * });
         */
        // Store data...
        ThreadCommentsData.comments = comments;
        ThreadCommentsData.threads = threads;
        // Update total comments number...
        ThreadCommentsStates.setTotalCommentsCount(totalComments);
        ThreadCommentsStates.setTotalThreadsCount(totalThreads);
        ThreadCommentsStates.setError(undefined); // Clear the error: all is ok
        ThreadCommentsStates.setHasData(ThreadCommentsData.hasData || hasData); // Update 'has data' flag
        // Prepare and store data...
        ThreadCommentsPrepareLoadedData.acceptAndPrepareData();
        ThreadCommentsPrepareLoadedData.makeDerivedData();
        // Render data...
        ThreadCommentsDataRender.renderData();
        ThreadCommentsDataRender.updateVisibleThreadsStatus();
        ThreadCommentsDataRender.renderDerivedFilters();
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('[ThreadCommentsLoader:loadComments]: error (catched)', {
          error,
          url,
          params,
          urlQuery,
          urlBase,
        });
        // eslint-disable-next-line no-debugger
        debugger;
        // Store & display error...
        ThreadCommentsStates.setError(error);
      })
      .finally(() => {
        ThreadCommentsStates.setLoading(false);
        /* // TODO: Update all the page dynamic elements?
         * CommentsEvents.invokeEvent('updatePage');
         */
      });
  },
};
