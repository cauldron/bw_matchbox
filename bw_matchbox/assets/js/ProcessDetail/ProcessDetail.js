modules.define(
  'ProcessDetail',
  [
    // Required modules...
    'CommonHelpers',
    'CommonModal',
  ],
  function provide_ProcessDetail(
    provide,
    // Resolved modules...
    CommonHelpers,
    CommonModal,
  ) {
    // Define module...
    const ProcessDetail = {
      // External data...
      sharedData: undefined, // Initializing in `ProcessDetail.start` from `bw_matchbox/assets/templates/process_detail.html`

      // Methods...

      getMarkWaitlistDialogContent() {
        const content = `
          <div class="mark-waitlist-form">
            <label for="mark-waitlist-comment">Comment</label>
            <textarea class="u-full-width" id="mark-waitlist-comment" name="mark-waitlist-comment"></textarea>
          </div>
          <div class="mark-waitlist-actions">
            <button class="button-primary disabled" id="mark-waitlist-ok">Ok</button>
            <button id="mark-waitlist-cancel">Cancel</button>
          </div>
        `;
        return content;
      },

      /** promiseMarkWaitlistDialog -- Show dialog and wait for action
       * @return {Promise}
       */
      promiseMarkWaitlistDialog() {
        return new Promise((resolve, _reject) => {
          const title = 'Waitlist this process';
          const content = this.getMarkWaitlistDialogContent();
          let isOpened = true;
          CommonModal.setModalContentId('mark-waitlist-dialog-modal')
            .setTitle(title)
            .setModalWindowOptions({
              // fullWindowWidth: true, // UNUSED (Default behavior)
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
                // Don't proceed the operation!
                resolve(false);
              }
            })
            .showModal();
          let comment = '';
          let hasComment = false;
          const commentEl = document.getElementById('mark-waitlist-comment');
          const okButtonEl = document.getElementById('mark-waitlist-ok');
          commentEl.addEventListener('input', (event) => {
            const { target } = event;
            const { value } = target;
            comment = value;
            const hasValue = !!value;
            if (hasValue !== hasComment) {
              okButtonEl.classList.toggle('disabled', !hasValue);
              hasComment = hasValue;
            }
          });
          // TODO: Add handlers for modal actions
          okButtonEl.addEventListener('click', () => {
            if (isOpened) {
              isOpened = false;
              CommonModal.hideModal({ dontNotify: true });
              // Success: proceed with comment text
              resolve({ comment });
            }
          });
          document
            .getElementById('mark-waitlist-cancel')
            .addEventListener('click', CommonModal.hideModal.bind(CommonModal));
        });
      },

      /** doMarkWaitlist -- Send mark as waitlist requests
       * @param {HTMLButtonElement} button
       * @param {object} userAction - Result of `promiseMarkWaitlistDialog` (`{ comment }` or `false`)
       */
      doMarkWaitlist(button, userAction) {
        const { comment } = userAction;
        const { sharedData } = this;
        const { addAttributeUrl } = sharedData;
        const urlBase = addAttributeUrl;
        // ?attr=match_type&value=1
        const urlQuery1 = CommonHelpers.makeQuery(
          { attr: 'match_type', value: 1 },
          { addQuestionSymbol: true },
        );
        // ?attr=waitlist_comment&value=<comment text>
        const urlQuery2 = CommonHelpers.makeQuery(
          { attr: 'waitlist_comment', value: comment },
          { addQuestionSymbol: true },
        );
        const url1 = urlBase + urlQuery1;
        const url2 = urlBase + urlQuery2;
        // DEBUG: For the test time
        console.log('[ProcessDetail:doMarkWaitlist] start', {
          comment,
          userAction,
          addAttributeUrl,
          urlBase,
          url1,
          url2,
          urlQuery1,
          urlQuery2,
        });
        // Call both requests at once...
        const allPromises = [fetch(url1), fetch(url2)];
        return Promise.all(allPromises).then((resList) => {
          const errorsList = resList
            .map((res) => {
              if (!res.ok) {
                return new Error(`HTTP error ${res.status}`);
              }
            })
            .filter(Boolean);
          const hasErrors = !!errorsList.length;
          // DEBUG: For the test time
          console.log('[ProcessDetail:doMarkWaitlist] success', {
            hasErrors,
            resList,
            errorsList,
          });
          debugger;
          if (!hasErrors) {
            // All is ok...
            button.innerText = 'Waitlisted';
            button.classList.remove('button-primary');
          } else {
            // Some errors?
            // eslint-disable-next-line no-console
            console.error('[ProcessDetail:doMarkWaitlist] Got errors', errorsList);
            // eslint-disable-next-line no-debugger
            debugger;
            // TODO: To show errors on the page?
            // TODO: Throw some error?
          }
        });
      },

      /** markWaitlist -- Handler for 'Waitlist' button.
       * @param {<HTMLButtonElement>} button
       */
      markWaitlist(button) {
        return this.promiseMarkWaitlistDialog().then((userAction) => {
          if (userAction) {
            return this.doMarkWaitlist(button, userAction);
          }
        });
      },

      /** markMatched -- Handler for 'No match needed' button.
       * @param {<HTMLButtonElement>} button
       */
      markMatched(button) {
        const { sharedData } = this;
        fetch(sharedData.markMatchTypeUrl);
        const url = sharedData.markMatchedUrl;
        fetch(url).then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }
          button.innerText = 'Matched';
          button.classList.remove('button-primary');
          document.getElementById('match-button').style.display = 'none';
          document.getElementById('manual-multi-match').style.display = 'none';
          if (sharedData.multimatchi) {
            document.getElementById('manual-multi-match').style.display = 'none';
          }
        });
      },

      /** markAllMatched -- Handler for 'Mark all matched' button.
       * @param {<HTMLButtonElement>} button
       */
      markAllMatched(button) {
        const { sharedData } = this;
        const url = sharedData.markAllMatchedUrl;
        fetch(url).then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }
          button.innerText = 'Matched';
          button.classList.remove('button-primary');
          document.getElementById('manual-match').style.display = 'none';
          document.getElementById('match-button').style.display = 'none';
        });
      },

      start(sharedData) {
        // Save public data...
        this.sharedData = sharedData;
      },
    };

    // Provide module...
    provide(ProcessDetail);
  },
);
