modules.define(
  'CompareCore',
  [
    // Required modules...
    'CommonHelpers',
    'CommonModal',
    'CompareProxyDialogModal',
    'CompareRowClick',
    'CompareRowsHelpers',
  ],
  function provide_CompareCore(
    provide,
    // Resolved modules...
    CommonHelpers,
    CommonModal,
    CompareProxyDialogModal,
    CompareRowClick,
    CompareRowsHelpers,
  ) {
    /* Compare tables feature code (via global variable `CompareCore`).
     *
     * Data table record types:
     *
     * interface TDataRecord {
     *   amount: number; // 7.135225509515751e-9
     *   amount_display: string; // "7.1e-09"
     *   input_id: number; // 633
     *   location: string; // "United States"
     *   name: string; // "Clothing; at manufacturer"
     *   row_id: string; // "0" (auto increment primary key; initilizes dynamically on the client from the first iteration)
     *   unit: string; // ""
     *   url: string; // "/process/633"
     *   collapsed: boolean; // true
     *   collapsed-group: string; // "Collapsed-XXX-YYYYYY" -- unique key to locate corresponding pair.
     * }
     */

    // Define module...
    const CompareCore = {
      // External data...
      sharedData: undefined, // Initializing in `CompareCore.start` from `bw_matchbox/assets/templates/compare.html`

      // Counter for making unique records (see `replaceWithTargetHandler`)
      targetNodesCounter: 0,

      // Methods...

      shiftRowHandler(event, row, row_id) {
        CompareRowClick.disableRowClickHandler();
        // Add row from source to target array
        event.preventDefault();
        row.parentElement.parentElement.classList.add('shift-right');
        document.getElementById('replace-with-target-arrow').style.display = 'none';
        const { source_data, target_data } = this.sharedData;
        const obj = source_data.find((item) => item.row_id == row_id);
        // Creating new object with unique (?) row_id
        const newObj = { ...obj, row_id: 'source-' + obj.row_id };
        target_data.push(newObj);
        this.sortTable(target_data);
        this.buildTable('target-table', target_data, true);
        this.sharedData.comment += `* Added source exchange of ${obj.amount} ${obj.unit} ${obj.name} in ${obj.location}.\n`;
        row.parentElement.innerHTML = `<i class="fa-solid fa-check"></i>`;
      },

      buildRow(data, is_target) {
        const { collapsedRows } = CompareRowsHelpers;
        const {
          collapsed,
          row_id: rowId,
          url,
          location,
          unit,
          amount_display,
          amount,
          name,
          input_id,
        } = data;
        const rowKind = is_target ? 'target' : 'source';
        const collapsedId = CompareRowsHelpers.getCollapsedId(rowKind, rowId);
        if (collapsed && !collapsedRows[collapsedId] && collapsedRows[collapsedId] !== false) {
          const otherRowKind = !is_target ? 'target' : 'source';
          const otherTableDataKey = otherRowKind + '_data';
          const otherTableData = this.sharedData[otherTableDataKey];
          const collapsedGroupId = data['collapsed-group'];
          const otherRowData = otherTableData.find(
            (other) => other['collapsed-group'] === collapsedGroupId,
          );
          if (!otherRowData) {
            throw new Error('Cannot find other collapsed record');
          }
          const otherRowId = otherRowData.row_id;
          const otherCollapsedId = CompareRowsHelpers.getCollapsedId(otherRowKind, otherRowId);
          collapsedRows[collapsedId] = {
            rowKind,
            rowId,
            pairId: otherRowId,
            // rowEl, // OBSOLETE: Avoid of use it.
          };
          if (!collapsedRows[otherCollapsedId]) {
            collapsedRows[otherCollapsedId] = {
              rowKind: otherRowKind,
              rowId: otherRowId,
              pairId: rowId,
              // rowEl, // OBSOLETE: Avoid of use it.
            };
          }
        }
        // Detect if row is collapsed, then render correspound class (`collapsed`) and append handler node...
        const isCollapsed = !!collapsedRows[collapsedId];
        const collapsedRowHtml =
          isCollapsed && CompareRowsHelpers.buildCollapsedHandlerRow(rowKind, rowId, data);
        // Create class name...
        const className = [isCollapsed && 'collapsed'].filter(Boolean).join(' ');
        const attrs = [['class', className], isCollapsed && ['collapsed-id', collapsedId]]
          .filter(Boolean)
          .map(([name, value]) => value && name + '="' + CommonHelpers.quoteHtmlAttr(value) + '"')
          .filter(Boolean)
          .join(' ');
        const start = `<tr
          ${attrs}
          row_id="${rowId}"
          onClick="CompareCore.clickRowHandler(this)"
        >`;
        const end = `<td class="cell-name"><div><a
            onClick="CompareCore.disableRowClickHandler(this)"
            href="${url}">${name}</a></div></td>
          <td class="cell-location"><div>${location}</div></td>
          <td class="cell-unit"><div>${unit}</div></td>
        </tr>`;
        let content;
        if (is_target) {
          content = `
            <td class="cell-actions" row_id="${rowId}"><div>
              <a
                id="row-trash-${rowId}"
                onClick="CompareCore.removeRowHandler(this)"
                title="Remove row"
              ><i
                class="fa-solid fa-trash-can"></i></a>
              &nbsp;
              <a
                input_id="${input_id}"
                amount="${amount}"
                onClick="CompareCore.expandRowHandler(this)"
                title="Expand row"
              ><i
                class="fa-solid fa-diamond fa-spin"></i></a>
            </div></td>
            <td
              class="cell-amount"
              row_id="${rowId}"><div><a onClick="CompareCore.editNumberHandler(this)">${amount_display}</a></div></td>
        `;
        } else {
          content = `
            <td class="cell-actions">
              <div><a
                onClick="CompareCore.shiftRowHandler(event, this, ${rowId})"
                title="Shift row"
              ><i
              class="fa-solid fa-arrow-right"></i></a></div>
            </td>
            <td class="cell-amount">
              <div>${amount_display}</div>
            </td>`;
        }
        // TODO: Use trim and join with '\b'?
        return [start, content, end, collapsedRowHtml].filter(Boolean).join('');
      },

      /** indexTable - Make table indices
       * @param {<TDataRecord[]>} data
       */
      indexTable(data) {
        for (let i = 0; i < data.length; i++) {
          const obj = data[i];
          obj['row_id'] = String(i); // TODO: Is it ok to make server data 'dirty'?
        }
      },

      /** sortTable - Sort table
       * @param {<TDataRecord[]>} data
       */
      sortTable(data) {
        data.sort(CommonHelpers.sortByAmountProperty);
      },

      /** buildTable - Render data table
       * @param {string} table_id - Table id ('source-table' | 'target-table')
       * @param {<TDataRecord[]>} data
       * @param {boolean} is_target
       */
      buildTable(table_id, data, is_target) {
        /* // NOTE: Sorting and indexing only on initialization or data changing.
         * this.sortTable(data);
         * this.indexTable(data); // Make `row_id` fake indices (NOTE: They're unstable!)
         */
        const rowsList = data.map((obj) => this.buildRow(obj, is_target));
        const header = `
          <thead>
            <tr>
              <th class="cell-actions" title="Action"><div>Action</div></th>
              <th class="cell-amount" title="Amount"><div>Amount</div></th>
              <th class="cell-name" title="Name"><div>Name</div></th>
              <th class="cell-location" title="Location"><div>Location</div></th>
              <th class="cell-unit" title="Unit"><div>Unit</div></th>
            </tr>
          </thead>
        `;
        const content = `
          <tbody>
            ${rowsList.join('')}
          </tbody>
        `;
        document.getElementById(table_id).innerHTML = header + content;
        CompareRowsHelpers.updateCollapsedState();
      },

      replaceWithTargetHandler(elem) {
        CompareRowClick.disableRowClickHandler();
        const { target_node, target_data } = this.sharedData;
        // Trying to make unique row_id...
        const uniqueCounter = ++this.targetNodesCounter;
        const newNode = { ...target_node, row_id: 'replaced-' + uniqueCounter };
        target_data.push(newNode);
        // TODO: Is it required to create (update?) unique row_id
        target_data.splice(0, target_data.length - 1);
        this.sharedData.comment += `* Collapsed input exchanges to target node\n`;
        // TODO: Is sorting required here?
        this.buildTable('target-table', target_data, true);
        elem.innerHTML = '';
      },

      removeRowHandler(element) {
        CompareRowClick.disableRowClickHandler();
        const rowId = element.closest('td').getAttribute('row_id');
        const { target_data } = this.sharedData;
        document.getElementById('replace-with-target-arrow').style.display = 'none';
        target_data.filter((obj, index, arr) => {
          if (obj.row_id == rowId) {
            this.sharedData.comment += `* Removed exchange of ${obj.amount} ${obj.unit} ${obj.name} from ${obj.location}.\n`;
            arr.splice(index, 1);
            return true;
          }
          return false;
        });
        this.buildTable('target-table', target_data, true);
      },

      expandRowHandler(element) {
        const { target_data } = this.sharedData;
        CompareRowClick.disableRowClickHandler();
        const elInputId = element.getAttribute('input_id');
        const elAmount = element.getAttribute('amount');
        const url = '/expand/' + elInputId + '/' + elAmount + '/';
        const node = target_data.find((item) => item.input_id == elInputId);

        document.getElementById('replace-with-target-arrow').style.display = 'none';
        this.sharedData.comment += `* Expanded process inputs of ${node.amount} ${node.unit} from ${node.name} in ${node.location}.\n`;
        fetch(url)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            const { target_data } = this.sharedData;
            data.forEach((node) => {
              const uniqueCounter = ++this.targetNodesCounter;
              const newNode = { ...node, row_id: 'expanded-' + uniqueCounter };
              target_data.push(newNode);
            });
            this.sortTable(target_data);
            this.removeRowHandler(element);
          });
      },

      // Edit number modal dialog (TODO: Extract all this code into it's own dedicated module?)

      replaceAmountRowHandler(elem, target_id) {
        CompareRowClick.disableRowClickHandler();
        const s = this.sharedData.source_data.find(
          (item) => item.row_id == elem.getAttribute('source_id'),
        );
        const t = this.sharedData.target_data.find((item) => item.row_id == target_id);
        this.sharedData.comment += `* Used source database amount ${s.amount} ${s.unit} from ${s.name} in ${s.location} instead of ${t.amount} ${t.unit} from ${t.name} in ${t.location}.\n`;
        document.getElementById('number-current-amount').innerText = elem.getAttribute('amount');
      },

      rescaleAmountHandler(event) {
        event.preventDefault();
        const { target } = event;
        const formRootElem = target.closest('.set-number-modal-form');
        const rowId = formRootElem.getAttribute('row_id');
        CompareRowClick.disableRowClickHandler();
        const t = this.sharedData.target_data.find((item) => item.row_id == rowId);
        const scale = Number(document.getElementById('rescale_number').value);
        const node = document.getElementById('number-current-amount');
        if (scale != 1) {
          this.sharedData.comment += `* Rescaled amount ${t.amount} ${t.unit} from ${t.name} in ${t.location} by ${scale}.\n`;
        }
        node.innerText = Number(node.innerText) * scale;
      },

      setNewNumberHandler(event) {
        event.preventDefault();
        const { target } = event;
        const formRootElem = target.closest('.set-number-modal-form');
        const rowId = formRootElem.getAttribute('row_id');
        CompareRowClick.disableRowClickHandler();
        const t = this.sharedData.target_data.find((item) => item.row_id == rowId);
        const new_value = document.getElementById('new_number').value;
        this.sharedData.comment += `* Set manual exchange value of ${new_value} instead of ${t.amount} ${t.unit} for ${t.name} in ${t.location}.\n`;
        document.getElementById('number-current-amount').innerText = new_value;
      },

      setNumberHandler(event) {
        event.preventDefault();
        const { target } = event;
        const formRootElem = target.closest('.set-number-modal-form');
        const rowId = formRootElem.getAttribute('row_id');
        const { target_data } = this.sharedData;
        CompareRowClick.disableRowClickHandler();
        const current = Number(document.getElementById('number-current-amount').innerText);
        const item = target_data.find(({ row_id }) => row_id === rowId);
        if (item) {
          item.amount = current;
          item.amount_display = current.toExponential();
        }
        // TODO: Number formatting is weird here. It would be nice to fix it.
        CommonModal.hideModal();
        this.sortTable(target_data);
        this.buildTable('target-table', target_data, true);
      },

      resetNumberHandler(event) {
        event.preventDefault();
        const { target } = event;
        const formRootElem = target.closest('.set-number-modal-form');
        const rowId = formRootElem.getAttribute('row_id');
        const { target_data } = this.sharedData;
        CompareRowClick.disableRowClickHandler();
        // Get original amount value to restore...
        const item = target_data.find(({ row_id }) => row_id === rowId);
        const { amount } = item;
        // Find dom nodes...
        const showNumber = document.getElementById('number-current-amount');
        const inputNumber = document.getElementById('new_number');
        // Update data...
        showNumber.innerText = amount;
        inputNumber.value = amount;
      },

      editNumberHandler(link) {
        CompareRowClick.disableRowClickHandler();
        const { source_data, target_data } = this.sharedData;
        const td = link.closest('td');
        const rowId = td.getAttribute('row_id');
        const row = target_data.find(({ row_id }) => row_id == rowId);

        let start = `
          <div class="set-number-modal-table">
            <p>Click on a row to take that value</p>
            <table id="edit-number-table" class="fixed-table modal-table" width="100%">
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Name</th>
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody>
        `;

        source_data.forEach((item) => {
          start += `
                <tr amount="${item.amount}" source_id="${item.row_id}" onClick="CompareCore.replaceAmountRowHandler(this, ${row.row_id})">
                  <td><div>${item.amount_display}</div></td>
                  <td><div>${item.name}</div></td>
                  <td><div>${item.unit}</div></td>
                </tr>
          `;
        });

        const end = `
              <tbody>
            </table>
          </div>
          <div class="set-number-modal-form" row_id="${rowId}">
            <div class="strong"><strong>Original amount:</strong> ${row.amount}</div>
            <div class="strong"><strong>Current amount:</strong> <span id="number-current-amount">${row.amount}</span></div>
            <hr />
            <button class="button-primary" id="close-number-editor">Set and close</button>
            <button id="reset-number">Reset number</button>
            <hr />
            <form>
              <div>
                <label>Enter new amount</label>
                <input type="number" id="new_number" value="${row.amount}">
                <button id="new-number-button">Set</button>
              </div>
              <hr />
              <div>
                <label>Rescale current amount</label>
                <input type="number" id="rescale_number" value="1.0">
                <button id="rescale-button">Rescale</button>
              </div>
            </form>
          </div>
        `;

        const title = [row.name, row.location, row.unit].filter(Boolean).join(' | ');
        const content = start + end;

        CommonModal.setModalContentId('set-number-modal')
          .setTitle(title)
          .setModalContentOptions({
            // Scrollings and paddings will be set for inner components particaluary.
            scrollable: false,
            padded: false,
          })
          .setContent(content)
          .showModal();

        // Set modal handlers...
        document
          .getElementById('rescale-button')
          .addEventListener('click', this.rescaleAmountHandler.bind(this));
        document
          .getElementById('new-number-button')
          .addEventListener('click', this.setNewNumberHandler.bind(this));
        document
          .getElementById('close-number-editor')
          .addEventListener('click', this.setNumberHandler.bind(this));
        document
          .getElementById('reset-number')
          .addEventListener('click', this.resetNumberHandler.bind(this));
      },

      stop(event) {
        event.preventDefault();
      },

      // Start...

      /** start -- Initialize compare feature (entry point)
       * @param {object} sharedData -- See initialization in `bw_matchbox/assets/templates/compare.html`
       */
      start(sharedData) {
        // Save public data...
        this.sharedData = sharedData;
        CompareRowsHelpers.sharedData = sharedData;
        CompareProxyDialogModal.sharedData = sharedData;

        const { source_data, target_data } = this.sharedData;

        // console.log('[CompareCore:start] sharedData', sharedData);

        // Prepare all the tables data...
        this.indexTable(source_data);
        this.indexTable(target_data);
        this.sortTable(source_data);
        this.sortTable(target_data);

        // Create tables...
        this.buildTable('source-table', source_data, false);
        this.buildTable('target-table', target_data, true);

        // Button handlers...
        document
          .getElementById('save-mapping-button')
          .addEventListener(
            'click',
            CompareProxyDialogModal.openProxyDialogModal.bind(CompareProxyDialogModal),
            false,
          );
        document
          .getElementById('one-to-one')
          .addEventListener(
            'click',
            CompareProxyDialogModal.createOneToOneProxyFunc.bind(CompareProxyDialogModal),
            false,
          );

        const expandAll = document.getElementById('expand-all-collapsed');
        expandAll.addEventListener(
          'click',
          CompareRowsHelpers.expandAllCollapsedRows.bind(CompareRowsHelpers),
        );
      },

      // Re-exported handlers for access from the html code (only core module is exposed as global)...

      /** clickRowHandler
       * @param {<TRowEl>} rowEl
       */
      clickRowHandler(rowEl) {
        return CompareRowsHelpers.clickRowHandler(rowEl);
      },

      /** clickUncollapseRowHandler -- Uncollapse both rows for this clicked collpase handler
       * @param {<HTMLTableRowElement>} firstHandlerEl
       */
      clickUncollapseRowHandler(firstHandlerEl) {
        return CompareRowsHelpers.clickUncollapseRowHandler(firstHandlerEl);
      },

      disableRowClickHandler() {
        return CompareRowClick.disableRowClickHandler();
      },
    };

    // Provide module...
    provide(CompareCore);
  },
);
