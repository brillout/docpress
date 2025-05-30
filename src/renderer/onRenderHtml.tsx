export { onRenderHtml }

import ReactDOMServer from 'react-dom/server'
import { escapeInject, dangerouslySkipEscape } from 'vike/server'
import { assert } from '../utils/server'
import type { PageContextResolved } from '../config/resolvePageContext'
import { getPageElement } from './getPageElement'
import type { OnRenderHtmlAsync } from 'vike/types'
import { ActiveCategory } from '../config/resolveHeadingsData'

const onRenderHtml: OnRenderHtmlAsync = async (
  pageContext,
): // TODO: Why is Promise<Awaited<>> needed?
Promise<Awaited<ReturnType<OnRenderHtmlAsync>>> => {
  const pageContextResolved: PageContextResolved = (pageContext as any).pageContextResolved

  const page = getPageElement(pageContext, pageContextResolved)

  const descriptionTag = pageContextResolved.isLandingPage
    ? dangerouslySkipEscape(`<meta name="description" content="${pageContextResolved.meta.tagline}" />`)
    : ''

  const pageHtml = ReactDOMServer.renderToString(page)

  const faviconUrl = pageContextResolved.config.faviconUrl ?? pageContextResolved.config.logoUrl

  return escapeInject`<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" href="${faviconUrl ?? ''}" />
        <title>${pageContextResolved.documentTitle}</title>
        ${descriptionTag}
        <meta name="viewport" content="width=device-width,initial-scale=1">
        ${getOpenGraphTags(pageContext.urlPathname, pageContextResolved.documentTitle, pageContextResolved.meta)}
        ${getAlgoliaTags(pageContextResolved.activeCategory)}
      </head>
      <body>
        <div id="page-view">${dangerouslySkipEscape(pageHtml)}</div>
      </body>
    </html>`
}

function getAlgoliaTags(activeCategory: ActiveCategory) {
  const categoryNameTag = escapeInject`<meta name="algolia:category" content="${activeCategory.name}">`
  if (activeCategory.hide) {
    return escapeInject`${categoryNameTag}<meta name="algolia:category:hide"> `
  } else {
    return escapeInject`${categoryNameTag}<meta name="algolia:category:order" content="${activeCategory.order.toString()}"> `
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
