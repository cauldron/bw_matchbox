// @ts-check

import * as CommonHelpers from '../../common/CommonHelpers.js';
import { commonNotify } from '../../common/CommonNotify.js';
import { commonIndicators } from '../../common/CommonIndicators.js';

import { AllocatePageGroupEditor } from './AllocatePageGroupEditor.js';

// Import only types...
/* eslint-disable no-unused-vars */
import { AllocatePageNodes } from './AllocatePageNodes.js';
import { AllocatePageState } from './AllocatePageState.js';
import { AllocatePageRender } from './AllocatePageRender.js';
import { AllocatePageRenderAllocate } from './AllocatePageRenderAllocate.js';
/* eslint-enable no-unused-vars */

/**
 * @class AllocatePageUpdaters
 */
export class AllocatePageUpdaters {
  // Modules...
  /** @type AllocatePageNodes */
  nodes;
  /** @type AllocatePageState */
  state;
  /** @type AllocatePageRender */
  render;
  /** @type AllocatePageRenderAllocate */
  renderAllocate;

  /** @type TSharedHandlers */
  callbacks;

  /** @constructor
   * @param {object} params
   * @param {AllocatePageNodes} params.nodes
   * @param {AllocatePageState} params.state
   * @param {AllocatePageRender} params.render
   * @param {AllocatePageRenderAllocate} params.renderAllocate
   * @param {TSharedHandlers} params.callbacks
   */
  constructor(params) {
    // Modules...
    this.nodes = params.nodes;
    this.state = params.state;
    this.render = params.render;
    this.renderAllocate = params.renderAllocate;
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
    if (text) {
      // eslint-disable-next-line no-console
      console.error('[AllocatePageState:setError]', {
        text,
        error,
        errorNode,
      });
      // TODO: Show multiple toasts for multiple (if got list of) errors?
      commonNotify.showError(text);
    }
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
    const statisticsNode = nodes.getSelectStatisticsNode();
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
  }

