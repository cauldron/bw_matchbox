// @ts-check

import * as AllocatePageHelpers from './AllocatePageHelpers.js';

// Import types...
/* eslint-disable no-unused-vars */
import { AllocatePageNodes } from './AllocatePageNodes.js';
import { AllocatePageState } from './AllocatePageState.js';
/* eslint-enable no-unused-vars */

export class AllocatePageRenderAllocate {
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
    const allocateModeToolbarNode = this.nodes.getAllocateModeToolbarNode();
    AllocatePageHelpers.addActionHandlers(allocateModeToolbarNode, this.callbacks);
  }

  // Allocate mode...

  /**
   * @param {object} params
   * @param {TAllocationData} params.data
   * @param {TAllocationGroup} params.group
   * @param {TAllocationData} params.item
   * @return {string}
   */
  createProductionGroupItemNode({ item }) {
    const {
      id, // 191
      type, // 'production'
      // amount, // 0.6858156846465647
      input, // {name: 'Clay-Williams', unit: 'kilogram', location: 'GLO', product: 'LLC', categories: 'Unknown'}
      // output, // {name: 'Smith LLC', unit: 'kilogram', location: 'GLO', product: 'Inc', categories: 'Unknown'}
    } = item;
    const {
      // categories, // 'Unknown'
      // location, // 'GLO'
      name, // 'Clay-Williams'
      // product, // 'LLC'
      // unit, // 'kilogram'
    } = input;
    return `
      <div data-item-id="${id}" class="group-item">
        <div class="header">
          <div class="title">
            <span class="name">${name}</span>
            <span class="type">(${type})</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * @param {object} params
   * @param {TAllocationData} params.data
   * @param {TAllocationGroup} params.group
   * @param {boolean} params.isLastProduction
   * @return {string}
   */
  createProductionGroup({ data, group, isLastProduction }) {
    // UNUSED: Production data...
    const {
      id: productionId, // 191
      // type, // 'production'
      // amount, // 0.6858156846465647
      // input, // {name: 'Clay-Williams', unit: 'kilogram', location: 'GLO', product: 'LLC', categories: 'Unknown'}
      // output, // {name: 'Smith LLC', unit: 'kilogram', location: 'GLO', product: 'Inc', categories: 'Unknown'}
    } = data;
    const {
      localId: groupId, // TLocalGroupId;
      name, // string;
      items, // TAllocationData[];
    } = group;
    const itemsContentList = items.map((item) => {
      return this.createProductionGroupItemNode({ data, group, item });
    });
    const itemsCount = items.length;
    const isEmpty = !itemsCount;
    const itemsContent = itemsContentList.join('\n');
    const initialValue = isLastProduction ? 1 : 0;
    const inputId = `production-${productionId}-group-${groupId}-fraction`;
    return `
      <div
        class="group"
        data-production-id="${productionId}"
        data-group-id="${groupId}"
      >
        <div class="header">
          <div class="title">
            <span class="name">${name}</span>
          </div>
        </div>
        <div class="group-fraction">
          <input
            type="text"
            name="${inputId}"
            id="${inputId}"
            value="${initialValue}"
            ${isLastProduction ? 'disabled' : ''}
          />
        </div>
        <div class="group-items ${isEmpty ? 'empty' : ''}">
          <div class="shortcut empty">
            <span class="label">Empty</span>
          </div>
          <div
            action-id="toggleAllocateGroupItems"
            class="shortcut action"
            title="Click to expand inputs list"
          >
            <span class="handler"><i class="fa fa-chevron-right"></i></span>
            <span class="label">Contains items:</span>
            <span class="number">${items.length}</span>
          </div>
          <div
            action-id="toggleAllocateGroupItems"
            class="list action"
            title="Click to collapse inputs list"
          >
            ${itemsContent}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * @param {object} params
   * @param {TAllocationData} params.data
   * @param {boolean} params.isLastProduction
   * @return {string[]}
   */
  createProductionGroups({ data, isLastProduction }) {
    const { state } = this;
    const { groups } = state;
    const groupsContentList = groups.map((group) => {
      return this.createProductionGroup({ data, group, isLastProduction });
    });
    console.log('[AllocatePageRenderAllocate:createProductionGroups]', {
      groupsContentList,
      groups,
      data,
    });
    return groupsContentList;
  }

  /**
   * @param {object} params
   * @param {TAllocationData} params.data
   * @param {boolean} params.isLastProduction
   * @return {string}
   */
  createProductionSection({ data, isLastProduction }) {
    const {
      id, // 191
      // type, // 'production'
      // amount, // 0.6858156846465647
      input, // {name: 'Clay-Williams', unit: 'kilogram', location: 'GLO', product: 'LLC', categories: 'Unknown'}
      // output, // {name: 'Smith LLC', unit: 'kilogram', location: 'GLO', product: 'Inc', categories: 'Unknown'}
    } = data;
    const {
      // categories, // 'Unknown'
      // location, // 'GLO'
      name, // 'Clay-Williams'
      // product, // 'LLC'
      // unit, // 'kilogram'
    } = input;
    const groupsContentList = this.createProductionGroups({ data, isLastProduction });
    const groupsContent = groupsContentList.join('\n');
    const className = [
      // prettier-ignore
      'production',
      isLastProduction && 'last',
    ]
      .filter(Boolean)
      .join(' ');
    return `
      <div
        class="${className}"
        data-production-id="${id}"
      >
        <div class="header">
          <div class="title">
            <span class="name">${name}</span>
          </div>
        </div>
        <div class="groups">
          ${groupsContent}
        </div>
      </div>
    `;
  }

  renderAllocateNodes() {
    const { nodes, state } = this;
    const containerNode = nodes.getAllocateModeContentContainerNode();
    const { production } = state;
    const lastProductionIdx = production.length - 1;
    const contentList = production.map((data, idx) => {
      const isLastProduction = idx === lastProductionIdx;
      return this.createProductionSection({ data, isLastProduction });
    });
    const content = contentList.join('\n');
    console.log('[AllocatePageRenderAllocate:renderAllocateNodes]', {
      contentList,
      content,
      production,
      containerNode,
      state,
    });
    containerNode.innerHTML = content;
    AllocatePageHelpers.addActionHandlers(containerNode, this.callbacks);
  }

  clearAllocateNodes() {
    const { nodes } = this;
    const containerNode = nodes.getAllocateModeContentContainerNode();
    containerNode.innerHTML = '';
  }
}
