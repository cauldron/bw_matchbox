modules.define(
  'Comments',
  [
    // Required modules...
    // 'CommonHelpers',
    // 'CommentsConstants',
    // 'CommentsData',
    // 'CommentsDataLoad',
    // 'CommentsDataRender',
    // 'CommentsNodes',
    // 'CommentsStates',
  ],
  function provide_Comments(
    provide,
    // Resolved modules...
    // CommonHelpers,
    // CommentsConstants,
    // CommentsData,
    // CommentsDataLoad,
    // CommentsDataRender,
    // CommentsNodes,
    // CommentsStates,
  ) {
    // Define module...

    /** @descr Process list table client code.
     *
     * TODO:
     *
     * - Add fallback for 'Reload' (reload last data chunk) if error occured.
     */

    // NOTE: Don't forget to call `startAllModules` for all the used modules...
    const allModulesList = [
      // CommentsConstants,
      // CommentsData,
      // CommentsNodes,
      // CommentsStates,
      // CommentsSearch,
      // CommentsDataRender,
      // CommentsDataLoad,
    ];

    // global module variable
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
        /* // Save shared data for future use...
         * CommentsData.sharedParams = sharedParams;
         */
        this.sharedParams = sharedParams;

        console.log('[Comments:start]', {
          sharedParams,
        });
        debugger;

        // Fetch url query parameters...
        this.fetchUrlParams();

        // Initialize all the modules...
        this.startAllModules();

        /* // Load data...
         * CommentsDataLoad.loadData();
         */
      },
    };

    // Provide module...
    provide(Comments);
  },
);
