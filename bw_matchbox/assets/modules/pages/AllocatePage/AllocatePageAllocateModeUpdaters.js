// @ts-check

import * as CommonHelpers from '../../common/CommonHelpers.js';

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
    // Export all methods as external handlers...
    CommonHelpers.exportCallbacksFromInstance(params.callbacks, this);
  }

  // Allocate mode...

  /**
   * @param {HTMLInputElement} inputNode
   */
  getAllocateModeFractionValueProps(inputNode) {
    const id = inputNode.getAttribute('id');
    const productionId = /** @type TAllocationId */ (
      Number(inputNode.getAttribute('data-production-id'))
    );
    const groupId = /** @type TAllocationId */ (Number(inputNode.getAttribute('data-group-id')));
    const value = Number(inputNode.value);
    return {
      id,
      productionId,
      groupId,
      value,
    };
  }

  /** Check if value is correct?
   * @param {number} value
   * @return boolean
   */
  checkAllocateModeFractionValue(value) {
    if (value < 0) {
      return false;
    }
    if (value > 1) {
      return false;
    }
    return true;
  }

  /** Check the value only when user finished changing it
   * @param {HTMLInputElement} inputNode
   */
  checkAllocateModeFractionValueOnChange(inputNode) {
    const { id, value, productionId, groupId } = this.getAllocateModeFractionValueProps(inputNode);
    console.log('[AllocatePageUpdaters:checkAllocateModeFractionValueOnChange]', {
      id,
      productionId,
      groupId,
      value,
      inputNode,
    });
  }

  /** Check the value after each small change
   * @param {HTMLInputElement} inputNode
   */
  checkAllocateModeFractionValueOnInput(inputNode) {
    const { id, value, productionId, groupId } = this.getAllocateModeFractionValueProps(inputNode);
    console.log('[AllocatePageUpdaters:checkAllocateModeFractionValueOnInput]', {
      id,
      productionId,
      groupId,
      value,
      inputNode,
    });
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
    this.updaters.clearError();
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
}
