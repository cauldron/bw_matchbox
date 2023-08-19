// @ts-check

import { commonModal } from '../../common/CommonModal.js';
import { commonNotify } from '../../common/CommonNotify.js';

import * as ThreadCommentsConstants from './ThreadCommentsConstants.js';
import { ThreadCommentsData } from './ThreadCommentsData.js';
import { ThreadCommentsRender } from './ThreadCommentsRender.js';
import { ThreadCommentsHelpers } from './ThreadCommentsHelpers.js';
import { ThreadCommentsNodes } from './ThreadCommentsNodes.js';
import { ThreadCommentsStates } from './ThreadCommentsStates.js';

/** @typedef TApiHandlerParams
 * @property {HTMLElement} node
 * @property {HTMLDivElement} threadNode
 * @property {string} actionId
 * @property {TThreadId} threadId
 */

const commentModal = {
  getCommentModalContent() {
    const content = `
          <div class="comment-modal-form">
            <label for="comment-modal-text">Comment</label>
            <textarea class="u-full-width" id="comment-modal-text" name="comment-modal-text"></textarea>
          </div>
          <div class="comment-modal-actions">
            <button class="button-primary" id="comment-modal-ok">Ok</button>
            <button id="comment-modal-cancel">Cancel</button>
          </div>
        `;
    return content;
  },

  /** promiseCommentModal -- Show dialog with editable comment text and wait for action
   * @return {Promise}
   */
  promiseCommentModal() {
    return new Promise((resolve, _reject) => {
      const title = 'Enter comment text';
      const content = this.getCommentModalContent();
      let isOpened = true;
      commonModal.ensureInit().then(() => {
        commonModal
          .setModalContentId('comment-dialog-modal')
          .setTitle(title)
          .setModalWindowOptions({
            autoHeight: true,
            width: 'md',
          })
          .setModalContentOptions({
            scrollable: true,
            padded: true,
          })
          .setContent(content)
          .onHide(() => {
            // It will be called on modal close...
            if (isOpened) {
              isOpened = false;
              // Don't proceed the operation!
              resolve(false);
            }
          })
          .showModal();
        // Store comment value...
        const modalNode = commonModal.getModalNode();
        /** @type {HTMLButtonElement} */
        const okButtonEl = modalNode.querySelector('button#comment-modal-ok');
        /** @type {HTMLInputElement} */
        const commentTextEl = modalNode.querySelector('textarea#comment-modal-text');
        commentTextEl.focus();
        // TODO: Add handlers for modal actions
        okButtonEl.addEventListener('click', () => {
          if (isOpened) {
            isOpened = false;
            commonModal.hideModal({ dontNotify: true });
            // Success: proceed with comment text
            const comment = commentTextEl.value;
            const userAction = { comment, status: 'comment from promiseCommentModal' };
            resolve(userAction);
          }
        });
        document
          .getElementById('comment-modal-cancel')
          .addEventListener('click', commonModal.getBoundHideModal());
      });
    });
  },
};

