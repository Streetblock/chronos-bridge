import { assertDateParts } from '../core/validation.js';
import { gregorianToJdn, jdnToGregorian } from './gregorian.js';

const SAKA_MONTH_LENGTHS_COMMON = [30, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30];
const SAKA_MONTH_LENGTHS_LEAP = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30];

function isGregorianLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function sakaYearStartGregorianDate(sakaYear) {
  const gYear = sakaYear + 78;
  const leap = isGregorianLeapYear(gYear);
  return { year: gYear, month: 3, day: leap ? 21 : 22 };
}

function getSakaMonthLengths(sakaYear) {
  const gYear = sakaYear + 78;
  return isGregorianLeapYear(gYear) ? SAKA_MONTH_LENGTHS_LEAP : SAKA_MONTH_LENGTHS_COMMON;
}

export function sakaToJdn({ year, month, day }) {
  assertDateParts({ year, month, day });

  if (month < 1 || month > 12) {
    throw new RangeError('month must be between 1 and 12');
  }

  const monthLengths = getSakaMonthLengths(year);
  const monthLength = monthLengths[month - 1];
  if (day > monthLength) {
    throw new RangeError(`day must be between 1 and ${monthLength} for Saka month ${month}`);
  }

  const start = sakaYearStartGregorianDate(year);
  let jdn = gregorianToJdn(start);

  for (let m = 1; m < month; m++) {
    jdn += monthLengths[m - 1];
  }

  return jdn + (day - 1);
}

export function jdnToSaka(jdn) {
  if (!Number.isFinite(jdn)) {
    throw new TypeError('jdn must be a finite number');
  }

  const normalizedJdn = Math.floor(jdn + 0.5);
  const g = jdnToGregorian(normalizedJdn);
  let sakaYear = g.year - 78;

  let start = sakaYearStartGregorianDate(sakaYear);
  let startJdn = gregorianToJdn(start);

  if (normalizedJdn < startJdn) {
    sakaYear -= 1;
    start = sakaYearStartGregorianDate(sakaYear);
    startJdn = gregorianToJdn(start);
  } else {
    const nextStartJdn = gregorianToJdn(sakaYearStartGregorianDate(sakaYear + 1));
    if (normalizedJdn >= nextStartJdn) {
      sakaYear += 1;
      start = sakaYearStartGregorianDate(sakaYear);
      startJdn = gregorianToJdn(start);
    }
  }

  let dayOfYear = normalizedJdn - startJdn + 1;
  const monthLengths = getSakaMonthLengths(sakaYear);

  for (let month = 1; month <= 12; month++) {
    const len = monthLengths[month - 1];
    if (dayOfYear <= len) {
      return { year: sakaYear, month, day: dayOfYear };
    }
    dayOfYear -= len;
  }

  throw new Error('Could not resolve Saka date for JDN');
}
