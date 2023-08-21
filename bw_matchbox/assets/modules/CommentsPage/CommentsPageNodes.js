export const CommentsPageNodes = {
  __id: 'CommentsPageNodes',

  getThreadCommentsNode() {
    return document.getElementById('thread-comments');
  },

  getErrorNode() {
    return document.getElementById('comments-error');
  },

  getRootNode() {
    return document.getElementById('comments-root');
  },
};
