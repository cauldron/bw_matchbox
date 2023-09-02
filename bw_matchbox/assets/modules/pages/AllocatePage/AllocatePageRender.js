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
      inGroup,
    } = row;
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

  renderAllData() {
    this.renderAllInputTables();
  }
}
