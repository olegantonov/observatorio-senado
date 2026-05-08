'use client'

import { useEffect, useState } from 'react'
import { getComissoes, getCargos } from '@/lib/api'
import type { ComissaoItem, CargoItem, ListResultBase } from '@/lib/types'

export function AbaComissoes({ codigo }: { codigo: string }) {
  const [todas, setTodas] = useState<ListResultBase<ComissaoItem> | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInativas, setShowInativas] = useState(false)

  useEffect(() => {
    setLoading(true)
    getComissoes(codigo, false)  // todas (ativas e inativas)
      .then(setTodas)
      .finally(() => setLoading(false))
  }, [codigo])

  if (loading) return <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 rounded-sm bg-surface border border-border animate-pulse" />)}</div>
  if (!todas || todas.data.length === 0) return <p className="text-muted text-sm">Sem comissões registradas.</p>

  const ativas = todas.data.filter((c) => c.ativo)
  const inativas = todas.data.filter((c) => !c.ativo)
  const list = showInativas ? todas.data : ativas

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted">{ativas.length} ativas</span>
        {inativas.length > 0 && (
          <button onClick={() => setShowInativas((v) => !v)} className="text-xs text-primary underline-offset-2 hover:underline">
            {showInativas ? 'Ocultar' : 'Mostrar'} {inativas.length} inativa(s)
          </button>
        )}
      </div>
      <ul className="space-y-2">
        {list.map((c) => (
          <li key={`${c.codigo}-${c.dataInicio}`} className={`rounded-sm border bg-surface px-3 py-2 ${c.ativo ? 'border-border' : 'border-border/50 opacity-70'}`}>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-mono text-sm text-ink">{c.sigla}</span>
              <span className="rounded-sm bg-panel px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted">{c.participacao}</span>
              {c.casa && <span className="text-[10px] uppercase tracking-wider text-subtle">{c.casa}</span>}
            </div>
            <p className="mt-0.5 text-sm text-muted">{c.nome}</p>
            <p className="mt-1 text-[11px] text-subtle">
              Desde {formatBR(c.dataInicio)}{c.dataFim ? ` · até ${formatBR(c.dataFim)}` : ''}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function AbaCargos({ codigo }: { codigo: string }) {
  const [todos, setTodos] = useState<ListResultBase<CargoItem> | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInativos, setShowInativos] = useState(false)

  useEffect(() => {
    setLoading(true)
    getCargos(codigo, false)
      .then(setTodos)
      .finally(() => setLoading(false))
  }, [codigo])

  if (loading) return <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 rounded-sm bg-surface border border-border animate-pulse" />)}</div>
  if (!todos || todos.data.length === 0) return <p className="text-muted text-sm">Sem cargos registrados.</p>

  const ativos = todos.data.filter((c) => c.ativo)
  const inativos = todos.data.filter((c) => !c.ativo)
  const list = showInativos ? todos.data : ativos

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted">{ativos.length} ativos</span>
        {inativos.length > 0 && (
          <button onClick={() => setShowInativos((v) => !v)} className="text-xs text-primary underline-offset-2 hover:underline">
            {showInativos ? 'Ocultar' : 'Mostrar'} {inativos.length} encerrado(s)
          </button>
        )}
      </div>
      <ul className="space-y-2">
        {list.map((c, i) => (
          <li key={`${c.cargo}-${c.dataInicio}-${i}`} className={`rounded-sm border bg-surface px-3 py-2 ${c.ativo ? 'border-border' : 'border-border/50 opacity-70'}`}>
            <p className="font-medium text-sm text-ink">{c.cargo}</p>
            {c.comissaoNome && <p className="text-xs text-muted">{c.comissaoNome}{c.comissaoSigla ? ` (${c.comissaoSigla})` : ''}</p>}
            <p className="mt-1 text-[11px] text-subtle">
              Desde {formatBR(c.dataInicio)}{c.dataFim ? ` · até ${formatBR(c.dataFim)}` : ''}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function formatBR(d: string): string {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}
