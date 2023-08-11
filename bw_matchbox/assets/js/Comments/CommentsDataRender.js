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
    /** Local helpers... */
    const helpers = {
      /** renderThread
       * @param {<TThread>} thread
       * @return {string} - HTML content
       */
      renderThread(thread) {
        /** @type {<TThread>} */
        const {
          // prettier-ignore
          id,
          name,
          reporter,
          comments,
        } = thread;
        const commentPositions = comments.map((comment) => comment.position);
        const content = `
          <div data-thread-id="${id}" class="thread">
            <div class="thread-name">Name: ${name}</div>
            <div class="thread-reporter">Reporter: ${reporter}</div>
            <div class="thread-comments">${commentPositions.join(', ')}</div>
          </div>
        `;
        console.log('[CommentsDataRender:helpers:renderThread]', {
          content,
          commentPositions,
          id,
          name,
          reporter,
          comments,
          thread,
        });
        return content;
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
