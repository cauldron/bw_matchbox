// @ts-check

// Import types only...
/* eslint-disable no-unused-vars */
import { ThreadCommentsRender } from './ThreadCommentsRender.js';
/* eslint-enable no-unused-vars */

import { ThreadCommentsData } from './ThreadCommentsData.js';
import { ThreadCommentsHelpers } from './ThreadCommentsHelpers.js';
import { ThreadCommentsStates } from './ThreadCommentsStates.js';

export const ThreadCommentsPrepare = /** @lends ThreadCommentsPrepare */ {
  /** @type {TEvents} */
  events: undefined,

  /** @type {ThreadCommentsRender} */
  threadCommentsRender: undefined,

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

  /**
   * @param {TThreadCommentsResponseData} json - Partial data
   */
  addNewThreadData(json) {
    /* // data example:
     * comments: [{…}]
     * threads: [{…}]
     * total_comments: 13
     * total_threads: 4
     */
    const { comments, threads, total_comments: totalComments, total_threads: totalThreads } = json;
    /* console.log('[ThreadCommentsPrepare:addNewThreadData]: got data', {
     *   json,
     *   comments,
     *   threads,
     *   totalThreads,
     *   totalComments,
     * });
     */
    // Add new data...
    ThreadCommentsData.comments.push.apply(ThreadCommentsData.comments, comments);
    ThreadCommentsData.threads.push.apply(ThreadCommentsData.threads, threads);
    const hasComments = Array.isArray(comments) && !!comments.length;
    const hasThreads = Array.isArray(threads) && !!threads.length;
    const hasData = hasComments || hasThreads;
    // Update total comments number...
    ThreadCommentsStates.setTotalCommentsCount(totalComments);
    ThreadCommentsStates.setTotalThreadsCount(totalThreads);
    ThreadCommentsStates.setError(undefined); // Clear the error: all is ok
    ThreadCommentsStates.setHasData(ThreadCommentsData.hasData || hasData); // Update 'has data' flag
    // Prepare and store data...
    ThreadCommentsPrepare.acceptAndPrepareData();
    ThreadCommentsPrepare.makeDerivedData();
    // Render data...
    this.threadCommentsRender.renderNewThreads(threads);
    this.threadCommentsRender.reorderRenderedThreads();
    this.threadCommentsRender.updateVisibleThreadsStatus();
    this.events.emit('updatedData');
  },

  /** @param {TThreadCommentsResponseData} json */
  updateAllData(json) {
    /* // data example:
     * comments: [{…}]
     * threads: [{…}]
     * total_comments: 13
     * total_threads: 4
     */
    const { comments, threads, total_comments: totalComments, total_threads: totalThreads } = json;
    const hasComments = Array.isArray(comments) && !!comments.length;
    const hasThreads = Array.isArray(threads) && !!threads.length;
    const hasData = hasComments || hasThreads;
    /* console.log('[ThreadCommentsPrepare:updateAllData]: got data', {
     *   hasData,
     *   json,
     *   comments,
     *   threads,
     *   totalThreads,
     *   totalComments,
     * });
     */
    // Store data...
    ThreadCommentsData.comments = comments;
    ThreadCommentsData.threads = threads;
    // Update total comments number...
    ThreadCommentsStates.setTotalCommentsCount(totalComments);
    ThreadCommentsStates.setTotalThreadsCount(totalThreads);
    ThreadCommentsStates.setError(undefined); // Clear the error: all is ok
    ThreadCommentsStates.setHasData(ThreadCommentsData.hasData || hasData); // Update 'has data' flag
    // Prepare and store data...
    ThreadCommentsPrepare.acceptAndPrepareData();
    ThreadCommentsPrepare.makeDerivedData();
    // Render data...
    this.threadCommentsRender.renderData();
    this.threadCommentsRender.updateVisibleThreadsStatus();
    this.events.emit('updatedData');
  },

  /**
   * @param {object} params
   * @param {TComment} params.comment
   * @param {TThreadId} params.threadId
   * @param {Element} params.threadNode - TODO: To make thread element optional and find it in the dom if omited?
   */
  addCommentToThread({ threadId, threadNode, comment }) {
    const { role, threadsHash } = ThreadCommentsData;
    const thread = threadsHash[threadId];
    const { id: commentId } = comment;
    const { comments, threads, commentsHash, commentsByThreads } = ThreadCommentsData;
    // Check roles...
    if (role !== 'editors' && role !== 'reviewers') {
      const error = new Error(`This role (${role}) hasn't allowed to add comments`);
      // eslint-disable-next-line no-console
      console.warn('[ThreadCommentsPrepare:addCommentToThread]', error);
      throw error;
    }
    // Update thread modified date (manually!)
    const currDate = new Date();
    const currDateStr = currDate.toUTCString();
    // Update data...
    thread.modified = currDateStr;
    // Add comment to list (`comments`) and update hashes (`commentsByThreads`) ...
    comments.push(comment);
    commentsByThreads[threadId].push(commentId);
    commentsHash[commentId] = comment;
    // Sort comments...
    comments.sort(ThreadCommentsHelpers.sortCommentsCompare);
    ThreadCommentsHelpers.sortThreads(threads);
    // Update content...
    const threadTitleTextNode = threadNode.querySelector('.title-text');
    const threadTitleTextContent =
      this.threadCommentsRender.helpers.createThreadTitleTextContent(thread);
    /* console.log('[ThreadCommentsPrepare:addCommentToThread]: done', {
     *   commentId,
     *   comment,
     *   commentsHash,
     *   commentsByThreads,
     *   thread,
     *   threadId,
     *   currDate,
     *   currDateStr,
     *   threadTitleTextNode,
     *   threadTitleTextContent,
     * });
     */
    // Update data & elements' states...
    threadTitleTextNode.innerHTML = threadTitleTextContent;
    // this.threadCommentsRender.renderData();
    this.threadCommentsRender.updateThreadComments(threadId);
    this.threadCommentsRender.updateVisibleThreads();
    ThreadCommentsHelpers.sortThreads(threads);
    this.threadCommentsRender.reorderRenderedThreads();
  },

  /** @param {TThreadCommentsInitParams} initParams */
  init(initParams) {
    const { events, threadCommentsRender } = initParams;
    // Save params...
    this.events = events;
    this.threadCommentsRender = threadCommentsRender;
  },
};
