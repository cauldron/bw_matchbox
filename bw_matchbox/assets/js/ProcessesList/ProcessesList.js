/* global
    commonHelpers,
    ProcessesListConstants,
    ProcessesListData,
    ProcessesListDataLoad,
    ProcessesListDataRender,
    ProcessesListNodes,
    ProcessesListSearch,
    ProcessesListStates,
*/

// NOTE: Don't forget to call `startAllModules` for all the used modules...
const allModulesList = [
  ProcessesListConstants,
  ProcessesListData,
  ProcessesListDataRender,
  ProcessesListNodes,
  // ProcessesListPagination, // UNUSED: Using incremental data loading
  ProcessesListStates,
  ProcessesListSearch,
  ProcessesListDataLoad,
];

/** @descr Process list table client code.
 */

// global module variable
// eslint-disable-next-line no-unused-vars
const ProcessesList = {
  /** Update value of 'order by' parameter from user */
  onOrderByChange(target) {
    // TODO: Move to Handlers module?
    const { value } = target;
    ProcessesListStates.setOrderBy(value);
  },

  reloadData() {
    ProcessesListStates.clearData();
    ProcessesListDataLoad.loadData();
  },

  loadMoreData() {
    ProcessesListData.currentPage++;
    ProcessesListDataLoad.loadData();
  },

  /** Get all the parameters passed in the url query */
  fetchUrlParams() {
    // Get & store the database value form the url query...
    const urlParams = commonHelpers.parseQuery(window.location.search);
    const { database, q: searchValue } = urlParams;
    // Get database from url or from server-passed data...
    ProcessesListData.database = database || ProcessesListData.sharedParams.database;
    ProcessesListData.searchValue = searchValue || '';
  },

  /** startAllModules -- Start all the modules
   */
  startAllModules() {
    // Start all the modules...
    allModulesList.forEach((module) => {
      if (typeof module.start === 'function') {
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
    ProcessesListData.sharedParams = sharedParams;
    this.fetchUrlParams();
    this.startAllModules();
  },
};
