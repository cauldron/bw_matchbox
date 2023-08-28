// @ts-check

import * as CommonConstants from '../../common/CommonConstants.js';
import * as CommonHelpers from '../../common/CommonHelpers.js';
import { commonNotify } from '../../common/CommonNotify.js';

import { ThreadCommentsData } from './ThreadCommentsData.js';
import { ThreadCommentsNodes } from './ThreadCommentsNodes.js';
import { ThreadCommentsHelpers } from './ThreadCommentsHelpers.js';

/** Local (not public) helpers... */
class RenderHelpers {
  /** @type {Intl.DateTimeFormat} */
  dateTimeFormatter;

  /** getCommentsForThread
   * @param {TThreadId} threadId
   * @return {TComment[]} - Comments data list
   */
  getCommentsForThread(threadId) {
    const { commentsHash, commentsByThreads } = ThreadCommentsData;
    const commentsByThreadsIds = commentsByThreads[threadId];
    const commentsList = commentsByThreadsIds.map((id) => commentsHash[id]);
    return commentsList;
  }

  /**
   * @param {TThreadId} threadId
   */
  getVisibleCommentsForThread(threadId) {
    const { commentsHash, commentsByThreads } = ThreadCommentsData;
    const commentsByThreadsIds = commentsByThreads[threadId];
    const visibleCommentIds = commentsByThreadsIds.filter(ThreadCommentsHelpers.isCommentVisible);
    const commentsList = visibleCommentIds.map((id) => commentsHash[id]);
    return commentsList;
  }

  getDateTimeFormatter() {
    if (!this.dateTimeFormatter) {
      this.dateTimeFormatter = new Intl.DateTimeFormat(
        CommonConstants.dateTimeFormatLocale,
        CommonConstants.dateTimeFormatOptions,
      );
    }
    return this.dateTimeFormatter;
  }

  /**
   * @param {TThread} thread
   */
  createThreadTitleTextContent(thread) {
    const {
      id: threadId,
      // created, // TGmtDateStr, eg: 'Sat, 12 Aug 2023 12:36:08 GMT'
      modified, // TGmtDateStr, eg: 'Sat, 12 Aug 2023 12:36:08 GMT'
      name, // string, eg: 'Возмутиться кпсс гул'
      reporter, // string, eg: '阿部 篤司'
      resolved, // boolean, eg: false
      process, // TProcess;
    } = thread;
    const commentsList = this.getVisibleCommentsForThread(threadId);
    const commentsCount = commentsList.length;
    const modifiedDate = new Date(modified);
    const dateTimeFormatter = this.getDateTimeFormatter();
    const modifiedStr = dateTimeFormatter.format(modifiedDate);
    const processName = ThreadCommentsHelpers.createProcessName(process);
    const infoText = [
      reporter && `<label>reporter:</label> ${reporter}`,
      commentsCount && `<label>comments:</label> ${commentsCount}`,
      modifiedStr && `<label>modified date:</label> ${modifiedStr}`,
      process && process.id && process.name && `<label>process:</label> ${processName}`,
      resolved ? 'resolved' : 'open',
    ]
      .filter(Boolean)
      .join(', ');
    const content = `
            <span class="name">${name}</span>
            <span class="info">(${infoText})</span>
        `;
    return content;
  }

