// @ts-check

import { useDebug } from '../../common/CommonConstants.js';

import { AllocatePageNodes } from './AllocatePageNodes.js';
import { AllocatePageState } from './AllocatePageState.js';
import { AllocatePageRender } from './AllocatePageRender.js';
import { AllocatePageHandlers } from './AllocatePageHandlers.js';

export class AllocatePage {
  /** External data...
   * @type {TSharedParams}
   */
  sharedParams = undefined;

  /** Handlers exchange object
   * @type {TSharedHandlers}
   */
  callbacks = {};

  /* XXX: To store modules?
   * [>* @type {AllocatePageState} <]
   * state;
   * [>* @type {AllocatePageNodes} <]
   * nodes;
   * [>* @type {AllocatePageRender} <]
   * render;
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
    const { rootNode } = sharedParams;

    // Will be initialized in `handlers` instance...
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

    /** @type TAllocationGroup[] */
    const groups = [];

    // DEBUG: Add sample group...
    if (useDebug) {
      const localId = 1;
      const sampleItem = technosphere[0];
      const sampleGroup = {
        name: 'Sample group',
        localId,
        items: [sampleItem],
      };
      sampleItem.inGroup = localId;
      groups.push(sampleGroup);
      console.log('[AllocatePage:constructor] Add sample group', {
        localId,
        sampleItem,
        sampleGroup,
        groups,
      });
    }


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
    const nodes = new AllocatePageNodes({ rootNode });
    const state = new AllocatePageState({
      // Modules...
      nodes,
      // Data...
      groups,
      production,
      technosphere,
      biosphere,
      // Current configuration parameters...
      currentUser,
      currentRole,
    });
    const render = new AllocatePageRender({
      // Modules...
      nodes,
      state,
    });
    const handlers = new AllocatePageHandlers({
      // Modules...
      nodes,
      state,
      render,
      callbacks,
    });
    // updaters

    render.renderAllData();
    state.setInited();
  }
}
