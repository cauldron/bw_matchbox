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
      /** Api base */
      processesApiUrl: '/processes',
      /** The number of records to retrieve at once and to display */
      pageSize: 25,
      /** Default order value */
      defaultOrderBy: 'random',
      /** Default filter value */
      defaultFilterBy: 'unmatched',
    };

    // Provide module...
    provide(ProcessesListConstants);
  },
);
