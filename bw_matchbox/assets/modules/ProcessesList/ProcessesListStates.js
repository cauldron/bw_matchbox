// @ts-check

import { ProcessesListConstants } from './ProcessesListConstants.js';
import { ProcessesListData } from './ProcessesListData.js';
import { ProcessesListDataRender } from './ProcessesListDataRender.js';
import { ProcessesListNodes } from './ProcessesListNodes.js';

export const ProcessesListStates = {
  __id: 'ProcessesListStates',

  /**
   * @param {boolean} isLoading
   */
  setLoading(isLoading) {
    // Set css class for id="processes-list-root" --> loading, set local status
    const rootNode = ProcessesListNodes.getRootNode();
    rootNode.classList.toggle('loading', isLoading);
    ProcessesListData.isLoading = isLoading;
  },

  /**
   * @param {boolean} hasData
   */
  setHasData(hasData) {
    // Set css class for root node, update local state
    const rootNode = ProcessesListNodes.getRootNode();
    rootNode.classList.toggle('empty', !hasData);
    ProcessesListData.hasData = hasData;
  },

  /**
   * @param {boolean} hasSearch
   */
  setHasSearch(hasSearch) {
    // Set css class for root node, update local state
    const rootNode = ProcessesListNodes.getRootNode();
    rootNode.classList.toggle('has-search', hasSearch);
    ProcessesListData.hasSearch = hasSearch;
  },

  /**
   * @param {number} totalRecords
   */
  setTotalRecordsCount(totalRecords) {
    ProcessesListData.totalRecords = totalRecords;
    // Set css class for root node, update local state
    const rootNode = ProcessesListNodes.getRootNode();
    const elems = rootNode.querySelectorAll('#total-records-number');
    elems.forEach((node) => {
      node.innerHTML = String(totalRecords);
    });
  },

  /** setError -- Shorthand for `setHasData`
   * @param {boolean} isEmpty
   */
  setEmpty(isEmpty) {
    this.setHasData(!isEmpty);
  },

  /**
   * @param {number} availableCount
   */
  getAvailableRecordsContent(availableCount) {
    if (!availableCount || availableCount < 0) {
      return '';
    }
    const { pageSize } = ProcessesListConstants;
    const moreThanAPage = pageSize < availableCount;
    const text = [
      // prettier-ignore
      moreThanAPage && pageSize,
      `${availableCount} available`,
    ]
      .filter(Boolean)
      .join(' out of ');
    return ` (next ${text})`;
  },

  /**
   * @param {number} availableCount
   */
  updateAvailableRecordsInfo(availableCount) {
    const node = document.getElementById('available-records-info');
    const content = this.getAvailableRecordsContent(availableCount);
    node.innerHTML = content;
  },

  /**
   * @param {boolean} hasMoreData
   */
  setHasMoreData(hasMoreData) {
    // Set css class for root node, update local state
    const rootNode = ProcessesListNodes.getRootNode();
    rootNode.classList.toggle('has-more-data', hasMoreData);
    ProcessesListData.hasMoreData = hasMoreData;
  },

  /**
   * @param {{ message: any; }} error
   */
  setError(error) {
    // TODO: Set css class for id="processes-list-root" --> error, update local state
    const isError = !!error;
    const rootNode = ProcessesListNodes.getRootNode();
    const errorNode = ProcessesListNodes.getErrorNode();
    rootNode.classList.toggle('error', isError);
    ProcessesListData.isError = isError;
    ProcessesListData.error = error;
    const errorText = error ? error.message || String(error) : '';
    // DEBUG: Show error in console
    if (errorText) {
      // eslint-disable-next-line no-console
      console.error('[ProcessesListStates:setError]: got the error', {
        error,
        errorText,
      });
      // eslint-disable-next-line no-debugger
      debugger;
    }
    // Update error block content...
    errorNode.innerHTML = errorText;
  },

  clearData() {
    this.setHasData(false);
    this.setHasMoreData(true);
    this.updateAvailableRecordsInfo(0);
    ProcessesListDataRender.clearTableData();
  },

  /** setOrderBy -- Set 'order by' parameter.
   * @param {TOrderByString} [orderBy]
   * @param {object} [opts]
   * @param {boolean} [opts.omitClearData] - Don't clear data.
   */
  setOrderBy(orderBy, opts = {}) {
    const { defaultOrderBy } = ProcessesListConstants;
    const rootNode = ProcessesListNodes.getRootNode();
    const prevClass = ['order', ProcessesListData.orderBy || defaultOrderBy]
      .filter(Boolean)
      .join('-');
    const value = orderBy || defaultOrderBy;
    const nextClass = ['order', value].filter(Boolean).join('-');
    if (prevClass !== nextClass) {
      rootNode.classList.toggle(prevClass, false);
    }
    rootNode.classList.toggle(nextClass, true);
    ProcessesListData.orderBy = value;
    // Clear current data...
    if (!opts.omitClearData) {
      this.clearData();
    }
  },

  /** setFilterBy -- Set 'filter by' parameter.
   * @param {TFilterProcessesByString} [filterBy]
   * @param {object} [opts]
   * @param {boolean} [opts.omitClearData] - Don't clear data.
   */
  setFilterBy(filterBy, opts = {}) {
    const { defaultFilterBy } = ProcessesListConstants;
    const rootNode = ProcessesListNodes.getRootNode();
    const prevClass = ['filter', ProcessesListData.filterBy || defaultFilterBy]
      .filter(Boolean)
      .join('-');
    const value = filterBy || defaultFilterBy;
    const nextClass = ['filter', value].filter(Boolean).join('-');
    if (prevClass !== nextClass) {
      rootNode.classList.toggle(prevClass, false);
    }
    rootNode.classList.toggle(nextClass, true);
    ProcessesListData.filterBy = value;
    // Clear current data...
    if (!opts.omitClearData) {
      this.clearData();
    }
  },

  /** setUserDb -- Set 'userDb' parameter.
   * @param {TUserDbString} [userDb]
   * @param {object} [opts]
   * @param {boolean} [opts.omitClearData] - Don't clear data.
   */
  setUserDb(userDb, opts = {}) {
    const { defaultUserDb } = ProcessesListConstants;
    const rootNode = ProcessesListNodes.getRootNode();
    const prevClass = ['userDb', ProcessesListData.userDb || defaultUserDb]
      .filter(Boolean)
      .join('-');
    const value = userDb || defaultUserDb;
    const nextClass = ['userDb', value].filter(Boolean).join('-');
    if (prevClass !== nextClass) {
      rootNode.classList.toggle(prevClass, false);
    }
    rootNode.classList.toggle(nextClass, true);
    ProcessesListData.userDb = value;
    // Clear current data...
    if (!opts.omitClearData) {
      this.clearData();
    }
  },

  /** updateDomCheckedOrderBy -- Update actual 'order by' dom node.
   * @param {TOrderByString} [orderBy]
   */
  updateDomCheckedOrderBy(orderBy) {
    const { defaultOrderBy } = ProcessesListConstants;
    const value = orderBy || defaultOrderBy;
    /** @type NodeListOf<HTMLInputElement> */
    const elems = document.querySelectorAll('input[type="radio"][name="order_by"]');
    elems.forEach((elem) => (elem.checked = elem.value === value));
  },

  /** updateUserDbForOrderBy -- Update `user-db` states for `order_by` value (allow only `source` for `importance`)
   * @param {string} orderBy
   */
  updateUserDbForOrderBy(orderBy) {
    const { sharedParams } = ProcessesListData;
    const { databases } = sharedParams;
    const isImportance = orderBy === 'importance';
    /* console.log('[ProcessesListStates:updateUserDbForOrderBy]', {
     *   orderBy,
     * });
     */
    /** @type NodeListOf<HTMLInputElement> */
    const elems = document.querySelectorAll('input[type="radio"][name="user-db"]');
    elems.forEach((elem) => {
      const { value: userDb } = elem;
      const isDisabled =
        // Disable proxy option if no proxy databese provided
        (userDb === 'proxy' && !databases.proxy) ||
        // Disable all databases except source for importance order
        (isImportance && userDb !== 'source');
      const parentNode = /** @type {HTMLElement} */ (elem.parentNode);
      parentNode.classList.toggle('disabled', isDisabled);
    });
  },

  /** updateOrderByForUserDb -- Update `order_by` states for `userDb` value (disable `importance` if not `source`)
   * @param {string} userDb
   */
  updateOrderByForUserDb(userDb) {
    const isSource = userDb === 'source';
    /* console.log('[ProcessesListStates:updateOrderByForUserDb]', {
     *   userDb,
     * });
     */
    /** @type NodeListOf<HTMLInputElement> */
    const elems = document.querySelectorAll('input[type="radio"][name="order_by"]');
    elems.forEach((elem) => {
      const { value: orderBy } = elem;
      const isDisabled = !isSource && orderBy === 'importance';
      const parentNode = /** @type {HTMLElement} */ (elem.parentNode);
      parentNode.classList.toggle('disabled', isDisabled);
    });
  },

  /** updateDomFilterBy -- Update actual 'filter by' dom node.
   * @param {TOrderByString} [filterBy]
   */
  updateDomFilterBy(filterBy) {
    const { defaultFilterBy } = ProcessesListConstants;
    const value = filterBy || defaultFilterBy;
    /** @type NodeListOf<HTMLInputElement> */
    const elems = document.querySelectorAll('input[type="radio"][name="filter_by"]');
    elems.forEach((elem) => (elem.checked = elem.value === value));
  },

  /** updateDomUserDb -- Update actual 'userDb' dom node.
   * @param {TOrderByString} [userDb]
   */
  updateDomUserDb(userDb) {
    const { defaultUserDb } = ProcessesListConstants;
    const value = userDb || defaultUserDb;
    /** @type NodeListOf<HTMLInputElement> */
    const elems = document.querySelectorAll('input[type="radio"][name="user-db"]');
    elems.forEach((elem) => (elem.checked = elem.value === value));
  },

  /** updatePage -- Update all the page dynamic elements
   */
  updatePage() {
    const { updatePageHandlers } = ProcessesListData;
    // Call all the registered update handlers...
    updatePageHandlers.forEach((handler) => {
      try {
        if (handler) {
          handler();
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[ProcessesListStates:updatePage]: error (catched)', {
          error,
          handler,
        });
        // eslint-disable-next-line no-debugger
        debugger;
      }
    });
  },

  /**
   * @param {string} groupId
   */
  getRadioGroupValue(groupId) {
    /** @type HTMLInputElement */
    const elem = document.querySelector('input[type="radio"][name="' + groupId + '"]:checked');
    return elem && elem.value;
  },

  start() {
    // Update all the dynamic parameters...

    // Order by...
    this.updateDomCheckedOrderBy(undefined);
    this.setOrderBy(undefined, { omitClearData: true });
    this.updateUserDbForOrderBy(this.getRadioGroupValue('order_by'));

    // Filter by...
    this.updateDomFilterBy(undefined);
    this.setFilterBy(undefined, { omitClearData: true });

    // Database...
    this.updateDomUserDb(undefined);
    this.setUserDb(undefined, { omitClearData: true });
    this.updateOrderByForUserDb(this.getRadioGroupValue('user-db'));
  },
};
