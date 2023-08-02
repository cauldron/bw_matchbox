/** @descr Get dom nodes
 *
 * TODO:
 *   - Cache found nodes?
 *   - Throw error if node not found?
 */

// global module variable
const ProcessesListNodes = {
  getSearchBarNode() {
    const node = document.getElementById('query_string');
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
