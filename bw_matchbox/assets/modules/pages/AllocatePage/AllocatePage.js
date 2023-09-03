// @ts-check

import { useDebug } from '../../common/CommonConstants.js';

import { AllocatePageNodes } from './AllocatePageNodes.js';
import { AllocatePageState } from './AllocatePageState.js';
import { AllocatePageRender } from './AllocatePageRender.js';
import { AllocatePageHandlers } from './AllocatePageHandlers.js';
import { AllocatePageUpdaters } from './AllocatePageUpdaters.js';

export class AllocatePage {
  /** Handlers exchange object
   * @type {TSharedHandlers}
   */
  callbacks = {};

  /** @constructor
   * @param {TSharedParams} sharedParams
   */
  constructor(sharedParams) {
    // Will be initialized in `handlers` instance...
    const { callbacks } = this;

    const {
      rootNode,
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
      nodes,
      state,
      callbacks,
    });
    const updaters = new AllocatePageUpdaters({
      nodes,
      state,
      render,
    });
    const _handlers = new AllocatePageHandlers({
      nodes,
      state,
      render,
      updaters,
      callbacks,
    });

    render.renderAllData();
    render.initActionHandlers();
    updaters.setInited();
    updaters.setLoading(false);
  }
}
