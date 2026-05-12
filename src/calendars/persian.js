import { assertDateParts } from '../core/validation.js';
import { gregorianToJdn, jdnToGregorian } from './gregorian.js';

export function gregorianToPersian({ year, month, day }) {
  assertDateParts({ year, month, day });

  const gDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const jDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

  let gy = year - 1600;
  const gm = month - 1;
  const gd = day - 1;

  let gDayNo = 365 * gy + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) + Math.floor((gy + 399) / 400);
  for (let i = 0; i < gm; i++) gDayNo += gDaysInMonth[i];

  if (gm > 1 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {
    gDayNo++;
  }

  gDayNo += gd;

  let jDayNo = gDayNo - 79;
  const jNp = Math.floor(jDayNo / 12053);
  jDayNo %= 12053;

  let jy = 979 + 33 * jNp + 4 * Math.floor(jDayNo / 1461);
  jDayNo %= 1461;

  if (jDayNo >= 366) {
    jy += Math.floor((jDayNo - 1) / 365);
    jDayNo = (jDayNo - 1) % 365;
  }

  let jm = 0;
  for (; jm < 11 && jDayNo >= jDaysInMonth[jm]; jm++) {
    jDayNo -= jDaysInMonth[jm];
  }

  return {
    year: jy,
    month: jm + 1,
    day: jDayNo + 1
  };
}

export function persianToGregorian({ year, month, day }) {
  assertDateParts({ year, month, day });

  let jy = year - 979;
  let jm = month - 1;
  let jd = day - 1;

  let jDayNo = 365 * jy + Math.floor(jy / 33) * 8 + Math.floor((jy % 33 + 3) / 4);
  for (let i = 0; i < jm; i++) jDayNo += i < 6 ? 31 : 30;

  const jNp = jDayNo + jd;
  let gDayNo = jNp + 79;

  let gy = 1600 + 400 * Math.floor(gDayNo / 146097);
  gDayNo = gDayNo % 146097;

  let leap = true;
  if (gDayNo >= 36525) {
    gDayNo--;
    gy += 100 * Math.floor(gDayNo / 36524);
    gDayNo = gDayNo % 36524;

    if (gDayNo >= 365) {
      gDayNo++;
    } else {
      leap = false;
    }
  }

  gy += 4 * Math.floor(gDayNo / 1461);
  gDayNo %= 1461;

  if (gDayNo >= 366) {
    leap = false;
    gDayNo--;
    gy += Math.floor(gDayNo / 365);
    gDayNo = gDayNo % 365;
  }

  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let monthIndex = 0;

  for (; monthIndex < 12; monthIndex++) {
    if (gDayNo < days[monthIndex]) break;
    gDayNo -= days[monthIndex];
  }

  return {
    year: gy,
    month: monthIndex + 1,
    day: gDayNo + 1
  };
}

export function persianToJdn(parts) {
  const g = persianToGregorian(parts);
  return gregorianToJdn(g);
}

export function jdnToPersian(jdn) {
  const g = jdnToGregorian(jdn);
  return gregorianToPersian(g);
}

export function fromJdnAsGregorianDate(jdn) {
  const g = jdnToGregorian(jdn);
  return new Date(Date.UTC(g.year, g.month - 1, g.day));
}
