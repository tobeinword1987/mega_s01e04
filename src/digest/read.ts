import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { DigestRow, DigestStatus, NightRead } from './types.js';

type RawLine = {
  at?: unknown;
  job?: unknown;
  status?: unknown;
  owner?: unknown;
  error?: unknown;
};

function isStatus(status: unknown): status is DigestStatus {
  return status === 'ok' || status === 'retry' || status === 'fail';
}

function rowFrom(raw: RawLine): DigestRow | null {
  if (typeof raw.job !== 'string' || typeof raw.at !== 'string' || !isStatus(raw.status)) return null;
  if (raw.owner !== null && typeof raw.owner !== 'string') return null;
  return {
    job: raw.job,
    owner: raw.owner,
    runs: 1,
    retries: raw.status === 'retry' ? 1 : 0,
    lastStatus: raw.status,
    lastError: typeof raw.error === 'string' ? raw.error : null,
    firstAt: raw.at,
    lastAt: raw.at,
  };
}

// Read runs/<night>.jsonl. A missing file throws. A bad line is counted.
export function readNight(runsDir: string, night: string): NightRead {
  const text = readFileSync(join(runsDir, `${night}.jsonl`), 'utf8');
  const byJob = new Map<string, DigestRow>();
  let badLines = 0;

  for (const line of text.split('\n')) {
    if (line.trim() === '') continue;
    let value: unknown;
    try {
      value = JSON.parse(line);
    } catch {
      badLines += 1;
      continue;
    }
    if (!value || typeof value !== 'object') {
      badLines += 1;
      continue;
    }
    const next = rowFrom(value as RawLine);
    if (!next) {
      badLines += 1;
      continue;
    }
    const prev = byJob.get(next.job);
    if (!prev) {
      byJob.set(next.job, next);
      continue;
    }
    prev.runs += 1;
    prev.retries += next.retries;
    prev.lastStatus = next.lastStatus;
    prev.lastError = next.lastError;
    prev.owner = next.owner;
    prev.lastAt = next.lastAt;
  }

  const rows = [...byJob.values()].sort((a, b) => a.job.localeCompare(b.job));
  return { rows, badLines };
}
