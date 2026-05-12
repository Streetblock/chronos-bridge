import test from 'node:test';
import assert from 'node:assert/strict';

import {
  gregorianToJdn,
  jdnToGregorian,
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

test('Islamic <-> JDN roundtrip is stable', () => {
  const input = { year: 1448, month: 9, day: 1 };
  const jdn = islamicToJdn(input);
  const output = jdnToIslamic(jdn);
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
  assert.ok(supportedCalendars.includes('hebrew'));
  assert.ok(supportedCalendars.includes('islamic'));
  assert.ok(supportedCalendars.includes('persian'));
  assert.equal(typeof toJdn('gregorian', { year: 2026, month: 5, day: 12 }), 'number');
});

test('convert supports Gregorian <-> Persian via JDN hub', () => {
  const gregorianInput = { year: 2026, month: 5, day: 12 };
  const persian = convert('gregorian', 'persian', gregorianInput);
  const gregorianRoundtrip = convert('persian', 'gregorian', persian);
  assert.deepEqual(gregorianRoundtrip, gregorianInput);
});
