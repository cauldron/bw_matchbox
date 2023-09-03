// @ts-check

import * as CommonHelpers from '../../common/CommonHelpers.js';

import * as AllocatePageHelpers from './AllocatePageHelpers.js';

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
  /** @type {AllocatePageNodes} */
  nodes;
  /** @type {AllocatePageUpdaters} */
  updaters;

  /** @constructor
   * @param {object} params
   * @param {AllocatePageNodes} params.nodes
   * @param {AllocatePageUpdaters} params.updaters
   * @param {TSharedHandlers} params.callbacks
   */
  constructor(params) {
    // Modules...
    this.nodes = params.nodes;
    this.updaters = params.updaters;
    // Export all methods as external handlers...
    CommonHelpers.exportCallbacksFromInstance(params.callbacks, this);
  }

  /** @param {PointerEvent} event */
  expandGroup(event) {
    const node = /** @type {HTMLElement} */ (event.currentTarget);
    const groupNode = node.closest('.group');
    /* // DEBUG
     * const groupId = Number(groupNode && groupNode.getAttribute('group-id'))
     * console.log('[AllocatePageHandlers:expandGroup]', {
     *   groupNode,
     *   groupId,
     *   node,
     * });
     */
    groupNode.classList.toggle('expanded');
  }

  expandAllGroups() {
    const { nodes } = this;
    const groupsListNode = nodes.getGroupsListNode();
    const groupNodes = groupsListNode.querySelectorAll('.group:not(.hidden)');
    const groupNodesList = Array.from(groupNodes);
    const allCount = groupNodesList.length;
    const expandedGroups = groupNodesList.filter((node) => node.classList.contains('expanded'));
    const expandedCount = expandedGroups.length;
    const isCollapsed = !expandedCount;
    const isExpanded = !isCollapsed && expandedCount === allCount;
    const isSome = !isCollapsed && !isExpanded;
    const isAll = !isSome;
    const setExpanded = isAll ? !isExpanded : false;
    /* console.log('[GroupCommentsHandlers:expandAllGroups]', {
     *   groupsListNode,
     *   groupNodes,
     *   groupNodesList,
     *   allCount,
     *   expandedGroups,
     *   expandedCount,
     *   isCollapsed,
     *   isExpanded,
     *   isSome,
     *   isAll,
     *   setExpanded,
     * });
     */
    groupNodesList.forEach((node) => {
      node.classList.toggle('expanded', setExpanded);
    });
  }

  /** @param {PointerEvent} event */
  removeGroup(event) {
    event.preventDefault();
    event.stopPropagation();
    try {
      const { node, groupNode, groupId } =
        AllocatePageHelpers.getGroupNodeAndIdFromActionNode(event);
      console.log('[AllocatePageHandlers:removeGroup]', {
        groupNode,
        groupId,
        node,
      });
      const { updaters } = this;
      updaters.removeGroupUpdater(groupId);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[AllocatePageHandlers:removeGroup]', error, {
        event,
      });
      // eslint-disable-next-line no-debugger
      debugger;
      this.updaters.setError(error);
    }
  }

  /** @param {PointerEvent} event */
  editGroup(event) {
    event.preventDefault();
    event.stopPropagation();
    try {
      const { node, groupNode, groupId } =
        AllocatePageHelpers.getGroupNodeAndIdFromActionNode(event);
      console.log('[AllocatePageHandlers:editGroup]', {
        groupNode,
        groupId,
        node,
      });
      const { updaters } = this;
      updaters.editGroupUpdater(groupId);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[AllocatePageHandlers:editGroup]', error, {
        event,
      });
      // eslint-disable-next-line no-debugger
      debugger;
    }
  }

  /** @param {PointerEvent} event */
  confirmGroups(event) {
    event.preventDefault();
    event.stopPropagation();
    console.log('[AllocatePageHandlers:confirmGroups]', {
    });
    debugger;
    // TODO!
  }

  addNewGroup() {
    console.log('[AllocatePageHandlers:addNewGroup]', {
    });
    debugger;
  }
}
