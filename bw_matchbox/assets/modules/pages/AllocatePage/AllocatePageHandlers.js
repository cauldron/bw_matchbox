// @ts-check

import * as CommonHelpers from '../../common/CommonHelpers.js';

import * as AllocatePageHelpers from './AllocatePageHelpers.js';

// Import only types...
/* eslint-disable no-unused-vars */
import { AllocatePageNodes } from './AllocatePageNodes.js';
// import { AllocatePageRender } from './AllocatePageRender.js';
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
  /** @type {AllocatePageState} */
  state;
  /** @type {AllocatePageUpdaters} */
  updaters;

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

  /** @param {PointerEvent} event */
  expandGroup(event) {
    const node = /** @type {HTMLElement} */ (event.currentTarget);
    const groupNode = node.closest('.group');
    /* // DEBUG
     * const groupId = Number(groupNode && groupNode.getAttribute('data-group-id'))
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
      // Expand if not empty...
      if (!node.classList.contains('empty')) {
        node.classList.toggle('expanded', setExpanded);
      }
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
      this.updaters.setError(error);
    }
  }

  /** @param {PointerEvent} event */
  confirmGroups(event) {
    event.preventDefault();
    event.stopPropagation();
    console.log('[AllocatePageHandlers:confirmGroups]', {});
    debugger;
    // TODO!
  }

  addNewGroup() {
    try {
      // console.log('[AllocatePageHandlers:addNewGroup]');
      const { updaters } = this;
      updaters.addGroupUpdater();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[AllocatePageHandlers:addNewGroup]', error);
      // eslint-disable-next-line no-debugger
      debugger;
      this.updaters.setError(error);
    }
  }

  /** @param {PointerEvent} event */
  removeGroupItem(event) {
    const { updaters } = this;
    // const { groups } = state;
    event.preventDefault();
    event.stopPropagation();
    const node = /** @type {HTMLElement} */ (event.currentTarget);
    const groupNode = node.closest('.group');
    const itemNode = node.closest('.group-item');
    try {
      const groupId = /** @type TLocalGroupId */ (
        Number(groupNode && groupNode.getAttribute('data-group-id'))
      );
      const itemId = /** @type TAllocationId */ (
        Number(itemNode && itemNode.getAttribute('data-id'))
      );
      // const itemType = [>* @type TAllocationType <] (
      //   itemNode && itemNode.getAttribute('data-type')
      // );
      console.log('[AllocatePageHandlers:removeGroupItem]', {
        itemId,
        // itemType,
        itemNode,
        node,
      });
      updaters.removeGroupItemUpdater({ groupId, itemId });
      if (itemNode) {
        itemNode.remove();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[AllocatePageHandlers:removeGroupItem]', error, {
        event,
        node,
        groupNode,
        itemNode,
      });
      // eslint-disable-next-line no-debugger
      debugger;
      this.updaters.setError(error);
    }
  }

  /** @param {HTMLElement} [rowNode] */
  _setOnlySelectedRow(rowNode) {
    // Select only node...
    if (rowNode) {
      rowNode.classList.toggle('selected', true);
    }
    // And deselect all the other previously selected rows...
    const { nodes } = this;
    const sourcesColumnNode = nodes.getSourcesColumnNode();
    const selectedRows = sourcesColumnNode.querySelectorAll('.input-row.selected');
    selectedRows.forEach((node) => {
      const isCurrent = node === rowNode;
      if (!isCurrent) {
        node.classList.toggle('selected', false);
      }
    });
  }

  /** @param {PointerEvent} event */
  handleInputTableClick(event) {
    const { ctrlKey, currentTarget } = event;
    const itemNode = /** @type {HTMLElement} */ (currentTarget);
    const itemId = /** @type TAllocationId */ (
      Number(itemNode && itemNode.getAttribute('data-id'))
    );
    const itemType = /** @type TAllocationType */ (itemNode && itemNode.getAttribute('data-type'));
    console.log('[AllocatePageHandlers:handleInputTableClick]', {
      ctrlKey,
      itemId,
      itemType,
      itemNode,
      event,
    });
    if (ctrlKey) {
      // Toggle selection for row if clicked with control key...
      itemNode.classList.toggle('selected');
    } else {
      // ...Else select only current row...
      this._setOnlySelectedRow(itemNode);
    }
  }
}
