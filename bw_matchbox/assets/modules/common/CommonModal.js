// @ts-check

import * as CommonHelpers from './CommonHelpers.js';
import { InitChunks } from './InitChunks.js';

const cssStyleUrl = '/assets/css/common-modal.css';

/** List of initilization steps.
 * @type {string[]}
 */
const initChunksList = [
  'cssStyle', // Loaded css module
  'events', // Inited events
  'dom', // Created required dom elements
];

/** // Used types...
 * @typedef {(typeof initChunksList)[number]} TInitChunkId;
 * @typedef {Record<TInitChunkId, boolean>} TInitChunks;
 * // TCallback -- Callback function.
 * @typedef {() => void} TCallback
 */

class CommonModal {
  /** Initializer
   * @type {InitChunks}
   */
  initChunks = new InitChunks(initChunksList, 'CommonModal');

  /** @type {TCallback[]} */
  onHideHandlers = [];

  // Cached bound events...

  /** @type {TCallback} */
  _boundHideModal = undefined;
  /** @type {EventListener} */
  _boundOnActiveKeyPress = undefined;

  /**
   * @param {TCallback} [cb]
   */
  onHide(cb) {
    if (cb && typeof cb === 'function') {
      this.onHideHandlers.push(cb);
    }
    return this;
  }

  clearOnHideHandlers() {
    // Clear handlers list...
    if (this.onHideHandlers.length) {
      this.onHideHandlers.length = 0; //  = [];
    }
    return this;
  }

  invokeOnHideHandlers() {
    if (this.onHideHandlers.length) {
      // Invoke all the hide handlers and empty the list...
      let cb;
      while ((cb = this.onHideHandlers.shift()) != undefined) {
        if (cb && typeof cb === 'function') {
          try {
            cb();
            /* // Alternate option: Delayed start...
             * setTimeout(cb, 0);
             */
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('[CommonModal:invokeOnHideHandlers]: error (catched)', {
              error,
              cb,
            });
            // eslint-disable-next-line no-debugger
            debugger;
          }
        }
      }
    }
    return this;
  }

  /** getModalNode -- Get root modal node
   * @return {HTMLElement|undefined}
   */
  getModalNode() {
    this.checkDomNodeInit(); // NOTE: Don nodes should be created!
    const modal = document.getElementById('common-modal');
    // TODO: Cache?
    return modal;
  }

  /** getModalNodeElementByClass -- Find modal sub element by class name
   * @param {string} className
   * @param {boolean} [optional]
   * @return {Element|undefined}
   */
  getModalNodeElementByClass(className, optional) {
    this.checkDomNodeInit(); // NOTE: Don nodes should be created!
    const modal = this.getModalNode();
    const node = modal.getElementsByClassName(className)[0];
    if (!node && !optional) {
      throw new Error('Not found modal node for class "' + className + '"');
    }
    // TODO: Cache?
    return node;
  }

  /** setTitle -- Update modal title
   * @param {string} title
   */
  setTitle(title) {
    this.checkDomNodeInit(); // NOTE: Don nodes should be created!
    const titleEl = this.getModalNodeElementByClass('common-modal-title');
    CommonHelpers.updateNodeContent(titleEl, title);
    return this;
  }

  /** setContent -- Update modal content
   * @param {string|HTMLElement|HTMLElement[]} content
   */
  setContent(content) {
    this.checkDomNodeInit(); // NOTE: Don nodes should be created!
    const wrapperEl = this.getModalNodeElementByClass('common-modal-content-wrapper');
    CommonHelpers.updateNodeContent(wrapperEl, content);
    return this;
  }

  /** setModalContentOption -- Set one (boolean) modal content option.
   * @param {string} optionName
   * @param {boolean} [optionValue]
   */
  setModalContentOption(optionName, optionValue) {
    this.checkDomNodeInit(); // NOTE: Don nodes should be created!
    const contentEl = this.getModalNodeElementByClass('common-modal-content');
    contentEl.classList.toggle(optionName, !!optionValue);
    return this;
  }

