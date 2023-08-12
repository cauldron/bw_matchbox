modules.define(
  'Comments',
  [
    // Required modules...
    // 'CommonHelpers',
    'CommentsConstants',
    'CommentsData',
    'CommentsDataRender',
    'CommentsHandlers',
    'CommentsHelpers',
    'CommentsLoader',
    'CommentsNodes',
    'CommentsStates',
    'CommentsUpdaters',
  ],
  function provide_Comments(
    provide,
    // Resolved modules...
    // CommonHelpers,
    /* eslint-disable no-unused-vars */
    CommentsConstants,
    CommentsData,
    CommentsDataRender,
    CommentsHandlers,
    CommentsHelpers,
    CommentsLoader,
    CommentsNodes,
    CommentsStates,
    CommentsUpdaters,
    /* eslint-enable no-unused-vars */
  ) {
    /** Used modules list (will be needed for initialization, in `startAllModules`)
     */
    const usedModulesList = Array.from(arguments).splice(1);

    /** @exports Comments
     */
    const Comments = {
      __id: 'Comments',

      // Owner page's provided data (TODO: Move to `CommentsData`, see `start` method)...
      sharedParams: undefined,

      // Proxy handlers...

      handleExpandThread(node) {
        const threadEl = node.closest('.thread');
        const threadId = Number(threadEl.getAttribute('data-thread-id'));
        const wasExpanded = threadEl.classList.contains('expanded');
        const setExpanded = !wasExpanded;
        console.log('[Comments:handleExpandThread]', {
          threadEl,
          node,
        });
        // Ensure that all the thread comments had already rendered...
        if (setExpanded) {
          CommentsDataRender.ensureThreadCommentsReady(threadId);
        }
        // Toggle `expanded` class name...
        threadEl.classList.toggle('expanded', setExpanded);
      },

      // Initialization...

      /** startAllModules -- Start all the modules
       */
      startAllModules() {
        // Start all the modules...
        usedModulesList.forEach((module) => {
          if (!module) {
            return;
          }
          if (module.__id) {
            this[module.__id] = module;
          }
          if (typeof module.start === 'function') {
            try {
              module.start();
              /* // Alternate option: Delayed start...
               * setTimeout(module.start.bind(module), 0);
               */
            } catch (error) {
              // eslint-disable-next-line no-console
              console.error('[Comments:helpers:startAllModules]: error (catched)', {
                error,
                module,
                start: module.start,
              });
              // eslint-disable-next-line no-debugger
              debugger;
            }
          }
        });
      },
      /** Start entrypoint */
      start(sharedParams) {
        // Save shared data for future use...
        CommentsData.sharedParams = sharedParams;
        this.sharedParams = sharedParams;

        console.log('[Comments:start]', {
          sharedParams,
        });

        // Initialize all the modules...
        this.startAllModules();

        // Load data...
        CommentsLoader.loadComments();
      },
    };

    // Provide module...
    provide(Comments);
  },
);
