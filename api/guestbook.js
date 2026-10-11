// Vercel Function: sổ lưu bút lưu trên Turso (libSQL) qua HTTP API, không cần thư viện.
// Biến môi trường (Vercel → Settings → Environment Variables):
//   TURSO_DATABASE_URL  libsql://<db>-<org>.turso.io
//   TURSO_AUTH_TOKEN    token tạo bằng `turso db tokens create <db>`
import { createHash } from 'node:crypto';

const MAX_NAME = 60;
const MAX_MSG = 500;
const LIST_LIMIT = 200;
const RATE_WINDOW_S = 60; // mỗi IP tối đa RATE_MAX lời chúc trong RATE_WINDOW_S giây
const RATE_MAX = 3;

const dbUrl = () => (process.env.TURSO_DATABASE_URL || '').replace(/^libsql:\/\//, 'https://');

const arg = (v) => (typeof v === 'number' ? { type: 'integer', value: String(v) } : { type: 'text', value: String(v) });

async function run(statements) {
  const r = await fetch(`${dbUrl()}/v2/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.TURSO_AUTH_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        ...statements.map(([sql, args = []]) => ({ type: 'execute', stmt: { sql, args: args.map(arg) } })),
        { type: 'close' },
      ],
    }),
  });
  if (!r.ok) throw new Error(`Turso HTTP ${r.status}`);
  const { results } = await r.json();
  return results.slice(0, statements.length).map((x) => {
    if (x.type !== 'ok') throw new Error(x.error?.message || 'Turso error');
    const { cols, rows } = x.response.result;
    return rows.map((row) => Object.fromEntries(row.map((c, i) => [cols[i].name, c.value])));
  });
}

let ready = false;
async function ensureTable() {
  if (ready) return;
  await run([
    [`CREATE TABLE IF NOT EXISTS wishes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      msg TEXT NOT NULL,
      ip TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    )`],
    ['CREATE INDEX IF NOT EXISTS wishes_ip_time ON wishes (ip, created_at)'],
  ]);
  ready = true;
}

const clean = (s, max) => String(s ?? '').replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '').trim().slice(0, max);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    return res.status(503).json({ error: 'Sổ lưu bút chưa được cấu hình' });
  }
  try {
    await ensureTable();

    if (req.method === 'GET') {
      const [rows] = await run([[`SELECT name, msg, created_at AS at FROM wishes ORDER BY id DESC LIMIT ${LIST_LIMIT}`]]);
      return res.status(200).json({ wishes: rows });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      if (body.website) return res.status(200).json({ ok: true }); // ô ẩn chống bot: giả vờ thành công
      const name = clean(body.name, MAX_NAME);
      const msg = clean(body.msg, MAX_MSG);
      if (!name || !msg) return res.status(400).json({ error: 'Vui lòng nhập tên và lời chúc' });

      const ipRaw = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
      const ip = createHash('sha256').update(ipRaw).digest('hex').slice(0, 32);
      const [[{ n }]] = await run([[
        `SELECT COUNT(*) AS n FROM wishes WHERE ip = ? AND created_at > strftime('%Y-%m-%dT%H:%M:%fZ','now','-${RATE_WINDOW_S} seconds')`,
        [ip],
      ]]);
      if (Number(n) >= RATE_MAX) return res.status(429).json({ error: 'Bạn gửi hơi nhanh, vui lòng thử lại sau ít phút' });

      const [[wish]] = await run([[
        'INSERT INTO wishes (name, msg, ip) VALUES (?, ?, ?) RETURNING name, msg, created_at AS at',
        [name, msg, ip],
      ]]);
      return res.status(201).json({ wish });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Không lưu được lời chúc, vui lòng thử lại' });
  }
}
