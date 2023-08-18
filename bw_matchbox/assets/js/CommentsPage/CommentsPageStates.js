modules.define(
  'CommentsPageStates',
  [
    // Required modules...
    // 'CommentsPageConstants',
    'CommentsPageHelpers',
    'CommentsPageData',
    'CommentsPageDataRender',
    'CommentsPageNodes',
  ],
  function provide_CommentsStates(
    provide,
    // Resolved modules...
    // CommentsPageConstants,
    CommentsPageHelpers,
    CommentsPageData,
    CommentsPageDataRender,
    CommentsPageNodes,
  ) {
    /** @exports CommentsPageStates
     */
    const CommentsPageStates = {
      __id: 'CommentsPageStates',

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
        CommentsPageData.filterByUsers = values;
        if (!opts.omitUpdate) {
          CommentsPageDataRender.updateVisibleThreads();
        }
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
        CommentsPageData.filterByProcesses = values;
        if (!opts.omitUpdate) {
          CommentsPageDataRender.updateVisibleThreads();
        }
      },

      /**
       * @param {TFilterByState} value
       * @param {object} [opts]
       * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
       */
      setFilterByState(value, opts = {}) {
        CommentsPageData.filterByState = value;
        if (!opts.omitUpdate) {
          CommentsPageDataRender.updateVisibleThreads();
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
          CommentsPageDataRender.updateVisibleThreads();
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

      getRadioGroupValue(groupId) {
        const elem = document.querySelector('input[type="radio"][name="' + groupId + '"]:checked');
        return elem && elem.value;
      },

      start() {
        // TODO: Update all the dynamic parameters...
      },
    };

    // Provide module...
    provide(CommentsPageStates);
  },
);
