// @ts-check

import { commonModal } from '../../common/CommonModal.js';

import * as AllocatePageHelpers from './AllocatePageHelpers.js';

// Import only types...
/* eslint-disable no-unused-vars */
import { AllocatePageNodes } from './AllocatePageNodes.js';
import { AllocatePageState } from './AllocatePageState.js';
import { AllocatePageRender } from './AllocatePageRender.js';
import { AllocatePageRenderAllocate } from './AllocatePageRenderAllocate.js';
import { AllocatePageUpdaters } from './AllocatePageUpdaters.js';
/* eslint-enable no-unused-vars */

/**
 * @class AllocatePageAllocateModeUpdaters
 */
export class AllocatePageAllocateModeUpdaters {
  // Modules...
  /** @type AllocatePageNodes */
  nodes;
  /** @type AllocatePageState */
  state;
  /** @type AllocatePageRender */
  render;
  /** @type AllocatePageRenderAllocate */
  renderAllocate;
  /** @type AllocatePageUpdaters */
  updaters;

  /** @type TSharedHandlers */
  callbacks;

  /** @constructor
   * @param {object} params
   * @param {AllocatePageNodes} params.nodes
   * @param {AllocatePageState} params.state
   * @param {AllocatePageRender} params.render
   * @param {AllocatePageRenderAllocate} params.renderAllocate
   * @param {AllocatePageUpdaters} params.updaters
   * @param {TSharedHandlers} params.callbacks
   */
  constructor(params) {
    // Modules...
    this.nodes = params.nodes;
    this.state = params.state;
    this.render = params.render;
    this.renderAllocate = params.renderAllocate;
    this.updaters = params.updaters;
    this.callbacks = params.callbacks;
    /* // Export all methods as external handlers...
     * CommonHelpers.exportCallbacksFromInstance(params.callbacks, this);
     */
  }

  // Allocate mode...

  /** Normalize number after float point number operations
   * @param {number} number
   * @return {number}
   */
  normalizeFractionNumber(number) {
    let value = String(number);
    if (value.includes('0000')) {
      // Optimize if contains a lot of zeros (fix floating number bugs, eg '0.15000000000000002' -> '0.15')...
      value = value.replace(/(\.\d*[1-9])0{4,}\d*$/, '$1');
    }
    return Number(value);
  }

  /**
   * @param {HTMLInputElement} inputNode
   */
  getAllocateModeFractionValueProps(inputNode) {
    const id = inputNode.getAttribute('id');
    const productionId = /** @type TAllocationId */ (
      Number(inputNode.getAttribute('data-production-id'))
    );
    const groupId = /** @type TAllocationId */ (Number(inputNode.getAttribute('data-group-id')));
    const value = inputNode.value;
    const number = Number(value);
    return {
      id,
      productionId,
      groupId,
      value,
      number,
    };
  }

  /** Check if value is correct?
   * @param {object} params
   * @param {number} params.number
   * @param {string} [params.value]
   * @return boolean
   */
  checkAllocateModeFractionValue({ number, value }) {
    const strValue = value || String(number);
    if (value != undefined && !value) {
      throw new Error('Entered empty string');
    }
    if (isNaN(number)) {
      throw new Error('Expected number from 0 to 1. Got non-number "' + strValue + '".');
    }
    if (number < 0 || number > 1) {
      throw new Error('Expected number from 0 to 1. Got invalid number (' + strValue + ').');
    }
    return true;
  }

  /**
   * @param {object} params
   * @param {number} params.number
   * @param {TAllocationId} params.productionId
   * @param {TLocalGroupId} params.groupId
   * @param {boolean} [params.toExponential] - Convert to scientific notation
   */
  updateAllocateModeFractionInputDomValue({ number, productionId, groupId, toExponential }) {
    const { nodes } = this;
    const inputId = AllocatePageHelpers.getAllocateModeFractionInputId({ productionId, groupId }); // `production-${productionId}-group-${groupId}-fraction`;
    const contentNode = nodes.getAllocateModeContentContainerNode();
    const inputNode = /** @type HTMLInputElement */ (contentNode.querySelector('input#' + inputId));
    console.log('[AllocatePageAllocateModeUpdaters:updateAllocateModeFractionInputDomValue]', {
      number,
      productionId,
      groupId,
      inputId,
      contentNode,
      inputNode,
    });
    const value = toExponential ? number.toExponential(4) : String(number);
    inputNode.value = value;
  }

