// @ts-check

import * as CommonHelpers from './CommonHelpers.js';
import { InitChunks } from './InitChunks.js';

const cssStyleUrl = '/assets/css/common-indicators.css';

/** List of initilization steps.
 * @type {string[]}
 */
const initChunksList = [
  'cssStyle', // Loaded css module
  // 'events', // Inited events
  // 'dom', // Created required dom elements
];

/** @typedef {'curtain' | 'self'} TAnimate */

/** @typedef TIndicatorOptions
 * @property {number} [timeout]
 * @property {TAnimate} [animate]
 * property {boolean} [animateCurtain]
 * property {boolean} [animateItself]
 * @property {string} [curtainClassName]
 * @property {string} [animationClassName]
 */

/** @typedef TIndicatorData
 * @property {HTMLElement} node
 * @property {TIndicatorOptions} opts
 */

/** Update dragging state timeout, ms */
const defaultTimeout = 1000;

/** @type {TAnimate} */
const defaultAnimate = 'curtain';
const defaultCurtainClassName = 'common-indicator-curtain';
const defaultAnimationClassName = 'common-indicator-animation';

class CommonIndicators {
  /** Initializer
   * @type {InitChunks}
   */
  initChunks = new InitChunks(initChunksList, 'CommonIndicators');

  /** @type TIndicatorData[] */
  indicatedItems = [];

  // Methods...

  /** @param {TIndicatorData} data */
  stopIndicate(data) {
    const { indicatedItems } = this;
    const { node, opts } = data;
    const {
      curtainClassName = defaultCurtainClassName,
      animationClassName = defaultAnimationClassName,
    } = opts;
    const curtain = node.querySelector('.' + curtainClassName);
    node.classList.remove('common-indicator');
    node.classList.remove('.' + animationClassName);
    curtain && curtain.remove();
    const itemIdx = indicatedItems.indexOf(data);
    if (itemIdx !== -1) {
      indicatedItems.splice(itemIdx, 1);
    }
  }

  /** indicate
   * @param {HTMLElement} node
   * @param {TIndicatorOptions} [opts]
   */
  indicate(node, opts = {}) {
    const {
      timeout = defaultTimeout,
      animate = defaultAnimate,
      // animateCurtain,
      // animateItself,
      curtainClassName = defaultCurtainClassName,
      animationClassName = defaultAnimationClassName,
    } = opts;
    const { indicatedItems } = this;
    this.ensureInit().then(() => {
      /** @type TIndicatorData */
      const data = { node, opts };
      indicatedItems.push(data);
      // Create node...
      node.classList.add('common-indicator');
      if (animate === 'curtain') {
        const curtain = document.createElement('div');
        curtain.classList.add(curtainClassName);
        node.append(curtain);
      }
      if (animate === 'self') {
        node.classList.add(animationClassName);
      }
      const cb = this.stopIndicate.bind(this, data);
      setTimeout(cb, timeout);
    });
  }

  // Initialization...

  getInitDefer() {
    return this.initChunks.getInitDefer();
  }

  getInitPromise() {
    return this.initChunks.getInitPromise();
  }

  /** Ensure the modal has initiazlized
   * @return {Promise}
   */
  ensureInit() {
    if (!this.initChunks.isWaitingOrInited()) {
      this.init();
    }
    return this.initChunks.getInitPromise();
  }

  async initCssStyle() {
    if (!this.initChunks.isChunkStarted('cssStyle')) {
      this.initChunks.startChunk('cssStyle');
      const found = await CommonHelpers.addCssStyle(cssStyleUrl);
      /* console.log('[CommonIndicators:initCssStyle] loaded', {
       *   found,
       * });
       */
      // Inited for `cssStyle`
      this.initChunks.finishChunk('cssStyle');
    }
  }

  /** Initialize the longest things (loading external css styles)
   */
  preInit() {
    return this.initCssStyle();
  }

  /** Initialize nodule.
   */
  init() {
    if (!this.initChunks.isWaitingOrInited()) {
      this.initChunks.start();
      this.initCssStyle()
        // TODO: Catch error with initFailed?
        .catch((error) => {
          this.initChunks.initFailed(error);
        });
      // NOTE: Initialization should be finished on all init chanks finish, in `initChunks.initFinished`.
    }
  }
}

// Create and export singletone
export const commonIndicators = new CommonIndicators();
