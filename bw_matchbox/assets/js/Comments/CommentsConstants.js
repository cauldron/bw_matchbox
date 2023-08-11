modules.define(
  'CommentsConstants',
  [
    // Required modules...
  ],
  function provide_CommentsConstants(
    provide,
    // Resolved modules...
  ) {
    // Define module...

    /* @desc Shared constants
     */
    const CommentsConstants = {
      __id: 'CommentsConstants',

      // DEBUG: useDebug -- specify debug mode. Don't use it for production!
      useDebug: false,

      /** Api base */
      commentsApiUrl: '/comments-api',

      /** The number of records to retrieve at once and to display */
      pageSize: 25,
    };

    // Provide module...
    provide(CommentsConstants);
  },
);
