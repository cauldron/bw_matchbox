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

      setFilterByState(value) {
        CommentsData.filterByState = value;
        CommentsDataRender.updateVisibleThreads();
      },

      setTotalCommentsCount(totalComments) {
        CommentsData.totalComments = totalComments;
        /* // Set css class for root node, update local state
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
