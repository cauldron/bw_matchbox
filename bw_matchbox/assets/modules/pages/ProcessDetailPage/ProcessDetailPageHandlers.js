// @ts-check

import * as CommonHelpers from '../../common/CommonHelpers.js';

import { WaitlistCommentDialog } from './WaitlistCommentDialog.js';

/** @typedef TCreateParams
 * @property {TProcessDetailPageState} state
 * @property {TProcessDetailPageNodes} nodes
 * @property {TSharedHandlers} callbacks
 * @property {TProcessDetailPageSharedParams} sharedParams
 * @property {TThreadComments} threadComments
 */

/**
 * @class ProcessDetailPageHandlers
 */
export class ProcessDetailPageHandlers {
  /** @type {TProcessDetailPageSharedParams} */
  sharedParams;
  /** @type {TProcessDetailPageState} */
  state;
  /** @type {TProcessDetailPageNodes} */
  nodes;
  /** @type {TSharedHandlers} */
  callbacks;
  /** @type {TThreadComments} */
  threadComments;

  /** @param {TCreateParams} params */
  constructor(params) {
    const {
      // prettier-ignore
      state,
      nodes,
      sharedParams,
      callbacks,
      threadComments,
    } = params;
    this.state = state;
    this.nodes = nodes;
    this.sharedParams = sharedParams;
    this.callbacks = callbacks;
    this.threadComments = threadComments;
    CommonHelpers.exportCallbacksFromInstance(callbacks, this);
  }

  // Tabs...

  getSidePanelActiveTabId() {
    const sidePanelTabsNode = /** @type {HTMLElement} */ (this.nodes.getSidePanelTabsNode());
    const activeTabNode = /** @type {HTMLElement} */ (
      sidePanelTabsNode.querySelector('.panels-layout-tab.active')
    );
    const activeTabId = activeTabNode?.getAttribute('id');
    return activeTabId;
  }

  initSidePanelTabs() {
    const sidePanelNode = /** @type {HTMLElement} */ (this.nodes.getSidePanelNode());
    const sidePanelTabsNode = /** @type {HTMLElement} */ (this.nodes.getSidePanelTabsNode());
    const activeTabNode = /** @type {HTMLElement} */ (
      sidePanelTabsNode.querySelector('.panels-layout-tab.active')
    );
    const activeTabId = activeTabNode?.getAttribute('id');
    const isPanelHidden = sidePanelNode.classList.contains('hidden');
    /* console.log('[ProcessDetailPageHandlers:initSidePanelTabs]', {
     *   sidePanelNode,
     *   activeTabId,
     *   activeTabNode,
     *   sidePanelTabsNode,
     * });
     */
    if (activeTabId && !isPanelHidden) {
      this.switchSidePanelTabById(activeTabId);
    }
  }

  /**
   * @param {string} [activeId]
   * @return {Promise}
   */
  ensureSidePanelTabComponentById(activeId) {
    if (!activeId) {
      activeId = this.getSidePanelActiveTabId();
    }
    if (activeId) {
      /* console.log('[ProcessDetailPageHandlers:ensureSidePanelTabComponentById]', {
       *   activeId,
       *   callbacks: this.callbacks,
       * });
       */
      switch (activeId) {
        case 'comments': {
          return this.callbacks.ensureThreadComments();
        }
        case 'scores': {
          return this.callbacks.ensureScoresList();
        }
      }
    }
    // TODO: Show/reject an error?
    return Promise.resolve();
  }

  /* @return {Promise} */
  ensureSidePanelTabComponent() {
    const activeId = this.getSidePanelActiveTabId();
    return this.ensureSidePanelTabComponentById(activeId);
  }

  /** @param {string} activeId */
  switchSidePanelTabById(activeId) {
    const sidePanelTabsNode = /** @type {HTMLElement} */ (this.nodes.getSidePanelTabsNode());
    const layoutNode = /** @type {HTMLElement} */ (this.nodes.getLayoutNode());
    const tabNodes = sidePanelTabsNode.getElementsByClassName('panels-layout-tab');
    const tabContentNodes = layoutNode.getElementsByClassName('panels-layout-tab-content');
    /* console.log('[ProcessDetailPageHandlers:switchSidePanelTabById]', {
     *   activeId,
     *   tabNodes,
     *   tabContentNodes,
     * });
     */
    Array.from(tabNodes).forEach((node) => {
      const id = node.getAttribute('id');
      const isActive = id === activeId;
      node.classList.toggle('active', isActive);
    });
    Array.from(tabContentNodes).forEach((node) => {
      const id = node.getAttribute('data-panels-layout-tab-content-id');
      const isActive = id === activeId;
      node.classList.toggle('panels-layout-tab-content-active', isActive);
    });
    return this.ensureSidePanelTabComponentById(activeId);
  }

  /* @return {Promise} */
  updateSidePanelTabs() {
    const activeId = this.getSidePanelActiveTabId();
    return this.switchSidePanelTabById(activeId);
  }

  /** @param {HTMLButtonElement} tabNode
   */
  switchSidePanelTab(tabNode) {
    const tabId = tabNode?.getAttribute('id');
    /* console.log('[ProcessDetailPageHandlers:switchSidePanelTab]', {
     *   tabId,
     *   tabNode,
     * });
     */
    this.switchSidePanelTabById(tabId);
  }

  // Handlers...

