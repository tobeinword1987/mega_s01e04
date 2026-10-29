import { Hono } from 'hono';
import { loadConfig, type RigConfig } from './config.js';
import { loadNight } from './digest/load.js';
import { lane } from './lane.js';
import { readStatus } from './status.js';
import { DigestPage } from './views/digest.js';
import { Layout } from './views/layout.js';
import { StatusBoard } from './views/status.js';

export function createApp(config: RigConfig = loadConfig()) {
  const app = new Hono();

  app.get('/health', (c) => c.json({ ok: true, lane: lane().id }));

  app.get('/', (c) =>
    c.html(
      <Layout title="status" lane={lane()}>
        <StatusBoard status={readStatus(config)} />
      </Layout>,
    ),
  );

  app.get('/digest/:night', (c) => {
    const night = c.req.param('night');
    const read = loadNight(config.runsDir, night);
    if (!read) return c.text('not found', 404);
    return c.html(
      <Layout title={`digest ${night}`} lane={lane()}>
        <DigestPage night={night} read={read} />
      </Layout>,
    );
  });

  app.get('/api/digest/:night', (c) => {
    const read = loadNight(config.runsDir, c.req.param('night'));
    if (!read) return c.json({ error: 'not found' }, 404);
    return c.json(read.rows);
  });

  return app;
}
