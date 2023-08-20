// @ts-check

/** processMultipleRequestErrors
 * @param {Response[]} resList
 * @return {Error[]}
 */
export function processMultipleRequestErrors(resList) {
  return /** @type {Error[]} */ (
    resList
      .map((res) => {
        if (!res.ok) {
          return new Error(`Can't load url '${res.url}': ${res.statusText}, ${res.status}`);
        }
      })
      .filter(Boolean)
  );
}

/** Export callbacks from simple object...
 * @param {TSharedHandlers} targetCallbacks
 * @param {object} sourceObject
 * @param {object} [targetObject]
 */
export function exportCallbacksFromObject(targetCallbacks, sourceObject, targetObject) {
  if (!targetObject) {
    targetObject = sourceObject;
  }
  // Add all methods as bound handlers...
  const keys = Object.getOwnPropertyNames(sourceObject);
  keys.forEach((key) => {
    const cb = sourceObject[key];
    if (
      cb &&
      typeof cb === 'function' &&
      !key.startsWith('_') &&
      key !== 'start' &&
      key !== 'init' &&
      key !== 'constructor'
    ) {
      if (targetCallbacks[key]) {
        const error = new Error('Doubled handler: ' + key);
        // eslint-disable-next-line no-console
        console.error('[CommentsPageStates:start] init handlers error', error);
        // eslint-disable-next-line no-debugger
        debugger;
        throw error;
      }
      targetCallbacks[key] = cb.bind(targetObject);
    }
  });
}

/** Export callbacks from instance and all the prototypes...
 * @param {TSharedHandlers} targetCallbacks
 * @param {object} sourceObject
 */
export function exportCallbacksFromInstance(targetCallbacks, sourceObject) {
  const targetObject = sourceObject;
  // Add all methods as bound handlers...
  do {
    const constructorName = sourceObject.constructor.name;
    if (constructorName !== 'Object' && constructorName !== 'Function') {
      exportCallbacksFromObject(targetCallbacks, sourceObject, targetObject);
    }
  } while ((sourceObject = Object.getPrototypeOf(sourceObject)));
}
