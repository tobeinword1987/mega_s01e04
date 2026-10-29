import { loadNight } from './load.js';

export type NightCounts = { ok: number; retry: number; fail: number };

// Counts jobs by their last status, which is what the digest table shows.
export function countsForNight(runsDir: string, night: string): NightCounts | null {
  const read = loadNight(runsDir, night);
  if (!read) return null;
  const counts: NightCounts = { ok: 0, retry: 0, fail: 0 };
  for (const row of read.rows) counts[row.lastStatus] += 1;
  return counts;
}
