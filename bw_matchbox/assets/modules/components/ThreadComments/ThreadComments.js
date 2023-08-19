// @ts-check

import { ThreadCommentsNodes } from './ThreadCommentsNodes.js';
import { ThreadCommentsData } from './ThreadCommentsData.js';
import { ThreadCommentsInit } from './ThreadCommentsInit.js';
import { ThreadCommentsStates } from './ThreadCommentsStates.js';
import { ThreadCommentsRender } from './ThreadCommentsRender.js';
import { ThreadCommentsHandlers } from './ThreadCommentsHandlers.js';

export class ThreadComments {
  /** @type {ThreadCommentsInit} */
  threadCommentsInit = undefined;

  /** Technical (debug) id
   * @type {string}
   */
  thisId = 'ThreadComments';

  /** @type {TSharedHandlers} */
  handlers = {};

  /** @type {TEvents} */
  events = undefined;

  // TODO: handlers, state, data, events

  /** External API...
   * @type {TThreadCommentsApi}
   */
  api = {
    getComments() {
      return ThreadCommentsData.comments;
    },
    getThreads() {
      return ThreadCommentsData.threads;
    },
    getCommentsHash() {
      return ThreadCommentsData.commentsHash;
    },
    getThreadsHash() {
      return ThreadCommentsData.threadsHash;
    },
    getCommentsByThreads() {
      return ThreadCommentsData.commentsByThreads;
    },
    getUsers() {
      return ThreadCommentsData.users;
    },
    getProcessIds() {
      return ThreadCommentsData.processIds;
    },
    getProcessesHash() {
      return ThreadCommentsData.processesHash;
    },
    updateVisibleThreads() {
      return ThreadCommentsRender.updateVisibleThreads();
    },
    setFilterByUsers(values, opts) {
      return ThreadCommentsStates.setFilterByUsers(values, opts);
    },
    setFilterByProcesses(values, opts) {
      return ThreadCommentsStates.setFilterByProcesses(values, opts);
    },
    setFilterByState(value, opts) {
      return ThreadCommentsStates.setFilterByState(value, opts);
    },
    setSortThreadsReversed(value, opts) {
      return ThreadCommentsStates.setSortThreadsReversed(value, opts);
    },
    setSortThreadsBy(value, opts) {
      return ThreadCommentsStates.setSortThreadsBy(value, opts);
    },
    setFilterByMyThreads(value, opts) {
      return ThreadCommentsStates.setFilterByMyThreads(value, opts);
    },
    resetFilters() {
      return ThreadCommentsHandlers.resetFilters();
    },
    expandAllThreads() {
      return ThreadCommentsHandlers.expandAllThreads();
    },
    getDefaultViewParams() {
      return ThreadCommentsData.defaultViewParams;
    },
  };

  /** @param {string} parentId */
  constructor(parentId) {
    if (parentId) {
      const thisId = [parentId, 'ThreadComments'].filter(Boolean).join('_');
      this.thisId = thisId;
    }
    const { handlers } = this;
    this.threadCommentsInit = new ThreadCommentsInit({ handlers, parentId: this.thisId });
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

  /** @param {TThreadCommentsParams} params
   */
  setParams(params) {
    const {
      // Parameters..
      rootNode,
      currentUser,
      role,
      noTableau,
      noLoader,
      noError,
    } = params;
    ThreadCommentsNodes.setRootNode(rootNode);
    ThreadCommentsStates.setRole(role);
    ThreadCommentsData.currentUser = currentUser;
    rootNode.classList.toggle('noTableau', !!noTableau);
    rootNode.classList.toggle('noLoader', !!noLoader);
    rootNode.classList.toggle('noError', !!noError);
  }
}
