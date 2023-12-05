// @ts-check

/** Api base
 * eg: 'http://localhost:5000/scores/get/{id}'
 */
export const scoresApiUrlPrefix = '/scores/get/';

/** Use exponential numbers format? Specify the number of fractional digits.
 * @type {number | undefined}
 */
export const fractionDigits = 2;

// Sort...

/** @type {TSortMode[]} */
export const sortFieldsAsString = ['category', 'unit'];

// NOTE: Below options will be updated from the corresponding dom nodes (see
// thew `initSortNodesFromDom` method in the `ScoresListInit` module).

/** @type {TSortMode} */
export const defaultSortMode = 'category';
/** @type {TSortReversed} */
export const defaultSortReversed = false;
