import 'dotenv/config'
import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import type { Env } from '../../types'
import { FsKV } from './kv-fs'
import { SqliteD1 } from './d1-sqlite'

function required(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`missing env: ${name}`)
  return v
}

const dbPath = required('SENADO_DB_PATH')
const cachePath = required('SENADO_CACHE_PATH')

mkdirSync(dirname(dbPath), { recursive: true })
mkdirSync(cachePath, { recursive: true })

const sqlite = new Database(dbPath)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('synchronous = NORMAL')
sqlite.pragma('busy_timeout = 5000')

export const env: Env = {
  SENADO_DB: new SqliteD1(sqlite) as unknown as Env['SENADO_DB'],
  SENADO_CACHE: new FsKV(cachePath) as unknown as Env['SENADO_CACHE'],
  ADM_BASE_URL: process.env.ADM_BASE_URL || 'https://adm.senado.gov.br/adm-dadosabertos',
  LEGIS_BASE_URL: process.env.LEGIS_BASE_URL || 'https://legis.senado.leg.br/dadosabertos',
  CACHE_TTL: process.env.CACHE_TTL || '21600',
  ENVIRONMENT: process.env.ENVIRONMENT || 'production',
  ADMIN_SECRET: required('ADMIN_SECRET'),
  RESEND_API_KEY: process.env.RESEND_API_KEY,
}

export const sqliteHandle = sqlite