  /**
   * @param {object} params
   * @param {TLocalGroupId} params.groupId
   * @return {boolean}
   */
  checkAllGroupInputs({ groupId }) {
    const { state, nodes } = this;
    const { groups } = state;
    const group = groups.find((group) => group.localId === groupId);
    const groupName = group.name;
    const { production } = state;
    const productionIds = /** @type TAllocationId[] */ (production.map(({ id }) => id));
    const lastProductionId = productionIds[productionIds.length - 1];
    const contentNode = /** @type HTMLElement */ (nodes.getAllocateModeContentContainerNode());
    let summ = 0;
    const invalidValues = [];
    const allValues = [];
    const allInputNodes = [];
    productionIds.forEach((productionId) => {
      const inputId = AllocatePageHelpers.getAllocateModeFractionInputId({ productionId, groupId });
      const inputNode = /** @type HTMLInputElement */ (
        contentNode.querySelector('input#' + inputId)
      );
      allInputNodes.push(inputNode);
      const value = inputNode.value;
      allValues.push(value);
      const number = Number(value);
      console.log('[AllocatePageAllocateModeUpdaters:checkAllGroupInputs] item', {
        value,
        number,
        productionId,
        groupId,
      });
      try {
        this.checkAllocateModeFractionValue({ number, value });
      } catch (error) {
        invalidValues.push(value);
      }
      if (productionId !== lastProductionId) {
        summ += number;
      }
    });
    summ = this.normalizeFractionNumber(summ);
    // Check for errors...
    const errors = [];
    if (invalidValues.length) {
      const valuesList = invalidValues.map((val) => (isNaN(val) ? `"${val}"` : val)).join(', ');
      errors.push(
        new Error(`Entered invalid fraction value(s) for group "${groupName}": ${valuesList}.`),
      );
    }
    if (summ > 1) {
      errors.push(
        new Error(
          `The sum of fractions for group "${groupName}" shouldn't exceed 1. Now it's equal to ${summ}.`,
        ),
      );
    }
    const hasErrors = !!errors.length;
    const errorId = `allocate-group-${groupId}`;
    console.log('[AllocatePageAllocateModeUpdaters:checkAllGroupInputs] finished', {
      errors,
      summ,
      groupId,
      invalidValues,
      allValues,
    });
    this.updaters.setError(errorId, errors);
    allInputNodes.forEach((node) => {
      node.classList.toggle('error', hasErrors);
    });
    return !hasErrors;
  }

  /**
   * @param {object} params
   * @param {number} params.number
   * @param {TAllocationId} params.productionId
   * @param {TLocalGroupId} params.groupId
   */
  updateAllocateModeFractionValue({ number, productionId, groupId }) {
    const { state } = this;
    const { fractions, production } = state;
    const fractionsGroup = fractions[groupId];
    fractionsGroup[productionId] = number;
    if (!this.checkAllGroupInputs({ groupId })) {
      return;
    }
    const productionIds = /** @type TAllocationId[] */ (production.map(({ id }) => id));
    const lastProductionId = productionIds[productionIds.length - 1];
    const otherProductionIds = productionIds.filter((id) => id !== lastProductionId);
    const otherValues = otherProductionIds.map(
      (id) => /* id === productionId ? number : */ fractionsGroup[id],
    );
    const otherSumm = otherValues.reduce((summ, num) => summ + num, 0);
    const lastValueRaw = 1 - otherSumm;
    const lastValue = this.normalizeFractionNumber(lastValueRaw);
    console.log('[AllocatePageAllocateModeUpdaters:updateAllocateModeFractionValue]', {
      number,
      productionId,
      groupId,
      lastValue,
      lastValueRaw,
      otherValues,
      otherSumm,
      lastProductionId,
      fractionsGroup,
      productionIds,
      otherProductionIds,
    });
    this.updateAllocateModeFractionInputDomValue({
      number: lastValue,
      productionId: lastProductionId,
      groupId,
    });
  }

