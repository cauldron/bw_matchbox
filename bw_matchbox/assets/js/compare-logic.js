/* Compare tables feature code (via global variable `compareLogic`).
 *
 * Used mouse handler' methods:
 * - clickRow
 * - disableRowClick
 * - removeRow
 * - expandRow
 * - editNumber
 * - shiftRow
 * - replaceAmountRow
 * - setNumber
 * - setNewNumber
 * - rescaleAmount
 * - replaceWithTarget
 *
 * TODO:
 *
 * - 2023.07.28, 16:57 -- Extract row-related low- and high-level methods to external
 *   module. Probably we need two modules (for low-level supprting code and
 *   high level logic-related one). Extract common potentionally reshareable
 *   methods to common module.
 *
 * Data table record types:
 *
 * interface TDataRecord {
 *   amount: number; // 7.135225509515751e-9
 *   amount_display: string; // "7.1e-09"
 *   input_id: number; // 633
 *   location: string; // "United States"
 *   name: string; // "Clothing; at manufacturer"
 *   row_id: string; // "0"
 *   unit: string; // ""
 *   url: string; // "/process/633"
 * }
 */

// global module variable
// eslint-disable-next-line no-unused-vars
const compareLogic = {
  sharedData: undefined,
  localData: {
    comment: '',
    // Row click data...
    rowClick: {
      timeout: 100,
      disabled: false,
      releaseHandler: undefined,
    },
    // Collpsing rows data...
    collapsed: {
      /* Compare feature types (ts-like):
       * type TRowKind = 'source' | 'target';
       * type TRowEl = HTMLTableRowElement;
       * type TRowId = string;
       * interface TSelectedRow {
       *   rowKind: TRowKind;
       *   // TODO: It will be impossible to use elements for paginated tables
       *   // (because the nodes for the same elements could be different).
       *   rowEl: TRowEl;
       *   rowId: TRowId;
       * };
       * interface TCollapsedRow extends TSelectedRow { pairId: TRowId };
       */
      selectedFirst: undefined, // <undefined | TSelectedRow>
      collapsedRows: {}, // Record<TRowId, TCollapsedRow> -- Hash of collapsed row
    },
  },

  compareTest: function () {
    return 'test';
  },

  number_sorter: function (a, b) {
    if (a.amount < b.amount) {
      // Reversed because want ascending order
      return -1;
    }
    if (a.amount > b.amount) {
      return 1;
    }
    return 0;
  },

  shiftRow: function (event, row, row_id) {
    compareLogic.disableRowClick();
    // Add row from source to target array
    event.preventDefault();
    row.parentElement.parentElement.classList.add('shift-right');
    var obj = compareLogic.sharedData.source_data.find((item) => item.row_id == row_id);
    compareLogic.sharedData.target_data.push(obj);
    compareLogic.build_table('target-table', compareLogic.sharedData.target_data, true);
    compareLogic.localData.comment += `* Added source exchange of ${obj.amount} ${obj.unit} ${obj.name} in ${obj.location}.\n`;
    row.parentElement.innerHTML = `<i class="fa-solid fa-check"></i>`;
  },

  /** getRowData -- Get row data
   * @param {<TRowKind>} rowKind
   * @param {<TRowId>} rowId
   * @return {<TDataRecord>}
   */
  getRowData: function (rowKind, rowId) {
    const { target_data, source_data } = compareLogic.sharedData;
    const data = rowKind === 'source' ? source_data : target_data;
    const found = data.find((item) => item.row_id === rowId);
    return found;
  },

  /** getCollapsedHandlerTooltipText -- Get collpased node tooltip text
   * @param {<TDataRecord>} data
   * @return {string}
   */
  getCollapsedHandlerTooltipText: function (data) {
    if (!data) {
      return 'Data is undefined';
    }
    const {
      // amount, // Eg: 7.135225509515751e-9
      amount_display, // Eg: '7.1e-09'
      // input_id, // Eg: 633
      location, // Eg: 'United States'
      name, // Eg: 'Clothing; at manufacturer'
      // row_id, // Eg: '0'
      unit, // Eg: ''
      // url, // Eg: '/process/633'
    } = data;
    const text = [
      ['Amount', amount_display], // Eg: '7.1e-09'
      ['Name', name], // Eg: 'Clothing; at manufacturer'
      ['Loation', location], // Eg: 'United States'
      ['Unit', unit], // Eg: ''
    ]
      .map(([text, value]) => {
        if (value) {
          return text + ': ' + value;
        }
      })
      .filter(Boolean)
      .join('\n');
    return 'COLLAPSED ROW\n' + text;
  },

  /** quoteHtmlAttr -- quote all invalid characters for html
   * @param {string} str
   * @param [{boolean}] preserveCR
   */
  quoteHtmlAttr: function (str, preserveCR) {
    preserveCR = preserveCR ? '&#13;' : '\n';
    return (
      String(str) // Forces the conversion to string
        .replace(/&/g, '&amp;') // This MUST be the 1st replacement
        .replace(/'/g, '&apos;') // The 4 other predefined entities, required
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // You may add other replacements here for HTML only (but it's not
        // necessary). Or for XML, only if the named entities are defined in its
        // DTD.
        .replace(/\r\n/g, preserveCR) // Must be before the next replacement
        .replace(/[\r\n]/g, preserveCR)
    );
  },

  buildCollapsedHandlerRow: function (rowKind, rowId, optionalData) {
    const { rowColumnsCount } = compareLogic.sharedData;
    const collapsedId = compareLogic.getCollapsedId(rowKind, rowId);
    const data = optionalData || compareLogic.getRowData(rowKind, rowId);
    const tooltipText = compareLogic.getCollapsedHandlerTooltipText(data);
    const quotedTooltipText = compareLogic.quoteHtmlAttr(tooltipText);
    // TODO: Use table data (from `compareLogic.sharedData.target_data` or `compareLogic.sharedData.source_data`) to generate tooltip text.
    const start = `<tr
      class="collapsed-handler"
      for-collapsed-id="${collapsedId}"
      title="${quotedTooltipText}"
      onClick="compareLogic.clickUncollapseRow(this)"
    >`;
    const content = `<td colspan="${rowColumnsCount}"><br/></td>`;
    const end = `</tr>`;
    return start + content + end;
  },

  build_row: function (data, is_target) {
    const { collapsed } = compareLogic.localData;
    const { collapsedRows } = collapsed;
    const rowId = data.row_id;
    const rowKind = is_target ? 'target' : 'source';
    const collapsedId = compareLogic.getCollapsedId(rowKind, rowId);
    // Detect if row is collapsed, then render correspound class (`collapsed`) and append handler node...
    const isCollapsed = !!collapsedRows[collapsedId];
    const collapsedRowHtml =
      isCollapsed && compareLogic.buildCollapsedHandlerRow(rowKind, rowId, data);
    // Create class name...
    const className = [isCollapsed && 'collapsed'].filter(Boolean).join(' ');
    const attrs = [['class', className], isCollapsed && ['collapsed-id', collapsedId]]
      .filter(Boolean)
      .map(([name, value]) => value && name + '="' + compareLogic.quoteHtmlAttr(value) + '"')
      .filter(Boolean)
      .join(' ');
    const start = `<tr
      ${attrs}
      row_id="${data.row_id}"
      onClick="compareLogic.clickRow(this)"
    >`;
    const end = `<td><a onClick="compareLogic.disableRowClick(this)" href="${data.url}">${data.name}</a></td><td>${data.location}</td><td>${data.unit}</td></tr>`;
    let content;
    if (is_target) {
      content = `
  <td row_id="${data.row_id}">
    <span id="row-trash-${data.row_id}" onClick="compareLogic.removeRow(this)"><a><i class="fa-solid fa-trash-can"></i></a></span>
    |
    <span onClick="compareLogic.expandRow(this)" input_id="${data.input_id}" amount="${data.amount}"><a><i class="fa-solid fa-diamond fa-spin"></i></a></span>
  </td>
  <td onClick="compareLogic.editNumber(this)" row_id="${data.row_id}"><a>${data.amount_display}</a></td>
    `;
    } else {
      content = `<td><a onClick="compareLogic.shiftRow(event, this, ${data.row_id})"><i class="fa-solid fa-arrow-right"></i></a></td><td>${data.amount_display}</td>`;
    }
    // TODO: Use trim and join with '\b'?
    return [start, content, end, collapsedRowHtml].filter(Boolean).join('');
  },

  build_table: function (table_id, data, is_target) {
    data.sort(compareLogic.number_sorter);
    let rows = '';
    for (const [index, obj] of data.entries()) {
      obj['row_id'] = `${index}`;
      rows += compareLogic.build_row(obj, is_target);
    }
    var header = `
      <thead>
        <tr>
          <th>Action</th>
          <th>Amount</th>
          <th>Name</th>
          <th>Location</th>
          <th>Unit</th>
        </tr>
      </thead>
    `;
    const content = `
      <tbody>
        ${rows}
      </tbody>
    `;
    document.getElementById(table_id).innerHTML = header + content;
  },

  createOneToOneProxyFunc: function (event) {
    event.preventDefault();

    var submission_data = {
      exchanges: [{ input_id: compareLogic.sharedData.target_id, amount: 1.0 }],
      source: compareLogic.sharedData.source_id,
      comment: 'One-to-one proxy',
      name:
        'Proxy for ' +
        compareLogic.sharedData.target_name
          .replace('Market group for ', '')
          .replace('market group for ', '')
          .replace('Market for ', '')
          .replace('market for ', '')
          .trim(),
    };
    var url = '/create-proxy/';
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

  createProxyFunc: function (event) {
    event.preventDefault();
    var span = document.getElementById('modal-content-wrapper');
    var name =
      'Proxy for ' +
      compareLogic.sharedData.target_name
        .replace('Market group for ', '')
        .replace('market group for ', '')
        .replace('Market for ', '')
        .replace('market for ', '')
        .trim();
    var text = `
      <form>
        <label for="proxy-name">Proxy name</label>
        <input class="u-full-width" type="text" id="proxy-name" name="proxy-name" value="${name}">
        <label for="proxy-comment">Comment</label>
        <textarea class="u-full-width" id="proxy-comment" name="proxy-comment">${compareLogic.localData.comment}</textarea>
        <p><button class="button-primary" id="create-proxy-submit-button">Create Proxy Process</button> | Unit: ${compareLogic.sharedData.source_node_unit} | Location: ${compareLogic.sharedData.source_node_location}</p>
        <table>
          <tr>
            <th>Name</th>
            <th>Amount</th>
            <th>Comment</th>
          </tr>
    `;

    compareLogic.sharedData.target_data.forEach(function (item, _index) {
      text += `
          <tr input_id=${item.input_id}>
            <td>${item.name}</td>
            <td>${item.amount_display}</td>
            <td><textarea type="text" id="proxy-name-${item.input_id}" name="proxy-name-${item.input_id}"></textarea></td>
          </tr>
      `;
    });

    text += `
        </table>
      </form>
    `;
    span.innerHTML = text;
    compareLogic.sharedData.modal.style.display = 'block';

    var submit = document.getElementById('create-proxy-submit-button');
    submit.addEventListener('click', async (e) => {
      e.preventDefault();
      var submission_data = {
        exchanges: compareLogic.sharedData.target_data,
        source: compareLogic.sharedData.source_id,
        comment: document.getElementById('proxy-comment').value,
        name: document.getElementById('proxy-name').value,
      };
      var url = '/create-proxy/';
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

  replaceWithTarget: function (elem) {
    compareLogic.disableRowClick();
    compareLogic.sharedData.target_data.push(compareLogic.sharedData.target_node);
    compareLogic.sharedData.target_data.splice(0, compareLogic.sharedData.target_data.length - 1);
    compareLogic.localData.comment += `* Collapsed input exchanges to target node\n`;
    compareLogic.build_table('target-table', compareLogic.sharedData.target_data, true);
    elem.innerHTML = '';
  },

  removeRow: function (element) {
    compareLogic.disableRowClick();
    var row_id = element.parentElement.getAttribute('row_id');

    function removeValue(obj, index, arr) {
      if (obj.row_id == row_id) {
        compareLogic.localData.comment += `* Removed exchange of ${obj.amount} ${obj.unit} ${obj.name} from ${obj.location}.\n`;
        arr.splice(index, 1);
        return true;
      }
      return false;
    }
    compareLogic.sharedData.target_data.filter(removeValue);
    compareLogic.build_table('target-table', compareLogic.sharedData.target_data, true);
  },

  expandRow: function (element) {
    compareLogic.disableRowClick();
    var url =
      '/expand/' + element.getAttribute('input_id') + '/' + element.getAttribute('amount') + '/';
    var t = compareLogic.sharedData.target_data.find(
      (item) => item.input_id == element.getAttribute('input_id'),
    );
    compareLogic.localData.comment += `* Expanded process inputs of ${t.amount} ${t.unit} from ${t.name} in ${t.location}.\n`;
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        data.forEach(function (item, _index) {
          compareLogic.sharedData.target_data.push(item);
        });
        compareLogic.sharedData.target_data.sort(compareLogic.number_sorter);
        compareLogic.removeRow(element);
      });
  },

  /** clearRowClickHandler - Clear row click disbale timer handler.
   */
  clearRowClickHandler: function () {
    const { rowClick } = compareLogic.localData;
    if (rowClick.releaseHandler) {
      clearTimeout(rowClick.releaseHandler);
      rowClick.releaseHandler = undefined;
    }
  },

  /** releaseRowClick - Enable processing of `clickRow`
   */
  releaseRowClick: function () {
    const { rowClick } = compareLogic.localData;
    rowClick.disabled = false;
    compareLogic.clearRowClickHandler();
  },

  /** disableRowClick - Disable processing of `clickRow` handlers for some time (allow to process clicks on inner elements)
   */
  disableRowClick: function () {
    const { rowClick } = compareLogic.localData;
    compareLogic.clearRowClickHandler();
    rowClick.disabled = true;
    setTimeout(compareLogic.releaseRowClick, rowClick.timeout);
  },

  /** getCollapsedId -- Get collapsed id (`{rowKind}-{rowId}`)
   * @param {<TRowKind>} rowKind
   * @param {<TRowId>} rowId
   * @return {string}
   */
  getCollapsedId(rowKind, rowId) {
    return [rowKind, rowId].join('-');
  },

  /** htmlToElement -- Create dom node instance from html string
   * @param {string} HTML representing a single element
   * @return {HTMLElement}
   */
  htmlToElement: function (html) {
    const template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
  },

  /** collapseRowByRecord -- Collapse particular row record
   * @param {<TCollapsedRow>} collapsedRowRecord
   */
  collapseRowByRecord: function (collapsedRowRecord) {
    const { collapsed } = compareLogic.localData;
    const { collapsedRows } = collapsed;
    // TODO: For paginated tables -- don't use saved elements (they would by dynamic)!
    // See ` uncollapseRowByRecord` for example.
    const { rowKind, rowId, rowEl } = collapsedRowRecord;
    const collapsedId = compareLogic.getCollapsedId(rowKind, rowId);
    // Add styles...
    rowEl.classList.add('collapsed');
    // Save id in the dom node...
    rowEl.setAttribute('collapsed-id', collapsedId);
    // Save record...
    collapsedRows[collapsedId] = collapsedRowRecord;
    // Add interactive elements and other stuff (to uncollapse it later)...
    // Create html representation and dom node to append...
    const handlerRowHtml = compareLogic.buildCollapsedHandlerRow(rowKind, rowId);
    const handlerRowEl = compareLogic.htmlToElement(handlerRowHtml);
    // Find parent node...
    const parentNode = rowEl.parentNode;
    // Add handler before current row...
    parentNode.insertBefore(handlerRowEl, rowEl);
  },

  /** uncollapseRowByRecord -- Collapse particular row record
   * @param {<TCollapsedRow>} collapsedRowRecord
   */
  uncollapseRowByRecord: function (collapsedRowRecord) {
    const { collapsed } = compareLogic.localData;
    const { collapsedRows } = collapsed;
    const { rowKind, rowId } = collapsedRowRecord;
    const collapsedId = compareLogic.getCollapsedId(rowKind, rowId);
    const tableId = rowKind + '-table';
    const tableNode = document.getElementById(tableId);
    const handlerEl = tableNode.querySelector('[for-collapsed-id="' + collapsedId + '"]');
    const rowEl = tableNode.querySelector('[collapsed-id="' + collapsedId + '"]');
    // Remove collapsed record data...
    collapsedRows[collapsedRows] = undefined;
    if (handlerEl) {
      // Remove collapsed handler from dom (if exist in dom)...
      handlerEl.remove();
    }
    // Restore row element state (id exist in dom)...
    if (rowEl) {
      rowEl.classList.remove('collapsed');
      rowEl.removeAttribute('collapsed-id');
    }
  },

  /** makeRowsCollapsed
   * @param {<TSelectedRow>} selectedFirst
   * @param {<TSelectedRow>} selectedSecond
   */
  makeRowsCollapsed: function (selectedFirst, selectedSecond) {
    // TODO: To check data validity (both records are defined and well-formed)?
    // Remove selected status...
    compareLogic.unselectRow(selectedFirst.rowEl);
    compareLogic.unselectRow(selectedSecond.rowEl);
    // Collapse the rows...
    const collapsedFirst = { ...selectedFirst, pairId: selectedSecond.rowId };
    const collapsedSecond = { ...selectedSecond, pairId: selectedFirst.rowId };
    compareLogic.collapseRowByRecord(collapsedFirst);
    compareLogic.collapseRowByRecord(collapsedSecond);
  },

  /** getRowKind -- Get row kind (source or target)
   * @param {<TRowEl>} rowEl
   * @return {<TRowKind>} (<'source' | 'target'>)
   */
  getRowKind(rowEl) {
    // Find main table (source or target one)
    const table = rowEl.closest('table');
    const tableId = table.getAttribute('id');
    const isSource = tableId === 'source-table';
    // Row kind (source or target)...
    return isSource ? 'source' : 'target';
  },

  /** getRowKind -- Get row id
   * @param {<TRowEl>} rowEl
   * @return {<TRowId>}
   */
  getRowId(rowEl) {
    return rowEl.getAttribute('row_id');
  },

  /** selectRow -- Make row selected
   * @param {<TRowEl>} rowEl
   */
  selectRow(rowEl) {
    const { collapsed } = compareLogic.localData;
    const rowId = compareLogic.getRowId(rowEl);
    const rowKind = compareLogic.getRowKind(rowEl);
    // Save record...
    collapsed.selectedFirst = { rowKind, rowEl, rowId };
    // Add styles...
    rowEl.classList.add('selected');
  },

  /** unselectRow -- Make row selected
   * @param {<TRowEl>} rowEl
   */
  unselectRow(rowEl) {
    const { collapsed } = compareLogic.localData;
    // Clear styles...
    rowEl.classList.remove('selected');
    // Reset saved selected record (if it's the same)...
    const { selectedFirst } = collapsed;
    if (selectedFirst && selectedFirst.rowEl === rowEl) {
      collapsed.selectedFirst = undefined;
    }
  },

  /** clickRow
   * @param {<TRowEl>} rowEl
   */
  clickRow: function (rowEl) {
    const { rowClick, collapsed } = compareLogic.localData;
    if (rowClick.disabled) {
      // Do nothing if disabled
      return;
    }
    if (rowEl.classList.contains('collapsed')) {
      // Do nothing if row is already collapsed
      return;
    }
    const rowId = compareLogic.getRowId(rowEl);
    const rowKind = compareLogic.getRowKind(rowEl);
    const { selectedFirst } = collapsed;
    if (!selectedFirst) {
      // Nothing selected -- select as first element...
      compareLogic.selectRow(rowEl);
    } else if (selectedFirst.rowEl === rowEl) {
      // Already selected and clicked again -- deselect...
      compareLogic.unselectRow(rowEl);
    } else if (selectedFirst.rowKind === rowKind) {
      // Clicked another node in the same table -- deselect old and select new...
      compareLogic.unselectRow(selectedFirst.rowEl);
      compareLogic.selectRow(rowEl);
    } else {
      // Selected second element -- make both nodes collapsed...
      const selectedSecond = { rowKind, rowEl, rowId };
      compareLogic.makeRowsCollapsed(selectedFirst, selectedSecond);
    }
  },

  /** clickUncollapseRow -- Uncollapse both rows for this clicked collpase handler
   * @param {<HTMLTableRowElement>} firstHandlerEl
   */
  clickUncollapseRow: function (firstHandlerEl) {
    const { collapsed } = compareLogic.localData;
    const { collapsedRows } = collapsed;
    // Get first collpased record by id...
    const firstId = firstHandlerEl.getAttribute('for-collapsed-id');
    const collapsedFirst = collapsedRows[firstId];
    if (!collapsedFirst) {
      throw new Error('Cannot find first collapsed element by collapsed-id: ' + firstId);
    }
    // Get seconds collapsed record (compose id from first `pairId`)...
    const { rowKind, pairId } = collapsedFirst;
    const secondRowKind = rowKind === 'source' ? 'target' : 'source';
    const secondId = compareLogic.getCollapsedId(secondRowKind, pairId);
    const collapsedSecond = collapsedRows[secondId];
    if (!collapsedSecond) {
      throw new Error('Cannot find second collapsed element by collapsed-id: ' + secondId);
    }
    const rootNode = firstHandlerEl.closest('.compare-tables');
    if (!rootNode) {
      throw new Error('Cannot find root dom node (`.compare-tables`)');
    }
    // Uncollapse found rows...
    compareLogic.uncollapseRowByRecord(collapsedFirst);
    compareLogic.uncollapseRowByRecord(collapsedSecond);
  },

  replaceAmountRow: function (elem, target_id) {
    compareLogic.disableRowClick();
    var s = compareLogic.sharedData.source_data.find(
      (item) => item.row_id == elem.getAttribute('source_id'),
    );
    var t = compareLogic.sharedData.target_data.find((item) => item.row_id == target_id);
    compareLogic.localData.comment += `* Used source database amount ${s.amount} ${s.unit} from ${s.name} in ${s.location} instead of ${t.amount} ${t.unit} from ${t.name} in ${t.location}.\n`;
    document.getElementById('number-current-amount').innerText = elem.getAttribute('amount');
  },

  rescaleAmount: function (target_id) {
    compareLogic.disableRowClick();
    var t = compareLogic.sharedData.target_data.find((item) => item.row_id == target_id);
    const scale = Number(document.getElementById('rescale_number').value);
    const node = document.getElementById('number-current-amount');
    if (scale != 1) {
      compareLogic.localData.comment += `* Rescaled amount ${t.amount} ${t.unit} from ${t.name} in ${t.location} by ${scale}.\n`;
    }
    node.innerText = Number(node.innerText) * scale;
  },

  setNewNumber: function (target_id) {
    compareLogic.disableRowClick();
    var t = compareLogic.sharedData.target_data.find((item) => item.row_id == target_id);
    const new_value = document.getElementById('new_number').value;
    compareLogic.localData.comment += `* Set manual exchange value of ${new_value} instead of ${t.amount} ${t.unit} for ${t.name} in ${t.location}.\n`;
    document.getElementById('number-current-amount').innerText = new_value;
  },

  setNumber: function (elem) {
    compareLogic.disableRowClick();
    const row_id = elem.getAttribute('row_id');
    const current = Number(document.getElementById('number-current-amount').innerText);
    compareLogic.sharedData.target_data.forEach(function (item, _index) {
      if (item.row_id == row_id) {
        item.amount = current;
        item.amount_display = current.toExponential();
      }
    });
    compareLogic.sharedData.modal.style.display = 'none';
    compareLogic.build_table('target-table', compareLogic.sharedData.target_data, true);
  },

  editNumber: function (td) {
    compareLogic.disableRowClick();
    var row = compareLogic.sharedData.target_data.find(
      (item) => item.row_id == td.getAttribute('row_id'),
    );
    var span = document.getElementById('modal-content-wrapper');

    var a = `
      <h3>${row.name} | ${row.location} | ${row.unit}</h3>
      <div class="five columns">
        <p>Click on a row to take that value</p>
        <table>
          <tr>
            <th>Amount</th>
            <th>Name</th>
            <th>Unit</th>
          </tr>
    `;
    compareLogic.sharedData.source_data.forEach(function (item, _index) {
      a += `
        <tr amount="${item.amount}" source_id="${item.row_id}" onClick="compareLogic.replaceAmountRow(this, ${row.row_id})">
          <td>${item.amount_display}</td>
          <td>${item.name}</td>
          <td>${item.unit}</td>
        </tr>
      `;
    });

    const b = `
        </table>
      </div>
      <div class="five columns">
        <h4>Original amount: ${row.amount}</h4>
        <h4>Current amount: <span id="number-current-amount">${row.amount}</span></h4>
        <button class="button-primary" id="close-number-editor" row_id="${row.row_id}" onClick="compareLogic.setNumber(this)">Set and close</button>
        <form>
          <div>
            <label>Enter new amount</label>
            <input type="number" id="new_number" value="${row.amount}">
            <button onClick="compareLogic.setNewNumber(${row.row_id})" id="new-number-button">Set</button>
          </div>
          <hr />
          <div>
            <label>Rescale current amount</label>
            <input type="number" id="rescale_number" value="1.0">
            <button onClick="compareLogic.rescaleAmount(${row.row_id})" id="rescale-button">Rescale</button>
          </div>
        </form>
      </div>
    `;

    span.innerHTML = a + b;
    document.getElementById('rescale-button').addEventListener('click', compareLogic.stop, false);
    document
      .getElementById('new-number-button')
      .addEventListener('click', compareLogic.stop, false);
    document
      .getElementById('close-number-editor')
      .addEventListener('click', compareLogic.stop, false);
    compareLogic.sharedData.modal.style.display = 'block';
  },

  stop: function (event) {
    event.preventDefault();
  },

  hideModal: function () {
    compareLogic.sharedData.modal.style.display = 'none';
  },

  /** initCompare -- Initialize feature
   */
  initCompare: function (sharedData) {
    // Save public data...
    this.sharedData = sharedData;

    // Create tables...
    compareLogic.build_table('source-table', compareLogic.sharedData.source_data, false);
    compareLogic.build_table('target-table', compareLogic.sharedData.target_data, true);

    // Button handlers...
    document
      .getElementById('save-mapping-button')
      .addEventListener('click', compareLogic.createProxyFunc, false);
    document
      .getElementById('one-to-one')
      .addEventListener('click', compareLogic.createOneToOneProxyFunc, false);

    // Get modal node...
    compareLogic.sharedData.modal = document.getElementById('number-editor');

    // Link close modal button handler (TODO: To use more specific class?)...
    const closer = document.getElementsByClassName('close')[0];
    if (closer) {
      closer.onclick = compareLogic.hideModal;
    }
  },
};
