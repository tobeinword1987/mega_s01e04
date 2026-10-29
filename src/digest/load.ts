import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { readNight } from './read.js';
import type { NightRead } from './types.js';

const NIGHT = /^\d{4}-\d{2}-\d{2}$/;

// null means there is no file for this night. A bad line never lands here.
export function loadNight(runsDir: string, night: string): NightRead | null {
  if (!NIGHT.test(night)) return null;
  if (!existsSync(join(runsDir, `${night}.jsonl`))) return null;
  return readNight(runsDir, night);
}
