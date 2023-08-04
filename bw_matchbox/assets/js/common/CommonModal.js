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
        const titleEl = this.getModalNodeElementByClass('modal-title');
        CommonHelpers.updateNodeContent(titleEl, title);
        return this;
      },

      /** setContent -- Update modal content
       * @param {string|HTMLElement|HTMLElement[]} content
       */
      setContent(content) {
        const wrapperEl = this.getModalNodeElementByClass('modal-content-wrapper');
        CommonHelpers.updateNodeContent(wrapperEl, content);
        return this;
      },

      /** setModalContentOption -- Set one (boolean) modal content option.
       * @param {string} optionName
       * @param {boolean} [optionValue]
       */
      setModalContentOption(optionName, optionValue) {
        const contentEl = this.getModalNodeElementByClass('modal-content');
        contentEl.classList.toggle(optionName, !!optionValue);
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

      /** setModalContentId -- Set one (boolean) modal content option.
       * @param {string} id
       */
      setModalContentId(id) {
        const contentEl = this.getModalNodeElementByClass('modal-content');
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
        return this;
      },

      /** Hide modal window */
      hideModal() {
        const modal = this.getModalNode();
        if (!modal.classList.contains('show')) {
          throw new Error('Trying to hide already hidden modal');
        }
        modal.classList.toggle('show', false);
        document.body.classList.toggle('has-modal', false);
        return this;
      },

      initied: false,

      /** init -- Initialize the modal.
       */
      init() {
        if (!this.inited) {
          // Link close modal button handler (TODO: To use more specific class name?)...
          const closeEl = this.getModalNodeElementByClass('close');
          closeEl.onclick = this.hideModal.bind(this);

          // TODO: Other initializations:
          //  - Keyboard handler?
          //  - Outer clickng handler?

          // Set initied flag...
          this.inited = true;
        }
        return this;
      },
    };

    provide(CommonModal);
  },
);
