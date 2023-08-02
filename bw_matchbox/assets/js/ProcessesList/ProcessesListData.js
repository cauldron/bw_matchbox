/** @descr Common data storage
 */

// global module variable
// eslint-disable-next-line no-unused-vars
const ProcessesListData = {
  // Owner page's provided data...
  sharedParams: undefined,

  // Data params...
  orderBy: 'random', // Control for `order_by` parameter (name, location, product; default (empty) -- random.
  database: '',
  searchValue: '',

  // Stored dom nodes...
  searchBar: undefined,

  // Page state...
  totalRecords: 0,
  currentPage: 0,
  error: undefined,
  isError: false,
  isLoading: true,
  hasData: false,

  // Handlers to call on each page update (see `processes-list-states.js`)...
  updatePageHandlers: [],
};