  /** renderThread
   * @param {TThread} thread
   * @return {string} - HTML content
   */
  renderThreadTitleActions(thread) {
    const {
      // id: threadId,
      // resolved, // boolean, eg: false
      // created, // TGmtDateStr, eg: 'Sat, 12 Aug 2023 12:36:08 GMT'
      // modified, // TGmtDateStr, eg: 'Sat, 12 Aug 2023 12:36:08 GMT'
      // name, // string, eg: 'Возмутиться кпсс гул'
      reporter, // string, eg: '阿部 篤司'
      // process, // TProcess;
    } = thread;
    const { currentUser, disableResolveByNonReporters, hideDisabledTitleActions } =
      ThreadCommentsData;
    const isCurrentReporter = currentUser === reporter;
    const isResolveEnabled = !disableResolveByNonReporters || isCurrentReporter;
    const isResolveVisible = !hideDisabledTitleActions || isResolveEnabled;
    const actions = [
      `<a id="threadAddComment" title="Add comment"><i class="fa-solid fa-comment"></i></a>`,
      isResolveVisible &&
        `<a id="threadResolve" class="${
          !isResolveEnabled && 'disabled'
        }"><i class="is-resolved fa-solid fa-lock" title="Resolved (click to open)"></i><i class="not-resolved fa-solid fa-lock-open" title="Open (click to resolve)"></i></a>`,
    ].filter(Boolean);
    /* console.log('[ThreadCommentsRender:renderHelpers:renderThreadTitleActions]', {
     *   actions,
     *   reporter,
     *   currentUser,
     *   thread,
     * });
     */
    return actions.join('\n');
  }

  /** renderThread
   * @param {TThread} thread
   * @return {string} - HTML content
   */
  renderThread(thread) {
    const {
      id: threadId,
      resolved, // boolean, eg: false
      // created, // TGmtDateStr, eg: 'Sat, 12 Aug 2023 12:36:08 GMT'
      // modified, // TGmtDateStr, eg: 'Sat, 12 Aug 2023 12:36:08 GMT'
      // name, // string, eg: 'Возмутиться кпсс гул'
      // reporter, // string, eg: '阿部 篤司'
      // process, // TProcess;
    } = thread;
    const isVisible = ThreadCommentsHelpers.isThreadVisible(threadId);
    const commentsList = this.getVisibleCommentsForThread(threadId);
    const commentPositions = commentsList.map((comment) => comment.position);
    const commentsCount = commentsList.length;
    const isEmpty = !commentsCount;
    const isExpanded = false; // commentsCount <= 2; // DEBUG!
    const className = [
      // prettier-ignore
      'thread',
      isEmpty && 'empty',
      isExpanded && 'expanded',
      !isVisible && 'hidden',
      resolved && 'resolved',
    ]
      .filter(Boolean)
      .join(' ');
    // Render actual comments if thread is expanded by default...
    const commentsContent = isExpanded
      ? this.renderThreadCommentsContent(threadId)
      : // DEBUG: Here should be empty data for the unexpanded thread comments...
        commentPositions.join(', ');
    const threadTitleActions = this.renderThreadTitleActions(thread);
    const threadTitleTextContent = this.createThreadTitleTextContent(thread);
    const content = `
          <div data-thread-id="${threadId}" id="thread-${threadId}" class="${className}">
            <div class="main-row">
              <div class="expand-button-wrapper" title="Expand/collapse comments">
                <a class="expand-button">
                  <i class="fa-solid fa-chevron-right"></i>
                </a>
              </div>
              <div class="title">
                <div class="title-text">
                  ${threadTitleTextContent}
                </div>
                <div class="title-actions">
                  ${threadTitleActions}
                </div>
              </div>
            </div>
            <div class="comments" data-for-thread-id="${threadId}" id="comments-for-thread-${threadId}">${commentsContent}</div>
          </div>
        `;
    /* console.log('[ThreadCommentsRender:renderHelpers:renderThread]', {
     *   content,
     *   commentPositions,
     *   threadId,
     *   // name,
     *   // reporter,
     *   // currentUser,
     *   commentsList,
     *   thread,
     * });
     */
    return content;
  }

