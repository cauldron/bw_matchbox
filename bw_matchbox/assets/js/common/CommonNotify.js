modules.define(
  'CommonNotify',
  [
    // Required modules...
    'CommonHelpers',
  ],
  function provide_CommonNotify(
    provide,
    // Resolved modules...
    CommonHelpers,
  ) {
    // UNUSED: Icon shapes...
    const icons = {
      success: 'fa-check',
      error: 'fa-warning',
      warn: 'fa-bell',
      info: 'fa-info',
    };

    // Define module...
    const CommonNotify = {
      /** Initialized flag (see `inited` method) */
      inited: false,
      notifyRoot: undefined,
      timeoutDelay: 3000,

      // Methods...

      /** removeNotify
       * @param {<{ node, handler }>} notifyData
       */
      removeNotify(notifyData) {
        const { node, handler } = notifyData;
        // Play animation...
        node.classList.remove('active');
        if (handler) {
          clearTimeout(handler);
          notifyData.handler = undefined;
        }
        setTimeout(() => {
          // ...And remove node (TODO: Check if node still exists in dom tree)...
          this.notifyRoot.removeChild(node);
        }, 250); // Value of `var(--common-animation-time)`
      },

      /** showNotify
       * @param {'info' | 'error' | 'warn' | 'success'} [mode] - Message type ('info' is default)
       * @param {string|Error} text - Message content
       */
      showNotify(mode, text) {
        if (!text) {
          // If only one parameters passed assume it as message with default type
          text = mode;
          mode = 'info';
        }
        if (text instanceof Error) {
          // Convert error object to the plain text...
          text = CommonHelpers.getErrorText(text);
        }
        this.inited || this.init();
        // Create node...
        const node = document.createElement('div');
        node.classList.add('notify');
        node.classList.add('notify-' + mode);
        setTimeout(() => {
          // Play animation...
          node.classList.add('active');
        }, 30);
        // Add icon...
        const nodeIcon = document.createElement('span');
        nodeIcon.classList.add('icon');
        nodeIcon.classList.add('fa');
        nodeIcon.classList.add(icons[mode]);
        node.appendChild(nodeIcon);
        // Add text...
        const nodeText = document.createElement('div');
        nodeText.classList.add('text');
        nodeText.innerHTML = text;
        node.appendChild(nodeText);
        this.notifyRoot.appendChild(node);
        // Remove node after delay...
        const notifyData = { node, handler: undefined };
        const removeNotifyHandler = this.removeNotify.bind(this, notifyData);
        notifyData.handler = setTimeout(removeNotifyHandler, this.timeoutDelay);
        // Stop & restore timer on mouse in and out events...
        node.addEventListener('mouseenter', () => {
          // Clear timer...
          clearTimeout(notifyData.handler);
        });
        node.addEventListener('mouseleave', () => {
          // Resume timer...
          notifyData.handler = setTimeout(removeNotifyHandler, this.timeoutDelay);
        });
        // Click handler...
        node.addEventListener('click', removeNotifyHandler);
      },

      // Some shorthands...

      showInfo(text) {
        this.showNotify('info', text);
      },

      showSuccess(text) {
        this.showNotify('success', text);
      },

      showWarn(text) {
        this.showNotify('warn', text);
      },

      showError(text) {
        this.showNotify('error', text);
      },

      // Initialization...

      createDomNode() {
        const rootNode = document.body;
        const notifyRoot = document.createElement('div');
        notifyRoot.classList.add('notify-root');
        notifyRoot.setAttribute('id', 'notify-root');
        rootNode.appendChild(notifyRoot);
        this.notifyRoot = notifyRoot;
      },

      showDemo() {
        // DEBUG: Show sample notifiers...
        this.showInfo('Info');
        this.showSuccess('Success');
        this.showWarn('Warn');
        this.showError('Error');
      },

      /** init -- Initialize the module. Should be called before first actiovation, see call inside `showModal`.
       */
      init() {
        if (!this.inited) {
          // Create container node...
          this.createDomNode();

          // Set initied flag...
          this.inited = true;
        }
        return this;
      },
    };

    provide(CommonNotify);
  },
);
