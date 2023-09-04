// @ts-check

import * as CommonHelpers from '../../common/CommonHelpers.js';
import { commonModal } from '../../common/CommonModal.js';
import { commonNotify } from '../../common/CommonNotify.js';

import { CompareProxyDialogModal } from './CompareProxyDialogModal.js';
import { CompareRowClick } from './CompareRowClick.js';
import { CompareRowsHelpers } from './CompareRowsHelpers.js';

export const CompareCore = {
  /** External data...
   * @type {TSharedParams}
   */
  sharedParams: undefined, // Initializing in `CompareCore.start` from `compare.html`

  // Counter for making unique records (see `replaceWithTargetHandler`)
  targetNodesCounter: 0,

  // Methods...

  /**
   * @param {TDataRecord} data
   * @param {boolean} is_target
   */
  buildRow(data, is_target) {
    // NOTE: Row operations handlers: shiftRowHandler, editNumberHandler, expandRowHandler, removeRowHandler
    // Reg: \<\(shiftRowHandler\|editNumberHandler\|expandRowHandler\|removeRowHandler\>\)
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
      matched,
    } = data;
    const rowKind = is_target ? 'target' : 'source';
    const collapsedId = CompareRowsHelpers.getCollapsedId(rowKind, rowId);
    if (collapsed && !collapsedRows[collapsedId] && collapsedRows[collapsedId] !== false) {
      const otherRowKind = !is_target ? 'target' : 'source';
      const otherTableDataKey = /** @type {'target_data' | 'source_data'} */ (
        otherRowKind + '_data'
      );
      const otherTableData = this.sharedParams[otherTableDataKey];
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
    const trAttrs = [['class', className], isCollapsed && ['collapsed-id', collapsedId]]
      .filter(Boolean)
      .map(([name, value]) => value && name + '="' + CommonHelpers.quoteHtmlAttr(value) + '"')
      .filter(Boolean)
      .join(' ');
    const start = `<tr
          ${trAttrs}
          row_id="${rowId}"
          onClick="CompareCore.clickRowHandler(this)"
        >`;
    // Issue #59: Name cell with check icon for 'matched' rows...
    const nameClassName = `cell-name${matched && ' matched'}`;
    let nameContent = `<a onClick="CompareCore.disableRowClickHandler(this)" href="${url}">${name}</a>`;
    if (!is_target && matched) {
      nameContent = `<i class="name-icon fa-solid fa-check"></i><span class="name-text">${nameContent}</span>`;
    }
    const end = `<td class="${nameClassName}"><div>${nameContent}</div></td>
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
                class="fa-solid fa-up-right-and-down-left-from-center"></i></a>
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
   * @param {TDataRecord[]} data
   */
  indexTable(data) {
    for (let i = 0; i < data.length; i++) {
      const obj = data[i];
      obj['row_id'] = String(i); // TODO: Is it ok to make server data 'dirty'?
    }
  },

  /** sortTable - Sort table
   * @param {TDataRecord[]} data
   */
  sortTable(data) {
    data.sort(CommonHelpers.sortByAmountProperty);
  },

  /** buildTable - Render data table
   * @param {string} table_id - Table id ('source-table' | 'target-table')
   * @param {TDataRecord[]} data
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

  /**
   * @param {HTMLElement} elem
   */
  replaceWithTargetHandler(elem) {
    // CompareRowClick.disableRowClickHandler(); // NOTE: It's not inside the row
    const { target_node, target_data } = this.sharedParams;
    // Trying to make unique row_id...
    const uniqueCounter = ++this.targetNodesCounter;
    const newNode = { ...target_node, row_id: 'replaced-' + uniqueCounter };
    target_data.push(newNode);
    // TODO: Is it required to create (update?) unique row_id
    target_data.splice(0, target_data.length - 1);
    this.sharedParams.comment += `* Collapsed input exchanges to target node\n`;
    // TODO: Is sorting required here?
    this.buildTable('target-table', target_data, true);
    // Hide icon...
    elem.classList.toggle('hidden', true); // Old code: `innerHTML = ''`
  },

  /** setModifiedRowsStatus -- Set modified status: if it had set then `replaceWithTargetHandler` operarion should be disabled
   * @param {boolean} [hasModifiedRows]
   */
  setModifiedRowsStatus(hasModifiedRows) {
    /* // XXX Do we need this global state?
     * const rootNode = CompareRowsHelpers.getRootNode();
     * rootNode.classList.toggle('has-modified-rows', hasModifiedRows);
     */
    const replaceButton = document.getElementById('replace-with-target-arrow');
    replaceButton.classList.toggle('disabled', hasModifiedRows);
  },

  // Row operations handlers: shiftRowHandler, expandRowHandler,
  // removeRowHandler, editNumberHandler (below, in 'Edit number modal
  // dialog' section, actual final handler: setNumberAndCloseModalHandler)...

  /**
   * @param {{ preventDefault: () => void; }} event
   * @param {{ parentElement: any; }} row
   * @param {string} row_id
   */
  shiftRowHandler(event, row, row_id) {
    CompareRowClick.disableRowClickHandler();
    // Add row from source to target array
    event.preventDefault();
    const parentNode = row.parentElement;
    parentNode.parentElement.classList.add('shift-right');
    parentNode.innerHTML = `<i class="fa-solid fa-check"></i>`;
    const { source_data, target_data } = this.sharedParams;
    const obj = source_data.find((item) => item.row_id == row_id);
    // Creating new object with unique (?) row_id
    const newObj = { ...obj, row_id: 'source-' + obj.row_id };
    target_data.push(newObj);
    this.sortTable(target_data);
    this.buildTable('target-table', target_data, true);
    this.sharedParams.comment += `* Added source exchange of ${obj.amount} ${obj.unit} ${obj.name} in ${obj.location}.\n`;
    this.setModifiedRowsStatus(true);
  },

  /**
   * @param {HTMLElement} element
   */
  removeRowHandler(element) {
    CompareRowClick.disableRowClickHandler();
    const rowId = element.closest('td').getAttribute('row_id');
    const { target_data } = this.sharedParams;
    target_data.filter((obj, index, arr) => {
      if (obj.row_id == rowId) {
        this.sharedParams.comment += `* Removed exchange of ${obj.amount} ${obj.unit} ${obj.name} from ${obj.location}.\n`;
        arr.splice(index, 1);
        return true;
      }
      return false;
    });
    // TODO: Just remove current row?
    this.buildTable('target-table', target_data, true);
    this.setModifiedRowsStatus(true);
  },

  /**
   * @param {HTMLElement} element
   */
  expandRowHandler(element) {
    const { target_data } = this.sharedParams;
    CompareRowClick.disableRowClickHandler();
    const elInputId = Number(element.getAttribute('input_id'));
    const elAmount = Number(element.getAttribute('amount'));
    const url = '/expand/' + elInputId + '/' + elAmount + '/';
    const node = target_data.find((item) => item.input_id == elInputId);
    this.sharedParams.comment += `* Expanded process inputs of ${node.amount} ${node.unit} from ${node.name} in ${node.location}.\n`;
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          const error = new Error(`Can't load url '${res.url}': ${res.statusText}, ${res.status}`);
          throw error;
        }
        return res.json();
      })
      .then((data) => {
        const { target_data } = this.sharedParams;
        data.forEach((/** @type {TDataRecord} */ node) => {
          const uniqueCounter = ++this.targetNodesCounter;
          const newNode = /** @type {TDataRecord} */ ({
            ...node,
            row_id: 'expanded-' + uniqueCounter,
          });
          target_data.push(newNode);
        });
        this.sortTable(target_data);
        this.removeRowHandler(element);
        this.setModifiedRowsStatus(true);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('[CompareCore:copyToClipboardHandler] Catched error', error);
        // eslint-disable-next-line no-debugger
        debugger;
        // Show error in the notification toast...
        commonNotify.showError(`Can't expand row: ${CommonHelpers.getErrorText(error)}`);
      });
  },

  // Edit number modal dialog (TODO: Extract all this code into it's own dedicated module?)

  /**
   * @param {HTMLElement} elem
   */
  replaceAmountRowHandler(elem) {
    CompareRowClick.disableRowClickHandler();
    const target_id = elem.getAttribute('target_id');
    const source_id = elem.getAttribute('source_id');
    const sourceRow = this.sharedParams.source_data.find((item) => item.row_id == source_id);
    if (!sourceRow) {
      throw new Error('Not found source row for id: ' + source_id);
    }
    const targetRow = this.sharedParams.target_data.find((item) => item.row_id == target_id);
    if (!targetRow) {
      throw new Error('Not found target row for id: ' + target_id);
    }
    this.sharedParams.comment += `* Used source database amount ${sourceRow.amount} ${sourceRow.unit} from ${sourceRow.name} in ${sourceRow.location} instead of ${targetRow.amount} ${targetRow.unit} from ${targetRow.name} in ${targetRow.location}.\n`;
    const amount = sourceRow.amount;
    document.getElementById('number-current-amount').innerText = String(amount);
  },

  /**
   * @param {{ preventDefault?: any; target?: any; }} event
   */
  rescaleAmountHandler(event) {
    event.preventDefault();
    const { target } = event;
    const formRootElem = target.closest('.set-number-modal-form');
    const rowId = formRootElem.getAttribute('row_id');
    CompareRowClick.disableRowClickHandler();
    const t = this.sharedParams.target_data.find((item) => item.row_id == rowId);
    const scale = Number(
      /** @type {HTMLInputElement} */ (document.getElementById('rescale_number')).value,
    );
    const node = document.getElementById('number-current-amount');
    if (scale != 1) {
      this.sharedParams.comment += `* Rescaled amount ${t.amount} ${t.unit} from ${t.name} in ${t.location} by ${scale}.\n`;
    }
    node.innerText = String(Number(node.innerText) * scale);
  },

  /**
   * @param {{ preventDefault?: any; target?: any; }} event
   */
  setNewNumberHandler(event) {
    event.preventDefault();
    const { target } = event;
    const formRootElem = target.closest('.set-number-modal-form');
    const rowId = formRootElem.getAttribute('row_id');
    CompareRowClick.disableRowClickHandler();
    const t = this.sharedParams.target_data.find((item) => item.row_id == rowId);
    const new_value = /** @type {HTMLInputElement} */ (document.getElementById('new_number')).value;
    this.sharedParams.comment += `* Set manual exchange value of ${new_value} instead of ${t.amount} ${t.unit} for ${t.name} in ${t.location}.\n`;
    document.getElementById('number-current-amount').innerText = new_value;
  },

  /**
   * @param {MouseEvent} event
   */
  setNumberAndCloseModalHandler(event) {
    event.preventDefault();
    const target = /** @type {HTMLElement} */ (event.target);
    const formRootElem = target.closest('.set-number-modal-form');
    const rowId = formRootElem.getAttribute('row_id');
    const { target_data } = this.sharedParams;
    CompareRowClick.disableRowClickHandler();
    const current = Number(document.getElementById('number-current-amount').innerText);
    const item = target_data.find(({ row_id }) => row_id === rowId);
    if (item) {
      item.amount = current;
      // TODO: Number formatting is weird here. It would be nice to fix it.
      item.amount_display = current.toExponential();
    }
    commonModal.hideModal();
    this.sortTable(target_data);
    this.buildTable('target-table', target_data, true);
    this.setModifiedRowsStatus(true);
  },

  /**
   * @param {{ preventDefault?: any; target?: any; }} event
   */
  resetNumberHandler(event) {
    event.preventDefault();
    const { target } = event;
    const formRootElem = target.closest('.set-number-modal-form');
    const rowId = formRootElem.getAttribute('row_id');
    const { target_data } = this.sharedParams;
    CompareRowClick.disableRowClickHandler();
    // Get original amount value to restore...
    const item = target_data.find(({ row_id }) => row_id === rowId);
    const { amount } = item;
    // Find dom nodes...
    const showNumber = document.getElementById('number-current-amount');
    const inputNumber = /** @type {HTMLInputElement} */ (document.getElementById('new_number'));
    // Update data...
    showNumber.innerText = String(amount);
    inputNumber.value = String(amount);
  },

  /**
   * @param {TDataRecord} row
   */
  getEditNumberModalContent(row) {
    const rowId = row.row_id;
    const { source_data } = this.sharedParams;
    const start = `
          <div class="set-number-modal-table">
            <p>Click on a row to take that value</p>
            <table id="edit-number-table" class="fixed-table fixed-table-active modal-table" width="100%">
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Name</th>
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody>
        `;
    const rowsContent = source_data.map((item) => {
      return `
            <tr source_id="${item.row_id}" target_id="${rowId}" onClick="CompareCore.replaceAmountRowHandler(this)">
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
            <button class="button-primary" id="set-and-close-number-editor">Save amount</button>
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
    return start + rowsContent.join('') + end;
  },

  /**
   * @param {HTMLAnchorElement} link
   */
  editNumberHandler(link) {
    CompareRowClick.disableRowClickHandler();
    const { target_data } = this.sharedParams;
    const td = link.closest('td');
    const rowId = td.getAttribute('row_id');
    const row = target_data.find(({ row_id }) => row_id == rowId);

    const title = [row.name, row.location, row.unit].filter(Boolean).join(' | ');
    const content = this.getEditNumberModalContent(row);

    commonModal.ensureInit().then(() => {
      commonModal
        .setModalContentId('set-number-modal')
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
        .getElementById('set-and-close-number-editor')
        .addEventListener('click', this.setNumberAndCloseModalHandler.bind(this));
      document
        .getElementById('reset-number')
        .addEventListener('click', this.resetNumberHandler.bind(this));
    });
  },

  /**
   * @param {{ preventDefault: () => void; }} event
   */
  stop(event) {
    event.preventDefault();
  },

  // Copy to clipboard

  /**
   * @param {HTMLElement} node
   */
  copyToClipboardHandler(node) {
    const { sharedParams } = this;
    const nodeType = node.getAttribute('data-node-type');
    const nameId = nodeType + '_node_name'; // 'source_node_name' | 'target_node_name'
    const urlId = nodeType + '_node_url'; // 'source_node_url' | 'target_node_url'
    const name = sharedParams[nameId];
    const url = sharedParams[urlId];
    const text = '[' + name + '](' + url + ')';
    // NOTE: Docment should be focused...
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Show notification...
        commonNotify.showSuccess('Text already copied to clipboard');
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('[CompareCore:copyToClipboardHandler] Catched error', error);
        // eslint-disable-next-line no-debugger
        debugger;
        // Show error in the notification toast...
        commonNotify.showError(
          `Can't copy text to clipboard: ${CommonHelpers.getErrorText(error)}`,
        );
      });
    // TODO: To catch promise resolve or catch?
    return false;
  },

  // Start...

  /** start -- Initialize compare feature (entry point)
   * @param {object} sharedParams -- See initialization in `bw_matchbox/assets/templates/compare.html`
   */
  start(sharedParams) {
    // Save public data...
    this.sharedParams = sharedParams;
    CompareRowsHelpers.sharedParams = sharedParams;
    CompareProxyDialogModal.sharedParams = sharedParams;

    /* // DEBUG: Show demo notifiers...
     * CommonNotify.showDemo();
     */

    const { source_data, target_data } = this.sharedParams;

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
   * @param {TRowEl} rowEl
   */
  clickRowHandler(rowEl) {
    return CompareRowsHelpers.clickRowHandler(rowEl);
  },

  /** clickUncollapseRowHandler -- Uncollapse both rows for this clicked collpase handler
   * @param {HTMLTableRowElement} firstHandlerEl
   */
  clickUncollapseRowHandler(firstHandlerEl) {
    return CompareRowsHelpers.clickUncollapseRowHandler(firstHandlerEl);
  },

  disableRowClickHandler() {
    return CompareRowClick.disableRowClickHandler();
  },
};
