// @ts-check

import { fractionDigits } from './ScoresListConstants.js';

export function formatNumberToString(number) {
  return fractionDigits ? Number.parseFloat(number).toExponential(fractionDigits) : String(number);
}
