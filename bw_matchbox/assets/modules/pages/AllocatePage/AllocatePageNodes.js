// @ts-check

/**
 * @class AllocatePageNodes
 */
export class AllocatePageNodes {
  /** @type {HTMLElement} */
  rootNode;

  /**
   * @param {object} [params]
   * @param {HTMLElement} [params.rootNode]
   */
  constructor(params = {}) {
    if (params.rootNode) {
      this.rootNode = params.rootNode;
    }
  }

  /**
   * @param {HTMLElement} rootNode
   */
  setRootNode(rootNode) {
    this.rootNode = rootNode;
  }

  getRootNode() {
    if (!this.rootNode) {
      this.rootNode = document.getElementById('allocate-layout');
    }
    return this.rootNode;
  }

  getTechnosphereInputsNode() {
    const rootNode = this.getRootNode();
    // TODO?
    return rootNode.querySelector('#technosphere-inputs');
  }

  getErrorNode() {
    const rootNode = this.getRootNode();
    // TODO?
    return rootNode.querySelector('.info-tableau .error');
  }
}
