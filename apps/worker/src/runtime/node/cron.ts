import { computeRanking, persistRanking } from '../../services/ranking'
import { env } from './env'

async function main() {
  const started = Date.now()
  console.log('[cron] Iniciando recálculo semanal do ranking IDS...')
  try {
    const scores = await computeRanking(env)
    await persistRanking(env, scores)
    const dur = ((Date.now() - started) / 1000).toFixed(1)
    console.log(`[cron] OK — ${scores.length} senadores calculados em ${dur}s`)
    process.exit(0)
  } catch (err) {
    console.error('[cron] Erro:', err)
    process.exit(1)
  }
}

main()
