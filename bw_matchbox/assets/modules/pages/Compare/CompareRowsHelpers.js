// @ts-check

import * as CommonHelpers from '../../common/CommonHelpers.js';

import { CompareRowClick } from './CompareRowClick.js';

export const CompareRowsHelpers = {
  // Shared Data...
  sharedParams: undefined, // Initializing in `CompareCore.start` from `compare.html`

  // Data...
  rowColumnsCount: 5, // Number of columns in a table row (ATTENTION: It could be changed)...
  selectedFirst: undefined, // <undefined | TSelectedRow>
  collapsedRows: {}, // Record<TRowId, TCollapsedRow> -- Hash of collapsed row

  // Methods...

  getRootNode() {
    const rootNode = document.getElementById('compare-root');
    return rootNode;
  },

  updateCollapsedState() {
    const rootNode = this.getRootNode();
    const { collapsedRows } = this;
    const collapsedCount = Object.values(collapsedRows).filter(Boolean).length;
    const hasCollapsed = !!collapsedCount;
    rootNode.classList.toggle('has-collapsed', hasCollapsed);
  },

  expandAllCollapsedRows() {
    const { collapsedRows } = this;
    // Uncollapse all collapsed rows...
    Object.values(collapsedRows)
      .filter(Boolean)
      .forEach((collapsedItem) => {
        CompareRowsHelpers.uncollapseRowByRecord(collapsedItem, {
          omitUpdateCollapsedState: true,
        });
      });
    // Update collapsed state...
    this.updateCollapsedState();
  },

  /** getRowData -- Get row data
   * @param {TRowKind} rowKind
   * @param {TRowId} rowId
   * @return {TDataRecord}
   */
  getRowData(rowKind, rowId) {
    const { target_data, source_data } = CompareRowsHelpers.sharedParams;
    const data = rowKind === 'source' ? source_data : target_data;
    const found = data.find((item) => item.row_id === rowId);
    return found;
  },

  /** getRowId -- Get row id
   * @param {TRowEl} rowEl
   * @return {TRowId}
   */
  getRowId(rowEl) {
    return rowEl.getAttribute('row_id');
  },

  /** getRowKind -- Get row kind (source or target)
   * @param {TRowEl} rowEl
   * @return {TRowKind} (<'source' | 'target'>)
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
   * @param {TRowEl} rowEl
   */
  selectRow(rowEl) {
    const rowId = CompareRowsHelpers.getRowId(rowEl);
    const rowKind = CompareRowsHelpers.getRowKind(rowEl);
    // Save record...
    CompareRowsHelpers.selectedFirst = { rowKind, rowEl, rowId };
    // Add styles...
    rowEl.classList.add('selected');
  },

  /** unselectRow -- Make row selected
   * @param {TRowEl} rowEl
   */
  unselectRow(rowEl) {
    // Clear styles...
    rowEl.classList.remove('selected');
    // Reset saved selected record (if it's the same)...
    if (CompareRowsHelpers.selectedFirst && CompareRowsHelpers.selectedFirst.rowEl === rowEl) {
      CompareRowsHelpers.selectedFirst = undefined;
    }
    // TODO: Update `collapsed` field in original data?
  },

  /** getCollapsedHandlerTooltipText -- Get collpased node tooltip text
   * @param {TDataRecord} data
   * @return {string}
   */
  getCollapsedHandlerTooltipText(data) {
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
   * @param {TRowKind} rowKind
   * @param {TRowId} rowId
   * @return {string}
   */
  getCollapsedId(rowKind, rowId) {
    return [rowKind, rowId].join('-');
  },

  /** buildCollapsedHandlerRow -- Get html content of collapsed handler node.
   * @param {TRowKind} rowKind
   * @param {TRowId} rowId
   * @param {TDataRecord} [optionalData]
   * @return {string}
   */
  buildCollapsedHandlerRow(rowKind, rowId, optionalData) {
    const collapsedId = CompareRowsHelpers.getCollapsedId(rowKind, rowId);
    const data = optionalData || CompareRowsHelpers.getRowData(rowKind, rowId);
    const tooltipText = CompareRowsHelpers.getCollapsedHandlerTooltipText(data);
    const quotedTooltipText = CommonHelpers.quoteHtmlAttr(tooltipText);
    const start = `<tr
          class="collapsed-handler"
          for-collapsed-id="${collapsedId}"
          title="${quotedTooltipText}"
          onClick="CompareCore.clickUncollapseRowHandler(this)"
        >`;
    const content = `<td colspan="${CompareRowsHelpers.rowColumnsCount}"><br/></td>`;
    const end = `</tr>`;
    return start + content + end;
  },

  /** collapseRowByRecord -- Collapse particular row record
   * @param {TCollapsedRow} collapsedRowRecord
   */
  collapseRowByRecord(collapsedRowRecord) {
    // TODO: For paginated tables -- don't use saved elements (they would by dynamic)!
    // See `uncollapseRowByRecord` for example.
    const { rowKind, rowId, rowEl } = collapsedRowRecord;
    const collapsedId = CompareRowsHelpers.getCollapsedId(rowKind, rowId);
    // Add styles...
    rowEl.classList.add('collapsed');
    // Save id in the dom node...
    rowEl.setAttribute('collapsed-id', collapsedId);
    // Save record...
    CompareRowsHelpers.collapsedRows[collapsedId] = collapsedRowRecord;
    // Add interactive elements and other stuff (to uncollapse it later)...
    // Create html representation and dom node to append...
    const handlerRowHtml = CompareRowsHelpers.buildCollapsedHandlerRow(rowKind, rowId);
    const handlerRowEl = CommonHelpers.htmlToElement(handlerRowHtml);
    // Find parent node...
    const parentNode = rowEl.parentNode;
    // Add handler before current row...
    parentNode.insertBefore(handlerRowEl, rowEl);
    this.updateCollapsedState();
  },

  /** uncollapseRowByRecord -- Collapse particular row record
   * @param {TCollapsedRow} collapsedRowRecord
   * @param {object} [opts] - Options
   * @param {boolean} [opts.omitUpdateCollapsedState] - Do not call
   * `updateCollapsedState` function (will be called later, in case of a
   * bulk operation, for example).
   */
  uncollapseRowByRecord(collapsedRowRecord, opts = {}) {
    const { rowKind, rowId } = collapsedRowRecord;
    const collapsedId = CompareRowsHelpers.getCollapsedId(rowKind, rowId);
    const tableId = rowKind + '-table';
    const tableNode = document.getElementById(tableId);
    const handlerEl = tableNode.querySelector('[for-collapsed-id="' + collapsedId + '"]');
    const rowEl = tableNode.querySelector('[collapsed-id="' + collapsedId + '"]');
    // Remove collapsed record data...
    CompareRowsHelpers.collapsedRows[collapsedId] = false;
    if (handlerEl) {
      // Remove collapsed handler from dom (if exist in dom)...
      handlerEl.remove();
    }
    // Restore row element state (id exist in dom)...
    if (rowEl) {
      rowEl.classList.remove('collapsed');
      rowEl.removeAttribute('collapsed-id');
    }
    if (!opts.omitUpdateCollapsedState) {
      this.updateCollapsedState();
    }
  },

  /** makeRowsCollapsed
   * @param {TSelectedRow} selectedFirst
   * @param {TSelectedRow} selectedSecond
   */
  makeRowsCollapsed(selectedFirst, selectedSecond) {
    // TODO: To check data validity (both records are defined and well-formed)?
    // Remove selected status...
    CompareRowsHelpers.unselectRow(selectedFirst.rowEl);
    CompareRowsHelpers.unselectRow(selectedSecond.rowEl);
    // Collapse the rows...
    const collapsedFirst = { ...selectedFirst, pairId: selectedSecond.rowId };
    const collapsedSecond = { ...selectedSecond, pairId: selectedFirst.rowId };
    CompareRowsHelpers.collapseRowByRecord(collapsedFirst);
    CompareRowsHelpers.collapseRowByRecord(collapsedSecond);
  },

  /** clickRowHandler
   * @param {TRowEl} rowEl
   */
  clickRowHandler(rowEl) {
    if (CompareRowClick.disabled) {
      // Do nothing if disabled
      return;
    }
    if (rowEl.classList.contains('collapsed')) {
      // Do nothing if row is already collapsed
      return;
    }
    const rowId = CompareRowsHelpers.getRowId(rowEl);
    const rowKind = CompareRowsHelpers.getRowKind(rowEl);
    if (!CompareRowsHelpers.selectedFirst) {
      // Nothing selected -- select as first element...
      CompareRowsHelpers.selectRow(rowEl);
    } else if (CompareRowsHelpers.selectedFirst.rowEl === rowEl) {
      // Already selected and clicked again -- deselect...
      CompareRowsHelpers.unselectRow(rowEl);
    } else if (CompareRowsHelpers.selectedFirst.rowKind === rowKind) {
      // Clicked another node in the same table -- deselect old and select new...
      CompareRowsHelpers.unselectRow(CompareRowsHelpers.selectedFirst.rowEl);
      CompareRowsHelpers.selectRow(rowEl);
    } else {
      // Selected second element -- make both nodes collapsed...
      const selectedSecond = { rowKind, rowEl, rowId };
      CompareRowsHelpers.makeRowsCollapsed(CompareRowsHelpers.selectedFirst, selectedSecond);
    }
  },

  /** clickUncollapseRowHandler -- Uncollapse both rows for this clicked collpase handler
   * @param {HTMLTableRowElement} firstHandlerEl
   */
  clickUncollapseRowHandler(firstHandlerEl) {
    // Get first collpased record by id...
    const firstId = firstHandlerEl.getAttribute('for-collapsed-id');
    const collapsedFirst = CompareRowsHelpers.collapsedRows[firstId];
    if (!collapsedFirst) {
      throw new Error('Cannot find first collapsed element by collapsed-id: ' + firstId);
    }
    // Get seconds collapsed record (compose id from first `pairId`)...
    const { rowKind, pairId } = collapsedFirst;
    const secondRowKind = rowKind === 'source' ? 'target' : 'source';
    const secondId = CompareRowsHelpers.getCollapsedId(secondRowKind, pairId);
    const collapsedSecond = CompareRowsHelpers.collapsedRows[secondId];
    if (!collapsedSecond) {
      throw new Error('Cannot find second collapsed element by collapsed-id: ' + secondId);
    }
    const rootNode = firstHandlerEl.closest('.compare-tables');
    if (!rootNode) {
      throw new Error('Cannot find root dom node (`.compare-tables`)');
    }
    // Uncollapse found rows...
    CompareRowsHelpers.uncollapseRowByRecord(collapsedFirst, {
      omitUpdateCollapsedState: true,
    });
    CompareRowsHelpers.uncollapseRowByRecord(collapsedSecond, {
      omitUpdateCollapsedState: true,
    });
    // Update collapsed state...
    this.updateCollapsedState();
  },
};
