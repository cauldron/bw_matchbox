// @ts-check

// Import types only...
/* eslint-disable no-unused-vars */
import { ScoresListRender } from './ScoresListRender.js';
import { ScoresListNodes } from './ScoresListNodes.js';
import { ScoresListStates } from './ScoresListStates.js';
import { ScoresListApi } from './ScoresListApi.js';
/* eslint-enable no-unused-vars */

import * as CommonHelpers from '../../common/CommonHelpers.js';
import { InitChunks } from '../../common/InitChunks.js';
import { commonNotify } from '../../common/CommonNotify.js';

const cssStyleUrls = [
  // Styles urls...
  '/assets/css/scores-list.css',
];

/** List of initilization steps.
 * @type {string[]}
 */
const initChunksList = [
  'component',
  'cssStyle', // Loaded css module
  'events', // Inited events
  'dom', // Created required dom elements
  'initSortNodesFromDom',
];

export class ScoresListInit {
  /** Initializer
   * @type {InitChunks}
   */
  initChunks = undefined; // new InitChunks(initChunksList, 'ScoresList');

  /** @type {TSharedHandlers} */
  handlers = {};

  /** @type {ScoresListRender} */
  scoresListRender;
  /** @type {ScoresListNodes} */
  scoresListNodes;
  /** @type {ScoresListStates} */
  scoresListStates;
  /** @type {ScoresListApi} */
  scoresListApi;

  /**
   * @param {object} params
   * @param {TSharedHandlers} params.handlers
   * @param {string} [params.parentId]
   * @param {ScoresListRender} params.scoresListRender
   * @param {ScoresListNodes} params.scoresListNodes
   * @param {ScoresListStates} params.scoresListStates
   * @param {ScoresListApi} params.scoresListApi
   */
  constructor({
    // prettier-ignore
    handlers,
    parentId,
    scoresListRender,
    scoresListNodes,
    scoresListStates,
    scoresListApi,
  }) {
    this.handlers = handlers;
    const thisId = [parentId, 'Init'].filter(Boolean).join('_');
    this.initChunks = new InitChunks(initChunksList, thisId);
    // Set parameters for future initalization (see `initComponent`)
    this.scoresListRender = scoresListRender;
    this.scoresListNodes = scoresListNodes;
    this.scoresListStates = scoresListStates;
    this.scoresListApi = scoresListApi;
  }

  /** Ensure the modal has initiazlized
   * @return {Promise}
   */
  ensureInit() {
    if (!this.initChunks.isWaitingOrInited()) {
      this.doInit();
    }
    return this.initChunks.getInitPromise();
  }

  /** @return TEvents */
  events() {
    return this.initChunks.events;
  }

  /** Initialize the heaviest things (loading external css styles)
   */
  preInit() {
    // return this.initCssStyle();
  }

  initComponent() {
    if (!this.initChunks.isChunkStarted('component')) {
      this.initChunks.startChunk('component');

      this.initDomNodeActions();

      // Finish initialization stage...
      this.initChunks.finishChunk('component');
    }
  }

  async initCssStyle() {
    if (!this.initChunks.isChunkStarted('cssStyle')) {
      this.initChunks.startChunk('cssStyle');
      try {
        const promises = cssStyleUrls.map((url) => CommonHelpers.addCssStyle(url));
        await Promise.all(promises);
      } catch (error) {
        /** @param {Error} error */
        // eslint-disable-next-line no-console
        console.error('[ScoresListInit:initCssStyle]', error);
        // eslint-disable-next-line no-debugger
        debugger;
        commonNotify.showError(error);
      }
      // Wait animation frame to finish updating css styles...
      const finishCssStyleChunk = this.initChunks.finishChunk.bind(this.initChunks, 'cssStyle');
      window.requestAnimationFrame(finishCssStyleChunk);
    }
  }

  getDomNodeContent() {
    return `
      <div id="scores-list-tableau" class="scores-list-tableau">
        <div id="scores-list-title" class="scores-list-title">Scores</div>
        <div id="scores-list-error" class="error"><!-- Error text placeholder --></div>
        <div id="loader-splash" class="loader-splash full-cover bg-white"><div class="loader-spinner"></div></div>
      </div>
      <div id="scores-list-empty" class="scores-list-empty">No score items</div>
      <table id="scores-list-table" class="fixed-table" width="100%">
        <thead>
          <tr>
            <th class="cell-category"><div>Category</div></th>
            <th class="cell-original"><div>Original</div></th>
            <th class="cell-ratio"><div>Ratio</div></th>
            <th class="cell-relinked"><div>Relinked</div></th>
            <th class="cell-unit"><div>Unit</div></th>
          </tr>
        </thead>
        <tbody id="scores-list">
          <!-- List placeholder -->
        </tbody>
      </table>
    `;
  }

  initDomNodeActions() {
    const rootNode = this.scoresListNodes.getRootNode();
    const { handlers } = this;
    const { handleTitleActionClick } = handlers;
    const actionElems = rootNode.querySelectorAll('.scores-list-actions a');
    actionElems.forEach((elem) => {
      elem.addEventListener('click', handleTitleActionClick);
    });
  }

  initDomNode() {
    if (!this.initChunks.isChunkStarted('dom')) {
      this.initChunks.startChunk('dom');
      const scoresContainerNode = this.scoresListNodes.getScoresContainerNode();
      // Set dafault classes...
      scoresContainerNode.classList.toggle('loading', true);
      scoresContainerNode.classList.toggle('empty', true);
      // Create content...
      const html = this.getDomNodeContent();
      scoresContainerNode.innerHTML = html;
      // Finish nitialization stage...
      this.initChunks.finishChunk('dom');
    }
  }

  initEvents() {
    if (!this.initChunks.isChunkStarted('events')) {
      // NOTE: Can't work without initialized dom!
      this.initDomNode();
      this.initChunks.startChunk('events');
      this.initChunks.finishChunk('events');
    }
  }

  initSortNodesFromDom() {
    if (!this.initChunks.isChunkStarted('initSortNodesFromDom')) {
      this.initChunks.startChunk('initSortNodesFromDom');

      const rootNode = this.scoresListNodes.getRootNode();

      // Init sort mode...
      const sortModeNode = /** @type {HTMLSelectElement} */ (
        rootNode.querySelector('#scoresListSortMode')
      );
      this.scoresListApi.setSortMode(sortModeNode);

      // Init reversed sort mode...
      const sortReversedNode = /** @type {HTMLInputElement} */ (
        rootNode.querySelector('#scoresListSortReversed')
      );
      this.scoresListApi.setSortReversed(sortReversedNode);

      // TODO: Check and throw errors if nodes hasn't found?

      // Finish initialization stage...
      this.initChunks.finishChunk('initSortNodesFromDom');
    }
  }

  /** Initialize module.
   */
  doInit() {
    if (!this.initChunks.isWaitingOrInited()) {
      this.initChunks.start();
      this.initCssStyle()
        .then(() => {
          // Create all dom nodes...
          this.initDomNode();
          // Init events...
          this.initEvents();
          // Create all dom nodes...
          this.initComponent();
          // initSortNodesFromDom
          this.initSortNodesFromDom();
        })
        // TODO: Catch error with initFailed?
        .catch((error) => {
          this.initChunks.initFailed(error);
        });
      // NOTE: Initialization should be finished on all init chanks finish, in `initChunks.initFinished`.
    }
  }
}
