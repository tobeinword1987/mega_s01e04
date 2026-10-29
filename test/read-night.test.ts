import { describe, expect, it } from 'vitest';
import { readNight } from '../src/digest/types.js';

describe('readNight', () => {
  it('reads 2026-10-28 into 5 jobs and counts the bad line', () => {
    const night = readNight('runs', '2026-10-28');
    expect(night.badLines).toBe(1);
    expect(night.rows.map((row) => row.job)).toEqual([
      'digest/render',
      'fixtures/refresh',
      'lane/sync',
      'notes/backup',
      'rig/rotate-logs',
    ]);

    expect(night.rows[0]).toMatchObject({
      job: 'digest/render',
      owner: null,
      runs: 1,
      retries: 0,
      lastStatus: 'ok',
      lastError: null,
      firstAt: '2026-10-29T05:41:09+01:00',
      lastAt: '2026-10-29T05:41:09+01:00',
    });
    expect(night.rows[1]).toMatchObject({
      job: 'fixtures/refresh',
      runs: 4,
      retries: 3,
      lastStatus: 'ok',
      lastError: null,
    });
    expect(night.rows[2]).toMatchObject({
      job: 'lane/sync',
      owner: 'rook',
      runs: 8,
      retries: 1,
      lastStatus: 'ok',
      lastError: null,
      firstAt: '2026-10-28T23:00:06+01:00',
      lastAt: '2026-10-29T05:00:04+01:00',
    });
    expect(night.rows[3]).toMatchObject({
      job: 'notes/backup',
      owner: 'lane-07',
      runs: 1,
      retries: 0,
      lastStatus: 'fail',
      lastError: 'quota exceeded',
    });
    expect(night.rows[4]).toMatchObject({
      job: 'rig/rotate-logs',
      owner: 'lane-07',
      runs: 1,
      retries: 0,
      lastStatus: 'ok',
    });
  });
});
