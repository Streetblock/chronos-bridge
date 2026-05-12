import { assertDateParts } from '../core/validation.js';

export function gregorianToJdn({ year, month, day }) {
  assertDateParts({ year, month, day });

  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

export function jdnToGregorian(jdn) {
  if (!Number.isFinite(jdn)) {
    throw new TypeError('jdn must be a finite number');
  }

  const J = Math.floor(jdn + 0.5);
  const j = J + 32044;
  const g = Math.floor(j / 146097);
  const dg = j % 146097;
  const c = Math.floor((Math.floor(dg / 36524) + 1) * 3 / 4);
  const dc = dg - c * 36524;
  const b = Math.floor(dc / 1461);
  const db = dc % 1461;
  const a = Math.floor((Math.floor(db / 365) + 1) * 3 / 4);
  const da = db - a * 365;
  const y = g * 400 + c * 100 + b * 4 + a;
  const m = Math.floor((da * 5 + 308) / 153) - 2;
  const d = da - Math.floor((m + 4) * 153 / 5) + 122;

  return {
    year: y - 4800 + Math.floor((m + 2) / 12),
    month: ((m + 2) % 12) + 1,
    day: d + 1
  };
}
