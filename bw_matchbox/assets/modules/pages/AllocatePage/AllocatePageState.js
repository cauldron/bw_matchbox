// @ts-check

// import * as CommonHelpers from '../../common/CommonHelpers.js';

// Import only types...
/* eslint-disable no-unused-vars */
import { AllocatePageNodes } from './AllocatePageNodes.js';
/* eslint-enable no-unused-vars */

/**
 * @class AllocatePageState
 */
export class AllocatePageState {
  // Modules...
  /** @type AllocatePageNodes */
  nodes;

  /** @type Record<string, TErrorLikePlural> */
  errors = {};

  /** @type TProcessId */
  processId;

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

  /** @type TAllocationGroup[] */
  groups;
  /** @type TAllocationFractions */
  fractions;

  /** @constructor
   * @param {TAllocatePageStateParams} params
   */
  constructor(params) {
    // Modules...
    this.nodes = params.nodes;
    // Groups...
    this.groups = params.groups || [];
    // Data...
    this.production = params.production;
    this.technosphere = params.technosphere;
    this.biosphere = params.biosphere;
    // Current configuration parameters...
    this.processId = params.processId;
    this.currentRole = params.currentRole;
    this.currentUser = params.currentUser;
  }

  /** @param {TLocalGroupId} groupId */
  isUniqueGroupId(groupId) {
    const { groups } = this;
    const found = groups.find(({ localId }) => localId === groupId);
    return !found;
  }

  /** @return {TLocalGroupId} */
  getUniqueGroupId() {
    const { groups } = this;
    const lastGroupIdx = groups.length - 1;
    const lastGroup = groups[lastGroupIdx];
    let groupId = lastGroup ? lastGroup.localId + 1 : 1; // this.newGroupsCount;
    while (!this.isUniqueGroupId(groupId)) {
      groupId++;
    }
    return groupId;
  }
}
