// @ts-check

// Import types only...
/* eslint-disable no-unused-vars */
import { ScoresListRender } from './ScoresListRender.js';
import { ScoresListNodes } from './ScoresListNodes.js';
import { ScoresListData } from './ScoresListData.js';
/* eslint-enable no-unused-vars */

import { commonNotify } from '../../common/CommonNotify.js';
import { getErrorText } from '../../common/CommonHelpers.js';

import { sortDataItemIterator } from './ScoresListHelpers.js';

export class ScoresListStates {
  /** @type {ScoresListData} */
  scoresListData;
  /** @type {ScoresListNodes} */
  scoresListNodes;
  /** @type {ScoresListRender} */
  scoresListRender;

  /** @type {number} */
  loadingLevel = 0;

  /**
   * @param {object} params
   * @param {ScoresListData} params.scoresListData
   * @param {ScoresListNodes} params.scoresListNodes
   * @param {ScoresListRender} params.scoresListRender
   */
  constructor(params) {
    const {
      // prettier-ignore
      scoresListData,
      scoresListNodes,
      scoresListRender,
    } = params;
    this.scoresListData = scoresListData;
    this.scoresListNodes = scoresListNodes;
    this.scoresListRender = scoresListRender;
  }

  /**
   * @param {boolean} isLoading
   */
  setLoading(isLoading) {
    this.loadingLevel += isLoading ? 1 : -1;
    const setLoading = this.loadingLevel > 0;
    // Set css class for id="processes-list-root" --> loading, set local status
    const scoresContainerNode = this.scoresListNodes.getScoresContainerNode();
    scoresContainerNode.classList.toggle('loading', setLoading);
    this.scoresListData.isLoading = setLoading;
    this.scoresListData.events.emit('loading', setLoading);
  }

  /**
   * @param {boolean} hasData
   */
  setHasData(hasData) {
    // Set css class for root node, update local state
    const scoresContainerNode = this.scoresListNodes.getScoresContainerNode();
    scoresContainerNode.classList.toggle('empty', !hasData);
    this.scoresListData.hasData = hasData;
    this.scoresListData.events.emit('hasData', hasData);
  }

  /** setEmpty -- Shorthand for `setHasData`
   * @param {boolean} isEmpty
   */
  setEmpty(isEmpty) {
    this.setHasData(!isEmpty);
  }

  /**
   * @param {Error} error
   */
  setError(error) {
    this.scoresListData.isError = !!error;
    const errorText = getErrorText(error);
    if (errorText && errorText !== getErrorText(this.scoresListData.error)) {
      commonNotify.showError(errorText);
    }
    this.scoresListData.error = error;
    this.scoresListRender.renderError(error);
    this.scoresListData.events.emit('error', error);
  }

  // Sort modes...

  /**
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate]
   */
  sortScoresList(opts = {}) {
    const { scoresListData, scoresListRender } = this;
    const { scoresList, sortMode, sortReversed } = scoresListData;
    if (!Array.isArray(scoresList) || !scoresList.length) {
      return;
    }
    /** @type {TSortData} */
    const sortData = {
      // prettier-ignore
      sortMode,
      sortReversed,
    };
    /** @type {(a: TScoresDataItem, b: TScoresDataItem) => TSortResult} */
    const sorter = sortDataItemIterator.bind(undefined, sortData);
    /* console.log('[ScoresListStates:sortScoresList] start', {
     *   scoresList,
     *   sortMode,
     *   sortReversed,
     *   sorter,
     * });
     */
    const sortedList = scoresList.sort(sorter);
    /* console.log('[ScoresListStates:sortScoresList] sorted', {
     *   sortedList,
     *   sortMode,
     *   sortReversed,
     * });
     */
    scoresListData.scoresList = sortedList;
    if (!opts.omitUpdate) {
      scoresListRender.renderData();
    }
  }

  /**
   * @param {TSortMode} sortMode
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate]
   */
  setSortMode(sortMode, opts = {}) {
    const scoresContainerNode = this.scoresListNodes.getScoresContainerNode();
    const { scoresListData } = this;
    /* console.log('[ScoresListStates:setSortMode]', {
     *   sortMode,
     *   opts,
     * });
     */
    scoresListData.sortMode = sortMode;
    // Highlight sorted column...
    scoresContainerNode.setAttribute('data-sort-mode', sortMode);
    // NOTE: Should call `sortScoresList` to update data!
    if (!opts.omitUpdate) {
      this.sortScoresList();
    }
  }

  /**
   * @param {TSortReversed} sortReversed
   * @param {object} [opts]
   * @param {boolean} [opts.omitUpdate]
   */
  setSortReversed(sortReversed, opts = {}) {
    const { scoresListData } = this;
    /* console.log('[ScoresListStates:setSortReversed]', {
     *   sortReversed,
     *   opts,
     * });
     */
    scoresListData.sortReversed = sortReversed;
    // NOTE: Should call `sortScoresList` to update data!
    if (!opts.omitUpdate) {
      this.sortScoresList();
    }
  }
}
