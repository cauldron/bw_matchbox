// @ts-check

import * as CommonHelpers from './CommonHelpers.js';
import * as CommonPromises from './CommonPromises.js';

const cssStyleUrl = '/assets/css/common-modal.css';

/** TCallback -- Callback function.
 * @typedef {() => void} TCallback
 */

/** List of initilization steps.
 * @type {string[]}
 */
const initChunksList = [
  'cssStyle', // Loaded css module
  'events', // Inited events
  'dom', // Created required dom elements
];

/**
@typedef {(typeof initChunksList)[number]} TInitChunkId;
@typedef {Record<TInitChunkId, boolean>} TInitChunks;
*/

class CommonModal {
  /** Initialized flag (see `inited` method)
   * @type {boolean}
   */
  inited = false;
  /** Waiting for initialization
   * @type {boolean}
   */
  waiting = false;
  /** @type {Error} */
  error = undefined;
  /** Initialization defer
   * @type {CommonPromises.TDeferred}
   */
  _initDefer = undefined;
  /** List of initialized chunks
   * @type {TInitChunkId[]}
   */
  _initedChunks = [];

  /** @type {TCallback[]} */
  onHideHandlers = [];

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
    this.inited || this.init();
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
    this.inited || this.init();
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
    this.inited || this.init();
    const titleEl = this.getModalNodeElementByClass('common-modal-title');
    CommonHelpers.updateNodeContent(titleEl, title);
    return this;
  }

  /** setContent -- Update modal content
   * @param {string|HTMLElement|HTMLElement[]} content
   */
  setContent(content) {
    this.inited || this.init();
    const wrapperEl = this.getModalNodeElementByClass('common-modal-content-wrapper');
    CommonHelpers.updateNodeContent(wrapperEl, content);
    return this;
  }

  /** setModalContentOption -- Set one (boolean) modal content option.
   * @param {string} optionName
   * @param {boolean} [optionValue]
   */
  setModalContentOption(optionName, optionValue) {
    this.inited || this.init();
    const contentEl = this.getModalNodeElementByClass('common-modal-content');
    contentEl.classList.toggle(optionName, !!optionValue);
    return this;
  }

  /** setModalWindowOption -- Set one (boolean) modal content option.
   * @param {string} optionName
   * @param {boolean} [optionValue]
   */
  setModalWindowOption(optionName, optionValue) {
    this.inited || this.init();
    const literalOptions = {
      width: ['sm', 'md', 'lg'],
    };
    const contentEl = this.getModalNodeElementByClass('common-modal-window');
    const literals = literalOptions[optionName];
    if (literals) {
      // Literal option...
      literals.forEach((/** @type {string } */ val) => {
        // Remove all the other and set current option...
        const isOn = optionValue && val === optionName;
        const name = optionName + '-' + val;
        contentEl.classList.toggle(name, isOn);
      });
    } else {
      // Boolean option...
      contentEl.classList.toggle(optionName, !!optionValue);
    }
    return this;
  }

  /** setModalContentScrollable -- Enable/disable scrollable mode for modal content.
   * @param {boolean} [scrollable]
   */
  setModalContentScrollable(scrollable) {
    this.inited || this.init();
    this.setModalContentOption('scrollable', scrollable);
    return this;
  }

  /** setModalContentPadded -- Enable/disable padded mode for modal content.
   * @param {boolean} [padded]
   */
  setModalContentPadded(padded) {
    this.inited || this.init();
    this.setModalContentOption('padded', padded);
    return this;
  }

  /** setModalContentOptions -- Set one (boolean) modal content option.
   * @param {Record<string, boolean>} options - Boolean options (`scrollable`, `padded`)
   */
  setModalContentOptions(options) {
    this.inited || this.init();
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
    this.inited || this.init();
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
    this.inited || this.init();
    const contentEl = this.getModalNodeElementByClass('common-modal-content');
    contentEl.setAttribute('id', id);
    return this;
  }

  /** showModal -- Show modal window
   * @param {object} [params] - Modal parameters
   * @param {string} [params.title] - Modal title
   */
  showModal(params = {}) {
    this.inited || this.init();
    const { title } = params;
    // Start modal ensuring all stuff has already initialized...
    this.getInitPromise().then(() => {
      const modal = this.getModalNode();
      if (modal.classList.contains('show')) {
        throw new Error('Trying to show already shown modal');
      }
      modal.classList.toggle('show', true);
      document.body.classList.toggle('has-modal', true);
      // Update title (if passed)...
      if (title) {
        this.setTitle(title);
      }
      this.activateEvents();
    });
    return this;
  }

  /** Hide modal window
   * @param {object} [opts] - Options.
   * @param {boolean} [opts.dontNotify] - Options.
   */
  hideModal(opts = {}) {
    this.inited || this.init();
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

  // Initialization...

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

  initDom() {
    if (this.isChunkInited('dom')) {
      return Promise.resolve();
    }
    const html = this.getDomNodeContent();
    document.body.insertAdjacentHTML('beforeend', html);
    this.initChunk('dom');
  }

  /**
   * @param {Error} error
   */
  initFailed(error) {
    // eslint-disable-next-line no-console
    console.error('[CommonModal:initFailed]', error);
    // eslint-disable-next-line no-debugger
    debugger;
    this.inited = false;
    this.error = error;
    this.waiting = false;
    if (this._initDefer) {
      this._initDefer.reject(error);
    }
    // TODO: Show notify?
  }

  initFinished() {
    if (this.waiting) {
      // console.log('[CommonModal:initFinished]');
      this.inited = true;
      this.error = undefined;
      this.waiting = false;
      if (this._initDefer) {
        this._initDefer.resolve();
      }
    }
  }

  /**
   * @param {TInitChunkId} id
   */
  initChunk(id) {
    /* console.log('[CommonModal:initChunk]', id, {
     *   id,
     *   initedChunks: this._initedChunks,
     * });
     */
    if (!initChunksList.includes(id)) {
      throw new Error(`Unknown initialization chunk: '${id}'`);
    } else if (this._initedChunks.includes(id)) {
      throw new Error(`Trying to initialize chunk '${id}' twice`);
    }
    this._initedChunks.push(id);
    if (this._initedChunks.length >= initChunksList.length) {
      // All chunks are initilized
      this.initFinished();
    }
  }

  /**
   * @param {TInitChunkId} id
   */
  isChunkInited(id) {
    return this._initedChunks.includes(id);
  }

  getInitDefer() {
    if (!this._initDefer) {
      this._initDefer = CommonPromises.Deferred();
      this._initDefer.promise.catch((e) => e); // Suppress uncaught promise errors
      if (!this.waiting) {
        // NOTE: Check init/error state and resolve the promise immediately if this state has defined.
        // The case: _initDefer was requested after the state has initialized.
        if (this.inited) {
          // Successfully initialized!
          this._initDefer.resolve();
          /* // Catch error?
           * } else if (this.error) {
           *   // Error!
           *   this._initDefer.reject(this.error);
           */
        }
        // TODO: Else -- Start initialization limit timer with auto-cancel?
      }
    }
    return this._initDefer;
  }

  getInitPromise() {
    return this.getInitDefer().promise;
  }

  /** Ensure the modal has initiazlized
   * @return {Promise}
   */
  ensureInit() {
    this.inited || this.init();
    return this.getInitPromise();
  }

  getBoundHideModal() {
    if (!this._boundHideModal) {
      this._boundHideModal = this.hideModal.bind(this);
    }
    return this._boundHideModal;
  }

  getBoundOnActiveKeyPress() {
    if (!this._boundOnActiveKeyPress) {
      this._boundOnActiveKeyPress = this.onActiveKeyPress.bind(this);
    }
    return this._boundOnActiveKeyPress;
  }

  initEvents() {
    if (this.isChunkInited('events')) {
      return Promise.resolve();
    }
    // Link close modal button handler (TODO: To use more specific class name?)...
    const closeEl = this.getModalNodeElementByClass('close');
    closeEl.addEventListener('click', this.getBoundHideModal());
    this.initChunk('events');
  }

  initCssStyle() {
    if (this.isChunkInited('cssStyle')) {
      return Promise.resolve();
    }
    return CommonHelpers.addCssStyle(cssStyleUrl).then(() => {
      // Inited for `cssStyle`
      this.initChunk('cssStyle');
    });
  }

  /** Initialize the longest things (loading external css styles)
   */
  preInit() {
    return this.initCssStyle();
  }

  /** init -- Initialize the modal. Should be called before first usage, see call inside `showModal`.
   */
  init() {
    if (!this.inited && !this.waiting) {
      this.waiting = true;
      this.initCssStyle()
        .then(() => {
          // Create all dom nodes...
          return this.initDom();
        })
        .then(() => {
          // Init events...
          return this.initEvents();
        })
        // TODO: Catch error with initFailed?
        .catch((error) => {
          this.initFailed(error);
        });
      // NOTE: Initialization should be finished on all init chanks finish, in `initFinished`.
    }
  }

  // TODO: constructor, destroy?
}

// Create and export singletone
export const commonModal = new CommonModal();
