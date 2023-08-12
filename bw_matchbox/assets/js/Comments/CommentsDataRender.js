modules.define(
  'CommentsDataRender',
  [
    // Required modules...
    'CommonHelpers',
    'CommentsHandlers',
    'CommentsConstants',
    'CommentsData',
    'CommentsNodes',
  ],
  function provide_CommentsDataRender(
    provide,
    // Resolved modules...
    CommonHelpers,
    CommentsHandlers,
    CommentsConstants,
    CommentsData,
    CommentsNodes,
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

      getDateTimeFormatter() {
        if (!helpers.dateTimeFormatter) {
          helpers.dateTimeFormatter = new Intl.DateTimeFormat(
            CommentsConstants.dateTimeFormatLocale,
            CommentsConstants.dateTimeFormatOptions,
          );
        }
        return helpers.dateTimeFormatter;
      },

      /** renderThread
       * @param {<TLocalThread>} thread
       * @return {string} - HTML content
       */
      renderThread(thread) {
        /** @type {<TLocalThread>} */
        const {
          id: threadId,
          // created, // TDateStr, eg: 'Sat, 12 Aug 2023 12:36:08 GMT'
          modified, // TDateStr, eg: 'Sat, 12 Aug 2023 12:36:08 GMT'
          name, // string, eg: 'Возмутиться кпсс гул'
          reporter, // string, eg: '阿部 篤司'
          // resolved, // boolean, eg: false
          // process, // TCommentProcess;
        } = thread;
        // const { comments, commentsByThreads } = CommentsData;
        const commentsList = helpers.getCommentsForThread(threadId);
        const commentPositions = commentsList.map((comment) => comment.position);
        const commentsCount = commentsList.length;
        const isEmpty = !commentsCount;
        const isExpanded = false; // commentsCount <= 2; // DEBUG!
        const className = [
          // prettier-ignore
          'thread',
          isEmpty && 'empty',
          isExpanded && 'expanded',
        ]
          .filter(Boolean)
          .join(' ');
        const modifiedDate = new Date(modified);
        const dateTimeFormatter = helpers.getDateTimeFormatter();
        const modifiedStr = dateTimeFormatter.format(modifiedDate);
        console.log('[CommentsDataRender:renderThread]', {
          modifiedDate,
          modifiedStr,
          modified,
          dateTimeFormatter,
        });
        // TODO: Render actual comments if thread is expanded by default
        const commentsContent = isExpanded
          ? helpers.renderThreadCommentsContent(threadId)
          : // DEBUG: Here should be empty data for the unexpanded thread comments...
            commentPositions.join(', ');
        const content = `
          <div data-thread-id="${threadId}" class="${className}">
            <div class="main-row" onClick="Comments.handleExpandThread(this)">
              <div class="expand-button-wrapper">
                <a class="expand-button">
                  <i class="fa-solid fa-chevron-right"></i>
                </a>
              </div>
              <div class="title">
                <div class="title-text">
                  <span class="name">${name}</span>
                  <span class="info">(reporter: ${reporter}, comments: ${commentsCount}, modified date: ${modifiedStr})</span>
                </div>
                <div class="title-actions">
                  <a id="thread-comment""><i class="fa-regular fa-comment"></i></a>
                  <a id="thread-resolve""><i class="fa-solid fa-xmark"></i></a>
                </div>
              </div>
            </div>
            <div class="comments" id="comments-for-thread-${threadId}">${commentsContent}</div>
          </div>
        `;
        console.log('[CommentsDataRender:helpers:renderThread]', {
          content,
          commentPositions,
          threadId,
          name,
          reporter,
          commentsList,
          thread,
        });
        return content;
      },

      renderComment(comment) {
        const {
          content, // string; // '...'
          position, // number; // 10
          resolved, // boolean; // true
          thread_id, // number; // 13
          // thread_name, // string; // 'Consequatur exercita'
          // thread_reporter, // string; // 'Reporter Name'
          user, // string; // 'Ida Trombetta'
          process, // TCommentProcess;
        } = comment;
        const className = [
          // prettier-ignore
          'comment',
          resolved && 'resolved',
        ]
          .filter(Boolean)
          .join(' ');
        const html = `
          <div
            class="${className}"
            data-position="${position}"
            data-thread-id="${thread_id}"
          >
            <div class="title">
              <div class="title-text">
                <span class="user">${user}</span>
              </div>
              <div class="title-actions">
                <a id="comment-comment""><i class="fa-regular fa-comment"></i></a>
                <a id="comment-resolve""><i class="fa-solid fa-xmark"></i></a>
              </div>
            </div>
            <div class="content">
              ${content}
            </div>
          </div>
        `;
        console.log('[CommentsDataRender:helpers:renderComment]', {
          html,
          //\\
          content, // string; // '...'
          position, // number; // 10
          resolved, // boolean; // true
          thread_id, // number; // 13
          // thread_name, // string; // 'Consequatur exercita'
          // thread_reporter, // string; // 'Reporter Name'
          user, // string; // 'Ida Trombetta'
          process, // TCommentProcess;
          //\\
          comment,
        });
        return html;
      },

      renderThreadCommentsContent(threadId) {
        const comments = helpers.getCommentsForThread(threadId);
        const commentsHtml = comments.map(helpers.renderComment).join('\n');
        console.log('[CommentsDataRender:helpers:renderThreadCommentsContent]', {
          commentsHtml,
          comments,
          threadId,
        });
        return commentsHtml;
      },
    };

    /** @exports CommentsDataRender
     */
    const CommentsDataRender = {
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

      ensureThreadCommentsReady(threadId) {
        const commentsElId = `comments-for-thread-${threadId}`;
        const commentsEl = document.getElementById(commentsElId);
        // Do nothing if the node is ready...
        if (commentsEl.classList.contains('ready')) {
          return;
        }
        // Else render the comments list...
        const htmlsContent = helpers.renderThreadCommentsContent(threadId);
        console.log('[CommentsDataRender:ensureThreadCommentsReady]', {
          htmlsContent,
          threadId,
          commentsElId,
          commentsEl,
        });
        commentsEl.innerHTML = htmlsContent;
        CommentsHandlers.addTitleActionHandlersToNodeChildren(commentsEl);
        commentsEl.classList.toggle('ready', true);
      },

      // TODO?
      clearRenderedData() {
        const threadsNode = CommentsNodes.getThreadsListNode();
        threadsNode.replaceChildren();
      },

      /** renderData -- Display new data rows at the end of the table.
       * @param {<TProcessItem[]>} data
       * @param {boolean} [opts.append] - Append data to the end of the table (default behavior: replace)
       */
      renderData(opts = {}) {
        const { threads, comments } = CommentsData;
        const threadsNode = CommentsNodes.getThreadsListNode();
        const content = threads.map(helpers.renderThread).join('\n');
        console.log('[CommentsDataRender:renderData]', {
          threadsNode,
          content,
          threads,
          comments,
        });
        if (!opts.append) {
          // Replace data...
          threadsNode.innerHTML = content; // Insert content just as raw html
          CommentsHandlers.addTitleActionHandlersToNodeChildren(threadsNode);
          // threadsNode.replaceChildren.apply(threadsNode, contentNodes); // Old approach
        } else {
          // Append new data (will be used for incremental update)...
          const contentNodes = CommonHelpers.htmlToElements(content);
          contentNodes.forEach((node) => {
            CommentsHandlers.addTitleActionHandlersToNodeChildren(node);
          });
          threadsNode.append.apply(threadsNode, contentNodes);
        }
      },
    };

    // Provide module...
    provide(CommentsDataRender);
  },
);
