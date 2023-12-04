// @ts-check

import * as CommonConstants from '../../common/CommonConstants.js';
import * as CommonHelpers from '../../common/CommonHelpers.js';

import { RecentProcessesListData } from './RecentProcessesListData.js';
import { RecentProcessesListNodes } from './RecentProcessesListNodes.js';

export class RecentProcessesListRender {
  /** @type {Intl.DateTimeFormat} */
  dateTimeFormatter;
  getDateTimeFormatter() {
    if (!this.dateTimeFormatter) {
      this.dateTimeFormatter = new Intl.DateTimeFormat(
        CommonConstants.dateTimeFormatLocale,
        CommonConstants.dateTimeFormatOptions,
      );
    }
    return this.dateTimeFormatter;
  }

  /** renderRecentProcess
   * @param {TRecentProcess} recentProcess
   * @return {string} - HTML content
   */
  renderRecentProcess(recentProcess) {
    const { id, name, time } = recentProcess;
    const dateTimeFormatter = this.getDateTimeFormatter();
    const date = new Date(time);
    const dateStr = dateTimeFormatter.format(date);
    const className = [
      // prettier-ignore
      'recent-process-item',
    ]
      .filter(Boolean)
      .join(' ');
    const content = `
          <div data-recent-process-id="${id}" id="recent-process-${id}" class="${className}">
            <a href="/process/${id}">${name} <span class="date">(visited at ${dateStr})</span></a>
          </div>
        `;
    /* console.log('[RecentProcessesListRender:renderHelpers:renderRecentProcess]', {
     *   id,
     *   name,
     * });
     */
    return content;
  }
  /**
   * @param {Error} error
   */
  renderError(error) {
    const isError = !!error;
    const rootNode = RecentProcessesListNodes.getRootNode();
    rootNode.classList.toggle('has-error', isError);
    const errorNode = RecentProcessesListNodes.getErrorNode();
    const errorText = error ? error.message || String(error) : '';
    // DEBUG: Show error in console
    if (errorText) {
      // eslint-disable-next-line no-console
      console.error('[RecentProcessesListRender:renderError]: got the error', {
        error,
        errorText,
      });
      // eslint-disable-next-line no-debugger
      debugger;
      /* // NOTE: Show error only when it has occured (eg in `RecentProcessesListHandlers`), not when it's rendering.
       * commonNotify.showError(errorText);
       */
    }
    // Update (or clear) error block content...
    errorNode.innerHTML = errorText;
  }

  /** renderData -- Render all recent processes (or append data)
   * @param {object} opts
   * @param {boolean} [opts.append] - Append data to the end of the table (default behavior: replace)
   */
  renderData(opts = {}) {
    const { recentProcesses } = RecentProcessesListData;
    const recentProcessesListNode = RecentProcessesListNodes.getRecentProcessesListNode();
    const content = recentProcesses.map(this.renderRecentProcess.bind(this)).join('\n');
    /* // DEBUG
     * const rootNode = RecentProcessesListNodes.getRootNode();
     * console.log('[RecentProcessesListRender:renderData]', {
     *   rootNode,
     *   recentProcessesListNode,
     *   content,
     *   recentProcesses,
     * });
     */
    if (!opts.append) {
      // Replace data...
      recentProcessesListNode.innerHTML = content; // Insert content just as raw html
    } else {
      // Append new data (will be used for incremental update)...
      const contentNodes = CommonHelpers.htmlToElements(content);
      recentProcessesListNode.append.apply(recentProcessesListNode, contentNodes);
    }
  }

  /** @param {TRecentProcessesListInitParams} initParams */
  init(initParams) {
    // TODO: Check for `hasInited` before cruical operations?
    const { handlers, events } = initParams;
    // Save handlers and events...
    this.handlers = handlers;
    this.events = events;
  }
}
