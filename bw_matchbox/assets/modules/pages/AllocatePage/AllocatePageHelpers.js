// @ts-check

/** @param {PointerEvent} event */
export function getGroupNodeAndIdFromActionNode(event) {
  const node = /** @type {HTMLElement} */ (event.currentTarget);
  const groupNode = node.closest('.group');
  // DEBUG
  const groupId = Number(groupNode && groupNode.getAttribute('group-id'));
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
