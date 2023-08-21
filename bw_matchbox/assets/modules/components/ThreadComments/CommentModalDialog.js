// @ts-check

import { commonModal } from '../../common/CommonModal.js';

/** @typedef TCommentModalDialogUserAction
 * @property {string} comment
 * @property {string} [name]
 * @property {string} [status]
 */

export class CommentModalDialog {
  /** promiseCommentModal -- Show dialog and wait for action
   * @param {object} [params]
   * @param {boolean} [params.useName]
   * @return {string}
   */
  getCommentModalContent(params) {
    const {
      // prettier-ignore
      useName,
    } = params;
    const formItems = [
      useName &&
        `
          <div class="comment-modal-form-row">
            <label for="comment-modal-text">Name</label>
            <input type="text" class="u-full-width" id="comment-modal-name" name="comment-modal-name" />
          </div>
        `,
      `
        <div class="comment-modal-form-row">
          <label for="comment-modal-text">Comment</label>
          <textarea class="u-full-width" id="comment-modal-text" name="comment-modal-text"></textarea>
        </div>
      `,
    ].filter(Boolean);
    const content = `
      <div class="comment-modal-form" id="comment-modal-form">
        ${formItems.join('')}
      </div>
      <div class="comment-modal-actions">
        <button class="button-primary" id="comment-modal-ok">Ok</button>
        <button id="comment-modal-cancel">Cancel</button>
      </div>
    `;
    return content;
  }

  /** promiseCommentModal -- Show dialog and wait for action
   * @param {object} [params]
   * @param {string} [params.title]
   * @param {boolean} [params.useName]
   * @return {Promise<TCommentModalDialogUserAction | undefined>}
   */
  promiseCommentModal(params = {}) {
    const {
      // prettier-ignore
      title = 'Enter comment text',
      useName,
    } = params;
    return new Promise((resolve, reject) => {
      // const title = 'Enter comment text';
      const content = this.getCommentModalContent({ useName });
      let isOpened = true;
      commonModal
        .ensureInit()
        .then(() => {
          commonModal
            .setModalContentId('comment-dialog-modal')
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
                resolve(undefined);
              }
            })
            .showModal();
          const modalNode = commonModal.getModalNode();
          /** @type {HTMLButtonElement} */
          const okButtonEl = modalNode.querySelector('button#comment-modal-ok');
          /** @type {HTMLInputElement} */
          const form = modalNode.querySelector('#comment-modal-form');
          const firstInput = /** @type {HTMLInputElement} */ (
            form.querySelector('input, textarea')
          );
          if (firstInput && firstInput.focus) {
            firstInput.focus();
          }
          okButtonEl.addEventListener('click', () => {
            if (isOpened) {
              isOpened = false;
              commonModal.hideModal({ dontNotify: true });
              // Success: proceed with comment text
              const commentTextEl = /** @type {HTMLInputElement} */ (
                modalNode.querySelector('textarea#comment-modal-text')
              );
              const comment = commentTextEl.value;
              const commentNameEl = /** @type {HTMLInputElement} */ (
                modalNode.querySelector('input#comment-modal-name')
              );
              const name = commentNameEl && commentNameEl.value;
              /** @type {TCommentModalDialogUserAction} */
              const userAction = { comment, status: 'comment from promiseCommentModal' };
              if (name) {
                userAction.name = name;
              }
              resolve(userAction);
            }
          });
          document
            .getElementById('comment-modal-cancel')
            .addEventListener('click', commonModal.getBoundHideModal());
        })
        .catch(reject);
    });
  }
}
