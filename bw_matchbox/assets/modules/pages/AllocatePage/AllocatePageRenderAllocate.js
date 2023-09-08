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
    const { state } = this;
    const { fractions } = state;
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
    const initialValue = fractions[groupId][productionId]; // isLastProduction ? 1 : 0;
    const inputId = AllocatePageHelpers.getAllocateModeFractionInputId({ productionId, groupId }); // `production-${productionId}-group-${groupId}-fraction`;
    return `
      <div
        class="production-group ${isLastProduction ? 'last' : ''}"
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
            data-production-id="${productionId}"
            data-group-id="${groupId}"
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
          <div class="list">
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
   * @return {string}
   */
  createProductionHeader({ data, isLastProduction }) {
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
    return `
      <td
        class="allocate-cell production-header"
        data-production-id="${id}"
      >
        <div class="title">
          <span class="name">${name}</span>
        </div>
      </td>
    `;
  }

  /** @return {string} */
  createAllocateRowsHeaders() {
    const { state } = this;
    const { production } = state;
    const lastProductionIdx = production.length - 1;
    const contentList = production.map((data, idx) => {
      const isLastProduction = idx === lastProductionIdx;
      return this.createProductionHeader({ data, isLastProduction });
    });
    const content = contentList.join('\n');
    console.log('[AllocatePageRenderAllocate:createAllocateRowsHeaders]', {
      contentList,
      content,
      production,
      state,
    });
    return `
      <tr class="allocate-row allocate-row-headers">
        ${content}
      </tr>
    `;
  }

  /**
   * @param {object} params
   * @param {TAllocationGroup} params.group
   * @return {string}
   */
  createAllocateRowsGroup({ group }) {
    const { state } = this;
    const {
      localId: groupId, // TLocalGroupId;
      // name, // string;
      // items, // TAllocationData[];
    } = group;
    const { production } = state;
    const lastProductionIdx = production.length - 1;
    const contentList = production.map((data, idx) => {
      const productionId = data.id;
      const isLastProduction = idx === lastProductionIdx;
      const groupItem = this.createProductionGroup({ data, group, isLastProduction });
      return `
        <td
          class="allocate-cell production-group-cell"
          data-production-id="${productionId}"
          data-group-id="${groupId}"
        >
          ${groupItem}
        </td>
      `;
    });
    const content = contentList.join('\n');
    console.log('[AllocatePageRenderAllocate:createAllocateRowsGroup]', {
      group,
      contentList,
      content,
      production,
      state,
    });
    return `
      <tr
        data-group-id="${groupId}"
        class="allocate-row allocate-row-group"
      >
        ${content}
      </tr>
    `;
  }

  /** @return {string} */
  createAllocateRows() {
    const { state } = this;
    const { groups } = state;
    const headers = this.createAllocateRowsHeaders();
    console.log('[AllocatePageRenderAllocate:createAllocateRows]', {
      headers,
      groups,
      state,
    });
    const groupRows = groups.map((group) => {
      return this.createAllocateRowsGroup({ group });
    });
    const contentList = [
      // prettier-ignore
      headers,
      ...groupRows,
    ];
    const content = contentList.join('\n');
    return `
      <table class="allocate-table">
        ${content}
      </table>
    `;
  }

  renderAllocateNodes() {
    const { nodes } = this;
    const content = this.createAllocateRows();
    const containerNode = nodes.getAllocateModeContentContainerNode();
    // containerNode.classList.toggle('rows-layout', useRowsLayout);
    console.log('[AllocatePageRenderAllocate:renderAllocateNodes]', {
      content,
      containerNode,
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
