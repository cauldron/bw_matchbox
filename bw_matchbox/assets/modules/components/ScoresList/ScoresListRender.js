// @ts-check

import * as CommonHelpers from '../../common/CommonHelpers.js';

import { formatNumberToString } from './ScoresListHelpers.js';

// Import types only...
/* eslint-disable no-unused-vars */
import { ScoresListNodes } from './ScoresListNodes.js';
import { ScoresListData } from './ScoresListData.js';
/* eslint-enable no-unused-vars */

export class ScoresListRender {
  /** @type {ScoresListData} */
  scoresListData;
  /** @type {ScoresListNodes} */
  scoresListNodes;

  /**
   * @param {object} params
   * @param {ScoresListData} params.scoresListData
   * @param {ScoresListNodes} params.scoresListNodes
   */
  constructor(params) {
    const {
      // prettier-ignore
      scoresListData,
      scoresListNodes,
    } = params;
    this.scoresListData = scoresListData;
    this.scoresListNodes = scoresListNodes;
  }

  /** renderScore
   * @param {TScoresDataItem} scoreItem
   * @return {string} - HTML content
   */
  renderScore(scoreItem) {
    const {
      category, // 'global warming potential (GWP100)'
      original, // 0.5596522857406839
      ratio, // 0.29588779682710437
      relinked, // 1.891434157616526
      unit, // 'UBP'
    } = scoreItem;
    const originalStr = formatNumberToString(original);
    const ratioStr = formatNumberToString(ratio);
    const relinkedStr = formatNumberToString(relinked);
    const content = `
      <tr>
        <td class="cell-category"><div>${category}</div></td>
        <td class="cell-original"><div>${originalStr}</div></td>
        <td class="cell-ratio"><div>${ratioStr}</div></td>
        <td class="cell-relinked"><div>${relinkedStr}</div></td>
        <td class="cell-unit"><div>${unit}</div></td>
      </tr>
    `;
    return content;
  }

  /**
   * @param {Error} error
   */
  renderError(error) {
    const isError = !!error;
    const scoresContainerNode = this.scoresListNodes.getScoresContainerNode();
    scoresContainerNode.classList.toggle('has-error', isError);
    const errorNode = this.scoresListNodes.getErrorNode();
    const errorText = error ? error.message || String(error) : '';
    // DEBUG: Show error in console
    if (errorText) {
      // eslint-disable-next-line no-console
      console.error('[ScoresListRender:renderError]: got the error', {
        error,
        errorText,
      });
      // eslint-disable-next-line no-debugger
      debugger;
    }
    // Update (or clear) error block content...
    errorNode.innerHTML = errorText;
  }

  /** renderData -- Render all score data (or append data)
   * @param {object} opts
   * @param {boolean} [opts.append] - Append data to the end of the table (default behavior: replace)
   */
  renderData(opts = {}) {
    const { scoresList } = this.scoresListData;
    const scoresListNode = this.scoresListNodes.getScoresListNode();
    const content = scoresList.map(this.renderScore.bind(this)).join('\n');
    if (!opts.append) {
      // Replace data...
      scoresListNode.innerHTML = content; // Insert content just as raw html
    } else {
      // Append new data (will be used for incremental update)...
      const contentNodes = CommonHelpers.htmlToElements(content);
      scoresListNode.append.apply(scoresListNode, contentNodes);
    }
  }
}
