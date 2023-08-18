export const CommentsPageNodes = {
  __id: 'CommentsPageNodes',

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