  /** setModalWindowOption -- Set one (boolean or literal) modal content option.
   * @param {string} optionName
   * @param {boolean|string} [optionValue]
   */
  setModalWindowOption(optionName, optionValue) {
    this.checkDomNodeInit(); // NOTE: Don nodes should be created!
    const contentEl = this.getModalNodeElementByClass('common-modal-window');
    if (typeof optionValue === 'boolean') {
      // Boolean option...
      contentEl.classList.toggle(optionName, !!optionValue);
    } else {
      // String (literal) option...
      const literalOptions = {
        // TODO: Move to constants?
        width: ['sm', 'md', 'lg'],
      };
      const literals = literalOptions[optionName];
      if (literals) {
        // Literal option...
        literals.forEach((/** @type {string } */ val) => {
          // Remove all the other and set current option...
          const isOn = val === optionValue;
          const name = optionName + '-' + val;
          contentEl.classList.toggle(name, isOn);
        });
      }
    }
    return this;
  }

  /** setModalContentScrollable -- Enable/disable scrollable mode for modal content.
   * @param {boolean} [scrollable]
   */
  setModalContentScrollable(scrollable) {
    this.checkDomNodeInit(); // NOTE: Don nodes should be created!
    this.setModalContentOption('scrollable', scrollable);
    return this;
  }

  /** setModalContentPadded -- Enable/disable padded mode for modal content.
   * @param {boolean} [padded]
   */
  setModalContentPadded(padded) {
    this.checkDomNodeInit(); // NOTE: Don nodes should be created!
    this.setModalContentOption('padded', padded);
    return this;
  }

  /** setModalContentOptions -- Set one (boolean) modal content option.
   * @param {Record<string, boolean>} options - Boolean options (`scrollable`, `padded`)
   */
  setModalContentOptions(options) {
    this.checkDomNodeInit(); // NOTE: Don nodes should be created!
    const names = Object.keys(options);
    names.forEach((name) => {
      this.setModalContentOption(name, options[name]);
    });
    return this;
  }

  /** setModalWindowOptions -- Set one (boolean) modal content option.
   * @param {object} options - Options (`width`, `autoWidth`, `autoHeight`, `fullWindowHeight`, `fullWindowHeightt`)
   * @param {string} [options.width] - Custom window size (sm, md, lg)
   * @param {boolean} [options.autoWidth]
   * @param {boolean} [options.autoHeight]
   * @param {boolean} [options.fullWindowWidth] (UNUSED)
   * @param {boolean} [options.fullWindowHeight] (UNUSED)
   */
  setModalWindowOptions(options) {
    this.checkDomNodeInit(); // NOTE: Don nodes should be created!
    const names = Object.keys(options);
    names.forEach((name) => {
      this.setModalWindowOption(name, options[name]);
    });
    return this;
  }

  /** setModalContentId -- Set one (boolean) modal content option.
   * @param {string} id
   */
  setModalContentId(id) {
    this.checkDomNodeInit(); // NOTE: Don nodes should be created!
    const contentEl = this.getModalNodeElementByClass('common-modal-content');
    contentEl.setAttribute('id', id);
    return this;
  }

  /** showModal -- Show modal window
   */
  showModal() {
    this.checkInit(); // NOTE: Don't forget to call `ensureInit` before!
    // Start modal ensuring all stuff has already initialized...
    const modal = this.getModalNode();
    if (modal.classList.contains('show')) {
      throw new Error('Trying to show already shown modal');
    }
    /* // Use delay...
     * setTimeout(() => {
     * }, 30);
     */
    window.requestAnimationFrame(() => {
      modal.classList.toggle('show', true);
      document.body.classList.toggle('has-modal', true);
    });
    this.activateEvents();
    return this;
  }

  /** Hide modal window
   * @param {object} [opts] - Options.
   * @param {boolean} [opts.dontNotify] - Options.
   */
  hideModal(opts = {}) {
    this.checkInit(); // NOTE: Don't forget to call `ensureInit` before!
    this.deactivateEvents();
    const modal = this.getModalNode();
    if (!modal.classList.contains('show')) {
      throw new Error('Trying to hide already hidden modal');
    }
    modal.classList.toggle('show', false);
    document.body.classList.toggle('has-modal', false);
    if (opts.dontNotify) {
      this.clearOnHideHandlers();
    } else {
      this.invokeOnHideHandlers();
    }
    return this;
  }

  // Active events...

