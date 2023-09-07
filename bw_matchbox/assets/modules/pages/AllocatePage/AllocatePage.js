// @ts-check

import { useDebug } from '../../common/CommonConstants.js';

import { AllocatePageNodes } from './AllocatePageNodes.js';
import { AllocatePageState } from './AllocatePageState.js';
import { AllocatePageRender } from './AllocatePageRender.js';
import { AllocatePageHandlers } from './AllocatePageHandlers.js';
import { AllocatePageInputsDragger } from './AllocatePageInputsDragger.js';
import { AllocatePageUpdaters } from './AllocatePageUpdaters.js';

/** Use sample group by default */
const createDefaultGroup = true;
const defaultGroupName = 'Group name';
const defaultGroupId = 1;
/** DEBUG: Add demo item to default group for debugging */
const addSampeItemToDebugGroup = true;
const addAllInputsToDebugGroup = true;

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

    // Add initial group...
    if (createDefaultGroup) {
      /** @type TAllocationGroup */
      const defaultGroup = {
        name: defaultGroupName,
        localId: defaultGroupId,
        items: [],
      };
      groups.push(defaultGroup);
      if (useDebug && addAllInputsToDebugGroup) {
        const allItems = [...technosphere, ...biosphere];
        defaultGroup.items.push.apply(defaultGroup.items, allItems);
        allItems.forEach((item) => {
          item.inGroup = defaultGroupId;
        });
      } else if (useDebug && addSampeItemToDebugGroup && technosphere[0]) {
        const sampleItem = technosphere[0];
        sampleItem.inGroup = defaultGroupId;
        defaultGroup.items.push(sampleItem);
      }
      console.log('[AllocatePage:constructor] Default group', {
        defaultGroupId,
        defaultGroup,
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
      callbacks,
    });
    // eslint-disable-next-line no-unused-vars
    const handlers = new AllocatePageHandlers({
      nodes,
      state,
      updaters,
      callbacks,
    });
    // eslint-disable-next-line no-unused-vars
    const inputsDragger = new AllocatePageInputsDragger({
      nodes,
      state,
      updaters,
      callbacks,
    });

    render.initDomNodes();
    render.renderAllData();
    render.initActionHandlers();
    updaters.updateStartAllocationState();
    updaters.setInited();
    updaters.setLoading(false);
  }
}
