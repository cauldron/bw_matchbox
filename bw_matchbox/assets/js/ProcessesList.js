/* global
    commonHelpers,
    ProcessesListConstants,
    ProcessesListNodes,
    ProcessesListData,
    ProcessesListStates,
    ProcessesListDataLoad,
    ProcessesListDataRender,
    ProcessesListSearch,
    ProcessesListPagination,
*/

/** @descr Process list table client code.
 */

// global module variable
// eslint-disable-next-line no-unused-vars
const ProcessesList = {
  /** Update value of 'order by' parameter from user */
  onOrderByChange(target) {
    const { value } = target;
    console.log('onOrderByChange', {
      value,
      target,
    });
    ProcessesListData.orderBy = value;
    // TODO: Call re-load data method...
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

  /* // UNUSED: updatePage
   * updatePage() {
   *   ProcessesListPagination.renderAllPaginations();
   * },
   */

  /** Start entrypoint */
  start(sharedParams) {
    ProcessesListData.sharedParams = sharedParams;
    this.fetchUrlParams();
    ProcessesListSearch.initSearchBar();
    ProcessesListDataLoad.start();
  },
};
