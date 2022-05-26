import ReactDOMServer from 'react-dom/server'
import React from 'react'
import { escapeInject, dangerouslySkipEscape } from 'vite-plugin-ssr'
import { PageLayout } from '../PageLayout'
import { resolvePageContext, PageContextOriginal } from '../config/resolvePageContext'
import { objectAssign } from '../utils'
import { getDocSearchJS, getDocSearchCSS } from '../algolia/DocSearch'
import { parseEmojis } from '../parseEmojis'

export { render }

function render(pageContext: PageContextOriginal) {
  const { Page } = pageContext
  const pageContextAdded = resolvePageContext(pageContext)
  objectAssign(pageContext, pageContextAdded)

  const page = (
    <PageLayout pageContext={pageContext}>
      <Page />
    </PageLayout>
  )

  const descriptionTag = pageContext.isLandingPage
    ? dangerouslySkipEscape(`<meta name="description" content="${pageContext.meta.tagline}" />`)
    : ''

  const docSearchJS = getDocSearchJS(pageContext)
  const docSearchCSS = getDocSearchCSS(pageContext)

  let pageHtml = ReactDOMServer.renderToString(page)
  pageHtml = parseEmojis(pageHtml)

  return escapeInject`<!DOCTYPE html>
    <html>
      <head>
        <link rel="icon" href="${pageContext.meta.faviconUrl}" />
        <title>${pageContext.meta.title}</title>
        ${descriptionTag}
        <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no" />
        ${docSearchCSS}
      </head>
      <body>
        <div id="page-view">${dangerouslySkipEscape(pageHtml)}</div>
        ${docSearchJS}
      </body>
    </html>`
}
