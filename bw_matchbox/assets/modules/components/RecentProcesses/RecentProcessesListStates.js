// @ts-check

// Import types only...
/* eslint-disable no-unused-vars */
import { RecentProcessesListRender } from './RecentProcessesListRender.js';
/* eslint-enable no-unused-vars */

import { RecentProcessesListData } from './RecentProcessesListData.js';
import { RecentProcessesListNodes } from './RecentProcessesListNodes.js';

export const RecentProcessesListStates = {
  /** @type {TSharedHandlers} */
  handlers: undefined,

  /** @type {TEvents} */
  events: undefined,

  /** @type {number} */
  loadingLevel: 0,

  /** @type {RecentProcessesListRender} */
  recentProcessesListRender: undefined,

  /**
   * @param {boolean} isLoading
   */
  setLoading(isLoading) {
    this.loadingLevel += isLoading ? 1 : -1;
    const setLoading = this.loadingLevel > 0;
    // Set css class for id="processes-list-root" --> loading, set local status
    const rootNode = RecentProcessesListNodes.getRootNode();
    rootNode.classList.toggle('loading', setLoading);
    RecentProcessesListData.isLoading = setLoading;
    this.events.emit('loading', setLoading);
  },

  /**
   * @param {boolean} hasData
   */
  setHasData(hasData) {
    // Set css class for root node, update local state
    const rootNode = RecentProcessesListNodes.getRootNode();
    rootNode.classList.toggle('empty', !hasData);
    RecentProcessesListData.hasData = hasData;
    this.events.emit('hasData', hasData);
  },

  /** setEmpty -- Shorthand for `setHasData`
   * @param {boolean} isEmpty
   */
  setEmpty(isEmpty) {
    this.setHasData(!isEmpty);
  },

  /**
   * @param {Error} error
   */
  setError(error) {
    RecentProcessesListData.isError = !!error;
    RecentProcessesListData.error = error;
    this.recentProcessesListRender.renderError(error);
    this.events.emit('error', error);
  },

  /** @param {TRecentProcessesListInitParams} initParams */
  init(initParams) {
    const { events, handlers, recentProcessesListRender } = initParams;
    this.events = events;
    this.handlers = handlers;
    this.recentProcessesListRender = recentProcessesListRender;
  },
};
