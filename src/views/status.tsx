import type { NightCounts } from '../digest/counts.js';
import type { Status } from '../status.js';

export function StatusBoard({
  status,
  digests,
}: {
  status: Status;
  digests: { night: string; counts: NightCounts | null }[];
}) {
  return (
    <>
      <h1>status</h1>
      <table>
        <tbody>
          <tr><th>adapter</th><td>{status.adapter}</td></tr>
          <tr><th>installed</th><td>{status.installed}</td></tr>
          <tr>
            <th>last beat</th>
            <td>{status.lastBeat ? `${status.lastBeat.at} · pid ${status.lastBeat.pid}` : <span class="warn">none</span>}</td>
          </tr>
        </tbody>
      </table>
      <h2>nights on disk</h2>
      {digests.length === 0 ? (
        <p class="mute">nothing in runs/</p>
      ) : (
        <ul>
          {digests.map((digest) => (
            <li>
              <a href={`/digest/${digest.night}`}>{digest.night}</a>
              {digest.counts ? (
                <span>
                  {' '}
                  {digest.counts.ok} ok · {digest.counts.retry} retry · {digest.counts.fail} fail
                </span>
              ) : (
                <span> —</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
