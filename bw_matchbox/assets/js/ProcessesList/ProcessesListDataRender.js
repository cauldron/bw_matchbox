modules.define(
  'ProcessesListDataRender',
  [
    // Required modules...
    'CommonHelpers',
    'ProcessesListNodes',
  ],
  function provide_ProcessesListDataRender(
    provide,
    // Resolved modules...
    CommonHelpers,
    ProcessesListNodes,
  ) {
    // Define module...

    /** @descr Render table content.
     */

    // global module variable
    const ProcessesListDataRender = {
      clearTableData() {
        const tBodyNode = ProcessesListNodes.getTBodyNode();
        tBodyNode.replaceChildren();
      },

      renderDataRow(rowData) {
        const {
          id, // 726 (required!)
          name, // 'Electronic capacitors, resistors, coils, transformers, connectors and other components (except  semiconductors and printed circuit assemblies); at manufacturer'
          location, // 'United States'
          unit, // ''
          // details_url, // '/process/726'
          // match_url, // '/match/726'
          match_type, // 'No direct match available'
          matched, // false
        } = rowData;
        const matchUrl = '/match/' + id;
        const matchButton = matched
          ? `<a class="button" href="${matchUrl || ''}"><i class="fa-solid fa-check"></i> ${match_type || 'EDIT'}</a>`
          : `<a class="button button-primary" href="${
              matchUrl || ''
            }"><i class="fa-solid fa-circle-xmark"></i> ADD</a>`;
        const content = `
          <tr>
            <td><div><a href="/process/${id || ''}">${name || ''}</a></div></td>
            <td><div>${location || ''}</div></td>
            <td><div>${unit || ''}</div></td>
            <td><div>${matchButton || ''}</div></td>
          </tr>
        `;
        return content;
      },

      /** renderTableData -- Display new data rows at the end of the table.
       * @param {<TProcessItem[]>} rows
       * @param {object} [opts] - Options
       * @param {boolean} [opts.append] - Append data to the end of the table (default behavior: replace)
       */
      renderTableData(rows, opts = {}) {
        const tBodyNode = ProcessesListNodes.getTBodyNode();
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
        const rowsNodes = CommonHelpers.htmlToElements(rowsContent);
        if (opts.append) {
          // Append new data (will be used for incremental update)...
          tBodyNode.append.apply(tBodyNode, rowsNodes);
        } else {
          // Replace data...
          tBodyNode.replaceChildren.apply(tBodyNode, rowsNodes);
        }
      },
    };

    // Provide module...
    provide(ProcessesListDataRender);
  },
);
