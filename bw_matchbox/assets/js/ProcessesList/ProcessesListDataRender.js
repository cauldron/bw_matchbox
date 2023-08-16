modules.define(
  'ProcessesListDataRender',
  [
    // Required modules...
    'CommonHelpers',
    'ProcessesListNodes',
    'ProcessesListData',
  ],
  function provide_ProcessesListDataRender(
    provide,
    // Resolved modules...
    CommonHelpers,
    ProcessesListNodes,
    ProcessesListData,
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

      renderMatchCellContent(rowData) {
        const { sharedParams } = ProcessesListData;
        const {
          currentRole, // TODO: To generate other content for 'editors' role?
          databases,
        } = sharedParams;
        const { proxy } = databases;
        const isEditor = currentRole === 'editors';
        const hasProxy = !!proxy;
        const {
          id, // 726 (required!)
          match_type, // 'No direct match available'
          /* // Other unused process record data...
           * name, // 'Electronic capacitors, resistors, coils, transformers, connectors and other components (except  semiconductors and printed circuit assemblies); at manufacturer'
           * location, // 'United States'
           * unit, // ''
           * details_url, // '/process/726'
           * match_url, // '/match/726'
           * matched, // false
           */
        } = rowData;
        const hasMatchType = !!match_type;
        let matchContent;
        if (isEditor) {
          const matchUrl = '/match/' + id;
          matchContent = `<a class="button button-primary" href="${matchUrl}">
            <i class="fa-solid fa-circle-xmark"></i>
            Add match
          </a>`;
        } else if (hasProxy) {
          matchContent = `<a href="/process/${proxy}">Proxy dataset</a>`;
        } else if (hasMatchType) {
          matchContent = `No match needed`;
        } else {
          matchContent = `Unmatched`;
        }
        /* // OLD CODE: This code is temporarily remained until the task is completed.
        const matchUrl = '/match/' + id;
        if (matched) {
          matchContent = `<a class="button" href="${matchUrl}">
            <i class="fa-solid fa-check"></i>
            ${match_type || 'Edit'}
          </a>`;
        } else {
          matchContent = `<a class="button button-primary" href="${matchUrl}">
            <i class="fa-solid fa-circle-xmark"></i>
            Add
          </a>`;
        }
        */
        return matchContent;
      },

      renderDataRow(rowData) {
        const {
          id, // 726 (required!)
          name, // 'Electronic capacitors, resistors, coils, transformers, connectors and other components (except  semiconductors and printed circuit assemblies); at manufacturer'
          location, // 'United States'
          unit, // ''
          // details_url, // '/process/726'
          // match_url, // '/match/726'
          // match_type, // 'No direct match available'
          // matched, // false
        } = rowData;
        const matchContent = this.renderMatchCellContent(rowData);
        const content = `
          <tr>
            <td><div><a href="/process/${id || ''}">${name || ''}</a></div></td>
            <td><div>${location || ''}</div></td>
            <td><div>${unit || ''}</div></td>
            <td><div>${matchContent || ''}</div></td>
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
