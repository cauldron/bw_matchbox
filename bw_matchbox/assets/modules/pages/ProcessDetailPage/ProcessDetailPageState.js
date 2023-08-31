// @ts-check

import * as CommonHelpers from '../../common/CommonHelpers.js';

/** @typedef TCreateParams
 * @property {boolean} isWaitlist
 * @property {TUserName} currentUser
 * @property {TUserRole} currentRole
 * @property {TProcessId} currentProcess
 */

/**
 * @class ProcessDetailPageState
 * @implements {TProcessDetailPageState}
 */
export class ProcessDetailPageState {
  /** @type {boolean} */
  isWaitlist;
  /** @type {TUserName} */
  currentUser;
  /** @type {TUserRole} */
  currentRole;
  /** @type {TProcessId} */
  currentProcess;

  /** @param {TCreateParams} params */
  constructor(params) {
    const {
      // prettier-ignore
      isWaitlist,
      currentUser,
      currentRole,
      currentProcess,
    } = params;
    this.isWaitlist = isWaitlist;
    this.currentUser = currentUser;
    this.currentRole = currentRole;
    this.currentProcess = currentProcess;
  }

  /**
   * @param {boolean} isLoading
   */
  setLoading(isLoading) {
    const rootEl = document.getElementById('process-detail');
    rootEl.classList.toggle('loading', !!isLoading);
  }

  /**
   * @param {boolean} isWaitlist
   */
  setWaitlist(isWaitlist) {
    // Update root container state...
    const rootEl = document.getElementById('process-detail');
    rootEl.classList.toggle('waitlist', !!isWaitlist);
    // Update button...
    const waitlistButton = document.getElementById('mark-waitlist');
    // NOTE: `button-primary` = un-waitlised status
    waitlistButton.classList.toggle('button-primary', !isWaitlist);
    waitlistButton.innerText = isWaitlist ? 'Waitlisted' : 'Waitlist';
    // Update parameter in `sharedParams`...
    this.isWaitlist = isWaitlist;
  }

  /** setError -- Set and show error.
   * @param {string|Error|string[]|Error[]} error - Error or errors list.
   */
  setError(error) {
    const hasErrors = !!error;
    const rootEl = document.getElementById('process-detail');
    rootEl.classList.toggle('has-error', hasErrors);
    // Show error...
    const text = CommonHelpers.getErrorText(error);
    const errorEl = document.getElementById('error');
    errorEl.innerHTML = text;
  }

  clearError() {
    this.setError(undefined);
  }
}
