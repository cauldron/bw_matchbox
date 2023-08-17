modules.define(
  'Comments',
  [
    // Required modules...
    'CommentsConstants',
    'CommentsData',
    'CommentsDataRender',
    'CommentsHandlers',
    'CommentsHelpers',
    'CommentsLoader',
    'CommentsNodes',
    'CommentsPrepareLoadedData',
    'CommentsStates',
    'CommentsThreadsHelpers',
  ],
  function provide_Comments(
    provide,
    // Resolved modules...
    /* eslint-disable no-unused-vars */
    CommentsConstants,
    CommentsData,
    CommentsDataRender,
    CommentsHandlers,
    CommentsHelpers,
    CommentsLoader,
    CommentsNodes,
    CommentsPrepareLoadedData,
    CommentsStates,
    CommentsThreadsHelpers,
    /* eslint-enable no-unused-vars */
  ) {
    /** Used modules list (will be needed for initialization, in `startAllModules`)
     */
    const usedModulesList = Array.from(arguments).splice(1);

    /** @exports Comments
     * @type {<Comments>}
     */
    const Comments = {
      __id: 'Comments',

      // Owner page's provided data (TODO: Move to `CommentsData`, see `start` method)...
      sharedParams: undefined,

      /** Handlers exchange object */
      handlers: {},

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
            // WTF?
            return;
          }
          if (module.__id) {
            // Expose module (is it safe and neccessary?)...
            this[module.__id] = module;
          }
          if (typeof module.start === 'function') {
            try {
              module.start(initParams);
              /* // Alternate option: Delayed start...
               * setTimeout(module.start.bind(module), 0, initParams);
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
