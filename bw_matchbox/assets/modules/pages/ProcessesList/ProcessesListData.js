// @ts-check

import { ProcessesListConstants } from './ProcessesListConstants.js';

export const ProcessesListData = {
  __id: 'ProcessesListData',

  // Owner page's provided data...
  sharedParams: undefined,

  // Data params...

  // Control for `order_by` parameter (name, location, product; default (empty) -- random.
  orderBy: ProcessesListConstants.defaultOrderBy, // 'random' | 'name' | 'location' | 'product' (TOrderByString)
  filterBy: ProcessesListConstants.defaultFilterBy, // 'none', 'matched' | 'unmatched' | 'waitlist' (TFilterProcessesByString)
  userDb: ProcessesListConstants.defaultUserDb, // 'source' | 'target', 'proxy' (TUserDbString)
  searchValue: '',

  // Stored dom nodes...
  searchBar: undefined,
  hasSearch: false,

  // Page state...
  totalRecords: 0,
  currentPage: 0,
  error: undefined,
  isError: false,
  isInited: true,
  isLoading: true,
  hasData: false,

  // Handlers to call on each page update (see `processes-list-states.js`)...
  updatePageHandlers: [],
};
