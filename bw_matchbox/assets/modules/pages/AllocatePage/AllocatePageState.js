// @ts-check

import * as CommonHelpers from '../../common/CommonHelpers.js';

// Import only types...
/* eslint-disable no-unused-vars */
import { AllocatePageNodes } from './AllocatePageNodes.js';
/* eslint-enable no-unused-vars */

/**
 * @implements {TAllocatePageState}
 */
export class AllocatePageState {
  // Modules...
  /** type {AllocatePageNodes} */
  nodes;

  /** @type {TUserName} */
  currentUser;
  /** @type {TUserRole} */
  currentRole;

  /** @type {TAllocationData[]} */
  biosphere;
  /** @type {TAllocationData[]} */
  production;
  /** @type {TAllocationData[]} */
  technosphere;

  /** @param {TAllocatePageStateParams} params */
  constructor(params) {
    const {
      // Modules...
      nodes,
      // Data...
      production,
      technosphere,
      biosphere,
      // Current configuration parameters...
      currentRole,
      currentUser,
    } = params;
    // Modules...
    this.nodes = nodes;
    // Data...
    this.production = production;
    this.technosphere = technosphere;
    this.biosphere = biosphere;
    // Current configuration parameters...
    this.currentRole = currentRole;
    this.currentUser = currentUser;
  }

  /**
   * @param {boolean} isLoading
   */
  setLoading(isLoading) {
    const rootEl = document.getElementById('process-detail');
    rootEl.classList.toggle('loading', !!isLoading);
  }

  /** setError -- Set and show error.
   * @param {string|Error|string[]|Error[]} error - Error or errors list.
   */
  setError(error) {
    const hasErrors = !!error;
    const rootNode = this.nodes.getRootNode();
    rootNode.classList.toggle('has-error', hasErrors);
    // Show error...
    const text = CommonHelpers.getErrorText(error);
    const errorNode = this.nodes.getErrorNode();
    console.error('[AllocatePageState:setError]', {
      error,
      errorNode,
    });
    if (errorNode) {
      errorNode.innerHTML = text;
    }
  }

  clearError() {
    this.setError(undefined);
  }

  setInited() {
    // Set initialized state...
    const rootNode = this.nodes.getRootNode();
    rootNode.classList.toggle('inited', true);
  }
}
