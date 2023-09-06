// @ts-check

import * as CommonHelpers from '../../common/CommonHelpers.js';

// Import only types...
/* eslint-disable no-unused-vars */
import { AllocatePageNodes } from './AllocatePageNodes.js';
// import { AllocatePageRender } from './AllocatePageRender.js';
import { AllocatePageUpdaters } from './AllocatePageUpdaters.js';
import { AllocatePageState } from './AllocatePageState.js';
/* eslint-enable no-unused-vars */

const dragInputsType = 'application/drag-inputs';

/** Update dragging state timeout */
const dragUpdateTimeout = 100;

/**
 * @class AllocatePageInputsDragger
 */
export class AllocatePageInputsDragger {
  // Modules...
  /** @type {AllocatePageNodes} */
  nodes;
  /** @type {AllocatePageState} */
  state;
  /** @type {AllocatePageUpdaters} */
  updaters;

  /** @type HTMLElement */
  dragGroupNode;
  /** @type TSetTimeout */
  dragUpdateHandler;

  /** @constructor
   * @param {object} params
   * @param {AllocatePageNodes} params.nodes
   * @param {AllocatePageState} params.state
   * @param {AllocatePageUpdaters} params.updaters
   * @param {TSharedHandlers} params.callbacks
   */
  constructor(params) {
    // Modules...
    this.nodes = params.nodes;
    this.state = params.state;
    this.updaters = params.updaters;
    // Export all methods as external handlers...
    CommonHelpers.exportCallbacksFromInstance(params.callbacks, this);
  }

  // Helpers...

  _dragUpdate = () => {
    this._cancelDragUpdate();
    const { dragGroupNode, nodes } = this;
    const groupNodes = nodes.getGroupNodes(); // groupListNode.querySelectorAll('.group');
    groupNodes.forEach((node) => {
      const isDragging = node === dragGroupNode;
      node.classList.toggle('dragging', isDragging);
    });
  };

  _cancelDragUpdate() {
    if (this.dragUpdateHandler) {
      clearTimeout(this.dragUpdateHandler);
      this.dragUpdateHandler = undefined;
    }
  }

  /** @param {HTMLElement} [node] */
  _setDragUpdate(node) {
    this.dragGroupNode = node;
    if (node) {
      node.classList.toggle('dragging', true);
    }
    this.dragUpdateHandler = setTimeout(this._dragUpdate, dragUpdateTimeout);
  }

  _clearAllSelectedItems() {
    const { nodes } = this;
    const sourcesColumnNode = nodes.getSourcesColumnNode();
    const selectedRows = sourcesColumnNode.querySelectorAll('.input-row.selected');
    selectedRows.forEach((node) => {
      node.classList.toggle('selected', false);
    });
  }

  /** @return {TDragInputItem[]} */
  _getSelectedItemsListToDrag() {
    const { nodes } = this;
    const sourcesColumnNode = nodes.getSourcesColumnNode();
    const selectedRows = sourcesColumnNode.querySelectorAll('.input-row.selected');
    const selectedRowsList = Array.from(selectedRows);
    /** @type {TDragInputItem[]} */
    const itemsList = selectedRowsList.map((node) => {
      const id = /** @type TAllocationId */ Number(node.getAttribute('data-id'));
      const type = /** @type TAllocationType */ (node.getAttribute('data-type'));
      /** @type {TDragInputItem} */
      const item = { type, id };
      return item;
    });
    return itemsList;
  }

  // Public handlers...

  /** @param {DragEvent} event */
  checkGroupDragEvent(event) {
    const { dataTransfer } = event;
    const dragTypes = dataTransfer.types;
    return dragTypes.includes(dragInputsType);
  }

  /** @param {DragEvent} event */
  handleGroupDragDrop(event) {
    const {
      // prettier-ignore
      dataTransfer,
      currentTarget,
    } = event;
    if (!this.checkGroupDragEvent(event)) {
      // Wrong drag type: do nothing
      return;
    }
    event.preventDefault();
    const { updaters } = this;
    const dragItemsListJson = dataTransfer.getData(dragInputsType);
    const dragItemsList = /** @type TDragInputItem[] */ (JSON.parse(dragItemsListJson));
    const node = /** @type HTMLElement */ (currentTarget);
    // node.classList.toggle('dragging', false);
    this._setDragUpdate(undefined);
    const groupId = /** @type TLocalGroupId */ Number(node.getAttribute('data-group-id'));
    console.log('[AllocatePageInputsDragger:handleGroupDragDrop]', {
      groupId,
      dragItemsList,
      dragItemsListJson,
      node,
      dataTransfer,
      event,
    });
    this._clearAllSelectedItems();
    updaters.moveInputsToGroup(groupId, dragItemsList);
  }

