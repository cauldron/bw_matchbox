// @ts-check

export const ThreadCommentsNodes = {
  /** @type {Element} */
  threadsListNode: undefined,
  /** @type {Element} */
  errorNode: undefined,

  /**
   * @param {Element} node
   */
  setThreadsListNode(node) {
    this.threadsListNode = node;
  },

  /**
   * @param {Element} node
   */
  setErrorNode(node) {
    this.errorNode = node;
  },

  getThreadsListNode() {
    return this.threadsListNode;
  },

  getErrorNode() {
    return this.errorNode;
  },

  /* // UNUSED: getRootNode
   * getRootNode() {
   *   const node = document.getElementById('comments-root');
   *   return node;
   * },
   */
};
