// @ts-check

import { getActualSortedRecentProcesses } from '../../common/RecentProcesses.js';

// Import types only...
/* eslint-disable no-unused-vars */
import { RecentProcessesListData } from './RecentProcessesListData.js';
// import { RecentProcessesListHandlers } from './RecentProcessesListHandlers.js';
import { RecentProcessesListNodes } from './RecentProcessesListNodes.js';
import { RecentProcessesListRender } from './RecentProcessesListRender.js';
/* eslint-enable no-unused-vars */

/* External API (alternate way, basic handlers are in `handlers` object (above)...
 * @implements {TRecentProcessesListApi}
 */
export class RecentProcessesListApi {
  /** @type {RecentProcessesListData} */
  recentProcessesListData;
  // [>* @type {RecentProcessesListHandlers} <]
  // recentProcessesListHandlers;
  /** @type {RecentProcessesListNodes} */
  recentProcessesListNodes;
  /** @type {RecentProcessesListRender} */
  recentProcessesListRender;

  /**
   * @param {object} params
   * @param {RecentProcessesListData} params.recentProcessesListData
   * --param {RecentProcessesListHandlers} params.recentProcessesListHandlers
   * @param {RecentProcessesListNodes} params.recentProcessesListNodes
   * @param {RecentProcessesListRender} params.recentProcessesListRender
   */
  constructor(params) {
    const {
      // prettier-ignore
      recentProcessesListData,
      // recentProcessesListHandlers,
      recentProcessesListNodes,
      recentProcessesListRender,
    } = params;
    this.recentProcessesListData = recentProcessesListData;
    // this.recentProcessesListHandlers = recentProcessesListHandlers;
    this.recentProcessesListNodes = recentProcessesListNodes;
    this.recentProcessesListRender = recentProcessesListRender;
  }

  getRecentProcesses() {
    return this.recentProcessesListData.recentProcesses;
  }

  loadData() {
    const rootNode = this.recentProcessesListNodes.getRootNode();
    rootNode.classList.toggle('loading', true);
    const recentProcesses = getActualSortedRecentProcesses();
    this.recentProcessesListData.recentProcesses = recentProcesses;
    // TODO: Extend data (with methods from `RecentProcessesListPrepare`), eg to add names to items
    // TODO: Invoke events to re-render content?
    this.recentProcessesListRender.renderData();
    // Set dafault classes...
    rootNode.classList.toggle('loading', false);
    rootNode.classList.toggle('empty', !recentProcesses.length);
    rootNode.classList.toggle('dataReady', true);
  }
}
