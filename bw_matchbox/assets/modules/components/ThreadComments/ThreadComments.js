// @ts-check

import { ThreadCommentsNodes } from './ThreadCommentsNodes.js';
import { ThreadCommentsData } from './ThreadCommentsData.js';
import { ThreadCommentsInit } from './ThreadCommentsInit.js';
import { ThreadCommentsStates } from './ThreadCommentsStates.js';
import { ThreadCommentsRender } from './ThreadCommentsRender.js';

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
    /** @return {TComment[]} */
    getComments() {
      return ThreadCommentsData.comments;
    },
    /** @return {TThread[]} */
    getThreads() {
      return ThreadCommentsData.threads;
    },
    /** @return {Record<TThreadId, TComment>} */
    getCommentsHash() {
      return ThreadCommentsData.commentsHash;
    },
    /** @return {Record<TThreadId, TThread>} */
    getThreadsHash() {
      return ThreadCommentsData.threadsHash;
    },
    /** @return {Record<TThreadId, TCommentId[]>} */
    getCommentsByThreads() {
      return ThreadCommentsData.commentsByThreads;
    },
    /** @return {TUserName[]} */
    getUsers() {
      return ThreadCommentsData.users;
    },
    /** @return {TProcessId[]} */
    getProcessIds() {
      return ThreadCommentsData.processIds;
    },
    /** @return {Record<TProcessId, TProcess>} */
    getProcessesHash() {
      return ThreadCommentsData.processesHash;
    },
    updateVisibleThreads() {
      return ThreadCommentsRender.updateVisibleThreads();
    },
    setFilterByUsers(values) {
      return ThreadCommentsStates.setFilterByUsers(values);
    },
    setFilterByProcesses(values) {
      return ThreadCommentsStates.setFilterByProcesses(values);
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
    ThreadCommentsNodes.setRootNode(params.rootNode);
    ThreadCommentsStates.setRole(params.role);
    ThreadCommentsData.currentUser = params.currentUser;
  }
}
