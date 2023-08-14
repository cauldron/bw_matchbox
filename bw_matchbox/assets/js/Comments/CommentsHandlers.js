modules.define(
  'CommentsHandlers',
  [
    // Required modules...
    // 'CommonHelpers',
    'CommentsData',
    'CommentsDataRender',
    'CommentsStates',
    'CommentsHelpers',
    'CommentsNodes',
    'CommentsConstants',
  ],
  function provide_CommentsHandlers(
    provide,
    // Resolved modules...
    // CommonHelpers,
    CommentsData,
    CommentsDataRender,
    CommentsStates,
    CommentsHelpers,
    CommentsNodes,
    CommentsConstants,
  ) {
    const apiHandlers = {
      threadAddComment(params) {
        console.log('[CommentsHandlers:apiHandlers:threadAddComment]', {
          params,
        });
        debugger;
      },

      threadResolve(params) {
        const { resolveThreadApiUrl: urlBase } = CommentsConstants;
        const { threadId } = params;
        const { threadsHash } = CommentsData;
        const thread = threadsHash[threadId];
        const { resolved: currResolved } = thread;
        const resolved = !currResolved;
        const requestParams = {
          /* // @matchbox_app.route("/comments/resolve-thread", methods=["POST"])
           * 'thread': integer,
           * 'resolved': boolean
           */
          thread: threadId,
          resolved,
        };
        const fetchParams = {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify(requestParams),
        };
        // const urlQuery = CommonHelpers.makeQuery(requestParams, { addQuestionSymbol: true });
        const url = urlBase; // + urlQuery;
        console.log('[CommentsHandlers:apiHandlers:threadResolve]', {
          resolved,
          currResolved,
          threadId,
          thread,
          params,
          threadsHash,
          fetchParams,
          requestParams,
          urlBase,
          url,
        });
        debugger;
        CommentsStates.setLoading(true);
        fetch(url, fetchParams)
          .then((res) => {
            const { ok, status, statusText } = res;
            if (!ok) {
              // Something went wrong?
              const reason =
                [statusText, status && 'status: ' + status].filter(Boolean).join(', ') ||
                'Unknown error';
              const error = new Error('Data loading error: ' + reason);
              // eslint-disable-next-line no-console
              console.error('[CommentsHandlers:apiHandlers:threadResolve]: error (on then)', {
                reason,
                res,
                url,
                params,
                urlBase,
              });
              // eslint-disable-next-line no-debugger
              debugger;
              throw error;
            }
            // All is ok...
            return res.json();
          })
          .then((json) => {
            console.log('[CommentsHandlers:apiHandlers:threadResolve]: done', {
              json,
            });
            debugger;
            // // Update total comments number...
            // CommentsStates.setTotalCommentsCount(totalComments);
            // CommentsStates.setTotalThreadsCount(totalThreads);
            // CommentsStates.setError(undefined); // Clear the error: all is ok
            // CommentsStates.setHasData(CommentsData.hasData || hasData); // Update 'has data' flag
            // // Prepare and store data...
            // CommentsPrepareLoadedData.acceptAndPrepareData();
            // CommentsPrepareLoadedData.makeDerivedData();
            // // Render data...
            // CommentsDataRender.renderData();
            // CommentsDataRender.updateVisibleThreadsStatus();
            // CommentsDataRender.renderDerivedFilters();
          })
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error('[CommentsHandlers:apiHandlers:threadResolve]: error (catched)', {
              error,
              url,
              params,
              urlBase,
            });
            // eslint-disable-next-line no-debugger
            debugger;
            // Store & display error...
            CommentsStates.setError(error);
          })
          .finally(() => {
            CommentsStates.setLoading(false);
            /* // TODO: Update all the page dynamic elements?
             * CommentsEvents.invokeEvent('updatePage');
             */
          });
      },
    };

    /** @exports CommentsHandlers
     */
    const CommentsHandlers = /** @lends CommentsHandlers */ {
      __id: 'CommentsHandlers',

      handleTitleActionClick(event) {
        event.preventDefault();
        event.stopPropagation();
        const { currentTarget: node } = event;
        const { id } = node;
        const isThreadAction = id.startsWith('thread');
        const threadNode = node.closest('.thread');
        const threadId = Number(threadNode.getAttribute('data-thread-id'));
        const params = {
          node,
          threadNode,
          id,
          threadId,
        };
        const func = apiHandlers[id];
        try {
          if (!func) {
            const error = new Error('Cannot find api handler for id ' + id);
            throw error;
          }
          console.log('[CommentsHandlers:handleTitleActionClick]', id, {
            id,
            func,
            node,
            event,
            isThreadAction,
            threadNode,
            threadId,
          });
          func(params);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('[CommentsHandlers:handleTitleActionClick] error', error);
          // eslint-disable-next-line no-debugger
          debugger;
        }
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

      handleFilterByMyCommentThreads() {
        const { filterByMyCommentThreads } = CommentsData;
        CommentsStates.setFilterByMyCommentThreads(!filterByMyCommentThreads);
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
