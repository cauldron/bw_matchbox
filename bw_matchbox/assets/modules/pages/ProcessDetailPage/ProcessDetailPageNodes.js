// @ts-check

/**
 * @class ProcessDetailPageNodes
 */
export class ProcessDetailPageNodes {
  getLayoutNode() {
    return document.getElementById('process-detail-layout');
  }

  getSidePanelNode() {
    const layoutNode = this.getLayoutNode();
    return layoutNode.querySelector('#process-detail-panel');
  }

  getSidePanelTabsNode() {
    const sidePanelNode = this.getSidePanelNode();
    return sidePanelNode.querySelector('#panels-layout-tabs');
  }

  getRootNode() {
    return document.getElementById('process-detail');
  }

  getThreadCommentsNode() {
    // Assumning single comments component?
    const layoutNode = this.getLayoutNode();
    return layoutNode.querySelector('#thread-comments');
  }

  getScoresListNode() {
    const layoutNode = this.getLayoutNode();
    return layoutNode.querySelector('#scores-list-panel');
  }
  getErrorNode() {
    const rootNode = this.getRootNode();
    return rootNode.querySelector('.info-tableau .error');
  }
}
