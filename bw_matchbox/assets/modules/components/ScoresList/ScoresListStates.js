// @ts-check

import { commonNotify } from '../../common/CommonNotify.js';
import { getErrorText } from '../../common/CommonHelpers.js';

// Import types only...
/* eslint-disable no-unused-vars */
import { ScoresListRender } from './ScoresListRender.js';
import { ScoresListNodes } from './ScoresListNodes.js';
import { ScoresListData } from './ScoresListData.js';
/* eslint-enable no-unused-vars */

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
    const rootNode = this.scoresListNodes.getRootNode();
    rootNode.classList.toggle('loading', setLoading);
    this.scoresListData.isLoading = setLoading;
    this.scoresListData.events.emit('loading', setLoading);
  }

  /**
   * @param {boolean} hasData
   */
  setHasData(hasData) {
    // Set css class for root node, update local state
    const rootNode = this.scoresListNodes.getRootNode();
    rootNode.classList.toggle('empty', !hasData);
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
}
