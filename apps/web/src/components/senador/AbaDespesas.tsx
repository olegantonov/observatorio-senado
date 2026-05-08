'use client'

import { useEffect, useState } from 'react'
import { getDespesasDetalhadas } from '@/lib/api'
import type { DespesasResponse } from '@/lib/types'
import Pagination from './Pagination'

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

const fmt = new Intl.NumberFormat('pt-BR', {
  style: 'currency', currency: 'BRL', maximumFractionDigits: 2,
})

export default function AbaDespesas({ codigo }: { codigo: string }) {
  const [ano, setAno] = useState<number>(new Date().getFullYear())
  const [pagina, setPagina] = useState(1)
  const [tipoFiltro, setTipoFiltro] = useState('')
  const [forn, setForn] = useState('')
  const [data, setData] = useState<DespesasResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getDespesasDetalhadas(codigo, { ano, pagina, porPagina: 30, tipo: tipoFiltro || undefined, fornecedor: forn || undefined })
      .then(setData)
      .finally(() => setLoading(false))
  }, [codigo, ano, pagina, tipoFiltro, forn])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="text-muted">Ano:</label>
        <select
          value={ano}
          onChange={(e) => { setAno(Number(e.target.value)); setPagina(1) }}
          className="rounded-sm border border-border bg-surface px-2 py-1 text-sm"
        >
          {[2026, 2025, 2024, 2023].map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <input
          placeholder="Filtrar por tipo"
          value={tipoFiltro}
          onChange={(e) => { setTipoFiltro(e.target.value); setPagina(1) }}
          className="rounded-sm border border-border bg-surface px-2 py-1 text-sm w-44"
        />
        <input
          placeholder="Filtrar por fornecedor"
          value={forn}
          onChange={(e) => { setForn(e.target.value); setPagina(1) }}
          className="rounded-sm border border-border bg-surface px-2 py-1 text-sm w-52"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-24 rounded-sm bg-surface border border-border animate-pulse" />
          <div className="h-64 rounded-sm bg-surface border border-border animate-pulse" />
        </div>
      ) : data ? (
        <>
          <section className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-border border border-border rounded-sm overflow-hidden">
            <Stat label="Total no ano" value={fmt.format(data.resumo.totalAno)} />
            <Stat label="Transações" value={String(data.resumo.totalTransacoes)} />
            <Stat label="Mensal médio" value={fmt.format(data.resumo.totalAno / 12)} />
          </section>

          {data.resumo.porTipo.length > 0 && (
            <section>
              <h3 className="font-serif text-sm font-semibold text-ink mb-2">Por tipo de despesa</h3>
              <ul className="divide-y divide-border rounded-sm border border-border bg-surface">
                {data.resumo.porTipo.map((t) => {
                  const pct = data.resumo.totalAno > 0 ? (t.total / data.resumo.totalAno) * 100 : 0
                  return (
                    <li key={t.tipo} className="px-3 py-2 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-ink line-clamp-1 flex-1">{t.tipo}</span>
                        <span className="font-mono text-muted shrink-0">{fmt.format(t.total)}</span>
                        <span className="font-mono text-xs text-subtle shrink-0 w-12 text-right">{pct.toFixed(1)}%</span>
                      </div>
                      <div className="mt-1 h-1 rounded-full bg-border">
                        <div className="h-1 rounded-full bg-primary/40" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {data.resumo.topFornecedores.length > 0 && (
            <section>
              <h3 className="font-serif text-sm font-semibold text-ink mb-2">Top fornecedores</h3>
              <ul className="divide-y divide-border rounded-sm border border-border bg-surface">
                {data.resumo.topFornecedores.slice(0, 10).map((f) => (
                  <li key={f.cpfCnpj || f.nome} className="px-3 py-2 text-sm flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-ink truncate">{f.nome}</p>
                      <p className="font-mono text-[11px] text-subtle">{f.cpfCnpj} · {f.transacoes} transações</p>
                    </div>
                    <span className="font-mono text-muted shrink-0">{fmt.format(f.total)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {data.resumo.porMes.length > 0 && (
            <section>
              <h3 className="font-serif text-sm font-semibold text-ink mb-2">Por mês</h3>
              <ul className="grid grid-cols-3 sm:grid-cols-6 gap-px bg-border border border-border rounded-sm overflow-hidden">
                {Array.from({ length: 12 }).map((_, idx) => {
                  const mesData = data.resumo.porMes.find((m) => m.mes === idx + 1)
                  return (
                    <li key={idx} className="bg-surface px-2 py-2 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-muted">{MESES[idx]}</p>
                      <p className="font-mono text-xs text-ink mt-0.5">{mesData ? fmt.format(mesData.total) : '—'}</p>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          <section>
            <h3 className="font-serif text-sm font-semibold text-ink mb-2">
              Transações ({data.total} total)
            </h3>
            {data.data.length === 0 ? (
              <p className="text-muted text-sm">Nenhuma transação para os filtros aplicados.</p>
            ) : (
              <>
                <div className="overflow-x-auto rounded-sm border border-border">
                  <table className="w-full text-xs">
                    <thead className="bg-panel">
                      <tr className="text-left text-[10px] uppercase tracking-wider text-muted">
                        <th className="px-2 py-1.5 font-medium">Data</th>
                        <th className="px-2 py-1.5 font-medium">Tipo</th>
                        <th className="px-2 py-1.5 font-medium">Fornecedor</th>
                        <th className="px-2 py-1.5 font-medium">CPF/CNPJ</th>
                        <th className="px-2 py-1.5 font-medium text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface">
                      {data.data.map((d) => (
                        <tr key={d.id} className="hover:bg-panel/30">
                          <td className="px-2 py-1.5 font-mono text-muted whitespace-nowrap">{d.data ? formatBR(d.data) : `${MESES[d.mes - 1]}/${d.ano}`}</td>
                          <td className="px-2 py-1.5 text-muted line-clamp-1 max-w-[24ch]" title={d.tipoDespesa}>{d.tipoDespesa}</td>
                          <td className="px-2 py-1.5 text-ink line-clamp-1 max-w-[24ch]" title={d.fornecedor}>{d.fornecedor}</td>
                          <td className="px-2 py-1.5 font-mono text-subtle whitespace-nowrap">{d.cpfCnpj}</td>
                          <td className="px-2 py-1.5 font-mono text-right text-ink whitespace-nowrap">{fmt.format(d.valor)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3">
                  <Pagination pagina={data.pagina} porPagina={data.porPagina} total={data.total} onChange={setPagina} />
                </div>
              </>
            )}
          </section>
        </>
      ) : (
        <p className="text-muted text-sm">Sem dados.</p>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface px-3 py-3 text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
      <p className="font-serif text-lg text-ink mt-0.5">{value}</p>
    </div>
  )
}

function formatBR(d: string): string {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}
