import express from 'express'
import * as vite from 'vite'
import { renderPage } from 'vite-plugin-ssr'
import { configFile } from './configFile'
const viteVersion = (vite as { version?: string }).version || '2.?.?'

startServer()

async function startServer() {
  const app = express()

  const viteDevServer = await vite.createServer({
    configFile,
    server: { middlewareMode: viteVersion.startsWith('2') ? 'ssr' : true }
  })
  app.use(viteDevServer.middlewares)

  app.get('*', async (req, res, next) => {
    const url = req.originalUrl
    const pageContextInit = { url }
    const pageContext = await renderPage(pageContextInit)
    if (!pageContext.httpResponse) return next()
    const { body, statusCode, contentType } = pageContext.httpResponse
    res.status(statusCode).type(contentType).send(body)
  })

  const port = 3000
  app.listen(port)
  console.log(`Server running at http://localhost:${port}`)
}
