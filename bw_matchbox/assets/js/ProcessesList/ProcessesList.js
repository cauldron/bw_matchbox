modules.define(
  'ProcessesList',
  [
    // Required modules...
    'CommonHelpers',
    'ProcessesListConstants',
    'ProcessesListData',
    'ProcessesListDataLoad',
    'ProcessesListDataRender',
    'ProcessesListNodes',
    'ProcessesListSearch',
    'ProcessesListStates',
  ],
  function provide_ProcessesList(
    provide,
    // Resolved modules...
    CommonHelpers,
    ProcessesListConstants,
    ProcessesListData,
    ProcessesListDataLoad,
    ProcessesListDataRender,
    ProcessesListNodes,
    ProcessesListSearch,
    ProcessesListStates,
  ) {
    // Define module...

    /** @descr Process list table client code.
     *
     * TODO:
     *
     * - Add fallback for 'Reload' (reload last data chunk) if error occured.
     */

    // NOTE: Don't forget to call `startAllModules` for all the used modules...
    const allModulesList = [
      ProcessesListConstants,
      ProcessesListData,
      ProcessesListNodes,
      ProcessesListStates,
      ProcessesListSearch,
      ProcessesListDataRender,
      ProcessesListDataLoad,
    ];

    // global module variable
    const ProcessesList = {
      // Proxy handlers...

      /** Update value of 'order by' parameter from user */
      onOrderByChange(target) {
        // TODO: Move to Handlers module?
        const { value } = target;
        ProcessesListStates.setOrderBy(value);
        ProcessesListDataLoad.loadData();
      },

      /** Update value of 'filterBy' parameter from user */
      onFilterByChange(target) {
        // TODO: Move to Handlers module?
        const { value } = target;
        ProcessesListStates.setFilterBy(value);
        ProcessesListDataLoad.loadData();
      },

      /** Update value of 'userDb' parameter from user */
      onUserDbChange(target) {
        // TODO: Move to Handlers module?
        const { value } = target;
        ProcessesListStates.setUserDb(value);
        ProcessesListDataLoad.loadData();
      },

      // Data methods...

      /** clearAndReloadData -- Reload entire data (clear and load only first chunk)
       */
      clearAndReloadData() {
        ProcessesListStates.clearData();
        ProcessesListDataLoad.loadData();
      },

      /** reloadLastData -- Reload last data chank (TODO, in progress)
       */
      reloadLastData() {
        ProcessesListDataLoad.loadData({ update: true }); // TODO
      },

      loadMoreData() {
        ProcessesListData.currentPage++;
        ProcessesListDataLoad.loadData();
      },

      /** Get all the parameters passed in the url query */
      fetchUrlParams() {
        // Get & store the database value form the url query...
        const urlParams = CommonHelpers.parseQuery(window.location.search);
        const {
          // database, // UNUSED: #41: Using `databases` and `userDb`
          q: searchValue,
        } = urlParams;
        /* // UNUSED: Get database from url or from server-passed data... (Used only for `searchUrl` requests.)
         * ProcessesListData.database = database || ProcessesListData.sharedParams.database;
         */
        ProcessesListData.searchValue = searchValue || '';
      },

      /** startAllModules -- Start all the modules
       */
      startAllModules() {
        // Start all the modules...
        allModulesList.forEach((module) => {
          if (module && typeof module.start === 'function') {
            try {
              module.start();
              /* // Alternate option: Delayed start...
               * setTimeout(module.start.bind(module), 0);
               */
            } catch (error) {
              // eslint-disable-next-line no-console
              console.error('[ProcessesList:startAllModules]: error (catched)', {
                error,
                module,
                start: module.start,
              });
              // eslint-disable-next-line no-debugger
              debugger;
            }
          }
        });
      },

      /** Start entrypoint */
      start(sharedParams) {
        // Save shared data for future use...
        ProcessesListData.sharedParams = sharedParams;
        // Fetch url query parameters...
        this.fetchUrlParams();
        // Initialize all the modules...
        this.startAllModules();
        // Load data...
        ProcessesListDataLoad.loadData();
      },
    };

    // Provide module...
    provide(ProcessesList);
  },
);
