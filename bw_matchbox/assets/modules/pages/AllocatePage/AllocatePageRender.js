// @ts-check

import { useDebug } from '../../common/CommonConstants.js';
import * as CommonHelpers from '../../common/CommonHelpers.js';

// Import only types...
/* eslint-disable no-unused-vars */
import { AllocatePageNodes } from './AllocatePageNodes.js';
/* eslint-enable no-unused-vars */

/**
 * @implements {TAllocatePageRender}
 */
export class AllocatePageRender {
  // Modules...
  /** type {AllocatePageNodes} */
  nodes;
  /** type {AllocatePageState} */
  state;

  /** @param {TAllocatePageRenderParams} params */
  constructor(params) {
    // Modules...
    this.nodes = params.nodes;
    this.state = params.state;
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
    const content = `
      <div
        group-id="${localId}"
        class="${className}"
      >
        <div class="group-header">
          <div class="name">${name}</div>
          <!-- TODO: Collapse/remove group buttons -->
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

  updateGroupsState() {
    const { nodes, state } = this;
    const { groups } = state;
    const groupsCount = groups.length;
    // Get only ungrouped items...
    const rootNode = nodes.getRootNode();
    const statisticsNode = nodes.getStatisticsNode();
    const groupsCountItems = statisticsNode.querySelectorAll('#groups-count');
    rootNode.classList.toggle('has-groups', !!groupsCount);
    if (groupsCountItems.length) {
      for (const countNode of groupsCountItems) {
        countNode.innerHTML = String(groupsCount);
      }
    }
  }

  renderGroups() {
    const { nodes, state } = this;
    const { groups } = state;
    const content = this.createGroupsContent(groups).join('\n');
    const node = nodes.getGroupsListNode();
    CommonHelpers.updateNodeContent(node, content);
    this.updateGroupsState();
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
    const isDragging = useDebug && name === 'Ellis Group';
    const nameContent = `<a href="/process/${id}">${name}</a>`;
    const className = [
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
      for (const countNode of statisticsItems) {
        countNode.innerHTML = String(visibleCount);
      }
    }
  }

  /** @param {TAllocationType} type */
  renderInputTable(type) {
    const { nodes, state } = this;
    const data = state[type];
    const rootNode = nodes.getRootNode();
    const node = rootNode.querySelector('#' + type + '-inputs');
    this.renderInputTableToNode(node, data);
    this.updateInputTableState(type);
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
