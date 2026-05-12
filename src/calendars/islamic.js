import { assertDateParts } from '../core/validation.js';
import { jdnToGregorian } from './gregorian.js';

const ISLAMIC_EPOCH = 1948439.5;

export function islamicToJdn({ year, month, day }) {
  assertDateParts({ year, month, day });
  return day + Math.ceil(29.5 * (month - 1)) + (year - 1) * 354 + Math.floor((3 + 11 * year) / 30) + ISLAMIC_EPOCH - 1;
}

export function jdnToIslamic(jdn) {
  if (!Number.isFinite(jdn)) {
    throw new TypeError('jdn must be a finite number');
  }

  const n = Math.floor(jdn) + 0.5;
  const year = Math.floor((30 * (n - ISLAMIC_EPOCH) + 10646) / 10631);
  const firstDayOfYear = islamicToJdn({ year, month: 1, day: 1 });
  const month = Math.min(12, Math.ceil((n - 29 - firstDayOfYear) / 29.5) + 1);
  const firstDayOfMonth = islamicToJdn({ year, month, day: 1 });
  const day = Math.floor(n - firstDayOfMonth + 1);

  return { year, month, day };
}

export function islamicToGregorian(parts) {
  return jdnToGregorian(islamicToJdn(parts));
}
