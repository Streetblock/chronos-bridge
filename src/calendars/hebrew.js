import { assertDateParts } from '../core/validation.js';
import { jdnToGregorian } from './gregorian.js';

const HEBREW_EPOCH = 347995.5;

export function isHebrewLeapYear(year) {
  return ((year * 7 + 1) % 19) < 7;
}

export function hebrewToJdn({ year, month, day }) {
  assertDateParts({ year, month, day });

  const months = Math.floor((235 * year - 234) / 19);
  const parts = 12084 + 13753 * months;
  let days = months * 29 + Math.floor(parts / 25920);
  const dayOfWeek = days % 7;

  if (dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6) days++;
  if (dayOfWeek === 0 && isHebrewLeapYear(year) && months > 6) days++;
  if (dayOfWeek === 1 && !isHebrewLeapYear(year - 1) && months > 5) days++;

  let jd = HEBREW_EPOCH + days;
  const isLeap = isHebrewLeapYear(year);

  const getYearLength = (y) => hebrewToJdn({ year: y + 1, month: 7, day: 1 }) - hebrewToJdn({ year: y, month: 7, day: 1 });

  const getMonthDays = (y, m) => {
    if (m === 2 || m === 4 || m === 6 || m === 10 || m === 13) return 29;
    if (m === 12 && !isHebrewLeapYear(y)) return 29;
    if (m === 8 || m === 9) {
      const yearLen = getYearLength(y);
      const longHeshvan = yearLen % 10 === 5;
      const shortKislev = yearLen % 10 === 3;
      if (m === 8 && !longHeshvan) return 29;
      if (m === 9 && shortKislev) return 29;
    }
    return 30;
  };

  if (month < 7) {
    for (let m = 7; m <= (isLeap ? 13 : 12); m++) jd += getMonthDays(year, m);
    for (let m = 1; m < month; m++) jd += getMonthDays(year, m);
  } else {
    for (let m = 7; m < month; m++) jd += getMonthDays(year, m);
  }

  return jd + day;
}

export function jdnToHebrew(jdn) {
  if (!Number.isFinite(jdn)) {
    throw new TypeError('jdn must be a finite number');
  }

  const normalizedJdn = Math.floor(jdn + 0.5);
  const approxYear = jdnToGregorian(normalizedJdn).year + 3760;
  let year = approxYear;

  while (Math.floor(hebrewToJdn({ year: year + 1, month: 7, day: 1 }) + 0.5) <= normalizedJdn) {
    year++;
  }
  while (Math.floor(hebrewToJdn({ year, month: 7, day: 1 }) + 0.5) > normalizedJdn) {
    year--;
  }

  const isLeap = isHebrewLeapYear(year);
  const getYearLength = (y) => hebrewToJdn({ year: y + 1, month: 7, day: 1 }) - hebrewToJdn({ year: y, month: 7, day: 1 });
  const getMonthDays = (y, m) => {
    if (m === 2 || m === 4 || m === 6 || m === 10 || m === 13) return 29;
    if (m === 12 && !isHebrewLeapYear(y)) return 29;
    if (m === 8 || m === 9) {
      const yearLen = getYearLength(y);
      const longHeshvan = yearLen % 10 === 5;
      const shortKislev = yearLen % 10 === 3;
      if (m === 8 && !longHeshvan) return 29;
      if (m === 9 && shortKislev) return 29;
    }
    return 30;
  };

  const monthsInOrder = [];
  for (let m = 7; m <= (isLeap ? 13 : 12); m++) monthsInOrder.push(m);
  for (let m = 1; m <= 6; m++) monthsInOrder.push(m);

  const yearStartJdn = Math.floor(hebrewToJdn({ year, month: 7, day: 1 }) + 0.5);
  let dayOfYear = normalizedJdn - yearStartJdn + 1;
  for (const month of monthsInOrder) {
    const monthLength = getMonthDays(year, month);
    if (dayOfYear <= monthLength) {
      return { year, month, day: dayOfYear };
    }
    dayOfYear -= monthLength;
  }

  throw new Error('Could not resolve Hebrew date for JDN');
}

export function hebrewToGregorian(parts) {
  return jdnToGregorian(hebrewToJdn(parts));
}
