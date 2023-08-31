import { CommentsPageData } from './CommentsPageData.js';
import { CommentsPageDataRender } from './CommentsPageDataRender.js';
import { CommentsPageNodes } from './CommentsPageNodes.js';

export const CommentsPageStates = {
  __id: 'CommentsPageStates',

  /** @type {TThreadComments} */
  threadComments: undefined,

  updateViewParamsFromThreadComments() {
    const defaultViewParams = this.threadComments.api.getDefaultViewParams();
    CommentsPageData.defaultViewParams = defaultViewParams;
    Object.keys(defaultViewParams).forEach((key) => {
      const value = defaultViewParams[key];
      CommentsPageData[key] = Array.isArray(value) ? [...value] : value;
    });
  },

  setLoading(isLoading) {
    // Set css class for id="processes-list-root" --> loading, set local status
    const rootNode = CommentsPageNodes.getRootNode();
    rootNode.classList.toggle('loading', isLoading);
    CommentsPageData.isLoading = isLoading;
  },

  setHasData(hasData) {
    // Set css class for root node, update local state
    const rootNode = CommentsPageNodes.getRootNode();
    rootNode.classList.toggle('empty', !hasData);
    CommentsPageData.hasData = hasData;
  },

  /**
   * @param {string[]} values
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
   */
  setFilterByUsers(values, opts = {}) {
    /* console.log('[CommentsPageStates:setFilterByUsers]', {
     *   values,
     * });
     */
    // CommentsPageData.filterByUsers = values;
    this.threadComments.api.setFilterByUsers(values, opts);
  },

  /**
   * @param {TProcessId[]} values
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
   */
  setFilterByProcesses(values, opts = {}) {
    /* console.log('[CommentsPageStates:setFilterByProcesses]', {
     *   values,
     * });
     */
    // CommentsPageData.filterByProcesses = values;
    this.threadComments.api.setFilterByProcesses(values, opts);
  },

  /**
   * @param {TThreadCommentsFilterByState} value
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
   */
  setFilterByState(value, opts = {}) {
    // CommentsPageData.filterByState = value;
    this.threadComments.api.setFilterByState(value, opts);
  },

  /**
   * @param {boolean} value
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
   */
  setSortThreadsReversed(value, opts = {}) {
    // CommentsPageData.sortThreadsReversed = value;
    this.threadComments.api.setSortThreadsReversed(value, opts);
  },

  /**
   * @param {string} value
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
   */
  setSortThreadsBy(value, opts = {}) {
    CommentsPageData.sortThreadsBy = value;
    this.threadComments.api.setSortThreadsBy(value, opts);
  },

  /**
   * @param {boolean} value
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
   */
  setFilterByMyThreads(value, opts = {}) {
    // CommentsPageData.filterByMyThreads = value;
    this.threadComments.api.setFilterByMyThreads(value, opts);
    const filterByMyThreadsNode = document.getElementById('filterByMyThreads');
    filterByMyThreadsNode.classList.toggle('button-primary', !!value);
    const rootNode = CommentsPageNodes.getRootNode();
    rootNode.classList.toggle('filterByMyThreads', !!value);
  },

  setTotalCommentsCount(totalComments) {
    CommentsPageData.totalComments = totalComments;
    /* // TODO?
     * const rootNode = CommentsPageNodes.getRootNode();
     * const elems = rootNode.querySelectorAll('#total-comments-number');
     * elems.forEach((node) => {
     *   node.innerHTML = String(totalComments);
     * });
     */
  },

  setTotalThreadsCount(totalThreads) {
    CommentsPageData.totalThreads = totalThreads;
    /* // Set css class for root node, update local state
     * const rootNode = ThreadsNodes.getRootNode();
     * const elems = rootNode.querySelectorAll('#total-threads-number');
     * elems.forEach((node) => {
     *   node.innerHTML = String(totalThreads);
     * });
     */
  },

  // setEmpty -- Shorthand for `setHasData`
  setEmpty(isEmpty) {
    this.setHasData(!isEmpty);
  },

  setError(error) {
    CommentsPageData.isError = !!error;
    CommentsPageData.error = error;
    CommentsPageDataRender.renderError(error);
  },

  clearData() {
    this.setHasData(false);
    CommentsPageDataRender.clearRenderedData();
  },

  /** @param {TCommentsPageInitParams} initParams */
  start(initParams) {
    const { handlers, threadComments } = initParams;
    this.threadComments = threadComments;
    // Add all methods as bound handlers...
    Object.keys(this).forEach((key) => {
      const cb = this[key];
      if (cb && typeof cb === 'function' && key !== 'start') {
        if (handlers[key]) {
          const error = new Error('Doubled handler: ' + key);
          // eslint-disable-next-line no-console
          console.error('[CommentsPageStates:start] init handlers error', error);
          // eslint-disable-next-line no-debugger
          debugger;
          throw error;
        }
        handlers[key] = cb.bind(this);
      }
    });
  },
};
