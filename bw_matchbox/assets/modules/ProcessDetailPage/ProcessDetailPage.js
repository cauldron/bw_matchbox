// @ts-check

import * as CommonHelpers from '../common/CommonHelpers.js';
import { commonModal } from '../common/CommonModal.js';
// import { commonNotify } from '../common/CommonNotify.js';

/** @typedef TSharedParams
 * @property {string} addAttributeUrl
 * @property {string} markMatchTypeUrl
 * @property {string} markMatchedUrl
 * @property {string} markAllMatchedUrl
 * @property {string} multimatch
 * @property {boolean} isWaitlist
 */

/** @typedef TUserAction
 * @property {string} comment
 * @property {string} [status]
 */

export const ProcessDetailPage = {
  /** External data...
   * @type TSharedParams
   */
  sharedParams: undefined, // Initializing in `ProcessDetailPage.start` from `bw_matchbox/assets/templates/process_detail.html`

  // Methods...

  /**
   * @param {boolean} isLoading
   */
  setLoading(isLoading) {
    const rootEl = document.getElementById('process-detail');
    rootEl.classList.toggle('loading', !!isLoading);
  },

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
    const { sharedParams } = this;
    sharedParams.isWaitlist = isWaitlist;
  },

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
  },

  clearError() {
    this.setError(undefined);
  },

  /** processMultipleRequestErrors
   * @param {Response[]} resList
   * @return {Error[]}
   */
  processMultipleRequestErrors(resList) {
    return resList
      .map((res) => {
        if (!res.ok) {
          return new Error(`Can't load url '${res.url}': ${res.statusText}, ${res.status}`);
        }
      })
      .filter(Boolean);
  },

  getMarkWaitlistDialogContent() {
    const content = `
      <div class="mark-waitlist-form">
        <label for="mark-waitlist-comment">Comment</label>
        <textarea class="u-full-width" id="mark-waitlist-comment" name="mark-waitlist-comment"></textarea>
      </div>
      <div class="mark-waitlist-actions">
        <button class="button-primary" id="mark-waitlist-ok">Ok</button>
        <button id="mark-waitlist-cancel">Cancel</button>
      </div>
    `;
    return content;
  },

  /** promiseMarkWaitlistDialog -- Show dialog and wait for action
   * @return {Promise}
   */
  promiseMarkWaitlistDialog() {
    return new Promise((resolve, reject) => {
      const title = 'Waitlist this process';
      const content = this.getMarkWaitlistDialogContent();
      let isOpened = true;
      commonModal
        .ensureInit()
        .then(() => {
          commonModal
            .setModalContentId('mark-waitlist-dialog-modal')
            .setTitle(title)
            .setModalWindowOptions({
              autoHeight: true,
              width: 'md',
            })
            .setModalContentOptions({
              scrollable: true,
              padded: true,
            })
            .setContent(content)
            .onHide(() => {
              // It will be called on modal close...
              if (isOpened) {
                isOpened = false;
                // Resolve empty value: Don't proceed the operation!
                resolve(false);
              }
            })
            .showModal();
          // Store comment value...
          /** @type {HTMLButtonElement} */
          const okButtonEl = document.querySelector('button#mark-waitlist-ok');
          // TODO: Add handlers for modal actions
          okButtonEl.addEventListener('click', () => {
            if (isOpened) {
              isOpened = false;
              commonModal.hideModal({ dontNotify: true });
              // Success: proceed with comment text
              /** @type {HTMLTextAreaElement} */
              const commentEl = document.querySelector('textarea#mark-waitlist-comment');
              const comment = commentEl.value;
              /* @type {TUserAction} Resolve result */
              const userAction = { comment, status: 'comment from promiseMarkWaitlistDialog' };
              resolve(userAction);
            }
          });
          document
            .getElementById('mark-waitlist-cancel')
            .addEventListener('click', commonModal.getBoundHideModal());
        })
        .catch(reject);
    });
  },

  /** doMarkWaitlist -- Send mark as waitlist requests
   * @param {TUserAction} userAction - Result of `promiseMarkWaitlistDialog` (`{ comment }` or `false`)
   */
  async doMarkWaitlist(userAction) {
    const { comment = '' } = userAction;
    const { sharedParams } = this;
    const { isWaitlist } = sharedParams;
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
    this.setLoading(true);
    // Run callbacks one by one...
    try {
      const resList = await CommonHelpers.runAsyncCallbacksSequentially(callbacks);
      const errorsList = this.processMultipleRequestErrors(resList);
      if (errorsList.length) {
        // Some errors?
        // eslint-disable-next-line no-console
        console.error('[ProcessDetailPage:doMarkWaitlist] Got errors', errorsList);
        // eslint-disable-next-line no-debugger
        debugger;
        // Show errors on the page...
        this.setError(errorsList);
      } else {
        // Success...
        this.setWaitlist(setWaitlist);
        this.clearError();
      }
    } finally {
      this.setLoading(false);
    }
  },

  /** markWaitlist -- Handler for 'Waitlist' button.
   */
  markWaitlist() {
    const { sharedParams } = this;
    const { isWaitlist } = sharedParams;
    const setWaitlist = !isWaitlist;
    const firstPromise = setWaitlist
      ? this.promiseMarkWaitlistDialog()
      : Promise.resolve({ status: 'no comment required for un-waitlist' });
    return (
      firstPromise
        .then((userAction) => {
          if (userAction) {
            return this.doMarkWaitlist(userAction);
          }
        })
        // Suppress exceptions on top-level handler (should be catched before)
        .catch((e) => e)
    );
  },

  /** markMatched -- Handler for 'No match needed' button.
   * @param {HTMLButtonElement} button
   */
  async markMatched(button) {
    const { sharedParams } = this;
    const urls = [sharedParams.markMatchedUrl, sharedParams.markMatchTypeUrl];
    const callbacks = urls.map((url) => () => fetch(url));
    this.setLoading(true);
    // Run callbacks one by one...
    try {
      const resList = await CommonHelpers.runAsyncCallbacksSequentially(callbacks);
      const errorsList = this.processMultipleRequestErrors(resList);
      if (errorsList.length) {
        // Some errors?
        // eslint-disable-next-line no-console
        console.error('[ProcessDetailPage:markMatched] Got errors', errorsList);
        // eslint-disable-next-line no-debugger
        debugger;
        // Show errors on the page...
        this.setError(errorsList);
      } else {
        // Success...
        button.innerText = 'Matched';
        button.classList.remove('button-primary');
        document.getElementById('match-button').style.display = 'none';
        document.getElementById('manual-multi-match').style.display = 'none';
        if (sharedParams.multimatch) {
          document.getElementById('manual-multi-match').style.display = 'none';
        }
        this.clearError();
      }
    } finally {
      this.setLoading(false);
    }
  },

  /** markAllMatched -- Handler for 'Mark all matched' button.
   * @param {HTMLButtonElement} button
   */
  markAllMatched(button) {
    const { sharedParams } = this;
    const url = sharedParams.markAllMatchedUrl;
    this.setLoading(true);
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          const error = new Error(`Can't load url '${res.url}': ${res.statusText}, ${res.status}`);
          // eslint-disable-next-line no-console
          console.error('[ProcessDetailPage:markAllMatched] Got error', error);
          // eslint-disable-next-line no-debugger
          debugger;
          // Show errors on the page...
          this.setError(error);
        } else {
          button.innerText = 'Matched';
          button.classList.remove('button-primary');
          document.getElementById('manual-match').style.display = 'none';
          document.getElementById('match-button').style.display = 'none';
          this.clearError();
        }
      })
      .finally(() => {
        this.setLoading(false);
      });
  },

  /**
   * @param {TSharedParams} sharedParams
   */
  start(sharedParams) {
    // Save public data...
    this.sharedParams = sharedParams;
    /* // (Optional) Pre-initialize submodules...
     * commonModal.preInit();
     * commonNotify.preInit();
     */
    /* // DEBUG: Test notify
     * commonNotify.showInfo('test');
     */
  },
};
