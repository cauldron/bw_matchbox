// @ts-check

import { commonNotify } from '../common/CommonNotify.js';
import * as CommonHelpers from '../common/CommonHelpers.js';

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
  }

  /** @return Promise */
  ensureThreadComments() {
    try {
      const {
        // handlers,
        threadComments,
        state,
      } = this;
      if (this.threadCommentsInitPromise) {
        return this.threadCommentsInitPromise;
      }
      const { currentUser, currentRole } = state;
      const threadCommentsNode = this.nodes.getThreadCommentsNode();
      // Init comments module parameters
      this.threadComments.setParams(
        /** @type {TThreadCommentsParams} */ {
          rootNode: threadCommentsNode,
          currentUser,
          role: currentRole,
          // noTableau: true,
          // noLoader: true,
          // noError: true,
        },
      );
      // Init sub-components...
      this.threadCommentsInitPromise = threadComments
        .ensureInit()
        .then(() => {
          /* // TODO: Update default values from ThreadComments...
           * this.state.updateViewParamsFromThreadComments();
           */
          // Invoke `loadComments`
          return threadComments.handlers.loadComments();
        })
        .catch((/** @type {Error} */ error) => {
          // eslint-disable-next-line no-console
          console.error('[ProcessDetailPageInit:start] threadComments.ensureInit error', error);
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
}
