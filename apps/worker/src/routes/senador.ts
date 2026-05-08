import { Hono } from 'hono'
import type { Env } from '../types'
import { getLatestRanking } from '../services/ranking'
import { getSenadorList } from '../services/legis'
import {
  obterPerfil,
  listarAutorias,
  listarRelatorias,
  listarVotacoes,
  listarComissoes,
  listarCargos,
  listarDiscursos,
  listarApartes,
  listarDespesasDetalhadas,
} from '../services/detalhe'

const senador = new Hono<{ Bindings: Env }>()

const CACHE_LISTA = 'public, max-age=1800, stale-while-revalidate=300'
const CACHE_DETALHE_LONGO = 'public, max-age=43200, stale-while-revalidate=3600'
const CACHE_DETALHE_CURTO = 'public, max-age=21600, stale-while-revalidate=600'

function pageOpts(c: { req: { query: (k: string) => string | undefined } }) {
  const pagina = Number(c.req.query('pagina') ?? '1')
  const porPagina = Number(c.req.query('porPagina') ?? '50')
  const ano = c.req.query('ano') ? Number(c.req.query('ano')) : undefined
  return { pagina, porPagina, ano }
}

senador.get('/:codigo', async (c) => {
  const codigo = c.req.param('codigo')
  const [scores, lista] = await Promise.all([getLatestRanking(c.env), getSenadorList(c.env)])
  const score = scores.find((s) => s.senadorCod === codigo)
  const info = lista.find((s) => s.codigo === codigo)
  if (!score && !info) return c.json({ error: 'Senador não encontrado' }, 404)
  const posicao = score ? scores.indexOf(score) + 1 : null
  return c.json(
    { ...score, ...info, posicao, totalSenadores: scores.length },
    200,
    { 'Cache-Control': CACHE_LISTA },
  )
})

senador.get('/:codigo/perfil', async (c) => {
  const perfil = await obterPerfil(c.env, c.req.param('codigo'))
  if (!perfil) return c.json({ error: 'Perfil não encontrado' }, 404)
  return c.json(perfil, 200, { 'Cache-Control': CACHE_DETALHE_LONGO })
})

senador.get('/:codigo/autorias', async (c) => {
  const result = await listarAutorias(c.env, c.req.param('codigo'), pageOpts(c))
  return c.json(result, 200, { 'Cache-Control': CACHE_DETALHE_CURTO })
})

senador.get('/:codigo/relatorias', async (c) => {
  const result = await listarRelatorias(c.env, c.req.param('codigo'), pageOpts(c))
  return c.json(result, 200, { 'Cache-Control': CACHE_DETALHE_CURTO })
})

senador.get('/:codigo/votacoes', async (c) => {
  const result = await listarVotacoes(c.env, c.req.param('codigo'), pageOpts(c))
  return c.json(result, 200, { 'Cache-Control': CACHE_DETALHE_CURTO })
})

senador.get('/:codigo/comissoes', async (c) => {
  const ativo = c.req.query('ativo')
  const result = await listarComissoes(c.env, c.req.param('codigo'), {
    ...pageOpts(c),
    ativo: ativo === 'false' ? false : ativo === 'true' ? true : undefined,
  })
  return c.json(result, 200, { 'Cache-Control': CACHE_DETALHE_LONGO })
})

senador.get('/:codigo/cargos', async (c) => {
  const ativo = c.req.query('ativo')
  const result = await listarCargos(c.env, c.req.param('codigo'), {
    ...pageOpts(c),
    ativo: ativo === 'false' ? false : ativo === 'true' ? true : undefined,
  })
  return c.json(result, 200, { 'Cache-Control': CACHE_DETALHE_LONGO })
})

senador.get('/:codigo/discursos', async (c) => {
  const result = await listarDiscursos(c.env, c.req.param('codigo'), pageOpts(c))
  return c.json(result, 200, { 'Cache-Control': CACHE_DETALHE_CURTO })
})

senador.get('/:codigo/apartes', async (c) => {
  const result = await listarApartes(c.env, c.req.param('codigo'), pageOpts(c))
  return c.json(result, 200, { 'Cache-Control': CACHE_DETALHE_CURTO })
})

senador.get('/:codigo/despesas', async (c) => {
  const codigo = c.req.param('codigo')
  const opts = pageOpts(c)
  const ano = opts.ano ?? new Date().getFullYear()
  const tipo = c.req.query('tipo')
  const fornecedor = c.req.query('fornecedor')
  const result = await listarDespesasDetalhadas(c.env, codigo, ano, {
    pagina: opts.pagina,
    porPagina: opts.porPagina,
    tipo,
    fornecedor,
  })
  return c.json(result, 200, { 'Cache-Control': CACHE_DETALHE_CURTO })
})

export { senador }
