'use client'

import { useEffect, useState } from 'react'
import { getPerfil } from '@/lib/api'
import type { PerfilSenador } from '@/lib/types'

export default function AbaPerfil({ codigo }: { codigo: string }) {
  const [perfil, setPerfil] = useState<PerfilSenador | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getPerfil(codigo).then(setPerfil).finally(() => setLoading(false))
  }, [codigo])

  if (loading) return <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 rounded-sm bg-surface border border-border animate-pulse" />)}</div>
  if (!perfil) return <p className="text-muted text-sm">Perfil indisponível.</p>

  return (
    <div className="space-y-6">
      <Section title="Contato">
        <Field label="E-mail" value={perfil.email} mailto />
        {perfil.paginaSenado && (
          <Field label="Página oficial">
            <a href={perfil.paginaSenado} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{perfil.paginaSenado}</a>
          </Field>
        )}
        {perfil.telefones && perfil.telefones.length > 0 && (
          <Field label="Telefones">
            {perfil.telefones.join(', ')}
          </Field>
        )}
        {perfil.endereco && <Field label="Endereço" value={perfil.endereco} />}
      </Section>

      {perfil.mandatos.length > 0 && (
        <Section title="Mandatos">
          <ul className="space-y-2">
            {perfil.mandatos.map((m, i) => (
              <li key={i} className="rounded-sm border border-border bg-surface p-3">
                <p className="flex items-baseline gap-2">
                  <span className="font-mono text-sm text-ink">Legislatura {m.legislatura}</span>
                  <span className="text-xs text-muted">{m.participacao}</span>
                  {m.partido && <span className="text-[11px] text-subtle">{m.partido}</span>}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  {formatBR(m.inicio)}{m.fim ? ` – ${formatBR(m.fim)}` : ' – em curso'}
                </p>
                {m.suplentes && m.suplentes.length > 0 && (
                  <ul className="mt-2 text-xs text-muted">
                    {m.suplentes.map((s, j) => (
                      <li key={j}>{s.descricao}: {s.nome}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {perfil.filiacoes.length > 0 && (
        <Section title="Filiações partidárias">
          <ul className="divide-y divide-border rounded-sm border border-border bg-surface">
            {perfil.filiacoes.map((f, i) => (
              <li key={i} className="px-3 py-2 flex items-baseline justify-between gap-3 text-sm">
                <span className="font-mono text-ink">{f.partido}</span>
                <span className="text-xs text-muted">
                  {formatBR(f.dataFiliacao)}{f.dataDesfiliacao ? ` – ${formatBR(f.dataDesfiliacao)}` : ' – em curso'}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {perfil.profissoes.length > 0 && (
        <Section title="Profissões">
          <p className="text-sm text-muted">{perfil.profissoes.join(' · ')}</p>
        </Section>
      )}

      {perfil.formacao.length > 0 && (
        <Section title="Formação acadêmica">
          <ul className="space-y-1">
            {perfil.formacao.map((f, i) => (
              <li key={i} className="text-sm text-muted">
                <span className="text-ink">{f.curso}</span>
                {f.nivel ? ` · ${f.nivel}` : ''}
                {f.instituicao ? ` — ${f.instituicao}` : ''}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="eyebrow mb-2">{title}</h3>
      {children}
    </section>
  )
}

function Field({ label, value, mailto, children }: { label: string; value?: string; mailto?: boolean; children?: React.ReactNode }) {
  if (!value && !children) return null
  return (
    <p className="text-sm">
      <span className="text-muted text-[11px] uppercase tracking-wider mr-2">{label}</span>
      {children ?? (
        mailto ? (
          <a href={`mailto:${value}`} className="text-primary hover:underline">{value}</a>
        ) : (
          <span className="text-ink">{value}</span>
        )
      )}
    </p>
  )
}

function formatBR(d: string): string {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}
