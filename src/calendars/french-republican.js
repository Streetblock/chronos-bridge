import { gregorianToJdn } from './gregorian.js';

const EPOCH_JDN = gregorianToJdn({ year: 1792, month: 9, day: 22 }); // 1 Vendemiaire, Year I

function assertFrenchRepublicanParts(parts) {
  if (!parts || typeof parts !== 'object') {
    throw new TypeError('dateParts must be an object: { year, month, day }');
  }

  const { year, month, day } = parts;
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    throw new TypeError('year, month, and day must be integers');
  }

  if (year < 1) {
    throw new RangeError('year must be >= 1');
  }

  if (month < 1 || month > 13) {
    throw new RangeError('month must be between 1 and 13');
  }
}

function isFrenchRepublicanLeapYear(year) {
  // Deterministic extension: leap years are 3, 7, 11, ... (year % 4 === 3).
  return year % 4 === 3;
}

function daysBeforeFrenchRepublicanYear(year) {
  const y = year - 1;
  return 365 * y + Math.floor((y + 1) / 4);
}

export function frenchRepublicanToJdn({ year, month, day }) {
  assertFrenchRepublicanParts({ year, month, day });

  if (month <= 12) {
    if (day < 1 || day > 30) {
      throw new RangeError('day must be between 1 and 30 for months 1..12');
    }
  } else {
    const maxDay = isFrenchRepublicanLeapYear(year) ? 6 : 5;
    if (day < 1 || day > maxDay) {
      throw new RangeError(`day must be between 1 and ${maxDay} for month 13`);
    }
  }

  const dayOfYear = month <= 12 ? (month - 1) * 30 + (day - 1) : 360 + (day - 1);
  return EPOCH_JDN + daysBeforeFrenchRepublicanYear(year) + dayOfYear;
}

export function jdnToFrenchRepublican(jdn) {
  if (!Number.isFinite(jdn)) {
    throw new TypeError('jdn must be a finite number');
  }

  const normalizedJdn = Math.floor(jdn + 0.5);
  let daysSinceEpoch = normalizedJdn - EPOCH_JDN;

  if (daysSinceEpoch < 0) {
    throw new RangeError('Dates before 1792-09-22 are not supported in this model');
  }

  const cycleDays = 1461; // 4-year cycle with one leap year
  const cycle = Math.floor(daysSinceEpoch / cycleDays);
  let year = cycle * 4 + 1;
  let remaining = daysSinceEpoch % cycleDays;

  const yearLengths = [365, 365, 366, 365];
  for (const len of yearLengths) {
    if (remaining < len) break;
    remaining -= len;
    year++;
  }

  if (remaining < 360) {
    return {
      year,
      month: Math.floor(remaining / 30) + 1,
      day: (remaining % 30) + 1
    };
  }

  return {
    year,
    month: 13,
    day: remaining - 360 + 1
  };
}

export { isFrenchRepublicanLeapYear };
