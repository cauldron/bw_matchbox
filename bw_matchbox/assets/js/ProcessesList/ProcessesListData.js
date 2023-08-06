modules.define(
  'ProcessesListData',
  [
    // Required modules...
    'ProcessesListConstants',
  ],
  function provide_ProcessesListData(
    provide,
    // Resolved modules...
    ProcessesListConstants,
  ) {
    // Define module...

    /** @descr Common data storage
     */

    // global module variable
    // eslint-disable-next-line no-unused-vars
    const ProcessesListData = {
      __id: 'ProcessesListData',

      // Owner page's provided data...
      sharedParams: undefined,

      // Data params...

      // Control for `order_by` parameter (name, location, product; default (empty) -- random.
      orderBy: ProcessesListConstants.defaultOrderBy, // 'random' | 'name' | 'location' | 'product'
      filterBy: ProcessesListConstants.defaultFilterBy, // 'matched' | 'unmatched' | 'waitlist'
      database: '',
      searchValue: '',

      // Stored dom nodes...
      searchBar: undefined,

      // Page state...
      totalRecords: 0,
      currentPage: 0,
      error: undefined,
      isError: false,
      isLoading: true,
      hasData: false,

      // Handlers to call on each page update (see `processes-list-states.js`)...
      updatePageHandlers: [],
    };

    // Provide module...
    provide(ProcessesListData);
  },
);
