export const CommentsPageThreadsHelpers = {
  __id: 'CommentsPageThreadsHelpers',

  /** createProcessName
   * @param {<TProcess>} process
   * @return {string}
   */
  createProcessName(process) {
    const { id, name } = process;
    return `${name} #${id}`;
  },
};