  /** Check the value after each small change
   * @param {HTMLInputElement} inputNode
   */
  setAllocateModeFractionValueOnChange(inputNode) {
    const { id, number, value, productionId, groupId } =
      this.getAllocateModeFractionValueProps(inputNode);
    console.log('[AllocatePageUpdaters:setAllocateModeFractionValueOnChange]', {
      id,
      productionId,
      groupId,
      number,
      value,
      inputNode,
    });
    this.updateAllocateModeFractionValue({ number, productionId, groupId });
  }

  /** Check the value after each small change
   * @param {HTMLInputElement} inputNode
   */
  setAllocateModeFractionValueOnInput(inputNode) {
    const { id, number, value, productionId, groupId } =
      this.getAllocateModeFractionValueProps(inputNode);
    if (isNaN(number)) {
      console.warn('[AllocatePageUpdaters:setAllocateModeFractionValueOnInput]: Not a number', {
        number,
        value,
        id,
        productionId,
        groupId,
        inputNode,
      });
    } else {
      console.log('[AllocatePageUpdaters:setAllocateModeFractionValueOnInput]', {
        number,
        value,
        id,
        productionId,
        groupId,
        inputNode,
      });
      this.updateAllocateModeFractionValue({ number, productionId, groupId });
    }
  }

  updateAllocateModeInputNodes() {
    const { nodes, callbacks } = this;
    const {
      handleAllocateFractionValueChange,
      handleAllocateFractionValueInput,
      // handleAllocateFractionValueBlur, // ???
    } = callbacks;
    const contentContainerNode = nodes.getAllocateModeContentContainerNode();
    const allocateFractionInputs = contentContainerNode.querySelectorAll('.group-fraction input');
    allocateFractionInputs.forEach((input) => {
      if (handleAllocateFractionValueChange) {
        input.removeEventListener('change', handleAllocateFractionValueChange);
        input.addEventListener('change', handleAllocateFractionValueChange);
      }
      if (handleAllocateFractionValueInput) {
        input.removeEventListener('input', handleAllocateFractionValueInput);
        input.addEventListener('input', handleAllocateFractionValueInput);
      }
    });
  }

  updateAllocateModeDomNodes() {
    const { nodes } = this;
    const rootNode = nodes.getRootNode();
    rootNode.classList.toggle('allocate-mode', true);
    const allocateLayout = nodes.getAllocateModeLayoutNode();
    allocateLayout.classList.toggle('common-hidden', false);
    this.updateAllocateModeInputNodes();
  }

  backFromAllocateModeDomNodes() {
    const { nodes } = this;
    const rootNode = nodes.getRootNode();
    rootNode.classList.toggle('allocate-mode', false);
  }

  createDefaultAllocationFractions() {
    const { state } = this;
    const { production, groups } = state;
    const productionIds = production.map(({ id }) => id);
    const groupIds = groups.map(({ localId }) => localId);
    /** @type TAllocationFractions */
    const fractions = groupIds.reduce((fractions, groupId) => {
      /** @type TAllocationFractionsGroup */
      const fractionsGroup = productionIds.reduce((fractionsProduction, productionId, idx) => {
        const isLast = idx === productionIds.length - 1;
        const value = isLast ? 1 : 0;
        fractionsProduction[productionId] = value;
        return fractionsProduction;
      }, {});
      fractions[groupId] = fractionsGroup;
      return fractions;
    }, {});
    // Save result data...
    state.fractions = fractions;
  }

  resetAllocationFractions() {
    const { state } = this;
    state.fractions = undefined;
  }

