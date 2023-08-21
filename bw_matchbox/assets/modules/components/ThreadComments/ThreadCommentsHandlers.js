// @ts-check

import { commonNotify } from '../../common/CommonNotify.js';

import { ThreadCommentsData } from './ThreadCommentsData.js';
import { ThreadCommentsRender } from './ThreadCommentsRender.js';
import { ThreadCommentsNodes } from './ThreadCommentsNodes.js';
import { ThreadCommentsLoader } from './ThreadCommentsLoader.js';
import { ThreadCommentsStates } from './ThreadCommentsStates.js';
import { ThreadCommentsPrepare } from './ThreadCommentsPrepare.js';
import { CommentModalDialog } from './CommentModalDialog.js';

/** @typedef TApiHandlerParams
 * @property {HTMLElement} node
 * @property {HTMLDivElement} threadNode
 * @property {string} actionId
 * @property {TThreadId} threadId
 */

const apiHandlers = {
  /** Start adding comment (show comment text dialog
   * @param {TApiHandlerParams} params
   * @return {Promise}
   */
  threadAddComment(params) {
    const { threadId, threadNode } = params;
    const { role, threadsHash } = ThreadCommentsData;
    const thread = threadsHash[threadId];
    // Check roles...
    if (role !== 'editors' && role !== 'reviewers') {
      const error = new Error(`This role (${role}) hasn't allowed to add comments`);
      // eslint-disable-next-line no-console
      console.warn('[ThreadCommentsHandlers:threadAddComment]', error);
      commonNotify.showError(error);
      return;
    }
    const commentModalDialog = new CommentModalDialog();
    // Show comment text form modal first and wait for user action...
    const modalPromise = commentModalDialog.promiseCommentModal();
    return modalPromise.then((userAction) => {
      if (!userAction) {
        // Comment edition canceled
        return false;
      }
      // Make api request...
      const { comment } = userAction;
      return ThreadCommentsLoader.threadAddCommentRequest({ threadId, comment })
        .then((/** @type {TComment} */ comment) => {
          console.log('[ThreadCommentsHandlers:threadAddCommentRequest]: done', {
            comment,
            thread,
            threadId,
          });
          ThreadCommentsPrepare.addCommentToThread({ threadId, threadNode, comment });
          // Show noitification...
          commonNotify.showSuccess('Comment successfully added');
          return true;
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('[ThreadCommentsHandlers:threadAddComment]: catched', {
            error,
            params,
          });
          // eslint-disable-next-line no-debugger
          debugger;
          // Store & display error...
          ThreadCommentsStates.setError(error);
          commonNotify.showError(error);
        });
    });
  },

  /** threadResolve -- Set resolved status for thread (called from `handleTitleActionClick` by literal id: `apiHandlers[id]`)
   * @param {TApiHandlerParams} params
   * @return {Promise}
   */
  threadResolve(params) {
    // TODO: Move to Loader/Api?
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
    console.log('[ThreadCommentsHandlers:apiHandlers:threadResolve]: start', {
      resolved,
      currResolved,
      threadId,
      thread,
      params,
      threadsHash,
    });
    debugger;
    ThreadCommentsLoader.threadResolveRequest({ threadId, resolved })
      .then(() => {
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
          params,
        });
        // eslint-disable-next-line no-debugger
        debugger;
        // Store & display error...
        ThreadCommentsStates.setError(error);
        commonNotify.showError(error);
      });
  },

  /** threadResolve -- Set resolved status for thread (called from `handleTitleActionClick` by literal id: `apiHandlers[id]`)
   * @param {TApiHandlerParams} _params
   * @return {Promise}
   */
  addNewThread(_params) {
    const { role } = ThreadCommentsData;
    // Check roles...
    if (role !== 'editors' && role !== 'reviewers') {
      const error = new Error(`This role (${role}) hasn't allowed to add threads`);
      // eslint-disable-next-line no-console
      console.warn('[ThreadCommentsHandlers:addNewThread]', error);
      commonNotify.showError(error);
      return;
    }
    const commentModalDialog = new CommentModalDialog();
    // Show comment text form modal first and wait for user action...
    return commentModalDialog
      .promiseCommentModal({ title: 'Add new thread', useName: true })
      .then((userAction) => {
        if (!userAction) {
          // Comment edition canceled
          throw undefined;
        }
        // Make api request...
        const { comment, name } = userAction;
        return ThreadCommentsLoader.addNewThreadRequest(name, comment);
      })
      .then((/** @type {TThreadCommentsResponseData | undefined} */ json) => {
        console.log('[ThreadCommentsHandlers:addNewThread] success', {
          json,
        });
        ThreadCommentsPrepare.addNewThreadData(json);
      })
      .catch((error) => {
        // Undefined eror is possible if user hasn't provided data or canceled mdal dialog
        if (error) {
          // eslint-disable-next-line no-console
          console.error('[ThreadCommentsHandlers:addNewThread] catched', error);
          // eslint-disable-next-line no-debugger
          debugger;
          // Store & display error...
          ThreadCommentsStates.setError(error);
          commonNotify.showError(error);
        }
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
    /** @type {string | undefined} */
    const threadIdValue = threadNode && threadNode.getAttribute('data-thread-id');
    /** @type {TThreadId | undefined} */
    const threadId = threadIdValue != undefined ? Number(threadIdValue) : undefined;
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
        // eslint-disable-next-line no-console
        console.error('[ThreadCommentsHandlers:handleTitleActionClick]', error);
        // eslint-disable-next-line no-debugger
        debugger;
        throw error;
      }
      console.log('[ThreadCommentsHandlers:handleTitleActionClick]', actionId, {
        actionId,
        func,
        node,
        event,
        // isThreadAction,
        threadNode,
        threadId,
      });
      func(params);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[ThreadCommentsHandlers:handleTitleActionClick] error', error);
      // eslint-disable-next-line no-debugger
      debugger;
    }
  },

  /**
   * @param {MouseEvent} event
   */
  handleExpandThread(event) {
    const target = /** @type {HTMLElement} */ (event.target);
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

  expandAllThreads() {
    const threadsListNode = ThreadCommentsNodes.getThreadsListNode();
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
    /* console.log('[ThreadCommentsHandlers:expandAllThreads]', {
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

  /** Load records data
   * @return {Promise}
   */
  loadComments() {
    return ThreadCommentsLoader.loadCommentsRequest()
      .then((json) => {
        console.log('[ThreadCommentsHandlers:loadComments]: got data', {
          json,
        });
        ThreadCommentsPrepare.updateAllData(json);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('[ThreadCommentsHandlers:loadComments]: error (catched)', {
          error,
        });
        // eslint-disable-next-line no-debugger
        debugger;
        // Store & display error...
        ThreadCommentsStates.setError(error);
        commonNotify.showError(error);
      });
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
