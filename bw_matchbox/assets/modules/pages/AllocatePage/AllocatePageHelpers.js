// @ts-check

/** @param {PointerEvent} event */
export function getGroupNodeAndIdFromActionNode(event) {
  const node = /** @type {HTMLElement} */ (event.currentTarget);
  const groupNode = node.closest('.group');
  const groupId = /** @type TLocalGroupId */ (
    Number(groupNode && groupNode.getAttribute('data-group-id'))
  );
  if (isNaN(groupId)) {
    const error = new Error('Not found group node (or group id) to remove!');
    // eslint-disable-next-line no-console
    console.error('[AllocatePageHelpers:getGroupNodeAndIdFromActionNode]', error, {
      groupNode,
      groupId,
      node,
      event,
    });
    // eslint-disable-next-line no-debugger
    debugger;
    throw error;
  }
  return { node, groupNode, groupId };
}

/**
 * @param {HTMLElement} parentNode
 * @param {TSharedHandlers} callbacks;
 */
export function addActionHandlers(parentNode, callbacks) {
  const actionNodes = parentNode.querySelectorAll('[action-id]');
  actionNodes.forEach((actionNode) => {
    const actionId = actionNode.getAttribute('action-id');
    const action = actionId && callbacks[actionId];
    if (!action) {
      const error = new Error(`Not found action for id "${actionId}"`);
      // eslint-disable-next-line no-console
      console.warn('[AllocatePageRender:addActionHandlers]', error, {
        actionNode,
        parentNode,
      });
      return;
    }
    // Just for case: remove previous listener
    actionNode.removeEventListener('click', action);
    // Add listener...
    actionNode.addEventListener('click', action);
  });
}

/**
 * @param {object} params
 * @param {TAllocationId} params.productionId
 * @param {TLocalGroupId} params.groupId
 * @return {string}
 */
export function getAllocateModeFractionInputId({ productionId, groupId }) {
  return `production-${productionId}-group-${groupId}-fraction`;
}
