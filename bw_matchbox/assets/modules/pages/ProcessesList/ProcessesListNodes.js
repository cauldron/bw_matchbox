// @ts-check

export const ProcessesListNodes = {
  getSearchBarNode() {
    return /** @type {HTMLInputElement} */ (document.getElementById('query_string'));
  },

  getLayoutNode() {
    return document.getElementById('processes-list-layout');
  },

  getRecentProcessesListNode() {
    return document.getElementById('recent-processes-list');
  },

  getRecentProcessesListPanelNode() {
    return document.getElementById('recent-processes-list-panel');
  },

  getRecentProcessesContainerNode() {
    const recentProcessesListPanelNode = this.getRecentProcessesListPanelNode();
    return recentProcessesListPanelNode.querySelector('#recent-processes-container');
  },
  getTBodyNode() {
    return document.getElementById('processes-list-table-body');
  },

  getRootNode() {
    return document.getElementById('processes-list-root');
  },

  getNavigationNode() {
    return document.getElementById('processes-list-navigation');
  },

  getErrorNode() {
    return document.getElementById('processes-list-error');
  },
};
