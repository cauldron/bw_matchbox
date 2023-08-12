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
    /** @exports CommentsHandlers
     */
    const CommentsHandlers = /** @lends CommentsHandlers */ {
      __id: 'CommentsHandlers',

      handleTitleActionClick(event) {
        event.preventDefault();
        event.stopPropagation();
        const { currentTarget } = event;
        const { id } = currentTarget;
        console.log('[Comments:handleTitleActionClick]', id, {
          id,
          currentTarget,
          event,
        });
      },

      handleFilterByStateChange(node) {
        const { value } = node;
        /* console.log('[CommentsHandlers:handleFilterByStateChange]', {
         *   value,
         *   // node,
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
