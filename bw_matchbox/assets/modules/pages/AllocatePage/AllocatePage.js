// @ts-check

import { useDebug } from '../../common/CommonConstants.js';

import { AllocatePageNodes } from './AllocatePageNodes.js';
import { AllocatePageState } from './AllocatePageState.js';
import { AllocatePageRender } from './AllocatePageRender.js';
import { AllocatePageRenderAllocate } from './AllocatePageRenderAllocate.js';
import { AllocatePageHandlers } from './AllocatePageHandlers.js';
import { AllocatePageInputsDragger } from './AllocatePageInputsDragger.js';
import { AllocatePageUpdaters } from './AllocatePageUpdaters.js';
import { AllocatePageAllocateModeUpdaters } from './AllocatePageAllocateModeUpdaters.js';

/** Use sample group by default */
const createDefaultGroup = true;
const defaultGroupName = 'Group name';
/** @type TLocalGroupId */
const defaultGroupId = 1;
/** DEBUG: Add demo item to default group for debugging */
const addSampeItemToDebugGroup = false;
const addAllInputsToDebugGroup = false;
const useSecondDebugGroup = false;

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
      processId,
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
        if (useSecondDebugGroup) {
          // DEBUG: Add some inputs to the second group...
          /** @type TLocalGroupId */
          const secondGroupId = defaultGroupId + 1;
          /** @type TAllocationGroup */
          const secondGroup = {
            name: 'Second group',
            localId: secondGroupId,
            items: defaultGroup.items.splice(0, 1),
          };
          secondGroup.items.forEach((item) => {
            item.inGroup = secondGroupId;
          });
          groups.push(secondGroup);
        }
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
      processId,
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
      processId,
      currentUser,
      currentRole,
    });
    const render = new AllocatePageRender({
      nodes,
      state,
      callbacks,
    });
    const renderAllocate = new AllocatePageRenderAllocate({
      nodes,
      state,
      callbacks,
    });
    const updaters = new AllocatePageUpdaters({
      nodes,
      state,
      render,
      renderAllocate,
      callbacks,
    });
    const allocateModeUpdaters = new AllocatePageAllocateModeUpdaters({
      nodes,
      state,
      render,
      renderAllocate,
      updaters,
      callbacks,
    });
    // eslint-disable-next-line no-unused-vars
    const handlers = new AllocatePageHandlers({
      nodes,
      state,
      updaters,
      allocateModeUpdaters,
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
    renderAllocate.initActionHandlers();
    updaters.updateStartAllocationState();
    updaters.setInited();
    updaters.setLoading(false);
  }
}
