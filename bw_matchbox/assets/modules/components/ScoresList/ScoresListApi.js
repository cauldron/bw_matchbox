// @ts-check

import { commonNotify } from '../../common/CommonNotify.js';

import { sortScoresDataIterator } from './ScoresListHelpers.js';

// Import types only...
/* eslint-disable no-unused-vars */
import { ScoresListData } from './ScoresListData.js';
import { ScoresListLoader } from './ScoresListLoader.js';
import { ScoresListStates } from './ScoresListStates.js';
import { ScoresListNodes } from './ScoresListNodes.js';
import { ScoresListRender } from './ScoresListRender.js';
/* eslint-enable no-unused-vars */

/* External API (alternate way, basic handlers are in `handlers` object (above)...
 * @implements {TScoresListApi}
 */
export class ScoresListApi {
  /** @type {ScoresListData} */
  scoresListData;
  /** @type {ScoresListLoader} */
  scoresListLoader;
  /** @type {ScoresListStates} */
  scoresListStates;
  /** @type {ScoresListNodes} */
  scoresListNodes;
  /** @type {ScoresListRender} */
  scoresListRender;

  /**
   * @param {object} params
   * @param {ScoresListData} params.scoresListData
   * @param {ScoresListLoader} params.scoresListLoader
   * @param {ScoresListStates} params.scoresListStates
   * @param {ScoresListNodes} params.scoresListNodes
   * @param {ScoresListRender} params.scoresListRender
   */
  constructor(params) {
    const {
      // prettier-ignore
      scoresListData,
      scoresListLoader,
      scoresListStates,
      scoresListNodes,
      scoresListRender,
    } = params;
    this.scoresListData = scoresListData;
    this.scoresListLoader = scoresListLoader;
    this.scoresListStates = scoresListStates;
    this.scoresListNodes = scoresListNodes;
    this.scoresListRender = scoresListRender;
  }

  getScores() {
    return this.scoresListData.processId;
  }

  loadData() {
    const { scoresListData } = this;
    const { processId } = scoresListData;
    this.scoresListStates.setLoading(true);
    return this.scoresListLoader
      .loadScoresList(processId)
      .then((scoresList) => {
        // Sort by categories...
        scoresList.sort(sortScoresDataIterator);
        this.scoresListData.scoresList = scoresList;
        const hasData = !!scoresList.length;
        // TODO: Invoke events to re-render content?
        this.scoresListRender.renderData();
        this.scoresListStates.setHasData(hasData);
        this.scoresListStates.setError(undefined);
        return scoresList;
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('[ScoresListApi:loadData]: error (catched)', {
          error,
        });
        // eslint-disable-next-line no-debugger
        debugger;
        commonNotify.showError(error);
        this.scoresListStates.setError(error);
        this.scoresListStates.setHasData(false);
        // throw error;
      })
      .finally(() => {
        this.scoresListStates.setLoading(false);
      });
  }
}
