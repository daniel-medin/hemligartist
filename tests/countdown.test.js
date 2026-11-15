import test from 'node:test';
import assert from 'node:assert/strict';
import { getCountdown, REVEAL_AT } from '../countdown.js';

test('release is 15:00 Stockholm time, regardless of visitor timezone', () => {
  assert.equal(new Date(REVEAL_AT).toISOString(), '2026-11-21T14:00:00.000Z');
  const swedish = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit', hour12: false });
  assert.equal(swedish.format(REVEAL_AT), '15:00');
});

test('stays locked until the very last millisecond', () => {
  assert.deepEqual(getCountdown(REVEAL_AT - 1), { unlocked: false, days: 0, hours: 0, minutes: 0, seconds: 1 });
});

test('unlocks exactly at the boundary and remains open afterwards', () => {
  for (const now of [REVEAL_AT, REVEAL_AT + 1, REVEAL_AT + 86400000]) {
    assert.deepEqual(getCountdown(now), { unlocked: true, days: 0, hours: 0, minutes: 0, seconds: 0 });
  }
});

test('shows the correct day, hour, minute and second values', () => {
  const delta = ((2 * 86400) + (3 * 3600) + (4 * 60) + 5) * 1000;
  assert.deepEqual(getCountdown(REVEAL_AT - delta), { unlocked: false, days: 2, hours: 3, minutes: 4, seconds: 5 });
});
