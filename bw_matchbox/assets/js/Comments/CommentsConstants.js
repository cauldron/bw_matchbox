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
      readCommentsApiUrl: '/comments/read',

      /** Intl.DateTimeFormat parameters... */
      dateTimeFormatLocale: 'en-GB',
      dateTimeFormatOptions: {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        // second: 'numeric',
      },
    };

    // Provide module...
    provide(CommentsConstants);
  },
);
