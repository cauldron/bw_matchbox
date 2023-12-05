// @ts-check

import { defaultSortMode, defaultSortReversed } from './ScoresListConstants.js';

export class ScoresListData {
  // Params...
  /** @type {TProcessId} */
  processId = undefined;

  // Data...
  /** @type {TScoresList} */
  scoresList = [];

  // Events...
  /** @type {TEvents} */
  events = undefined;

  // Sort...

  /** @type {TSortMode} */
  sortMode = defaultSortMode;
  /** @type {TSortReversed} */
  sortReversed = defaultSortReversed;

  // Common params...
  /** @type {Error} */
  error = undefined;
  isError = false;
  isLoading = true;
  hasData = false;
}
