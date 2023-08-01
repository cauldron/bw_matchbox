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
  searchBar: undefined,
  searchValue: '',
  // data: [],

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
    if (searchValue !== processesList.searchValue) {
      // TIf searchValue is empty, then go to index (processes-list, root) page, else -- to the search page...
      const urlParams = {
        database,
        q: searchValue,
      };
      const urlQuery = commonHelpers.makeQuery(urlParams, { addQuestionSymbol: true });
      const urlBase = searchValue ? searchUrl : '/';
      const url = urlBase + urlQuery;
      console.log('doSearch', {
        url,
        urlQuery,
        urlParams,
        urlBase,
        searchValue,
        searchUrl,
      });
      location.assign(url);
    }
    return false;
  },

  initSearchBar() {
    // Find the search input...
    const searchBar = document.getElementById('query_string');
    // TODO: To store and re-use it?
    if (!searchBar) {
      throw new Error('Not found search input!');
    }
    /* // UNUSED: ...and activate (default focus)...
     * searchBar.focus();
     */
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
    const { database, q: searchValue } = urlParams;
    // Get database from url or from server-passed data...
    processesList.database = database || processesList.sharedParams.database;
    processesList.searchValue = searchValue || '';
  },


  // clearData

  loadData() {
    const { pageSize, processesApiUrl: urlBase } = processesListConstants;
    const { database, orderBy } = processesList;
    const offset = 0; // TODO!
    const params = {
      database,
      order_by: orderBy,
      offset,
      limit: pageSize,
    };
    const urlQuery = commonHelpers.makeQuery(params, { addQuestionSymbol: true });
    const url = urlBase + urlQuery;
    console.log('startLoadingData: start', {
      url,
      params,
      urlQuery,
      urlBase,
    });
    fetch(url)
      .then((res) => {
        console.log('startLoadingData: success', {
          res,
          url,
          params,
          urlQuery,
          urlBase,
        });
        return res.json();
      })
      .then((data) => {
        console.log('startLoadingData: get data', {
          data,
          url,
          params,
          urlQuery,
          urlBase,
        });
        debugger;
      })
      .catch((err) => {
        console.error('startLoadingData: error', {
          err,
          url,
          params,
          urlQuery,
          urlBase,
        });
        debugger;
      });
  },

  startLoadingData() {
    this.loadData();
  },

  /** Start entrypoint */
  start(sharedParams) {
    processesList.sharedParams = sharedParams;
    processesList.fetchUrlParams();
    processesList.initSearchBar();
    processesList.startLoadingData();
  },
};
