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

  /** Counter used to generate the unique id and name of the new groups
   * @type {number}
   */
  newGroupsCount;

  /** @constructor
   * @param {TAllocatePageStateParams} params
   */
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

  /** @param {TAllocationGroup} group */
  addNewGroup(group) {
    this.groups.push(group);
    // TODO: Update data?
  }
}