  /** @param {TAllocationType} type */
  updateInputTableState(type) {
    const { nodes, state } = this;
    // Get only ungrouped items...
    const visibleData = state[type].filter((item) => !item.inGroup);
    const visibleCount = visibleData.length;
    const rootNode = nodes.getRootNode();
    const statisticsNode = nodes.getSelectStatisticsNode();
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
      commonIndicators.indicate(inputNode, { animate: 'self' });
    }
    if (!opts.omitUpdate) {
      this.updateInputTableState(type);
      this.updateStartAllocationState();
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
      this.updateStartAllocationState();
    }
  }

  /** @param {TLocalGroupId} groupId */
  editGroupUpdater(groupId) {
    const { nodes, state, callbacks } = this;
    const editor = new AllocatePageGroupEditor({ nodes, state, callbacks });
    /* console.log('[AllocatePageUpdaters:editGroupUpdater]', {
     *   groupId,
     * });
     */
    editor
      .startEdit(groupId)
      .then((result) => {
        const {
          groupId, // TLocalGroupId
        } = result;
        /* console.log('[AllocatePageUpdaters:editGroupUpdater]', {
         *   groupId, // TLocalGroupId
         *   result,
         *   editor,
         * });
         */
        this.updateGroupProps(groupId);
      })
      .catch((error) => {
        if (error instanceof Error) {
          // eslint-disable-next-line no-console
          console.error('[AllocatePageUpdaters:editGroupUpdater] error', error, {
            groupId,
            editor,
          });
          // eslint-disable-next-line no-debugger
          debugger;
          this.setError(error);
        } else {
          // eslint-disable-next-line no-console
          console.warn('[AllocatePageUpdaters:editGroupUpdater] warn', error, {
            groupId,
            editor,
          });
        }
      });
  }

  addGroupUpdater() {
    const { state, render } = this;
    const groupId = state.getUniqueGroupId();
    /** @type TAllocationGroup */
    const newGroup = {
      localId: groupId,
      name: 'Group ' + groupId,
      items: [],
    };
    state.groups.push(newGroup);
    const groupNode = render.renderNewGroup(newGroup);
    commonIndicators.indicate(groupNode, { animate: 'curtain' });
    this.editGroupUpdater(groupId);
  }

  /** @return {NodeListOf<HTMLElement>} */
  _getAvailableInputRows() {
    const { nodes } = this;
    const sourcesColumnNode = nodes.getSourcesColumnNode();
    const availableRows = sourcesColumnNode.querySelectorAll(
      '.input-row:not(.in-group, [data-type="production"]',
    );
    return /** @type {NodeListOf<HTMLElement>} */ (availableRows);
  }

  /** Update 'allocation enabled' state */
  updateStartAllocationState() {
    const { nodes } = this;
    const toolbarNode = nodes.getGroupsToolbarNode();
    const startAllocate = toolbarNode.querySelector('[action-id=startAllocate]');
    const availableRows = this._getAvailableInputRows();
    const availableRowsCount = availableRows.length;
    console.log('[AllocatePageUpdaters:updateStartAllocationState]', {
      toolbarNode,
      startAllocate,
      availableRows,
      availableRowsCount,
    });
    startAllocate.classList.toggle('disabled', !!availableRowsCount);
  }

  /**
   * @param {TLocalGroupId} groupId
   * @param {TDragInputItem[]} dragItemsList
   */
  moveInputsToGroup(groupId, dragItemsList) {
    const { nodes, state, render } = this;
    const { groups } = state;
    const rootNode = nodes.getRootNode();
    rootNode.classList.toggle('has-moved-inputs');
    const groupNode = nodes.getGroupNode(groupId);
    // Expand node...
    groupNode.classList.toggle('expanded', true);
    const groupData = groups.find(({ localId }) => localId === groupId);
    const { items } = groupData;
    console.log('[AllocatePageUpdaters:moveInputsToGroup]: start', {
      items,
      groupData,
      groupId,
      dragItemsList,
    });
    /** @type TAllocationType[] */
    const affectedTypes = [];
    dragItemsList.forEach(({ type, id }) => {
      const inputsList = state[type];
      const inputItem = inputsList && inputsList.find((item) => item.id === id);
      const inputNode = inputItem && nodes.getInputNode(inputItem);
      console.log('[AllocatePageUpdaters:moveInputsToGroup]: item', {
        inputNode,
        inputItem,
        inputsList,
        type,
        id,
        groupId,
      });
      if (!affectedTypes[type]) {
        affectedTypes.push(type);
      }
      inputItem.inGroup = groupId;
      inputNode.classList.toggle('in-group', true);
      inputNode.setAttribute('data-in-group', String(groupId));
      items.push(inputItem);
      const newNode = render.renderNewGroupContentItem(groupData, inputItem);
      commonIndicators.indicate(newNode, { animate: 'curtain' });
    });
    console.log('[AllocatePageUpdaters:moveInputsToGroup]: done', {
      affectedTypes,
      items,
      groupData,
      groupId,
      dragItemsList,
    });
    // Update groups & inputs...
    this.updateGroupsState();
    this.updateGroupProps(groupId);
    affectedTypes.forEach((type) => {
      this.updateInputTableState(type);
    });
    // Update 'allocate' button state...
    this.updateStartAllocationState();
  }

  // Allocate mode...

  /**
   * @param {HTMLInputElement} inputNode
   */
  getAllocateModeFractionValueProps(inputNode) {
    const id = inputNode.getAttribute('id');
    const productionId = /** @type TAllocationId */ (Number(inputNode.getAttribute('data-production-id')));
    const groupId = /** @type TAllocationId */ (Number(inputNode.getAttribute('data-group-id')));
    const value = Number(inputNode.value);
    return {
      id,
      productionId,
      groupId,
      value,
    };
  }

  /** Check if value is correct?
   * @param {number} value
   * @return boolean
   */
  checkAllocateModeFractionValue(value) {
    if (value < 0) {
      return false;
    }
    if (value > 1) {
      return false;
    }
    return true;
  }

  /** Check the value only when user finished changing it
   * @param {HTMLInputElement} inputNode
   */
  checkAllocateModeFractionValueOnChange(inputNode) {
    const { id, value, productionId, groupId } = this.getAllocateModeFractionValueProps(inputNode);
    console.log('[AllocatePageUpdaters:checkAllocateModeFractionValueOnChange]', {
      id,
      productionId,
      groupId,
      value,
      inputNode,
    });
  }

  /** Check the value after each small change
   * @param {HTMLInputElement} inputNode
   */
  checkAllocateModeFractionValueOnInput(inputNode) {
    const { id, value, productionId, groupId } = this.getAllocateModeFractionValueProps(inputNode);
    console.log('[AllocatePageUpdaters:checkAllocateModeFractionValueOnInput]', {
      id,
      productionId,
      groupId,
      value,
      inputNode,
    });
  }

  updateAllocateModeInputNodes() {
    const { nodes, callbacks } = this;
    const {
      handleAllocateFractionValueChange,
      handleAllocateFractionValueInput,
      // handleAllocateFractionValueBlur, // ???
    } = callbacks;
    const contentContainerNode = nodes.getAllocateModeContentContainerNode();
    const allocateFractionInputs = contentContainerNode.querySelectorAll('.group-fraction input');
    allocateFractionInputs.forEach((input) => {
      if (handleAllocateFractionValueChange) {
        input.removeEventListener('change', handleAllocateFractionValueChange);
        input.addEventListener('change', handleAllocateFractionValueChange);
      }
      if (handleAllocateFractionValueInput) {
        input.removeEventListener('input', handleAllocateFractionValueInput);
        input.addEventListener('input', handleAllocateFractionValueInput);
      }
    });
  }

  updateAllocateModeDomNodes() {
    const { nodes } = this;
    const rootNode = nodes.getRootNode();
    rootNode.classList.toggle('allocate-mode', true);
    const allocateLayout = nodes.getAllocateModeLayoutNode();
    allocateLayout.classList.toggle('common-hidden', false);
    this.updateAllocateModeInputNodes();
  }

  backFromAllocateModeDomNodes() {
    const { nodes } = this;
    const rootNode = nodes.getRootNode();
    rootNode.classList.toggle('allocate-mode', false);
  }

  createDefaultAllocationFractions() {
    const { state } = this;
    const { production, groups } = state;
    const productionIds = production.map(({ id }) => id);
    const groupIds = groups.map(({ localId }) => localId);
    /** @type TAllocationFractions */
    const fractions = groupIds.reduce((fractions, groupId) => {
      /** @type TAllocationFractionsGroup */
      const fractionsGroup = productionIds.reduce((fractionsProduction, productionId, idx) => {
        const isLast = idx === productionIds.length - 1;
        const value = isLast ? 1 : 0;
        fractionsProduction[productionId] = value;
        return fractionsProduction;
      }, {});
      fractions[groupId] = fractionsGroup;
      return fractions;
    }, {});
    // Save result data...
    state.fractions = fractions;
  }

  resetAllocationFractions() {
    const { state } = this;
    state.fractions = undefined;
  }

  resetAllocateMode() {
    this.clearError();
  }

  // Start allocate...
  startAllocateMode() {
    const { renderAllocate } = this;
    this.resetAllocateMode();
    this.createDefaultAllocationFractions();
    renderAllocate.renderAllocateNodes();
    this.updateAllocateModeDomNodes();
  }

  // Return from allocate...
  backFromAllocateMode() {
    const { renderAllocate } = this;
    this.backFromAllocateModeDomNodes();
    renderAllocate.clearAllocateNodes();
    this.resetAllocateMode();
    this.resetAllocationFractions();
  }
}
