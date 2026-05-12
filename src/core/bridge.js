import { normalizeCalendarId } from './validation.js';
import { gregorianToJdn, jdnToGregorian } from '../calendars/gregorian.js';
import { hebrewToJdn, jdnToHebrew } from '../calendars/hebrew.js';
import { islamicToJdn, jdnToIslamic } from '../calendars/islamic.js';
import { persianToJdn, jdnToPersian } from '../calendars/persian.js';

const toJdnStrategies = {
  gregorian: gregorianToJdn,
  hebrew: hebrewToJdn,
  islamic: islamicToJdn,
  persian: persianToJdn
};

const fromJdnStrategies = {
  gregorian: jdnToGregorian,
  hebrew: jdnToHebrew,
  islamic: jdnToIslamic,
  persian: jdnToPersian
};

export function toJdn(calendar, dateParts) {
  const id = normalizeCalendarId(calendar);
  const fn = toJdnStrategies[id];

  if (!fn) {
    throw new Error(`Unsupported calendar for toJdn: ${calendar}`);
  }

  return fn(dateParts);
}

export function fromJdn(calendar, jdn) {
  const id = normalizeCalendarId(calendar);
  const fn = fromJdnStrategies[id];

  if (!fn) {
    throw new Error(`Unsupported calendar for fromJdn: ${calendar}`);
  }

  return fn(jdn);
}

export function convert(fromCalendar, toCalendar, dateParts) {
  const jdn = toJdn(fromCalendar, dateParts);
  return fromJdn(toCalendar, jdn);
}

export const supportedCalendars = Object.freeze(Object.keys(toJdnStrategies));
