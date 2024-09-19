export { onRenderHtml }

import ReactDOMServer from 'react-dom/server'
import React from 'react'
import { escapeInject, dangerouslySkipEscape } from 'vike/server'
import { PageLayout } from '../PageLayout'
import { resolvePageContext, PageContextOriginal } from '../config/resolvePageContext'
import { getDocSearchJS, getDocSearchCSS } from '../algolia/DocSearch'
import { assert } from '../utils/server'

async function onRenderHtml(pageContextOriginal: PageContextOriginal) {
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

  const pageHtml = ReactDOMServer.renderToString(page)

  return escapeInject`<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" href="${pageContextResolved.meta.faviconUrl}" />
        <title>${pageContextResolved.documentTitle}</title>
        ${descriptionTag}
        <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no" />
        ${docSearchCSS}
        ${getOpenGraphTags(
          pageContextOriginal.urlPathname,
          pageContextResolved.documentTitle,
          pageContextResolved.meta,
        )}
      </head>
      <body>
        <div id="page-view">${dangerouslySkipEscape(pageHtml)}</div>
        ${docSearchJS}
      </body>
    </html>`
}

function getOpenGraphTags(
  url: string,
  documentTitle: string,
  meta: { tagline: string; websiteUrl: string; twitterHandle: string; bannerUrl?: string },
) {
  const { tagline, websiteUrl, twitterHandle, bannerUrl } = meta

  assert(url.startsWith('/'))
  if (!bannerUrl) return ''

  // See view-source:https://vitejs.dev/
  return escapeInject`
    <meta property="og:type" content="website">
    <meta property="og:title" content="${documentTitle}">
    <meta property="og:image" content="${bannerUrl}">
    <meta property="og:url" content="${websiteUrl}">
    <meta property="og:description" content="${tagline}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="${twitterHandle}">
  `
}
