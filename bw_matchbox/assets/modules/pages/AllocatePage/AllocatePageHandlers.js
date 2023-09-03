// @ts-check

import * as CommonHelpers from '../../common/CommonHelpers.js';

// Import only types...
/* eslint-disable no-unused-vars */
import { AllocatePageNodes } from './AllocatePageNodes.js';
import { AllocatePageRender } from './AllocatePageRender.js';
import { AllocatePageUpdaters } from './AllocatePageUpdaters.js';
import { AllocatePageState } from './AllocatePageState.js';
/* eslint-enable no-unused-vars */

/**
 * @class AllocatePageHandlers
 */
export class AllocatePageHandlers {
  // Modules...
  /** type {AllocatePageNodes} */
  nodes;
  /** type {AllocatePageState} */
  state;
  /** type {AllocatePageRender} */
  render;
  /** type {AllocatePageUpdaters} */
  updaters;

  /** @constructor
   * @param {object} params
   * @param {AllocatePageNodes} params.nodes
   * @param {AllocatePageState} params.state
   * @param {AllocatePageRender} params.render
   * @param {AllocatePageUpdaters} params.updaters
   * @param {TSharedHandlers} params.callbacks
   */
  constructor(params) {
    // Modules...
    this.nodes = params.nodes;
    this.state = params.state;
    this.render = params.render;
    this.updaters = params.updaters;
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
     * console.log('[AllocatePageHandlers:expandGroup]', {
     *   groupNode,
     *   groupId,
     *   state,
     *   node,
     * });
     */
    groupNode.classList.toggle('expanded');
  }

  /** @param {PointerEvent} event */
  removeGroup(event) {
    const node = /** @type {HTMLElement} */ (event.currentTarget);
    const { updaters } = this;
    const groupNode = node.closest('.group');
    // DEBUG
    const { state } = this;
    const groupId = Number(groupNode && groupNode.getAttribute('group-id'));
    if (isNaN(groupId)) {
      const error = new Error('Not found group node (or group id) to remove!');
      // eslint-disable-next-line no-console
      console.error('[AllocatePageHandlers:removeGroup]', error, {
        groupNode,
        groupId,
        node,
        event,
      });
      // eslint-disable-next-line no-debugger
      debugger;
    }
    console.log('[AllocatePageHandlers:removeGroup]', {
      groupNode,
      groupId,
      state,
      node,
    });
    updaters.removeGroup(groupId);
  }

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
