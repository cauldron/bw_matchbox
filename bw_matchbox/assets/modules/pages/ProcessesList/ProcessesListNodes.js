// @ts-check

export const ProcessesListNodes = {
  getSearchBarNode() {
    const node = /** @type {HTMLInputElement} */ (document.getElementById('query_string'));
    return node;
  },

  getTBodyNode() {
    const node = document.getElementById('processes-list-table-body');
    return node;
  },

  getRootNode() {
    const node = document.getElementById('processes-list-root');
    return node;
  },

  getNavigationNode() {
    const node = document.getElementById('processes-list-navigation');
    return node;
  },

  getErrorNode() {
    const node = document.getElementById('processes-list-error');
    return node;
  },
};
