// @ts-check

export const ProcessesListConstants = {
  __id: 'ProcessesListConstants',

  // DEBUG: useDebug -- specify debug mode. Don't use it for production! (TODO: To poplate from `CommonConstants`)
  useDebug: false,

  /** Api base */
  processesApiUrl: '/processes',

  /** The number of records to retrieve at once and to display */
  pageSize: 25,
  /** Default order value
   * @type {TOrderByString}
   */
  defaultOrderBy: 'random',
  /** Default filter value
   * @type {TFilterProcessesByString}
   */
  defaultFilterBy: 'none',
  /** Default userDb value
   * @type {TUserDbString}
   */
  defaultUserDb: 'source', // `Source` is the same as the server provided data
};
