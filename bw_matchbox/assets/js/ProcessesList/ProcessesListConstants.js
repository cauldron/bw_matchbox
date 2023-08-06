modules.define(
  'ProcessesListConstants',
  [
    // Required modules...
  ],
  function provide_ProcessesListConstants(
    provide,
    // Resolved modules...
  ) {
    // Define module...

    /* @desc Shared constants
     */

    const ProcessesListConstants = {
      __id: 'ProcessesListConstants',

      // DEBUG
      useDebug: false, // Don't use it for production!

      /** Api base */
      processesApiUrl: '/processes',
      /** The number of records to retrieve at once and to display */
      pageSize: 25,
      /** Default order value */
      defaultOrderBy: 'random',
      /** Default filter value */
      defaultFilterBy: 'none',
      /** Default userDb value */
      defaultUserDb: 'source', // `Source` is the same as the server provided data
    };

    // Provide module...
    provide(ProcessesListConstants);
  },
);
