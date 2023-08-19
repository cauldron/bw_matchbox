// @ts-check

// import * as CommonHelpers from './CommonHelpers.js';
import * as CommonPromises from './CommonPromises.js';
import { SimpleEvents } from './SimpleEvents.js';

/** // Used types...
 * @typedef {string} TInitChunkId;
 * @typedef {Record<TInitChunkId, boolean | undefined>} TInitChunks;
 * // TCallback -- Callback function.
 * @typedef {() => void} TCallback
 * @typedef {(error: Error) => void} TErrorCb
 */

// Define module...
export class InitChunks {
  /** @type {string} */
  initId = undefined;

  /** Initialized flag (see `inited` method)
   * @type {boolean}
   */
  inited = false;
  /** Waiting for initialization
   * @type {boolean}
   */
  waiting = false;
  /** @type {Error|undefined} */
  error = undefined;
  /** Initialization defer
   * @type {CommonPromises.TDeferred}
   */
  _initDefer = undefined;
  /** List of initialized chunks
   * @type {TInitChunks}
   */
  _initedChunks = {};

  /** @type {SimpleEvents} */
  events = new SimpleEvents('InitChunks');

  /** @type {string[]} */
  initChunksList = [];

  /** @param {string[]} [initChunksList]
   * @param {string} [initId]
   */
  constructor(initChunksList, initId) {
    if (initChunksList) {
      this.setInitChunksList(initChunksList);
    }
    if (initId) {
      this.initId = initId;
    }
  }

  // Status

  isWaiting() {
    return this.waiting;
  }
  isInited() {
    return this.inited;
  }
  isWaitingOrInited() {
    return this.waiting || this.inited;
  }

  // Errors...

  /** @param {TErrorCb} cb */
  onInitFailed(cb) {
    this.events.add('onInitFailed', cb);
    return this;
  }

  /** @param {TCallback} cb */
  onInitStarted(cb) {
    this.events.add('onInitStarted', cb);
    return this;
  }

  /** @param {TCallback} cb */
  onInitFinished(cb) {
    this.events.add('onInitFinished', cb);
    return this;
  }

  // Setters...

  /** @param {string[]} [initChunksList]
   */
  setInitChunksList(initChunksList) {
    if (initChunksList) {
      this.initChunksList = initChunksList;
    }
    return this;
  }

  // Initialization...

  /**
   * @param {Error} error
   */
  initFailed(error) {
    // eslint-disable-next-line no-console
    console.error('[InitChunks:initFailed]', error);
    // eslint-disable-next-line no-debugger
    debugger;
    this.inited = false;
    this.error = error;
    this.waiting = false;
    if (this._initDefer) {
      this._initDefer.reject(error);
    }
    // NOTE: Don't show notify here because this module uses in CommonNotify too.
  }

  initFinished() {
    if (this.waiting) {
      // console.log('[InitChunks:initFinished]');
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
  finishChunk(id) {
    /* console.log('[InitChunks:finishChunk]', this.initId, id, {
     *   id,
     *   initedChunks: this._initedChunks,
     * });
     */
    if (!this.initChunksList.includes(id)) {
      throw new Error(`Unknown initialization chunk: '${id}'`);
    } else if (this._initedChunks[id]) {
      const error = new Error(`Trying to initialize chunk '${id}' twice`);
      // eslint-disable-next-line no-console
      console.warn('[InitChunks:finishChunk]', error);
      // debugger;
      return;
    }
    this._initedChunks[id] = true;
    if (Object.values(this._initedChunks).filter(Boolean).length >= this.initChunksList.length) {
      // All chunks are initilized
      this.initFinished();
    }
  }

  /**
   * @param {TInitChunkId} id
   */
  isChunkInited(id) {
    return !!this._initedChunks[id];
  }

  /**
   * @param {TInitChunkId} id
   */
  chunkNotStarted(id) {
    return this._initedChunks[id] == undefined;
  }

  /**
   * @param {TInitChunkId} id
   */
  isChunkStarted(id) {
    return this._initedChunks[id] != undefined;
  }

  /**
   * @param {TInitChunkId} id
   */
  startChunk(id) {
    this._initedChunks[id] = false;
  }

  getInitDefer() {
    if (!this._initDefer) {
      // Create init defer, start initialization...
      this._initDefer = CommonPromises.Deferred();
      const promise = this._initDefer.promise;
      promise.then(this.events.emit.bind(this.events, 'onInitFinished'));
      promise.catch(this.events.emit.bind(this.events, 'onInitFailed'));
      // promise.catch((e) => e); // Suppress uncaught promise errors
      this.events.emit('onInitStarted');
      if (!this.waiting) {
        // NOTE: Check init/error state and resolve the promise immediately if this state has defined.
        // The case: _initDefer was requested after the state has initialized.
        if (this.inited) {
          // Successfully initialized!
          this._initDefer.resolve();
          // Catch error?
        } else if (this.error) {
          // Error!
          this._initDefer.reject(this.error);
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
    this.inited || this.start();
    return this.getInitPromise();
  }

  /** Start initialization
   */
  start() {
    if (!this.inited && !this.waiting) {
      this.waiting = true;
    }
    return this;
  }

  // TODO: constructor, destroy?
}
