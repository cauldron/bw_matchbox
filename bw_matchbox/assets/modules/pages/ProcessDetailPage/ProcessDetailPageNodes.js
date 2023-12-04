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

  getRootNode() {
    return document.getElementById('process-detail');
  }

  getThreadCommentsNode() {
    // Assumning single comments component?
    return document.getElementById('thread-comments');
  }

  getErrorNode() {
    const rootNode = this.getRootNode();
    return rootNode.querySelector('.info-tableau .error');
  }
}
