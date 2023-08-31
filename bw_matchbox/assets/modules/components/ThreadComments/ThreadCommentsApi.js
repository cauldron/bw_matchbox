// @ts-check

// Import types only...
/* eslint-disable no-unused-vars */
import { ThreadCommentsData } from './ThreadCommentsData.js';
import { ThreadCommentsHandlers } from './ThreadCommentsHandlers.js';
import { ThreadCommentsStates } from './ThreadCommentsStates.js';
import { ThreadCommentsRender } from './ThreadCommentsRender.js';
/* eslint-enable no-unused-vars */

/* External API (alternate way, basic handlers are in `handlers` object (above)...
 * @implements {TThreadCommentsApi}
 */
export class ThreadCommentsApi {
  /** @type {ThreadCommentsData} */
  threadCommentsData;
  /** @type {ThreadCommentsHandlers} */
  threadCommentsHandlers;
  /** @type {ThreadCommentsStates} */
  threadCommentsStates;
  /** @type {ThreadCommentsRender} */
  threadCommentsRender;

  /**
   * @param {object} params
   * @param {ThreadCommentsData} params.threadCommentsData
   * @param {ThreadCommentsHandlers} params.threadCommentsHandlers
   * @param {ThreadCommentsStates} params.threadCommentsStates
   * @param {ThreadCommentsRender} params.threadCommentsRender
   */
  constructor(params) {
    const {
      // prettier-ignore
      threadCommentsData,
      threadCommentsHandlers,
      threadCommentsStates,
      threadCommentsRender,
    } = params;
    this.threadCommentsData = threadCommentsData;
    this.threadCommentsHandlers = threadCommentsHandlers;
    this.threadCommentsStates = threadCommentsStates;
    this.threadCommentsRender = threadCommentsRender;
  }

  getComments() {
    return this.threadCommentsData.comments;
  }
  getThreads() {
    return this.threadCommentsData.threads;
  }
  getCommentsHash() {
    return this.threadCommentsData.commentsHash;
  }
  getThreadsHash() {
    return this.threadCommentsData.threadsHash;
  }
  getCommentsByThreads() {
    return this.threadCommentsData.commentsByThreads;
  }
  getUsers() {
    return this.threadCommentsData.users;
  }
  getProcessIds() {
    return this.threadCommentsData.processIds;
  }
  getProcessesHash() {
    return this.threadCommentsData.processesHash;
  }
  updateVisibleThreads() {
    return this.threadCommentsRender.updateVisibleThreads();
  }
  /**
   * @param {TUserName[]} users
   * @param {TThreadCommentsSetFilterOpts} [opts]
   */
  setFilterByUsers(users, opts) {
    return this.threadCommentsStates.setFilterByUsers(users, opts);
  }
  /**
   * @param {number[]} processes
   * @param {TThreadCommentsSetFilterOpts} [opts]
   */
  setFilterByProcesses(processes, opts) {
    return this.threadCommentsStates.setFilterByProcesses(processes, opts);
  }
  /**
   * @param {TThreadCommentsFilterByState} state
   * @param {TThreadCommentsSetFilterOpts} [opts]
   */
  setFilterByState(state, opts) {
    return this.threadCommentsStates.setFilterByState(state, opts);
  }
  /**
   * @param {boolean} value
   * @param {TThreadCommentsSetFilterOpts} [opts]
   */
  setSortThreadsReversed(value, opts) {
    return this.threadCommentsStates.setSortThreadsReversed(value, opts);
  }
  /**
   * @param {TThreadCommentsSortThreadsBy} value
   * @param {TThreadCommentsSetFilterOpts} [opts]
   */
  setSortThreadsBy(value, opts) {
    return this.threadCommentsStates.setSortThreadsBy(value, opts);
  }
  /**
   * @param {boolean} value
   * @param {TThreadCommentsSetFilterOpts} [opts]
   */
  setFilterByMyThreads(value, opts) {
    return this.threadCommentsStates.setFilterByMyThreads(value, opts);
  }
  resetFilters() {
    return this.threadCommentsHandlers.resetFilters();
  }
  expandAllThreads() {
    return this.threadCommentsHandlers.expandAllThreads();
  }
  getDefaultViewParams() {
    return this.threadCommentsData.defaultViewParams;
  }
}
