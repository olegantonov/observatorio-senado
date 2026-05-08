import type {
  RankingResponse,
  MetaResponse,
  IdsScore,
  CeapResponse,
  AfastadosResponse,
  FilterPreset,
  ListResultBase,
  AutoriaItem,
  RelatoriaItem,
  VotacaoItem,
  ComissaoItem,
  CargoItem,
  DiscursoItem,
  DespesasResponse,
  PerfilSenador,
} from './types'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  'https://api.observasenado.org'

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`)
  }
  return res.json() as Promise<T>
}

export async function getRanking(params?: {
  partido?: string
  uf?: string
  bloco?: string
  filter?: FilterPreset
  status?: string
  meses_min?: number
  ordenar?: string
}): Promise<RankingResponse> {
  const qs = new URLSearchParams()
  if (params?.partido) qs.set('partido', params.partido)
  if (params?.uf) qs.set('uf', params.uf)
  if (params?.bloco) qs.set('bloco', params.bloco)
  if (params?.filter && params.filter !== 'geral') qs.set('filter', params.filter)
  if (params?.status) qs.set('status', params.status)
  if (params?.meses_min) qs.set('meses_min', String(params.meses_min))
  if (params?.ordenar) qs.set('ordenar', params.ordenar)
  const query = qs.toString() ? `?${qs}` : ''
  return apiFetch<RankingResponse>(`/api/ranking${query}`)
}

export async function getAfastados(): Promise<AfastadosResponse> {
  return apiFetch<AfastadosResponse>('/api/ranking?filter=afastados')
}

export async function getRankingMeta(): Promise<MetaResponse> {
  return apiFetch<MetaResponse>('/api/ranking/meta')
}

export async function getSenador(codigo: string): Promise<IdsScore> {
  return apiFetch<IdsScore>(`/api/senador/${codigo}`)
}

export async function getCeap(
  codigo: string,
  ano?: number,
): Promise<CeapResponse> {
  const q = ano ? `?ano=${ano}` : ''
  return apiFetch<CeapResponse>(`/api/ceap/${codigo}${q}`)
}

interface PageOpts {
  pagina?: number
  porPagina?: number
  ano?: number
}

function pageQs(opts?: PageOpts): string {
  const qs = new URLSearchParams()
  if (opts?.pagina) qs.set('pagina', String(opts.pagina))
  if (opts?.porPagina) qs.set('porPagina', String(opts.porPagina))
  if (opts?.ano) qs.set('ano', String(opts.ano))
  return qs.toString() ? `?${qs}` : ''
}

export async function getPerfil(codigo: string): Promise<PerfilSenador> {
  return apiFetch<PerfilSenador>(`/api/senador/${codigo}/perfil`)
}

export async function getAutorias(codigo: string, opts?: PageOpts): Promise<ListResultBase<AutoriaItem>> {
  return apiFetch<ListResultBase<AutoriaItem>>(`/api/senador/${codigo}/autorias${pageQs(opts)}`)
}

export async function getRelatorias(codigo: string, opts?: PageOpts): Promise<ListResultBase<RelatoriaItem>> {
  return apiFetch<ListResultBase<RelatoriaItem>>(`/api/senador/${codigo}/relatorias${pageQs(opts)}`)
}

export async function getVotacoes(codigo: string, opts?: PageOpts): Promise<ListResultBase<VotacaoItem>> {
  return apiFetch<ListResultBase<VotacaoItem>>(`/api/senador/${codigo}/votacoes${pageQs(opts)}`)
}

export async function getComissoes(codigo: string, ativo?: boolean): Promise<ListResultBase<ComissaoItem>> {
  const q = ativo === undefined ? '' : `?ativo=${ativo}`
  return apiFetch<ListResultBase<ComissaoItem>>(`/api/senador/${codigo}/comissoes${q}`)
}

export async function getCargos(codigo: string, ativo?: boolean): Promise<ListResultBase<CargoItem>> {
  const q = ativo === undefined ? '' : `?ativo=${ativo}`
  return apiFetch<ListResultBase<CargoItem>>(`/api/senador/${codigo}/cargos${q}`)
}

export async function getDiscursos(codigo: string, opts?: PageOpts): Promise<ListResultBase<DiscursoItem>> {
  return apiFetch<ListResultBase<DiscursoItem>>(`/api/senador/${codigo}/discursos${pageQs(opts)}`)
}

export async function getApartes(codigo: string, opts?: PageOpts): Promise<ListResultBase<DiscursoItem>> {
  return apiFetch<ListResultBase<DiscursoItem>>(`/api/senador/${codigo}/apartes${pageQs(opts)}`)
}

export async function getDespesasDetalhadas(
  codigo: string,
  opts?: PageOpts & { tipo?: string; fornecedor?: string },
): Promise<DespesasResponse> {
  const qs = new URLSearchParams()
  if (opts?.pagina) qs.set('pagina', String(opts.pagina))
  if (opts?.porPagina) qs.set('porPagina', String(opts.porPagina))
  if (opts?.ano) qs.set('ano', String(opts.ano))
  if (opts?.tipo) qs.set('tipo', opts.tipo)
  if (opts?.fornecedor) qs.set('fornecedor', opts.fornecedor)
  const q = qs.toString() ? `?${qs}` : ''
  return apiFetch<DespesasResponse>(`/api/senador/${codigo}/despesas${q}`)
}
