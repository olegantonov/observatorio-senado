'use client'

import type { AbaSenador } from '@/lib/types'

const ABAS: { id: AbaSenador; label: string }[] = [
  { id: 'resumo',     label: 'Resumo' },
  { id: 'autorias',   label: 'Autorias' },
  { id: 'relatorias', label: 'Relatorias' },
  { id: 'votacoes',   label: 'Votações' },
  { id: 'comissoes',  label: 'Comissões' },
  { id: 'cargos',     label: 'Cargos' },
  { id: 'discursos',  label: 'Discursos' },
  { id: 'apartes',    label: 'Apartes' },
  { id: 'despesas',   label: 'Despesas (CEAP)' },
  { id: 'perfil',     label: 'Perfil' },
]

export default function AbasMenu({
  active,
  onChange,
}: {
  active: AbaSenador
  onChange: (a: AbaSenador) => void
}) {
  return (
    <nav className="overflow-x-auto -mx-1 flex gap-1 border-b border-border" role="tablist">
      {ABAS.map((a) => {
        const isActive = active === a.id
        return (
          <button
            key={a.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(a.id)}
            className={`shrink-0 px-3 py-2 text-xs uppercase tracking-wider font-medium transition-colors -mb-px border-b-2 ${
              isActive ? 'text-ink border-primary' : 'text-muted border-transparent hover:text-ink'
            }`}
          >
            {a.label}
          </button>
        )
      })}
    </nav>
  )
}
