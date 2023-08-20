// @ts-check

import * as CommonHelpers from '../common/CommonHelpers.js';

/** @typedef TCreateParams
 * @property {boolean} isWaitlist
 */

/**
 * @class ProcessDetailPageState
 * @implements {ProcessDetailPageState}
 */
export class ProcessDetailPageState {
  /*
   * [>* External data...
   *  * @type {TSharedParams}
   *  <]
   * sharedParams = undefined; // Initializing in `ProcessDetailPage.start` from `bw_matchbox/assets/templates/process_detail.html`
   * [>* @type {TSharedHandlers} <]
   * callbacks = undefined;
   * [>* @type {TThreadComments} <]
   * threadComments = undefined;
   */

  /** @type {boolean} */
  isWaitlist = undefined;

  /** @param {TCreateParams} params */
  constructor(params) {
    const {
      // prettier-ignore
      isWaitlist,
    } = params;
    this.isWaitlist = isWaitlist;
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
