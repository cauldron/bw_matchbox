modules.define(
  'CommonModal',
  [
    // Required modules...
    'CommonHelpers',
  ],
  function provide_CommonModal(
    provide,
    // Resolved modules...
    CommonHelpers,
  ) {
    // Define module...

    const CommonModal = {
      /** Initialized flag (see `inited` method) */
      inited: false,

      onHideHandlers: [],

      onHide(cb) {
        if (cb && typeof cb === 'function') {
          this.onHideHandlers.push(cb);
        }
        return this;
      },

      clearOnHideHandlers() {
        // Clear handlers list...
        if (this.onHideHandlers.length) {
          this.onHideHandlers.length = 0; //  = [];
        }
        return this;
      },

      invokeOnHideHandlers() {
        if (this.onHideHandlers.length) {
          // Invoke all the hide handlers and empty the list...
          let cb;
          while ((cb = this.onHideHandlers.shift()) != undefined) {
            if (cb && typeof cb === 'function') {
              try {
                cb();
                /* // Alternate option: Delayed start...
                 * setTimeout(cb, 0);
                 */
              } catch (error) {
                // eslint-disable-next-line no-console
                console.error('[CommonModal:invokeOnHideHandlers]: error (catched)', {
                  error,
                  cb,
                });
                // eslint-disable-next-line no-debugger
                debugger;
              }
            }
          }
        }
        return this;
      },

      /** getModalNode -- Get root modal node
       * @return {HTMLElement|undefined}
       */
      getModalNode() {
        const modal = document.getElementById('common-modal');
        // TODO: Cache?
        return modal;
      },

      /** getModalNodeElementByClass -- Find modal sub element by class name
       * @param {string} className
       * @param {boolean} [optional]
       * @return {HTMLElement|undefined}
       */
      getModalNodeElementByClass(className, optional) {
        const modal = this.getModalNode();
        const node = modal.getElementsByClassName(className)[0];
        if (!node && !optional) {
          throw new Error('Not found modal node for class "' + className + '"');
        }
        // TODO: Cache?
        return node;
      },

      /** setTitle -- Update modal title
       * @param {string} title
       */
      setTitle(title) {
        const titleEl = this.getModalNodeElementByClass('common-modal-title');
        CommonHelpers.updateNodeContent(titleEl, title);
        return this;
      },

      /** setContent -- Update modal content
       * @param {string|HTMLElement|HTMLElement[]} content
       */
      setContent(content) {
        const wrapperEl = this.getModalNodeElementByClass('common-modal-content-wrapper');
        CommonHelpers.updateNodeContent(wrapperEl, content);
        return this;
      },

      /** setModalContentOption -- Set one (boolean) modal content option.
       * @param {string} optionName
       * @param {boolean} [optionValue]
       */
      setModalContentOption(optionName, optionValue) {
        const contentEl = this.getModalNodeElementByClass('common-modal-content');
        contentEl.classList.toggle(optionName, !!optionValue);
        return this;
      },

      /** setModalWindowOption -- Set one (boolean) modal content option.
       * @param {string} optionName
       * @param {boolean} [optionValue]
       */
      setModalWindowOption(optionName, optionValue) {
        const literalOptions = {
          width: ['sm', 'md', 'lg'],
        };
        const contentEl = this.getModalNodeElementByClass('common-modal-window');
        const literals = literalOptions[optionName];
        if (literals) {
          // Literal option...
          literals.forEach((val) => {
            // Remove all the other and set current option...
            const isOn = val === optionValue;
            const name = optionName + '-' + val;
            contentEl.classList.toggle(name, isOn);
          });
        } else {
          // Boolean option...
          contentEl.classList.toggle(optionName, !!optionValue);
        }
        return this;
      },

      /** setModalContentScrollable -- Enable/disable scrollable mode for modal content.
       * @param {boolean} [scrollable]
       */
      setModalContentScrollable(scrollable) {
        this.setModalContentOption('scrollable', scrollable);
        return this;
      },

      /** setModalContentPadded -- Enable/disable padded mode for modal content.
       * @param {boolean} [padded]
       */
      setModalContentPadded(padded) {
        this.setModalContentOption('padded', padded);
        return this;
      },

      /** setModalContentOptions -- Set one (boolean) modal content option.
       * @param {<Record<string, [boolean]>>}} options - Boolean options (`scrollable`, `padded`)
       */
      setModalContentOptions(options) {
        const names = Object.keys(options);
        names.forEach((name) => {
          this.setModalContentOption(name, options[name]);
        });
        return this;
      },

      /** setModalWindowOptions -- Set one (boolean) modal content option.
       * @param {<Record<string, [boolean]>>}} options - Options (`width`, `autoWidth`, `autoHeight`, `fullWindowHeight`, `fullWindowHeightt`)
       * @param {string} [options.width] - Custom window size (sm, md, lg)
       * @param {boolean} [options.autoWidth]
       * @param {boolean} [options.autoHeight]
       * @param {boolean} [options.fullWindowWidth] (UNUSED)
       * @param {boolean} [options.fullWindowHeight] (UNUSED)
       */
      setModalWindowOptions(options) {
        const names = Object.keys(options);
        names.forEach((name) => {
          this.setModalWindowOption(name, options[name]);
        });
        return this;
      },

      /** setModalContentId -- Set one (boolean) modal content option.
       * @param {string} id
       */
      setModalContentId(id) {
        const contentEl = this.getModalNodeElementByClass('common-modal-content');
        contentEl.setAttribute('id', id);
        return this;
      },

      /** showModal -- Show modal window
       * @param {object} [params] - Modal parameters
       * @param {string} [params.title] - Modal title
       */
      showModal(params = {}) {
        if (!this.inited) {
          this.init();
        }
        const { title } = params;
        const modal = this.getModalNode();
        if (modal.classList.contains('show')) {
          throw new Error('Trying to show already shown modal');
        }
        modal.classList.toggle('show', true);
        document.body.classList.toggle('has-modal', true);
        // Update title (if passed)...
        if (title) {
          this.setTitle(title);
        }
        this.activateEvents();
        return this;
      },

      /** Hide modal window
       * @param {object} [opts] - Options.
       * @param {boolean} [opts.dontNotify] - Options.
       */
      hideModal(opts = {}) {
        this.deactivateEvents();
        const modal = this.getModalNode();
        if (!modal.classList.contains('show')) {
          throw new Error('Trying to hide already hidden modal');
        }
        modal.classList.toggle('show', false);
        document.body.classList.toggle('has-modal', false);
        if (opts.dontNotify) {
          this.clearOnHideHandlers();
        } else {
          this.invokeOnHideHandlers();
        }
        return this;
      },

      // Active events...

      onActiveKeyPress(event) {
        if (event.key === 'Escape') {
          this.hideModal();
        }
      },

      activateEvents() {
        document.addEventListener('keydown', this.boundOnActiveKeyPress);
        const outerEl = this.getModalNodeElementByClass('common-modal-splash');
        outerEl.addEventListener('mousedown', this.boundHideModal);
      },

      deactivateEvents() {
        document.removeEventListener('keydown', this.boundOnActiveKeyPress);
        const outerEl = this.getModalNodeElementByClass('common-modal-splash');
        outerEl.removeEventListener('mousedown', this.boundHideModal);
      },

      /** init -- Initialize the modal. Should be called before first actiovation, see call inside `showModal`.
       */
      init() {
        if (!this.inited) {
          // Create bound event handlers...
          this.boundHideModal = this.hideModal.bind(this);
          this.boundOnActiveKeyPress = this.onActiveKeyPress.bind(this);

          // Link close modal button handler (TODO: To use more specific class name?)...
          const closeEl = this.getModalNodeElementByClass('close');
          closeEl.onclick = this.boundHideModal;

          // Set initied flag...
          this.inited = true;
        }
        return this;
      },
    };

    // Boumd handlers...
    CommonModal.boundHideModal = CommonModal.hideModal.bind(CommonModal);

    provide(CommonModal);
  },
);
