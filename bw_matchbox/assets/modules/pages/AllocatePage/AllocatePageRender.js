// @ts-check

import { useDebug } from '../../common/CommonConstants.js';
import * as CommonHelpers from '../../common/CommonHelpers.js';

import * as AllocatePageHelpers from './AllocatePageHelpers.js';

// Import types...
/* eslint-disable no-unused-vars */
import { AllocatePageNodes } from './AllocatePageNodes.js';
import { AllocatePageState } from './AllocatePageState.js';
/* eslint-enable no-unused-vars */

/** DEBUG: Show some input table rows in 'dragging' state */
const showDemoDragging = false;

export class AllocatePageRender {
  // Modules...
  /** @type AllocatePageNodes */
  nodes;
  /** @type AllocatePageState */
  state;
  /** @type TSharedHandlers */
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
  }

  initActionHandlers() {
    // Set initial action handlers...
    const toolbarNode = this.nodes.getGroupsToolbarNode();
    AllocatePageHelpers.addActionHandlers(toolbarNode, this.callbacks);
  }

  // Render groups...

  /**
   * @param {TAllocationData} item
   * @return {string}
   */
  createGroupItemContent(item) {
    const {
      id, // TAllocationId;
      type, // TAllocationType; // 'technosphere'
      // amount, // number; // 0.06008158208572887
      input, // TAllocationRecord; // {name: 'Clay-Williams', unit: 'kilogram', location: 'GLO', product: 'LLC', categories: 'Unknown'}
      // output, // TAllocationRecord; // {name: 'Smith LLC', unit: 'kilogram', location: 'GLO', product: 'Inc', categories: 'Unknown'}
      // inGroup,
    } = item;
    const {
      // categories, // 'Unknown' | TCategory[]; // ['air']
      // location, // string; // 'GLO'
      name, // string; // 'Clay-Williams'
      // product, // string; // 'LLC'
      // unit, // string; // 'kilogram'
    } = input;
    const content = `
      <div
        data-id="${id}"
        data-type="${type}"
        class="group-item"
      >
        <div class="title">
          <span id="item-name">${name}</span>
          <span id="item-type">(${type})</span>
        </div>
        <div class="title-actions">
          <a action-id="removeGroupItem" title="Remove item" class="theme-error"><i class="fa fa-xmark"></i></a>
        </div>
      </div>
    `;
    /* console.log('[AllocatePageRender:createGroupItemContent]', type, id, {
     *   id, // TAllocationId;
     *   type, // TAllocationType; // 'technosphere'
     *   // amount, // number; // 0.06008158208572887
     *   input, // TAllocationRecord; // {name: 'Clay-Williams', unit: 'kilogram', location: 'GLO', product: 'LLC', categories: 'Unknown'}
     *   // output, // TAllocationRecord; // {name: 'Smith LLC', unit: 'kilogram', location: 'GLO', product: 'Inc', categories: 'Unknown'}
     *   // categories, // 'Unknown' | TCategory[]; // ['air']
     *   location, // string; // 'GLO'
     *   name, // string; // 'Clay-Williams'
     *   // product, // string; // 'LLC'
     *   // unit, // string; // 'kilogram'
     *   content,
     * });
     */
    return content;
  }

  /** renderGroupTitleActions
   * @param {TAllocationGroup} _group
   * @return {string} HTML content
   */
  renderGroupTitleActions(_group) {
    /*
     * const {
     *   localId, // TLocalGroupId;
     *   name, // string;
     *   items, // TAllocationData[];
     * } = group;
     */
    const actions = [
      `<a action-id="editGroup" title="Edit group" class="theme-primary"><i class="fa fa-edit"></i></a>`,
      `<a action-id="removeGroup" title="Remove group" class="theme-error"><i class="fa fa-trash"></i></a>`,
    ].filter(Boolean);
    /* console.log('[GroupCommentsRender:renderHelpers:renderGroupTitleActions]', {
     *   actions,
     *   reporter,
     *   currentUser,
     *   group,
     * });
     */
    return actions.join('\n');
  }

  /**
   * @param {TAllocationGroup} group
   * @return {string}
   */
  createGroupContent(group) {
    const {
      localId, // TLocalGroupId;
      name, // string;
      items, // TAllocationData[];
    } = group;
    const itemsCount = items.length;
    const hasItems = !!itemsCount;
    const className = [
      // prettier-ignore
      'group',
      !hasItems && 'empty',
    ]
      .filter(Boolean)
      .join(' ');
    const itemsContent = items.map(this.createGroupItemContent.bind(this));
    const groupTitleActions = this.renderGroupTitleActions(group);
    const content = `
      <div
        data-group-id="${localId}"
        class="${className}"
      >
        <div action-id="expandGroup" class="group-header">
          <div class="expand-button-wrapper" title="Expand/collapse group items">
            <a class="expand-button">
              <i class="fa fa-chevron-right"></i>
            </a>
          </div>
          <div class="title">
            <span id="group-name">${name}</span>
            <span id="group-items-count-wrapper">
              (<span id="group-items-count">${itemsCount || 'empty'}</span>)
            </span>
          </div>
          <div class="title-actions">
            ${groupTitleActions}
          </div>
        </div>
        <div class="group-content">
          ${itemsContent.join('\n')}
        </div>
      </div>
    `;
    /* console.log('[AllocatePageRender:createGroupContent]', localId, {
     *   localId, // TLocalGroupId;
     *   name, // string;
     *   items, // TAllocationData[];
     *   content,
     * });
     */
    return content;
  }

  /**
   * @param {TAllocationGroup} group
   * @param {TAllocationData} item
   * @return {HTMLElement}
   */
  renderNewGroupContentItem(group, item) {
    const { nodes } = this;
    const {
      localId: groupId, // TLocalGroupId;
      // name, // string;
      // items, // TAllocationData[];
    } = group;
    const groupNode = nodes.getGroupNode(groupId);
    const contentNode = groupNode.querySelector('.group-content');
    groupNode.classList.toggle('empty', false);
    const itemContent = this.createGroupItemContent(item);
    const itemContentNode = CommonHelpers.htmlToElement(itemContent);
    contentNode.append(itemContentNode);
    AllocatePageHelpers.addActionHandlers(itemContentNode, this.callbacks);
    return itemContentNode;
  }

  /**
   * @param {TAllocationGroup[]} groups
   * @return {string[]}
   */
  createGroupsContent(groups) {
    const content = groups.map(this.createGroupContent.bind(this));
    return content;
  }

  /** @param {HTMLElement} node */
  addGroupDragHandlers(node) {
    if (!node.classList.contains('group')) {
      const groupNodes = node.querySelectorAll('.group');
      groupNodes.forEach(this.addGroupDragHandlers.bind(this));
      return;
    }
    const { callbacks } = this;
    const {
      // prettier-ignore
      handleGroupDragEnter,
      handleGroupDragLeave,
      handleGroupDragOver,
      handleGroupDragEnd,
      handleGroupDragDrop,
    } = callbacks;
    console.log('[AllocatePageRender:addGroupDragHandlers]', {
      handleGroupDragEnter,
      handleGroupDragLeave,
      handleGroupDragOver,
      handleGroupDragDrop,
      node,
    });
    if (handleGroupDragEnter) {
      node.removeEventListener('dragenter', handleGroupDragEnter);
      node.addEventListener('dragenter', handleGroupDragEnter);
    }
    if (handleGroupDragLeave) {
      node.removeEventListener('dragleave', handleGroupDragLeave);
      node.addEventListener('dragleave', handleGroupDragLeave);
    }
    if (handleGroupDragOver) {
      node.removeEventListener('dragover', handleGroupDragOver);
      node.addEventListener('dragover', handleGroupDragOver);
    }
    if (handleGroupDragEnd) {
      node.removeEventListener('dragend', handleGroupDragEnd);
      node.addEventListener('dragend', handleGroupDragEnd);
    }
    if (handleGroupDragDrop) {
      node.removeEventListener('drop', handleGroupDragDrop);
      node.addEventListener('drop', handleGroupDragDrop);
    }
  }

  renderGroups() {
    const { nodes, state, callbacks } = this;
    const { groups } = state;
    const content = this.createGroupsContent(groups).join('\n');
    const groupsListNode = nodes.getGroupsListNode();
    CommonHelpers.updateNodeContent(groupsListNode, content);
    AllocatePageHelpers.addActionHandlers(groupsListNode, this.callbacks);
    this.addGroupDragHandlers(groupsListNode);
    callbacks.updateGroupsState();
  }

  /**
   * @param {TAllocationGroup} group
   * @return {HTMLElement}
   */
  renderNewGroup(group) {
    const { nodes, callbacks } = this;
    const groupContent = this.createGroupContent(group);
    const groupNode = CommonHelpers.htmlToElement(groupContent);
    const groupsListNode = nodes.getGroupsListNode();
    groupsListNode.append(groupNode);
    AllocatePageHelpers.addActionHandlers(groupNode, this.callbacks);
    this.addGroupDragHandlers(groupNode);
    callbacks.updateGroupsState();
    return groupNode;
  }

  // Render input tables...

  /**
   * @param {TAllocationData} item
   * @return {string}
   */
  createInputTableRowContent(item) {
    const {
      id, // TAllocationId;
      type, // TAllocationType; // 'technosphere'
      amount, // number; // 0.06008158208572887
      input, // TAllocationRecord; // {name: 'Clay-Williams', unit: 'kilogram', location: 'GLO', product: 'LLC', categories: 'Unknown'}
      // output, // TAllocationRecord; // {name: 'Smith LLC', unit: 'kilogram', location: 'GLO', product: 'Inc', categories: 'Unknown'}
      inGroup,
    } = item;
    const amountStr = amount.toExponential(4);
    const {
      // categories, // 'Unknown' | TCategory[]; // ['air']
      location, // string; // 'GLO'
      name, // string; // 'Clay-Williams'
      // product, // string; // 'LLC'
      unit, // string; // 'kilogram'
    } = input;
    const isInGroup = inGroup != undefined;
    // DEBUG: Show dragging effect...
    const isDragging = showDemoDragging && useDebug && name === 'Ellis Group';
    const nameContent = `<a href="/process/${id}">${name}</a>`;
    const className = [
      'input-row',
      // Dragging?
      isDragging && 'dragging',
      // Is in group?
      isInGroup && 'in-group',
    ]
      .filter(Boolean)
      .join(' ');
    const attributes = [
      // NOTE: Only 'technosphere' and 'biosphere' inputs can be added into the groups.
      type !== 'production' && 'draggable="true"',
    ]
      .filter(Boolean)
      .join(' ');
    const content = `
      <tr
        data-id="${id}"
        data-type="${type}"
        data-in-group="${inGroup || ''}"
        class="${className}"
        ${attributes}
      >
        <td><div>${amountStr}</div></td>
        <td><div>${nameContent}</div></td>
        <td><div>${location}</div></td>
        <td><div>${unit}</div></td>
      </tr>
    `;
    /* console.log('[AllocatePageRender:createInputTableRowContent]', type, id, {
     *   id, // TAllocationId;
     *   type, // TAllocationType; // 'technosphere'
     *   amount, // number; // 0.06008158208572887
     *   input, // TAllocationRecord; // {name: 'Clay-Williams', unit: 'kilogram', location: 'GLO', product: 'LLC', categories: 'Unknown'}
     *   // output, // TAllocationRecord; // {name: 'Smith LLC', unit: 'kilogram', location: 'GLO', product: 'Inc', categories: 'Unknown'}
     *   // categories, // 'Unknown' | TCategory[]; // ['air']
     *   location, // string; // 'GLO'
     *   name, // string; // 'Clay-Williams'
     *   // product, // string; // 'LLC'
     *   unit, // string; // 'kilogram'
     *   content,
     * });
     */
    return content;
  }

  /**
   * @param {TAllocationData[]} data
   * @return {string[]}
   */
  createInputTableContent(data) {
    const content = data.map(this.createInputTableRowContent.bind(this));
    return content;
  }

  /** @param {HTMLElement} parentNode */
  addInputTableDragHandlers(parentNode) {
    const { callbacks } = this;
    const { handleInputTableDragStart } = callbacks;
    const dragNodes = parentNode.querySelectorAll('tr.input-row');
    console.log('[AllocatePageRender:addInputTableDragHandlers]', {
      handleInputTableDragStart,
      dragNodes,
    });
    dragNodes.forEach((node) => {
      // Just for case: remove previous listener
      node.removeEventListener('dragstart', handleInputTableDragStart);
      // Add listener...
      node.addEventListener('dragstart', handleInputTableDragStart);
    });
  }

  /**
   * @param {HTMLElement} node
   * @param {TAllocationData[]} data
   */
  renderInputTableToNode(node, data) {
    const content = this.createInputTableContent(data).join('\n');
    CommonHelpers.updateNodeContent(node, content);
    AllocatePageHelpers.addActionHandlers(node, this.callbacks);
    this.addInputTableDragHandlers(node);
  }

  /** @param {TAllocationType} type */
  renderInputTable(type) {
    const { nodes, state, callbacks } = this;
    const data = state[type];
    const rootNode = nodes.getRootNode();
    const node = /** @type HTMLElement */ (rootNode.querySelector('#' + type + '-inputs'));
    this.renderInputTableToNode(node, data);
    callbacks.updateInputTableState(type);
  }

  renderAllInputTables() {
    this.renderInputTable('technosphere');
    this.renderInputTable('biosphere');
    this.renderInputTable('production');
  }

  // Common methods...

  renderAllData() {
    this.renderAllInputTables();
    this.renderGroups();
  }
}
