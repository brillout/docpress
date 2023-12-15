import express from 'express'
import * as vite from 'vite'
import { renderPage } from 'vike/server'
import config from '../vite.config'
const viteVersion = (vite as { version?: string }).version || '2.?.?'

startServer()

async function startServer() {
  const app = express()

  const viteDevServer = await vite.createServer({
    ...config,
    server: { middlewareMode: viteVersion.startsWith('2') ? 'ssr' : true }
  })
  app.use(viteDevServer.middlewares)

  app.get('*', async (req, res, next) => {
    const pageContextInit = {
      urlOriginal: req.originalUrl
    }
    const pageContext = await renderPage(pageContextInit)
    if (!pageContext.httpResponse) return next()
    const { body, statusCode, headers } = pageContext.httpResponse
    res.status(statusCode)
    headers.forEach(([name, value]) => res.setHeader(name, value))
    res.send(body)
  })

  const port = 3000
  app.listen(port)
  console.log(`Server running at http://localhost:${port}`)
}
