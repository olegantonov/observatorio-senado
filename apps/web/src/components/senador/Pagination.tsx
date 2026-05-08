'use client'

export default function Pagination({
  pagina,
  porPagina,
  total,
  onChange,
}: {
  pagina: number
  porPagina: number
  total: number
  onChange: (p: number) => void
}) {
  const totalPaginas = Math.ceil(total / porPagina)
  if (totalPaginas <= 1) return null
  const inicio = (pagina - 1) * porPagina + 1
  const fim = Math.min(pagina * porPagina, total)
  return (
    <div className="flex items-center justify-between text-sm">
      <p className="text-muted">
        Exibindo <strong className="text-ink">{inicio}</strong>–
        <strong className="text-ink">{fim}</strong> de <strong className="text-ink">{total}</strong>
      </p>
      <div className="flex gap-1">
        <button
          onClick={() => onChange(Math.max(1, pagina - 1))}
          disabled={pagina === 1}
          className="rounded-sm border border-border bg-surface px-3 py-1.5 text-muted hover:text-primary disabled:opacity-30"
        >
          Anterior
        </button>
        <span className="px-3 py-1.5 font-mono text-muted">
          {pagina} / {totalPaginas}
        </span>
        <button
          onClick={() => onChange(Math.min(totalPaginas, pagina + 1))}
          disabled={pagina === totalPaginas}
          className="rounded-sm border border-border bg-surface px-3 py-1.5 text-muted hover:text-primary disabled:opacity-30"
        >
          Próxima
        </button>
      </div>
    </div>
  )
}
