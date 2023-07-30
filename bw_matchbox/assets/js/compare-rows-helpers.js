/* global commonHelpers, compareRowClick */

/* // Compare rows-related feature types (ts-like):
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

// global module variable
const compareRowsHelpers = {
  // Data...
  sharedData: undefined, // Initializing in `compareCore.initCompare` from `bw_matchbox/assets/templates/compare.html`
  rowColumnsCount: 5, // Number of columns in a table row...
  selectedFirst: undefined, // <undefined | TSelectedRow>
  collapsedRows: {}, // Record<TRowId, TCollapsedRow> -- Hash of collapsed row

  // Methods...

  /** getRowData -- Get row data
   * @param {<TRowKind>} rowKind
   * @param {<TRowId>} rowId
   * @return {<TDataRecord>}
   */
  getRowData: function (rowKind, rowId) {
    const { target_data, source_data } = compareRowsHelpers.sharedData;
    const data = rowKind === 'source' ? source_data : target_data;
    const found = data.find((item) => item.row_id === rowId);
    return found;
  },

  /** getRowId -- Get row id
   * @param {<TRowEl>} rowEl
   * @return {<TRowId>}
   */
  getRowId(rowEl) {
    return rowEl.getAttribute('row_id');
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

  /** selectRow -- Make row selected
   * @param {<TRowEl>} rowEl
   */
  selectRow(rowEl) {
    const rowId = compareRowsHelpers.getRowId(rowEl);
    const rowKind = compareRowsHelpers.getRowKind(rowEl);
    // Save record...
    compareRowsHelpers.selectedFirst = { rowKind, rowEl, rowId };
    // Add styles...
    rowEl.classList.add('selected');
  },

  /** unselectRow -- Make row selected
   * @param {<TRowEl>} rowEl
   */
  unselectRow(rowEl) {
    // Clear styles...
    rowEl.classList.remove('selected');
    // Reset saved selected record (if it's the same)...
    if (compareRowsHelpers.selectedFirst && compareRowsHelpers.selectedFirst.rowEl === rowEl) {
      compareRowsHelpers.selectedFirst = undefined;
    }
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
      ['Location', location], // Eg: 'United States'
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

  /** getCollapsedId -- Get collapsed id (`{rowKind}-{rowId}`)
   * @param {<TRowKind>} rowKind
   * @param {<TRowId>} rowId
   * @return {string}
   */
  getCollapsedId(rowKind, rowId) {
    return [rowKind, rowId].join('-');
  },

  /** buildCollapsedHandlerRow -- Get html content of collapsed handler node.
   * @param {<TRowKind>} rowKind
   * @param {<TRowId>} rowId
   * @param [{<TDataRecord>}] optionalData
   * @return {string}
   */
  buildCollapsedHandlerRow: function (rowKind, rowId, optionalData) {
    const collapsedId = compareRowsHelpers.getCollapsedId(rowKind, rowId);
    const data = optionalData || compareRowsHelpers.getRowData(rowKind, rowId);
    const tooltipText = compareRowsHelpers.getCollapsedHandlerTooltipText(data);
    const quotedTooltipText = commonHelpers.quoteHtmlAttr(tooltipText);
    const start = `<tr
      class="collapsed-handler"
      for-collapsed-id="${collapsedId}"
      title="${quotedTooltipText}"
      onClick="compareRowsHelpers.clickUncollapseRow(this)"
    >`;
    const content = `<td colspan="${compareRowsHelpers.rowColumnsCount}"><br/></td>`;
    const end = `</tr>`;
    return start + content + end;
  },

  /** collapseRowByRecord -- Collapse particular row record
   * @param {<TCollapsedRow>} collapsedRowRecord
   */
  collapseRowByRecord: function (collapsedRowRecord) {
    // TODO: For paginated tables -- don't use saved elements (they would by dynamic)!
    // See ` uncollapseRowByRecord` for example.
    const { rowKind, rowId, rowEl } = collapsedRowRecord;
    const collapsedId = compareRowsHelpers.getCollapsedId(rowKind, rowId);
    // Add styles...
    rowEl.classList.add('collapsed');
    // Save id in the dom node...
    rowEl.setAttribute('collapsed-id', collapsedId);
    // Save record...
    compareRowsHelpers.collapsedRows[collapsedId] = collapsedRowRecord;
    // Add interactive elements and other stuff (to uncollapse it later)...
    // Create html representation and dom node to append...
    const handlerRowHtml = compareRowsHelpers.buildCollapsedHandlerRow(rowKind, rowId);
    const handlerRowEl = commonHelpers.htmlToElement(handlerRowHtml);
    // Find parent node...
    const parentNode = rowEl.parentNode;
    // Add handler before current row...
    parentNode.insertBefore(handlerRowEl, rowEl);
  },

  /** uncollapseRowByRecord -- Collapse particular row record
   * @param {<TCollapsedRow>} collapsedRowRecord
   */
  uncollapseRowByRecord: function (collapsedRowRecord) {
    const { rowKind, rowId } = collapsedRowRecord;
    const collapsedId = compareRowsHelpers.getCollapsedId(rowKind, rowId);
    const tableId = rowKind + '-table';
    const tableNode = document.getElementById(tableId);
    const handlerEl = tableNode.querySelector('[for-collapsed-id="' + collapsedId + '"]');
    const rowEl = tableNode.querySelector('[collapsed-id="' + collapsedId + '"]');
    // Remove collapsed record data...
    compareRowsHelpers.collapsedRows[collapsedId] = undefined;
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
    compareRowsHelpers.unselectRow(selectedFirst.rowEl);
    compareRowsHelpers.unselectRow(selectedSecond.rowEl);
    // Collapse the rows...
    const collapsedFirst = { ...selectedFirst, pairId: selectedSecond.rowId };
    const collapsedSecond = { ...selectedSecond, pairId: selectedFirst.rowId };
    compareRowsHelpers.collapseRowByRecord(collapsedFirst);
    compareRowsHelpers.collapseRowByRecord(collapsedSecond);
  },

  /** clickRow
   * @param {<TRowEl>} rowEl
   */
  clickRow: function (rowEl) {
    if (compareRowClick.disabled) {
      // Do nothing if disabled
      return;
    }
    if (rowEl.classList.contains('collapsed')) {
      // Do nothing if row is already collapsed
      return;
    }
    const rowId = compareRowsHelpers.getRowId(rowEl);
    const rowKind = compareRowsHelpers.getRowKind(rowEl);
    if (!compareRowsHelpers.selectedFirst) {
      // Nothing selected -- select as first element...
      compareRowsHelpers.selectRow(rowEl);
    } else if (compareRowsHelpers.selectedFirst.rowEl === rowEl) {
      // Already selected and clicked again -- deselect...
      compareRowsHelpers.unselectRow(rowEl);
    } else if (compareRowsHelpers.selectedFirst.rowKind === rowKind) {
      // Clicked another node in the same table -- deselect old and select new...
      compareRowsHelpers.unselectRow(compareRowsHelpers.selectedFirst.rowEl);
      compareRowsHelpers.selectRow(rowEl);
    } else {
      // Selected second element -- make both nodes collapsed...
      const selectedSecond = { rowKind, rowEl, rowId };
      compareRowsHelpers.makeRowsCollapsed(compareRowsHelpers.selectedFirst, selectedSecond);
    }
  },

  /** clickUncollapseRow -- Uncollapse both rows for this clicked collpase handler
   * @param {<HTMLTableRowElement>} firstHandlerEl
   */
  clickUncollapseRow: function (firstHandlerEl) {
    // Get first collpased record by id...
    const firstId = firstHandlerEl.getAttribute('for-collapsed-id');
    const collapsedFirst = compareRowsHelpers.collapsedRows[firstId];
    if (!collapsedFirst) {
      throw new Error('Cannot find first collapsed element by collapsed-id: ' + firstId);
    }
    // Get seconds collapsed record (compose id from first `pairId`)...
    const { rowKind, pairId } = collapsedFirst;
    const secondRowKind = rowKind === 'source' ? 'target' : 'source';
    const secondId = compareRowsHelpers.getCollapsedId(secondRowKind, pairId);
    const collapsedSecond = compareRowsHelpers.collapsedRows[secondId];
    if (!collapsedSecond) {
      throw new Error('Cannot find second collapsed element by collapsed-id: ' + secondId);
    }
    const rootNode = firstHandlerEl.closest('.compare-tables');
    if (!rootNode) {
      throw new Error('Cannot find root dom node (`.compare-tables`)');
    }
    // Uncollapse found rows...
    compareRowsHelpers.uncollapseRowByRecord(collapsedFirst);
    compareRowsHelpers.uncollapseRowByRecord(collapsedSecond);
  },
};
