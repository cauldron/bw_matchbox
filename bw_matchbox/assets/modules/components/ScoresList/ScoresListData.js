// @ts-check

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

  // Common params...
  error = undefined;
  isError = false;
  isLoading = true;
  hasData = false;
}
