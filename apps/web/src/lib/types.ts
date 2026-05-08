export type SenadorStatus =
  | 'titular_pleno'
  | 'titular_voltou'
  | 'suplente_efetivo'
  | 'suplente_recente'
  | 'recente'
  | 'afastado'

export type Confianca = 'alta' | 'media' | 'baixa'

export type FilterPreset =
  | 'geral'
  | 'ativos'
  | 'titulares'
  | 'suplentes'
  | 'recentes'
  | 'afastados'

export interface IdsScore {
  senadorCod: string
  nome: string
  partido: string
  uf: string
  bloco: string
  fotoUrl?: string
  dataInicioExercicio?: string
  mesesAtivos?: number
  auxilioMoradia?: boolean
  imovelFuncional?: boolean
  idsTotal: number
  dimProdutividade: number
  dimEfetividade: number
  dimParticipacao: number
  dimFiscalizacao: number
  dimCeap: number
  dimTransparencia: number
  autoriasTotal: number
  autoriasAprovadas: number
  votacaoPresentes: number
  votacoesTotal: number
  relatoriasTotal: number
  discursosTotal: number
  apartesTotal: number
  votacoesComissaoPresentes?: number
  votacoesComissaoTotal?: number
  ceapTotalAno: number
  ceapDivulgacao?: number
  ceapEscritorio?: number
  ceapLocomocao?: number
  ceapConsultoria?: number
  ceapOutros?: number
  pctDivulgacao?: number
  escritoriosCount?: number
  cargosLideranca?: number
  cargosTitulos?: string[]
  posicao?: number
  totalSenadores?: number
  status?: SenadorStatus
  confianca?: Confianca
  idsTotalBruto?: number
}

export interface SenadorAfastado {
  codigo: string
  nome: string
  partido: string
  uf: string
  fotoUrl?: string
  motivo: string
  dataInicio: string
  dataFim?: string
}

export interface RankingResponse {
  total: number
  filter?: FilterPreset
  ordenar?: string
  computedAt?: string | null
  empty?: boolean
  data: IdsScore[]
}

export interface AfastadosResponse {
  total: number
  filter: 'afastados'
  data: SenadorAfastado[]
}

export interface MetaResponse {
  partidos: string[]
  ufs: string[]
  blocos: string[]
  statuses?: string[]
  filtros?: FilterPreset[]
  ordenacao?: string[]
}

// ─── Detalhe ──────────────────────────────────────────────────────────────
export interface ListResultBase<T> {
  codigo: string
  total: number
  pagina: number
  porPagina: number
  data: T[]
  fonte: string
  atualizadoEm: string
}

export interface AutoriaItem {
  idProcesso: number
  identificacao: string
  ementa: string
  dataApresentacao: string
  sigla: string
  numero: string
  ano: string
  autoriaTexto?: string
  primeiroAutor?: boolean
  situacao?: string
  ultimoLocal?: string
  url?: string
}

export interface RelatoriaItem {
  idProcesso: number
  codigoMateria?: number
  identificacao?: string
  ementa: string
  comissaoCodigo?: number
  comissaoSigla?: string
  comissaoNome?: string
  papel: string
  dataDesignacao: string
  dataDestituicao?: string
  encerramento?: string
  url?: string
}

export interface VotacaoItem {
  codigoSessao: number
  codigoVotacao: number
  dataSessao: string
  identificacao: string
  ementa: string
  descricaoVotacao: string
  voto: string
  resultado?: string
  url?: string
}

export interface ComissaoItem {
  codigo: string
  sigla: string
  nome: string
  casa?: string
  participacao: string
  dataInicio: string
  dataFim?: string
  ativo: boolean
}

export interface CargoItem {
  cargo: string
  comissaoCodigo?: string
  comissaoSigla?: string
  comissaoNome?: string
  casa?: string
  dataInicio: string
  dataFim?: string
  ativo: boolean
}

export interface DiscursoItem {
  codigoPronunciamento: string
  data: string
  casa: string
  tipoUsoPalavra: string
  resumo: string
  urlTextoIntegral?: string
  urlTextoBinario?: string
}

export interface DespesaItem {
  id: number
  ano: number
  mes: number
  data?: string
  tipoDocumento: string
  tipoDespesa: string
  cpfCnpj: string
  fornecedor: string
  documento?: string
  detalhamento?: string
  valor: number
}

export interface DespesasResumo {
  totalAno: number
  totalTransacoes: number
  porTipo: Array<{ tipo: string; total: number; transacoes: number }>
  porMes: Array<{ mes: number; total: number }>
  topFornecedores: Array<{ nome: string; cpfCnpj: string; total: number; transacoes: number }>
}

export interface DespesasResponse extends ListResultBase<DespesaItem> {
  resumo: DespesasResumo
}

export interface PerfilSenador {
  codigo: string
  nome: string
  partido?: string
  uf?: string
  email?: string
  telefones?: string[]
  fotoUrl?: string
  paginaSenado?: string
  endereco?: string
  mandatos: Array<{
    legislatura: string
    inicio: string
    fim?: string
    participacao: string
    partido?: string
    suplentes?: Array<{ descricao: string; nome: string }>
  }>
  filiacoes: Array<{ partido: string; dataFiliacao: string; dataDesfiliacao?: string }>
  profissoes: string[]
  formacao: Array<{ nivel: string; curso: string; instituicao?: string }>
  fonte: string
  atualizadoEm: string
}

export type AbaSenador =
  | 'resumo'
  | 'autorias'
  | 'relatorias'
  | 'votacoes'
  | 'comissoes'
  | 'cargos'
  | 'discursos'
  | 'apartes'
  | 'despesas'
  | 'perfil'

export interface CeapMes {
  mes: number
  ano: number
  valorTotal: number
}

export interface CeapResponse {
  codigo: string
  ano: number
  meses: CeapMes[]
}

export type SortKey = keyof Pick<
  IdsScore,
  | 'idsTotal'
  | 'dimProdutividade'
  | 'dimEfetividade'
  | 'dimParticipacao'
  | 'dimFiscalizacao'
  | 'dimCeap'
  | 'dimTransparencia'
  | 'nome'
  | 'partido'
  | 'uf'
>

export type SortDir = 'asc' | 'desc'
