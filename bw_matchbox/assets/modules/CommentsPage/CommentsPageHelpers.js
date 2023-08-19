export const CommentsPageHelpers = /** @lends CommentsPageHelpers */ {
  __id: 'CommentsPageHelpers',

  /**
   * @param {HTMLSelectElement} node
   */
  getMultipleSelectValues(node) {
    const options = Array.from(node.options);
    return options.filter((item) => item.selected).map((item) => item.value);
  },
};
