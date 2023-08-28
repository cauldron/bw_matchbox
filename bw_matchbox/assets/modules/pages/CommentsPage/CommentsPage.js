// @ts-check

import { commonNotify } from '../../common/CommonNotify.js';

import { CommentsPageConstants } from './CommentsPageConstants.js';
import { CommentsPageData } from './CommentsPageData.js';
import { CommentsPageDataRender } from './CommentsPageDataRender.js';
import { CommentsPageHandlers } from './CommentsPageHandlers.js';
import { CommentsPageHelpers } from './CommentsPageHelpers.js';
import { CommentsPageNodes } from './CommentsPageNodes.js';
import { CommentsPageStates } from './CommentsPageStates.js';
import { CommentsPageThreadsHelpers } from './CommentsPageThreadsHelpers.js';

import { ThreadComments } from '../../components/ThreadComments/ThreadComments.js';

/** Used modules list (will be needed for initialization, in `startAllModules`)
 */
const usedModulesList = [
  CommentsPageConstants,
  CommentsPageData,
  CommentsPageDataRender,
  CommentsPageHandlers,
  CommentsPageHelpers,
  CommentsPageNodes,
  CommentsPageStates,
  CommentsPageThreadsHelpers,
];

export const CommentsPage = {
  __id: 'CommentsPage',

  threadComments: new ThreadComments('CommentsPage'),

  /** Handlers exchange object
   * @type {TSharedHandlers}
   */
  handlers: {},

  // Initialization...

  /** startAllModules -- Start all the modules
   * @param {TSharedParams} sharedParams
   */
  startAllModules(sharedParams) {
    const { handlers, threadComments } = this;
    /** @type {TCommentsPageInitParams} */
    const initParams = {
      handlers,
      threadComments,
      sharedParams,
    };
    // Start all the modules...
    usedModulesList.forEach((module) => {
      if (!module) {
        return; // WTF?
      }
      /* // Expose module (is it safe and neccessary?)...
       * if (module.__id) {
       *   this[module.__id] = module;
       * }
       */
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

  /** @param {TSharedParams} sharedParams */
  initComments(sharedParams) {
    const { currentUser, currentRole } = sharedParams;
    const { handlers } = this;
    const threadCommentsNode = CommentsPageNodes.getThreadCommentsNode();
    // Init comments module parameters
    this.threadComments.setParams(
      /** @type {TThreadCommentsParams} */ {
        rootNode: threadCommentsNode,
        currentUser,
        role: currentRole,
        noTableau: true,
        noLoader: true,
        noError: true,
      },
    );
    // Init sub-components...
    this.threadComments
      .ensureInit()
      .then(() => {
        // Update default values from ThreadComments...
        CommentsPageStates.updateViewParamsFromThreadComments();
        // Invoke `loadComments`
        return this.threadComments.handlers.loadComments();
      })
      .then(() => {
        const rootNode = CommentsPageNodes.getRootNode();
        rootNode.classList.toggle('inited', true);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('[CommentsPage:start] threadComments.ensureInit error', error);
        // eslint-disable-next-line no-debugger
        debugger;
        // Set error
        CommentsPageStates.setError(error);
        commonNotify.showError(error);
      });
    // Register events...
    this.threadComments.events.add('loading', handlers.setLoading);
    this.threadComments.events.add('updatedData', handlers.renderDerivedFilters);
    /* // TODO Avalable events:
     * error
     * hasData
     * hasProcesses
     * hasUsers
     * hasVisibleThreads
     * totalCommentsCount
     * totalThreadsCount
     * updatedData: update filters (renderDerivedFilters)
     */
  },

  /** Start entrypoint
   * @param {TSharedParams} sharedParams
   */
  start(sharedParams) {
    // Save shared data for future use...
    CommentsPageData.sharedParams = sharedParams;

    // Initialize all the modules...
    this.startAllModules(sharedParams);

    // Init comments module
    this.initComments(sharedParams);
  },
};
