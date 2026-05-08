import { serve } from '@hono/node-server'
import { app } from '../../index'
import { env } from './env'

const port = Number(process.env.PORT || 3012)
const hostname = process.env.HOST || '127.0.0.1'

const fetchHandler: typeof app.fetch = (req, _passedEnv, ctx) =>
  app.fetch(req, env as never, ctx)

const server = serve({ fetch: fetchHandler, hostname, port }, (info) => {
  console.log(`[observasenado] listening on http://${info.address}:${info.port}`)
})

const shutdown = (signal: string) => {
  console.log(`[observasenado] received ${signal}, shutting down`)
  server.close(() => process.exit(0))
  setTimeout(() => process.exit(1), 5000).unref()
}
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