  /**
   * @param {TComment} comment
   */
  renderComment(comment) {
    const { currentUser } = ThreadCommentsData;
    const {
      id, // number; // 2
      position, // number; // 1
      thread: threadId, // number; // 1
      user, // string; // 'Puccio Bernini'
      content, // string; // '...'
    } = comment;
    const isCurrentUser = user === currentUser;
    const className = [
      // prettier-ignore
      'comment',
      // resolved && 'resolved',
    ]
      .filter(Boolean)
      .join(' ');
    const html = `
          <div
            id="thread-%{threadId}-comment-${id}"
            data-thread-id="${threadId}"
            data-id="${id}"
            class="${className}"
            data-position="${position}"
          >
            <div class="title">
              <div class="title-text">
                <span class="name">${user}</span>
                ${isCurrentUser ? '<span class="me">(me)</span>' : ''}
              </div>
              <!-- // UNUSED: Actions for particular comments.
              <div class="title-actions">
                <a id="comment-answer" title="Answer"><i class="fa-regular fa-comment"></i></a>
                <a id="comment-resolve" title="Mark it as resolved"><i class="fa-solid fa-xmark"></i></a>
              </div>
              -->
            </div>
            <div class="content">
              ${content}
            </div>
          </div>
        `;
    /* console.log('[ThreadCommentsRender:renderHelpers:renderComment]', {
     *   html,
     *   //\\
     *   id, // number; // 2
     *   position, // number; // 1
     *   thread: threadId, // number; // 1
     *   user, // string; // 'Puccio Bernini'
     *   content, // string; // '...'
     *   //\\
     *   comment,
     * });
     */
    return html;
  }

  /**
   * @param {TThreadId} threadId
   */
  renderThreadCommentsContent(threadId) {
    // const { filterByState } = ThreadCommentsData;
    // TODO: Use some filters?
    const comments = this.getVisibleCommentsForThread(threadId);
    const commentsHtml = comments.map(this.renderComment.bind(this)).join('\n');
    /* console.log('[ThreadCommentsRender:renderHelpers:renderThreadCommentsContent]', {
     *   commentsHtml,
     *   comments,
     *   threadId,
     * });
     */
    return commentsHtml;
  }
}

export class ThreadCommentsRender {
  /** @type {RenderHelpers} */
  helpers = new RenderHelpers(); // Expose helpers (TODO: Refactor to make it hidden?)

  /**
   * @param {Error} error
   */
  renderError(error) {
    // TODO: Set css class for id="processes-list-root" --> error, update local state
    // TODO: Set global error status
    const isError = !!error;
    const rootNode = ThreadCommentsNodes.getRootNode();
    rootNode.classList.toggle('has-error', isError);
    const errorNode = ThreadCommentsNodes.getErrorNode();
    const errorText = error ? error.message || String(error) : '';
    // DEBUG: Show error in console
    if (errorText) {
      // eslint-disable-next-line no-console
      console.error('[ThreadCommentsRender:renderError]: got the error', {
        error,
        errorText,
      });
      // eslint-disable-next-line no-debugger
      debugger;
      commonNotify.showError(errorText);
    }
    // Update (or clear) error block content...
    errorNode.innerHTML = errorText;
  }

  /**
   * @param {TThreadId} threadId
   */
  updateThreadComments(threadId) {
    const commentsNodeId = `comments-for-thread-${threadId}`;
    const commentsNode = document.getElementById(commentsNodeId);
    // Else render the comments list...
    const commentsContent = this.helpers.renderThreadCommentsContent(threadId);
    /* console.log('[ThreadCommentsRender:updateThreadComments]', {
     *   commentsContent,
     *   threadId,
     *   commentsNodeId,
     *   commentsNode,
     * });
     */
    commentsNode.innerHTML = commentsContent;
    this.addActionHandlersToNodeChildren(commentsNode);
    commentsNode.classList.toggle('ready', true);
  }

  /**
   * @param {TThreadId} threadId
   */
  ensureThreadCommentsReady(threadId) {
    const commentsNodeId = `comments-for-thread-${threadId}`;
    const commentsNode = document.getElementById(commentsNodeId);
    // Do nothing if the node is ready...
    if (!commentsNode.classList.contains('ready')) {
      this.updateThreadComments(threadId);
    }
  }

