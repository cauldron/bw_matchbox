modules.define(
  'CommentsStates',
  [
    // Required modules...
    // 'CommentsConstants',
    'CommentsData',
    'CommentsDataRender',
    'CommentsNodes',
  ],
  function provide_CommentsStates(
    provide,
    // Resolved modules...
    // CommentsConstants,
    CommentsData,
    CommentsDataRender,
    CommentsNodes,
  ) {
    /** @exports CommentsStates
     */
    const CommentsStates = {
      __id: 'CommentsStates',

      setLoading(isLoading) {
        // Set css class for id="processes-list-root" --> loading, set local status
        const rootNode = CommentsNodes.getRootNode();
        rootNode.classList.toggle('loading', isLoading);
        CommentsData.isLoading = isLoading;
      },

      setHasData(hasData) {
        // Set css class for root node, update local state
        const rootNode = CommentsNodes.getRootNode();
        rootNode.classList.toggle('empty', !hasData);
        CommentsData.hasData = hasData;
      },

      /**
       * @param {string[]} values
       * @param {object} [opts]
       * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
       */
      setFilterByUsers(values, opts = {}) {
        /* console.log('[CommentsStates:setFilterByUsers]', {
         *   values,
         * });
         */
        CommentsData.filterByUsers = values;
        if (!opts.omitUpdate) {
          CommentsDataRender.updateVisibleThreads();
        }
      },

      /**
       * @param {string[]} values
       * @param {object} [opts]
       * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
       */
      setFilterByProcesses(values, opts = {}) {
        /* console.log('[CommentsStates:setFilterByProcesses]', {
         *   values,
         * });
         */
        CommentsData.filterByProcesses = values;
        if (!opts.omitUpdate) {
          CommentsDataRender.updateVisibleThreads();
        }
      },

      /**
       * @param {TFilterByState} value
       * @param {object} [opts]
       * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
       */
      setFilterByState(value, opts = {}) {
        CommentsData.filterByState = value;
        if (!opts.omitUpdate) {
          CommentsDataRender.updateVisibleThreads();
        }
      },

      /**
       * @param {boolean} value
       * @param {object} [opts]
       * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
       */
      setFilterByMyCommentThreads(value, opts = {}) {
        CommentsData.filterByMyCommentThreads = value;
        const filterByMyCommentThreadsNode = document.getElementById('filterByMyCommentThreads');
        filterByMyCommentThreadsNode.classList.toggle('button-primary', !!value);
        const rootNode = CommentsNodes.getRootNode();
        rootNode.classList.toggle('filterByMyCommentThreads', !!value);
        if (!opts.omitUpdate) {
          CommentsDataRender.updateVisibleThreads();
        }
      },

      setTotalCommentsCount(totalComments) {
        CommentsData.totalComments = totalComments;
        /* // TODO?
         * const rootNode = CommentsNodes.getRootNode();
         * const elems = rootNode.querySelectorAll('#total-comments-number');
         * elems.forEach((node) => {
         *   node.innerHTML = String(totalComments);
         * });
         */
      },

      setTotalThreadsCount(totalThreads) {
        CommentsData.totalThreads = totalThreads;
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
        CommentsData.isError = !!error;
        CommentsData.error = error;
        CommentsDataRender.renderError(error);
      },

      clearData() {
        this.setHasData(false);
        CommentsDataRender.clearRenderedData();
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
    provide(CommentsStates);
  },
);
