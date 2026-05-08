'use client'

import { useEffect, useState } from 'react'
import { getAutorias } from '@/lib/api'
import type { AutoriaItem, ListResultBase } from '@/lib/types'
import Pagination from './Pagination'

const PORPAGINA = 25

export default function AbaAutorias({ codigo }: { codigo: string }) {
  const [data, setData] = useState<ListResultBase<AutoriaItem> | null>(null)
  const [pagina, setPagina] = useState(1)
  const [ano, setAno] = useState<number | undefined>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getAutorias(codigo, { pagina, porPagina: PORPAGINA, ano })
      .then(setData)
      .finally(() => setLoading(false))
  }, [codigo, pagina, ano])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-sm">
        <label className="text-muted">Ano:</label>
        <select
          value={ano ?? ''}
          onChange={(e) => {
            setAno(e.target.value ? Number(e.target.value) : undefined)
            setPagina(1)
          }}
          className="rounded-sm border border-border bg-surface px-2 py-1 text-sm"
        >
          <option value="">Todos</option>
          {[2026, 2025, 2024, 2023].map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        {data && <span className="text-muted">{data.total} autorias</span>}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-sm bg-surface border border-border animate-pulse" />
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        <>
          <ul className="space-y-2">
            {data.data.map((a) => (
              <li key={a.idProcesso} className="rounded-sm border border-border bg-surface p-3 hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-baseline gap-2">
                      <span className="font-mono text-sm text-ink">{a.identificacao}</span>
                      {a.dataApresentacao && (
                        <span className="text-xs text-muted">{formatBR(a.dataApresentacao)}</span>
                      )}
                    </p>
                    <p className="mt-1 text-sm text-muted leading-snug line-clamp-3">{a.ementa}</p>
                    {a.autoriaTexto && a.autoriaTexto.includes(',') && (
                      <p className="mt-1.5 text-xs text-subtle">Coautoria com outros parlamentares</p>
                    )}
                    {a.situacao && (
                      <p className="mt-1.5 text-[11px] uppercase tracking-wider text-muted font-medium">
                        {a.situacao}
                      </p>
                    )}
                  </div>
                  {a.url && (
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-sm border border-border px-2 py-1 text-[10px] uppercase tracking-wider text-muted hover:border-primary/40 hover:text-primary"
                    >
                      Ver no Senado ↗
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <Pagination pagina={data.pagina} porPagina={data.porPagina} total={data.total} onChange={setPagina} />
        </>
      ) : (
        <p className="text-muted text-sm">Nenhuma autoria encontrada.</p>
      )}
    </div>
  )
}

function formatBR(d: string): string {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}
