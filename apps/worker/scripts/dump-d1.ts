/**
 * Dump D1 senado-db -> SQLite local via API REST.
 * Usa CLOUDFLARE_API_KEY/EMAIL/ACCOUNT_ID do ambiente.
 */
import 'dotenv/config'
import Database from 'better-sqlite3'
import { readFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const ACC = process.env.CLOUDFLARE_ACCOUNT_ID!
const EMAIL = process.env.CLOUDFLARE_EMAIL!
const KEY = process.env.CLOUDFLARE_API_KEY!
const D1_ID = process.env.D1_DATABASE_ID || '6e4aa3f6-ecda-4caf-95a7-b120817c5a6b'
const DEST = process.env.SENADO_DB_PATH!
const SCHEMA_PATH = resolve(__dirname, '../src/db/schema.sql')

if (!ACC || !EMAIL || !KEY || !DEST) {
  throw new Error('missing env: CLOUDFLARE_*, SENADO_DB_PATH')
}

async function d1Query(sql: string): Promise<Record<string, unknown>[]> {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACC}/d1/database/${D1_ID}/query`,
    {
      method: 'POST',
      headers: {
        'X-Auth-Email': EMAIL,
        'X-Auth-Key': KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql }),
    },
  )
  const json = (await res.json()) as { success: boolean; result: { results: Record<string, unknown>[] }[]; errors?: unknown }
  if (!json.success) throw new Error(`d1 query failed: ${JSON.stringify(json.errors)}`)
  return json.result[0].results
}

async function main() {
  mkdirSync(dirname(DEST), { recursive: true })
  const db = new Database(DEST)
  db.pragma('journal_mode = WAL')

  console.log('[dump] applying schema.sql...')
  const schema = readFileSync(SCHEMA_PATH, 'utf8')
  db.exec(schema)

  // Migrations applied via /admin/migrate in production — re-aplicamos aqui idempotentemente
  const migrations = [
    `ALTER TABLE ranking_snapshots ADD COLUMN votacoes_comissao_presentes INTEGER DEFAULT 0`,
    `ALTER TABLE ranking_snapshots ADD COLUMN votacoes_comissao_total INTEGER DEFAULT 0`,
    `ALTER TABLE ranking_snapshots ADD COLUMN ceap_divulgacao REAL DEFAULT 0`,
    `ALTER TABLE ranking_snapshots ADD COLUMN ceap_escritorio REAL DEFAULT 0`,
    `ALTER TABLE ranking_snapshots ADD COLUMN ceap_locomocao REAL DEFAULT 0`,
    `ALTER TABLE ranking_snapshots ADD COLUMN ceap_consultoria REAL DEFAULT 0`,
    `ALTER TABLE ranking_snapshots ADD COLUMN ceap_outros REAL DEFAULT 0`,
    `ALTER TABLE ranking_snapshots ADD COLUMN pct_divulgacao REAL DEFAULT 0`,
    `ALTER TABLE ranking_snapshots ADD COLUMN escritorios_count INTEGER DEFAULT 0`,
    `CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'pending',
      token TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      confirmed_at TEXT,
      unsubscribed_at TEXT,
      ip TEXT,
      user_agent TEXT
    )`,
    `CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscribers(status)`,
    `CREATE INDEX IF NOT EXISTS idx_newsletter_token  ON newsletter_subscribers(token)`,
  ]
  for (const sql of migrations) {
    try {
      db.exec(sql)
    } catch (err) {
      const msg = String(err)
      if (!msg.includes('duplicate column name') && !msg.includes('already exists')) {
        throw err
      }
    }
  }

  const tables = ['ranking_snapshots', 'senadores_cache', 'ceap_cache', 'newsletter_subscribers']

  for (const table of tables) {
    console.log(`[dump] fetching ${table}...`)
    const rows = await d1Query(`SELECT * FROM ${table}`)
    console.log(`[dump] ${table}: ${rows.length} rows`)
    if (rows.length === 0) continue

    const cols = Object.keys(rows[0])
    const placeholders = cols.map(() => '?').join(',')
    const sql = `INSERT OR REPLACE INTO ${table} (${cols.join(',')}) VALUES (${placeholders})`
    const stmt = db.prepare(sql)
    const insertMany = db.transaction((items: Record<string, unknown>[]) => {
      for (const row of items) {
        stmt.run(cols.map((c) => row[c] ?? null))
      }
    })
    insertMany(rows)
    console.log(`[dump] ${table}: inserted`)
  }

  // Sanity check
  for (const table of tables) {
    const r = db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get() as { c: number }
    console.log(`[verify] ${table}: ${r.c}`)
  }

  db.close()
  console.log(`[dump] OK -> ${DEST}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
