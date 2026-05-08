import { createHash } from 'node:crypto'
import { readFile, writeFile, unlink, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'

type PutOptions = { expirationTtl?: number; expiration?: number }

interface CacheEntry {
  value: unknown
  expiresAt: number | null
}

export class FsKV {
  constructor(private readonly baseDir: string) {}

  private path(key: string): string {
    const hash = createHash('sha1').update(key).digest('hex')
    return join(this.baseDir, hash.slice(0, 2), hash + '.json')
  }

  async get<T = unknown>(key: string, type?: 'json' | 'text'): Promise<T | string | null> {
    const file = this.path(key)
    let raw: string
    try {
      raw = await readFile(file, 'utf8')
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null
      throw err
    }
    let entry: CacheEntry
    try {
      entry = JSON.parse(raw) as CacheEntry
    } catch {
      return null
    }
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      void unlink(file).catch(() => {})
      return null
    }
    if (type === 'text') return typeof entry.value === 'string' ? entry.value : JSON.stringify(entry.value)
    return entry.value as T
  }

  async put(key: string, value: string | ArrayBuffer | ReadableStream, opts: PutOptions = {}): Promise<void> {
    let parsed: unknown
    if (typeof value === 'string') {
      try {
        parsed = JSON.parse(value)
      } catch {
        parsed = value
      }
    } else {
      throw new Error('FsKV.put: only string values supported')
    }
    const expiresAt = opts.expirationTtl
      ? Date.now() + opts.expirationTtl * 1000
      : opts.expiration
        ? opts.expiration * 1000
        : null
    const entry: CacheEntry = { value: parsed, expiresAt }
    const file = this.path(key)
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, JSON.stringify(entry))
  }

  async delete(key: string): Promise<void> {
    const file = this.path(key)
    try {
      await unlink(file)
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err
    }
  }

  async list(): Promise<{ keys: { name: string }[] }> {
    return { keys: [] }
  }
}
