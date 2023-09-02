// @ts-check

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

  /**
   * @param {TAllocationData} row
   * @return {string}
   */
  createInputTableRowContent(row) {
    const {
      id, // TAllocationId;
      type, // TAllocationType; // 'technosphere'
      amount, // number; // 0.06008158208572887
      input, // TAllocationRecord; // {name: 'Clay-Williams', unit: 'kilogram', location: 'GLO', product: 'LLC', categories: 'Unknown'}
      output, // TAllocationRecord; // {name: 'Smith LLC', unit: 'kilogram', location: 'GLO', product: 'Inc', categories: 'Unknown'}
    } = row;
    const {
      categories, // 'Unknown' | TCategory[]; // ['air']
      location, // string; // 'GLO'
      name, // string; // 'Clay-Williams'
      product, // string; // 'LLC'
      unit, // string; // 'kilogram'
    } = input;
    const nameContent = `<a href="/process/${id}">${name}</a>`;
    const content = `
      <tr id="${id}">
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

  renderTechnosphereInputTable() {
    const { nodes, state } = this;
    const { technosphere } = state;
    const hasData = Array.isArray(technosphere) && technosphere.length;
    const node = nodes.getTechnosphereInputsNode();
    this.renderInputTableToNode(node, technosphere);
    const rootNode = nodes.getRootNode();
    rootNode.classList.toggle('has-technosphere-data', hasData);
  }

  renderAllInputTables() {
    this.renderTechnosphereInputTable();
  }

  renderAllData() {
    this.renderAllInputTables();
  }
}
