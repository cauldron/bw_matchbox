modules.define(
  'CommonNotify',
  [
    // Required modules...
    // 'CommonHelpers',
  ],
  function provide_CommonNotify(
    provide,
    // Resolved modules...
    // CommonHelpers,
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

      removeNotify(node) {
        // Play animation...
        node.classList.remove('active');
        setTimeout(() => {
          // ...And remove node...
          this.notifyRoot.removeChild(node);
        }, 250); // Value of `var(--common-animation-time)`
      },

      showNotify(mode, text) {
        if (!text) {
          text = mode;
          mode = 'info';
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
        const removeNotifyHandler = this.removeNotify.bind(this, node);
        let handler = setTimeout(removeNotifyHandler, this.timeoutDelay);
        // Stop & restore timer on mouse in and out events...
        node.addEventListener('mouseenter', () => {
          // Clear timer...
          clearTimeout(handler);
        });
        node.addEventListener('mouseleave', () => {
          // Restore timer...
          handler = setTimeout(removeNotifyHandler, this.timeoutDelay);
        });
        // Click handler...
        node.addEventListener('click', () => {
          this.removeNotify(node);
          clearTimeout(handler);
        });
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
