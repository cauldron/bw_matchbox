modules.define(
  'CommentsUpdaters',
  [
    // Required modules...
  ],
  function provide_CommentsUpdaters(
    provide,
    // Resolved modules...
  ) {
    /** @exports CommentsUpdaters
     */
    const CommentsUpdaters = /** @lends CommentsUpdaters */ {
      __id: 'CommentsUpdaters',

      // Handlers to call on each page update (see `processes-list-states.js`)...
      updatePageHandlers: [],
      updateCommentsHandlers: [],

      addUpdatePageHandler(handler) {
        this.updatePageHandlers.push(handler);
      },

      addUpdateCommentsHandler(handler) {
        this.updateCommentsHandlers.push(handler);
      },

      /** updatePage -- Update all the page dynamic elements
       */
      updatePage() {
        const { updatePageHandlers } = this;
        // Call all the registered update handlers...
        updatePageHandlers.forEach((handler) => {
          try {
            if (handler) {
              handler();
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('[CommentsStates:updatePage]: error (catched)', {
              error,
              handler,
            });
            // eslint-disable-next-line no-debugger
            debugger;
          }
        });
      },

      /** updateComments -- Update all the comments dynamic elements
       */
      updateComments() {
        const { updateCommentsHandlers } = this;
        // Call all the registered update handlers...
        updateCommentsHandlers.forEach((handler) => {
          try {
            if (handler) {
              handler();
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('[CommentsStates:updateComments]: error (catched)', {
              error,
              handler,
            });
            // eslint-disable-next-line no-debugger
            debugger;
          }
        });
      },


    };

    // Provide module...
    provide(CommentsUpdaters);
  },
);
