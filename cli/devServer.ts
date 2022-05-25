import express from 'express'
import vite from 'vite'
import { renderPage } from 'vite-plugin-ssr'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

startServer()

async function startServer() {
  const app = express()

  const viteDevServer = await vite.createServer({
    configFile: require.resolve('../../src/vite.config.ts'),
    server: { middlewareMode: 'ssr' }
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
