// @ts-check

import * as CommonHelpers from '../../common/CommonHelpers.js';
// import { commonIndicators } from '../../common/CommonIndicators.js';

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

  // Dragging groups...

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
    const id = /** @type TAllocationId */ Number(node.getAttribute('data-id'));
    const type = /** @type TAllocationType */ (node.getAttribute('data-type'));
    /** @type TDragInputItem */
    const dragItem = { type, id };
    const dragItemsList = [dragItem];
    const dragItemsListJson = JSON.stringify(dragItemsList);
    dataTransfer.setData(dragInputsType, dragItemsListJson);
    /* console.log('[AllocatePageInputsDragger:handleInputTableDragStart]', {
     *   dragInputsType,
     *   dragItem,
     *   dragItemsList,
     *   dragItemsListJson,
     *   id,
     *   type,
     *   node,
     *   dataTransfer,
     *   currentTarget,
     *   event,
     * });
     */
  }
}
