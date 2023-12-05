// @ts-check

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
    const { scoresListRender, scoresListData, scoresListStates } = this;
    const { processId } = scoresListData;
    this.scoresListStates.setLoading(true);
    return this.scoresListLoader
      .loadScoresList(processId)
      .then((scoresList) => {
        // Sort by categories...
        scoresListData.scoresList = scoresList;
        scoresListStates.sortScoresList();
        // TODO: Sort data
        const hasData = !!scoresList.length;
        // TODO: Invoke events to re-render content?
        scoresListRender.renderData();
        scoresListStates.setHasData(hasData);
        scoresListStates.setError(undefined);
        return scoresList;
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('[ScoresListApi:loadData]: error (catched)', {
          error,
        });
        // eslint-disable-next-line no-debugger
        debugger;
        this.scoresListStates.setError(error);
        this.scoresListStates.setHasData(false);
        // throw error;
      })
      .finally(() => {
        this.scoresListStates.setLoading(false);
      });
  }

  /** @param {HTMLSelectElement} node */
  setSortMode(node) {
    const { scoresListStates } = this;
    const sortMode = /** @type {TSortMode} */ (node.value);
    /* console.log('[ScoresListApi:setSortMode]', {
     *   sortMode,
     * });
     */
    scoresListStates.setSortMode(sortMode);
  }

  /** @param {HTMLInputElement} node */
  setSortReversed(node) {
    const { scoresListStates } = this;
    const sortReversed = /** @type {TSortReversed} */ (node.checked);
    /* console.log('[ScoresListApi:setSortReversed]', {
     *   sortReversed,
     * });
     */
    scoresListStates.setSortReversed(sortReversed);
  }
}