  // TODO: This code should be exists only in owner presentation component (`CommentsPage`, etc).
  updateVisibleThreadsStatus() {
    const rootNode = ThreadCommentsNodes.getRootNode();
    const threadsListNode = ThreadCommentsNodes.getThreadsListNode();
    const visibleThreadNodes = threadsListNode.querySelectorAll('.thread:not(.hidden)');
    // eslint-disable-next-line no-unused-vars
    const hasVisibleThreads = !!visibleThreadNodes.length;
    // TODO: Update global status...
    rootNode.classList.toggle('has-visible-threads', hasVisibleThreads);
    this.events.emit('hasVisibleThreads', hasVisibleThreads);
  }

  // TODO: Is it used?
  clearRenderedData() {
    const threadsListNode = ThreadCommentsNodes.getThreadsListNode();
    threadsListNode.innerHTML = '';
    /* // Old approach...
     * threadsListNode.replaceChildren();
     */
    // TODO: Update status?
  }

  /** renderData -- Render all threads (or append data)
   * @param {object} opts
   * @param {boolean} [opts.append] - Append data to the end of the table (default behavior: replace)
   */
  renderData(opts = {}) {
    const { threads } = ThreadCommentsData;
    const threadsListNode = ThreadCommentsNodes.getThreadsListNode();
    const content = threads.map(this.helpers.renderThread.bind(this.helpers)).join('\n');
    /* // DEBUG
     * const rootNode = ThreadCommentsNodes.getRootNode();
     * console.log('[ThreadCommentsRender:renderData]', {
     *   rootNode,
     *   threadsListNode,
     *   content,
     *   threads,
     * });
     */
    if (!opts.append) {
      // Replace data...
      threadsListNode.innerHTML = content; // Insert content just as raw html
      this.addActionHandlersToNodeChildren(threadsListNode);
      // threadsListNode.replaceChildren.apply(threadsListNode, contentNodes); // Old approach
    } else {
      // Append new data (will be used for incremental update)...
      const contentNodes = CommonHelpers.htmlToElements(content);
      Array.from(contentNodes).forEach((node) => {
        this.addActionHandlersToNodeChildren(node);
      });
      threadsListNode.append.apply(threadsListNode, contentNodes);
    }
  }

  /** renderNewThread -- Display new data rows at the end of the table
   * @param {TThread[]} threads
   */
  renderNewThreads(threads) {
    const threadsListNode = ThreadCommentsNodes.getThreadsListNode();
    const content = threads.map(this.helpers.renderThread.bind(this.helpers)).join('\n');
    /* // DEBUG
     * const rootNode = ThreadCommentsNodes.getRootNode();
     * console.log('[ThreadCommentsRender:renderNewThread]', {
     *   rootNode,
     *   threadsListNode,
     *   content,
     *   threads,
     * });
     */
    // Append new data (will be used for incremental update)...
    const contentNodes = CommonHelpers.htmlToElements(content);
    Array.from(contentNodes).forEach((node) => {
      this.addActionHandlersToNodeChildren(node);
    });
    threadsListNode.append.apply(threadsListNode, contentNodes);
  }

  reorderRenderedThreads() {
    const { threads } = ThreadCommentsData;
    const threadsListNode = ThreadCommentsNodes.getThreadsListNode();
    const threadNodes = threadsListNode.children;
    const threadNodesList = Array.from(threadNodes);
    const actualIds = threads.map(({ id }) => id);
    const renderedNodesHash = {};
    const renderedIds = threadNodesList.map((node) => {
      const id = Number(node.getAttribute('data-thread-id'));
      renderedNodesHash[id] = node;
      return id;
    });
    // TODO: Compare `actualIds` and `renderedIds`...
    const isTheSameOrder = CommonHelpers.compareArrays(actualIds, renderedIds);
    /* console.log('[ThreadCommentsRender:reorderRenderedThreads]', {
     *   isTheSameOrder,
     *   threads,
     *   threadsListNode,
     *   threadNodes,
     *   threadNodesList,
     *   actualIds,
     *   renderedIds,
     * });
     */
    if (!isTheSameOrder) {
      const sortedThreadNodesList = actualIds.map((id) => renderedNodesHash[id]);
      // threadsListNode.innerHTML = '';
      threadsListNode.replaceChildren.apply(threadsListNode, sortedThreadNodesList);
    }
  }

