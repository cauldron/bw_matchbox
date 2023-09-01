// @ts-check

import { commonModal } from '../../common/CommonModal.js';

export class WaitlistCommentDialog {
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
  }

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
              /* @type {TWaitlistCommentDialogUserAction} Resolve result */
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
  }
}
