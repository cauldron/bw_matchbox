// @ts-check

/** @typedef {Object} TDeferred
 * @property {Promise} promise
 * @property {(value:any|PromiseLike)=>void} resolve
 * @property {(error?:unknown)=>void} reject
 */

/** @type {(p:any)=>any} */
const NOOP = () => undefined;

/** Deferred -- Create deferred object.
 * @return {TDeferred}
 */
export function Deferred() {
  let resolve = NOOP;
  let reject = NOOP;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  const defer = {
    promise,
    resolve,
    reject,
  };
  return defer;
}

/** asyncPromiseState -- Determine (in async mode!) promise status
 * @param {Promise<unknown>} promise
 * @return {Promise<string>}
 */
export function asyncPromiseState(promise) {
  const temp = {};
  return Promise.race([promise, temp]).then(
    (value) => (value === temp ? 'PENDING' : 'FULFILLED'),
    () => 'REJECTED',
  );
}

/** delayedPromise -- Make timeout promise
 * @param {number} delay
 * @param {any} result
 * @return {Promise}
 */
export function delayedPromise(delay, result) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay, result);
  });
}
