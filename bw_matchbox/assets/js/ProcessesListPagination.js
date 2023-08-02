/* global
    commonHelpers,
    ProcessesListConstants,
    ProcessesListDataLoad,
    ProcessesListNodes,
    ProcessesListData,
*/

/* Process list table client code.
 */

// global module variable
// eslint-disable-next-line no-unused-vars
const ProcessesListPagination = {
  renderNavigationLink(id, text) {
    return `<a pagination-id="${id}" class="link" onClick="ProcessesList.onNavigationClick(this)">${text}</a>`;
  },

  renderNavigationText(text) {
    return `<span class="text">${text}</span>`;
  },

  renderNavigationItem(item) {
    return `<span class="item">${item}</span>`;
  },

  createPaginationItems() {
    const { pageSize } = ProcessesListConstants;
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
      // TODO: first, last, pages...
    ].filter(Boolean);
    /* console.log('createPaginationItems', {
     *   items,
     *   pageSize,
     *   currentPage,
     *   totalPages,
     *   totalRecords,
     *   isFirstPage,
     *   isLastPage,
     * });
     */
    return items;
  },

  renderPaginationNodes() {
    const items = this.createPaginationItems();
    const nodes = commonHelpers.htmlToElements(items);
    return nodes;
  },

  renderAllPaginations() {
    // Create pagination contents...
    const contentItems = this.createPaginationItems();
    // Find all the pagination blocks...
    const rootNode = ProcessesListNodes.getRootNode();
    const paginationNodes = rootNode.getElementsByClassName('table-pagination');
    console.log('renderAllPaginations', {
      contentItems,
      rootNode,
      paginationNodes,
    });
    debugger;
    // Update contents of all the pagination blocks...
    for (const node of paginationNodes) {
      const contentNodes = commonHelpers.htmlToElements(contentItems);
      node.replaceChildren.apply(node, contentNodes);
    }
  },

  /** getNavigationPageNo -- Get page number by pagination id
   * @param {string|number} id - 'prev', 'next', 'first', 'last' or page number (as string or number)
   * @return {number}
   */
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
    const { pageSize } = ProcessesListConstants;
    const totalPages = Math.ceil(totalRecords / pageSize);
    if (id === 'last') {
      return totalPages - 1;
    }
    // WTF?
    throw new Error('Unknown navigation id: ' + id);
  },

  /** onNavigationClick -- Process navigation item click
   * @param {HTMLElement} target
   */
  onNavigationClick(target) {
    const id = target.getAttribute('pagination-id');
    const pageNo = this.getNavigationPageNo(id);
    console.log('onNavigationClick', {
      pageNo,
      id,
    });
    debugger;
    this.currentPage = pageNo;
    // TODO: Load data...
    ProcessesListDataLoad.loadData();
  },

  start() {
    const { updatePageHandlers } = ProcessesListData;
    updatePageHandlers.push(this.renderAllPaginations.bind(this));
  },
};
