// @ts-check

import * as CommonHelpers from '../../common/CommonHelpers.js';
import { commonNotify } from '../../common/CommonNotify.js';

import * as ThreadCommentsConstants from './ThreadCommentsConstants.js';
import { ThreadCommentsData } from './ThreadCommentsData.js';
import { ThreadCommentsStates } from './ThreadCommentsStates.js';

export const ThreadCommentsLoader = /** @lends ThreadCommentsLoader */ {
  /** Load records data
   * @return {Promise<TThreadCommentsResponseData>}
   */
  loadCommentsRequest() {
    // const { sharedParams } = ThreadCommentsData;
    const { readCommentsApiUrl: urlBase } = ThreadCommentsConstants;
    const { loadParams } = ThreadCommentsData;
    // @see @matchbox_app.route("/comments/read", methods=["GET"])
    const urlQuery = CommonHelpers.makeQuery(loadParams, { addQuestionSymbol: true });
    const url = urlBase + urlQuery;
    /* console.log('[ThreadCommentsLoader:loadCommentsRequest]: start', {
     *   loadParams,
     *   url,
     * });
     */
    ThreadCommentsStates.setLoading(true);
    return fetch(url)
      .then((res) => {
        const { ok, status, statusText } = res;
        if (!ok) {
          // Something went wrong?
          const reason =
            [statusText, status && 'status: ' + status].filter(Boolean).join(', ') ||
            'Unknown error';
          const error = new Error('Data loading error: ' + reason);
          // eslint-disable-next-line no-console
          console.error('[ThreadCommentsLoader:loadCommentsRequest]: error (on then)', {
            reason,
            res,
            url,
          });
          // eslint-disable-next-line no-debugger
          debugger;
          throw error;
        }
        // All is ok...
        return res.json();
      })
      .then((/** @type {TThreadCommentsResponseData} */ json) => {
        /* // DEBUG: Emulate 'other' reporter for the first record (Issue #119: comments-permissions)
         * if (isDev) {
         *   json.threads[0].reporter = 'XXX';
         * }
         */
        return json;
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('[ThreadCommentsLoader:loadCommentsRequest]: error (catched)', {
          error,
          url,
        });
        // eslint-disable-next-line no-debugger
        debugger;
        throw error;
      })
      .finally(() => {
        ThreadCommentsStates.setLoading(false);
      });
  },

  /** Actual request for adding new comment
   * @param {string} name - New thread name
   * @param {string} comment - Comment text to append
   * @return {Promise<TThreadCommentsResponseData>}
   */
  addNewThreadRequest(name, comment) {
    // TODO: Check roles for editors, reviewers?
    const { addNewThreadApiUrl: urlBase } = ThreadCommentsConstants;
    const { currentUser, currentProcess } = ThreadCommentsData;
    const requestParams = {
      /* // @matchbox_app.route("/comments/create-thread", methods=["POST"])
       * 'thread': {
       *     'name': string,
       *     'process_id': integer,
       * },
       * 'comment': {
       *     'content': string,
       *     'user': string,
       * }
       */
      thread: {
        name,
        process_id: currentProcess,
      },
      comment: {
        content: comment,
        user: currentUser,
      },
    };
    const fetchParams = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(requestParams),
    };
    const url = urlBase;
    /* console.log('[ThreadCommentsLoader:addNewThreadRequest]: start', {
     *   // threadId,
     *   // thread,
     *   // threadsHash,
     *   fetchParams,
     *   requestParams,
     *   urlBase,
     *   url,
     * });
     */
    ThreadCommentsStates.setLoading(true);
    return fetch(url, fetchParams)
      .then((res) => {
        const { ok, status, statusText } = res;
        if (!ok) {
          // Something went wrong?
          const reason =
            [statusText, status && 'status: ' + status].filter(Boolean).join(', ') ||
            'Unknown error';
          const error = new Error('Data loading error: ' + reason);
          // eslint-disable-next-line no-console
          console.error('[ThreadCommentsLoader:addNewThreadRequest]: error', {
            reason,
            res,
            url,
            urlBase,
          });
          // eslint-disable-next-line no-debugger
          debugger;
          throw error;
        }
        // All is ok...
        return res.json();
      })
      .then((/** @type {TThreadCommentsResponseData} */ json) => {
        /* // data example:
         * comments: [{…}]
         * threads: [{…}]
         * total_comments: 13
         * total_threads: 4
         */
        // TODO: Use unified procudure with 'loadComments` to process all the data
        ThreadCommentsStates.setLoading(false);
        return json;
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('[ThreadCommentsLoader:addNewThreadRequest] catched', {
          error,
          url,
          urlBase,
        });
        // eslint-disable-next-line no-debugger
        debugger;
        // Store & display error...
        ThreadCommentsStates.setError(error);
        throw error;
      })
      .finally(() => {
        ThreadCommentsStates.setLoading(false);
      });
  },

  /** threadResolveRequest -- Set resolved status for thread (called from `handleTitleActionClick` by literal id: `apiHandlers[id]`)
   * @param {object} params
   * @param {TThreadId} params.threadId
   * @param {boolean} params.resolved
   * @return {Promise}
   */
  threadResolveRequest(params) {
    const { threadId, resolved } = params;
    const { resolveThreadApiUrl: urlBase } = ThreadCommentsConstants;
    const { role } = ThreadCommentsData;
    // Check roles...
    if (role !== 'editors') {
      commonNotify.showError(`This role (${role}) hasn't allowed to resolve/open the threads`);
      return;
    }
    const requestParams = {
      /* // @matchbox_app.route("/comments/resolve-thread", methods=["POST"])
       * 'thread': integer,
       * 'resolved': boolean
       */
      thread: threadId,
      resolved,
    };
    const fetchParams = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(requestParams),
    };
    // const urlQuery = CommonHelpers.makeQuery(requestParams, { addQuestionSymbol: true });
    const url = urlBase; // + urlQuery;
    /* console.log('[ThreadCommentsLoader:threadResolveRequest]: start', {
     *   resolved,
     *   threadId,
     *   params,
     *   fetchParams,
     *   requestParams,
     *   urlBase,
     *   url,
     * });
     */
    ThreadCommentsStates.setLoading(true);
    return fetch(url, fetchParams)
      .then((res) => {
        const { ok, status, statusText } = res;
        if (!ok) {
          // Something went wrong?
          const reason =
            [statusText, status && 'status: ' + status].filter(Boolean).join(', ') ||
            'Unknown error';
          const error = new Error('Data loading error: ' + reason);
          // eslint-disable-next-line no-console
          console.error('[ThreadCommentsLoader:threadResolveRequest]: error (on then)', {
            reason,
            res,
            url,
            params,
            urlBase,
          });
          // eslint-disable-next-line no-debugger
          debugger;
          throw error;
        }
        // All is ok...
        return res.json();
      })
      .then((data) => {
        return data;
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('[ThreadCommentsLoader:threadResolveRequest]: error (catched)', {
          error,
          url,
          params,
          urlBase,
        });
        // eslint-disable-next-line no-debugger
        debugger;
        throw error;
      })
      .finally(() => {
        ThreadCommentsStates.setLoading(false);
      });
  },

  /** Actual request for adding new comment
   * @param {object} params
   * @param {TThreadId} params.threadId
   * @param {string} params.comment - Comment text to append
   * @return {Promise}
   */
  threadAddCommentRequest(params) {
    // TODO: Move to Loader/Api?
    // TODO: Check roles for editors, reviewers?
    const { createCommentApiUrl: urlBase } = ThreadCommentsConstants;
    const { threadId, comment } = params;
    const { currentUser } = ThreadCommentsData;
    const requestParams = {
      /* // @matchbox_app.route("/comments/create-comment", methods=["POST"])
       * 'thread': integer,
       * 'content': string,
       * 'user': string
       */
      thread: threadId,
      user: currentUser,
      content: comment,
    };
    const fetchParams = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(requestParams),
    };
    const url = urlBase;
    /* // DEBUG
     * const { threadsHash } = ThreadCommentsData;
     * console.log('[ThreadCommentsLoader:threadAddCommentRequest]: start', {
     *   threadId,
     *   params,
     *   threadsHash,
     *   fetchParams,
     *   requestParams,
     *   urlBase,
     *   url,
     * });
     */
    ThreadCommentsStates.setLoading(true);
    return fetch(url, fetchParams)
      .then((res) => {
        const { ok, status, statusText } = res;
        if (!ok) {
          // Something went wrong?
          const reason =
            [statusText, status && 'status: ' + status].filter(Boolean).join(', ') ||
            'Unknown error';
          const error = new Error('Data loading error: ' + reason);
          // eslint-disable-next-line no-console
          console.error('[ThreadCommentsLoader:threadAddCommentRequest]: on then', {
            reason,
            res,
            url,
            params,
          });
          // eslint-disable-next-line no-debugger
          debugger;
          throw error;
        }
        // All is ok...
        return res.json();
      })
      .then((/** @type {TComment} */ comment) => {
        /* console.log('[ThreadCommentsLoader:threadAddCommentRequest]: done', {
         *   comment,
         * });
         */
        return comment;
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('[ThreadCommentsLoader:threadAddCommentRequest]: catched', {
          error,
          url,
          params,
        });
        // eslint-disable-next-line no-debugger
        debugger;
        throw error;
      })
      .finally(() => {
        ThreadCommentsStates.setLoading(false);
      });
  },
};
