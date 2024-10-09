export { onRenderHtml }

import ReactDOMServer from 'react-dom/server'
import { escapeInject, dangerouslySkipEscape } from 'vike/server'
import { assert } from '../utils/server'
import type { PageContextResolved } from '../config/resolvePageContext'
import { getPageElement } from './getPageElement'
import type { OnRenderHtmlAsync } from 'vike/types'
import { groupByLevelMin, type NavItemGrouped } from '../navigation/Navigation'

const onRenderHtml: OnRenderHtmlAsync = async (
  pageContext,
): // TODO: Why is Promise<Awaited<>> needed?
Promise<Awaited<ReturnType<OnRenderHtmlAsync>>> => {
  const pageContextResolved: PageContextResolved = (pageContext as any).pageContextResolved

  const page = getPageElement(pageContext, pageContextResolved)

  const { navItemsAll } = pageContextResolved.navigationData
  const navItemsGrouped = groupByLevelMin(navItemsAll)
  const CSSResponsiveNavItems = getCSSForResponsiveFullcreenNavItems(navItemsGrouped)

  pageContextResolved.navigationData.navItems

  const descriptionTag = pageContextResolved.isLandingPage
    ? dangerouslySkipEscape(`<meta name="description" content="${pageContextResolved.meta.tagline}" />`)
    : ''

  const pageHtml = ReactDOMServer.renderToString(page)

  return escapeInject`<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" href="${pageContextResolved.meta.faviconUrl}" />
        <title>${pageContextResolved.documentTitle}</title>
        ${descriptionTag}
        <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no" />
        ${getOpenGraphTags(pageContext.urlPathname, pageContextResolved.documentTitle, pageContextResolved.meta)}
        <style>${dangerouslySkipEscape(CSSResponsiveNavItems)}</style>
      </head>
      <body>
        <div id="page-view">${dangerouslySkipEscape(pageHtml)}</div>
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

function getCSSForResponsiveFullcreenNavItems(navItemsGrouped: NavItemGrouped[]) {
  const columnWidth = 350
  const columnsUnmerged = navItemsGrouped.map((navItem) => navItem.navItemChilds.length)
  let CSS = '\n'
  for (let numberOfColumns = navItemsGrouped.length; numberOfColumns >= 1; numberOfColumns--) {
    const width = numberOfColumns * columnWidth
    let CSS_block: string[] = []
    CSS_block.push(
      ...[
        //
        `  #navigation-content-main {`,
        `    width: ${width};`,
        `    grid-template-columns: repeat(${numberOfColumns}, ${columnWidth}px);`,
        `  }`,
      ],
    )
    const columnsIdMap = determineColumns(columnsUnmerged, numberOfColumns)
    columnsIdMap.forEach((columnGroupedId, columnUngroupedId) => {
      CSS_block.push(
        ...[
          //
          `  #nav-items-group:nth-child(${columnUngroupedId}) {`,
          `    grid-column: ${columnGroupedId};`,
          `  }`,
        ],
      )
    })
    const noMediaQuery = numberOfColumns === navItemsGrouped.length
    if (!noMediaQuery) {
      CSS_block = [
        //
        `@media screen and (max-width: ${width}px) {`,
        ...CSS_block,
        `}`,
      ]
    }
    CSS += CSS_block.join('\n') + '\n'
  }
  return CSS
}

function determineColumns(
  columnsUnmerged: number[],
  // TODO/refactor: rename to numberOfColumns
  maxNumberOfColumns: number,
): number[] {
  assert(maxNumberOfColumns <= columnsUnmerged.length)
  const columnsMergingInit: ColumnMerging[] = columnsUnmerged.map((columnHeight, i) => ({
    columnIdsMerged: [i],
    heightTotal: columnHeight,
  }))
  const columnsMerged = mergeColumns(columnsMergingInit, maxNumberOfColumns)
  const columnsIdMap: number[] = new Array(columnsUnmerged.length)
  assert(columnsMerged.length === maxNumberOfColumns)
  columnsMerged.forEach((columnMerged, columnMergedId) => {
    columnMerged.columnIdsMerged.forEach((columnId) => {
      columnsIdMap[columnId] = columnMergedId
    })
  })
  assert(columnsIdMap.length === columnsUnmerged.length)
  return columnsIdMap
}
type ColumnMerging = { columnIdsMerged: number[]; heightTotal: number }
function mergeColumns(columnsMerging: ColumnMerging[], maxNumberOfColumns: number): ColumnMerging[] {
  if (columnsMerging.length <= maxNumberOfColumns) return columnsMerging

  let mergeCandidate: null | (ColumnMerging & { i: number }) = null
  for (let i = 0; i <= columnsMerging.length - 2; i++) {
    const column1 = columnsMerging[i + 0]
    const column2 = columnsMerging[i + 1]
    const heightTotal = column1.heightTotal + column2.heightTotal
    if (!mergeCandidate || mergeCandidate.heightTotal > heightTotal) {
      mergeCandidate = {
        i,
        columnIdsMerged: [
          //
          ...column1.columnIdsMerged,
          ...column2.columnIdsMerged,
        ],
        heightTotal,
      }
    }
  }
  assert(mergeCandidate)

  const { i } = mergeCandidate
  assert(-1 < i && i < columnsMerging.length - 1)
  const columnsMergingMod = [
    //
    ...columnsMerging.slice(0, i),
    mergeCandidate,
    ...columnsMerging.slice(i + 2),
  ]

  assert(columnsMergingMod.length === columnsMerging.length - 1)
  return mergeColumns(columnsMergingMod, maxNumberOfColumns)
}
