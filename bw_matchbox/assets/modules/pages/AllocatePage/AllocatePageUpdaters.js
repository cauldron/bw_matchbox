// @ts-check

import * as CommonHelpers from '../../common/CommonHelpers.js';
// import { useDebug } from '../../common/CommonConstants.js';

// Import only types...
/* eslint-disable no-unused-vars */
import { AllocatePageNodes } from './AllocatePageNodes.js';
import { AllocatePageRender } from './AllocatePageRender.js';
import { AllocatePageState } from './AllocatePageState.js';
/* eslint-enable no-unused-vars */

/**
 * @class AllocatePageUpdaters
 */
export class AllocatePageUpdaters {
  // Modules...
  /** type {AllocatePageNodes} */
  nodes;
  /** type {AllocatePageState} */
  state;
  /** type {AllocatePageRender} */
  render;

  /** @constructor
   * @param {object} params
   * @param {AllocatePageNodes} params.nodes
   * @param {AllocatePageState} params.state
   * @param {AllocatePageRender} params.render
   */
  constructor(params) {
    // Modules...
    this.nodes = params.nodes;
    this.state = params.state;
    this.render = params.render;
  }

  // Basic state...

  /**
   * @param {boolean} isLoading
   */
  setLoading(isLoading) {
    const rootNode = this.nodes.getRootNode();
    rootNode.classList.toggle('loading', !!isLoading);
  }

  /** setError -- Set and show error.
   * @param {string|Error|string[]|Error[]} error - Error or errors list.
   */
  setError(error) {
    const hasErrors = !!error;
    const rootNode = this.nodes.getRootNode();
    rootNode.classList.toggle('has-error', hasErrors);
    // Show error...
    const text = CommonHelpers.getErrorText(error);
    const errorNode = this.nodes.getErrorNode();
    console.error('[AllocatePageState:setError]', {
      error,
      errorNode,
    });
    if (errorNode) {
      errorNode.innerHTML = text;
    }
  }

  clearError() {
    this.setError(undefined);
  }

  setInited() {
    // Set initialized state...
    const rootNode = this.nodes.getRootNode();
    rootNode.classList.toggle('inited', true);
    const columnsLayout = this.nodes.getColumnsLayoutNode();
    columnsLayout.classList.toggle('common-hidden', false);
  }

  // Groups...

  /** Restore grouped item in one of input tables.
   * @param {TAllocationData} item
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate]
   */
  restoreGroupedItemToInputs(item, opts = {}) {
    const { nodes, state, render } = this;
    const {
      id, // TAllocationId;
      type, // TAllocationType; // 'technosphere'
      amount, // number; // 0.06008158208572887
      input, // TAllocationRecord; // {name: 'Clay-Williams', unit: 'kilogram', location: 'GLO', product: 'LLC', categories: 'Unknown'}
      output, // TAllocationRecord; // {name: 'Smith LLC', unit: 'kilogram', location: 'GLO', product: 'Inc', categories: 'Unknown'}
      inGroup, // TLocalGroupId; // Local data: input data is in group (should not be displayed in source data, but in group)
    } = item;
    const inputsList = state[type];
    const inputData = inputsList && inputsList.find((item) => item.id === id);
    // const sourcesColumnNode = nodes.getSourcesColumnNode();
    const inputsListNode = nodes.getInputsListNode(type);
    const inputNode =
      inputsListNode && inputsListNode.querySelector('.input-row[data-id="' + id + '"]');
    console.log('[AllocatePageUpdaters:restoreGroupedItemToInputs]', {
      inputData,
      inputsListNode,
      inputNode,
      inputsList,
      id, // TAllocationId;
      type, // TAllocationType; // 'technosphere'
      amount, // number; // 0.06008158208572887
      input, // TAllocationRecord; // {name: 'Clay-Williams', unit: 'kilogram', location: 'GLO', product: 'LLC', categories: 'Unknown'}
      output, // TAllocationRecord; // {name: 'Smith LLC', unit: 'kilogram', location: 'GLO', product: 'Inc', categories: 'Unknown'}
      inGroup, // TLocalGroupId; // Local data: input data is in group (should not be displayed in source data, but in group)
    });
    if (inputData) {
      inputData.inGroup = undefined;
    }
    if (inputNode) {
      inputNode.classList.remove('in-group');
      inputNode.removeAttribute('data-in-group');
    }
    if (!opts.omitUpdate) {
      render.updateInputTableState(type);
    }
  }

  /** @param {TLocalGroupId} groupId */
  removeGroup(groupId) {
    const { nodes, state, render } = this;
    const { groups } = state;
    const groupsListNode = nodes.getGroupsListNode();
    const groupNode = groupsListNode.querySelector('.group[group-id="' + groupId + '"]');
    const groupIdx = groups.findIndex(({ localId }) => localId === groupId);
    const groupData = groups[groupIdx];
    console.log('[AllocatePageUpdaters:removeGroup]', {
      groupData,
      groupIdx,
      groupNode,
      groupId,
      groupsListNode,
    });
    if (groupData) {
      const { items } = groupData;
      // Restore all the items...
      items.forEach((item) => {
        this.restoreGroupedItemToInputs(item, { omitUpdate: true });
      });
      // Update all the affected input lists...
      const typesSet = new Set(items.map(({ type }) => type));
      Array.from(typesSet).forEach((type) => {
        render.updateInputTableState(type);
      });
    }
    if (groupNode) {
      groupNode.remove();
    }
    render.updateGroupsState();
  }

  /** @param {TAllocationGroup} group */
  addNewGroup(group) {
    this.state.addNewGroup(group);
    // TODO: Update data?
  }
}
