modules.define(
  'CommentsDataRender',
  [
    // Required modules...
    'CommonHelpers',
    'CommentsData',
    'CommentsNodes',
  ],
  function provide_CommentsDataRender(
    provide,
    // Resolved modules...
    CommonHelpers,
    CommentsData,
    CommentsNodes,
  ) {
    /** Local (not public) helpers... */
    const helpers = {
      /** renderThread
       * @param {<TLocalThread>} thread
       * @return {string} - HTML content
       */
      renderThread(thread) {
        /** @type {<TLocalThread>} */
        const {
          // prettier-ignore
          id: threadId,
          name,
          reporter,
          comments,
        } = thread;
        const commentPositions = comments.map((comment) => comment.position);
        const commentsCount = comments.length;
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
        // TODO: Render actual comments if thread is expanded by default
        const commentsContent = isExpanded
          ? helpers.renderThreadCommentsContent(threadId)
          : // DEBUG: Here should be empty data for the unexpanded thread comments...
            commentPositions.join(', ');
        const content = `
          <div data-thread-id="${threadId}" class="${className}">
            <div class="main-row">
              <div class="expand-button-wrapper">
                <a class="expand-button" onClick="Comments.handleExpandThread(this)">
                  <i class="fa-solid fa-chevron-right"></i>
                </a>
              </div>
              <div class="title">
                <div class="title-text">
                  <span class="name">${name}</span>
                  <span class="reporter">(reporter: ${reporter}, comments: ${commentsCount})</span>
                </div>
                <div class="title-actions">
                  <a><i class="fa-regular fa-comment"></i></a>
                  <a><i class="fa-solid fa-xmark"></i></a>
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
          comments,
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
                <a><i class="fa-regular fa-comment"></i></a>
                <a><i class="fa-solid fa-xmark"></i></a>
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

      getCommentsForThread(threadId) {
        const thread = CommentsData.threadsHash[threadId];
        const { comments } = thread;
        // TODO: Catch no data/empty data errors?
        return comments;
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
          // threadsNode.replaceChildren.apply(threadsNode, contentNodes); // Old approach
        } else {
          // Append new data (will be used for incremental update)...
          const contentNodes = CommonHelpers.htmlToElements(content);
          threadsNode.append.apply(threadsNode, contentNodes);
        }
      },
    };

    // Provide module...
    provide(CommentsDataRender);
  },
);