const apiHandlers = {
  /** Actual comment api request
   * @param {TApiHandlerParams} params
   * @param {string} comment - Comment text to append
   * @return {Promise}
   */
  threadAddCommentRequest(params, comment) {
    // TODO: Move to Loader/Api?
    // TODO: Check roles for editors, reviewers?
    const { createCommentApiUrl: urlBase } = ThreadCommentsConstants;
    const { threadId, threadNode } = params;
    const { threadsHash, sharedParams } = ThreadCommentsData;
    const { currentUser } = sharedParams;
    const thread = threadsHash[threadId];
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
    /* console.log('[ThreadCommentsHandlers:apiHandlers:threadAddCommentRequest]: start', {
     *   threadId,
     *   thread,
     *   params,
     *   threadsHash,
     *   fetchParams,
     *   requestParams,
     *   urlBase,
     *   url,
     * });
     */
    ThreadCommentsStates.setLoading(true);
    return (
      fetch(url, fetchParams)
        .then((res) => {
          const { ok, status, statusText } = res;
          if (!ok) {
            // Something went wrong?
            const reason =
              [statusText, status && 'status: ' + status].filter(Boolean).join(', ') ||
              'Unknown error';
            const error = new Error('Data loading error: ' + reason);
            // eslint-disable-next-line no-console
            console.error('[ThreadCommentsHandlers:apiHandlers:threadAddCommentRequest]: on then', {
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
        /**
         * @param {TComment} comment
         */
        .then((comment) => {
          const { id: commentId } = comment;
          const { comments, threads, commentsHash, commentsByThreads } = ThreadCommentsData;
          // Update thread modified date (manually!)
          const currDate = new Date();
          const currDateStr = currDate.toUTCString();
          // Update data...
          thread.modified = currDateStr;
          // Add comment to list (`comments`) and update hashes (`commentsByThreads`) ...
          comments.push(comment);
          commentsByThreads[threadId].push(commentId);
          commentsHash[commentId] = comment;
          // Sort comments...
          comments.sort(ThreadCommentsHelpers.sortCommentsCompare);
          ThreadCommentsHelpers.sortThreads(threads);
          // Update content...
          const threadTitleTextNode = threadNode.querySelector('.title-text');
          const threadTitleTextContent =
            ThreadCommentsRender.helpers.createThreadTitleTextContent(thread);
          /* console.log('[ThreadCommentsHandlers:apiHandlers:threadAddCommentRequest]: done', {
           *   commentId,
           *   comment,
           *   commentsHash,
           *   commentsByThreads,
           *   thread,
           *   threadId,
           *   currDate,
           *   currDateStr,
           *   threadTitleTextNode,
           *   threadTitleTextContent,
           * });
           */
          // Update data & elements' states...
          threadTitleTextNode.innerHTML = threadTitleTextContent;
          // ThreadCommentsRender.renderData();
          ThreadCommentsRender.updateThreadComments(threadId);
          ThreadCommentsRender.updateVisibleThreads();
          ThreadCommentsHelpers.sortThreads(threads);
          ThreadCommentsRender.reorderRenderedThreads();
          // Show noitification...
          commonNotify.showSuccess('Comment successfully added');
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('[ThreadCommentsHandlers:apiHandlers:threadAddCommentRequest]: catched', {
            error,
            url,
            params,
            urlBase,
          });
          // eslint-disable-next-line no-debugger
          debugger;
          // Store & display error...
          ThreadCommentsStates.setError(error);
          commonNotify.showError(error);
        })
        .finally(() => {
          ThreadCommentsStates.setLoading(false);
        })
    );
  },

  /** Start adding comment (show comment text dialog
   * @param {TApiHandlerParams} params
   * @return {Promise}
   */
  threadAddComment(params) {
    const { role } = ThreadCommentsData;
    // Check roles...
    if (role !== 'editors' && role !== 'reviewers') {
      commonNotify.showError(`This role (${role}) hasn't allowed to add comments`);
      return;
    }
    // Show comment text form modal first and wait for user action...
    return commentModal.promiseCommentModal().then((userAction) => {
      if (!userAction) {
        // Comment edition canceled
        return false;
      }
      // Make api request...
      const { comment } = userAction;
      return apiHandlers.threadAddCommentRequest(params, comment);
    });
  },

  /** threadResolve -- Set resolved status for thread (called from `handleTitleActionClick` by literal id: `apiHandlers[id]`)
   * @param {TApiHandlerParams} params
   * @return {Promise}
   */
  threadResolve(params) {
    // TODO: Move to Loader/Api?
    const { resolveThreadApiUrl: urlBase } = ThreadCommentsConstants;
    const { threadId, threadNode } = params;
    const { threadsHash, role } = ThreadCommentsData;
    // Check roles...
    if (role !== 'editors') {
      commonNotify.showError(`This role (${role}) hasn't allowed to resolve/open the threads`);
      return;
    }
    const thread = threadsHash[threadId];
    const { resolved: currResolved } = thread;
    const resolved = !currResolved;
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
    /* console.log('[ThreadCommentsHandlers:apiHandlers:threadResolve]: start', {
     *   resolved,
     *   currResolved,
     *   threadId,
     *   thread,
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
          console.error('[ThreadCommentsHandlers:apiHandlers:threadResolve]: error (on then)', {
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
      .then((_json) => {
        /* // TODO: Construct updated date tag?
         * const currDate = new Date();
         * const currDateStr = currDate.toUTCString();
         */
        // Update data...
        thread.resolved = resolved;
        // thread.modified = currDateStr;
        // Update content...
        const threadTitleTextNode = threadNode.querySelector('.title-text');
        const threadTitleTextContent =
          ThreadCommentsRender.helpers.createThreadTitleTextContent(thread);
        /* console.log('[ThreadCommentsHandlers:apiHandlers:threadResolve]: done', {
         *   resolved,
         *   thread,
         *   // currDate,
         *   // currDateStr,
         *   threadTitleTextNode,
         *   threadTitleTextContent,
         *   json,
         * });
         */
        // Update data & elements' states...
        threadTitleTextNode.innerHTML = threadTitleTextContent;
        // Update thread node class...
        threadNode.classList.toggle('resolved', resolved);
        // Update/re-render data...
        // ThreadCommentsRender.renderData();
        ThreadCommentsRender.updateVisibleThreads();
        // Show noitification...
        commonNotify.showSuccess('Thread data successfully updated');
        ThreadCommentsStates.setError(undefined);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('[ThreadCommentsHandlers:apiHandlers:threadResolve]: error (catched)', {
          error,
          url,
          params,
          urlBase,
        });
        // eslint-disable-next-line no-debugger
        debugger;
        // Store & display error...
        ThreadCommentsStates.setError(error);
        commonNotify.showError(error);
      })
      .finally(() => {
        ThreadCommentsStates.setLoading(false);
      });
  },
};

export const ThreadCommentsHandlers = /** @lends ThreadCommentsHandlers */ {
  __id: 'ThreadCommentsHandlers',

  /**
   * @param {MouseEvent} event
   */
  handleTitleActionClick(event) {
    event.preventDefault();
    event.stopPropagation();
    const node = /** @type {HTMLElement} */ (event.currentTarget);
    const { id: actionId } = node;
    // const isThreadAction = actionId.startsWith('thread');
    /** @type {HTMLDivElement} */
    const threadNode = node.closest('.thread');
    /** @type {TThreadId} */
    const threadId = Number(threadNode.getAttribute('data-thread-id'));
    /** @type {TApiHandlerParams} */
    const params = {
      node,
      threadNode,
      actionId,
      threadId,
    };
    const func = apiHandlers[actionId];
    try {
      if (!func) {
        const error = new Error(`Cannot find api handler for action id '${actionId}'`);
        throw error;
      }
      /* console.log('[ThreadCommentsHandlers:handleTitleActionClick]', actionId, {
       *   actionId,
       *   func,
       *   node,
       *   event,
       *   // isThreadAction,
       *   threadNode,
       *   threadId,
       * });
       */
      func(params);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[ThreadCommentsHandlers:handleTitleActionClick] error', error);
      // eslint-disable-next-line no-debugger
      debugger;
    }
  },

  handleFilterByUserChange(node) {
    const values = ThreadCommentsHelpers.getMultipleSelectValues(node);
    /* console.log('[ThreadCommentsHandlers:handleFilterByUserChange]', {
     *   values,
     * });
     */
    ThreadCommentsStates.setFilterByUsers(values);
  },

  handleFilterByProcessChange(node) {
    const values = ThreadCommentsHelpers.getMultipleSelectValues(node).map(Number);
    /* console.log('[ThreadCommentsHandlers:handleFilterByProcessChange]', {
     *   values,
     * });
     */
    ThreadCommentsStates.setFilterByProcesses(values);
  },

  handleFilterByStateChange(node) {
    const { value } = node;
    /* console.log('[ThreadCommentsHandlers:handleFilterByStateChange]', {
     *   value,
     * });
     */
    ThreadCommentsStates.setFilterByState(value);
  },

  handleSortThreadsReversedChange(node) {
    const { checked: value } = node;
    /* console.log('[ThreadCommentsHandlers:handleSortThreadsChange]', {
     *   value,
     * });
     */
    ThreadCommentsStates.setSortThreadsReversedChange(value);
  },

  handleSortThreadsByChange(node) {
    const { value } = node;
    /* console.log('[ThreadCommentsHandlers:handleSortThreadsByChange]', {
     *   value,
     * });
     */
    ThreadCommentsStates.setSortThreadsByChange(value);
  },

  /** Reset `filterByState` filter
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
   */
  resetFilterByState(opts = {}) {
    const filterByStateNode = /** @type {HTMLInputElement} */ (
      document.getElementById('filterByState')
    );
    const { defaultParams } = ThreadCommentsData;
    const { filterByState: value } = defaultParams;
    filterByStateNode.value = value;
    ThreadCommentsStates.setFilterByState(value, opts);
  },

  /** Reset `filterByUsers` filter
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
   */
  resetFilterByUsers(opts = {}) {
    const filterByUsersNode = document.getElementById('filterByUsers');
    const { defaultParams } = ThreadCommentsData;
    const { filterByUsers: values } = defaultParams;
    ThreadCommentsHelpers.setMultipleSelectValues(filterByUsersNode, values);
    ThreadCommentsStates.setFilterByUsers(values, opts);
  },

  /** Reset `filterByProcesses` filter
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
   */
  resetFilterByProcesses(opts = {}) {
    const filterByProcessesNode = document.getElementById('filterByProcesses');
    const { defaultParams } = ThreadCommentsData;
    const { filterByProcesses: values } = defaultParams;
    ThreadCommentsHelpers.setMultipleSelectValues(filterByProcessesNode, values);
    ThreadCommentsStates.setFilterByProcesses(values, opts);
  },

  handleFilterByMyThreads() {
    const { filterByMyThreads } = ThreadCommentsData;
    ThreadCommentsStates.setFilterByMyThreads(!filterByMyThreads);
  },

  /** Reset `filterByMyThreads` filter
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
   */
  resetFilterByMyThreads(opts = {}) {
    const { defaultParams } = ThreadCommentsData;
    const { filterByMyThreads: value } = defaultParams;
    ThreadCommentsStates.setFilterByMyThreads(value, opts);
  },

  handleExpandThread(event) {
    const { target } = event;
    const threadEl = target.closest('.thread');
    const threadId = Number(threadEl.getAttribute('data-thread-id'));
    const wasExpanded = threadEl.classList.contains('expanded');
    const setExpanded = !wasExpanded;
    /* console.log('[ThreadCommentsHandlers:handleExpandThread]', {
     *   threadEl,
     *   target,
     * });
     */
    // Ensure that all the thread comments had already rendered...
    if (setExpanded) {
      ThreadCommentsRender.ensureThreadCommentsReady(threadId);
    }
    // Toggle `expanded` class name...
    threadEl.classList.toggle('expanded', setExpanded);
  },

  handleExpandAllThreads() {
    const threadsListNode = ThreadCommentsNodes.getThreadCommentsNode();
    // const threadNodes = threadsListNode.getElementsByClassName('thread');
    const threadNodes = threadsListNode.querySelectorAll('.thread:not(.hidden)');
    const threadNodesList = Array.from(threadNodes);
    const allCount = threadNodesList.length;
    const expandedThreads = threadNodesList.filter((node) => node.classList.contains('expanded'));
    const expandedCount = expandedThreads.length;
    const isCollapsed = !expandedCount;
    const isExpanded = !isCollapsed && expandedCount === allCount;
    const isSome = !isCollapsed && !isExpanded;
    const isAll = !isSome;
    const setExpanded = isAll ? !isExpanded : false;
    /* console.log('[ThreadCommentsHandlers:handleExpandAllThreads]', {
     *   threadsListNode,
     *   threadNodes,
     *   threadNodesList,
     *   allCount,
     *   expandedThreads,
     *   expandedCount,
     *   isCollapsed,
     *   isExpanded,
     *   isSome,
     *   isAll,
     *   setExpanded,
     * });
     */
    threadNodesList.forEach((node) => {
      if (setExpanded) {
        const threadId = Number(node.getAttribute('data-thread-id'));
        ThreadCommentsRender.ensureThreadCommentsReady(threadId);
      }
      node.classList.toggle('expanded', setExpanded);
    });
  },

  /** Reset all the filters to default values
   */
  handleResetFilters() {
    const commonOpts = { omitUpdate: true };
    this.resetFilterByState(commonOpts);
    this.resetFilterByUsers(commonOpts);
    this.resetFilterByProcesses(commonOpts);
    this.resetFilterByMyThreads(commonOpts);
    ThreadCommentsRender.updateVisibleThreads();
  },

  init({ handlers }) {
    // Export all methods as external handlers...
    const keys = Object.keys(this);
    keys.forEach((key) => {
      const fn = this[key];
      if (typeof fn === 'function' && key !== 'init') {
        // Check if handler is unique?
        if (handlers[key]) {
          const error = new Error('Doubled handler: ' + key);
          // eslint-disable-next-line no-console
          console.error('[ThreadCommentsHandlers:init] init handlers error', error);
          // eslint-disable-next-line no-debugger
          debugger;
          throw error;
        }
        handlers[key] = fn.bind(this);
      }
    });
  },
};
