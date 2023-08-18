// // Resolved modules...
// CommentsPageConstants,
// CommentsPageData,
// CommentsPageDataRender,
// CommentsPageHandlers,
// CommentsPageHelpers,
// CommentsPageLoader,
// CommentsPageNodes,
// CommentsPagePrepareLoadedData,
// CommentsPageStates,
// CommentsPageThreadsHelpers,

/** Used modules list (will be needed for initialization, in `startAllModules`)
 */
const usedModulesList = Array.from(arguments).splice(1);

/** @exports CommentsPage
 * @type {<CommentsPage>}
 */
export const CommentsPage = {
  __id: 'CommentsPage',

  // Owner page's provided data (TODO: Move to `CommentsPageData`, see `start` method)...
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
          console.error('[CommentsPage:helpers:startAllModules]: error (catched)', {
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
    CommentsPageData.sharedParams = sharedParams;
    this.sharedParams = sharedParams;

    // Initialize all the modules...
    this.startAllModules();

    // Load data...
    CommentsPageLoader.loadComments();
  },
};
