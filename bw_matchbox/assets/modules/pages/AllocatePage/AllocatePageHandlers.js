// @ts-check

import * as CommonHelpers from '../../common/CommonHelpers.js';

// Import only types...
/* eslint-disable no-unused-vars */
import { AllocatePageNodes } from './AllocatePageNodes.js';
/* eslint-enable no-unused-vars */

/**
 * @implements {TAllocatePageHandlers}
 */
export class AllocatePageHandlers {
  // Modules...
  /** type {AllocatePageNodes} */
  nodes;
  /** type {AllocatePageState} */
  state;
  /** type {AllocatePageRender} */
  render;

  /**
   * @constructor
   * @param {object} params
   * @param {AllocatePageNodes} params.nodes
   * @param {AllocatePageState} params.state
   * @param {AllocatePageRender} params.render
   * @param {TSharedHandlers} params.callbacks
   */
  constructor(params) {
    // Modules...
    this.nodes = params.nodes;
    this.state = params.state;
    this.render = params.render;
    // Export all methods as external handlers...
    CommonHelpers.exportCallbacksFromInstance(params.callbacks, this);
    // TODO: Save callbacks for future use?
  }

  expandAllGroups() {
    const { state } = this;
    console.log('[AllocatePageHandlers:expandAllGroups]', {
      state,
    });
    debugger;
  }

  /** @param {PointerEvent} event */
  expandGroup(event) {
    const node = /** @type {HTMLElement} */ (event.currentTarget);
    const groupNode = node.closest('.group');
    /* // DEBUG
     * const { state } = this;
     * const groupId = Number(groupNode && groupNode.getAttribute('group-id'))
     * console.log('[AllocatePageHandlers:expandAllGroups]', {
     *   groupNode,
     *   groupId,
     *   state,
     *   node,
     * });
     */
    groupNode.classList.toggle('expanded');
  }

  // TODO: removeGroup

  confirmGroups() {
    const { state } = this;
    console.log('[AllocatePageHandlers:confirmGroups]', {
      state,
    });
    debugger;
  }

  addNewGroup() {
    const { state } = this;
    console.log('[AllocatePageHandlers:addNewGroup]', {
      state,
    });
    debugger;
  }
}
