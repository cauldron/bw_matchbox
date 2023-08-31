// @ts-check

import * as CommonHelpers from '../../common/CommonHelpers.js';

import { CommentsPageData } from './CommentsPageData.js';
import { CommentsPageHelpers } from './CommentsPageHelpers.js';
import { CommentsPageStates } from './CommentsPageStates.js';

export const CommentsPageHandlers = /** @lends CommentsPageHandlers */ {
  __id: 'CommentsPageHandlers',

  /** @type {TThreadComments} */
  threadComments: undefined,

  /**
   * @param {HTMLSelectElement} node
   */
  handleFilterByUserChange(node) {
    const values = CommentsPageHelpers.getMultipleSelectValues(node);
    CommentsPageStates.setFilterByUsers(values);
  },

  /**
   * @param {HTMLSelectElement} node
   */
  handleFilterByProcessChange(node) {
    const values = CommentsPageHelpers.getMultipleSelectValues(node).map(Number);
    /* console.log('[CommentsPageHandlers:handleFilterByProcessChange]', {
     *   values,
     * });
     */
    CommentsPageStates.setFilterByProcesses(values);
  },

  /**
   * @param {HTMLInputElement} node
   */
  handleFilterByStateChange(node) {
    const value = /** @type {TThreadCommentsFilterByState} */ (node.value);
    /* console.log('[CommentsPageHandlers:handleFilterByStateChange]', {
     *   value,
     * });
     */
    CommentsPageStates.setFilterByState(value);
  },

  /**
   * @param {HTMLInputElement} node
   */
  handleSortThreadsReversedChange(node) {
    const { checked: value } = node;
    /* console.log('[CommentsPageHandlers:handleSortThreadsChange]', {
     *   value,
     * });
     */
    CommentsPageStates.setSortThreadsReversed(value);
  },

  /**
   * @param {HTMLInputElement} node
   */
  handleSortThreadsByChange(node) {
    const { value } = node;
    /* console.log('[CommentsPageHandlers:handleSortThreadsByChange]', {
     *   value,
     * });
     */
    CommentsPageStates.setSortThreadsBy(value);
  },

  /** Reset `filterByState` filter
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
   */
  resetFilterByState(opts = {}) {
    const filterByStateNode = /** @type {HTMLInputElement} */ (
      document.getElementById('filterByState')
    );
    const { defaultViewParams } = CommentsPageData;
    const { filterByState: value } = defaultViewParams;
    filterByStateNode.value = value;
    CommentsPageStates.setFilterByState(value, opts);
  },

  /** Reset `filterByUsers` filter
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
   */
  resetFilterByUsers(opts = {}) {
    const filterByUsersNode = /** @type {HTMLSelectElement} */ (
      document.getElementById('filterByUsers')
    );
    const { defaultViewParams } = CommentsPageData;
    const { filterByUsers: values } = defaultViewParams;
    CommonHelpers.setMultipleSelectValues(filterByUsersNode, values);
    CommentsPageStates.setFilterByUsers(values, opts);
  },

  /** Reset `filterByProcesses` filter
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
   */
  resetFilterByProcesses(opts = {}) {
    const filterByProcessesNode = /** @type {HTMLSelectElement} */ (
      document.getElementById('filterByProcesses')
    );
    const { defaultViewParams } = CommentsPageData;
    const { filterByProcesses: values } = defaultViewParams;
    CommonHelpers.setMultipleSelectValues(filterByProcessesNode, values);
    CommentsPageStates.setFilterByProcesses(values.map(Number), opts);
  },

  handleFilterByMyThreads() {
    const rootNode = document.getElementById('comments-root');
    const isFilterByMyThreads = rootNode.classList.contains('filterByMyThreads');
    CommentsPageStates.setFilterByMyThreads(!isFilterByMyThreads);
  },

  /** Reset `filterByMyThreads` filter
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
   */
  resetFilterByMyThreads(opts = {}) {
    const { defaultViewParams } = CommentsPageData;
    const { filterByMyThreads: value } = defaultViewParams;
    CommentsPageStates.setFilterByMyThreads(value, opts);
  },

  /** Reset all the filters to default values
   */
  handleResetFilters() {
    const commonOpts = { omitUpdate: true };
    this.resetFilterByState(commonOpts);
    this.resetFilterByUsers(commonOpts);
    this.resetFilterByProcesses(commonOpts);
    this.resetFilterByMyThreads(commonOpts);
    this.threadComments.api.updateVisibleThreads();
  },

  handleExpandAllThreads() {
    this.threadComments.api.expandAllThreads();
  },

  /** @param {TCommentsPageInitParams} initParams */
  start(initParams) {
    const { handlers, threadComments } = initParams;
    // Save paraemeters...
    this.threadComments = threadComments;
    // Export all methods as external handlers...
    const propNames = Object.keys(this);
    propNames.forEach((key) => {
      const fn = this[key];
      if (typeof fn === 'function' && key !== 'start') {
        handlers[key] = fn.bind(this);
      }
    });
  },
};
