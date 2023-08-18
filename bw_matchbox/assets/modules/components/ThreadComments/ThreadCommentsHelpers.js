// @ts-check

import { ThreadCommentsData } from './ThreadCommentsData.js';

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
      sharedParams,
    } = ThreadCommentsData;
    const { currentUser } = sharedParams;
    const thread = threadsHash[threadId];
    const { resolved, process } = thread;
    /* console.log('[ThreadCommentsHelpers:isThreadVisible]', {
     *   currentUser,
     *   sharedParams,
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
       *   sharedParams,
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
};
