// @ts-check

import * as CommonHelpers from '../../common/CommonHelpers.js';

export const Match = {
  /** External data...
   * @type {TSharedParams}
   */
  sharedData: undefined, // Initializing in `Match.start` from `match.html`

  // Local data...
  defaultMakeUrlParams: { addQuestionSymbol: true, useEmptyStrings: true },
  searchValue: '',

  // Methods...

  /**
   * @param {boolean} isLoading
   */
  setLoading(isLoading) {
    const rootEl = document.getElementById('match-root');
    rootEl.classList.toggle('loading', !!isLoading);
  },

  /** setError -- Set and show error.
   * @param {string|Error|string[]|Error[]} error - Error or errors list.
   */
  setError(error) {
    const hasErrors = !!error;
    const rootEl = document.getElementById('match-root');
    rootEl.classList.toggle('has-error', hasErrors);
    // Show error...
    const text = CommonHelpers.getErrorText(error);
    const errorEl = document.getElementById('error');
    errorEl.innerHTML = text;
  },

  clearError() {
    this.setError(undefined);
  },

  /**
   * @param {TTableCell} cellData
   */
  isTableCellValueSimilarToOriginal(cellData) {
    const { id, value } = cellData;
    const { sharedData } = this;
    const { originalProcess } = sharedData;
    const origValue = originalProcess[id];
    const cmpValue = (value || '').toLowerCase();
    const cmpOrigValue = (origValue || '').toLowerCase();
    // TODO: To use more sophisticated logic?
    return !!cmpValue && cmpValue === cmpOrigValue;
  },

  /** makeTableCell
   * @param {TTableCell} cellData
   * return {string}
   */
  makeTableCell(cellData) {
    const { id, value, text } = cellData;
    const isSimilar = this.isTableCellValueSimilarToOriginal(cellData);
    const content = text || value || '';
    const className = [`cell-${id}`, isSimilar && 'similar'].filter(Boolean).join(' ');
    return `
          <td class="${className}"><div>${content}</div></td>
        `;
  },

  /**
   * @param {TMatchData[]} tableRows
   */
  renderTableRowsContent(tableRows) {
    const { sharedData } = this;
    const { source } = sharedData;
    const content = tableRows
      .map((/** @type {TMatchData} */ rowData) => {
        const {
          // On client, we need only this data: id, name, referenceProduct, location, unit
          id,
          name,
          referenceProduct,
          location,
          unit,
        } = rowData;
        const url = ['/compare', source, id].join('/');
        /** @type {TTableCell[]} */
        const cells = [
          { id: 'name', value: name, text: `<a href="${url}">${name || ''}</a>` },
          { id: 'referenceProduct', value: referenceProduct },
          { id: 'location', value: location },
          { id: 'unit', value: unit },
        ];
        const cellsContent = cells.map(this.makeTableCell.bind(this)).join('');
        return `
              <tr data-row-id="${id}">
                ${cellsContent}
              </tr>
            `;
      })
      .filter(Boolean)
      .join('');
    return content;
  },

  /**
   * @param {TMatchData[]} tableRows
   */
  updateTableRows(tableRows) {
    const tableBody = document.getElementById('result-table-body');
    const tableRowsContent = this.renderTableRowsContent(tableRows);
    tableBody.innerHTML = tableRowsContent;
  },

  doSearch() {
    const { sharedData, defaultMakeUrlParams } = this;
    const searchBar = /** @type {HTMLInputElement} */ (document.getElementById('query-string'));
    const {
      // prettier-ignore
      searchUrlPrefix,
      source,
      database,
    } = sharedData;
    const value = searchBar.value;
    // Do nothing if search string hasn't changed...
    if (value === this.searchValue) {
      return;
    }
    this.searchValue = value;
    const params = {
      json: 1,
      source,
      database,
      q: value,
    };
    const urlQuery = CommonHelpers.makeQuery(params, defaultMakeUrlParams);
    const url = searchUrlPrefix + urlQuery;
    this.setLoading(true);
    fetch(url)
      .then((res) => {
        // TODO: if (!res.ok) ...
        if (!res.ok) {
          const error = new Error(`Can't load url '${res.url}': ${res.statusText}, ${res.status}`);
          throw error;
        } else {
          // return res.text();
          return res.json();
        }
      })
      .then((/** @type {TMatchData[]} */ tableRows) => {
        this.updateTableRows(tableRows);
        this.setError(undefined);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('[Match:doSearch] Catched error', error);
        // eslint-disable-next-line no-debugger
        debugger;
        // Show errors on the page...
        this.setError(error);
      })
      .finally(() => {
        this.setLoading(false);
      });
  },

  initSearchBar() {
    const searchBar = document.getElementById('query-string');
    // searchBar.focus();
    searchBar.addEventListener('focusout', this.doSearch.bind(this));
    searchBar.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        this.doSearch();
      }
    });
  },

  /**
   * @param {TSharedParams} sharedData
   */
  start(sharedData) {
    // Save public data...
    this.sharedData = sharedData;

    const { initialQueryString, initialTableRows } = sharedData;

    this.searchValue = initialQueryString || '';
    this.updateTableRows(initialTableRows);

    // Init search bar...
    this.initSearchBar();
  },
};
