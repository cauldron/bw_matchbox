// @ts-check

import * as CommonHelpers from '../../common/CommonHelpers.js';

import { ProcessesListConstants } from './ProcessesListConstants.js';
import { ProcessesListData } from './ProcessesListData.js';
import { ProcessesListDataLoad } from './ProcessesListDataLoad.js';
import { ProcessesListDataRender } from './ProcessesListDataRender.js';
import { ProcessesListNodes } from './ProcessesListNodes.js';
import { ProcessesListSearch } from './ProcessesListSearch.js';
import { ProcessesListStates } from './ProcessesListStates.js';

/** Used modules list (will be needed for initialization, in `startAllModules`)
 */
const usedModulesList = [
  ProcessesListConstants,
  ProcessesListData,
  ProcessesListDataLoad,
  ProcessesListDataRender,
  ProcessesListNodes,
  ProcessesListSearch,
  ProcessesListStates,
];

// global module variable
export const ProcessesList = {
  __id: 'ProcessesList',

  /* TODO: Handlers exchange object
   * handlers: {},
   */

  /**
   * Update value of 'order by' parameter from user
   * @param {{ value: any; }} target
   */
  onOrderByChange(target) {
    // TODO: Move to Handlers module?
    const { value: orderBy } = target;
    ProcessesListStates.setOrderBy(orderBy);
    // Update `user-db` states (allow only `source` for `importance`)
    ProcessesListStates.updateUserDbForOrderBy(orderBy);
    ProcessesListDataLoad.loadData();
  },

  /**
   * Update value of 'filterBy' parameter from user
   * @param {{ value: any; }} target
   */
  onFilterByChange(target) {
    // TODO: Move to Handlers module?
    const { value } = target;
    ProcessesListStates.setFilterBy(value);
    ProcessesListDataLoad.loadData();
  },

  /**
   * Update value of 'userDb' parameter from user
   * @param {HTMLSelectElement} target
   */
  onUserDbChange(target) {
    // TODO: Move to Handlers module?
    const userDb = /** @type {TUserDbString} */ (target.value);
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
    ProcessesListDataLoad.loadData();
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

  /**
   * Start entrypoint
   * @param {any} sharedParams
   */
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
