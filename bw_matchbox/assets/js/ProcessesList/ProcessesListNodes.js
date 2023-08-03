modules.define(
  'ProcessesListNodes',
  [
    // Required modules...
  ],
  function provide_ProcessesListNodes(
    provide,
    // Resolved modules...
  ) {
    // Define module...

    /** @descr Get dom nodes
     *
     * TODO:
     *   - Cache found nodes?
     *   - Throw error if node not found?
     */

    // global module variable
    // eslint-disable-next-line no-unused-vars
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

    // Provide module...
    provide(ProcessesListNodes);
  },
);
