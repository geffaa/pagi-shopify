import { test } from 'node:test';
import assert from 'node:assert/strict';
import { availability, configFromShop, earliest, localNow, slotState, slotTimes, windowSlots } from '../slots.js';
import catalog from '../../scripts/catalog.json' with { type: 'json' };

const cfg = configFromShop(catalog.shop);

test('slots run every 15 minutes from opening to kitchen close', () => {
  const times = slotTimes(cfg);
  assert.equal(times[0], '08:00');
  assert.equal(times.at(-1), '15:30');
  assert.equal(times.length, 31);
  assert.equal(windowSlots('2026-10-27T07:00', cfg).length, 31 * 3);
});

test('shop time is Bali time, whatever the server clock says', () => {
  assert.equal(localNow('Asia/Makassar', new Date('2026-10-27T01:05:00Z')), '2026-10-27T09:05');
  assert.equal(localNow('Asia/Makassar', new Date('2026-10-27T16:30:00Z')), '2026-10-28T00:30');
});

test('the earliest slot is now plus the lead time, across midnight too', () => {
  assert.equal(earliest('2026-10-27T09:05', cfg), '2026-10-27T09:25');
  assert.equal(earliest('2026-10-27T23:50', cfg), '2026-10-28T00:10');
});

test('passed, paused and full slots are closed; others show what is left', () => {
  const days = availability({
    now: '2026-10-27T09:05',
    used: { '2026-10-27T09:30': 12, '2026-10-27T10:00': 5 },
    paused: ['2026-10-27T11:00'],
    cfg,
  });
  const today = Object.fromEntries(days[0].slots.map((s) => [s.time, s]));
  assert.equal(today['09:15'].reason, 'passed');
  assert.equal(today['09:30'].reason, 'full');
  assert.equal(today['09:45'].open, true);
  assert.equal(today['10:00'].left, 7);
  assert.equal(today['11:00'].reason, 'paused');
  assert.equal(days.length, 3);
  assert.ok(days[2].slots.every((s) => s.open && s.left === 12));
});

test('the published state lists closed slots and usage of open ones only', () => {
  const state = slotState({ now: '2026-10-27T15:20', used: { '2026-10-27T15:00': 3, '2026-10-28T08:00': 4, '2026-10-20T08:00': 9 }, cfg });
  assert.deepEqual(state.used, { '2026-10-28T08:00': 4 });
  assert.equal(state.closed.length, 31); // all of today has passed
  assert.ok(state.closed.every((s) => s.startsWith('2026-10-27')));
});
