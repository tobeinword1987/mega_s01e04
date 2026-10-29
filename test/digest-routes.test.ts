import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import type { DigestRow } from '../src/digest/types.js';

function appWith(runsDir: string) {
  return createApp({
    adapter: 'shim',
    installed: '2026-10-29T14:06:00+01:00',
    beatEverySeconds: 60,
    runsDir,
  });
}

function tempRuns(): string {
  return mkdtempSync(join(tmpdir(), 'rig-digest-'));
}

describe('digest routes', () => {
  it('returns 200 and the same jobs, in the same order, on the page and the JSON', async () => {
    const dir = tempRuns();
    writeFileSync(
      join(dir, '2026-10-28.jsonl'),
      [
        '{"at":"2026-10-28T02:00:00+01:00","job":"zeta/job","status":"ok","owner":"rook"}',
        '{"at":"2026-10-28T01:00:00+01:00","job":"alpha/job","status":"ok","owner":"lane-07"}',
        '',
      ].join('\n'),
    );
    const app = appWith(dir);
    const page = await app.request('/digest/2026-10-28');
    const html = await page.text();
    expect(page.status).toBe(200);
    expect(html.indexOf('alpha/job')).toBeGreaterThan(-1);
    expect(html.indexOf('alpha/job')).toBeLessThan(html.indexOf('zeta/job'));

    const api = await app.request('/api/digest/2026-10-28');
    expect(api.status).toBe(200);
    const rows = (await api.json()) as DigestRow[];
    expect(rows.map((row) => row.job)).toEqual(['alpha/job', 'zeta/job']);
  });

  it('returns 404 for a night with no file', async () => {
    const app = appWith(tempRuns());
    expect((await app.request('/digest/2026-10-28')).status).toBe(404);
    expect((await app.request('/api/digest/2026-10-28')).status).toBe(404);
  });

  it('renders nothing ran for an empty night', async () => {
    const dir = tempRuns();
    writeFileSync(join(dir, '2026-10-28.jsonl'), '');
    const app = appWith(dir);
    const page = await app.request('/digest/2026-10-28');
    expect(page.status).toBe(200);
    expect(await page.text()).toContain('nothing ran');
    expect(await (await app.request('/api/digest/2026-10-28')).json()).toEqual([]);
  });

  it('renders a night that contains a bad line', async () => {
    const dir = tempRuns();
    writeFileSync(
      join(dir, '2026-10-28.jsonl'),
      '{"at":"2026-10-28T01:00:00+01:00","job":"lane/sync","status":"ok","owner":"rook"}\n{bad\n',
    );
    const app = appWith(dir);
    const page = await app.request('/digest/2026-10-28');
    expect(page.status).toBe(200);
    expect(await page.text()).toContain('lane/sync');
    const rows = (await (await app.request('/api/digest/2026-10-28')).json()) as DigestRow[];
    expect(rows.map((row) => row.job)).toEqual(['lane/sync']);
  });
});
