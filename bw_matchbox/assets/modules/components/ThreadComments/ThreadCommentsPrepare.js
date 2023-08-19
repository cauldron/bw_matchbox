// @ts-check

import { ThreadCommentsData } from './ThreadCommentsData.js';
import { ThreadCommentsHelpers } from './ThreadCommentsHelpers.js';

export const ThreadCommentsPrepare = /** @lends ThreadCommentsPrepare */ {
  makeDerivedData() {
    const { comments, threads, useFakeCurrentUser } = ThreadCommentsData;
    /* console.log('[ThreadCommentsPrepare:makeDerivedData]', {
     *   comments,
     *   threads,
     * });
     */
    /** @type {TUserName[]} */
    const users = comments.reduce((users, { user }) => {
      if (!users.includes(user)) {
        users.push(user);
      }
      return users;
    }, []);
    /** @type {Record<TProcessId, TProcess>} */
    const processesHash = {};
    /** @type {TProcessId[]} */
    const processIds = threads.reduce((processIds, { process }) => {
      const { id } = process;
      if (!processIds.includes(id)) {
        processesHash[id] = process;
        processIds.push(id);
      }
      return processIds;
    }, []);
    /* console.log('[ThreadCommentsPrepare:makeDerivedData] done', {
     *   users,
     *   processesHash,
     *   processIds,
     * });
     */
    ThreadCommentsData.users = users;
    // DEBUG: Set first given user as current user
    if (useFakeCurrentUser) {
      ThreadCommentsData.currentUser = users[0];
    }
    ThreadCommentsData.processesHash = processesHash;
    ThreadCommentsData.processIds = processIds;
  },

  /** acceptAndPrepareData -- Prepare, store and render data...
   */
  acceptAndPrepareData() {
    const { comments, threads } = ThreadCommentsData;
    ThreadCommentsHelpers.sortThreads(threads);
    comments.sort(ThreadCommentsHelpers.sortCommentsCompare);
    // Create hashes...
    const commentsHash = comments.reduce((hash, comment) => {
      hash[comment.id] = comment;
      return hash;
    }, {});
    const threadsHash = threads.reduce((hash, thread) => {
      hash[thread.id] = thread;
      return hash;
    }, {});
    // Save created hashes...
    ThreadCommentsData.commentsHash = commentsHash;
    ThreadCommentsData.threadsHash = threadsHash;
    /* console.log('[ThreadCommentsPrepare:acceptAndPrepareData]', {
     *   comments,
     *   threads,
     *   commentsHash,
     *   threadsHash,
     * });
     */
    // Prepare comments lists for threads...
    /** @type {Record<TThreadId, TCommentId[]>} */
    const commentsByThreads = {};
    comments.forEach((comment) => {
      const { id, thread: threadId } = comment;
      const commentIds = commentsByThreads[threadId] || (commentsByThreads[threadId] = []);
      commentIds.push(id);
    });
    // Save comments data to store...
    ThreadCommentsData.commentsByThreads = commentsByThreads;
    /* console.log('[ThreadCommentsPrepare:acceptAndPrepareData]: done', {
     *   comments,
     *   threads,
     *   commentsHash,
     *   threadsHash,
     *   commentsByThreads,
     * });
     */
  },
};
