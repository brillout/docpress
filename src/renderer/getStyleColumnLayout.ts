export { getStyleColumnLayout }
export { determineColumnLayoutEntries }

// A CSS-only solution doesn't seem to exist.
// - The CSS Column Layout (`column-count`) solution down below is hackish and not finished.
//   - Maybe it doesn't even work in Safari.
// - Cannot use flexbox.
//   - We cannot control wrapping:
//     - https://stackoverflow.com/questions/45862033/forcing-a-wrap-on-column-flex-box-layout
//     - https://stackoverflow.com/questions/45337454/make-flex-items-wrap-to-create-a-new-column
//     - https://stackoverflow.com/questions/27119691/how-to-start-a-new-column-in-flex-column-wrap-layout
//     - https://stackoverflow.com/questions/55742578/force-flexbox-to-wrap-after-specific-item-direction-column
//     - https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Mastering_wrapping_of_flex_items
// - Cannot use grid layout.
//   - Cannot use single row, as two elements cannot be put in the same cell:
//     - https://stackoverflow.com/questions/45264354/is-it-possible-to-place-more-than-one-element-into-a-css-grid-cell-without-overl/49047281#49047281
//   - Trying with mutliple rows seems to be messy(/impractical?) given the table nature of CSS grid.
//     - https://stackoverflow.com/questions/45791809/different-height-of-css-grid-cells
// - Couln't make it work with CSS `float`.
//   - https://jsfiddle.net/brillout/3hrLk4am/5/
// - Misc:
//   - https://stackoverflow.com/questions/9683425/css-column-count-not-respected
//   - https://stackoverflow.com/questions/25446921/get-flexbox-column-wrap-to-use-full-width-and-minimize-height
//   - https://stackoverflow.com/questions/74873283/how-to-create-a-css-grid-with-3-columns-having-column-flow
//   - https://stackoverflow.com/questions/50693793/3-columns-grid-top-to-bottom-using-grid-css
//   - https://stackoverflow.com/questions/9119347/html-css-vertical-flow-layout-columnar-style-how-to-implement

import { type NavItemAll } from '../navigation/Navigation'
import { css } from '../utils/css'
import { assert, assertUsage, isBrowser } from '../utils/server'
assert(!isBrowser())
const columnWidthMin = 300
const columnWidthMax = 350

type NavItemWithLength = NavItemAll & { numberOfHeadings: number | null }
function determineColumnLayoutEntries(navItems: NavItemAll[]): { columnLayouts: number[][] } {
  const navItemsWithLength: NavItemWithLength[] = navItems.map((navItem) => ({
    ...navItem,
    numberOfHeadings: navItem.level === 1 || navItem.level === 4 ? 0 : null,
  }))
  let navItemLevel1: NavItemWithLength | undefined
  let navItemLevel4: NavItemWithLength | undefined
  navItemsWithLength.forEach((navItem) => {
    if (navItem.level === 1) {
      navItemLevel1 = navItem
      navItemLevel4 = undefined
      return
    }
    if (navItem.level === 4) {
      navItemLevel4 = navItem
      return
    }
    const bumpNavItemLength = (navItem: NavItemWithLength) => {
      assert(navItem.numberOfHeadings !== null)
      navItem.numberOfHeadings++
    }
    assert(navItemLevel1)
    bumpNavItemLength(navItemLevel1)
    if (navItemLevel4) {
      bumpNavItemLength(navItemLevel4)
    }
  })

  const columnLayouts: number[][] = []
  let columns: number[] = []
  let isFullWidth: boolean | undefined
  navItemsWithLength.forEach((navItem, i) => {
    let isFullWidthBegin = false
    if (navItem.level === 1) {
      const isFullWidthPrevious = isFullWidth
      isFullWidth = !!navItem.menuModalFullWidth
      if (isFullWidth) isFullWidthBegin = true
      if (isFullWidthPrevious !== undefined && isFullWidthPrevious !== isFullWidth) {
        columnLayouts.push(columns)
        columns = []
      }
    }
    const navItemPrevious = navItemsWithLength[i - 1]
    const navItemNext = navItemsWithLength[i + 1]
    if (
      !isFullWidth ? navItem.level === 1 : (navItem.level === 4 && navItemPrevious!.level !== 1) || isFullWidthBegin
    ) {
      if (isFullWidth) {
        assert(navItem.level === 4 || (navItem.level === 1 && isFullWidthBegin))
      } else {
        assert(navItem.level === 1)
      }
      let { numberOfHeadings } = navItem
      assert(numberOfHeadings !== null)
      if (isFullWidthBegin) {
        assert(navItem.level === 1)
        assertUsage(
          navItemNext && navItemNext.level === 4,
          // We can lift this requirement, but it isn't trivial to implement.
          'level-1 headings with menuModalFullWidth need to be followed by a level-4 heading',
        )
        assert(navItemNext.numberOfHeadings)
        numberOfHeadings = navItemNext.numberOfHeadings
      }
      columns.push(numberOfHeadings)
      navItems[i].isColumnLayoutElement = true
    }
  })
  columnLayouts.push(columns)

  return { columnLayouts }
}

