/* global commonHelpers, processesListConstants */

/* Process list table client code.
 */

// global module variable
const processesList = {
  sharedParams: undefined,
  // Control for `order_by` parameter (name, location, product; default (empty) -- random.
  orderBy: '',
  // Database...
  database: '',

  onOrderByChange(target) {
    const { value } = target;
    console.log('onOrderByChange', {
      value,
      target,
    });
    processesList.orderBy = value;
    // TODO: Call re-load data method...
  },

  doSearch() {
    const { database } = processesList;
    const { searchUrl } = processesList.sharedParams;
    const searchBar = document.getElementById('query_string');
    const searchValue = searchBar && searchBar.value;
    // TODO: pare search value with previous (if exists)?
    if (searchValue) {
      const urlParams = {
        database,
        q: searchValue,
      };
      const urlQuery = commonHelpers.makeQuery(urlParams, { addQuestionSymbol: true });
      // TODO: Use `commonHelpers.makeQuery`?
      location.assign(searchUrl + urlQuery);
      /* // ORIGINAL (To unsure that new method is completely working):
       * '?database=' +
       * encodeURIComponent(database) +
       * '&q=' +
       * encodeURIComponent(searchValue),
       */
    }
  },

  initSearchBar() {
    // Find t) search input...
    const searchBar = document.getElementById('query_string');
    if (!searchBar) {
      throw new Error('Not found search input!');
    }
    // ...and activate (default focus)...
    searchBar.focus();
    // ...And add search handlers...
    // Start search on input end (on focus out), not on click!
    searchBar.addEventListener('focusout', processesList.doSearch);
    searchBar.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        processesList.doSearch();
      }
    });
  },

  fetchUrlParams() {
    // Get & store the database value form the url query...
    const urlParams = commonHelpers.parseQuery(window.location.search);
    const { database } = urlParams;
    // Get database from url or from server-passed data...
    processesList.database = database || processesList.sharedParams.database;
  },

  /** Start entrypoint */
  start(sharedParams) {
    processesList.sharedParams = sharedParams;
    processesList.fetchUrlParams();
    processesList.initSearchBar();
  },
};