  resetAllocateMode() {
    this.updaters.clearAllErrors();
  }

  // Start allocate...
  startAllocateMode() {
    const { renderAllocate } = this;
    this.resetAllocateMode();
    this.createDefaultAllocationFractions();
    renderAllocate.renderAllocateNodes();
    this.updateAllocateModeDomNodes();
  }

  // Return from allocate...
  backFromAllocateMode() {
    const { renderAllocate } = this;
    this.backFromAllocateModeDomNodes();
    renderAllocate.clearAllocateNodes();
    this.resetAllocateMode();
    this.resetAllocationFractions();
  }

  /** Prepare and data to the server.
   * @result {TAllocationResult}
   */
  getAllocationResultData() {
    const { state } = this;
    const { processId, groups, fractions, production } = state;
    /** @type TAllocationResultGroup[] */
    const resultGroups = groups.map((group) => {
      const {
        // localId: groupId, // TLocalGroupId
        name, // string
        items, // TAllocationData[]
      } = group;
      const technosphere = items.filter(({ type }) => type === 'technosphere').map(({ id }) => id);
      const biosphere = items.filter(({ type }) => type === 'biosphere').map(({ id }) => id);
      /** @type TAllocationResultGroup */
      const result = {
        name, // string
        technosphere, // TAllocationId[]
        biosphere, // TAllocationId[]
      };
      return result;
    });
    /** @type TAllocationResultAllocation[] */
    const allocationList = production.map((data) => {
      const {
        id: productionId, // 191
        // type, // 'production'
        // amount, // 0.6858156846465647
        // input, // {name: 'Clay-Williams', unit: 'kilogram', location: 'GLO', product: 'LLC', categories: 'Unknown'}
        // output, // {name: 'Smith LLC', unit: 'kilogram', location: 'GLO', product: 'Inc', categories: 'Unknown'}
      } = data;
      /** @type TAllocationResultAllocationGroup[] */
      const allocationGroups = groups.map((group) => {
        const {
          localId: groupId, // TLocalGroupId
          name, // string
          // items, // TAllocationData[]
        } = group;
        const factor = fractions[groupId][productionId];
        /** @type TAllocationResultAllocationGroup */
        const allocationGroup = {
          name, // string
          factor, // number
        };
        return allocationGroup;
      });
      /** @type TAllocationResultAllocation */
      const allocationItem = {
        product: productionId, // TAllocationId // production[].id
        groups: allocationGroups, // TAllocationResultAllocationGroup[]
      };
      return allocationItem;
    });
    /** @type TAllocationResult */
    const allocationResult = {
      process: processId,
      groups: resultGroups, // TAllocationResultGroup[]
      allocation: allocationList, // TAllocationResultAllocation[]
    };
    return allocationResult;
  }

  // Final action. Prepare and send data to the server...
  confirmAllocateUpdater() {
    const { updaters } = this;
    const allocationResult = this.getAllocationResultData();
    // TODO: Send data to the server here.
    const resultJson = JSON.stringify(allocationResult, undefined, 2);
    const resultStr = resultJson.replace(/"/g, "'").replace(/'([^':]+)':/g, '$1:');
    console.log('[AllocatePageAllocateModeUpdaters:confirmAllocateUpdater]', {
      resultStr,
      allocationResult,
    });
    const previewContent = `
      <h4>These results will be sent to the server:</h4>
      <pre>${resultStr}
      </pre>
    `;
    updaters.setLoading(true);
    commonModal.ensureInit().then(() => {
      commonModal
        .setModalContentId('show-allocation-result')
        .setTitle('Allocation result preview')
        .setModalWindowOptions({
          // autoHeight: true,
          width: 'md',
        })
        .setModalContentOptions({
          // Scrollings and paddings will be set for inner components particaluary.
          scrollable: true,
          padded: true,
        })
        .setContent(previewContent)
        .onHide(() => {
          updaters.setLoading(false);
        })
        .showModal();
    });
  }
}
