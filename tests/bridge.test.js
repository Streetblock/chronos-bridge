import test from 'node:test';
import assert from 'node:assert/strict';

import {
  gregorianToJdn,
  jdnToGregorian,
  frenchRepublicanToJdn,
  jdnToFrenchRepublican,
  isoWeekToJdn,
  jdnToIsoWeek,
  julianToJdn,
  jdnToJulian,
  sakaToJdn,
  jdnToSaka,
  hebrewToJdn,
  jdnToHebrew,
  islamicToJdn,
  jdnToIslamic,
  persianToJdn,
  jdnToPersian,
  convert,
  toJdn,
  supportedCalendars
} from '../src/index.js';

test('Gregorian <-> JDN roundtrip is stable', () => {
  const input = { year: 2026, month: 5, day: 12 };
  const jdn = gregorianToJdn(input);
  const output = jdnToGregorian(jdn);
  assert.deepEqual(output, input);
});

test('Julian <-> JDN roundtrip is stable', () => {
  const input = { year: 2026, month: 5, day: 2 };
  const jdn = julianToJdn(input);
  const output = jdnToJulian(jdn);
  assert.deepEqual(output, input);
});

test('French Republican <-> JDN roundtrip is stable', () => {
  const input = { year: 12, month: 13, day: 5 };
  const jdn = frenchRepublicanToJdn(input);
  const output = jdnToFrenchRepublican(jdn);
  assert.deepEqual(output, input);
});

test('ISO Week <-> JDN roundtrip is stable', () => {
  const input = { year: 2026, week: 20, day: 2 };
  const jdn = isoWeekToJdn(input);
  const output = jdnToIsoWeek(jdn);
  assert.deepEqual(output, input);
});

test('Saka <-> JDN roundtrip is stable', () => {
  const input = { year: 1948, month: 2, day: 1 };
  const jdn = sakaToJdn(input);
  const output = jdnToSaka(jdn);
  assert.deepEqual(output, input);
});

test('Islamic <-> JDN roundtrip is stable', () => {
  const input = { year: 1448, month: 9, day: 1 };
  const jdn = islamicToJdn(input);
  const output = jdnToIslamic(jdn);
  assert.deepEqual(output, input);
});

test('Hebrew <-> JDN roundtrip is stable', () => {
  const input = { year: 5786, month: 1, day: 15 };
  const jdn = hebrewToJdn(input);
  const output = jdnToHebrew(jdn);
  assert.deepEqual(output, input);
});

test('Persian <-> JDN roundtrip is stable', () => {
  const input = { year: 1405, month: 1, day: 1 };
  const jdn = persianToJdn(input);
  const output = jdnToPersian(jdn);
  assert.deepEqual(output, input);
});

test('convert uses JDN hub (Gregorian -> Islamic)', () => {
  const g = { year: 2026, month: 5, day: 12 };
  const direct = jdnToIslamic(gregorianToJdn(g));
  const viaBridge = convert('gregorian', 'islamic', g);
  assert.deepEqual(viaBridge, direct);
});

test('toJdn supports declared calendars', () => {
  assert.ok(supportedCalendars.includes('gregorian'));
  assert.ok(supportedCalendars.includes('french-republican'));
  assert.ok(supportedCalendars.includes('iso-week'));
  assert.ok(supportedCalendars.includes('julian'));
  assert.ok(supportedCalendars.includes('saka'));
  assert.ok(supportedCalendars.includes('hebrew'));
  assert.ok(supportedCalendars.includes('islamic'));
  assert.ok(supportedCalendars.includes('persian'));
  assert.equal(typeof toJdn('gregorian', { year: 2026, month: 5, day: 12 }), 'number');
});

test('convert supports Gregorian <-> Julian via JDN hub', () => {
  const gregorianInput = { year: 2026, month: 5, day: 12 };
  const julian = convert('gregorian', 'julian', gregorianInput);
  const gregorianRoundtrip = convert('julian', 'gregorian', julian);
  assert.deepEqual(gregorianRoundtrip, gregorianInput);
});

test('convert supports Gregorian <-> French Republican via JDN hub', () => {
  const gregorianInput = { year: 2026, month: 5, day: 12 };
  const fr = convert('gregorian', 'french-republican', gregorianInput);
  const gregorianRoundtrip = convert('french-republican', 'gregorian', fr);
  assert.deepEqual(gregorianRoundtrip, gregorianInput);
});

test('convert supports Gregorian <-> ISO Week via JDN hub', () => {
  const gregorianInput = { year: 2026, month: 5, day: 12 };
  const isoWeek = convert('gregorian', 'iso-week', gregorianInput);
  const gregorianRoundtrip = convert('iso-week', 'gregorian', isoWeek);
  assert.deepEqual(gregorianRoundtrip, gregorianInput);
});

test('convert supports Gregorian <-> Saka via JDN hub', () => {
  const gregorianInput = { year: 2026, month: 5, day: 12 };
  const saka = convert('gregorian', 'saka', gregorianInput);
  const gregorianRoundtrip = convert('saka', 'gregorian', saka);
  assert.deepEqual(gregorianRoundtrip, gregorianInput);
});

test('Saka new year starts on March 22 in non-leap Gregorian years', () => {
  const before = convert('gregorian', 'saka', { year: 2025, month: 3, day: 21 });
  const start = convert('gregorian', 'saka', { year: 2025, month: 3, day: 22 });

  assert.deepEqual(before, { year: 1946, month: 12, day: 30 });
  assert.deepEqual(start, { year: 1947, month: 1, day: 1 });
});

test('Saka new year starts on March 21 in leap Gregorian years', () => {
  const before = convert('gregorian', 'saka', { year: 2024, month: 3, day: 20 });
  const start = convert('gregorian', 'saka', { year: 2024, month: 3, day: 21 });

  assert.deepEqual(before, { year: 1945, month: 12, day: 30 });
  assert.deepEqual(start, { year: 1946, month: 1, day: 1 });
});

test('French Republican epoch maps to 1792-09-22', () => {
  const frEpoch = convert('gregorian', 'french-republican', { year: 1792, month: 9, day: 22 });
  assert.deepEqual(frEpoch, { year: 1, month: 1, day: 1 });

  const gregorianEpoch = convert('french-republican', 'gregorian', { year: 1, month: 1, day: 1 });
  assert.deepEqual(gregorianEpoch, { year: 1792, month: 9, day: 22 });
});

test('convert supports Gregorian <-> Persian via JDN hub', () => {
  const gregorianInput = { year: 2026, month: 5, day: 12 };
  const persian = convert('gregorian', 'persian', gregorianInput);
  const gregorianRoundtrip = convert('persian', 'gregorian', persian);
  assert.deepEqual(gregorianRoundtrip, gregorianInput);
});

test('convert supports Gregorian <-> Hebrew via JDN hub', () => {
  const gregorianInput = { year: 2026, month: 5, day: 12 };
  const hebrew = convert('gregorian', 'hebrew', gregorianInput);
  const gregorianRoundtrip = convert('hebrew', 'gregorian', hebrew);
  assert.deepEqual(gregorianRoundtrip, gregorianInput);
});
