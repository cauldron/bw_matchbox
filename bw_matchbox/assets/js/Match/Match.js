modules.define(
  'Match',
  [
    // Required modules...
    'CommonHelpers',
  ],
  function provide_Match(
    provide,
    // Resolved modules...
    CommonHelpers,
  ) {
    // Define module...
    const Match = {
      // External data...
      sharedData: undefined, // Initializing in `Match.start` from `bw_matchbox/assets/templates/process_detail.html`

      // Local data...
      defaultMakeUrlParams: { addQuestionSymbol: true, useEmptyStrings: true },
      searchValue: '',

      // Methods...

      setLoading(isLoading) {
        const rootEl = document.getElementById('match-root');
        rootEl.classList.toggle('loading', !!isLoading);
      },

      /** setError -- Set and show error.
       * @param {string|error|string[]|error[]} error - Error or errors list.
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

      /* makeTableCell
       * @param {object} cellData
       * @param {string} cellData.id
       * @param {string} [cellData.value]
       * @param {string} [cellData.text]
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

      renderTableRowsContent(tableRows) {
        const { sharedData } = this;
        const {
          // prettier-ignore
          source,
          // searchUrlPrefix,
          // database,
        } = sharedData;
        /* console.log('[Match:renderTableRowsContent]', {
         *   tableRows,
         *   source,
         *   // searchUrlPrefix,
         *   // database,
         * });
         */
        const content = tableRows
          .map((rowData) => {
            const {
              // On client, we need only this data: id, name, referenceProduct, location, unit
              id,
              name,
              referenceProduct,
              location,
              unit,
            } = rowData;
            const url = ['/compare', source, id].join('/');
            const cells = [
              { id: 'name', value: name, text: `<a href="${url}">${name || ''}</a>` },
              { id: 'referenceProduct', value: referenceProduct },
              { id: 'location', value: location },
              { id: 'unit', value: unit },
            ];
            const cellsContent = cells.map(this.makeTableCell.bind(this)).join('');
            /* console.log('[Match:renderTableRowsContent] iteration', {
             *   cellsContent,
             *   cells,
             *   url,
             *   id,
             *   name,
             *   referenceProduct,
             *   location,
             *   unit,
             *   rowData,
             * });
             */
            return `
              <tr data-row-id="${id}">
                ${cellsContent}
              </tr>
            `;
            /* // Original tempate code:
             * <td class="cell-name"><a href="${url}">${name || ''}</a></td>
             * <td class="cell-referenceProduct>${referenceProduct || ''}</td>
             * <td class="cell-location">${location || ''}</td>
             * <td class="cell-unit">${unit || ''}</td>
             */
          })
          .filter(Boolean)
          .join('');
        return content;
      },

      updateTableRows(tableRows) {
        const tableBody = document.getElementById('result-table-body');
        const tableRowsContent = this.renderTableRowsContent(tableRows);
        /* console.log('[Match:doSearch]: done', {
         *   tableRowsContent,
         *   tableBody,
         *   tableRows,
         * });
         */
        tableBody.innerHTML = tableRowsContent;
      },

      doSearch() {
        const { sharedData, defaultMakeUrlParams } = this;
        const searchBar = document.getElementById('query-string');
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
        /* console.log('[Match:doSearch]: start', {
         *   value,
         *   urlQuery,
         *   url,
         *   searchUrlPrefix,
         *   source,
         *   database,
         * });
         */
        this.setLoading(true);
        fetch(url)
          .then((res) => {
            // TODO: if (!res.ok) ...
            if (!res.ok) {
              const error = new Error(
                `Can't load url '${res.url}': ${res.statusText}, ${res.status}`,
              );
              throw error;
            } else {
              // return res.text();
              return res.json();
            }
          })
          .then((tableRows) => {
            /* console.log('[Match:doSearch]: success', {
             *   tableRows,
             * });
             */
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
        /* // ORIGINAL CODE
         * req.addEventListener('load', searchResultUpdater);
         * req.open('GET', `{{ url_for('search') }}?e=1&source={{ ds.id }}&database={{ target }}&q=' + qs);
         * req.send();
         */
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

      start(sharedData) {
        // Save public data...
        this.sharedData = sharedData;

        const {
          // searchUrlPrefix,
          // source,
          // database,
          initialQueryString,
          initialTableRows,
        } = sharedData;

        this.searchValue = initialQueryString || '';
        this.updateTableRows(initialTableRows);

        // Init search bar...
        this.initSearchBar();
      },
    };

    // Provide module...
    provide(Match);
  },
);
