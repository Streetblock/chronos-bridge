import { assertDateParts } from '../core/validation.js';
import { jdnToGregorian } from './gregorian.js';

const mod = (n, divisor) => n - divisor * Math.floor(n / divisor);

export function isHebrewLeapYear(year) {
  return mod(year * 7 + 1, 19) < 7;
}

// Fixed rabbinic calendar: molad calculation and weekday postponement.
function elapsedDays(year) {
  const months = Math.floor((235 * year - 234) / 19);
  const parts = 12084 + 13753 * months;
  let days = months * 29 + Math.floor(parts / 25920);
  if (mod(3 * (days + 1), 7) < 3) days++;
  return days;
}

function yearStart(year) {
  const current = elapsedDays(year);
  // Additional postponements prevent impossible 356- and 382-day years.
  const delay = elapsedDays(year + 1) - current === 356 ? 2
    : current - elapsedDays(year - 1) === 382 ? 1 : 0;
  // Integer civil-day JDN, consistent with the Gregorian bridge.
  return 347998 + current + delay;
}

function monthLength(year, month) {
  if ([2, 4, 6, 10, 13].includes(month)) return 29;
  if (month === 12 && !isHebrewLeapYear(year)) return 29;
  const length = yearStart(year + 1) - yearStart(year);
  if (month === 8 && length % 10 !== 5) return 29;
  if (month === 9 && length % 10 === 3) return 29;
  return 30;
}

export function hebrewToJdn({ year, month, day }) {
  assertDateParts({ year, month, day }, isHebrewLeapYear(year) ? 13 : 12);
  if (day > monthLength(year, month)) throw new RangeError('Invalid day for Hebrew month');
  let jdn = yearStart(year) + day - 1;
  if (month < 7) {
    for (let m = 7; m <= (isHebrewLeapYear(year) ? 13 : 12); m++) jdn += monthLength(year, m);
    for (let m = 1; m < month; m++) jdn += monthLength(year, m);
  } else {
    for (let m = 7; m < month; m++) jdn += monthLength(year, m);
  }
  return jdn;
}

export function jdnToHebrew(jdn) {
  if (!Number.isFinite(jdn)) throw new TypeError('jdn must be a finite number');
  const normalized = Math.floor(jdn + 0.5);
  let year = jdnToGregorian(normalized).year + 3760;
  while (yearStart(year + 1) <= normalized) year++;
  while (yearStart(year) > normalized) year--;
  let day = normalized - yearStart(year) + 1;
  const months = [];
  for (let m = 7; m <= (isHebrewLeapYear(year) ? 13 : 12); m++) months.push(m);
  for (let m = 1; m <= 6; m++) months.push(m);
  for (const month of months) {
    const length = monthLength(year, month);
    if (day <= length) return { year, month, day };
    day -= length;
  }
  throw new Error('Could not resolve Hebrew date for JDN');
}

export function hebrewToGregorian(parts) {
  return jdnToGregorian(hebrewToJdn(parts));
}
