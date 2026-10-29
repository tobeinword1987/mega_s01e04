// One row per job for a night. `owner` null is kept and shown as —.
export type DigestStatus = 'ok' | 'retry' | 'fail';

export type DigestRow = {
  job: string;
  owner: string | null;
  runs: number;
  retries: number;
  lastStatus: DigestStatus;
  lastError: string | null;
  firstAt: string;
  lastAt: string;
};

// A line that does not parse is counted here, never thrown.
export type NightRead = {
  rows: DigestRow[];
  badLines: number;
};

export { readNight } from './read.js';
