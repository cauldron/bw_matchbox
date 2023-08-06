modules.define(
  'ProcessesListSearch',
  [
    // Required modules...
    'CommonHelpers',
    'ProcessesListData',
    'ProcessesListDataLoad',
    'ProcessesListNodes',
    'ProcessesListStates',
  ],
  function provide_ProcessesListSearch(
    provide,
    // Resolved modules...
    CommonHelpers,
    ProcessesListData,
    ProcessesListDataLoad,
    ProcessesListNodes,
    ProcessesListStates,
  ) {
    // Define module...

    /** @descr Search bar support
     */

    // global module variable
    // eslint-disable-next-line no-unused-vars
    const ProcessesListSearch = {
      __id: 'ProcessesListSearch',

      /** UNUSED (old approach): Go to the search page (TODO: to refactor?) */
      doSearchRedirect() {
        const { database } = ProcessesListData;
        const { searchUrl } = ProcessesListData.sharedParams;
        const searchBar = ProcessesListNodes.getSearchBarNode();
        const searchValue = searchBar && searchBar.value;
        // TODO: pare search value with previous (if exists)?
        if (searchValue !== ProcessesListData.searchValue) {
          ProcessesListData.searchValue = searchValue; // Useless due to following redirect
          // If searchValue is empty, then go to index (processes-list, root) page, else -- to the search page...
          const urlParams = {
            database,
            q: searchValue,
          };
          const urlQuery = CommonHelpers.makeQuery(urlParams, { addQuestionSymbol: true });
          const urlBase = searchValue ? searchUrl : '/';
          const url = urlBase + urlQuery;
          /* console.log('[ProcessesListSearch:doSearch]', {
           *   url,
           *   urlQuery,
           *   urlParams,
           *   urlBase,
           *   searchValue,
           *   searchUrl,
           * });
           */
          location.assign(url);
        }
        return false;
      },

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
        /* // UNUSED: ...and activate (default focus)...
         * searchBar.focus();
         */
        // ...And add search handlers...
        // Start search on input end (on focus out), not on click!
        searchBar.addEventListener('focusout', this.doSearch.bind(this));
        searchBar.addEventListener('keypress', this.searchKeyHandler.bind(this));
      },
    };

    // Provide module...
    provide(ProcessesListSearch);
  },
);