function getStyleColumnLayout(columnLayouts: number[][]): string {
  let style =
    '\n' +
    css`
.column-layout-entry {
  break-before: avoid;
}
`
  style += '\n'
  columnLayouts.forEach((columns, i) => {
    for (let numberOfColumns = columns.length; numberOfColumns >= 1; numberOfColumns--) {
      let styleGivenNumberOfColumns: string[] = []
      styleGivenNumberOfColumns.push(
        css`
.column-layout-${i} {
  column-count: ${numberOfColumns};
  max-width: min(100%, ${columnWidthMax * numberOfColumns}px);
}
`,
      )
      const columnsIdMap = determineColumns(columns, numberOfColumns)
      const columnBreakPoints = determineColumnBreakPoints(columnsIdMap)
      columnBreakPoints.forEach((columnBreakPoint, j) => {
        const columnBreakPointAfter = columnBreakPoints[j + 1] ?? false
        if (!columnBreakPoint && !columnBreakPointAfter) return
        // - `break-before: column` isn't supported by Firefox
        // - `margin-bottom: 100%` trick only works in Firefox.
        //   - TODO: apply `margin-bottom: 100%;` only for firefox as it breaks the layout in Chrome
        styleGivenNumberOfColumns.push(
          css`
.column-layout-${i} .column-layout-entry:nth-child(${j + 1}) {
  ${!columnBreakPoint ? '' : 'break-before: column; padding-top: 36px;'}
  ${!columnBreakPointAfter || /* TODO */ true ? '' : 'margin-bottom: 100%;'}
}
`,
        )
      })
      {
        assert(styleGivenNumberOfColumns.length > 0)
        const getMaxWidth = (columns: number) => (columns + 1) * columnWidthMin - 1
        const isFirst = numberOfColumns === 1
        const isLast = numberOfColumns === columns.length
        const query = [
          !isFirst && `(min-width: ${getMaxWidth(numberOfColumns - 1) + 1}px)`,
          !isLast && `(max-width: ${getMaxWidth(numberOfColumns)}px)`,
        ]
          .filter(Boolean)
          .join(' and ')
        if (query) {
          styleGivenNumberOfColumns = [`@container ${query} {`, ...styleGivenNumberOfColumns, `}`]
        }
      }
      style += styleGivenNumberOfColumns.join('\n') + '\n'
    }
  })
  return style
}

function determineColumnBreakPoints(columnsIdMap: number[]): boolean[] {
  assert(columnsIdMap[0] === 0)
  let columnGroupedIdBefore = 0
  const columnBreakPoints = columnsIdMap.map((columnGroupedId) => {
    assert(
      [
        //
        columnGroupedIdBefore,
        columnGroupedIdBefore + 1,
      ].includes(columnGroupedId),
    )
    const val = columnGroupedId !== columnGroupedIdBefore
    columnGroupedIdBefore = columnGroupedId
    return val
  })
  return columnBreakPoints
}

function determineColumns(columnsUnmerged: number[], numberOfColumns: number): number[] {
  assert(numberOfColumns <= columnsUnmerged.length)
  const columnsMergingInit: ColumnMerging[] = columnsUnmerged.map((columnHeight, i) => ({
    columnIdsMerged: [i],
    heightTotal: columnHeight,
  }))
  const columnsMerged = mergeColumns(columnsMergingInit, numberOfColumns)
  const columnsIdMap: number[] = new Array(columnsUnmerged.length)
  assert(columnsMerged.length === numberOfColumns)
  columnsMerged.forEach((columnMerged, columnMergedId) => {
    columnMerged.columnIdsMerged.forEach((columnId) => {
      columnsIdMap[columnId] = columnMergedId
    })
  })
  assert(columnsIdMap.length === columnsUnmerged.length)

  return columnsIdMap
}
type ColumnMerging = { columnIdsMerged: number[]; heightTotal: number }
function mergeColumns(columnsMerging: ColumnMerging[], numberOfColumns: number): ColumnMerging[] {
  if (columnsMerging.length <= numberOfColumns) return columnsMerging

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
  return mergeColumns(columnsMergingMod, numberOfColumns)
}
