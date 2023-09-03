// @ts-check

import * as CommonHelpers from '../../common/CommonHelpers.js';

// Import only types...
/* eslint-disable no-unused-vars */
import { AllocatePageNodes } from './AllocatePageNodes.js';
/* eslint-enable no-unused-vars */

/**
 * @implements TAllocatePageState
 */
export class AllocatePageState {
  // Modules...
  /** type AllocatePageNodes */
  nodes;

  /** @type TUserName */
  currentUser;
  /** @type TUserRole */
  currentRole;

  // External input data...

  /** @type TAllocationData[] */
  biosphere;
  /** @type TAllocationData[] */
  production;
  /** @type TAllocationData[] */
  technosphere;

  // Groups...

  /** @type TAllocatePageState['groups'] */
  groups;

  /** Counter used to generate the unique id and name of the new groups
   * @type {number}
   */
  newGroupsCount;

  /** @param {TAllocatePageStateParams} params */
  constructor(params) {
    // Modules...
    this.nodes = params.nodes;
    // Groups...
    this.groups = params.groups || [];
    this.newGroupsCount = this.groups.length;
    // Data...
    this.production = params.production;
    this.technosphere = params.technosphere;
    this.biosphere = params.biosphere;
    // Current configuration parameters...
    this.currentRole = params.currentRole;
    this.currentUser = params.currentUser;
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
    const columnsLayout = this.nodes.getColumnsLayoutNode();
    columnsLayout.classList.toggle('common-hidden', false);
  }

  /** @param {TAllocationGroup} group */
  addNewGroup(group) {
    this.groups.push(group);
    // TODO: Update data?
  }
}
