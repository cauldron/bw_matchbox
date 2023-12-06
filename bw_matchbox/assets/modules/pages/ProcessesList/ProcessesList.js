// @ts-check

import { commonNotify } from '../../common/CommonNotify.js';
import * as CommonHelpers from '../../common/CommonHelpers.js';

import { RecentProcessesList } from '../../components/RecentProcesses/RecentProcessesList.js';

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

  /** @type {RecentProcessesList} */
  recentProcessesList: undefined,

  /** @type {Promise} */
  recentProcessesListInitPromise: undefined,

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
    const value = /** @type {TFilterProcessesByString} */ (target.value);
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

  // Side panel...

  /** @return Promise */
  ensureRecentProcessesList() {
    try {
      const recentProcessesList = this.getRecentProcessesList();
      if (this.recentProcessesListInitPromise) {
        return this.recentProcessesListInitPromise;
      }
      const recentProcessesContainerNode = ProcessesListNodes.getRecentProcessesContainerNode();
      /* console.log('[ProcessesList:ensureRecentProcessesList]', {
       *   recentProcessesList,
       *   recentProcessesContainerNode,
       * });
       */
      // Init comments module parameters
      recentProcessesList.setParams(
        /** @type {TRecentProcessesListParams} */ {
          rootNode: recentProcessesContainerNode,
          // noTableau: true,
          // noLoader: true,
          // noError: true,
          noActions: true, // Disable inegrated actions panel
        },
      );
      // Init sub-components...
      this.recentProcessesListInitPromise = recentProcessesList
        .ensureInit()
        .then(() => {
          return recentProcessesList.api.loadData();
        })
        .then(() => {
          const recentProcessesListPanelNode = ProcessesListNodes.getRecentProcessesListPanelNode();
          recentProcessesListPanelNode.classList.toggle('ready', true);
        })
        .catch((/** @type {Error} */ error) => {
          // eslint-disable-next-line no-console
          console.error('[ProcessesList:ensureRecentProcessesList] ensureInit error', error);
          // eslint-disable-next-line no-debugger
          debugger;
          // Set error
          this.state.setError(error);
          commonNotify.showError(error);
        });
      return this.recentProcessesListInitPromise;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[ProcessesList:ensureRecentProcessesList]', error);
      // eslint-disable-next-line no-debugger
      debugger;
      commonNotify.showError(error);
    }
  },

  toggleHistoryPanel() {
    const layoutNode = ProcessesListNodes.getLayoutNode();
    const panel = ProcessesListNodes.getRecentProcessesListPanelNode();
    const button = layoutNode.querySelector('#toggle-side-panel-button');
    const hasPanel = layoutNode.classList.contains('has-panel');
    const showPanel = !hasPanel;
    layoutNode.classList.toggle('has-panel', showPanel);
    button.classList.toggle('active', showPanel);
    panel.classList.toggle('hidden', !showPanel);
    if (showPanel) {
      // Start history component
      this.ensureRecentProcessesList();
    }
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
    const { q: searchValue } = urlParams;
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

  getRecentProcessesList() {
    // Processes list
    if (!this.recentProcessesList) {
      const recentProcessesList = new RecentProcessesList('ProcessesList');
      this.recentProcessesList = recentProcessesList;
    }
    return this.recentProcessesList;
  },

  /**
   * Start entrypoint
   * @param {any} sharedParams
   */
  start(sharedParams) {
    console.log('[ProcessesList:sharedParams]', sharedParams);
    // Save shared data for future use...
    ProcessesListData.sharedParams = sharedParams;
    // Fetch url query parameters...
    this.fetchUrlParams();
    // Initialize all the modules...
    this.startAllModules();
    // Load data...
    ProcessesListDataLoad.loadData();
    ProcessesListStates.setInited(true);
  },
};
