// @ts-check

export const CompareRowClick = {
  // Public data...
  disabled: false, // public

  // Private data...
  timeout: 100,
  releaseHandler: undefined,

  /** clearRowClickHandler - Clear row click disbale timer handler.
   */
  clearRowClickHandler() {
    if (CompareRowClick.releaseHandler) {
      clearTimeout(CompareRowClick.releaseHandler);
      CompareRowClick.releaseHandler = undefined;
    }
  },

  /** releaseRowClick - Enable processing of `clickRowHandler`
   */
  releaseRowClick() {
    CompareRowClick.disabled = false;
    CompareRowClick.clearRowClickHandler();
  },

  /** disableRowClickHandler - Disable processing of `clickRow` handlers for some time (allow to process clicks on inner elements)
   */
  disableRowClickHandler() {
    CompareRowClick.clearRowClickHandler();
    CompareRowClick.disabled = true;
    setTimeout(CompareRowClick.releaseRowClick, CompareRowClick.timeout);
  },
};
