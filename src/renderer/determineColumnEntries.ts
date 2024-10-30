export { determineColumnEntries }

// A CSS-only solution doesn't seem to exist.
// - https://github.com/brillout/docpress/blob/2e41d8b9df098ff8312b02f7e9d41a202548e2b9/src/renderer/getStyleColumnLayout.ts#L4-L26

import { type NavItemAll } from '../navigation/Navigation'
import { assert, assertUsage, isBrowser } from '../utils/server'
assert(!isBrowser())

type NavItemWithLength = NavItemAll & { numberOfHeadings: number | null }
function determineColumnEntries(navItems: NavItemAll[]): undefined {
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

  type ColumnEntry = { navItemLeader: NavItemAll; numberOfEntries: number }
  const columnLayouts: ColumnEntry[][] = []
  let columnEntries: ColumnEntry[] = []
  let isFullWidth: boolean | undefined
  navItemsWithLength.forEach((navItem, i) => {
    let isFullWidthBegin = false
    if (navItem.level === 1) {
      const isFullWidthPrevious = isFullWidth
      isFullWidth = !!navItem.menuModalFullWidth
      if (isFullWidth) isFullWidthBegin = true
      if (isFullWidthPrevious !== undefined && isFullWidthPrevious !== isFullWidth) {
        columnLayouts.push(columnEntries)
        columnEntries = []
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
      columnEntries.push({ navItemLeader: navItems[i], numberOfEntries: numberOfHeadings })
    }
  })
  assert(columnEntries!)
  columnLayouts.push(columnEntries)

  columnLayouts.forEach((columnEntries) => {
    for (let numberOfColumns = columnEntries.length; numberOfColumns >= 1; numberOfColumns--) {
      const columnsIdMap = determineColumns(
        columnEntries.map((columnEntry) => columnEntry.numberOfEntries),
        numberOfColumns,
      )
      columnEntries.forEach((columnEntry, i) => {
        columnEntry.navItemLeader.isColumnEntry ??= {}
        columnEntry.navItemLeader.isColumnEntry[numberOfColumns] = columnsIdMap[i]
      })
    }
  })
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