  /** @param {DragEvent} event */
  handleGroupDragEnter(event) {
    const {
      // prettier-ignore
      dataTransfer,
      currentTarget,
    } = event;
    event.preventDefault();
    if (!this.checkGroupDragEvent(event)) {
      // Wrong drag type: do nothing
      return;
    }
    const node = /** @type HTMLElement */ (currentTarget);
    // node.classList.toggle('dragging', true);
    this._setDragUpdate(node);
    console.log('[AllocatePageInputsDragger:handleGroupDragEnter]', {
      node,
      event,
    });
    dataTransfer.dropEffect = 'move';
  }

  /** @param {DragEvent} event */
  handleGroupDragLeave(event) {
    const {
      // prettier-ignore
      currentTarget,
    } = event;
    event.preventDefault();
    if (!this.checkGroupDragEvent(event)) {
      // Wrong drag type: do nothing
      return;
    }
    const node = /** @type HTMLElement */ (currentTarget);
    this._setDragUpdate(undefined);
    // node.classList.toggle('dragging', false);
    console.log('[AllocatePageInputsDragger:handleGroupDragLeave]', {
      node,
      event,
    });
  }

  /** @param {DragEvent} event */
  handleGroupDragOver(event) {
    const {
      // prettier-ignore
      dataTransfer,
      currentTarget,
    } = event;
    event.preventDefault();
    if (!this.checkGroupDragEvent(event)) {
      // Wrong drag type: do nothing
      return;
    }
    const node = /** @type HTMLElement */ (currentTarget);
    // node.classList.toggle('dragging', true);
    this._setDragUpdate(node);
    console.log('[AllocatePageInputsDragger:handleGroupDragOver]', {
      dataTransfer,
      node,
      event,
    });
    dataTransfer.dropEffect = 'move';
  }

  /** @param {DragEvent} event */
  handleGroupDragEnd(event) {
    const {
      // prettier-ignore
      dataTransfer,
      currentTarget,
    } = event;
    console.log('[AllocatePageInputsDragger:handleGroupDragEnd] before', {
      dataTransfer,
      event,
      currentTarget,
    });
    if (!this.checkGroupDragEvent(event)) {
      // Wrong drag type: do nothing
      return;
    }
    event.preventDefault();
    // const { nodes } = this;
    // const groupNodes = nodes.getGroupNodes(); // groupListNode.querySelectorAll('.group');
    // groupNodes.forEach((node) => {
    //   node.classList.toggle('dragging', false);
    // });
    // const node = [>* @type HTMLElement <] (currentTarget);
    this._setDragUpdate(undefined);
    console.log('[AllocatePageInputsDragger:handleGroupDragEnd]', {
      dataTransfer,
      event,
    });
    dataTransfer.dropEffect = 'move';
  }

  /** @param {DragEvent} event */
  handleInputTableDragStart(event) {
    // event.preventDefault();
    const {
      // prettier-ignore
      dataTransfer,
      currentTarget,
    } = event;
    const node = /** @type HTMLElement */ (currentTarget);
    const isSelected = node.classList.contains('selected');
    console.log('[AllocatePageInputsDragger:handleInputTableDragStart] start', {
      isSelected,
      dragInputsType,
      node,
      dataTransfer,
      currentTarget,
      event,
    });
    // Drag only selected nodes!
    if (!isSelected) {
      event.preventDefault();
      return false;
    }
    /* // UNUSED: Move only one item
     * const id = [>* @type TAllocationId <] Number(node.getAttribute('data-id'));
     * const type = [>* @type TAllocationType <] (node.getAttribute('data-type'));
     * [>* @type TDragInputItem <]
     * const dragItem = { type, id };
     * const dragItemsList = [dragItem];
     */
    // Move all the selected items...
    const selectedItems = this._getSelectedItemsListToDrag();
    const dragItemsListJson = JSON.stringify(selectedItems);
    dataTransfer.setData(dragInputsType, dragItemsListJson);
    console.log('[AllocatePageInputsDragger:handleInputTableDragStart]', {
      dragInputsType,
      /* // Single items:
       * id,
       * type,
       * dragItem,
       * dragItemsList,
       */
      // All items:
      selectedItems,
      dragItemsListJson,
      node,
      dataTransfer,
      currentTarget,
      event,
    });
  }
}
