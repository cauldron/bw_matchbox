// @ts-check

import { ScoresListNodes } from './ScoresListNodes.js';
import { ScoresListData } from './ScoresListData.js';
import { ScoresListInit } from './ScoresListInit.js';
import { ScoresListRender } from './ScoresListRender.js';
import { ScoresListApi } from './ScoresListApi.js';
import { ScoresListLoader } from './ScoresListLoader.js';
import { ScoresListStates } from './ScoresListStates.js';

/*-- @implements {TProcessId} */
export class ScoresList {
  /** @type {ScoresListInit} */
  scoresListInit = undefined;

  /** Technical (debug) id
   * @type {string}
   */
  thisId = 'ScoresList';

  /** @type {TSharedHandlers} */
  handlers = {};
  /** @type {TEvents} */
  events = undefined;

  /* @type {ScoresListNodes} */
  scoresListNodes;
  /* @type {ScoresListData} */
  scoresListData;
  /* @type {ScoresListRender} */
  scoresListRender;
  /* @type {ScoresListStates} */
  scoresListStates;
  /* @type {ScoresListApi} */
  scoresListApi;
  /* @type {ScoresListLoader} */
  scoresListLoader;

  /** External API (alternate way, basic handlers are in `handlers` object (above)...
   * @type {ScoresListApi}
   */
  api;

  /** @param {string} parentId */
  constructor(parentId) {
    if (parentId) {
      const thisId = [parentId, 'ScoresList'].filter(Boolean).join('_');
      this.thisId = thisId;
    }

    this.scoresListNodes = new ScoresListNodes();
    this.scoresListData = new ScoresListData();

    /* @type {ScoresListRender} */
    this.scoresListRender = new ScoresListRender({
      scoresListData: this.scoresListData,
      scoresListNodes: this.scoresListNodes,
    });

    this.scoresListStates = new ScoresListStates({
      scoresListData: this.scoresListData,
      scoresListNodes: this.scoresListNodes,
      scoresListRender: this.scoresListRender,
    });

    this.scoresListLoader = new ScoresListLoader({
      scoresListStates: this.scoresListStates,
    });

    const scoresListApi = new ScoresListApi({
      scoresListData: this.scoresListData,
      scoresListNodes: this.scoresListNodes,
      scoresListRender: this.scoresListRender,
      scoresListLoader: this.scoresListLoader,
      scoresListStates: this.scoresListStates,
    });
    this.scoresListApi = this.api = scoresListApi;
    const { handlers } = this;
    this.scoresListInit = new ScoresListInit({
      handlers,
      parentId: this.thisId,
      scoresListRender: this.scoresListRender,
      scoresListNodes: this.scoresListNodes,
      scoresListStates: this.scoresListStates,
      scoresListApi: this.scoresListApi,
    });
    this.scoresListData.events = this.events = this.scoresListInit.events();
    // TODO: Update sort params...
    // NOTE: Expose instance reference for ui elements callbacks
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.scoresListInstance = this;
    }
  }

  /** Ensure the modal has initiazlized
   * @return {Promise}
   */
  ensureInit() {
    return this.scoresListInit.ensureInit();
  }

  /** Initialize the longest things (loading external css styles)
   */
  preInit() {
    return this.scoresListInit.preInit();
  }

  /** Should be called before initalization
   * @param {TScoresListParams} params
   */
  setParams(params) {
    const {
      // Data...
      processId,
      // Parameters..
      rootNode,
      noTableau,
      noLoader,
      noError,
      noActions,
    } = params;
    this.scoresListData.processId = processId;
    this.scoresListNodes.setRootNode(rootNode);
    rootNode.classList.toggle('noTableau', !!noTableau);
    rootNode.classList.toggle('noLoader', !!noLoader);
    rootNode.classList.toggle('noError', !!noError);
    rootNode.classList.toggle('noActions', !!noActions);
  }
}
