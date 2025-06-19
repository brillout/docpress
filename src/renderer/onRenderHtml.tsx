export { onRenderHtml }

import ReactDOMServer from 'react-dom/server'
import { escapeInject, dangerouslySkipEscape } from 'vike/server'
import { assert } from '../utils/server'
import { getPageElement } from './getPageElement'
import type { PageContextServer } from 'vike/types'
import { ActiveCategory } from '../resolveConf'

async function onRenderHtml(pageContext: PageContextServer): Promise<any> {
  const page = getPageElement(pageContext)

  const { isLandingPage } = pageContext.conf
  assert(typeof isLandingPage === 'boolean')
  const { tagline } = pageContext.globalContext.configDocpress
  assert(tagline)
  const descriptionTag = isLandingPage ? escapeInject`<meta name="description" content="${tagline}" />` : ''

  const pageHtml = ReactDOMServer.renderToString(page)

  const faviconUrl =
    pageContext.globalContext.configDocpress.faviconUrl ?? pageContext.globalContext.configDocpress.logoUrl
  assert(faviconUrl)

  const { documentTitle, activeCategory } = pageContext.conf
  assert(documentTitle)
  assert(activeCategory)
  return escapeInject`<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" href="${faviconUrl ?? ''}" />
        <title>${documentTitle}</title>
        ${descriptionTag}
        <meta name="viewport" content="width=device-width,initial-scale=1">
        ${getOpenGraphTags(pageContext.urlPathname, documentTitle, pageContext.globalContext.configDocpress)}
        ${getAlgoliaTags(activeCategory)}
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

  const metaBanner = !bannerUrl
    ? ''
    : escapeInject`
    <meta property="og:image" content="${bannerUrl}">
    <meta name="twitter:card" content="summary_large_image">
  `
  const metaTwitter = !twitterHandle
    ? ''
    : escapeInject`
    <meta name="twitter:site" content="${twitterHandle}">
  `
  // See view-source:https://vitejs.dev/
  return escapeInject`
    <meta property="og:type" content="website">
    <meta property="og:title" content="${documentTitle}">
    <meta property="og:url" content="${websiteUrl}">
    <meta property="og:description" content="${tagline}">
    ${metaBanner}
    ${metaTwitter}
  `
}
