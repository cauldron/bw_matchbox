import { CommentsPageData } from './CommentsPageData.js';

export const CommentsPageHelpers = /** @lends CommentsPageHelpers */ {
  __id: 'CommentsPageHelpers',

  /**
   * @param {HTMLSelectElement} node
   */
  getMultipleSelectValues(node) {
    const options = Array.from(node.options);
    return options.filter((item) => item.selected).map((item) => item.value);
  },

  /**
   * @param {HTMLSelectElement} node
   * @param {<stringable>[]} values
   */
  setMultipleSelectValues(node, values) {
    const strValues = values.map(String);
    const options = Array.from(node.options);
    options.forEach((item) => {
      const { value, selected } = item;
      const isSelected = strValues.includes(value);
      if (isSelected !== selected) {
        item.selected = isSelected;
      }
    });
  },

  /** Compare two threads objects
   * @param {object} opts
   * @param {<keyof TThread>} [opts.key='name']
   * @param {boolean} [opts.asDate] - Treat values as string date representation
   * @param {<TThread>} a
   * @param {<TThread>} b
   * @return {-1, 0, 1}
   */
  sortThreadsCompareWithOptions(opts, a, b) {
    const { key = 'name', asDate } = opts;
    let aVal = a[key];
    let bVal = b[key];
    if (asDate) {
      // TODO: To use externally-provided hashes to compare?
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }
    return aVal === bVal ? 0 : aVal < bVal ? -1 : 1;
  },

  /** Sort threads data (inplace)
   * @param {<TThread[]>} threads
   */
  sortThreads(threads) {
    const { sortThreadsBy, sortThreadsReversed } = CommentsPageData;
    const opts = {
      key: sortThreadsBy,
      asDate: false,
    };
    const matchDate = 'Date';
    if (sortThreadsBy.endsWith(matchDate)) {
      opts.asDate = true;
      // Use `(.*)Date` part of the string
      opts.key = sortThreadsBy.substring(0, sortThreadsBy.length - matchDate.length);
    }
    threads.sort(this.sortThreadsCompareWithOptions.bind(this, opts));
    if (sortThreadsReversed) {
      threads.reverse();
    }
  },

  /** Compare two comments objects
   * @param {<TComment>} a
   * @param {<TComment>} b
   * @return {-1, 0, 1}
   */
  sortCommentIdsCompare(aId, bId) {
    const { comments } = CommentsPageData;
    const a = comments[aId];
    const b = comments[bId];
    return a.position - b.position;
  },

  /** Compare two comments objects
   * @param {<TComment>} a
   * @param {<TComment>} b
   * @return {-1, 0, 1}
   */
  sortCommentsCompare(a, b) {
    return a.position - b.position;
  },
};
