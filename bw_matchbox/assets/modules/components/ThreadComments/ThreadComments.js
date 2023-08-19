// @ts-check

// import * as CommonConstants from '../../common/CommonConstants.js';
// import * as CommonHelpers from '../../common/CommonHelpers.js';
// import * as CommonPromises from '../../common/CommonPromises.js';

import { ThreadCommentsNodes } from './ThreadCommentsNodes.js';
import { ThreadCommentsData } from './ThreadCommentsData.js';
import { ThreadCommentsInit } from './ThreadCommentsInit.js';
import { ThreadCommentsStates } from './ThreadCommentsStates.js';

/** @typedef TParams
 * @property {Element} rootNode
 * @property {string} currentUser,
 * @property {string} role,
 */

export class ThreadComments {
  /** @type {ThreadCommentsInit} */
  threadCommentsInit = undefined;

  /** Technical (debug) id
   * @type {string}
   */
  thisId = 'ThreadComments';

  /** @type {TSharedHandlers} */
  handlers = {};

  /** @type {TEvents} */
  events = undefined;

  // TODO: handlers, state, data, events

  /** @param {string} parentId */
  constructor(parentId) {
    if (parentId) {
      const thisId = [parentId, 'ThreadComments'].filter(Boolean).join('_');
      this.thisId = thisId;
    }
    const { handlers } = this;
    this.threadCommentsInit = new ThreadCommentsInit({ handlers, parentId: this.thisId });
    this.events = this.threadCommentsInit.events();
  }

  /** Ensure the modal has initiazlized
   * @return {Promise}
   */
  ensureInit() {
    return this.threadCommentsInit.ensureInit();
  }

  /** Initialize the longest things (loading external css styles)
   */
  preInit() {
    return this.threadCommentsInit.preInit();
  }

  /** @param {TParams} params
   */
  setParams(params) {
    ThreadCommentsNodes.setRootNode(params.rootNode);
    ThreadCommentsStates.setRole(params.role);
    ThreadCommentsData.currentUser = params.currentUser;
  }
}
