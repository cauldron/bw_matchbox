// @ts-check

/**
 * @class AllocatePageNodes
 */
export class AllocatePageNodes {
  getRootNode() {
    return document.getElementById('allocate-layout');
  }

  getErrorNode() {
    const rootNode = this.getRootNode();
    // TODO?
    return rootNode.querySelector('.info-tableau .error');
  }
}
