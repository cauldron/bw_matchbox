// @ts-check

import { ThreadCommentsNodes } from './ThreadCommentsNodes.js';
import { ThreadCommentsData } from './ThreadCommentsData.js';
import { ThreadCommentsInit } from './ThreadCommentsInit.js';
import { ThreadCommentsStates } from './ThreadCommentsStates.js';
import { ThreadCommentsRender } from './ThreadCommentsRender.js';
import { ThreadCommentsHandlers } from './ThreadCommentsHandlers.js';
import { ThreadCommentsPrepare } from './ThreadCommentsPrepare.js';
import { ThreadCommentsApi } from './ThreadCommentsApi.js';

/** @implements {TThreadComments} */
export class ThreadComments {
  /** @type {ThreadCommentsInit} */
  threadCommentsInit = undefined;

  /** Technical (debug) id
   * @type {string}
   */
  thisId = 'ThreadComments';

  /** @type {TSharedHandlers} */
  handlers = {};

  /* @type {ThreadCommentsRender} */
  threadCommentsRender = new ThreadCommentsRender();

  /** @type {TEvents} */
  events = undefined;

  // TODO: state, data?

  /** External API (alternate way, basic handlers are in `handlers` object (above)...
   * @type {TThreadCommentsApi}
   */
  api;

  /** @param {string} parentId */
  constructor(parentId) {
    if (parentId) {
      const thisId = [parentId, 'ThreadComments'].filter(Boolean).join('_');
      this.thisId = thisId;
    }
    const threadCommentsApi = new ThreadCommentsApi({
      threadCommentsData: ThreadCommentsData,
      threadCommentsHandlers: ThreadCommentsHandlers,
      threadCommentsRender: this.threadCommentsRender,
      threadCommentsStates: ThreadCommentsStates,
      // threadCommentsNodes: ThreadCommentsNodes,
      // threadCommentsPrepare: ThreadCommentsPrepare,
    });
    this.api = threadCommentsApi;
    const { handlers } = this;
    this.threadCommentsInit = new ThreadCommentsInit({
      handlers,
      parentId: this.thisId,
      threadCommentsRender: this.threadCommentsRender,
      threadCommentsNodes: ThreadCommentsNodes,
      threadCommentsStates: ThreadCommentsStates,
      threadCommentsHandlers: ThreadCommentsHandlers,
      threadCommentsPrepare: ThreadCommentsPrepare,
    });
    this.events = this.threadCommentsInit.events();
  }

  /** Ensure the modal has initiazlized
   * @return {Promise}
   */
  ensureInit() {
    return this.threadCommentsInit.ensureInit();
  }

  /** Initialize the longest things (loading external css styles)
   */
  preInit() {
    return this.threadCommentsInit.preInit();
  }

  /** Should be called before initalization
   * @param {TThreadCommentsParams} params
   */
  setParams(params) {
    const {
      // Parameters..
      rootNode,
      currentProcess,
      currentUser,
      role,
      noTableau,
      noLoader,
      noError,
      noActions,
      disableAddNewThread,
      disableAddThreadComment,
      disableThreadResolve,
      disableResolveByNonReporters,
      hideDisabledTitleActions,
    } = params;
    ThreadCommentsNodes.setRootNode(rootNode);
    ThreadCommentsStates.setRole(role);
    ThreadCommentsData.currentProcess = currentProcess; // Optional
    ThreadCommentsData.currentUser = currentUser;
    ThreadCommentsData.disableResolveByNonReporters = disableResolveByNonReporters;
    ThreadCommentsData.hideDisabledTitleActions = hideDisabledTitleActions;
    // TODO: To duplicate those properties in the state?
    rootNode.classList.toggle('noTableau', !!noTableau);
    rootNode.classList.toggle('noLoader', !!noLoader);
    rootNode.classList.toggle('noError', !!noError);
    rootNode.classList.toggle('noActions', !!noActions);
    rootNode.classList.toggle('disableAddNewThread', !!disableAddNewThread);
    rootNode.classList.toggle('disableAddThreadComment', !!disableAddThreadComment);
    rootNode.classList.toggle('disableThreadResolve', !!disableThreadResolve);
  }
}
