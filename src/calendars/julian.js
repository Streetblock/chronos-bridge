import { assertDateParts } from '../core/validation.js';

export function julianToJdn({ year, month, day }) {
  assertDateParts({ year, month, day });

  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
}

export function jdnToJulian(jdn) {
  if (!Number.isFinite(jdn)) {
    throw new TypeError('jdn must be a finite number');
  }

  const c = Math.floor(jdn + 32082);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);

  return {
    day: e - Math.floor((153 * m + 2) / 5) + 1,
    month: m + 3 - 12 * Math.floor(m / 10),
    year: d - 4800 + Math.floor(m / 10)
  };
}
