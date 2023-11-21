// @ts-check

import { RecentProcessesListNodes } from './RecentProcessesListNodes.js';
import { RecentProcessesListData } from './RecentProcessesListData.js';
import { RecentProcessesListInit } from './RecentProcessesListInit.js';
import { RecentProcessesListRender } from './RecentProcessesListRender.js';
import { RecentProcessesListApi } from './RecentProcessesListApi.js';
import { RecentProcessesListLoader } from './RecentProcessesListLoader.js';
import { RecentProcessesListStates } from './RecentProcessesListStates.js';

/*-- @implements {TRecentProcessesList} */
export class RecentProcessesList {
  /** @type {RecentProcessesListInit} */
  recentProcessesListInit = undefined;

  /** Technical (debug) id
   * @type {string}
   */
  thisId = 'RecentProcessesList';

  /** @type {TSharedHandlers} */
  handlers = {};

  /* @type {RecentProcessesListRender} */
  recentProcessesListRender = new RecentProcessesListRender();

  /** @type {TEvents} */
  events = undefined;

  /** External API (alternate way, basic handlers are in `handlers` object (above)...
   * @type {RecentProcessesListApi}
   */
  api;

  /** @param {string} parentId */
  constructor(parentId) {
    if (parentId) {
      const thisId = [parentId, 'RecentProcessesList'].filter(Boolean).join('_');
      this.thisId = thisId;
    }
    const recentProcessesListApi = new RecentProcessesListApi({
      recentProcessesListData: RecentProcessesListData,
      recentProcessesListNodes: RecentProcessesListNodes,
      recentProcessesListRender: this.recentProcessesListRender,
      recentProcessesListLoader: RecentProcessesListLoader,
      recentProcessesListStates: RecentProcessesListStates,
    });
    this.api = recentProcessesListApi;
    const { handlers } = this;
    this.recentProcessesListInit = new RecentProcessesListInit({
      handlers,
      parentId: this.thisId,
      recentProcessesListRender: this.recentProcessesListRender,
      recentProcessesListNodes: RecentProcessesListNodes,
      recentProcessesListStates: RecentProcessesListStates,
    });
    this.events = this.recentProcessesListInit.events();
  }

  /** Ensure the modal has initiazlized
   * @return {Promise}
   */
  ensureInit() {
    return this.recentProcessesListInit.ensureInit();
  }

  /** Initialize the longest things (loading external css styles)
   */
  preInit() {
    return this.recentProcessesListInit.preInit();
  }

  /** Should be called before initalization
   * @param {TRecentProcessesListParams} params
   */
  setParams(params) {
    const {
      // Parameters..
      rootNode,
      noTableau,
      noLoader,
      noError,
      noActions,
    } = params;
    RecentProcessesListNodes.setRootNode(rootNode);
    rootNode.classList.toggle('noTableau', !!noTableau);
    rootNode.classList.toggle('noLoader', !!noLoader);
    rootNode.classList.toggle('noError', !!noError);
    rootNode.classList.toggle('noActions', !!noActions);
  }
}
