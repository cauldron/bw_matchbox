// @ts-check

import { CommentsPageConstants } from './CommentsPageConstants.js';
import { CommentsPageData } from './CommentsPageData.js';
import { CommentsPageDataRender } from './CommentsPageDataRender.js';
import { CommentsPageHandlers } from './CommentsPageHandlers.js';
import { CommentsPageHelpers } from './CommentsPageHelpers.js';
import { CommentsPageLoader } from './CommentsPageLoader.js';
import { CommentsPageNodes } from './CommentsPageNodes.js';
import { CommentsPagePrepareLoadedData } from './CommentsPagePrepareLoadedData.js';
import { CommentsPageStates } from './CommentsPageStates.js';
import { CommentsPageThreadsHelpers } from './CommentsPageThreadsHelpers.js';

/** @typedef TSharedParams
 * @property {string} base_url
 * @property {string} currentRole
 * @property {string} currentUser
 */

/** @typedef {Record<string, function>} TSharedHandlers
 */

/** @typedef TInitParams
 * @property {TSharedHandlers} handlers
 * @property {TSharedParams} sharedParams
 */

/** Used modules list (will be needed for initialization, in `startAllModules`)
 */
const usedModulesList = [
  CommentsPageConstants,
  CommentsPageData,
  CommentsPageDataRender,
  CommentsPageHandlers,
  CommentsPageHelpers,
  CommentsPageLoader,
  CommentsPageNodes,
  CommentsPagePrepareLoadedData,
  CommentsPageStates,
  CommentsPageThreadsHelpers,
];

export const CommentsPage = {
  __id: 'CommentsPage',

  /** Handlers exchange object
   * @type {TSharedHandlers}
   */
  handlers: {},

  // Initialization...

  /** startAllModules -- Start all the modules
   * @param {TSharedParams} sharedParams
   */
  startAllModules(sharedParams) {
    /** @type {TInitParams} */
    const initParams = {
      handlers: this.handlers,
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

  /** Start entrypoint
   * @param {TSharedParams} sharedParams
   */
  start(sharedParams) {
    // Save shared data for future use...
    CommentsPageData.sharedParams = sharedParams;

    // Initialize all the modules...
    this.startAllModules(sharedParams);

    // Load data...
    CommentsPageLoader.loadComments();
  },
};
