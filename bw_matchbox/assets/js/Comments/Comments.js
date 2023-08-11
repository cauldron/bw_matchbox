modules.define(
  'Comments',
  [
    // Required modules...
    // 'CommonHelpers',
    'CommentsConstants',
    'CommentsData',
    'CommentsDataRender',
    'CommentsLoader',
    'CommentsNodes',
    'CommentsStates',
  ],
  function provide_Comments(
    provide,
    // Resolved modules...
    // CommonHelpers,
    CommentsConstants,
    CommentsData,
    CommentsDataRender,
    CommentsLoader,
    CommentsNodes,
    CommentsStates,
  ) {
    /** Used modules list (will be needed for initialization, in `startAllModules`)
     * TODO: To populate it from the arguments list?
     */
    const allModulesList = [
      CommentsConstants,
      CommentsData,
      CommentsDataRender,
      CommentsLoader,
      CommentsNodes,
      CommentsStates,
    ];

    /** @exports Comments
     */
    const Comments = {
      __id: 'Comments',

      // Owner page's provided data (TODO: Move to `CommentsData`, see `start` method)...
      sharedParams: undefined,

      // Proxy handlers...

      /** startAllModules -- Start all the modules
       */
      startAllModules() {
        // Start all the modules...
        allModulesList.forEach((module) => {
          if (module && typeof module.start === 'function') {
            try {
              module.start();
              /* // Alternate option: Delayed start...
               * setTimeout(module.start.bind(module), 0);
               */
            } catch (error) {
              // eslint-disable-next-line no-console
              console.error('[Comments:startAllModules]: error (catched)', {
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
        // debugger;

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
