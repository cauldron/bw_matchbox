// @ts-check

import * as CommonHelpers from './CommonHelpers.js';
import { InitChunks } from './InitChunks.js';

const cssStyleUrl = '/assets/css/common-notify.css';

// Icon shapes (move to constants?)...
const icons = {
  success: 'fa-check',
  error: 'fa-warning',
  warn: 'fa-bell',
  info: 'fa-info',
};

/** List of initilization steps.
 * @type {string[]}
 */
const initChunksList = [
  'cssStyle', // Loaded css module
  // 'events', // Inited events
  'dom', // Created required dom elements
];

/** // Used types...
 * @typedef {(typeof initChunksList)[number]} TInitChunkId;
 * @typedef {Record<TInitChunkId, boolean>} TInitChunks;
 * @typedef {{ node: HTMLDivElement, handler?: TSetTimeout }} TNotifyData;
 * // TCallback -- Callback function.
 * @typedef {() => void} TCallback
 */

// Define module...
class CommonNotify {
  /** Initializer
   * @type {InitChunks}
   */
  initChunks = new InitChunks(initChunksList, 'CommonNotify');

  /** @type {HTMLDivElement} */
  notifyRoot = undefined;

  /** @type {number} */
  timeoutDelay = 3000;

  // Methods...

  /** removeNotify
   * @param {TNotifyData} notifyData
   */
  removeNotify(notifyData) {
    const { node, handler } = notifyData;
    // Play animation...
    node.classList.remove('active');
    if (handler) {
      clearTimeout(handler);
      notifyData.handler = undefined;
    }
    setTimeout(() => {
      // ...And remove node (TODO: Check if node still exists in dom tree)...
      this.notifyRoot.removeChild(node);
    }, 250); // Value of `var(--common-animation-time)`
  }

  /** showNotify
   * @param {'info' | 'error' | 'warn' | 'success'} mode - Message type ('info' is default)
   * @param {string|Error} text - Message content
   */
  showNotify(mode, text) {
    if (!text) {
      // If only one parameters passed assume it as message with default type
      text = mode;
      mode = 'info';
    }
    /** @type {string} */
    let content;
    if (text instanceof Error) {
      // Convert error object to the plain text...
      content = CommonHelpers.getErrorText(text);
    } else {
      content = String(text);
    }
    this.ensureInit().then(() => {
      // Create node...
      const node = document.createElement('div');
      node.classList.add('notify');
      node.classList.add('notify-' + mode);
      // Add icon...
      const nodeIcon = document.createElement('span');
      nodeIcon.classList.add('icon');
      nodeIcon.classList.add('fa');
      nodeIcon.classList.add(icons[mode]);
      node.appendChild(nodeIcon);
      // Add text...
      const nodeText = document.createElement('div');
      nodeText.classList.add('text');
      nodeText.innerHTML = content;
      node.appendChild(nodeText);
      this.notifyRoot.appendChild(node);
      // Play animation...
      window.requestAnimationFrame(() => {
        node.classList.add('active');
      });
      // Remove node after delay...
      /** @type {TNotifyData} */
      const notifyData = { node, handler: undefined };
      const removeNotifyHandler = this.removeNotify.bind(this, notifyData);
      notifyData.handler = setTimeout(removeNotifyHandler, this.timeoutDelay);
      // Stop & restore timer on mouse in and out events...
      node.addEventListener('mouseenter', () => {
        // Clear timer...
        clearTimeout(notifyData.handler);
      });
      node.addEventListener('mouseleave', () => {
        // Resume timer...
        notifyData.handler = setTimeout(removeNotifyHandler, this.timeoutDelay);
      });
      // Click handler...
      node.addEventListener('click', removeNotifyHandler);
    });
  }

  // Some shorthands...

  /** @param {string|Error} text - Message content */
  showInfo(text) {
    this.showNotify('info', text);
  }

  /** @param {string|Error} text - Message content */
  showSuccess(text) {
    this.showNotify('success', text);
  }

  /** @param {string|Error} text - Message content */
  showWarn(text) {
    this.showNotify('warn', text);
  }

  /** @param {string|Error} text - Message content */
  showError(text) {
    this.showNotify('error', text);
  }

  // Demo...

  showDemo() {
    // DEBUG: Show sample notifiers...
    this.showInfo('Info');
    this.showSuccess('Success');
    this.showWarn('Warn');
    this.showError('Error');
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

  createDomNode() {
    if (this.initChunks.isChunkStarted('dom')) {
      return Promise.resolve();
    }
    this.initChunks.startChunk('dom');
    const rootNode = document.body;
    const notifyRoot = document.createElement('div');
    notifyRoot.classList.add('notify-root');
    notifyRoot.setAttribute('id', 'notify-root');
    rootNode.appendChild(notifyRoot);
    this.notifyRoot = notifyRoot;
    this.initChunks.finishChunk('dom');
  }

  async initCssStyle() {
    if (!this.initChunks.isChunkStarted('cssStyle')) {
      this.initChunks.startChunk('cssStyle');
      await CommonHelpers.addCssStyle(cssStyleUrl);
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
        .then(() => {
          // Create all dom nodes...
          return this.createDomNode();
        })
        // TODO: Catch error with initFailed?
        .catch((error) => {
          this.initChunks.initFailed(error);
        });
      // NOTE: Initialization should be finished on all init chanks finish, in `initChunks.initFinished`.
    }
  }
}

// Create and export singletone
export const commonNotify = new CommonNotify();
