// @ts-check

// import * as CommonConstants from '../../common/CommonConstants.js';
// import * as CommonHelpers from '../../common/CommonHelpers.js';
// import * as CommonPromises from '../../common/CommonPromises.js';
import { InitChunks } from '../../common/InitChunks.js';

import { ThreadCommentsNodes } from './ThreadCommentsNodes.js';
import { ThreadCommentsLoader } from './ThreadCommentsLoader.js';
import { ThreadCommentsData } from './ThreadCommentsData.js';
import { ThreadCommentsRender } from './ThreadCommentsRender.js';

/** List of initilization steps.
 * @type {string[]}
 */
const initChunksList = [
  'component',
  'cssStyle', // Loaded css module
  'events', // Inited events
  'dom', // Created required dom elements
];

/** @typedef TParams
 * @property {Element} errorNode
 * @property {Element} threadsListNode
 * @property {string} currentUser,
 * @property {string} currentRole,
 */

// TODO: Load styles

export class ThreadComments {
  /** Initializer
   * @type {InitChunks}
   */
  initChunks = new InitChunks(initChunksList, 'CommonNotify');

  /** Technical (debug) id
   * @type {string}
   */
  __id = undefined;

  /** @type {Record<string, function>} */
  handlers = {};

  /** @param {string} id */
  constructor(id) {
    if (id) {
      this.__id = id;
    }
  }

  // TODO: handlers, state, data, events

  /** Ensure the modal has initiazlized
   * @return {Promise}
   */
  ensureInit() {
    if (!this.initChunks.isWaitingOrInited()) {
      this.init();
    }
    return this.initChunks.getInitPromise();
  }

  /** @param {TParams} params
   */
  setParams(params) {
    ThreadCommentsNodes.setErrorNode(params.errorNode);
    ThreadCommentsNodes.setThreadsListNode(params.threadsListNode);
    ThreadCommentsData.currentUser = params.currentUser;
    ThreadCommentsData.currentRole = params.currentRole;
  }

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
      };

      console.log('[ThreadComments:initComponent]', { initParams });

      ThreadCommentsLoader.init(initParams);
      ThreadCommentsRender.init(initParams);

      this.initChunks.finishChunk('component');
    }
  }

  async initCssStyle() {
    if (!this.initChunks.isChunkStarted('cssStyle')) {
      this.initChunks.startChunk('cssStyle');
      /* // TODO
       * await CommonHelpers.addCssStyle(cssStyleUrl);
       */
      // Wait animation frame to finish updating css styles...
      const finishCssStyleChunk = this.initChunks.finishChunk.bind(this.initChunks, 'cssStyle');
      window.requestAnimationFrame(finishCssStyleChunk);
    }
  }

  initDomNode() {
    if (!this.initChunks.isChunkStarted('dom')) {
      this.initChunks.startChunk('dom');
      /* // TODO
       * const html = this.getDomNodeContent();
       * document.body.insertAdjacentHTML('beforeend', html);
       */
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
  init() {
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