  /** doMarkWaitlist -- Send mark as waitlist requests
   * @param {TWaitlistCommentDialogUserAction} userAction - Result of `promiseMarkWaitlistDialog` (`{ comment }` or `false`)
   */
  async doMarkWaitlist(userAction) {
    const { comment = '' } = userAction;
    const { sharedParams } = this;
    const { isWaitlist } = this.state;
    const setWaitlist = !isWaitlist;
    const waitlistValue = setWaitlist ? 1 : 0;
    const { addAttributeUrl } = sharedParams;
    const urlBase = addAttributeUrl;
    const makeUrlParams = { addQuestionSymbol: true, useEmptyStrings: true };
    const urls = [
      // Url #1, Eg: ?attr=match_type&value=1
      urlBase + CommonHelpers.makeQuery({ attr: 'waitlist', value: waitlistValue }, makeUrlParams),
      // Url #2, Eg: ?attr=waitlist_comment&value=<comment text>
      urlBase +
        CommonHelpers.makeQuery({ attr: 'waitlist_comment', value: comment }, makeUrlParams),
    ].filter(Boolean);
    // Call both requests at once...
    const callbacks = urls.map((url) => () => fetch(url));
    this.state.setLoading(true);
    // Run callbacks one by one...
    try {
      const resList = await CommonHelpers.runAsyncCallbacksSequentially(callbacks);
      const errorsList = CommonHelpers.processMultipleRequestErrors(resList);
      if (errorsList.length) {
        // Some errors?
        // eslint-disable-next-line no-console
        console.error('[ProcessDetailPage:doMarkWaitlist] Got errors', errorsList);
        // eslint-disable-next-line no-debugger
        debugger;
        // Show errors on the page...
        this.state.setError(errorsList);
      } else {
        // Success...
        this.state.setWaitlist(setWaitlist);
        this.state.clearError();
      }
    } finally {
      this.state.setLoading(false);
    }
  }

  /** markWaitlist -- Handler for 'Waitlist' button.
   */
  async markWaitlist() {
    const { isWaitlist } = this.state;
    const setWaitlist = !isWaitlist;
    const waitlistCommentDialog = new WaitlistCommentDialog();
    // Show dialog or go directly to action...
    const userAction = setWaitlist
      ? await waitlistCommentDialog.promiseMarkWaitlistDialog()
      : { status: 'no comment required for un-waitlist' };
    if (userAction) {
      return this.doMarkWaitlist(userAction);
    }
  }

  /** markMatched -- Handler for 'No match needed' button.
   * @param {HTMLButtonElement} button
   */
  async markMatched(button) {
    const { sharedParams } = this;
    const urls = [sharedParams.markMatchedUrl, sharedParams.markMatchTypeUrl];
    const callbacks = urls.map((url) => () => fetch(url));
    this.state.setLoading(true);
    // Run callbacks one by one...
    try {
      const resList = await CommonHelpers.runAsyncCallbacksSequentially(callbacks);
      const errorsList = CommonHelpers.processMultipleRequestErrors(resList);
      if (errorsList.length) {
        // Some errors?
        // eslint-disable-next-line no-console
        console.error('[ProcessDetailPage:markMatched] Got errors', errorsList);
        // eslint-disable-next-line no-debugger
        debugger;
        // Show errors on the page...
        this.state.setError(errorsList);
      } else {
        // Success...
        button.innerText = 'Matched';
        button.classList.remove('button-primary');
        document.getElementById('match-button').style.display = 'none';
        document.getElementById('manual-multi-match').style.display = 'none';
        if (sharedParams.multimatch) {
          document.getElementById('manual-multi-match').style.display = 'none';
        }
        this.state.clearError();
      }
    } finally {
      this.state.setLoading(false);
    }
  }

  /** markAllMatched -- Handler for 'Mark all matched' button.
   * @param {HTMLButtonElement} button
   */
  markAllMatched(button) {
    const { sharedParams } = this;
    const url = sharedParams.markAllMatchedUrl;
    this.state.setLoading(true);
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          const error = new Error(`Can't load url '${res.url}': ${res.statusText}, ${res.status}`);
          // eslint-disable-next-line no-console
          console.error('[ProcessDetailPage:markAllMatched] Got error', error);
          // eslint-disable-next-line no-debugger
          debugger;
          // Show errors on the page...
          this.state.setError(error);
        } else {
          button.innerText = 'Matched';
          button.classList.remove('button-primary');
          document.getElementById('manual-match').style.display = 'none';
          document.getElementById('match-button').style.display = 'none';
          this.state.clearError();
        }
      })
      .finally(() => {
        this.state.setLoading(false);
      });
  }

  toggleCommentsPanel() {
    const { nodes, callbacks } = this;
    const layoutNode = nodes.getLayoutNode();
    const panel = this.nodes.getSidePanelNode();
    const button = layoutNode.querySelector('#toggle-side-panel-button');
    const hasPanel = layoutNode.classList.contains('has-panel');
    const showPanel = !hasPanel;
    layoutNode.classList.toggle('has-panel', showPanel);
    button.classList.toggle('turned', showPanel); // For turnaround button type
    panel.classList.toggle('hidden', !showPanel);
    if (showPanel) {
      // callbacks.ensureThreadComments(); // OLD_CODE
      callbacks.updateSidePanelTabs();
    }
  }

  /** @param {HTMLSelectElement} node */
  setSortMode(node) {
    const { value } = node;
    const { threadComments } = this;
    /* console.log('[ProcessDetailPageHandlers:setSortMode]', {
     *   value,
     * });
     */
    threadComments.handlers.setSortMode(value);
  }

  addNewThread() {
    const { threadComments } = this;
    threadComments.handlers.addNewThread();
  }

  expandAllThreads() {
    const { threadComments } = this;
    threadComments.handlers.expandAllThreads();
  }
}
