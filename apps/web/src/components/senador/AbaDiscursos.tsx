'use client'

import { useEffect, useState } from 'react'
import { getDiscursos, getApartes } from '@/lib/api'
import type { DiscursoItem, ListResultBase } from '@/lib/types'
import Pagination from './Pagination'

export function AbaDiscursos({ codigo }: { codigo: string }) {
  return <DiscursoLikeList codigo={codigo} fetcher={getDiscursos} label="discurso" />
}
export function AbaApartes({ codigo }: { codigo: string }) {
  return <DiscursoLikeList codigo={codigo} fetcher={getApartes} label="aparte" />
}

function DiscursoLikeList({
  codigo,
  fetcher,
  label,
}: {
  codigo: string
  fetcher: (cod: string, opts?: { pagina?: number; porPagina?: number; ano?: number }) => Promise<ListResultBase<DiscursoItem>>
  label: string
}) {
  const [data, setData] = useState<ListResultBase<DiscursoItem> | null>(null)
  const [pagina, setPagina] = useState(1)
  const [ano, setAno] = useState<number>(new Date().getFullYear())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetcher(codigo, { pagina, porPagina: 20, ano })
      .then(setData)
      .finally(() => setLoading(false))
  }, [codigo, pagina, ano, fetcher])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-sm">
        <label className="text-muted">Ano:</label>
        <select
          value={ano}
          onChange={(e) => { setAno(Number(e.target.value)); setPagina(1) }}
          className="rounded-sm border border-border bg-surface px-2 py-1 text-sm"
        >
          {[2026, 2025, 2024, 2023].map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        {data && <span className="text-muted">{data.total} {label}{data.total === 1 ? '' : 's'}</span>}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-sm bg-surface border border-border animate-pulse" />)}
        </div>
      ) : data && data.data.length > 0 ? (
        <>
          <ul className="space-y-2">
            {data.data.map((d) => (
              <li key={d.codigoPronunciamento} className="rounded-sm border border-border bg-surface p-3">
                <p className="flex flex-wrap items-baseline gap-2">
                  <span className="text-xs text-muted">{formatBR(d.data)}</span>
                  <span className="rounded-sm bg-panel px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted">{d.tipoUsoPalavra}</span>
                  {d.casa && <span className="text-[10px] uppercase tracking-wider text-subtle">{d.casa}</span>}
                </p>
                <p className="mt-1 text-sm text-muted leading-snug line-clamp-3">{d.resumo}</p>
                {d.urlTextoIntegral && (
                  <p className="mt-2">
                    <a
                      href={d.urlTextoIntegral}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] uppercase tracking-wider text-primary underline-offset-2 hover:underline"
                    >
                      Ler texto integral ↗
                    </a>
                  </p>
                )}
              </li>
            ))}
          </ul>
          <Pagination pagina={data.pagina} porPagina={data.porPagina} total={data.total} onChange={setPagina} />
        </>
      ) : (
        <p className="text-muted text-sm">Nenhum {label} encontrado para o ano selecionado.</p>
      )}
    </div>
  )
}

function formatBR(d: string): string {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}
