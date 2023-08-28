// @ts-check

// Import types only...
/* eslint-disable no-unused-vars */
import { ThreadCommentsRender } from './ThreadCommentsRender.js';
/* eslint-enable no-unused-vars */

import { ThreadCommentsData } from './ThreadCommentsData.js';
import { ThreadCommentsHelpers } from './ThreadCommentsHelpers.js';
import { ThreadCommentsNodes } from './ThreadCommentsNodes.js';

export const ThreadCommentsStates = {
  /** @type {TSharedHandlers} */
  handlers: undefined,

  /** @type {TEvents} */
  events: undefined,

  /** @type {ThreadCommentsRender} */
  threadCommentsRender: undefined,
  // [>* @type {ThreadCommentsNodes} <]
  // threadCommentsNodes: undefined,
  // [>* @type {ThreadCommentsStates} <]
  // threadCommentsStates: undefined,
  // [>* @type {ThreadCommentsHandlers} <]
  // threadCommentsHandlers: undefined,
  // [>* @type {ThreadCommentsPrepare} <]
  // threadCommentsPrepare: undefined,

  /**
   * @param {boolean} isLoading
   */
  setLoading(isLoading) {
    // Set css class for id="processes-list-root" --> loading, set local status
    const rootNode = ThreadCommentsNodes.getRootNode();
    rootNode.classList.toggle('loading', isLoading);
    ThreadCommentsData.isLoading = isLoading;
    this.events.emit('loading', isLoading);
  },

  /**
   * @param {boolean} hasData
   */
  setHasData(hasData) {
    // Set css class for root node, update local state
    const rootNode = ThreadCommentsNodes.getRootNode();
    rootNode.classList.toggle('empty', !hasData);
    ThreadCommentsData.hasData = hasData;
    this.events.emit('hasData', hasData);
  },

  /**
   * @param {string} role
   */
  setRole(role) {
    const rootNode = ThreadCommentsNodes.getRootNode();
    if (ThreadCommentsData.role && ThreadCommentsData.role !== role) {
      rootNode.classList.toggle('role-' + ThreadCommentsData.role, false);
    }
    if (role) {
      rootNode.classList.toggle('role-' + role, true);
    }
    ThreadCommentsData.role = role;
  },

  /**
   * @param {string[]} values
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
   */
  setFilterByUsers(values, opts = {}) {
    /* console.log('[ThreadCommentsStates:setFilterByUsers]', {
     *   values,
     * });
     */
    ThreadCommentsData.filterByUsers = values;
    if (!opts.omitUpdate) {
      this.threadCommentsRender.updateVisibleThreads();
    }
  },

  /**
   * @param {TProcessId[]} values
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
   */
  setFilterByProcesses(values, opts = {}) {
    ThreadCommentsData.filterByProcesses = values;
    if (!opts.omitUpdate) {
      this.threadCommentsRender.updateVisibleThreads();
    }
  },

  /**
   * @param {TThreadCommentsFilterByState} value
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
   */
  setFilterByState(value, opts = {}) {
    ThreadCommentsData.filterByState = value;
    if (!opts.omitUpdate) {
      this.threadCommentsRender.updateVisibleThreads();
    }
  },

  /**
   * @param {boolean} value
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
   */
  setSortThreadsReversed(value, opts = {}) {
    const { threads } = ThreadCommentsData;
    ThreadCommentsData.sortThreadsReversed = value;
    // Re-sort threads...
    ThreadCommentsHelpers.sortThreads(threads);
    /* // NOTE: Don't need to re-sort comments
     * comments.sort(ThreadCommentsHelpers.sortCommentsCompare);
     */
    if (!opts.omitUpdate) {
      // Re-render all threads...
      this.threadCommentsRender.renderData();
    }
  },

  /**
   * @param {TThreadCommentsSortThreadsBy} value
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
   */
  setSortThreadsBy(value, opts = {}) {
    // Normalize value to `TThreadCommentsSortModes` list...
    if (typeof value === 'string') {
      if (value.includes('|')) {
        value = /** @type {TThreadCommentsSortModes } */ (value.split('|'));
      } else {
        value = [value];
      }
    }
    const { threads } = ThreadCommentsData;
    ThreadCommentsData.sortThreadsBy = value;
    // Re-sort threads...
    ThreadCommentsHelpers.sortThreads(threads);
    /* // NOTE: Don't need to re-sort comments
     * comments.sort(ThreadCommentsHelpers.sortCommentsCompare);
     */
    if (!opts.omitUpdate) {
      // Re-render all threads...
      this.threadCommentsRender.renderData();
    }
  },

  /**
   * @param {boolean} value
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
   */
  setFilterByMyThreads(value, opts = {}) {
    ThreadCommentsData.filterByMyThreads = value;
    if (!opts.omitUpdate) {
      this.threadCommentsRender.updateVisibleThreads();
      // this.threadCommentsRender.rerenderAllVisibleComments(); // Could be used if will filter particular comments
    }
  },

  /**
   * @param {number} totalComments
   */
  setTotalCommentsCount(totalComments) {
    ThreadCommentsData.totalComments = totalComments;
    /* // TODO?
     * const rootNode = ThreadCommentsNodes.getRootNode();
     * const elems = rootNode.querySelectorAll('#total-comments-number');
     * elems.forEach((node) => {
     *   node.innerHTML = String(totalComments);
     * });
     */
    this.events.emit('totalCommentsCount', totalComments);
  },

  /**
   * @param {number} totalThreads
   */
  setTotalThreadsCount(totalThreads) {
    ThreadCommentsData.totalThreads = totalThreads;
    /* // Set css class for root node, update local state
     * const rootNode = ThreadsNodes.getRootNode();
     * const elems = rootNode.querySelectorAll('#total-threads-number');
     * elems.forEach((node) => {
     *   node.innerHTML = String(totalThreads);
     * });
     */
    this.events.emit('totalThreadsCount', totalThreads);
  },

  /** setEmpty -- Shorthand for `setHasData`
   * @param {boolean} isEmpty
   */
  setEmpty(isEmpty) {
    this.setHasData(!isEmpty);
  },

  /**
   * @param {Error} error
   */
  setError(error) {
    ThreadCommentsData.isError = !!error;
    ThreadCommentsData.error = error;
    this.threadCommentsRender.renderError(error);
    this.events.emit('error', error);
  },

  clearData() {
    this.setHasData(false);
    this.threadCommentsRender.clearRenderedData();
  },

  /** @param {TThreadCommentsInitParams} initParams */
  init(initParams) {
    const { events, handlers, threadCommentsRender } = initParams;
    this.events = events;
    this.handlers = handlers;
    this.threadCommentsRender = threadCommentsRender;
    // TODO: Update all the dynamic parameters...
  },
};
