import test from 'node:test';
import assert from 'node:assert/strict';
import { convert, toJdn, fromJdn } from '../index.js';

test('Hebrew civil dates match Hebcal reference dates, including Adar II', () => {
  // https://www.hebcal.com/holidays/2026 ; Purim 2024: 14 Adar II.
  for (const [hebrew, gregorian] of [
    [[5786, 1, 15], [2026, 4, 2]],
    [[5787, 7, 1], [2026, 9, 12]],
    [[5787, 7, 10], [2026, 9, 21]],
    [[5784, 13, 14], [2024, 3, 24]],
    [[5785, 6, 28], [2025, 9, 21]],
  ]) {
    const parts = ([year, month, day]) => ({ year, month, day });
    assert.deepEqual(convert('hebrew', 'gregorian', parts(hebrew)), parts(gregorian));
    assert.deepEqual(convert('gregorian', 'hebrew', parts(gregorian)), parts(hebrew));
  }
});

test('Every Hebrew year in the reference interval has a valid length', () => {
  for (let year = 5660; year <= 5860; year++) {
    const length = toJdn('hebrew', {year: year + 1, month: 7, day: 1}) - toJdn('hebrew', {year, month: 7, day: 1});
    assert.ok([353, 354, 355, 383, 384, 385].includes(length), `${year}: ${length}`);
  }
});

test('Islamic civil conversion shares the integer JDN convention', () => {
  const date = {year: 2026, month: 5, day: 12};
  assert.deepEqual(convert('gregorian', 'islamic', date), {year: 1447, month: 11, day: 25});
  assert.deepEqual(convert('islamic', 'gregorian', convert('gregorian', 'islamic', date)), date);
  assert.equal(toJdn('islamic', {year: 1447, month: 11, day: 25}), toJdn('gregorian', date));
});

test('Invalid calendar dates are rejected, including common-year Adar II and ISO week 53', () => {
  for (const [calendar, parts] of [
    ['gregorian', {year: 2026, month: 2, day: 31}],
    ['julian', {year: 2025, month: 2, day: 29}],
    ['hebrew', {year: 5786, month: 13, day: 1}],
    ['hebrew', {year: 5786, month: 2, day: 30}],
    ['islamic', {year: 1448, month: 2, day: 30}],
    ['persian', {year: 1405, month: 7, day: 31}],
    ['iso-week', {year: 2021, week: 53, day: 1}],
  ]) assert.throws(() => toJdn(calendar, parts), RangeError, calendar);
  assert.doesNotThrow(() => toJdn('gregorian', {year: 2024, month: 2, day: 29}));
  assert.doesNotThrow(() => toJdn('julian', {year: 1900, month: 2, day: 29}));
  assert.doesNotThrow(() => toJdn('iso-week', {year: 2020, week: 53, day: 1}));
});

test('Persian arithmetic conversion handles dates before its 1600 calculation base', () => {
  for (const date of [{year: 1500, month: 1, day: 1}, {year: 1600, month: 3, day: 19}]) {
    const persian = convert('gregorian', 'persian', date);
    assert.ok(persian.day >= 1 && persian.day <= 31);
    assert.deepEqual(convert('persian', 'gregorian', persian), date);
  }
  const date = {year: 900, month: 1, day: 1};
  assert.deepEqual(convert('gregorian', 'persian', convert('persian', 'gregorian', date)), date);
});

test('Calendars agree with independent ICU references and roundtrip daily, 1900–2100', () => {
  const hebrewMonths = {Nisan:1,Iyar:2,Sivan:3,Tamuz:4,Av:5,Elul:6,Tishri:7,Heshvan:8,Kislev:9,Tevet:10,Shevat:11,Adar:12,'Adar I':12,'Adar II':13};
  for (const [calendar, reference] of [['hebrew','hebrew'], ['islamic','islamic-civil'], ['persian','persian']]) {
    const fmt = new Intl.DateTimeFormat(`en-US-u-ca-${reference}-nu-latn`, {year:'numeric',month:'numeric',day:'numeric',timeZone:'UTC'});
    assert.equal(fmt.resolvedOptions().calendar, reference);
    for (let stamp = Date.UTC(1900,0,1); stamp < Date.UTC(2101,0,1); stamp += 86400000) {
      const date = new Date(stamp);
      const g = {year:date.getUTCFullYear(),month:date.getUTCMonth()+1,day:date.getUTCDate()};
      const p = Object.fromEntries(fmt.formatToParts(date).map(x => [x.type,x.value]));
      const expected = {year:+p.year,month:calendar === 'hebrew' ? hebrewMonths[p.month] : +p.month,day:+p.day};
      const actual = convert('gregorian', calendar, g);
      assert.deepEqual(actual, expected, `${calendar} ${date.toISOString()}`);
      assert.deepEqual(convert(calendar, 'gregorian', actual), g);
      assert.equal(fromJdn(calendar, toJdn(calendar, actual)).day, actual.day);
    }
  }
});
