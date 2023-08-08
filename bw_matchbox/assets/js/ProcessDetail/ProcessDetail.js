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

      setLoading(isLoading) {
        const rootEl = document.getElementById('process-detail');
        rootEl.classList.toggle('loading', !!isLoading);
      },

      setWaitlist(isWaitlist) {
        // Update root container state...
        const rootEl = document.getElementById('process-detail');
        rootEl.classList.toggle('waitlist', !!isWaitlist);
        // Update button...
        const waitlistButton = document.getElementById('mark-waitlist');
        // NOTE: `button-primary` = un-waitlised status
        waitlistButton.classList.toggle('button-primary', !isWaitlist);
        waitlistButton.innerText = isWaitlist ? 'Waitlisted' : 'Waitlist';
        // Update parameter in `sharedData`...
        const { sharedData } = this;
        sharedData.isWaitlist = isWaitlist;
      },

      /** setError -- Set and show error.
       * @param {string|error|string[]|error[]} error - Error or errors list.
       */
      setError(error) {
        const hasErrors = !!error;
        const rootEl = document.getElementById('process-detail');
        rootEl.classList.toggle('has-error', hasErrors);
        // Show error...
        const text = CommonHelpers.getErrorText(error);
        const errorEl = document.getElementById('error');
        /* console.log('[ProcessDetail:setError]', {
         *   error,
         *   text,
         * });
         */
        errorEl.innerHTML = text;
      },

      clearError() {
        this.setError(undefined);
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
        return new Promise((resolve, _reject) => {
          const title = 'Waitlist this process';
          const content = this.getMarkWaitlistDialogContent();
          let isOpened = true;
          CommonModal.setModalContentId('mark-waitlist-dialog-modal')
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
                // Don't proceed the operation!
                resolve(false);
              }
            })
            .showModal();
          // Store comment value...
          const okButtonEl = document.getElementById('mark-waitlist-ok');
          // TODO: Add handlers for modal actions
          okButtonEl.addEventListener('click', () => {
            if (isOpened) {
              isOpened = false;
              CommonModal.hideModal({ dontNotify: true });
              // Success: proceed with comment text
              const commentEl = document.getElementById('mark-waitlist-comment');
              const comment = commentEl.value;
              resolve({ comment, status: 'comment from promiseMarkWaitlistDialog' });
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
      doMarkWaitlist(userAction) {
        const { comment = '' } = userAction;
        const { sharedData } = this;
        const { isWaitlist } = sharedData;
        const setWaitlist = !isWaitlist;
        const waitlistValue = setWaitlist ? 1 : 0;
        const { addAttributeUrl } = sharedData;
        const urlBase = addAttributeUrl;
        const makeUrlParams = { addQuestionSymbol: true, useEmptyStrings: true };
        const urls = [
          // Url #1, Eg: ?attr=match_type&value=1
          urlBase +
            CommonHelpers.makeQuery({ attr: 'waitlist', value: waitlistValue }, makeUrlParams),
          // Url #2, Eg: ?attr=waitlist_comment&value=<comment text>
          urlBase +
            CommonHelpers.makeQuery({ attr: 'waitlist_comment', value: comment }, makeUrlParams),
        ].filter(Boolean);
        // Call both requests at once...
        const requests = urls.map((url) => fetch(url));
        // DEBUG: While #57 is in progress or in testing...
        console.log('[ProcessDetail:doMarkWaitlist]', {
          setWaitlist,
          urls,
          requests,
          userAction,
        });
        this.setLoading(true);
        return Promise.all(requests)
          .then((resList) => {
            const errorsList = resList
              .map((res) => {
                if (!res.ok) {
                  return new Error(`Can't load url '${res.url}': ${res.statusText}, ${res.status}`);
                }
              })
              .filter(Boolean);
            const hasErrors = !!errorsList.length;
            if (!hasErrors) {
              // All is ok...
              this.setWaitlist(setWaitlist);
              this.clearError();
            } else {
              // Some errors?
              // eslint-disable-next-line no-console
              console.error('[ProcessDetail:doMarkWaitlist] Got errors', errorsList);
              // eslint-disable-next-line no-debugger
              debugger;
              // Show errors on the page...
              this.setError(errorsList);
            }
          })
          .finally(() => {
            this.setLoading(false);
          });
      },

      /** markWaitlist -- Handler for 'Waitlist' button.
       * @param {<HTMLButtonElement>} button
       */
      markWaitlist(button) {
        const { sharedData } = this;
        const { isWaitlist } = sharedData;
        const setWaitlist = !isWaitlist;
        const firstPromise = setWaitlist
          ? this.promiseMarkWaitlistDialog()
          : Promise.resolve({ status: 'no comment required for un-waitlist' });
        return firstPromise.then((userAction) => {
          if (userAction) {
            return this.doMarkWaitlist(userAction);
          }
        });
      },

      /** markMatched -- Handler for 'No match needed' button.
       * @param {<HTMLButtonElement>} button
       */
      markMatched(button) {
        const { sharedData } = this;
        const url = sharedData.markMatchedUrl;
        fetch(url).then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }
          fetch(sharedData.markMatchTypeUrl);
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
