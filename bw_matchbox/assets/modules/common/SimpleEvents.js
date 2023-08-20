// @ts-check

export class SimpleEvents {
  /** @type {Record<string, function[]>} */
  handlers = {};

  /** @type {string} */
  eventsId = undefined;

  /** @param {string} [eventsId] */
  constructor(eventsId) {
    if (eventsId) {
      this.eventsId = eventsId;
    }
  }

  /**
   * @param {string} id
   * @param {function} cb
   */
  add(id, cb) {
    if (!cb) {
      const error = new Error(`Trying to add empty handler for event '${id}'`);
      // eslint-disable-next-line no-console
      console.warn('[SimpleEvents:add]', error);
    } else if (typeof cb !== 'function') {
      const error = new Error(`Trying to add non-function as a handler for event '${id}'`);
      // eslint-disable-next-line no-console
      console.warn('[SimpleEvents:add]', error);
    } else {
      if (!this.handlers[id]) {
        this.handlers[id] = [];
      }
      this.handlers[id].push(cb);
    }
    return this;
  }

  /**
   * @param {string} id
   * @param {function} cb
   */
  remove(id, cb) {
    // TODO: Check for attempts to remove absent handler?
    if (cb && typeof cb === 'function') {
      const handlers = this.handlers[id];
      if (handlers) {
        const pos = handlers.indexOf(cb);
        if (pos !== -1) {
          handlers.splice(pos, 1);
        }
      }
    }
    return this;
  }

  /**
   * @param {string} id
   * @param {any} [arg]
   */
  emit(id, arg) {
    const handlers = this.handlers[id];
    /** console.log('[SimpleEvents:invokeEvent]: start', {
     *   id,
     *   arg,
     *   handlers,
     * });
     */
    if (!handlers) {
      /* // NOTE: No error
       * // Error if no event exist!
       * const error = new Error('Trying to emit absent event: ' + id);
       * // eslint-disable-next-line no-console
       * console.warn('[SimpleEvents:invokeEvent]: warning', error);
       * // throw error;
       */
      return this;
    }
    if (!Array.isArray(handlers) || !handlers.length) {
      // Do nothing for empty handlers list
      return this;
    }
    // Call all the registered update handlers...
    handlers.forEach((cb) => {
      try {
        if (cb) {
          cb(arg);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[SimpleEvents:invokeEvent]: error (catched)', {
          error,
          cb,
          id,
          arg,
        });
        // eslint-disable-next-line no-debugger
        debugger;
        return this;
      }
    });
    return this;
  }
}
