// @ts-check

// Import types only...
/* eslint-disable no-unused-vars */
import { ThreadCommentsRender } from './ThreadCommentsRender.js';
import { ThreadCommentsNodes } from './ThreadCommentsNodes.js';
import { ThreadCommentsStates } from './ThreadCommentsStates.js';
import { ThreadCommentsHandlers } from './ThreadCommentsHandlers.js';
import { ThreadCommentsPrepare } from './ThreadCommentsPrepare.js';
/* eslint-enable no-unused-vars */

import * as CommonHelpers from '../../common/CommonHelpers.js';
import { InitChunks } from '../../common/InitChunks.js';
import { commonNotify } from '../../common/CommonNotify.js';

const cssStyleUrls = [
  // Styles urls...
  '/assets/css/thread-comments.css',
  '/assets/css/thread-comments-threads-list.css',
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

export class ThreadCommentsInit {
  /** Initializer
   * @type {InitChunks}
   */
  initChunks = undefined; // new InitChunks(initChunksList, 'ThreadComments');

  /** @type {TSharedHandlers} */
  handlers = {};

  /** @type {ThreadCommentsRender} */
  threadCommentsRender;
  /** @type {ThreadCommentsNodes} */
  threadCommentsNodes;
  /** @type {ThreadCommentsStates} */
  threadCommentsStates;
  /** @type {ThreadCommentsHandlers} */
  threadCommentsHandlers;
  /** @type {ThreadCommentsPrepare} */
  threadCommentsPrepare;

  /**
   * @param {object} params
   * @param {TSharedHandlers} params.handlers
   * @param {string} [params.parentId]
   * @param {ThreadCommentsRender} params.threadCommentsRender
   * @param {ThreadCommentsNodes} params.threadCommentsNodes
   * @param {ThreadCommentsStates} params.threadCommentsStates
   * @param {ThreadCommentsHandlers} params.threadCommentsHandlers
   * @param {ThreadCommentsPrepare} params.threadCommentsPrepare
   */
  constructor({
    handlers,
    parentId,
    threadCommentsRender,
    threadCommentsNodes,
    threadCommentsStates,
    threadCommentsHandlers,
    threadCommentsPrepare,
  }) {
    this.handlers = handlers;
    const thisId = [parentId, 'Init'].filter(Boolean).join('_');
    this.initChunks = new InitChunks(initChunksList, thisId);
    // Set parameters for future initalization (see `initComponent`)
    this.threadCommentsRender = threadCommentsRender;
    this.threadCommentsNodes = threadCommentsNodes;
    this.threadCommentsStates = threadCommentsStates;
    this.threadCommentsHandlers = threadCommentsHandlers;
    this.threadCommentsPrepare = threadCommentsPrepare;
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

  /** Initialize the longest things (loading external css styles)
   */
  preInit() {
    // return this.initCssStyle();
  }

  initComponent() {
    if (!this.initChunks.isChunkStarted('component')) {
      this.initChunks.startChunk('component');
      /** @type {TThreadCommentsInitParams} */
      const initParams = {
        handlers: this.handlers,
        events: this.events(),
        threadCommentsRender: this.threadCommentsRender,
        threadCommentsNodes: this.threadCommentsNodes,
        threadCommentsStates: this.threadCommentsStates,
        threadCommentsHandlers: this.threadCommentsHandlers,
        threadCommentsPrepare: this.threadCommentsPrepare,
      };

      // Init all initiable components...
      this.threadCommentsRender.init(initParams);
      this.threadCommentsStates.init(initParams);
      this.threadCommentsHandlers.init(initParams);
      this.threadCommentsPrepare.init(initParams);

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
        console.error('[ThreadCommentsInit:initCssStyle]', error);
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
    // TODO 2023.08.21, 23:41: Display some statistic info (to fill the empty space, preserved for loader spinner)?
    return `
      <div id="threads-list-tableau" class="threads-list-tableau">
        <div id="threads-list-actions" class="threads-list-actions">
          <a id="addNewThread" title="Add new thread"><i class="fa fa-plus"></i></a>
        </div>
        <div id="threads-list-error" class="error"><!-- Error text comes here --></div>
        <div id="loader-splash" class="loader-splash full-cover bg-white"><div class="loader-spinner"></div></div>
      </div>
      <div id="threads-list-empty" class="threads-list-empty">No avaialable comment threads</div>
      <div id="threads-list" class="threads-list"><!-- List placeholder --></div>
    `;
  }

  initDomNodeActions() {
    const rootNode = this.threadCommentsNodes.getRootNode();
    const { handlers } = this;
    const { handleTitleActionClick } = handlers;
    const actionElems = rootNode.querySelectorAll('.threads-list-actions a');
    actionElems.forEach((elem) => {
      elem.addEventListener('click', handleTitleActionClick);
    });
  }

  initDomNode() {
    if (!this.initChunks.isChunkStarted('dom')) {
      this.initChunks.startChunk('dom');
      const rootNode = this.threadCommentsNodes.getRootNode();
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
