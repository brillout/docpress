export { getStyleColumnLayout }
export { determineColumnLayoutEntries }

// There doens't seem to be as simpler way to have a column layout that uses the whole width real estate.
// - https://stackoverflow.com/questions/9683425/css-column-count-not-respected
// - https://stackoverflow.com/questions/25446921/get-flexbox-column-wrap-to-use-full-width-and-minimize-height
// - https://stackoverflow.com/questions/74873283/how-to-create-a-css-grid-with-3-columns-having-column-flow
// - https://stackoverflow.com/questions/50693793/3-columns-grid-top-to-bottom-using-grid-css
// - https://stackoverflow.com/questions/9119347/html-css-vertical-flow-layout-columnar-style-how-to-implement
// - https://stackoverflow.com/questions/27119691/how-to-start-a-new-column-in-flex-column-wrap-layout
// - https://stackoverflow.com/questions/45264354/is-it-possible-to-place-more-than-one-element-into-a-css-grid-cell-without-overl/49047281#49047281

import { type NavItemAll } from '../navigation/Navigation'
import { css } from '../utils/css'
import { assert, isBrowser } from '../utils/server'
assert(!isBrowser())
const columnWidthMin = 300
const columnWidthMax = 350

type NavItemWithLength = NavItemAll & { numberOfHeadings: number | null }
function determineColumnLayoutEntries(navItems: NavItemAll[]) {
  const navItemsWithLength: NavItemWithLength[] = navItems.map((navItem) => ({
    ...navItem,
    numberOfHeadings: navItem.level === 1 || navItem.level === 4 ? 0 : null,
  }))
  let navItemLevel1: NavItemWithLength | undefined
  let navItemLevel4: NavItemWithLength | undefined
  navItemsWithLength.forEach((navItem) => {
    if (navItem.level === 1) {
      navItemLevel1 = navItem
      return
    }
    if (navItem.level === 4) {
      navItemLevel4 = navItem
      return
    }
    const bumpNavItemLength = (navItem: NavItemWithLength) => {
      assert(navItem.numberOfHeadings !== null && navItem.numberOfHeadings >= 0)
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
    if (
      (!isFullWidth && navItem.level === 1) ||
      (isFullWidth && navItem.level === 4 && navItemsWithLength[i - 1]!.level !== 1) ||
      isFullWidthBegin
    ) {
      assert(navItem.numberOfHeadings !== null)
      columns.push(navItem.numberOfHeadings)
      navItems[i].columnLayoutElement = true
    }
  })
  columnLayouts.push(columns)

  return { columnLayouts }
}

function getStyleColumnLayout(columnLayouts: number[][]): string {
  let style = '\n'
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
      columnBreakPoints.forEach((columnBreakPoint, columnUngroupedId) => {
        styleGivenNumberOfColumns.push(
          css`
.column-layout-${i} .column-layout-entry:nth-child(${columnUngroupedId + 1}) {
  break-before: ${columnBreakPoint ? 'column' : 'avoid'};
}
`,
        )
      })
      const noContainerQuery = numberOfColumns === columns.length
      if (!noContainerQuery) {
        const maxWidth = (numberOfColumns + 1) * columnWidthMin - 1
        styleGivenNumberOfColumns = [
          //
          `@container(max-width: ${maxWidth}px) {`,
          ...styleGivenNumberOfColumns,
          `}`,
        ]
      }
      style += styleGivenNumberOfColumns.join('\n') + '\n'
    }
  })
  return style
}

function determineColumnBreakPoints(columnsIdMap: number[]): boolean[] {
  assert(columnsIdMap[0] === 0)
  let columnGroupedIdBefore = -1
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
