export { onRenderHtml }

import ReactDOMServer from 'react-dom/server'
import { escapeInject, dangerouslySkipEscape } from 'vike/server'
import { assert, assertUsage } from '../utils/server'
import { getPageElement } from './getPageElement'
import type { PageContextServer } from 'vike/types'
import type { Config } from '../types/Config'

async function onRenderHtml(pageContext: PageContextServer): Promise<any> {
  const page = getPageElement(pageContext)

  const { isLandingPage } = pageContext.resolved
  assert(typeof isLandingPage === 'boolean')
  const { tagline } = pageContext.globalContext.config.docpress
  assert(tagline)
  const descriptionTag = isLandingPage ? escapeInject`<meta name="description" content="${tagline}" />` : ''

  const pageHtml = ReactDOMServer.renderToString(page)

  const { documentTitle } = pageContext.resolved
  assert(documentTitle)
  return escapeInject`<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        ${getFaviconTags(pageContext.globalContext.config.docpress)}
        <title>${documentTitle}</title>
        ${descriptionTag}
        <meta name="viewport" content="width=device-width,initial-scale=1">
        ${getOpenGraphTags(pageContext.urlPathname, documentTitle, pageContext.globalContext.config.docpress)}
        ${getAlgoliaTags(pageContext)}
      </head>
      <body>
        <div id="page-view">${dangerouslySkipEscape(pageHtml)}</div>
      </body>
    </html>`
}

function getAlgoliaTags(pageContext: PageContextServer) {
  const activeCategory = getActiveCategory(pageContext)
  const categoryNameTag = escapeInject`<meta name="algolia:category" content="${activeCategory.name}">`
  if (activeCategory.hide) {
    return escapeInject`${categoryNameTag}<meta name="algolia:category:hide"> `
  } else {
    return escapeInject`${categoryNameTag}<meta name="algolia:category:order" content="${activeCategory.order.toString()}"> `
  }
}
type ActiveCategory = {
  name: string
  order: number
  hide?: boolean
}
function getActiveCategory(pageContext: PageContextServer) {
  const config = pageContext.globalContext.config.docpress
  const { activeCategoryName } = pageContext.resolved

  const activeCategory: ActiveCategory = config.categories
    // normalize
    ?.map((c, i) => ({
      order: i,
      ...(typeof c === 'string' ? { name: c } : c),
    }))
    .find((c) => c.name === activeCategoryName) ?? {
    name: activeCategoryName,
    order: 99999999999,
  }

  return activeCategory
}

function getOpenGraphTags(url: string, documentTitle: string, config: Config) {
  const { tagline, url: websiteUrl, twitter, banner } = config
  assert(url.startsWith('/'))
  assertUsage(!twitter || twitter.startsWith('@'), `twitter handle must start with @`)

  const metaBanner = !banner
    ? ''
    : escapeInject`
    <meta property="og:image" content="${banner}">
    <meta name="twitter:card" content="summary_large_image">
  `
  const metaTwitter = !twitter
    ? ''
    : escapeInject`
    <meta name="twitter:site" content="${twitter}">
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

// Resources:
// - https://www.google.com/s2/favicons?domain=vike.dev
// - https://stackoverflow.com/questions/59568586/favicon-don%c2%b4t-show-up-in-google-search-result/59577456#59577456
// - https://stackoverflow.com/questions/76123025/attach-google-search-specific-favicon-to-html
// - https://developers.google.com/search/docs/appearance/favicon-in-search
//
// Examples:
// - Nice looking on Goolge Search Results:
//   https://www.wikipedia.org
// - Single PNG:
//   https://rubyonrails.org
// - Favicon shown in browser is different than favicon shown in Google:
//   https://evilmartians.com
//   Shown in Google: <link rel="apple-touch-icon" href="/apple-touch-icon.png" /> or <link rel="manifest" href="/manifest.webmanifest" />
//   Shown in Browser: <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
//   https://gemini.google.com/share/8bcf76a26783
//   https://chatgpt.com/share/696930b6-4414-800d-9c55-598ac7fa1ccb
function getFaviconTags(config: Config) {
  const { faviconBrowser, faviconGoogle } = getFavicons(config)
  assert(faviconBrowser)
  const faviconTagGoogle = !faviconGoogle
    ? ''
    : escapeInject`
    <link rel="apple-touch-icon" href="${faviconGoogle}" />
    <link rel="manifest" href="/manifest.webmanifest" />
  `
  return escapeInject`
    <link rel="icon" href="${faviconBrowser}" type="image/svg+xml" />
    ${faviconTagGoogle}
  `
}
function getFavicons(config: Config) {
  let faviconBrowser: string
  let faviconGoogle: null | string = null
  if (!config.favicon) {
    faviconBrowser = config.logo
  } else if (typeof config.favicon === 'string') {
    faviconBrowser = config.favicon
  } else {
    faviconBrowser = config.favicon.browser
    faviconGoogle = config.favicon.google
  }
  return { faviconBrowser, faviconGoogle }
}
