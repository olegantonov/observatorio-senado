import type { Database, Statement } from 'better-sqlite3'

interface D1Result<T = Record<string, unknown>> {
  results: T[]
  success: boolean
  meta: { duration: number; changes: number; last_row_id: number; rows_read: number; rows_written: number }
}

class SqlitePrepared {
  constructor(
    private readonly db: Database,
    private readonly sql: string,
    private readonly params: readonly unknown[] = [],
  ) {}

  bind(...params: unknown[]): SqlitePrepared {
    return new SqlitePrepared(this.db, this.sql, params)
  }

  private statement(): Statement {
    return this.db.prepare(this.sql)
  }

  async first<T = Record<string, unknown>>(column?: string): Promise<T | null> {
    const stmt = this.statement()
    const row = stmt.get(...this.params) as Record<string, unknown> | undefined
    if (!row) return null
    if (column) return (row[column] ?? null) as T
    return row as T
  }

  async all<T = Record<string, unknown>>(): Promise<D1Result<T>> {
    const stmt = this.statement()
    const start = performance.now()
    const isSelect = /^\s*(select|with|pragma)\b/i.test(this.sql)
    if (isSelect) {
      const rows = stmt.all(...this.params) as T[]
      return {
        results: rows,
        success: true,
        meta: {
          duration: performance.now() - start,
          changes: 0,
          last_row_id: 0,
          rows_read: rows.length,
          rows_written: 0,
        },
      }
    }
    const info = stmt.run(...this.params)
    return {
      results: [],
      success: true,
      meta: {
        duration: performance.now() - start,
        changes: info.changes,
        last_row_id: Number(info.lastInsertRowid),
        rows_read: 0,
        rows_written: info.changes,
      },
    }
  }

  async run(): Promise<D1Result> {
    const stmt = this.statement()
    const start = performance.now()
    const info = stmt.run(...this.params)
    return {
      results: [],
      success: true,
      meta: {
        duration: performance.now() - start,
        changes: info.changes,
        last_row_id: Number(info.lastInsertRowid),
        rows_read: 0,
        rows_written: info.changes,
      },
    }
  }

  async raw(): Promise<unknown[][]> {
    const stmt = this.statement().raw(true)
    return stmt.all(...this.params) as unknown[][]
  }
}

export class SqliteD1 {
  constructor(private readonly db: Database) {}

  prepare(sql: string): SqlitePrepared {
    return new SqlitePrepared(this.db, sql)
  }

  async batch<T = Record<string, unknown>>(stmts: SqlitePrepared[]): Promise<D1Result<T>[]> {
    return Promise.all(stmts.map((s) => s.all<T>()))
  }

  async exec(sql: string): Promise<{ count: number; duration: number }> {
    const start = performance.now()
    this.db.exec(sql)
    return { count: 1, duration: performance.now() - start }
  }
}
