modules.define(
  'CommentsEvents',
  [
    // Required modules...
  ],
  function provide_CommentsEvents(
    provide,
    // Resolved modules...
  ) {
    const handlers = {};

    /** @exports CommentsEvents
     */
    const CommentsEvents = /** @lends CommentsEvents */ {
      __id: 'CommentsEvents',

      /**
       * @param {string} id
       * @param {function} handler
       */
      addEventHandler(id, handler) {
        if (handler && typeof handler === 'function') {
          if (!handlers[id]) {
            handlers[id] = [];
          }
          handlers[id].push(handler);
        }
      },

      /**
       * @param {string} id
       * @param {any} [arg]
       */
      invokeEvent(id, arg) {
        const handlersList = handlers[id];
        if (!handlersList) {
          // Error if no event exist!
          const error = new Error('Trying to invoke absent event: ' + id);
          console.warn('[CommentsEvents:invokeEvent]: warning', error);
          // throw error;
          return;
        }
        if (!Array.isArray(handlersList) || !handlersList.length) {
          // Do nothing for empty handlers list
          return;
        }
        // Call all the registered update handlers...
        handlersList.forEach((handler) => {
          try {
            if (handler) {
              handler(arg);
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('[CommentsEvents:invokeEvent]: error (catched)', {
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
    provide(CommentsEvents);
  },
);
