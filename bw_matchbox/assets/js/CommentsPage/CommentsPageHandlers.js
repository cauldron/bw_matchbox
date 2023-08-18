modules.define(
  'CommentsPageHandlers',
  [
    // Required modules...
    'CommonNotify',
    'CommonModal',
    'CommentsPageData',
    'CommentsPageDataRender',
    'CommentsPageStates',
    'CommentsPageHelpers',
    'CommentsPageNodes',
    'CommentsPageConstants',
  ],
  function provide_CommentsHandlers(
    provide,
    // Resolved modules...
    CommonNotify,
    CommonModal,
    CommentsPageData,
    CommentsPageDataRender,
    CommentsPageStates,
    CommentsPageHelpers,
    CommentsPageNodes,
    CommentsPageConstants,
  ) {
    /* // Types (TS):
     * interface TApiHandlerParams {
     *   actionId: string;
     *   threadId: ThreadId;
     *   node: HTMLLinkElement;
     *   threadNode: HTMLDivElement;
     * }
     */

    const commentModal = {
      getCommentModalContent() {
        const content = `
          <div class="comment-modal-form">
            <label for="comment-modal-text">Comment</label>
            <textarea class="u-full-width" id="comment-modal-text" name="comment-modal-text"></textarea>
          </div>
          <div class="comment-modal-actions">
            <button class="button-primary" id="comment-modal-ok">Ok</button>
            <button id="comment-modal-cancel">Cancel</button>
          </div>
        `;
        return content;
      },

      /** promiseCommentModal -- Show dialog with editable comment text and wait for action
       * @return {Promise}
       */
      promiseCommentModal() {
        return new Promise((resolve, _reject) => {
          const title = 'Enter comment text';
          const content = this.getCommentModalContent();
          let isOpened = true;
          CommonModal.setModalContentId('comment-dialog-modal')
            .setTitle(title)
            .setModalWindowOptions({
              autoHeight: true,
              width: 'md',
            })
            .setModalContentOptions({
              scrollable: true,
              padded: true,
            })
            .setContent(content)
            .onHide(() => {
              // It will be called on modal close...
              if (isOpened) {
                isOpened = false;
                // Don't proceed the operation!
                resolve(false);
              }
            })
            .showModal();
          // Store comment value...
          const okButtonEl = document.getElementById('comment-modal-ok');
          const commentTextEl = document.getElementById('comment-modal-text');
          commentTextEl.focus();
          // TODO: Add handlers for modal actions
          okButtonEl.addEventListener('click', () => {
            if (isOpened) {
              isOpened = false;
              CommonModal.hideModal({ dontNotify: true });
              // Success: proceed with comment text
              const comment = commentTextEl.value;
              const userAction = { comment, status: 'comment from promiseCommentModal' };
              resolve(userAction);
            }
          });
          document
            .getElementById('comment-modal-cancel')
            .addEventListener('click', CommonModal.boundHideModal);
        });
      },
    };

    const apiHandlers = {
      /** Actual comment api request
       * @param {<TApiHandlerParams>} params
       * @param {string} comment - Comment text to append
       * @return {Promise}
       */
      threadAddCommentRequest(params, comment) {
        // TODO: Check roles for editors, reviewers?
        const { createCommentApiUrl: urlBase } = CommentsPageConstants;
        const { threadId, threadNode } = params;
        const { threadsHash, sharedParams } = CommentsPageData;
        const { currentUser } = sharedParams;
        const thread = threadsHash[threadId];
        const requestParams = {
          /* // @matchbox_app.route("/comments/create-comment", methods=["POST"])
           * 'thread': integer,
           * 'content': string,
           * 'user': string
           */
          thread: threadId,
          user: currentUser,
          content: comment,
        };
        const fetchParams = {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify(requestParams),
        };
        const url = urlBase;
        /* console.log('[CommentsPageHandlers:apiHandlers:threadAddCommentRequest]: start', {
         *   threadId,
         *   thread,
         *   params,
         *   threadsHash,
         *   fetchParams,
         *   requestParams,
         *   urlBase,
         *   url,
         * });
         */
        CommentsPageStates.setLoading(true);
        return (
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
                console.error(
                  '[CommentsPageHandlers:apiHandlers:threadAddCommentRequest]: on then',
                  {
                    reason,
                    res,
                    url,
                    params,
                    urlBase,
                  },
                );
                // eslint-disable-next-line no-debugger
                debugger;
                throw error;
              }
              // All is ok...
              return res.json();
            })
            /**
             * @param {<TComment>} comment
             */
            .then((comment) => {
              const { id: commentId } = comment;
              const { comments, threads, commentsHash, commentsByThreads } = CommentsPageData;
              // Update thread modified date (manually!)
              const currDate = new Date();
              const currDateStr = currDate.toUTCString();
              // Update data...
              thread.modified = currDateStr;
              // Add comment to list (`comments`) and update hashes (`commentsByThreads`) ...
              comments.push(comment);
              commentsByThreads[threadId].push(commentId);
              commentsHash[commentId] = comment;
              // Sort comments...
              comments.sort(CommentsPageHelpers.sortCommentsCompare);
              CommentsPageHelpers.sortThreads(threads);
              // Update content...
              const threadTitleTextNode = threadNode.querySelector('.title-text');
              const threadTitleTextContent =
                CommentsPageDataRender.helpers.createThreadTitleTextContent(thread);
              /* console.log('[CommentsPageHandlers:apiHandlers:threadAddCommentRequest]: done', {
               *   commentId,
               *   comment,
               *   commentsHash,
               *   commentsByThreads,
               *   thread,
               *   threadId,
               *   currDate,
               *   currDateStr,
               *   threadTitleTextNode,
               *   threadTitleTextContent,
               * });
               */
              // Update data & elements' states...
              threadTitleTextNode.innerHTML = threadTitleTextContent;
              // CommentsPageDataRender.renderData();
              CommentsPageDataRender.updateThreadComments(threadId);
              CommentsPageDataRender.updateVisibleThreads();
              CommentsPageHelpers.sortThreads(threads);
              CommentsPageDataRender.reorderRenderedThreads();
              // Show noitification...
              CommonNotify.showSuccess('Comment successfully added');
            })
            .catch((error) => {
              // eslint-disable-next-line no-console
              console.error('[CommentsPageHandlers:apiHandlers:threadAddCommentRequest]: catched', {
                error,
                url,
                params,
                urlBase,
              });
              // eslint-disable-next-line no-debugger
              debugger;
              // Store & display error...
              CommentsPageStates.setError(error);
              CommonNotify.showError(error);
            })
            .finally(() => {
              CommentsPageStates.setLoading(false);
            })
        );
      },

      /** Start adding comment (show comment text dialog
       * @param {<TApiHandlerParams>} params
       * @return {Promise}
       */
      threadAddComment(params) {
        const { sharedParams } = CommentsPageData;
        const { currentRole } = sharedParams;
        // Check roles...
        if (currentRole !== 'editors' && currentRole !== 'reviewers') {
          CommonNotify.showError(`This role (${currentRole}) hasn't allowed to add comments`);
          return;
        }
        // Show comment text form modal first and wait for user action...
        return commentModal.promiseCommentModal().then((userAction) => {
          if (!userAction) {
            // Comment edition canceled
            return false;
          }
          // Make api request...
          const { comment } = userAction;
          return apiHandlers.threadAddCommentRequest(params, comment);
        });
      },

      /** threadResolve -- Set resolved status for thread (called from `handleTitleActionClick` by literal id: `apiHandlers[id]`)
       * @param {<TApiHandlerParams>} params
       * @return {Promise}
       */
      threadResolve(params) {
        const { resolveThreadApiUrl: urlBase } = CommentsPageConstants;
        const { threadId, threadNode } = params;
        const { threadsHash, sharedParams } = CommentsPageData;
        const { currentRole } = sharedParams;
        // Check roles...
        if (currentRole !== 'editors') {
          CommonNotify.showError(
            `This role (${currentRole}) hasn't allowed to resolve/open the threads`,
          );
          return;
        }
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
        /* console.log('[CommentsPageHandlers:apiHandlers:threadResolve]: start', {
         *   resolved,
         *   currResolved,
         *   threadId,
         *   thread,
         *   params,
         *   threadsHash,
         *   fetchParams,
         *   requestParams,
         *   urlBase,
         *   url,
         * });
         */
        CommentsPageStates.setLoading(true);
        return fetch(url, fetchParams)
          .then((res) => {
            const { ok, status, statusText } = res;
            if (!ok) {
              // Something went wrong?
              const reason =
                [statusText, status && 'status: ' + status].filter(Boolean).join(', ') ||
                'Unknown error';
              const error = new Error('Data loading error: ' + reason);
              // eslint-disable-next-line no-console
              console.error('[CommentsPageHandlers:apiHandlers:threadResolve]: error (on then)', {
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
          .then((_json) => {
            /* // TODO: Construct updated date tag?
             * const currDate = new Date();
             * const currDateStr = currDate.toUTCString();
             */
            // Update data...
            thread.resolved = resolved;
            // thread.modified = currDateStr;
            // Update content...
            const threadTitleTextNode = threadNode.querySelector('.title-text');
            const threadTitleTextContent =
              CommentsPageDataRender.helpers.createThreadTitleTextContent(thread);
            /* console.log('[CommentsPageHandlers:apiHandlers:threadResolve]: done', {
             *   resolved,
             *   thread,
             *   // currDate,
             *   // currDateStr,
             *   threadTitleTextNode,
             *   threadTitleTextContent,
             *   json,
             * });
             */
            // Update data & elements' states...
            threadTitleTextNode.innerHTML = threadTitleTextContent;
            // Update thread node class...
            threadNode.classList.toggle('resolved', resolved);
            // Update/re-render data...
            // CommentsPageDataRender.renderData();
            CommentsPageDataRender.updateVisibleThreads();
            // Show noitification...
            CommonNotify.showSuccess('Thread data successfully updated');
            CommentsPageStates.setError();
          })
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error('[CommentsPageHandlers:apiHandlers:threadResolve]: error (catched)', {
              error,
              url,
              params,
              urlBase,
            });
            // eslint-disable-next-line no-debugger
            debugger;
            // Store & display error...
            CommentsPageStates.setError(error);
            CommonNotify.showError(error);
          })
          .finally(() => {
            CommentsPageStates.setLoading(false);
          });
      },
    };

    /** @exports CommentsPageHandlers
     */
    const CommentsPageHandlers = /** @lends CommentsPageHandlers */ {
      __id: 'CommentsPageHandlers',

      handleTitleActionClick(event) {
        event.preventDefault();
        event.stopPropagation();
        const { currentTarget: node } = event;
        const { id: actionId } = node;
        // const isThreadAction = actionId.startsWith('thread');
        const threadNode = node.closest('.thread');
        const threadId = Number(threadNode.getAttribute('data-thread-id'));
        /* @param {<TApiHandlerParams>} params */
        const params = {
          node,
          threadNode,
          actionId,
          threadId,
        };
        const func = apiHandlers[actionId];
        try {
          if (!func) {
            const error = new Error('Cannot find api handler for id ' + actionId);
            throw error;
          }
          /* console.log('[CommentsPageHandlers:handleTitleActionClick]', actionId, {
           *   actionId,
           *   func,
           *   node,
           *   event,
           *   // isThreadAction,
           *   threadNode,
           *   threadId,
           * });
           */
          func(params);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('[CommentsPageHandlers:handleTitleActionClick] error', error);
          // eslint-disable-next-line no-debugger
          debugger;
        }
      },

      handleFilterByUserChange(node) {
        const values = CommentsPageHelpers.getMultipleSelectValues(node);
        /* console.log('[CommentsPageHandlers:handleFilterByUserChange]', {
         *   values,
         * });
         */
        CommentsPageStates.setFilterByUsers(values);
      },

      handleFilterByProcessChange(node) {
        const values = CommentsPageHelpers.getMultipleSelectValues(node).map(Number);
        /* console.log('[CommentsPageHandlers:handleFilterByProcessChange]', {
         *   values,
         * });
         */
        CommentsPageStates.setFilterByProcesses(values);
      },

      handleFilterByStateChange(node) {
        const { value } = node;
        /* console.log('[CommentsPageHandlers:handleFilterByStateChange]', {
         *   value,
         * });
         */
        CommentsPageStates.setFilterByState(value);
      },

      handleSortThreadsReversedChange(node) {
        const { checked: value } = node;
        /* console.log('[CommentsPageHandlers:handleSortThreadsChange]', {
         *   value,
         * });
         */
        CommentsPageStates.setSortThreadsReversedChange(value);
      },

      handleSortThreadsByChange(node) {
        const { value } = node;
        /* console.log('[CommentsPageHandlers:handleSortThreadsByChange]', {
         *   value,
         * });
         */
        CommentsPageStates.setSortThreadsByChange(value);
      },

      /** Reset `filterByState` filter
       * @param {object} [opts]
       * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
       */
      resetFilterByState(opts = {}) {
        const filterByStateNode = document.getElementById('filterByState');
        const { defaultParams } = CommentsPageData;
        const { filterByState: value } = defaultParams;
        filterByStateNode.value = value;
        CommentsPageStates.setFilterByState(value, opts);
      },

      /** Reset `filterByUsers` filter
       * @param {object} [opts]
       * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
       */
      resetFilterByUsers(opts = {}) {
        const filterByUsersNode = document.getElementById('filterByUsers');
        const { defaultParams } = CommentsPageData;
        const { filterByUsers: values } = defaultParams;
        CommentsPageHelpers.setMultipleSelectValues(filterByUsersNode, values);
        CommentsPageStates.setFilterByUsers(values, opts);
      },

      /** Reset `filterByProcesses` filter
       * @param {object} [opts]
       * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
       */
      resetFilterByProcesses(opts = {}) {
        const filterByProcessesNode = document.getElementById('filterByProcesses');
        const { defaultParams } = CommentsPageData;
        const { filterByProcesses: values } = defaultParams;
        CommentsPageHelpers.setMultipleSelectValues(filterByProcessesNode, values);
        CommentsPageStates.setFilterByProcesses(values, opts);
      },

      handleFilterByMyThreads() {
        const { filterByMyThreads } = CommentsPageData;
        CommentsPageStates.setFilterByMyThreads(!filterByMyThreads);
      },

      /** Reset `filterByMyThreads` filter
       * @param {object} [opts]
       * @param {boolean} [opts.omitUpdate] - Don't automatically state (eg: will be updated manually later).
       */
      resetFilterByMyThreads(opts = {}) {
        const { defaultParams } = CommentsPageData;
        const { filterByMyThreads: value } = defaultParams;
        CommentsPageStates.setFilterByMyThreads(value, opts);
      },

      handleExpandThread(node) {
        const threadEl = node.closest('.thread');
        const threadId = Number(threadEl.getAttribute('data-thread-id'));
        const wasExpanded = threadEl.classList.contains('expanded');
        const setExpanded = !wasExpanded;
        /* console.log('[CommentsPageHandlers:handleExpandThread]', {
         *   threadEl,
         *   node,
         * });
         */
        // Ensure that all the thread comments had already rendered...
        if (setExpanded) {
          CommentsPageDataRender.ensureThreadCommentsReady(threadId);
        }
        // Toggle `expanded` class name...
        threadEl.classList.toggle('expanded', setExpanded);
      },

      handleExpandAllThreads() {
        const threadsListNode = CommentsPageNodes.getThreadsListNode();
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
        /* console.log('[CommentsPageHandlers:handleExpandAllThreads]', {
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
            CommentsPageDataRender.ensureThreadCommentsReady(threadId);
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
        this.resetFilterByMyThreads(commonOpts);
        CommentsPageDataRender.updateVisibleThreads();
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
    provide(CommentsPageHandlers);
  },
);
