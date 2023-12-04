// @ts-check

export class ScoresListNodes {
  /** @type {Element} */
  rootNode = undefined;
  /** @type {Element} */
  errorNode = undefined;

  /**
   * @param {Element} rootNode
   */
  setRootNode(rootNode) {
    if (!rootNode) {
      const error = new Error('Passed undefined root node');
      // eslint-disable-next-line no-console
      console.error('[ScoresListNodes:setRootNode]: error', error);
      // eslint-disable-next-line no-debugger
      debugger;
      throw error;
    }
    this.rootNode = rootNode;
  }

  getRootNode() {
    if (!this.rootNode) {
      const error = new Error('Root node should be defined with setErrorNode');
      // eslint-disable-next-line no-console
      console.error('[ScoresListNodes:getRootNode]: error', error);
      // eslint-disable-next-line no-debugger
      debugger;
      throw error;
    }
    return this.rootNode;
  }

  getErrorNode() {
    const rootNode = this.getRootNode();
    return rootNode.querySelector('#scores-list-error');
  }

  getEmptyInfoNode() {
    const rootNode = this.getRootNode();
    return rootNode.querySelector('#scores-list-empty');
  }

  getScoresContainerNode() {
    const rootNode = this.getRootNode();
    return rootNode.querySelector('#scores-list-container');
  }

  getScoresListNode() {
    const rootNode = this.getRootNode();
    return rootNode.querySelector('#scores-list');
  }

  getLoaderSplashNode() {
    const rootNode = this.getRootNode();
    return rootNode.querySelector('#loader-splash');
  }
}
