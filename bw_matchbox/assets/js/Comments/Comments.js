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
    'CommentsThreadsHelpers',
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
    CommentsThreadsHelpers,
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

      /** Handlers exchange object */
      handlers: {},

      // Proxy handlers...

      // Initialization...

      /** startAllModules -- Start all the modules
       */
      startAllModules() {
        const initParams = {
          handlers: this.handlers,
          sharedParams: this.sharedParams,
        };
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
              module.start(initParams);
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