  /** clearAllHiddenThreadsComments -- Remove all rendered comments from hidden (non-expanded) threads */
  clearAllHiddenThreadsComments() {
    const threadsListNode = ThreadCommentsNodes.getThreadsListNode();
    const hiddenCommentNodes = threadsListNode.querySelectorAll(
      '.thread:not(.expanded) .comments.ready',
    );
    /* console.log('[ThreadCommentsRender:clearAllHiddenThreadsComments]', {
     *   threadsListNode,
     *   hiddenCommentNodes,
     * });
     */
    hiddenCommentNodes.forEach((el) => {
      el.classList.toggle('ready', false);
      el.innerHTML = '';
    });
  }

  /** Re-render all comments in visible and expanded threads */
  rerenderAllVisibleComments() {
    // Remove all hidden threads comments blocks.
    this.clearAllHiddenThreadsComments();
    // Find all expanded threads...
    const threadsListNode = ThreadCommentsNodes.getThreadsListNode();
    const visibleThreadNodes = threadsListNode.querySelectorAll('.thread:not(.hidden).expanded');
    /* console.log('[ThreadCommentsRender:rerenderAllVisibleComments]', {
     *   visibleThreadNodes,
     * });
     */
    visibleThreadNodes.forEach((commentsNode) => {
      const threadId = Number(commentsNode.getAttribute('data-thread-id'));
      /* console.log('[ThreadCommentsRender:rerenderAllVisibleComments] iteration', {
       *   commentsNode,
       *   threadId,
       * });
       */
      this.updateThreadComments(threadId);
    });
  }

  /**
   * @param {TThreadId} threadId
   */
  updateThreadVisibleState(threadId) {
    const isVisible = ThreadCommentsHelpers.isThreadVisible(threadId);
    const threadNode = document.getElementById(`thread-${threadId}`);
    const isExpanded = threadNode.classList.contains('expanded');
    /* console.log('[ThreadCommentsRender:updateThreadVisibleState]', {
     *   isExpanded,
     *   threadId,
     *   isVisible,
     * });
     */
    threadNode.classList.toggle('hidden', !isVisible);
    if (isVisible && isExpanded) {
      this.ensureThreadCommentsReady(threadId);
    }
  }

  updateVisibleThreads() {
    const { threads } = ThreadCommentsData;
    const threadIds = threads.map(({ id }) => id);
    /* console.log('[ThreadCommentsRender:updateVisibleThreads]', {
     *   threadIds,
     * });
     */
    threadIds.forEach((threadId) => {
      this.updateThreadVisibleState(threadId);
    });
    this.updateVisibleThreadsStatus();
    // TODO: Emit event?
  }

  /**
   * @param {Element} node
   */
  addActionHandlersToNodeChildren(node) {
    const { handlers } = this;
    const { handleTitleActionClick, handleExpandThread } = handlers;
    const mainRowElems = node.querySelectorAll('.main-row');
    mainRowElems.forEach((elem) => {
      elem.addEventListener('click', handleExpandThread);
    });
    const tltleActionElems = node.querySelectorAll('.title-actions a');
    tltleActionElems.forEach((elem) => {
      elem.addEventListener('click', handleTitleActionClick);
    });
  }

  /** @param {TThreadCommentsInitParams} initParams */
  init(initParams) {
    // TODO: Check for `hasInited` before cruical operations?
    const { handlers, events } = initParams;
    // Save handlers and events...
    this.handlers = handlers;
    this.events = events;
  }
}
