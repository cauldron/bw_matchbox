modules.define(
  'CompareRowClick',
  [
    // Required modules...
  ],
  function provide_CompareRowClick(
    provide,
    // Resolved modules...
  ) {
    // Define module...

    const CompareRowClick = {
      // Public data...
      disabled: false, // public

      // Private data...
      timeout: 100,
      releaseHandler: undefined,

      /** clearRowClickHandler - Clear row click disbale timer handler.
       */
      clearRowClickHandler: function () {
        if (CompareRowClick.releaseHandler) {
          clearTimeout(CompareRowClick.releaseHandler);
          CompareRowClick.releaseHandler = undefined;
        }
      },

      /** releaseRowClick - Enable processing of `clickRow`
       */
      releaseRowClick: function () {
        CompareRowClick.disabled = false;
        CompareRowClick.clearRowClickHandler();
      },

      /** disableRowClick - Disable processing of `clickRow` handlers for some time (allow to process clicks on inner elements)
       */
      disableRowClick: function () {
        CompareRowClick.clearRowClickHandler();
        CompareRowClick.disabled = true;
        setTimeout(CompareRowClick.releaseRowClick, CompareRowClick.timeout);
      },
    };

    provide(CompareRowClick);
  },
);
