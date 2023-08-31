// @ts-check

import * as CommonHelpers from '../../common/CommonHelpers.js';
import { commonNotify } from '../../common/CommonNotify.js';

// Import types only...
/* eslint-disable no-unused-vars */
import { ThreadCommentsRender } from './ThreadCommentsRender.js';
/* eslint-enable no-unused-vars */

import { ThreadCommentsData } from './ThreadCommentsData.js';
import { ThreadCommentsHelpers } from './ThreadCommentsHelpers.js';
import { ThreadCommentsLoader } from './ThreadCommentsLoader.js';
import { ThreadCommentsNodes } from './ThreadCommentsNodes.js';
import { ThreadCommentsPrepare } from './ThreadCommentsPrepare.js';
import { ThreadCommentsStates } from './ThreadCommentsStates.js';

import { CommentModalDialog } from './CommentModalDialog.js';

/** @typedef TApiHandlerParams
 * @property {HTMLElement} node
 * @property {HTMLDivElement} threadNode
 * @property {string} actionId
 * @property {TThreadId} threadId
 */

class ApiHandlers {
  /** @type {ThreadCommentsRender} */
  threadCommentsRender;

  /**
   * @param {object} params
   * @param {ThreadCommentsRender} params.threadCommentsRender
   */
  constructor({ threadCommentsRender }) {
    this.threadCommentsRender = threadCommentsRender;
  }

  /** Start adding comment (show comment text dialog
   * @param {TApiHandlerParams} params
   * @return {Promise}
   */
  threadAddComment(params) {
    const { threadId, threadNode } = params;
    const { role } = ThreadCommentsData;
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
          /* // DEBUG
           * const { threadsHash } = ThreadCommentsData;
           * const thread = threadsHash[threadId];
           * console.log('[ThreadCommentsHandlers:threadAddCommentRequest]: done', {
           *   comment,
           *   thread,
           *   threadId,
           * });
           */
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
  }

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
    /* console.log('[ThreadCommentsHandlers:ApiHandlers:threadResolve]: start', {
     *   resolved,
     *   currResolved,
     *   threadId,
     *   thread,
     *   params,
     *   threadsHash,
     * });
     */
    ThreadCommentsLoader.threadResolveRequest({ threadId, resolved })
      .then(() => {
        // Update data...
        thread.resolved = resolved;
        // Update content...
        const threadTitleTextNode = threadNode.querySelector('.title-text');
        const threadTitleTextContent =
          this.threadCommentsRender.helpers.createThreadTitleTextContent(thread);
        /* console.log('[ThreadCommentsHandlers:ApiHandlers:threadResolve]: done', {
         *   resolved,
         *   thread,
         *   threadTitleTextNode,
         *   threadTitleTextContent,
         * });
         */
        // Update data & elements' states...
        threadTitleTextNode.innerHTML = threadTitleTextContent;
        // Update thread node class...
        threadNode.classList.toggle('resolved', resolved);
        // Re-sort and re-show threads...
        const { threads } = ThreadCommentsData;
        ThreadCommentsHelpers.sortThreads(threads);
        this.threadCommentsRender.reorderRenderedThreads();
        this.threadCommentsRender.updateVisibleThreads();
        // Show noitification...
        commonNotify.showSuccess('Thread data successfully updated');
        ThreadCommentsStates.setError(undefined);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('[ThreadCommentsHandlers:ApiHandlers:threadResolve]: error (catched)', {
          error,
          params,
        });
        // eslint-disable-next-line no-debugger
        debugger;
        // Store & display error...
        ThreadCommentsStates.setError(error);
        commonNotify.showError(error);
      });
  }

  /**
   * @return {Promise}
   */
  addNewThread() {
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
        ThreadCommentsPrepare.addNewThreadData(json);
        commonNotify.showSuccess('New thread successfully added');
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
  }
}

export const ThreadCommentsHandlers = /** @lends ThreadCommentsHandlers */ {
  __id: 'ThreadCommentsHandlers',

  /** @type {ThreadCommentsRender} */
  threadCommentsRender: undefined,

  /** @type {ApiHandlers} */
  apiHandlers: undefined,

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
    const isDisabled = node.classList.contains('disabled');
    if (isDisabled) {
      return;
    }
    const func = this.apiHandlers[actionId];
    try {
      if (!func) {
        const error = new Error(`Cannot find api handler for action id '${actionId}'`);
        // eslint-disable-next-line no-console
        console.error('[ThreadCommentsHandlers:handleTitleActionClick]', error);
        // eslint-disable-next-line no-debugger
        debugger;
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
      func.call(this.apiHandlers, params);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[ThreadCommentsHandlers:handleTitleActionClick] error', error);
      // eslint-disable-next-line no-debugger
      debugger;
      commonNotify.showError(error);
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
      this.threadCommentsRender.ensureThreadCommentsReady(threadId);
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
        this.threadCommentsRender.ensureThreadCommentsReady(threadId);
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

  addNewThread() {
    return this.apiHandlers.addNewThread();
  },

  /**
   * @param {TThreadCommentsSortThreadsBy} value
   */
  setSortMode(value) {
    ThreadCommentsStates.setSortThreadsBy(value);
    /* // @see:
     * ThreadCommentsStates.setSortThreadsBy
     * ThreadCommentsStates.setSortThreadsReversed
     */
  },

  /** @param {TThreadCommentsViewParams} viewParams */
  updateViewParams(viewParams) {
    const { defaultViewParams } = ThreadCommentsData;
    const objs = [ThreadCommentsData, defaultViewParams];
    const keys = Object.keys(viewParams);
    /* console.log('[ThreadComments:updateViewParams]', {
     *   keys,
     *   viewParams,
     *   objs,
     * });
     */
    // Set all the params...
    keys.forEach((key) => {
      const val = viewParams[key];
      const setVal = Array.isArray(val) ? [...val] : typeof val === 'object' ? { ...val } : val;
      objs.forEach((obj) => {
        obj[key] = setVal;
      });
    });
  },

  /** @param {TThreadCommentsLoadParams} loadParams */
  updateLoadParams(loadParams) {
    const obj = ThreadCommentsData.loadParams;
    const keys = Object.keys(loadParams);
    /* console.log('[ThreadComments:updateLoadParams]', {
     *   keys,
     *   loadParams,
     *   obj,
     * });
     */
    // Set all the params...
    keys.forEach((key) => {
      const val = loadParams[key];
      const setVal = Array.isArray(val) ? [...val] : typeof val === 'object' ? { ...val } : val;
      obj[key] = setVal;
    });
  },

  /** @param {TThreadCommentsInitParams} initParams */
  init(initParams) {
    const { handlers, threadCommentsRender } = initParams;
    this.threadCommentsRender = threadCommentsRender;
    // Export all methods as external handlers...
    CommonHelpers.exportCallbacksFromObject(handlers, this);
    // Save params...
    this.apiHandlers = new ApiHandlers({ threadCommentsRender });
  },
};
