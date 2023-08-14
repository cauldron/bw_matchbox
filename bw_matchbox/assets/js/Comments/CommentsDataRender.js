modules.define(
  'CommentsDataRender',
  [
    // Required modules...
    'CommentsConstants',
    'CommentsData',
    'CommentsNodes',
    'CommonHelpers',
    'CommentsThreadsHelpers',
  ],
  function provide_CommentsDataRender(
    provide,
    // Resolved modules...
    CommentsConstants,
    CommentsData,
    CommentsNodes,
    CommonHelpers,
    CommentsThreadsHelpers,
  ) {
    /** Local (not public) helpers... */
    const helpers = {
      /** @type {Intl.DateTimeFormat} */
      dateTimeFormatter: undefined,

      /** getCommentsForThread
       * @param {<TThreadId>} threadId
       * @return {<TCommentId[]>} - Comments data list
       */
      getCommentsForThread(threadId) {
        const { commentsHash, commentsByThreads } = CommentsData;
        const commentsByThreadsIds = commentsByThreads[threadId];
        const commentsList = commentsByThreadsIds.map((id) => commentsHash[id]);
        return commentsList;
      },

      getVisibleCommentsForThread(threadId) {
        const { commentsHash, commentsByThreads } = CommentsData;
        const commentsByThreadsIds = commentsByThreads[threadId];
        const visibleCommentIds = commentsByThreadsIds.filter(
          CommentsThreadsHelpers.isCommentVisible,
        );
        const commentsList = visibleCommentIds.map((id) => commentsHash[id]);
        return commentsList;
      },

      getDateTimeFormatter() {
        if (!helpers.dateTimeFormatter) {
          helpers.dateTimeFormatter = new Intl.DateTimeFormat(
            CommentsConstants.dateTimeFormatLocale,
            CommentsConstants.dateTimeFormatOptions,
          );
        }
        return helpers.dateTimeFormatter;
      },

      createThreadTitleTextContent(thread) {
        const {
          id: threadId,
          // created, // TDateStr, eg: 'Sat, 12 Aug 2023 12:36:08 GMT'
          modified, // TDateStr, eg: 'Sat, 12 Aug 2023 12:36:08 GMT'
          name, // string, eg: 'Возмутиться кпсс гул'
          reporter, // string, eg: '阿部 篤司'
          resolved, // boolean, eg: false
          process, // TProcess;
        } = thread;
        const commentsList = helpers.getVisibleCommentsForThread(threadId);
        const commentsCount = commentsList.length;
        const modifiedDate = new Date(modified);
        const dateTimeFormatter = helpers.getDateTimeFormatter();
        const modifiedStr = dateTimeFormatter.format(modifiedDate);
        const processName = CommentsThreadsHelpers.createProcessName(process);
        const infoText = [
          reporter && `<label>reporter:</label> ${reporter}`,
          commentsCount && `<label>comments:</label> ${commentsCount}`,
          modifiedStr && `<label>modified date:</label> ${modifiedStr}`,
          process && process.id && process.name && `<label>process:</label> ${processName}`,
          resolved ? 'resolved' : 'open',
        ]
          .filter(Boolean)
          .join(', ');
        const content = `
            <span class="name">${name}</span>
            <span class="info">(${infoText})</span>
        `;
        return content;
      },

      /** renderThread
       * @param {<TThread>} thread
       * @return {string} - HTML content
       */
      renderThread(thread) {
        const {
          id: threadId,
          resolved, // boolean, eg: false
          // created, // TDateStr, eg: 'Sat, 12 Aug 2023 12:36:08 GMT'
          // modified, // TDateStr, eg: 'Sat, 12 Aug 2023 12:36:08 GMT'
          // name, // string, eg: 'Возмутиться кпсс гул'
          // reporter, // string, eg: '阿部 篤司'
          // process, // TProcess;
        } = thread;
        const isVisible = CommentsThreadsHelpers.isThreadVisible(threadId);
        const commentsList = helpers.getVisibleCommentsForThread(threadId);
        const commentPositions = commentsList.map((comment) => comment.position);
        const commentsCount = commentsList.length;
        const isEmpty = !commentsCount;
        const isExpanded = false; // commentsCount <= 2; // DEBUG!
        const className = [
          // prettier-ignore
          'thread',
          isEmpty && 'empty',
          isExpanded && 'expanded',
          !isVisible && 'hidden',
          resolved && 'resolved',
        ]
          .filter(Boolean)
          .join(' ');
        // Render actual comments if thread is expanded by default...
        const commentsContent = isExpanded
          ? helpers.renderThreadCommentsContent(threadId)
          : // DEBUG: Here should be empty data for the unexpanded thread comments...
            commentPositions.join(', ');
        const threadTitleTextContent = helpers.createThreadTitleTextContent(thread);
        const content = `
          <div data-thread-id="${threadId}" id="thread-${threadId}" class="${className}">
            <div class="main-row" onClick="Comments.CommentsHandlers.handleExpandThread(this)">
              <div class="expand-button-wrapper" title="Expand/collapse comments">
                <a class="expand-button">
                  <i class="fa-solid fa-chevron-right"></i>
                </a>
              </div>
              <div class="title">
                <div class="title-text">
                  ${threadTitleTextContent}
                </div>
                <div class="title-actions">
                  <a id="threadAddComment" title="Add comment"><i class="fa-solid fa-comment"></i></a>
                  <a id="threadResolve"><i class="is-resolved fa-solid fa-lock" title="Resolved (click to open)"></i><i class="not-resolved fa-solid fa-lock-open" title="Open (click to resolve)"></i></a>
                </div>
              </div>
            </div>
            <div class="comments" data-for-thread-id="${threadId}" id="comments-for-thread-${threadId}">${commentsContent}</div>
          </div>
        `;
        /* console.log('[CommentsDataRender:helpers:renderThread]', {
         *   content,
         *   commentPositions,
         *   threadId,
         *   name,
         *   reporter,
         *   commentsList,
         *   thread,
         * });
         */
        return content;
      },

      renderComment(comment) {
        const { sharedParams } = CommentsData;
        const { currentUser } = sharedParams;
        const {
          id, // number; // 2
          position, // number; // 1
          thread: threadId, // number; // 1
          user, // string; // 'Puccio Bernini'
          content, // string; // '...'
        } = comment;
        const isCurrentUser = user === currentUser;
        const className = [
          // prettier-ignore
          'comment',
          // resolved && 'resolved',
        ]
          .filter(Boolean)
          .join(' ');
        const html = `
          <div
            id="thread-%{threadId}-comment-${id}"
            data-thread-id="${threadId}"
            data-id="${id}"
            class="${className}"
            data-position="${position}"
          >
            <div class="title">
              <div class="title-text">
                <span class="name">${user}</span>
                ${isCurrentUser ? '<span class="me">(me)</span>' : ''}
              </div>
              <!-- // UNUSED: Actions for particular comments.
              <div class="title-actions">
                <a id="comment-answer" title="Answer"><i class="fa-regular fa-comment"></i></a>
                <a id="comment-resolve" title="Mark it as resolved"><i class="fa-solid fa-xmark"></i></a>
              </div>
              -->
            </div>
            <div class="content">
              ${content}
            </div>
          </div>
        `;
        /* console.log('[CommentsDataRender:helpers:renderComment]', {
         *   html,
         *   //\\
         *   id, // number; // 2
         *   position, // number; // 1
         *   thread: threadId, // number; // 1
         *   user, // string; // 'Puccio Bernini'
         *   content, // string; // '...'
         *   //\\
         *   comment,
         * });
         */
        return html;
      },

      renderThreadCommentsContent(threadId) {
        // const { filterByState } = CommentsData;
        // TODO: Use some filters?
        const comments = helpers.getVisibleCommentsForThread(threadId);
        const commentsHtml = comments.map(helpers.renderComment).join('\n');
        /* console.log('[CommentsDataRender:helpers:renderThreadCommentsContent]', {
         *   commentsHtml,
         *   comments,
         *   threadId,
         * });
         */
        return commentsHtml;
      },
    };

    /** @exports CommentsDataRender
     */
    const CommentsDataRender = {
      __id: 'CommentsDataRender',

      helpers, // Expose helpers (TODO: Refactor to make it hidden?)

      renderError(error) {
        // TODO: Set css class for id="processes-list-root" --> error, update local state
        const isError = !!error;
        const rootNode = CommentsNodes.getRootNode();
        const errorNode = CommentsNodes.getErrorNode();
        rootNode.classList.toggle('error', isError);
        const errorText = error ? error.message || String(error) : '';
        // DEBUG: Show error in console
        if (errorText) {
          // eslint-disable-next-line no-console
          console.error('[CommentsDataRender:renderError]: got the error', {
            error,
            errorText,
          });
          // eslint-disable-next-line no-debugger
          debugger;
        }
        // Update (or clear) error block content...
        errorNode.innerHTML = errorText;
      },

      updateThreadComments(threadId) {
        const commentsNodeId = `comments-for-thread-${threadId}`;
        const commentsNode = document.getElementById(commentsNodeId);
        // Else render the comments list...
        const commentsContent = helpers.renderThreadCommentsContent(threadId);
        /* console.log('[CommentsDataRender:updateThreadComments]', {
         *   commentsContent,
         *   threadId,
         *   commentsNodeId,
         *   commentsNode,
         * });
         */
        commentsNode.innerHTML = commentsContent;
        this.addTitleActionHandlersToNodeChildren(commentsNode);
        commentsNode.classList.toggle('ready', true);
      },

      ensureThreadCommentsReady(threadId) {
        const commentsNodeId = `comments-for-thread-${threadId}`;
        const commentsNode = document.getElementById(commentsNodeId);
        // Do nothing if the node is ready...
        if (!commentsNode.classList.contains('ready')) {
          this.updateThreadComments(threadId);
        }
      },

      updateVisibleThreadsStatus() {
        const rootNode = CommentsNodes.getRootNode();
        const threadsListNode = CommentsNodes.getThreadsListNode();
        const visibleThreadNodes = threadsListNode.querySelectorAll('.thread:not(.hidden)');
        const hasVisibleThreads = !!visibleThreadNodes.length;
        rootNode.classList.toggle('has-visible-threads', hasVisibleThreads);
      },

      // TODO: Is it used?
      clearRenderedData() {
        const threadsListNode = CommentsNodes.getThreadsListNode();
        threadsListNode.replaceChildren();
      },

      /** renderData -- Display new data rows at the end of the table.
       * @param {<TProcessItem[]>} data
       * @param {boolean} [opts.append] - Append data to the end of the table (default behavior: replace)
       */
      renderData(opts = {}) {
        const { threads } = CommentsData;
        const threadsListNode = CommentsNodes.getThreadsListNode();
        const content = threads.map(helpers.renderThread).join('\n');
        /* console.log('[CommentsDataRender:renderData]', {
         *   threadsListNode,
         *   content,
         *   threads,
         * });
         */
        if (!opts.append) {
          // Replace data...
          threadsListNode.innerHTML = content; // Insert content just as raw html
          this.addTitleActionHandlersToNodeChildren(threadsListNode);
          // threadsListNode.replaceChildren.apply(threadsListNode, contentNodes); // Old approach
        } else {
          // Append new data (will be used for incremental update)...
          const contentNodes = CommonHelpers.htmlToElements(content);
          contentNodes.forEach((node) => {
            this.addTitleActionHandlersToNodeChildren(node);
          });
          threadsListNode.append.apply(threadsListNode, contentNodes);
        }
      },

      reorderRenderedThreads() {
        const { threads } = CommentsData;
        const threadsListNode = CommentsNodes.getThreadsListNode();
        const threadNodes = threadsListNode.children;
        const threadNodesList = Array.from(threadNodes);
        const actualIds = threads.map(({ id }) => id);
        const renderedNodesHash = {};
        const renderedIds = threadNodesList.map((node) => {
          const id = Number(node.getAttribute('data-thread-id'));
          renderedNodesHash[id] = node;
          return id;
        });
        // TODO: Compare `actualIds` and `renderedIds`...
        const isTheSameOrder = CommonHelpers.compareArrays(actualIds, renderedIds);
        /* console.log('[CommentsDataRender:reorderRenderedThreads]', {
         *   isTheSameOrder,
         *   threads,
         *   threadsListNode,
         *   threadNodes,
         *   threadNodesList,
         *   actualIds,
         *   renderedIds,
         * });
         */
        if (!isTheSameOrder) {
          const sortedThreadNodesList = actualIds.map((id) => renderedNodesHash[id]);
          // threadsListNode.innerHTML = '';
          threadsListNode.replaceChildren.apply(threadsListNode, sortedThreadNodesList);
        }
      },

      /** clearAllHiddenThreadsComments -- Remove all rendered comments from hidden (non-expanded) threads */
      clearAllHiddenThreadsComments() {
        // const rootNode = CommentsNodes.getRootNode();
        const threadsListNode = CommentsNodes.getThreadsListNode();
        const hiddenCommentNodes = threadsListNode.querySelectorAll(
          '.thread:not(.expanded) .comments.ready',
        );
        /* console.log('[CommentsDataRender:clearAllHiddenThreadsComments]', {
         *   threadsListNode,
         *   hiddenCommentNodes,
         * });
         */
        hiddenCommentNodes.forEach((el) => {
          el.classList.toggle('ready', false);
          el.innerHTML = '';
        });
      },

      renderFilterByUserOptions() {
        const rootNode = CommentsNodes.getRootNode();
        const { users, filterByUsers, sharedParams } = CommentsData;
        const { currentUser } = sharedParams;
        const filterByUsersNode = document.getElementById('filterByUsers');
        const options = users.map((user) => {
          const isSelected = filterByUsers.includes(user);
          const value = CommonHelpers.quoteHtmlAttr(user);
          let text = user;
          if (user === currentUser) {
            text += ' (me)';
          }
          return `<option value="${value}"${isSelected ? ' selected' : ''}>${text}</option>`;
        });
        const hasUsers = !!options.length;
        /* console.log('[CommentsDataRender:renderFilterByUserOptions]', {
         *   options,
         *   hasUsers,
         *   users,
         *   filterByUsersNode,
         * });
         */
        filterByUsersNode.innerHTML = options.join('\n');
        rootNode.classList.toggle('has-users', hasUsers);
      },

      renderFilterByProcessOptions() {
        const rootNode = CommentsNodes.getRootNode();
        const { processIds, processesHash, filterByProcesses } = CommentsData;
        const filterByProcessesNode = document.getElementById('filterByProcesses');
        const options = processIds.map((id) => {
          const process = processesHash[id];
          const processName = CommentsThreadsHelpers.createProcessName(process);
          const isSelected = filterByProcesses.includes(id);
          return `<option value="${id}"${isSelected ? ' selected' : ''}>${processName}</option>`;
        });
        const hasProcesses = !!options.length;
        /* console.log('[CommentsDataRender:renderFilterByProcessOptions]', {
         *   options,
         *   hasProcesses,
         *   processIds,
         *   filterByProcessesNode,
         * });
         */
        filterByProcessesNode.innerHTML = options.join('\n');
        rootNode.classList.toggle('has-processes', hasProcesses);
      },

      renderDerivedFilters() {
        this.renderFilterByUserOptions();
        this.renderFilterByProcessOptions();
      },

      /** Re-render all comments in visible and expanded threads */
      rerenderAllVisibleComments() {
        // Remove all hidden threads comments blocks.
        this.clearAllHiddenThreadsComments();
        // Find all expanded threads...
        const threadsListNode = CommentsNodes.getThreadsListNode();
        const visibleThreadNodes = threadsListNode.querySelectorAll(
          '.thread:not(.hidden).expanded',
        );
        /* console.log('[CommentsDataRender:rerenderAllVisibleComments]', {
         *   visibleThreadNodes,
         * });
         */
        visibleThreadNodes.forEach((commentsNode) => {
          const threadId = Number(commentsNode.getAttribute('data-thread-id'));
          /* console.log('[CommentsDataRender:rerenderAllVisibleComments] iteration', {
           *   commentsNode,
           *   threadId,
           * });
           */
          this.updateThreadComments(threadId);
        });
      },

      updateThreadVisibleState(threadId) {
        const isVisible = CommentsThreadsHelpers.isThreadVisible(threadId);
        const threadNode = document.getElementById(`thread-${threadId}`);
        const isExpanded = threadNode.classList.contains('expanded');
        /* console.log('[CommentsDataRender:updateThreadVisibleState]', {
         *   isExpanded,
         *   threadId,
         *   isVisible,
         * });
         */
        threadNode.classList.toggle('hidden', !isVisible);
        if (isVisible && isExpanded) {
          this.ensureThreadCommentsReady(threadId);
        }
      },

      updateVisibleThreads() {
        const { threads } = CommentsData;
        const threadIds = threads.map(({ id }) => id);
        /* console.log('[CommentsDataRender:updateVisibleThreads]', {
         *   threadIds,
         * });
         */
        threadIds.forEach((threadId) => {
          this.updateThreadVisibleState(threadId);
        });
        this.updateVisibleThreadsStatus();
      },

      addTitleActionHandlersToNodeChildren(node) {
        const elems = node.querySelectorAll('.title-actions a');
        const { handlers } = this;
        const { handleTitleActionClick } = handlers;
        elems.forEach((elem) => {
          elem.addEventListener('click', handleTitleActionClick);
        });
      },

      start({ handlers }) {
        // Save handlers...
        this.handlers = handlers;
        /* // UNUSED: Add update handlers (via `CommentsEvents`)...
         * CommentsEvents.addEventHandler(
         *   'rerenderAllVisibleComments',
         *   this.rerenderAllVisibleComments.bind(this),
         * );
         * CommentsEvents.addEventHandler(
         *   'updateVisibleThreads',
         *   this.updateVisibleThreads.bind(this),
         * );
         */
      },
    };

    // Provide module...
    provide(CommentsDataRender);
  },
);