  /**
   * @param {KeyboardEvent} event
   */
  onActiveKeyPress(event) {
    if (event.key === 'Escape') {
      this.hideModal();
    }
  }

  activateEvents() {
    document.addEventListener('keydown', this.getBoundOnActiveKeyPress());
    const outerEl = this.getModalNodeElementByClass('common-modal-splash');
    outerEl.addEventListener('mousedown', this.getBoundHideModal());
  }

  deactivateEvents() {
    document.removeEventListener('keydown', this.getBoundOnActiveKeyPress());
    const outerEl = this.getModalNodeElementByClass('common-modal-splash');
    outerEl.removeEventListener('mousedown', this.getBoundHideModal());
  }

  // Bound events...

  /**
   * @return {TCallback}
   */
  getBoundHideModal() {
    if (!this._boundHideModal) {
      this._boundHideModal = this.hideModal.bind(this);
    }
    return this._boundHideModal;
  }

  /**
   * @return {EventListener}
   */
  getBoundOnActiveKeyPress() {
    if (!this._boundOnActiveKeyPress) {
      this._boundOnActiveKeyPress = this.onActiveKeyPress.bind(this);
    }
    return this._boundOnActiveKeyPress;
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

  checkDomNodeInit() {
    // NOTE: Don't forget to call `ensureInit` before!
    if (!this.initChunks.isChunkInited('dom')) {
      const ensureErrorText = 'Dom components should be initalized!';
      const error = new Error(ensureErrorText);
      // eslint-disable-next-line no-console
      console.error('[CommonModal:checkDomNodeInit]: error (catched)', error);
      // eslint-disable-next-line no-debugger
      debugger;
      throw error;
    }
  }

  checkInit() {
    // NOTE: Don't forget to call `ensureInit` before!
    if (!this.initChunks.isInited()) {
      const ensureErrorText = 'Component should be initalized with `ensureInit` before usage!';
      const error = new Error(ensureErrorText);
      // eslint-disable-next-line no-console
      console.error('[CommonModal:checkInit]: error (catched)', error);
      // eslint-disable-next-line no-debugger
      debugger;
      throw error;
    }
  }

  getDomNodeContent() {
    return `
      <!--
      <link rel="stylesheet" href="${cssStyleUrl}" />
      -->
      <div class="common-modal-wrapper">
        <div class="common-modal" id="common-modal">
          <div class="common-modal-splash"></div>
          <div class="common-modal-window">
            <div class="common-modal-header">
              <h3 class="common-modal-title"><!-- Modal title placehodler --></h3>
              <div class="close" title="Close window">&times;</div>
            </div>
            <div class="common-modal-content">
              <div class="common-modal-content-wrapper" id="common-modal-content-wrapper">
                <!-- Modal content placehodler -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async initCssStyle() {
    if (!this.initChunks.isChunkStarted('cssStyle')) {
      this.initChunks.startChunk('cssStyle');
      await CommonHelpers.addCssStyle(cssStyleUrl);
      // Inited for `cssStyle`
      // Wait animation frame to finish updating css styles...
      const finishCssStyleChunk = this.initChunks.finishChunk.bind(this.initChunks, 'cssStyle');
      window.requestAnimationFrame(finishCssStyleChunk);
    }
  }

  createDomNode() {
    if (!this.initChunks.isChunkStarted('dom')) {
      this.initChunks.startChunk('dom');
      const html = this.getDomNodeContent();
      document.body.insertAdjacentHTML('beforeend', html);
      this.initChunks.finishChunk('dom');
    }
  }

  initEvents() {
    if (!this.initChunks.isChunkStarted('events')) {
      // NOTE: Can't work without initialized dom!
      this.createDomNode();
      this.initChunks.startChunk('events');
      // Link close modal button handler (TODO: To use more specific class name?)...
      const closeEl = this.getModalNodeElementByClass('close');
      closeEl.addEventListener('click', this.getBoundHideModal());
      this.initChunks.finishChunk('events');
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
        /* // Use some delay after css load...
         * .then(() => CommonPromises.delayedPromise(1000))
         */
        // Initialize dom nodes & events...
        .then(() => {
          // Create all dom nodes...
          this.createDomNode();
          // Init events...
          this.initEvents();
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
export const commonModal = new CommonModal();
