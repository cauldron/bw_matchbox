import * as CommonHelpers from '../../common/CommonHelpers.js';

import { CommentsPageData } from './CommentsPageData.js';
import { CommentsPageNodes } from './CommentsPageNodes.js';
import { CommentsPageThreadsHelpers } from './CommentsPageThreadsHelpers.js';

export const CommentsPageDataRender = {
  __id: 'CommentsPageDataRender',

  /** @type {TSharedHandlers} */
  helpers: undefined, // Expose helpers (TODO: Refactor to make it hidden?)

  /** @type {TThreadComments} */
  threadComments: undefined,

  renderError(error) {
    // TODO: Set css class for id="processes-list-root" --> error, update local state
    const isError = !!error;
    const rootNode = CommentsPageNodes.getRootNode();
    const errorNode = CommentsPageNodes.getErrorNode();
    rootNode.classList.toggle('has-error', isError);
    const errorText = error ? error.message || String(error) : '';
    // DEBUG: Show error in console
    if (errorText) {
      // eslint-disable-next-line no-console
      console.error('[CommentsPageDataRender:renderError]: got the error', {
        error,
        errorText,
      });
      // eslint-disable-next-line no-debugger
      debugger;
    }
    // Update (or clear) error block content...
    errorNode.innerHTML = errorText;
  },

  renderFilterByUserOptions() {
    const rootNode = CommentsPageNodes.getRootNode();
    const { filterByUsers, sharedParams } = CommentsPageData;
    const users = this.threadComments.api.getUsers();
    const { currentUser } = sharedParams;
    const filterByUsersNode = document.getElementById('filterByUsers');
    const options = users.map((user) => {
      const isSelected = filterByUsers.includes(user);
      const value = CommonHelpers.quoteHtmlAttr(user);
      let text = user;
      if (user === currentUser) {
        text += ' (me)';
      }
      return `<option value="${value}"${isSelected ? ' selected' : ''}>${text}</option>`;
    });
    const hasUsers = !!options.length;
    /* console.log('[CommentsPageDataRender:renderFilterByUserOptions]', {
     *   options,
     *   hasUsers,
     *   users,
     *   filterByUsersNode,
     * });
     */
    filterByUsersNode.innerHTML = options.join('\n');
    rootNode.classList.toggle('has-users', hasUsers);
  },

  renderFilterByProcessOptions() {
    const rootNode = CommentsPageNodes.getRootNode();
    const { filterByProcesses } = CommentsPageData;
    const processIds = this.threadComments.api.getProcessIds();
    const processesHash = this.threadComments.api.getProcessesHash();
    const filterByProcessesNode = document.getElementById('filterByProcesses');
    const options = processIds.map((id) => {
      const process = processesHash[id];
      const processName = CommentsPageThreadsHelpers.createProcessName(process);
      const isSelected = filterByProcesses.includes(id);
      return `<option value="${id}"${isSelected ? ' selected' : ''}>${processName}</option>`;
    });
    const hasProcesses = !!options.length;
    /* console.log('[CommentsPageDataRender:renderFilterByProcessOptions]', {
     *   options,
     *   hasProcesses,
     *   processIds,
     *   filterByProcessesNode,
     * });
     */
    filterByProcessesNode.innerHTML = options.join('\n');
    rootNode.classList.toggle('has-processes', hasProcesses);
  },

  renderDerivedFilters() {
    this.renderFilterByUserOptions();
    this.renderFilterByProcessOptions();
  },

  /** @param {TCommentsPageInitParams} initParams */
  start(initParams) {
    const { handlers, threadComments } = initParams;
    // Save paraemeters...
    this.handlers = handlers;
    this.threadComments = threadComments;
    // Add handlers...
    handlers.renderDerivedFilters = this.renderDerivedFilters.bind(this);
  },
};
