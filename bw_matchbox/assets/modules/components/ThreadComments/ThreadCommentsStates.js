// @ts-check

import { ThreadCommentsData } from './ThreadCommentsData.js';
import { ThreadCommentsRender } from './ThreadCommentsRender.js';
import { ThreadCommentsHelpers } from './ThreadCommentsHelpers.js';
import { ThreadCommentsNodes } from './ThreadCommentsNodes.js';

export const ThreadCommentsStates = {
  /** @type {TSharedHandlers} */
  handlers: undefined,

  /** @type {TEvents} */
  events: undefined,

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
      ThreadCommentsRender.updateVisibleThreads();
    }
  },

  /**
   * @param {string[]} values
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
   */
  setFilterByProcesses(values, opts = {}) {
    console.log('[ThreadCommentsStates:setFilterByProcesses]', {
      values,
    });
    debugger;
    ThreadCommentsData.filterByProcesses = values;
    if (!opts.omitUpdate) {
      ThreadCommentsRender.updateVisibleThreads();
    }
  },

  /**
   * @param {TFilterByState} value
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
   */
  setFilterByState(value, opts = {}) {
    ThreadCommentsData.filterByState = value;
    if (!opts.omitUpdate) {
      ThreadCommentsRender.updateVisibleThreads();
    }
  },

  /**
   * @param {boolean} value
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
   */
  setSortThreadsReversedChange(value, opts = {}) {
    const { threads } = ThreadCommentsData;
    ThreadCommentsData.sortThreadsReversed = value;
    // Re-sort threads...
    ThreadCommentsHelpers.sortThreads(threads);
    /* // NOTE: Don't need to re-sort comments
     * comments.sort(ThreadCommentsHelpers.sortCommentsCompare);
     */
    if (!opts.omitUpdate) {
      // Re-render all threads...
      ThreadCommentsRender.renderData();
    }
  },

  /**
   * @param {TFilterByState} value
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
   */
  setSortThreadsByChange(value, opts = {}) {
    const { threads } = ThreadCommentsData;
    ThreadCommentsData.sortThreadsBy = value;
    // Re-sort threads...
    ThreadCommentsHelpers.sortThreads(threads);
    /* // NOTE: Don't need to re-sort comments
     * comments.sort(ThreadCommentsHelpers.sortCommentsCompare);
     */
    if (!opts.omitUpdate) {
      // Re-render all threads...
      ThreadCommentsRender.renderData();
    }
  },

  /**
   * @param {boolean} value
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
   */
  setFilterByMyThreads(value, opts = {}) {
    ThreadCommentsData.filterByMyThreads = value;
    const filterByMyThreadsNode = document.getElementById('filterByMyThreads');
    filterByMyThreadsNode.classList.toggle('button-primary', !!value);
    // TODO: Update root state?
    const rootNode = ThreadCommentsNodes.getRootNode();
    rootNode.classList.toggle('filterByMyThreads', !!value);
    if (!opts.omitUpdate) {
      ThreadCommentsRender.updateVisibleThreads();
      // ThreadCommentsRender.rerenderAllVisibleComments(); // Could be used if will filter particular comments
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

  /** setError -- Shorthand for `setHasData`
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
    ThreadCommentsRender.renderError(error);
    this.events.emit('error', error);
  },

  clearData() {
    this.setHasData(false);
    ThreadCommentsRender.clearRenderedData();
  },

  /** @param {TThreadCommentsInitParams} initParams */
  init(initParams) {
    const { events, handlers } = initParams;
    this.events = events;
    this.handlers = handlers;
    // TODO: Update all the dynamic parameters...
  },
};
