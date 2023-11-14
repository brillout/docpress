import ReactDOMServer from 'react-dom/server'
import React from 'react'
import { escapeInject, dangerouslySkipEscape } from 'vike/server'
import { PageLayout } from '../PageLayout'
import { resolvePageContext, PageContextOriginal } from '../config/resolvePageContext'
import { getDocSearchJS, getDocSearchCSS } from '../algolia/DocSearch'
import { parseEmojis } from '../parseEmojis'
import { assert } from '../utils/server'

export { render }

async function render(pageContextOriginal: PageContextOriginal) {
  const { Page } = pageContextOriginal
  const pageContextResolved = resolvePageContext(pageContextOriginal)

  const page = (
    <PageLayout pageContext={pageContextResolved}>
      <Page />
    </PageLayout>
  )

  const descriptionTag = pageContextResolved.isLandingPage
    ? dangerouslySkipEscape(`<meta name="description" content="${pageContextResolved.meta.tagline}" />`)
    : ''

  const docSearchJS = getDocSearchJS(pageContextResolved)
  const docSearchCSS = getDocSearchCSS(pageContextResolved)

  let pageHtml = ReactDOMServer.renderToString(page)
  pageHtml = parseEmojis(pageHtml)

  return escapeInject`<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" href="${pageContextResolved.meta.faviconUrl}" />
        <title>${pageContextResolved.meta.title}</title>
        ${descriptionTag}
        <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no" />
        ${docSearchCSS}
        ${getOpenGraphTags(pageContextOriginal.urlPathname, pageContextResolved.meta)}
      </head>
      <body>
        <div id="page-view">${dangerouslySkipEscape(pageHtml)}</div>
        ${docSearchJS}
      </body>
    </html>`
}

function getOpenGraphTags(
  url: string,
  meta: { title: string; tagline: string; websiteUrl: string; twitterHandle: string; bannerUrl?: string }
) {
  const { title, tagline, websiteUrl, twitterHandle, bannerUrl } = meta

  assert(url.startsWith('/'))
  if (!bannerUrl) return ''

  // See view-source:https://vitejs.dev/
  return escapeInject`
    <meta property="og:type" content="website">
    <meta property="og:title" content="${title}">
    <meta property="og:image" content="${bannerUrl}">
    <meta property="og:url" content="${websiteUrl}">
    <meta property="og:description" content="${tagline}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="${twitterHandle}">
  `
}
