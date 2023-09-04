// @ts-check

import * as CommonPromises from '../../common/CommonPromises.js';
import * as CommonHelpers from '../../common/CommonHelpers.js';
// import { useDebug } from '../../common/CommonConstants.js';

// Import only types...
/* eslint-disable no-unused-vars */
import { AllocatePageNodes } from './AllocatePageNodes.js';
import { AllocatePageState } from './AllocatePageState.js';
// import { AllocatePageRender } from './AllocatePageRender.js';
/* eslint-enable no-unused-vars */

/** @typedef TEditorResult
 * @property {string} status
 * @property {TLocalGroupId} groupId
 * @property {string} name
 */

/**
 * @class AllocatePageGroupEditor
 */
export class AllocatePageGroupEditor {
  // Modules...
  /** @type AllocatePageNodes */
  nodes;
  /** @type AllocatePageState */
  state;

  /** @type TSharedHandlers */
  callbacks;

  /** @type CommonPromises.TDeferred */
  _editorDefer;

  /** @type TLocalGroupId */
  groupId;

  /** @constructor
   * @param {object} params
   * @param {AllocatePageNodes} params.nodes
   * @param {AllocatePageState} params.state
   * @param {TSharedHandlers} params.callbacks
   */
  constructor(params) {
    const { nodes, state, callbacks } = params;
    // Modules...
    this.nodes = nodes;
    this.state = state;
    this.callbacks = callbacks;
    // Bind events...
    this._boundOnKeyPress = this.onKeyPress.bind(this);
    this._boundHandleCancelEdit = this.handleCancelEdit.bind(this);
    this._boundHandleFinishEdit = this.handleFinishEdit.bind(this);
    this._boundOnInnerClick = this.onInnerClick.bind(this);
  }

  /**
   * @return {HTMLElement}
   */
  getGroupNode() {
    const { groupId } = this;
    const { nodes } = this;
    return nodes.getGroupNode(groupId);
  }

  /**
   * @return {HTMLElement}
   */
  getGroupHeaderNode() {
    const groupNode = this.getGroupNode();
    return groupNode.querySelector('.group-header');
  }

  /**
   * @return {HTMLElement}
   */
  getGroupTitleNode() {
    const groupHeaderNode = this.getGroupHeaderNode();
    return groupHeaderNode.querySelector('.title');
  }

  /**
   * @return {HTMLElement}
   */
  getGroupTitleEditorNode() {
    const groupHeaderNode = this.getGroupHeaderNode();
    return groupHeaderNode.querySelector('.title-editor');
  }

  /**
   * @return {HTMLInputElement}
   */
  getGroupTitleInputNode() {
    const groupHeaderNode = this.getGroupHeaderNode();
    return groupHeaderNode.querySelector('#title-editor-input');
  }

  getGroupData() {
    const { state, groupId } = this;
    const { groups } = state;
    const groupIdx = groups.findIndex(({ localId }) => localId === groupId);
    const groupData = groups[groupIdx];
    return groupData;
  }

  createEditorNodeContent() {
    const content = `
      <div class="title-editor">
        <input
          type="text"
          name="title-editor-input"
          id="title-editor-input"
          value=""
        />
        <div class="title-actions">
          <a edit-action-id="finish" title="Finish edit" class="theme-success"><i class="fa fa-check"></i></a>
          <a edit-action-id="cancel" title="Cancel edit" class="theme-error"><i class="fa fa-xmark"></i></a>
        </div>
      </div>
    `;
    return content;
  }

  addEditorNode() {
    const groupHeaderNode = this.getGroupHeaderNode();
    const groupTitleNode = this.getGroupTitleNode();
    const editorNodeContent = this.createEditorNodeContent();
    const editorNode = CommonHelpers.htmlToElement(editorNodeContent);
    groupHeaderNode.insertBefore(editorNode, groupTitleNode);
    return editorNode;
  }

  getEditorNode() {
    const groupHeaderNode = this.getGroupHeaderNode();
    return groupHeaderNode.querySelector('.title-editor');
  }

  ensureEditorNode() {
    let editorNode = this.getEditorNode();
    if (!editorNode) {
      editorNode = this.addEditorNode();
    }
    // Update data...
    const inputNode = this.getGroupTitleInputNode();
    const groupData = this.getGroupData();
    const { name } = groupData;
    inputNode.value = CommonHelpers.quoteHtmlAttr(name);
    return editorNode;
  }

  focusEditorNode() {
    const inputNode = this.getGroupTitleInputNode();
    if (inputNode) {
      inputNode.focus();
      // inputNode.select();
    }
  }

