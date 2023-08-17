modules.define(
  'ProcessesList',
  [
    // Required modules...
    'CommonHelpers',
    // Local modules...
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
    // Local modules...
    /* eslint-disable no-unused-vars */
    ProcessesListConstants,
    ProcessesListData,
    ProcessesListDataLoad,
    ProcessesListDataRender,
    ProcessesListNodes,
    ProcessesListSearch,
    ProcessesListStates,
    /* eslint-enable no-unused-vars */
  ) {
    /** Used modules list (will be needed for initialization, in `startAllModules`)
     */
    const usedModulesList = Array.from(arguments).splice(1);

    // global module variable
    const ProcessesList = {
      __id: 'ProcessesList',

      /** TODO: Handlers exchange object */
      // handlers: {},

      /** Update value of 'order by' parameter from user */
      onOrderByChange(target) {
        // TODO: Move to Handlers module?
        const { value: orderBy } = target;
        ProcessesListStates.setOrderBy(orderBy);
        // Update `user-db` states (allow only `source` for `importance`)
        ProcessesListStates.updateUserDbForOrderBy(orderBy);
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
        const { value: userDb } = target;
        ProcessesListStates.setUserDb(userDb);
        // Update `order_by` states (disable `importance` if not `source`)...
        ProcessesListStates.updateOrderByForUserDb(userDb);
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
        const initParams = {
          // handlers: this.handlers,
          sharedParams: this.sharedParams,
        };
        // Start all the modules...
        usedModulesList.forEach((module) => {
          if (!module) {
            // WTF?
            return;
          }
          /* // Expose module (is it safe and neccessary?)...
           * if (module.__id) {
           *   this[module.__id] = module;
           * }
           */
          if (typeof module.start === 'function') {
            try {
              module.start(initParams);
              /* // Alternate option: Delayed start...
               * setTimeout(module.start.bind(module), 0, initParams);
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
