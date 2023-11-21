// @ts-check

// import * as CommonHelpers from '../../common/CommonHelpers.js';
// import { commonNotify } from '../../common/CommonNotify.js';

import { getActualSortedRecentProcesses } from '../../common/RecentProcesses.js';

import * as RecentProcessesListConstants from './RecentProcessesListConstants.js';
// import { RecentProcessesListData } from './RecentProcessesListData.js';
import { RecentProcessesListStates } from './RecentProcessesListStates.js';

export const RecentProcessesListLoader = /** @lends RecentProcessesListLoader */ {
  /**
   * @return {Promise<TRecentProcesses>}
   */
  loadRecentProcesses() {
    // Emulate async load (for potential future upscaling)...
    const recentProcesses = getActualSortedRecentProcesses();
    return Promise.resolve(recentProcesses);
  },

  /** Load processes data
   * @param {TRecentProcesses} recentProcesses
   * @return {Promise<TProcessAttributes[]>}
   */
  loadProcessesAttributes(recentProcesses) {
    const ids = recentProcesses.map(({ id }) => id);
    const idsList = ids.join(',');
    const { processesAttributesApiUrl: urlBase } = RecentProcessesListConstants;
    /* // TODO: Use query params?
     * const loadParams = {
     *   ids,
     * };
     * const urlQuery = CommonHelpers.makeQuery(loadParams, { addQuestionSymbol: true });
     */
    const url = urlBase + idsList; // urlQuery;
    /* console.log('[RecentProcessesListLoader:loadProcessesAttributes]: start', {
     *   ids,
     *   idsList,
     *   url,
     * });
     */
    RecentProcessesListStates.setLoading(true);
    return fetch(url)
      .then((res) => {
        const { ok, status, statusText } = res;
        if (!ok) {
          // Something went wrong?
          const reason =
            [statusText, status && 'status: ' + status].filter(Boolean).join(', ') ||
            'Unknown error';
          const error = new Error('Data loading error: ' + reason);
          // eslint-disable-next-line no-console
          console.error('[RecentProcessesListLoader:loadProcessesAttributes]: error (on then)', {
            reason,
            res,
            url,
          });
          // eslint-disable-next-line no-debugger
          debugger;
          throw error;
        }
        // All is ok...
        return res.json();
      })
      .then((/** @type {TProcessAttributes[]} */ data) => {
        /* console.log('[RecentProcessesListLoader:loadProcessesAttributes]: data', {
         *   data,
         *   ids,
         *   url,
         * });
         */
        return data;
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('[RecentProcessesListLoader:loadProcessesAttributes]: error (catched)', {
          error,
          url,
        });
        // eslint-disable-next-line no-debugger
        debugger;
        throw error;
      })
      .finally(() => {
        RecentProcessesListStates.setLoading(false);
      });
  },
};
