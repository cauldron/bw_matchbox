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

  /** @return {HTMLElement} */
  getGroupsToolbarNode() {
    const columnsLayout = this.getRootNode();
    return columnsLayout.querySelector('#allocate-groups-toolbar');
  }

  /** @return {HTMLElement} */
  getGroupsListNode() {
    const columnsLayout = this.getRootNode();
    return columnsLayout.querySelector('#allocate-groups-list');
  }

  /** @return {HTMLElement} */
  getSourcesColumnNode() {
    const columnsLayout = this.getRootNode();
    return columnsLayout.querySelector('#allocate-sources-column');
  }

  /**
   * @param {TAllocationType} type
   * @return {HTMLElement}
   */
  getInputsListNode(type) {
    const sourcesColumnNode = this.getSourcesColumnNode();
    return sourcesColumnNode.querySelector('#' + type + '-inputs');
  }

  getColumnsLayoutNode() {
    const columnsLayout = this.getRootNode();
    return columnsLayout.querySelector('#allocate-columns-layout');
  }

  getStatisticsNode() {
    const rootNode = this.getRootNode();
    return rootNode.querySelector('#statistics-info');
  }

  getErrorNode() {
    const rootNode = this.getRootNode();
    return rootNode.querySelector('.info-tableau .error');
  }
}
