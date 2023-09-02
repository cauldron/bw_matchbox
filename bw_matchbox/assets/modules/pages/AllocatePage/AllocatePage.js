// @ts-check

import { AllocatePageNodes } from './AllocatePageNodes.js';
import { AllocatePageState } from './AllocatePageState.js';
// import { AllocatePageInit } from './AllocatePageInit.js';
// import { AllocatePageHandlers } from './AllocatePageHandlers.js';

export class AllocatePage {
  /** External data...
   * @type {TSharedParams}
   */
  sharedParams = undefined;

  /** Handlers exchange object
   * @type {TSharedHandlers}
   */
  callbacks = {};

  /** @type {AllocatePageState} */
  state;

  /** @type {AllocatePageNodes} */
  nodes;

  /* // TODO: Future modules: state, nodes, init, handlers
   * [>* @type {AllocatePageInit} <]
   * init;
   * [>* @type {AllocatePageHandlers} <]
   * handlers;
   */

  /**
   * @param {TSharedParams} sharedParams
   */
  constructor(sharedParams) {
    /* // (Optional) Pre-initialize common submodules...
     * commonModal.preInit();
     * commonNotify.preInit();
     */

    // Save public data...
    this.sharedParams = sharedParams;

    const { callbacks } = this;

    const {
      // Data...
      production,
      technosphere,
      biosphere,
      // Current configuration parameters...
      currentRole,
      currentUser,
    } = sharedParams;

    console.log('[AllocatePage:constructor]', {
      // Data...
      production,
      technosphere,
      biosphere,
      // Current configuration parameters...
      currentRole,
      currentUser,
    });

    // TODO: Init sub-modules...
    const nodes = (this.nodes = new AllocatePageNodes());
    const state = (this.state = new AllocatePageState({
      // Modules...
      nodes,
      // Data...
      production,
      technosphere,
      biosphere,
      // Current configuration parameters...
      currentUser,
      currentRole,
    }));

    state.setInited();
  }
}
