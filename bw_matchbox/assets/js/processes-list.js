/* global commonHelpers, processesListConstants */

/* Process list table client code.
 */

// global module variable
const processesList = {
  // Owner page's provided data...
  sharedParams: undefined,

  // Data params...
  orderBy: '', // Control for `order_by` parameter (name, location, product; default (empty) -- random.
  database: '',
  searchValue: '',

  // Stored dom nodes...
  searchBar: undefined,

  // Page state...
  totalRecords: 0,
  // offset <-- (currentOffset | currentPage)
  currentPage: 0,
  error: undefined,
  isError: false,
  isLoading: true,
  // isLoaded
  // isEmpty: true,
  hasData: false,

  /** Update value of 'order by' parameter from user */
  onOrderByChange(target) {
    const { value } = target;
    console.log('onOrderByChange', {
      value,
      target,
    });
    processesList.orderBy = value;
    // TODO: Call re-load data method...
  },

  /** Go to the search page (TODO: to refactor?) */
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

  /** Initialize search field */
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

  /** Get all the parameters passed in the url query */
  fetchUrlParams() {
    // Get & store the database value form the url query...
    const urlParams = commonHelpers.parseQuery(window.location.search);
    const { database, q: searchValue } = urlParams;
    // Get database from url or from server-passed data...
    processesList.database = database || processesList.sharedParams.database;
    processesList.searchValue = searchValue || '';
  },

  // clearData
  // loadNextPage

  getTBodyNode() {
    const node = document.getElementById('processes-list-table-body');
    // TODO: Cache node.
    return node;
  },

  getRootNode() {
    const node = document.getElementById('processes-list-root');
    // TODO: Cache node.
    return node;
  },

  getNavigationNode() {
    const node = document.getElementById('processes-list-navigation');
    // TODO: Cache node.
    return node;
  },

  getErrorNode() {
    const node = document.getElementById('processes-list-error');
    // TODO: Cache node.
    return node;
  },

  renderNavigationLink(id, text) {
    return `<a id="${id}" class="link" onClick="processesList.onNavigationClick(this)">${text}</a>`;
  },

  renderNavigationText(text) {
    return `<span class="text">${text}</span>`;
  },

  renderNavigationItem(item) {
    return `<span class="item">${item}</span>`;
  },

  createPaginationItems() {
    const { pageSize } = processesListConstants;
    const { currentPage, totalRecords } = this;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const lastPageNo = totalPages - 1;
    const isFirstPage = !currentPage;
    const isLastPage = currentPage === lastPageNo;
    const items = [
      // prettier-ignore
      // this.renderNavigationText('text'),
      !isFirstPage && this.renderNavigationLink('prev', 'Prev'),
      !isLastPage && this.renderNavigationLink('next', 'Next'),
    ].filter(Boolean);
    console.log('createPaginationItems', {
      items,
      pageSize,
      currentPage,
      totalPages,
      totalRecords,
      isFirstPage,
      isLastPage,
    });
    return items;
  },

  renderPaginationNodes() {
    const items = this.createPaginationItems();
    const nodes = commonHelpers.htmlToElements(items);
    console.log('renderAllPaginations', {
      nodes,
      items,
    });
    return nodes;
  },

  renderAllPaginations() {
    const contentItems = this.createPaginationItems();
    const rootNode = this.getRootNode();
    const paginationNodes = rootNode.getElementsByClassName('table-pagination');
    console.log('renderAllPaginations', {
      contentItems,
      rootNode,
      paginationNodes,
    });
    for (const node of paginationNodes) {
      const contentNodes = commonHelpers.htmlToElements(contentItems);
      console.log('renderAllPaginations: item', {
        node,
        contentNodes,
      });
      node.replaceChildren.apply(node, contentNodes);
    }
    /*
    const { pageSize } = processesListConstants;
    const { currentPage, totalRecords } = this;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const lastPageNo = totalPages - 1;
    const isFirstPage = !currentPage;
    const isLastPage = currentPage === lastPageNo;
    const items = [
      // prettier-ignore
      // this.renderNavigationText('text'),
      !isFirstPage && this.renderNavigationLink('prev', 'Prev'),
      !isLastPage && this.renderNavigationLink('next', 'Next'),
    ].filter(Boolean);
    const nodes = commonHelpers.htmlToElements(items);
    const navigationNode = this.getNavigationNode();
    console.log('renderAllPaginations', {
      navigationNode,
      items,
      nodes,
      pageSize,
      currentPage,
      totalPages,
      totalRecords,
      isFirstPage,
      isLastPage,
    });
    navigationNode.replaceChildren.apply(navigationNode, nodes);
    */
  },

  getNavigationPageNo(id) {
    const isNumber = !isNaN(id);
    // Number?
    if (isNumber) {
      return Number(id);
    }
    // First?
    if (id === 'first') {
      return 0;
    }
    // Next or prev?
    const { currentPage } = this;
    if (id === 'prev') {
      return currentPage - 1;
    }
    if (id === 'next') {
      return currentPage + 1;
    }
    // Last?
    const { totalRecords } = this;
    const { pageSize } = processesListConstants;
    const totalPages = Math.ceil(totalRecords / pageSize);
    if (id === 'last') {
      return totalPages - 1;
    }
    // WTF?
    throw new Error('Unknown navigation id: ' + id);
  },

  onNavigationClick(target) {
    const { id } = target;
    const pageNo = this.getNavigationPageNo(id);
    console.log('onNavigationClick', {
      pageNo,
      id,
    });
    this.currentPage = pageNo;
    this.loadData();
  },

  updatePage() {
    this.renderAllPaginations();
  },

  renderDataRow(rowData) {
    const {
      id, // 726 (required!)
      name, // 'Electronic capacitors, resistors, coils, transformers, connectors and other components (except  semiconductors and printed circuit assemblies); at manufacturer'
      location, // 'United States'
      unit, // ''
      // details_url, // '/process/726'
      // match_url, // '/match/726'
      matched, // false
    } = rowData;
    /* console.log('renderDataRow: start', {
     *   details_url, // '/process/726'
     *   id, // 726
     *   location, // 'United States'
     *   match_url, // '/match/726'
     *   matched, // false
     *   name, // 'Electronic capacitors, resistors, coils, transformers, connectors and other components (except  semiconductors and printed circuit assemblies); at manufacturer'
     *   unit, // ''
     *   rowData,
     * });
     */
    const matchUrl = '/match/' + id;
    const matchButton = matched
      ? `<a class="button" href="${matchUrl || ''}"><i class="fa-solid fa-check"></i> EDIT</a>`
      : `<a class="button button-primary" href="${
          matchUrl || ''
        }"><i class="fa-solid fa-circle-xmark"></i> ADD</a>`;
    const content = `
      <tr>
        <td><a href="/process/${id || ''}">${name || ''}</a></td>
        <td>${location || ''}</td>
        <td>${unit || ''}</td>
        <td>${matchButton || ''}</td>
      </tr>
    `;
    /* // Original server-side template code:
      <tr>
        <td><a href="{{ url_for('process_detail', id=row.id) }}">{{row.name}}</a></td>
        <td>{{row.location}}</td>
        <td>{{row.unit}}</td>
        <td>
          {% if row.matched %}
            <a class="button" href="{{ url_for("match", source=row.id)}}"><i class="fa-solid fa-check"></i> EDIT</a>
          {% else %}
            <a class="button button-primary" href="{{ url_for("match", source=row.id)}}"><i class="fa-solid fa-circle-xmark"></i> ADD</a>
          {% endif %}
        </td>
      </tr>
    */
    /* console.log('renderDataRow: result', {
     *   content,
     *   matchUrl,
     *   matchButton,
     *   details_url, // '/process/726'
     *   id, // 726
     *   location, // 'United States'
     *   match_url, // '/match/726'
     *   matched, // false
     *   name, // 'Electronic capacitors, resistors, coils, transformers, connectors and other components (except  semiconductors and printed circuit assemblies); at manufacturer'
     *   unit, // ''
     *   rowData,
     * });
     */
    return content;
  },

  /** renderNewData -- Display new data rows at the end of the table. */
  renderNewData(rows) {
    const tBodyNode = this.getTBodyNode();
    /* Data item sample:
     * - details_url: '/process/726'
     * - id: 726
     * - location: 'United States'
     * - match_url: '/match/726'
     * - matched: false
     * - name: 'Electronic capacitors, resistors, coils, transformers, connectors and other components (except  semiconductors and printed circuit assemblies); at manufacturer'
     * - unit: ''
     */
    const rowsContent = rows.map(this.renderDataRow.bind(this));
    const rowsNodes = commonHelpers.htmlToElements(rowsContent);
    console.log('renderNewData', {
      rowsNodes,
      rowsContent,
      rows,
      tBodyNode,
    });
    /* // Append new data (will be used for incremental update)...
     * tBodyNode.append.apply(tBodyNode, rowsNodes);
     */
    // Replace rows...
    tBodyNode.replaceChildren.apply(tBodyNode, rowsNodes);
  },

  setLoading(isLoading) {
    // Set css class for id="processes-list-root" --> loading, set local status
    const rootNode = this.getRootNode();
    rootNode.classList.toggle('loading', isLoading);
    this.isLoading = isLoading;
  },

  setHasData(hasData) {
    // TODO: Set css class for id="processes-list-root" --> empty, update local state
    const rootNode = this.getRootNode();
    rootNode.classList.toggle('empty', !hasData);
    this.hasData = hasData;
  },

  /* // UNUSED
   * setEmpty(isEmpty) {
   *   // TODO: Set css class for id="processes-list-root" --> empty, update local state
   *   const rootNode = this.getRootNode();
   *   rootNode.classList.toggle('empty', isEmpty);
   *   this.isEmpty = isEmpty;
   * },
   */

  setError(error) {
    // TODO: Set css class for id="processes-list-root" --> error, update local state
    const isError = !!error;
    const rootNode = this.getRootNode();
    const errorNode = this.getErrorNode();
    rootNode.classList.toggle('error', isError);
    this.isError = isError;
    this.error = error;
    const errorText = error ? error.message || String(error) : '';
    // DEBUG
    if (errorText) {
      // eslint-disable-next-line no-console
      console.error('setError: got the error', {
        error,
        errorText,
      });
      // eslint-disable-next-line no-debugger
      debugger;
    }
    // Update error block content...
    errorNode.innerHTML = errorText;
  },

  /** Load next/current (?) data chunk */
  loadData() {
    const { pageSize, processesApiUrl: urlBase } = processesListConstants;
    const { database, orderBy } = processesList;
    const { currentPage } = this;
    const offset = currentPage * pageSize; // TODO!
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
      currentPage,
      pageSize,
      offset,
      orderBy,
    });
    this.setLoading(true);
    fetch(url)
      .then((res) => {
        return res.json();
      })
      .then((result) => {
        const { data, total_records: totalRecords } = result;
        const hasData = Array.isArray(data) && !!data.length;
        console.log('startLoadingData: done', {
          data,
          totalRecords,
          result,
          url,
          params,
          urlQuery,
          urlBase,
        });
        this.totalRecords = totalRecords;
        this.renderNewData(data);
        this.setError(undefined); // Clear the error: all is ok
        this.setHasData(this.hasData || hasData); // Update 'has data' flag
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('startLoadingData: error', {
          err,
          url,
          params,
          urlQuery,
          urlBase,
        });
        // eslint-disable-next-line no-debugger
        debugger;
        // Store & display error...
        this.setError(err);
      })
      .finally(() => {
        this.setLoading(false);
        this.updatePage();
      });
  },

  /** Load first portion of data to display */
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
