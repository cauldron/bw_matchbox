/* global
    ProcessesListData,
    ProcessesListNodes,
*/

/** @descr Control component's states
 */

// global module variable
// eslint-disable-next-line no-unused-vars
const ProcessesListStates = {
  // clearData
  // loadNextPage

  setLoading(isLoading) {
    // Set css class for id="processes-list-root" --> loading, set local status
    const rootNode = ProcessesListNodes.getRootNode();
    rootNode.classList.toggle('loading', isLoading);
    ProcessesListData.isLoading = isLoading;
  },

  setHasData(hasData) {
    // TODO: Set css class for id="processes-list-root" --> empty, update local state
    const rootNode = ProcessesListNodes.getRootNode();
    rootNode.classList.toggle('empty', !hasData);
    ProcessesListData.hasData = hasData;
  },

  /* * setEmpty(isEmpty) {
   *   this.setHasData(false);
   * },
   */

  setError(error) {
    // TODO: Set css class for id="processes-list-root" --> error, update local state
    const isError = !!error;
    const rootNode = ProcessesListNodes.getRootNode();
    const errorNode = ProcessesListNodes.getErrorNode();
    rootNode.classList.toggle('error', isError);
    ProcessesListData.isError = isError;
    ProcessesListData.error = error;
    const errorText = error ? error.message || String(error) : '';
    // DEBUG
    if (errorText) {
      // eslint-disable-next-line no-console
      console.error('setError: got the error', {
        error,
        errorText,
      });
      // eslint-disable-next-line no-debugger
      debugger;
    }
    // Update error block content...
    errorNode.innerHTML = errorText;
  },

  /** updatePage -- Update all the page dynamic elements
   */
  updatePage() {
    const { updatePageHandlers } = ProcessesListData;
    // Call all the registered update handlers...
    updatePageHandlers.forEach((handler) => {
      try {
        if (handler) {
          handler();
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('updatePage: error (catched)', {
          error,
          handler,
        });
        // eslint-disable-next-line no-debugger
        debugger;
      }
    });
  },
};
