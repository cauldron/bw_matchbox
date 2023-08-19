import { CommentsPageData } from './CommentsPageData.js';
import { CommentsPageDataRender } from './CommentsPageDataRender.js';
import { CommentsPageHelpers } from './CommentsPageHelpers.js';
import { CommentsPageNodes } from './CommentsPageNodes.js';

export const CommentsPageStates = {
  __id: 'CommentsPageStates',

  /** @type {TThreadComments} */
  threadComments: undefined,

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
   * @param {string[]} values
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
   * @param {TFilterByState} value
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
   */
  setFilterByState(value, opts = {}) {
    CommentsPageData.filterByState = value;
    if (!opts.omitUpdate) {
      // CommentsPageDataRender.updateVisibleThreads();
      this.threadComments.api.updateVisibleThreads();
    }
  },

  /**
   * @param {boolean} value
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
   */
  setSortThreadsReversedChange(value, opts = {}) {
    const { threads } = CommentsPageData;
    CommentsPageData.sortThreadsReversed = value;
    // Re-sort threads...
    CommentsPageHelpers.sortThreads(threads);
    /* // NOTE: Don't need to re-sort comments
     * comments.sort(CommentsPageHelpers.sortCommentsCompare);
     */
    if (!opts.omitUpdate) {
      // Re-render all threads...
      CommentsPageDataRender.renderData();
    }
  },

  /**
   * @param {TFilterByState} value
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
   */
  setSortThreadsByChange(value, opts = {}) {
    const { threads } = CommentsPageData;
    CommentsPageData.sortThreadsBy = value;
    // Re-sort threads...
    CommentsPageHelpers.sortThreads(threads);
    /* // NOTE: Don't need to re-sort comments
     * comments.sort(CommentsPageHelpers.sortCommentsCompare);
     */
    if (!opts.omitUpdate) {
      // Re-render all threads...
      CommentsPageDataRender.renderData();
    }
  },

  /**
   * @param {boolean} value
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
   */
  setFilterByMyThreads(value, opts = {}) {
    CommentsPageData.filterByMyThreads = value;
    const filterByMyThreadsNode = document.getElementById('filterByMyThreads');
    filterByMyThreadsNode.classList.toggle('button-primary', !!value);
    const rootNode = CommentsPageNodes.getRootNode();
    rootNode.classList.toggle('filterByMyThreads', !!value);
    if (!opts.omitUpdate) {
      // CommentsPageDataRender.updateVisibleThreads();
      this.threadComments.api.updateVisibleThreads();
      // CommentsPageDataRender.rerenderAllVisibleComments(); // Could be used if will filter and particular comments also
    }
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

  // setError -- Shorthand for `setHasData`
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

  start(params) {
    const { handlers, threadComments } = params;
    this.threadComments = threadComments;
    // Addd all methods as bound handlers...
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
