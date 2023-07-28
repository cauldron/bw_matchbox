// global module variable
const compareRowClick = {
  // Public data...
  disabled: false, // public

  // Private data...
  timeout: 100,
  releaseHandler: undefined,

  /** clearRowClickHandler - Clear row click disbale timer handler.
   */
  clearRowClickHandler: function () {
    if (compareRowClick.releaseHandler) {
      clearTimeout(compareRowClick.releaseHandler);
      compareRowClick.releaseHandler = undefined;
    }
  },

  /** releaseRowClick - Enable processing of `clickRow`
   */
  releaseRowClick: function () {
    compareRowClick.disabled = false;
    compareRowClick.clearRowClickHandler();
  },

  /** disableRowClick - Disable processing of `clickRow` handlers for some time (allow to process clicks on inner elements)
   */
  disableRowClick: function () {
    compareRowClick.clearRowClickHandler();
    compareRowClick.disabled = true;
    setTimeout(compareRowClick.releaseRowClick, compareRowClick.timeout);
  },
};