  getEditorDefer() {
    if (!this._editorDefer) {
      // Create editor defer...
      this._editorDefer = CommonPromises.Deferred();
    }
    return this._editorDefer;
  }

  /**
   * @return {Promise<TEditorResult>}
   */
  getEditorPromise() {
    const editorDefer = this.getEditorDefer();
    return editorDefer.promise;
  }

  prepareHeaderNode() {
    const groupNode = this.getGroupNode();
    const groupHeaderNode = this.getGroupHeaderNode();
    groupHeaderNode.classList.toggle('edit-group', true);
    groupNode.classList.toggle('edit-group', true);
    this.focusEditorNode();
  }

  releaseHeaderNode() {
    const groupNode = this.getGroupNode();
    const editorNode = this.getEditorNode();
    const groupHeaderNode = this.getGroupHeaderNode();
    groupHeaderNode.classList.toggle('edit-group', false);
    groupNode.classList.toggle('edit-group', false);
    if (editorNode) {
      editorNode.remove();
    }
  }

  finishEditor() {
    const { groupId } = this;
    const inputNode = this.getGroupTitleInputNode();
    const { value } = inputNode;
    const groupData = this.getGroupData();
    groupData.name = value;
    const defer = this.getEditorDefer();
    /** @type TEditorResult */
    const result = {
      status: 'ok',
      name: value,
      groupId,
    };
    defer.resolve(result);
  }

  // Event handlers...

  /**
   * @param {KeyboardEvent} event
   */
  onKeyPress(event) {
    const { key } = event;
    if (key === 'Escape') {
      this.stopEdit('escKeyPressed');
    }
    if (key === 'Enter') {
      this.stopEdit(true);
    }
  }

  /**
   * @param {PointerEvent} event
   */
  handleCancelEdit(event) {
    event.preventDefault();
    event.stopPropagation();
    this.stopEdit('outerClick');
  }

  /**
   * @param {PointerEvent} event
   */
  handleFinishEdit(event) {
    event.preventDefault();
    event.stopPropagation();
    this.stopEdit(true);
  }

  /**
   * @param {PointerEvent} event
   */
  onInnerClick(event) {
    // Prevent editor finish on click
    event.preventDefault();
    event.stopPropagation();
  }

  /** @param {string} [status] */
  cancelEditor(status = 'cancel') {
    const defer = this.getEditorDefer();
    defer.reject(status);
  }

  addEventHandlers() {
    document.addEventListener('keydown', this._boundOnKeyPress);
    document.body.addEventListener('click', this._boundHandleCancelEdit);
    const editorNode = this.getGroupTitleEditorNode();
    if (editorNode) {
      editorNode.addEventListener('click', this._boundOnInnerClick);
      const finish = editorNode.querySelector('a[edit-action-id=finish]');
      const cancel = editorNode.querySelector('a[edit-action-id=cancel]');
      finish && finish.addEventListener('mousedown', this._boundHandleFinishEdit);
      cancel && cancel.addEventListener('mousedown', this._boundHandleCancelEdit);
    }
    const inputNode = this.getGroupTitleInputNode();
    if (inputNode) {
      inputNode.addEventListener('blur', this._boundHandleCancelEdit);
    }
  }

  removeEventHandlers() {
    document.removeEventListener('keydown', this._boundOnKeyPress);
    document.body.removeEventListener('click', this._boundHandleCancelEdit);
    const editorNode = this.getGroupTitleEditorNode();
    if (editorNode) {
      editorNode.removeEventListener('click', this._boundOnInnerClick);
      const finish = editorNode.querySelector('a[edit-action-id=finish]');
      const cancel = editorNode.querySelector('a[edit-action-id=cancel]');
      finish && finish.removeEventListener('mousedown', this._boundHandleFinishEdit);
      cancel && cancel.removeEventListener('mousedown', this._boundHandleCancelEdit);
    }
    const inputNode = this.getGroupTitleInputNode();
    if (inputNode) {
      inputNode.removeEventListener('blur', this._boundHandleCancelEdit);
    }
  }

  /**
   * @param {TLocalGroupId} groupId
   * @return {Promise<TEditorResult>}
   */
  startEdit(groupId) {
    this._editorDefer = undefined;
    this.groupId = groupId;
    this.prepareHeaderNode();
    this.addEventHandlers();
    return this.getEditorPromise();
  }

  /** @param {boolean|string} [status] */
  stopEdit(status) {
    if (status === true) {
      this.finishEditor();
    } else {
      this.cancelEditor(status || 'stopped');
    }
    this.removeEventHandlers();
    this.releaseHeaderNode();
  }
}
