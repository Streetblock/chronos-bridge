import { gregorianToJdn, jdnToGregorian } from './gregorian.js';

function assertIsoWeekParts(parts) {
  if (!parts || typeof parts !== 'object') {
    throw new TypeError('dateParts must be an object: { year, week, day }');
  }

  const { year, week, day } = parts;
  if (!Number.isInteger(year) || !Number.isInteger(week) || !Number.isInteger(day)) {
    throw new TypeError('year, week, and day must be integers');
  }

  if (week < 1 || week > 53) {
    throw new RangeError('week must be between 1 and 53');
  }

  if (day < 1 || day > 7) {
    throw new RangeError('day must be between 1 (Monday) and 7 (Sunday)');
  }
}

function isoDayOfWeekFromJdn(jdn) {
  const dow = ((Math.floor(jdn) % 7) + 7) % 7; // Mon=0 .. Sun=6
  return dow + 1; // Mon=1 .. Sun=7
}

function week1MondayJdn(isoYear) {
  const jan4 = gregorianToJdn({ year: isoYear, month: 1, day: 4 });
  const jan4IsoDow = isoDayOfWeekFromJdn(jan4);
  return jan4 - (jan4IsoDow - 1);
}

export function isoWeekToJdn({ year, week, day }) {
  assertIsoWeekParts({ year, week, day });
  return week1MondayJdn(year) + (week - 1) * 7 + (day - 1);
}

export function jdnToIsoWeek(jdn) {
  if (!Number.isFinite(jdn)) {
    throw new TypeError('jdn must be a finite number');
  }

  const normalizedJdn = Math.floor(jdn + 0.5);
  const g = jdnToGregorian(normalizedJdn);
  let isoYear = g.year;

  const week1Current = week1MondayJdn(isoYear);
  const week1Next = week1MondayJdn(isoYear + 1);

  if (normalizedJdn < week1Current) {
    isoYear -= 1;
  } else if (normalizedJdn >= week1Next) {
    isoYear += 1;
  }

  const week1 = week1MondayJdn(isoYear);
  const week = Math.floor((normalizedJdn - week1) / 7) + 1;
  const day = isoDayOfWeekFromJdn(normalizedJdn);

  return { year: isoYear, week, day };
}
