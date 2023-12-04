// @ts-check

import { storeProcess } from '../../common/RecentProcesses.js';

import { ThreadComments } from '../../components/ThreadComments/ThreadComments.js';

// import * as ProcessDetailPageHelpers from './ProcessDetailPageHelpers.js';
import { ProcessDetailPageState } from './ProcessDetailPageState.js';
import { ProcessDetailPageInit } from './ProcessDetailPageInit.js';
import { ProcessDetailPageHandlers } from './ProcessDetailPageHandlers.js';
import { ProcessDetailPageNodes } from './ProcessDetailPageNodes.js';

export class ProcessDetailPage {
  /** External data...
   * @type {TProcessDetailPageSharedParams}
   */
  sharedParams = undefined;

  /** Handlers exchange object
   * @type {TSharedHandlers}
   */
  callbacks = {};

  /** @type {TThreadComments} */
  threadComments;

  /** @type {ProcessDetailPageState} */
  state;

  /** @type {ProcessDetailPageNodes} */
  nodes;

  /** @type {ProcessDetailPageInit} */
  init;

  /** @type {ProcessDetailPageHandlers} */
  handlers;

  /**
   * @param {TProcessDetailPageSharedParams} sharedParams
   */
  constructor(sharedParams) {
    /* // (Optional) Pre-initialize common submodules...
     * commonModal.preInit();
     * commonNotify.preInit();
     */

    // Save public data...
    this.sharedParams = sharedParams;

    // Create ThreadComments component...
    const threadComments = new ThreadComments('ProcessDetailPage');
    this.threadComments = threadComments;

    const { callbacks } = this;

    const { isWaitlist, currentUser, currentRole, currentProcess } = sharedParams;

    // Store current process for history...
    storeProcess(currentProcess);

    const nodes = (this.nodes = new ProcessDetailPageNodes());
    const state = (this.state = new ProcessDetailPageState({
      isWaitlist,
      currentUser,
      currentRole,
      currentProcess,
    }));
    this.init = new ProcessDetailPageInit({
      callbacks,
      threadComments,
      state,
      nodes,
    });
    this.handlers = new ProcessDetailPageHandlers({
      sharedParams,
      callbacks,
      state,
      nodes,
      threadComments,
    });

    callbacks.initSidePanelTabs();

    // Set initialized state...
    const layoutNode = nodes.getLayoutNode();
    layoutNode.classList.toggle('inited', true);
  }
}
