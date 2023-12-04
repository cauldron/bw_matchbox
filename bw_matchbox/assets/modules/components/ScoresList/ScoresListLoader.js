// @ts-check

// import { getActualSortedScores } from '../../common/Scores.js';

import * as ScoresListConstants from './ScoresListConstants.js';

// Import types only...
/* eslint-disable no-unused-vars */
import { ScoresListStates } from './ScoresListStates.js';
/* eslint-enable no-unused-vars */

export class ScoresListLoader {
  /** @type {ScoresListStates} */
  scoresListStates;

  /**
   * @param {object} params
   * @param {ScoresListStates} params.scoresListStates
   */
  constructor(params) {
    const {
      // prettier-ignore
      scoresListStates,
    } = params;
    this.scoresListStates = scoresListStates;
  }

  /** Load processes data
   * @param {TProcessId} processId
   * @return {Promise<TScoresDataItem[]>}
   */
  loadScoresList(processId) {
    const { scoresApiUrlPrefix: urlBase } = ScoresListConstants;
    const url = urlBase + processId; // urlQuery;
    /* console.log('[ScoresListLoader:loadScoresList]: start', {
     *   url,
     * });
     */
    this.scoresListStates.setLoading(true);
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
          console.error('[ScoresListLoader:loadScoresList]: error (on then)', {
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
      .then((/** @type {TScoresDataItem[]} */ data) => {
        /* console.log('[ScoresListLoader:loadScoresList]: data', {
         *   data,
         *   processId,
         *   url,
         * });
         */
        return data;
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('[ScoresListLoader:loadScoresList]: error (catched)', {
          error,
          url,
        });
        // eslint-disable-next-line no-debugger
        debugger;
        throw error;
      })
      .finally(() => {
        this.scoresListStates.setLoading(false);
      });
  }
}
