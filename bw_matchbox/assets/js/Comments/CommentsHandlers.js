modules.define(
  'CommentsHandlers',
  [
    // Required modules...
    'CommentsData',
    'CommentsUpdaters',
  ],
  function provide_CommentsHandlers(
    provide,
    // Resolved modules...
    CommentsData,
    CommentsUpdaters,
  ) {
    /** @exports CommentsHandlers
     */
    const CommentsHandlers = /** @lends CommentsHandlers */ {
      __id: 'CommentsHandlers',

      boundActionClickHandler: undefined,

      getBoundActionClickHandler() {
        if (!this.boundActionClickHandler) {
          this.boundActionClickHandler = this.handleActionClick.bind(this);
        }
        return this.boundActionClickHandler;
      },

      handleActionClick(event) {
        event.preventDefault();
        event.stopPropagation();
        const { currentTarget } = event;
        const { id } = currentTarget;
        console.log('[Comments:handleActionClick]', id, {
          id,
          currentTarget,
          event,
        });
      },

      addTitleActionHandlersToNodeChildren(node) {
        const elems = node.querySelectorAll('.title-actions a');
        const handler = this.getBoundActionClickHandler();
        elems.forEach((elem) => {
          elem.addEventListener('click', handler);
        });
      },

      handleFilterByStateChange(node) {
        const { value } = node;
        console.log('[CommentsHandlers:handleFilterByStateChange]', {
          node,
        });
        CommentsData.filterByState = value;
        CommentsUpdaters.updateComments();
      },
    };

    // Provide module...
    provide(CommentsHandlers);
  },
);
