// @ts-check

import { ProcessesListData } from './ProcessesListData.js';
import { ProcessesListDataLoad } from './ProcessesListDataLoad.js';
import { ProcessesListNodes } from './ProcessesListNodes.js';
import { ProcessesListStates } from './ProcessesListStates.js';

export const ProcessesListSearch = {
  __id: 'ProcessesListSearch',

  /** Apply search */
  doSearch() {
    const searchBar = ProcessesListNodes.getSearchBarNode();
    const searchValue = searchBar.value;
    // If value had changed...
    if (searchValue !== ProcessesListData.searchValue) {
      const hasSearch = !!searchValue;
      ProcessesListStates.setHasSearch(hasSearch);
      ProcessesListData.searchValue = searchValue; // Useless due to following redirect
      ProcessesListStates.clearData();
      ProcessesListDataLoad.loadData();
    }
    return false;
  },

  /**
   * @param {KeyboardEvent} event
   */
  searchKeyHandler(event) {
    if (event.key === 'Enter') {
      this.doSearch();
    }
  },

  /** Initialize search field */
  start() {
    // Find the search input...
    const searchBar = ProcessesListNodes.getSearchBarNode();
    if (!searchBar) {
      throw new Error('Not found search input!');
    }
    // And add search handlers...
    // Start search on input end (on focus out), not on click!
    searchBar.addEventListener('focusout', this.doSearch.bind(this));
    searchBar.addEventListener('keypress', this.searchKeyHandler.bind(this));
  },
};
