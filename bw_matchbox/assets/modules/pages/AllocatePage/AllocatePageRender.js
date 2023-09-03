// @ts-check

import { useDebug } from '../../common/CommonConstants.js';
import * as CommonHelpers from '../../common/CommonHelpers.js';

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
  }

  initActionHandlers() {
    // Set action handlers...
    const toolbarNode = this.nodes.getGroupsToolbarNode();
    this.addActionHandlers(toolbarNode);
  }

  // Helpers...

  /** @param {HTMLElement} node */
  addActionHandlers(node) {
    const { callbacks } = this;
    const actionNodes = node.querySelectorAll('[action-id]');
    /* console.log('[AllocatePageRender:addActionHandlers]', {
     *   node,
     *   actionNodes,
     * });
     */
    actionNodes.forEach((actionNode) => {
      const actionId = actionNode.getAttribute('action-id');
      const action = actionId && callbacks[actionId];
      /* console.log('[AllocatePageRender:addActionHandlers] item', {
       *   actionId,
       *   action,
       * });
       */
      if (!action) {
        const error = new Error(`Not found action for id "${actionId}"`);
        // eslint-disable-next-line no-console
        console.warn('[AllocatePageRender:addActionHandlers]', error, {
          actionNode,
        });
        return;
      }
      // Just for case: remove previous listener
      actionNode.removeEventListener('click', action);
      // Add listener...
      actionNode.addEventListener('click', action);
    });
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
      amount, // number; // 0.06008158208572887
      input, // TAllocationRecord; // {name: 'Clay-Williams', unit: 'kilogram', location: 'GLO', product: 'LLC', categories: 'Unknown'}
      output, // TAllocationRecord; // {name: 'Smith LLC', unit: 'kilogram', location: 'GLO', product: 'Inc', categories: 'Unknown'}
      // inGroup,
    } = item;
    const {
      categories, // 'Unknown' | TCategory[]; // ['air']
      location, // string; // 'GLO'
      name, // string; // 'Clay-Williams'
      product, // string; // 'LLC'
      unit, // string; // 'kilogram'
    } = input;
    const content = `
      <div
        data-id="${id}"
        data-type="${type}"
        class="group-item"
      >
        #${id}
        ${name}
        (${type})
        <!-- TODO: Remove item buttons -->
      </div>
    `;
    console.log('[AllocatePageRender:createGroupItemContent]', type, id, {
      id, // TAllocationId;
      type, // TAllocationType; // 'technosphere'
      amount, // number; // 0.06008158208572887
      input, // TAllocationRecord; // {name: 'Clay-Williams', unit: 'kilogram', location: 'GLO', product: 'LLC', categories: 'Unknown'}
      output, // TAllocationRecord; // {name: 'Smith LLC', unit: 'kilogram', location: 'GLO', product: 'Inc', categories: 'Unknown'}
      categories, // 'Unknown' | TCategory[]; // ['air']
      location, // string; // 'GLO'
      name, // string; // 'Clay-Williams'
      product, // string; // 'LLC'
      unit, // string; // 'kilogram'
      content,
    });
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
    const className = [
      // prettier-ignore
      'group',
    ]
      .filter(Boolean)
      .join(' ');
    const itemsContent = items.map(this.createGroupItemContent.bind(this));
    const groupTitleActions = this.renderGroupTitleActions(group);
    const content = `
      <div
        group-id="${localId}"
        class="${className}"
        action-id="expandGroup"
      >
        <div class="group-header">
          <div class="expand-button-wrapper" title="Expand/collapse group items">
            <a class="expand-button">
              <i class="fa fa-chevron-right"></i>
            </a>
          </div>
          <div class="title">${name}</div>
          <div class="title-actions">
            ${groupTitleActions}
          </div>
        </div>
        <div class="group-content">
          <div class="group-items">
            ${itemsContent.join('\n')}
          </div>
        </div>
      </div>
    `;
    console.log('[AllocatePageRender:createGroupContent]', localId, {
      localId, // TLocalGroupId;
      name, // string;
      items, // TAllocationData[];
      content,
    });
    return content;
  }

  /**
   * @param {TAllocationGroup[]} groups
   * @return {string[]}
   */
  createGroupsContent(groups) {
    const content = groups.map(this.createGroupContent.bind(this));
    return content;
  }

  renderGroups() {
    const { nodes, state, callbacks } = this;
    const { groups } = state;
    const content = this.createGroupsContent(groups).join('\n');
    const node = nodes.getGroupsListNode();
    CommonHelpers.updateNodeContent(node, content);
    this.addActionHandlers(node);
    callbacks.updateGroupsState();
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
      output, // TAllocationRecord; // {name: 'Smith LLC', unit: 'kilogram', location: 'GLO', product: 'Inc', categories: 'Unknown'}
      inGroup,
    } = item;
    const {
      categories, // 'Unknown' | TCategory[]; // ['air']
      location, // string; // 'GLO'
      name, // string; // 'Clay-Williams'
      product, // string; // 'LLC'
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
    const content = `
      <tr
        data-id="${id}"
        data-type="${type}"
        data-in-group="${inGroup || ''}"
        class="${className}"
      >
        <td><div>${amount}</div></td>
        <td><div>${nameContent}</div></td>
        <td><div>${location}</div></td>
        <td><div>${unit}</div></td>
      </tr>
    `;
    console.log('[AllocatePageRender:createInputTableRowContent]', type, id, {
      id, // TAllocationId;
      type, // TAllocationType; // 'technosphere'
      amount, // number; // 0.06008158208572887
      input, // TAllocationRecord; // {name: 'Clay-Williams', unit: 'kilogram', location: 'GLO', product: 'LLC', categories: 'Unknown'}
      output, // TAllocationRecord; // {name: 'Smith LLC', unit: 'kilogram', location: 'GLO', product: 'Inc', categories: 'Unknown'}
      categories, // 'Unknown' | TCategory[]; // ['air']
      location, // string; // 'GLO'
      name, // string; // 'Clay-Williams'
      product, // string; // 'LLC'
      unit, // string; // 'kilogram'
      content,
    });
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

  /**
   * @param {HTMLElement} node
   * @param {TAllocationData[]} data
   */
  renderInputTableToNode(node, data) {
    const content = this.createInputTableContent(data).join('\n');
    CommonHelpers.updateNodeContent(node, content);
    this.addActionHandlers(node);
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
