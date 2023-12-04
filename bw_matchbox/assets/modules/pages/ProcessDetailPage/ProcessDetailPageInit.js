// @ts-check

import { commonNotify } from '../../common/CommonNotify.js';
import * as CommonHelpers from '../../common/CommonHelpers.js';

/** @typedef TCreateParams
 * @property {TThreadComments} threadComments
 * @property {TProcessDetailPageState} state
 * @property {TProcessDetailPageNodes} nodes
 * @property {TSharedHandlers} callbacks
 */

/**
 * @class ProcessDetailPageInit
 */
export class ProcessDetailPageInit {
  /** @type {TProcessDetailPageState} */
  state;

  /** @type {TProcessDetailPageNodes} */
  nodes;

  /** @type {TThreadComments} */
  threadComments;

  /** @type {Promise} */
  threadCommentsInitPromise;

  /** @param {TCreateParams} params */
  constructor(params) {
    const {
      // prettier-ignore
      callbacks,
      threadComments,
      state,
      nodes,
    } = params;
    // this.callbacks = callbacks;
    this.threadComments = threadComments;
    this.state = state;
    this.nodes = nodes;
    CommonHelpers.exportCallbacksFromInstance(callbacks, this);
    // this.initSidePanelTabs();
  }

  /*
   * initSidePanelTabs() {
   *   const sidePanelTabsNode = this.nodes.getSidePanelTabsNode();
   *   const activeTabNode = sidePanelTabsNode.querySelector('.panels-layout-tab.active');
   *   const activeTabId = activeTabNode?.getAttribute('id');
   *   console.log('[ProcessDetailPageInit:initSidePanelTabs]', {
   *     activeTabId,
   *     activeTabNode,
   *     sidePanelTabsNode,
   *   });
   *   debugger;
   * }
   */

  /** @return Promise */
  ensureThreadComments() {
    try {
      const {
        // handlers,
        threadComments,
        state,
      } = this;
      // Initialize once!
      if (this.threadCommentsInitPromise) {
        return this.threadCommentsInitPromise;
      }
      const { currentUser, currentRole, currentProcess } = state;
      const threadCommentsNode = this.nodes.getThreadCommentsNode();
      // Init comments module parameters
      threadComments.setParams(
        /** @type {TThreadCommentsParams} */ {
          rootNode: threadCommentsNode,
          currentProcess,
          currentUser,
          role: currentRole,
          // noTableau: true,
          // noLoader: true,
          // noError: true,
          noActions: true, // Disable inegrated actions panel
          // disableAddNewThread: false,
          // disableAddThreadComment: true,
          // disableThreadResolve: true,
          disableResolveByNonReporters: true,
          hideDisabledTitleActions: true,
        },
      );
      // Init sub-components...
      this.threadCommentsInitPromise = threadComments
        .ensureInit()
        .then(() => {
          /** @type {TThreadCommentsSortModes} */
          const sortThreadsBy = ['resolved', 'modifiedDate'];
          /** @type {boolean} */
          const sortThreadsReversed = false;
          // Configure default view options (filter by current process)...
          threadComments.handlers.updateViewParams({
            sortThreadsBy,
            sortThreadsReversed,
            // filterByProcesses: [currentProcess],
          });
          // Configure default load options (filter by current process)...
          threadComments.handlers.updateLoadParams({
            process: currentProcess,
          });
          // Invoke `loadComments`...
          return threadComments.handlers.loadComments();
        })
        .then(() => {
          // const layoutNode = this.nodes.getLayoutNode();
          const sidePanelNode = this.nodes.getSidePanelNode();
          sidePanelNode.classList.toggle('ready', true);
        })
        .catch((/** @type {Error} */ error) => {
          // eslint-disable-next-line no-console
          console.error('[ProcessDetailPageInit:ensureThreadComments] ensureInit error', error);
          // eslint-disable-next-line no-debugger
          debugger;
          // Set error
          this.state.setError(error);
          commonNotify.showError(error);
        });
      /* // Register events...
       * threadComments.events.add('loading', callbacks.setLoading);
       * threadComments.events.add('updatedData', callbacks.renderDerivedFilters);
       */
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
      return this.threadCommentsInitPromise;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[ProcessDetailPageInit:ensureThreadComments]', error);
      // eslint-disable-next-line no-debugger
      debugger;
      commonNotify.showError(error);
    }
  }

  /** @return Promise */
  ensureScores() {
    try {
      console.log('[ProcessDetailPageInit:ensureScores]');
      debugger;
      return Promise.resolve();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[ProcessDetailPageInit:ensureScores]', error);
      // eslint-disable-next-line no-debugger
      debugger;
      commonNotify.showError(error);
    }
  }
}
