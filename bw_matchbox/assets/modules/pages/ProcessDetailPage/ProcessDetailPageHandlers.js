// @ts-check

import * as CommonHelpers from '../../common/CommonHelpers.js';

import { WaitlistCommentDialog } from './WaitlistCommentDialog.js';

/** @typedef TCreateParams
 * @property {TProcessDetailPageState} state
 * @property {TProcessDetailPageNodes} nodes
 * @property {TSharedHandlers} callbacks
 * @property {TSharedParams} sharedParams
 * @property {TThreadComments} threadComments
 */

/**
 * @class ProcessDetailPageHandlers
 */
export class ProcessDetailPageHandlers {
  /** @type {TSharedParams} */
  sharedParams;
  /** @type {TProcessDetailPageState} */
  state;
  /** @type {TProcessDetailPageNodes} */
  nodes;
  /** @type {TSharedHandlers} */
  callbacks;
  /** @type {TThreadComments} */
  threadComments;

  /** @param {TCreateParams} params */
  constructor(params) {
    const {
      // prettier-ignore
      state,
      nodes,
      sharedParams,
      callbacks,
      threadComments,
    } = params;
    this.state = state;
    this.nodes = nodes;
    this.sharedParams = sharedParams;
    this.callbacks = callbacks;
    this.threadComments = threadComments;
    CommonHelpers.exportCallbacksFromInstance(callbacks, this);
  }

  // Handlers...

  /** doMarkWaitlist -- Send mark as waitlist requests
   * @param {TWaitlistCommentDialogUserAction} userAction - Result of `promiseMarkWaitlistDialog` (`{ comment }` or `false`)
   */
  async doMarkWaitlist(userAction) {
    const { comment = '' } = userAction;
    const { sharedParams } = this;
    const { isWaitlist } = this.state;
    const setWaitlist = !isWaitlist;
    const waitlistValue = setWaitlist ? 1 : 0;
    const { addAttributeUrl } = sharedParams;
    const urlBase = addAttributeUrl;
    const makeUrlParams = { addQuestionSymbol: true, useEmptyStrings: true };
    const urls = [
      // Url #1, Eg: ?attr=match_type&value=1
      urlBase + CommonHelpers.makeQuery({ attr: 'waitlist', value: waitlistValue }, makeUrlParams),
      // Url #2, Eg: ?attr=waitlist_comment&value=<comment text>
      urlBase +
        CommonHelpers.makeQuery({ attr: 'waitlist_comment', value: comment }, makeUrlParams),
    ].filter(Boolean);
    // Call both requests at once...
    const callbacks = urls.map((url) => () => fetch(url));
    this.state.setLoading(true);
    // Run callbacks one by one...
    try {
      const resList = await CommonHelpers.runAsyncCallbacksSequentially(callbacks);
      const errorsList = CommonHelpers.processMultipleRequestErrors(resList);
      if (errorsList.length) {
        // Some errors?
        // eslint-disable-next-line no-console
        console.error('[ProcessDetailPage:doMarkWaitlist] Got errors', errorsList);
        // eslint-disable-next-line no-debugger
        debugger;
        // Show errors on the page...
        this.state.setError(errorsList);
      } else {
        // Success...
        this.state.setWaitlist(setWaitlist);
        this.state.clearError();
      }
    } finally {
      this.state.setLoading(false);
    }
  }

  /** markWaitlist -- Handler for 'Waitlist' button.
   */
  async markWaitlist() {
    const { isWaitlist } = this.state;
    const setWaitlist = !isWaitlist;
    const waitlistCommentDialog = new WaitlistCommentDialog();
    // Show dialog or go directly to action...
    const userAction = setWaitlist
      ? await waitlistCommentDialog.promiseMarkWaitlistDialog()
      : { status: 'no comment required for un-waitlist' };
    if (userAction) {
      return this.doMarkWaitlist(userAction);
    }
  }

  /** markMatched -- Handler for 'No match needed' button.
   * @param {HTMLButtonElement} button
   */
  async markMatched(button) {
    const { sharedParams } = this;
    const urls = [sharedParams.markMatchedUrl, sharedParams.markMatchTypeUrl];
    const callbacks = urls.map((url) => () => fetch(url));
    this.state.setLoading(true);
    // Run callbacks one by one...
    try {
      const resList = await CommonHelpers.runAsyncCallbacksSequentially(callbacks);
      const errorsList = CommonHelpers.processMultipleRequestErrors(resList);
      if (errorsList.length) {
        // Some errors?
        // eslint-disable-next-line no-console
        console.error('[ProcessDetailPage:markMatched] Got errors', errorsList);
        // eslint-disable-next-line no-debugger
        debugger;
        // Show errors on the page...
        this.state.setError(errorsList);
      } else {
        // Success...
        button.innerText = 'Matched';
        button.classList.remove('button-primary');
        document.getElementById('match-button').style.display = 'none';
        document.getElementById('manual-multi-match').style.display = 'none';
        if (sharedParams.multimatch) {
          document.getElementById('manual-multi-match').style.display = 'none';
        }
        this.state.clearError();
      }
    } finally {
      this.state.setLoading(false);
    }
  }

  /** markAllMatched -- Handler for 'Mark all matched' button.
   * @param {HTMLButtonElement} button
   */
  markAllMatched(button) {
    const { sharedParams } = this;
    const url = sharedParams.markAllMatchedUrl;
    this.state.setLoading(true);
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          const error = new Error(`Can't load url '${res.url}': ${res.statusText}, ${res.status}`);
          // eslint-disable-next-line no-console
          console.error('[ProcessDetailPage:markAllMatched] Got error', error);
          // eslint-disable-next-line no-debugger
          debugger;
          // Show errors on the page...
          this.state.setError(error);
        } else {
          button.innerText = 'Matched';
          button.classList.remove('button-primary');
          document.getElementById('manual-match').style.display = 'none';
          document.getElementById('match-button').style.display = 'none';
          this.state.clearError();
        }
      })
      .finally(() => {
        this.state.setLoading(false);
      });
  }

  toggleCommentsPanel() {
    const { nodes, callbacks } = this;
    const layoutNode = nodes.getLayoutNode();
    const panel = layoutNode.querySelector('#thread-comments-panel');
    const button = layoutNode.querySelector('#toggle-side-panel-button');
    const hasPanel = layoutNode.classList.contains('has-panel');
    const showPanel = !hasPanel;
    layoutNode.classList.toggle('has-panel', showPanel);
    button.classList.toggle('turned', showPanel);
    panel.classList.toggle('hidden', !showPanel);
    if (showPanel) {
      callbacks.ensureThreadComments();
    }
  }

  /** @param {HTMLSelectElement} node */
  setSortMode(node) {
    const { value } = node;
    const { threadComments } = this;
    /* console.log('[ProcessDetailPageHandlers:setSortMode]', {
     *   value,
     * });
     */
    threadComments.handlers.setSortMode(value);
  }

  addNewThread() {
    const { threadComments } = this;
    threadComments.handlers.addNewThread();
  }

  expandAllThreads() {
    const { threadComments } = this;
    threadComments.handlers.expandAllThreads();
  }
}
