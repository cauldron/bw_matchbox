modules.define(
  'CommentsHandlers',
  [
    // Required modules...
    'CommentsData',
    'CommentsDataRender',
    'CommentsStates',
    'CommentsHelpers',
    'CommentsNodes',
  ],
  function provide_CommentsHandlers(
    provide,
    // Resolved modules...
    CommentsData,
    CommentsDataRender,
    CommentsStates,
    CommentsHelpers,
    CommentsNodes,
  ) {
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
        const values = CommentsHelpers.getMultipleSelectValues(node);
        /* console.log('[CommentsHandlers:handleFilterByUserChange]', {
         *   values,
         * });
         */
        CommentsStates.setFilterByUsers(values);
      },

      handleFilterByProcessChange(node) {
        const values = CommentsHelpers.getMultipleSelectValues(node).map(Number);
        /* console.log('[CommentsHandlers:handleFilterByProcessChange]', {
         *   values,
         * });
         */
        CommentsStates.setFilterByProcesses(values);
      },

      handleFilterByStateChange(node) {
        const { value } = node;
        /* console.log('[CommentsHandlers:handleFilterByStateChange]', {
         *   value,
         * });
         */
        CommentsStates.setFilterByState(value);
      },

      /** Reset `filterByState` filter
       * @param {object} [opts]
       * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
       */
      resetFilterByState(opts = {}) {
        const filterByStateNode = document.getElementById('filterByState');
        const { defaultFilters } = CommentsData;
        const { filterByState: value } = defaultFilters;
        filterByStateNode.value = value;
        CommentsStates.setFilterByState(value, opts);
      },

      /** Reset `filterByUsers` filter
       * @param {object} [opts]
       * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
       */
      resetFilterByUsers(opts = {}) {
        const filterByUsersNode = document.getElementById('filterByUsers');
        const { defaultFilters } = CommentsData;
        const { filterByUsers: values } = defaultFilters;
        CommentsHelpers.setMultipleSelectValues(filterByUsersNode, values);
        CommentsStates.setFilterByUsers(values, opts);
      },

      /** Reset `filterByProcesses` filter
       * @param {object} [opts]
       * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
       */
      resetFilterByProcesses(opts = {}) {
        const filterByProcessesNode = document.getElementById('filterByProcesses');
        const { defaultFilters } = CommentsData;
        const { filterByProcesses: values } = defaultFilters;
        CommentsHelpers.setMultipleSelectValues(filterByProcessesNode, values);
        CommentsStates.setFilterByProcesses(values, opts);
      },

      /** Reset `filterByMyCommentThreads` filter
       * @param {object} [opts]
       * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
       */
      resetFilterByMyCommentThreads(opts = {}) {
        const { defaultFilters } = CommentsData;
        const { filterByMyCommentThreads: value } = defaultFilters;
        CommentsStates.setFilterByMyCommentThreads(value, opts);
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

      handleFilterByMyCommentThreads() {
        const { filterByMyCommentThreads } = CommentsData;
        CommentsStates.setFilterByMyCommentThreads(!filterByMyCommentThreads);
      },

      handleExpandAllThreads() {
        const threadsListNode = CommentsNodes.getThreadsListNode();
        // const threadNodes = threadsListNode.getElementsByClassName('thread');
        const threadNodes = threadsListNode.querySelectorAll('.thread:not(.hidden)');
        const threadNodesList = Array.from(threadNodes);
        const allCount = threadNodesList.length;
        const expandedThreads = threadNodesList.filter((node) =>
          node.classList.contains('expanded'),
        );
        const expandedCount = expandedThreads.length;
        const isCollapsed = !expandedCount;
        const isExpanded = !isCollapsed && expandedCount === allCount;
        const isSome = !isCollapsed && !isExpanded;
        const isAll = !isSome;
        const setExpanded = isAll ? !isExpanded : false;
        /* console.log('[CommentsHandlers:handleExpandAllThreads]', {
         *   threadsListNode,
         *   threadNodes,
         *   threadNodesList,
         *   allCount,
         *   expandedThreads,
         *   expandedCount,
         *   isCollapsed,
         *   isExpanded,
         *   isSome,
         *   isAll,
         *   setExpanded,
         * });
         */
        threadNodesList.forEach((node) => {
          if (setExpanded) {
            const threadId = Number(node.getAttribute('data-thread-id'));
            CommentsDataRender.ensureThreadCommentsReady(threadId);
          }
          node.classList.toggle('expanded', setExpanded);
        });
      },

      /** Reset all the filters to default values
       */
      handleResetFilters() {
        const commonOpts = { omitUpdate: true };
        this.resetFilterByState(commonOpts);
        this.resetFilterByUsers(commonOpts);
        this.resetFilterByProcesses(commonOpts);
        this.resetFilterByMyCommentThreads(commonOpts);
        CommentsDataRender.updateVisibleThreads();
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
