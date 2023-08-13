modules.define(
  'CommentsHandlers',
  [
    // Required modules...
    'CommentsData',
    'CommentsDataRender',
    'CommentsStates',
  ],
  function provide_CommentsHandlers(
    provide,
    // Resolved modules...
    CommentsData,
    CommentsDataRender,
    CommentsStates,
  ) {
    /** Local helpers */
    const helpers = {
      getMultipleSelectValues(node) {
        const options = Array.from(node.options);
        return options.filter((item) => item.selected).map((item) => item.value);
      },
    };

    /** @exports CommentsHandlers
     */
    const CommentsHandlers = /** @lends CommentsHandlers */ {
      __id: 'CommentsHandlers',

      handleTitleActionClick(event) {
        event.preventDefault();
        event.stopPropagation();
        /* // DEBUG
         * const { currentTarget } = event;
         * const { id } = currentTarget;
         * console.log('[Comments:handleTitleActionClick]', id, {
         *   id,
         *   currentTarget,
         *   event,
         * });
         */
      },

      handleFilterByUserChange(node) {
        const values = helpers.getMultipleSelectValues(node);
        /* console.log('[CommentsHandlers:handleFilterByUserChange]', {
         *   values,
         * });
         */
        CommentsStates.setFilterByUser(values);
      },

      handleFilterByProcessChange(node) {
        const values = helpers.getMultipleSelectValues(node).map(Number);
        /* console.log('[CommentsHandlers:handleFilterByProcessChange]', {
         *   values,
         * });
         */
        CommentsStates.setFilterByProcess(values);
      },

      handleFilterByStateChange(node) {
        const { value } = node;
        /* console.log('[CommentsHandlers:handleFilterByStateChange]', {
         *   value,
         * });
         */
        CommentsStates.setFilterByState(value);
      },

      /** Reset all the filters to default values
       */
      resetFilterByState() {
        const filterByState = document.getElementById('filterByState');
        const { defaultFilterByState: value } = CommentsData;
        filterByState.value = value;
        CommentsStates.setFilterByState(value);
      },

      handleExpandThread(node) {
        const threadEl = node.closest('.thread');
        const threadId = Number(threadEl.getAttribute('data-thread-id'));
        const wasExpanded = threadEl.classList.contains('expanded');
        const setExpanded = !wasExpanded;
        /* console.log('[CommentsHandlers:handleExpandThread]', {
         *   threadEl,
         *   node,
         * });
         */
        // Ensure that all the thread comments had already rendered...
        if (setExpanded) {
          CommentsDataRender.ensureThreadCommentsReady(threadId);
        }
        // Toggle `expanded` class name...
        threadEl.classList.toggle('expanded', setExpanded);
      },

      /** Reset all the filters to default values
       */
      handleResetFilters() {
        this.resetFilterByState();
      },

      start({ handlers }) {
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

    // Provide module...
    provide(CommentsHandlers);
  },
);
