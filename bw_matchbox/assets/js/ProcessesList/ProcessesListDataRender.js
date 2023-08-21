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
     * @typedef ProcessesListDataRender
     * @property {function} clearTableData
     */
    const ProcessesListDataRender = {
      clearTableData() {
        const tBodyNode = ProcessesListNodes.getTBodyNode();
        tBodyNode.replaceChildren();
      },

      renderMatchCellContent(rowData) {
        const { sharedParams } = ProcessesListData;
        const { currentRole, databases } = sharedParams;
        const { proxy } = databases;
        const isEditor = currentRole === 'editors';
        const hasProxy = !!proxy;
        const {
          id, // 726 (required!)
          match_type, // 'No direct match available'
          matched, // false
          /* // Other unused process record data...
           * name, // 'Electronic capacitors, resistors, coils, transformers, connectors and other components (except  semiconductors and printed circuit assemblies); at manufacturer'
           * location, // 'United States'
           * unit, // ''
           * details_url, // '/process/726'
           * match_url, // '/match/726'
           */
        } = rowData;
        const hasMatchType = !!match_type;
        if (isEditor) {
          const matchUrl = '/match/' + id;
          const matchText = matched ? match_type || 'Edit' : 'Add';
          const matchIcon = matched ? 'fa-check' : 'fa-circle-xmark';
          const matchClass = !matched && 'button button-primary';
          // Old, button action involved `matched` parameter
          return `<a
            class="${matchClass}"
            href="${matchUrl}">
              <i class="fa-solid ${matchIcon}"></i>
              ${matchText}
            </a>`;
        } else if (hasProxy) {
          return `<a href="/process/${proxy}">Proxy dataset</a>`;
        } else if (hasMatchType) {
          return `No match needed`;
        } else {
          return `Unmatched`;
        }
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
