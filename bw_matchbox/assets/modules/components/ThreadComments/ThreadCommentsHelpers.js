// @ts-check

import { ThreadCommentsData } from './ThreadCommentsData.js';

/** @typedef TSortOpts
 * @property {string} key
 * @property {boolean} asDate
 */

export const ThreadCommentsHelpers = {
  /** createProcessName
   * @param {TProcess} process
   * @return {string}
   */
  createProcessName(process) {
    const { id, name } = process;
    return `${name} #${id}`;
  },

  /** Filter visible comment ids
   * @param {TCommentId} _commentId
   * @return {boolean} - Is comment visible?
   */
  isCommentVisible(_commentId) {
    /* // TODO: Tho hide some comments (here we hide comment for 'MyThreads' filter
     * const {
     *   filterByMyThreads, // NOTE: Should override other filters
     *   sharedParams,
     *   commentsHash,
     * } = ThreadCommentsData;
     * if (filterByMyThreads) {
     *   const { currentUser } = sharedParams;
     *   const comment = commentsHash[commentId];
     *   const { user } = comment;
     *   if (user !== currentUser) {
     *     return false;
     *   }
     * }
     */
    return true;
  },

  /** Filter threads for current filters
   * @param {TThreadId} threadId
   * @return {boolean} - Is thread visible?
   */
  isThreadVisible(threadId) {
    let {
      // Those filters can be overrided if `filterByMyThreads` has set
      filterByState,
      filterByUsers,
      filterByProcesses,
    } = ThreadCommentsData;
    const {
      filterByMyThreads, // NOTE: Should override other filters
      threadsHash,
      commentsByThreads,
      commentsHash,
      currentUser,
    } = ThreadCommentsData;
    const thread = threadsHash[threadId];
    const { resolved, process } = thread;
    /* console.log('[ThreadCommentsHelpers:isThreadVisible]', {
     *   currentUser,
     *   filterByState,
     *   filterByUsers,
     *   filterByProcesses,
     *   filterByMyThreads,
     * });
     */
    if (filterByMyThreads) {
      // Filter for current user' and open threads
      filterByState = 'open';
      filterByUsers = [currentUser];
      filterByProcesses = undefined;
      /* console.log('[ThreadCommentsHelpers:isThreadVisible] filterByMyThreads', {
       *   currentUser,
       *   filterByState,
       *   filterByUsers,
       *   filterByProcesses,
       *   filterByMyThreads,
       * });
       */
    }
    // Filter with `filterByState`...
    if (filterByState) {
      if (filterByState === 'resolved' && !resolved) {
        return false;
      }
      if (filterByState === 'open' && resolved) {
        return false;
      }
    }
    // Filter with `filterByUsers`...
    if (Array.isArray(filterByUsers) && filterByUsers.length) {
      const commentIds = commentsByThreads[threadId];
      const commentUsersList = commentIds.map((userId) => commentsHash[userId].user);
      // TODO: Optimize search?
      const commonUsers = commentUsersList
        .map((user) => {
          return filterByUsers.includes(user) && user;
        })
        .filter(Boolean);
      const hasCommonUsers = !!commonUsers.length;
      if (!hasCommonUsers) {
        return false;
      }
    }
    // Filter with `filterByProcesses`...
    if (Array.isArray(filterByProcesses) && filterByProcesses.length) {
      if (!filterByProcesses.includes(process.id)) {
        return false;
      }
    }
    return true;
  },

  /** Compare two threads objects
   * @param {TSortOpts} opts
   * @param {TThread} a
   * @param {TThread} b
   * @return {-1 | 0 | 1}
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
   * @param {TThread[]} threads
   */
  sortThreads(threads) {
    const { sortThreadsBy, sortThreadsReversed } = ThreadCommentsData;
    /** @type {TSortOpts} */
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
   * @param {TCommentId} aId
   * @param {TCommentId} bId
   * @return {number}
   */
  sortCommentIdsCompare(aId, bId) {
    const { comments } = ThreadCommentsData;
    const a = comments[aId];
    const b = comments[bId];
    return this.sortCommentsCompare(a, b);
    // return a.position - b.position;
  },

  /** Compare two comments objects
   * @param {TComment} a
   * @param {TComment} b
   * @return {number}
   */
  sortCommentsCompare(a, b) {
    return a.position - b.position;
  },

  /**
   * @param {Element} node
   * @param {string} groupId
   */
  getRadioGroupValue(node, groupId) {
    /** @type {HTMLInputElement} */
    const elem = node.querySelector('input[type="radio"][name="' + groupId + '"]:checked');
    return elem && elem.value;
  },
};
