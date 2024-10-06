export { onRenderHtml }

import ReactDOMServer from 'react-dom/server'
import { escapeInject, dangerouslySkipEscape } from 'vike/server'
import { assert } from '../utils/server'
import type { PageContextResolved } from '../config/resolvePageContext'
import { getPageElement } from './getPageElement'
import type { InjectFilterEntry, OnRenderHtmlSync } from 'vike/types'

const onRenderHtml: OnRenderHtmlSync = (
  pageContext,
): // TODO: Why is Promise<Awaited<>> needed?
ReturnType<OnRenderHtmlSync> => {
  const pageContextResolved: PageContextResolved = (pageContext as any).pageContextResolved

  const page = getPageElement(pageContext, pageContextResolved)

  const descriptionTag = pageContextResolved.isLandingPage
    ? dangerouslySkipEscape(`<meta name="description" content="${pageContextResolved.meta.tagline}" />`)
    : ''

  const pageHtml = ReactDOMServer.renderToString(page)

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" href="${pageContextResolved.meta.faviconUrl}" />
        <title>${pageContextResolved.documentTitle}</title>
        ${descriptionTag}
        <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no" />
        ${getOpenGraphTags(pageContext.urlPathname, pageContextResolved.documentTitle, pageContextResolved.meta)}
      </head>
      <body>
        <div id="page-view">${dangerouslySkipEscape(pageHtml)}</div>
      </body>
    </html>`

  return {
    documentHtml,
    // @ts-expect-error
    injectFilter(assets: InjectFilterEntry[]) {
      assets.forEach((asset) => {
        if (asset.assetType == 'script') asset.inject = false
      })
    },
  }
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
