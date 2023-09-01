// @ts-check

export const ThreadCommentsNodes = {
  /** @type {Element} */
  rootNode: undefined,
  /** @type {Element} */
  errorNode: undefined,

  /**
   * @param {Element} rootNode
   */
  setRootNode(rootNode) {
    if (!rootNode) {
      const error = new Error('Passed undefined root node');
      // eslint-disable-next-line no-console
      console.error('[ThreadCommentsNodes:setRootNode]: error', error);
      // eslint-disable-next-line no-debugger
      debugger;
      throw error;
    }
    this.rootNode = rootNode;
  },

  getRootNode() {
    if (!this.rootNode) {
      const error = new Error('Root node should be defined with setErrorNode');
      // eslint-disable-next-line no-console
      console.error('[ThreadCommentsNodes:getRootNode]: error', error);
      // eslint-disable-next-line no-debugger
      debugger;
      throw error;
    }
    return this.rootNode;
  },

  getErrorNode() {
    const rootNode = this.getRootNode();
    return rootNode.querySelector('#threads-list-error');
  },

  getEmptyInfoNode() {
    const rootNode = this.getRootNode();
    return rootNode.querySelector('#threads-list-empty');
  },

  getThreadsListNode() {
    const rootNode = this.getRootNode();
    return rootNode.querySelector('#threads-list');
  },

  getLoaderSplashNode() {
    const rootNode = this.getRootNode();
    return rootNode.querySelector('#loader-splash');
  },
};
