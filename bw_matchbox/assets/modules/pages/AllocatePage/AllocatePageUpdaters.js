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
  /** @type {AllocatePageNodes} */
  nodes;
  /** @type {AllocatePageState} */
  state;

  /** @type TSharedHandlers} */
  callbacks;

  /** @constructor
   * @param {object} params
   * @param {AllocatePageNodes} params.nodes
   * @param {AllocatePageState} params.state
   * @param {TSharedHandlers} params.callbacks
   */
  constructor(params) {
    // Modules...
    this.nodes = params.nodes;
    this.state = params.state;
    this.callbacks = params.callbacks;
    // Export all methods as external handlers...
    CommonHelpers.exportCallbacksFromInstance(params.callbacks, this);
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
    // eslint-disable-next-line no-console
    console.error('[AllocatePageState:setError]', {
      text,
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

  // State updaters...

  /** @param {TLocalGroupId} groupId */
  updateGroupProps(groupId) {
    const { nodes, state } = this;
    const groupNode = nodes.getGroupNode(groupId);
    if (groupNode) {
      const { groups } = state;
      const group = groups.find(({ localId }) => localId === groupId);
      if (!group) {
        throw new Error(`Not found group for group id "${groupId}"`);
      }
      const { items, name } = group;
      const itemsCount = items.length;
      const hasItems = !!itemsCount;
      groupNode.classList.toggle('empty', !hasItems);
      if (!hasItems) {
        groupNode.classList.remove('expanded');
      }
      const countNode = groupNode.querySelector('#group-items-count');
      countNode.innerHTML = String(itemsCount || 'empty');
      const nameNode = groupNode.querySelector('#group-name');
      nameNode.innerHTML = name;
    }
  }

  updateGroupsState() {
    const { nodes, state } = this;
    const { groups } = state;
    const groupsCount = groups.length;
    // Get only ungrouped items...
    const rootNode = nodes.getRootNode();
    const statisticsNode = nodes.getStatisticsNode();
    const groupsCountItems = statisticsNode.querySelectorAll('#groups-count');
    const hasGroups = !!groupsCount;
    rootNode.classList.toggle('has-groups', hasGroups);
    if (groupsCountItems.length) {
      groupsCountItems.forEach((countNode) => {
        countNode.innerHTML = String(groupsCount);
      });
    }
    // Update buttons...
    const toolbarNode = nodes.getGroupsToolbarNode();
    const expandAllGroups = toolbarNode.querySelector('[action-id=expandAllGroups]');
    expandAllGroups.classList.toggle('disabled', !hasGroups);
    const confirmGroups = toolbarNode.querySelector('[action-id=confirmGroups]');
    confirmGroups.classList.toggle('disabled', !hasGroups);
  }

  /** @param {TAllocationType} type */
  updateInputTableState(type) {
    const { nodes, state } = this;
    // Get only ungrouped items...
    const visibleData = state[type].filter((item) => !item.inGroup);
    const visibleCount = visibleData.length;
    const rootNode = nodes.getRootNode();
    const statisticsNode = nodes.getStatisticsNode();
    const statisticsItems = statisticsNode.querySelectorAll('#' + type + '-count');
    rootNode.classList.toggle('has-' + type + '-data', !!visibleCount);
    if (statisticsItems.length) {
      statisticsItems.forEach((countNode) => {
        countNode.innerHTML = String(visibleCount);
      });
    }
  }

  // Groups...

  /** Restore grouped item in one of input tables.
   * @param {TAllocationData} item
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate]
   */
  restoreGroupedItemToInputs(item, opts = {}) {
    const { nodes, state } = this;
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
    // const inputsListNode = nodes.getInputsListNode(type);
    const inputNode = nodes.getInputNode(item); // inputsListNode && inputsListNode.querySelector('.input-row[data-id="' + id + '"]');
    console.log('[AllocatePageUpdaters:restoreGroupedItemToInputs]', {
      inputData,
      // inputsListNode,
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
      this.updateInputTableState(type);
    }
  }

  /**
   * @param {TLocalGroupId} groupId
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate]
   */
  removeGroupUpdater(groupId, opts = {}) {
    const { nodes, state } = this;
    const { groups } = state;
    const groupNode = nodes.getGroupNode(groupId);
    const groupIdx = groups.findIndex(({ localId }) => localId === groupId);
    const groupData = groupIdx !== -1 ? groups[groupIdx] : undefined;
    /* console.log('[AllocatePageUpdaters:removeGroupUpdater]', {
     *   groupData,
     *   groupIdx,
     *   groupNode,
     *   groupId,
     *   groups,
     * });
     */
    // Restore items in input source tables...
    if (groupData) {
      const { items } = groupData;
      // Restore all the items...
      items.forEach((item) => {
        this.restoreGroupedItemToInputs(item, { omitUpdate: true });
      });
      // Update all the affected input lists...
      const typesSet = new Set(items.map(({ type }) => type));
      Array.from(typesSet).forEach((type) => {
        this.updateInputTableState(type);
      });
    }
    // remove dom node...
    if (groupNode) {
      groupNode.remove();
    }
    // Remove data item...
    if (groupIdx !== -1) {
      groups.splice(groupIdx, 1);
    }
    /* console.log('[AllocatePageUpdaters:removeGroupUpdater]: done', {
     *   groupData,
     *   groupIdx,
     *   groupNode,
     *   groupId,
     *   groups,
     * });
     */
    if (!opts.omitUpdate) {
      this.updateGroupsState();
    }
  }

  /**
   * @param {object} params
   * @param {TLocalGroupId} params.groupId
   * @param {TAllocationId} params.itemId
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate]
   */
  removeGroupItemUpdater(params, opts = {}) {
    const { groupId, itemId } = params;
    const { state } = this;
    const { groups } = state;
    const group = groups.find(({ localId }) => localId === groupId);
    if (!group) {
      throw new Error(`Not found group for group id "${groupId}"`);
    }
    const { items } = group;
    const itemPos = items.findIndex((item) => item.id === itemId);
    if (itemPos === -1) {
      throw new Error(`Not found item for id "${itemId}"`);
    }
    const item = items[itemPos];
    console.log('[AllocatePageUpdaters:removeGroupItemUpdater]', {
      groupId,
      itemId,
      group,
      item,
    });
    this.restoreGroupedItemToInputs(item, { omitUpdate: true });
    // Remove item from list...
    items.splice(itemPos, 1);
    if (!opts.omitUpdate) {
      this.updateInputTableState(item.type);
      this.updateGroupsState();
      this.updateGroupProps(groupId);
    }
  }

  /** @param {TLocalGroupId} groupId */
  editGroupUpdater(groupId) {
    const { nodes, state } = this;
    const { groups } = state;
    const groupNode = nodes.getGroupNode(groupId);
    const groupIdx = groups.findIndex(({ localId }) => localId === groupId);
    const groupData = groups[groupIdx];
    console.log('[AllocatePageUpdaters:editGroupUpdater]', {
      groupData,
      groupIdx,
      groupNode,
      groupId,
      groups,
    });
    debugger;
  }

  /** @param {TAllocationGroup} group */
  addNewGroupUpdater(group) {
    this.state.addNewGroup(group);
    // TODO: Update data?
  }
}