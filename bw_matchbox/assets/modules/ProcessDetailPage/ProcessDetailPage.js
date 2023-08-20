// @ts-check

import * as CommonHelpers from '../common/CommonHelpers.js';
import { commonModal } from '../common/CommonModal.js';
// import { commonNotify } from '../common/CommonNotify.js';

import { ThreadComments } from '../components/ThreadComments/ThreadComments.js';

import * as ProcessDetailPageHelpers from './ProcessDetailPageHelpers.js';
import { ProcessDetailPageState } from './ProcessDetailPageState.js';
import { ProcessDetailPageHandlers } from './ProcessDetailPageHandlers.js';

export const ProcessDetailPage = {
  /** External data...
   * @type {TSharedParams}
   */
  sharedParams: undefined, // Initializing in `ProcessDetailPage.start` from `bw_matchbox/assets/templates/process_detail.html`

  /** Handlers exchange object
   * @type {TSharedHandlers}
   */
  callbacks: {},

  /** @type {TThreadComments} */
  threadComments: undefined,

  /** @type {ProcessDetailPageState} */
  state: undefined,

  /**
   * @param {TSharedParams} sharedParams
   */
  start(sharedParams) {
    // Save public data...
    this.sharedParams = sharedParams;
    const threadComments = new ThreadComments('ProcessDetailPage');
    this.threadComments = threadComments;

    const { callbacks } = this;

    /*
     * [>* @type {TInitParams} <]
     * const initParams = {
     *   callbacks,
     *   threadComments,
     *   sharedParams,
     * };
     */

    const { isWaitlist } = sharedParams;

    this.state = new ProcessDetailPageState({ isWaitlist });
    this.handlers = new ProcessDetailPageHandlers({ sharedParams, callbacks, state: this.state });

    /* // (Optional) Pre-initialize submodules...
     * commonModal.preInit();
     * commonNotify.preInit();
     */
    /* // DEBUG: Test notify
     * commonNotify.showInfo('test');
     */
  },
};
