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

      /** Api base */
      processesApiUrl: '/processes',
      /** The number of records to retrieve at once and to display */
      pageSize: 25,
      /** Default order value */
      defaultOrderBy: 'random',
      /** Default filter value */
      defaultFilterBy: 'none', // 'None'
    };

    // Provide module...
    provide(ProcessesListConstants);
  },
);
