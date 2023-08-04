modules.define(
  'CompareCore',
  [
    // Required modules...
    'CommonHelpers',
    'CommonModal',
    'CompareRowClick',
    'CompareRowsHelpers',
  ],
  function provide_CompareCore(
    provide,
    // Resolved modules...
    CommonHelpers,
    CommonModal,
    CompareRowClick,
    CompareRowsHelpers,
  ) {
    /* Compare tables feature code (via global variable `CompareCore`).
     *
     * Mouse handler methods are used:
     * - CompareRowsHelpers.clickRow -- Click on regular row to select or collapse selected rows.
     * - CompareRowsHelpers.clickUncollapseRow -- Click on collapsed row handler to uncollapse.
     * - CompareRowClick.disableRowClick -- To disable row click effect (if we have some nested interactive elements).
     * - CompareCore.removeRow
     * - CompareCore.expandRow
     * - CompareCore.editNumber
     * - CompareCore.shiftRow
     * - CompareCore.replaceAmountRow
     * - CompareCore.setNumber
     * - CompareCore.setNewNumber
     * - CompareCore.rescaleAmount
     * - CompareCore.replaceWithTarget
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

      // Counter for making unique records (see `replaceWithTarget`)
      targetNodesCounter: 0,

      // Local data...
      comment: '',
      // modal: undefined, // HTMLDivElement -- modal window node

      // Methods...

      shiftRow(event, row, row_id) {
        CompareRowClick.disableRowClick();
        // Add row from source to target array
        event.preventDefault();
        row.parentElement.parentElement.classList.add('shift-right');
        const { source_data, target_data } = this.sharedData;
        const obj = source_data.find((item) => item.row_id == row_id);
        // Creating new object with unique (?) row_id
        const newObj = { ...obj, row_id: 'source-' + obj.row_id };
        target_data.push(newObj);
        this.sortTable(target_data);
        this.buildTable('target-table', target_data, true);
        this.comment += `* Added source exchange of ${obj.amount} ${obj.unit} ${obj.name} in ${obj.location}.\n`;
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
          const otherRowId = otherTableData.findIndex(
            (other) => other['collapsed-group'] === collapsedGroupId,
          );
          // const otherRowData = otherRowId !== -1 && otherTableData[otherRowId]; // UNUSED
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
          onClick="CompareCore.clickRow(this)"
        >`;
        const end = `<td class="cell-name"><div><a
            onClick="CompareCore.disableRowClick(this)"
            href="${url}">${name}</a></div></td>
          <td class="cell-location"><div>${location}</div></td>
          <td class="cell-unit"><div>${unit}</div></td>
        </tr>`;
        let content;
        if (is_target) {
          content = `
            <td class="cell-actions" row_id="${rowId}"><div>
              <span
                id="row-trash-${rowId}"
              ><a
                onClick="CompareCore.removeRow(this)"
                title="Remove row"
              ><i
                class="fa-solid fa-trash-can"></i></a></span>
              &nbsp;
              <span
                input_id="${input_id}"
                amount="${amount}"><a
                  onClick="CompareCore.expandRow(this)"
                  title="Expand row"
                ><i
                class="fa-solid fa-diamond fa-spin"></i></a></span>
            </div></td>
            <td
              class="cell-amount"
              row_id="${rowId}"><div><a onClick="CompareCore.editNumber(this)">${amount_display}</a></div></td>
        `;
        } else {
          content = `
            <td class="cell-actions">
              <div><a
                onClick="CompareCore.shiftRow(event, this, ${rowId})"
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
      },

      createOneToOneProxyFunc(event) {
        event.preventDefault();

        const submission_data = {
          exchanges: [{ input_id: this.sharedData.target_id, amount: 1.0 }],
          source: this.sharedData.source_id,
          comment: 'One-to-one proxy',
          name:
            'Proxy for ' +
            this.sharedData.target_name
              .replace('Market group for ', '')
              .replace('market group for ', '')
              .replace('Market for ', '')
              .replace('market for ', '')
              .trim(),
        };
        const url = '/create-proxy/';
        fetch(url, {
          method: 'POST',
          redirect: 'follow',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submission_data),
        }).then((response) => {
          if (response.redirected) {
            window.location.href = response.url;
          }
        });
      },

      createProxyFunc(event) {
        event.preventDefault();
        const {
          target_name,
          // comment,
          source_node_unit,
          source_node_location,
          target_data,
          source_id,
        } = this.sharedData;
        const {
          comment,
        } = this;
        const name =
          'Proxy for ' +
          target_name
            .replace('Market group for ', '')
            .replace('market group for ', '')
            .replace('Market for ', '')
            .replace('market for ', '')
            .trim();

        const begin = `
          <form>
            <input class="u-full-width" type="text" id="proxy-name" name="proxy-name" value="${name}">
            <label for="proxy-comment">Comment</label>
            <textarea class="u-full-width" id="proxy-comment" name="proxy-comment">${comment || ''}</textarea>
            <p><button class="button-primary" id="create-proxy-submit-button">Create Proxy Process</button>
            | Unit: ${source_node_unit}
            | Location: ${source_node_location}</p>
            <table width="100%">
              <tr>
                <th>Name</th>
                <th>Amount</th>
                <th>Comment</th>
              </tr>
        `;

        const rows = target_data.map(function (item, _index) {
          return `
              <tr input_id=${item.input_id}>
                <td><div>${item.name}</div></td>
                <td><div>${item.amount_display}</div></td>
                <td><div><textarea type="text" id="proxy-name-${item.input_id}" name="proxy-name-${item.input_id}"></textarea></div></td>
              </tr>
          `;
        });

        const end = `
            </table>
          </form>
        `;

        const title = 'Proxy name';
        const content = begin + rows.join('') + end;

        CommonModal.setModalContentId('proxy-dialog-modal')
          .setTitle(title)
          .setModalContentOptions({
            scrollable: true,
            padded: true,
          })
          .setContent(content)
          .showModal();

        const submit = document.getElementById('create-proxy-submit-button');
        submit.addEventListener('click', async (e) => {
          e.preventDefault();
          const submission_data = {
            exchanges: target_data,
            source: source_id,
            comment: document.getElementById('proxy-comment').value,
            name: document.getElementById('proxy-name').value,
          };
          const url = '/create-proxy/';
          fetch(url, {
            method: 'POST',
            redirect: 'follow',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submission_data),
          }).then((response) => {
            if (response.redirected) {
              window.location.href = response.url;
            }
          });
        });
      },

      replaceWithTarget(elem) {
        CompareRowClick.disableRowClick();
        const { target_node, target_data } = this.sharedData;
        // Trying to make unique row_id...
        const uniqueCounter = ++this.targetNodesCounter;
        const newNode = { ...target_node, row_id: 'replaced-' + uniqueCounter };
        target_data.push(newNode);
        // TODO: Is it required to create (update?) unique row_id
        target_data.splice(0, target_data.length - 1);
        this.comment += `* Collapsed input exchanges to target node\n`;
        // TODO: Is sorting required here?
        this.buildTable('target-table', target_data, true);
        elem.innerHTML = '';
      },

      removeRow(element) {
        CompareRowClick.disableRowClick();
        const row_id = element.parentElement.getAttribute('row_id');
        function removeValue(obj, index, arr) {
          if (obj.row_id == row_id) {
            this.comment += `* Removed exchange of ${obj.amount} ${obj.unit} ${obj.name} from ${obj.location}.\n`;
            arr.splice(index, 1);
            return true;
          }
          return false;
        }
        this.sharedData.target_data.filter(removeValue);
        this.buildTable('target-table', this.sharedData.target_data, true);
      },

      expandRow(element) {
        CompareRowClick.disableRowClick();
        const url =
          '/expand/' +
          element.getAttribute('input_id') +
          '/' +
          element.getAttribute('amount') +
          '/';
        const t = this.sharedData.target_data.find(
          (item) => item.input_id == element.getAttribute('input_id'),
        );
        this.comment += `* Expanded process inputs of ${t.amount} ${t.unit} from ${t.name} in ${t.location}.\n`;
        fetch(url)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            data.forEach(function (item, _index) {
              this.sharedData.target_data.push(item);
            });
            this.sharedData.target_data.sort(CommonHelpers.sortByAmountProperty);
            this.removeRow(element);
          });
      },

      replaceAmountRow(elem, target_id) {
        CompareRowClick.disableRowClick();
        const s = this.sharedData.source_data.find(
          (item) => item.row_id == elem.getAttribute('source_id'),
        );
        const t = this.sharedData.target_data.find((item) => item.row_id == target_id);
        this.comment += `* Used source database amount ${s.amount} ${s.unit} from ${s.name} in ${s.location} instead of ${t.amount} ${t.unit} from ${t.name} in ${t.location}.\n`;
        document.getElementById('number-current-amount').innerText = elem.getAttribute('amount');
      },

      rescaleAmount(target_id) {
        CompareRowClick.disableRowClick();
        const t = this.sharedData.target_data.find((item) => item.row_id == target_id);
        const scale = Number(document.getElementById('rescale_number').value);
        const node = document.getElementById('number-current-amount');
        if (scale != 1) {
          this.comment += `* Rescaled amount ${t.amount} ${t.unit} from ${t.name} in ${t.location} by ${scale}.\n`;
        }
        node.innerText = Number(node.innerText) * scale;
      },

      setNewNumber(target_id) {
        CompareRowClick.disableRowClick();
        const t = this.sharedData.target_data.find((item) => item.row_id == target_id);
        const new_value = document.getElementById('new_number').value;
        this.comment += `* Set manual exchange value of ${new_value} instead of ${t.amount} ${t.unit} for ${t.name} in ${t.location}.\n`;
        document.getElementById('number-current-amount').innerText = new_value;
      },

      setNumber(elem) {
        const { target_data } = this.sharedData;
        CompareRowClick.disableRowClick();
        const rowId = elem.getAttribute('row_id');
        const current = Number(document.getElementById('number-current-amount').innerText);
        const item = target_data.find(({ row_id }) => row_id === rowId);
        if (item) {
          item.amount = current;
          item.amount_display = current.toExponential();
        }
        // TODO: Number formatting is weird here. It would be nice to fix it.
        /* console.log('[CompareCore:setNumber]', {
         *   // itemOrig,
         *   item,
         *   rowId,
         *   current,
         * });
         */
        // this.modal.style.display = 'none';
        CommonModal.hideModal();
        this.sortTable(target_data);
        this.buildTable('target-table', target_data, true);
      },

      editNumber(link) {
        CompareRowClick.disableRowClick();
        const { source_data, target_data } = this.sharedData;
        const td = link.closest('td');
        const rowId = td.getAttribute('row_id');
        const row = target_data.find(({ row_id }) => row_id == rowId);

        let start = `
          <div>
            <p>Click on a row to take that value</p>
            <table class="modal-table" width="100%">
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
                <tr amount="${item.amount}" source_id="${item.row_id}" onClick="CompareCore.replaceAmountRow(this, ${row.row_id})">
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
          <div>
            <div class="strong"><strong>Original amount:</strong> ${row.amount}</div>
            <div class="strong"><strong>Current amount:</strong> <span id="number-current-amount">${row.amount}</span></div>
            <button class="button-primary" id="close-number-editor" row_id="${row.row_id}" onClick="CompareCore.setNumber(this)">Set and close</button>
            <hr />
            <form>
              <div>
                <label>Enter new amount</label>
                <input type="number" id="new_number" value="${row.amount}">
                <button onClick="CompareCore.setNewNumber(${row.row_id})" id="new-number-button">Set</button>
              </div>
              <hr />
              <div>
                <label>Rescale current amount</label>
                <input type="number" id="rescale_number" value="1.0">
                <button onClick="CompareCore.rescaleAmount(${row.row_id})" id="rescale-button">Rescale</button>
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
        const boundStop = this.stop.bind(this);
        document.getElementById('rescale-button').addEventListener('click', boundStop, false);
        document.getElementById('new-number-button').addEventListener('click', boundStop, false);
        document.getElementById('close-number-editor').addEventListener('click', boundStop, false);
        // TODO: To integrate this code (`event.preventDefault()`) into the
        // handlers (`rescaleAmount`, `setNewNumber`, `setNumber`), by refactor
        // handlers to get stored `row_id`, and get event object from arguments
        // instead.
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
          .addEventListener('click', this.createProxyFunc.bind(this), false);
        document
          .getElementById('one-to-one')
          .addEventListener('click', this.createOneToOneProxyFunc.bind(this), false);
      },

      // Re-exported handlers for access from the html code (only core module is exposed as global)...

      /** clickRow
       * @param {<TRowEl>} rowEl
       */
      clickRow(rowEl) {
        return CompareRowsHelpers.clickRow(rowEl);
      },

      /** clickUncollapseRow -- Uncollapse both rows for this clicked collpase handler
       * @param {<HTMLTableRowElement>} firstHandlerEl
       */
      clickUncollapseRow(firstHandlerEl) {
        return CompareRowsHelpers.clickUncollapseRow(firstHandlerEl);
      },

      disableRowClick() {
        return CompareRowClick.disableRowClick();
      },
    };

    // Provide module...
    provide(CompareCore);
  },
);
