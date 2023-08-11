modules.define(
  'CommentsNodes',
  [
    // Required modules...
  ],
  function provide_CommentsNodes(
    provide,
    // Resolved modules...
  ) {
    /** @exports CommentsNodes
     */
    const CommentsNodes = {
      getThreadsListNode() {
        // TODO?
        const node = document.getElementById('threads-list');
        return node;
      },

      getRootNode() {
        const node = document.getElementById('comments-root');
        return node;
      },

      getErrorNode() {
        const node = document.getElementById('comments-error');
        return node;
      },
    };

    // Provide module...
    provide(CommentsNodes);
  },
);
