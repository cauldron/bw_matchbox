// @ts-check

// Import types only...
/* eslint-disable no-unused-vars */
import { RecentProcessesListRender } from './RecentProcessesListRender.js';
import { RecentProcessesListNodes } from './RecentProcessesListNodes.js';
import { RecentProcessesListStates } from './RecentProcessesListStates.js';
// import { RecentProcessesListHandlers } from './RecentProcessesListHandlers.js';
// import { RecentProcessesListPrepare } from './RecentProcessesListPrepare.js';
/* eslint-enable no-unused-vars */

import * as CommonHelpers from '../../common/CommonHelpers.js';
import { InitChunks } from '../../common/InitChunks.js';
import { commonNotify } from '../../common/CommonNotify.js';

const cssStyleUrls = [
  // Styles urls...
  '/assets/css/recent-processes.css',
  // '/assets/css/recent-processes-recent-processes-list.css',
];

/** List of initilization steps.
 * @type {string[]}
 */
const initChunksList = [
  'component',
  'cssStyle', // Loaded css module
  'events', // Inited events
  'dom', // Created required dom elements
];

export class RecentProcessesListInit {
  /** Initializer
   * @type {InitChunks}
   */
  initChunks = undefined; // new InitChunks(initChunksList, 'RecentProcessesList');

  /** @type {TSharedHandlers} */
  handlers = {};

  /** @type {RecentProcessesListRender} */
  recentProcessesListRender;
  /** @type {RecentProcessesListNodes} */
  recentProcessesListNodes;
  // [>* @type {RecentProcessesListHandlers} <]
  // recentProcessesListHandlers;
  // // [>* @type {RecentProcessesListStates} <]
  // recentProcessesListStates;
  // [>* @type {RecentProcessesListPrepare} <]
  // recentProcessesListPrepare;

  /**
   * @param {object} params
   * @param {TSharedHandlers} params.handlers
   * @param {string} [params.parentId]
   * @param {RecentProcessesListRender} params.recentProcessesListRender
   * @param {RecentProcessesListNodes} params.recentProcessesListNodes
   * @param {RecentProcessesListStates} params.recentProcessesListStates
   */
  constructor({
    handlers,
    parentId,
    recentProcessesListRender,
    recentProcessesListNodes,
    // recentProcessesListHandlers,
    recentProcessesListStates,
    // recentProcessesListPrepare,
  }) {
    this.handlers = handlers;
    const thisId = [parentId, 'Init'].filter(Boolean).join('_');
    this.initChunks = new InitChunks(initChunksList, thisId);
    // Set parameters for future initalization (see `initComponent`)
    this.recentProcessesListRender = recentProcessesListRender;
    this.recentProcessesListNodes = recentProcessesListNodes;
    // this.recentProcessesListHandlers = recentProcessesListHandlers;
    this.recentProcessesListStates = recentProcessesListStates;
    // this.recentProcessesListPrepare = recentProcessesListPrepare;
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
      /** @type {TRecentProcessesListInitParams} */
      const initParams = {
        handlers: this.handlers,
        events: this.events(),
        recentProcessesListRender: this.recentProcessesListRender,
        recentProcessesListNodes: this.recentProcessesListNodes,
        // recentProcessesListHandlers: this.recentProcessesListHandlers,
        // recentProcessesListStates: this.recentProcessesListStates,
        // recentProcessesListPrepare: this.recentProcessesListPrepare,
      };

      // Init all initiable components...
      this.recentProcessesListRender.init(initParams);
      // this.recentProcessesListHandlers.init(initParams);
      this.recentProcessesListStates.init(initParams);
      // this.recentProcessesListPrepare.init(initParams);

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
        console.error('[RecentProcessesListInit:initCssStyle]', error);
        // eslint-disable-next-line no-debugger
        debugger;
        commonNotify.showError(error);
      }
      /* // TODO
       * await CommonHelpers.addCssStyle(cssStyleUrl);
       */
      // Wait animation frame to finish updating css styles...
      const finishCssStyleChunk = this.initChunks.finishChunk.bind(this.initChunks, 'cssStyle');
      window.requestAnimationFrame(finishCssStyleChunk);
    }
  }

  getDomNodeContent() {
    return `
      <div id="recent-processes-list-tableau" class="recent-processes-list-tableau">
        <div id="recent-processes-list-title" class="recent-processes-list-title">Recently viewed processes</div>
        <div id="recent-processes-list-error" class="error"><!-- Error text placeholder --></div>
        <div id="loader-splash" class="loader-splash full-cover bg-white"><div class="loader-spinner"></div></div>
      </div>
      <div id="recent-processes-list-empty" class="recent-processes-list-empty">No recent processes</div>
      <div id="recent-processes-list" class="recent-processes-list"><!-- List placeholder --></div>
    `;
  }

  initDomNodeActions() {
    const rootNode = this.recentProcessesListNodes.getRootNode();
    const { handlers } = this;
    const { handleTitleActionClick } = handlers;
    const actionElems = rootNode.querySelectorAll('.recent-processes-list-actions a');
    actionElems.forEach((elem) => {
      elem.addEventListener('click', handleTitleActionClick);
    });
  }

  initDomNode() {
    if (!this.initChunks.isChunkStarted('dom')) {
      this.initChunks.startChunk('dom');
      const rootNode = this.recentProcessesListNodes.getRootNode();
      // Set dafault classes...
      rootNode.classList.toggle('loading', true);
      rootNode.classList.toggle('empty', true);
      // Create content...
      const html = this.getDomNodeContent();
      rootNode.innerHTML = html;
      // Finish nitialization stage...
      this.initChunks.finishChunk('dom');
    }
  }

  initEvents() {
    if (!this.initChunks.isChunkStarted('events')) {
      // NOTE: Can't work without initialized dom!
      this.initDomNode();
      this.initChunks.startChunk('events');
      /* // TODO
       * // Link close modal button handler (TODO: To use more specific class name?)...
       * const closeEl = this.getModalNodeElementByClass('close');
       * closeEl.addEventListener('click', this.getBoundHideModal());
       */
      this.initChunks.finishChunk('events');
    }
  }

  /** Initialize module.
   */
  doInit() {
    if (!this.initChunks.isWaitingOrInited()) {
      this.initChunks.start();
      this.initCssStyle() // TODO
        // Promise.resolve() // Temporarily: empty promise (replace with first initialization stage, see `CommonModal` as example)
        .then(() => {
          // Create all dom nodes...
          this.initDomNode();
          // Init events...
          this.initEvents();
          // Create all dom nodes...
          return this.initComponent();
        })
        // TODO: Catch error with initFailed?
        .catch((error) => {
          this.initChunks.initFailed(error);
        });
      // NOTE: Initialization should be finished on all init chanks finish, in `initChunks.initFinished`.
    }
  }
}
