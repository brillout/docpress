export { determineNavItemsColumnLayout }

// A CSS-only solution doesn't seem to exist.
// - https://github.com/brillout/docpress/blob/2e41d8b9df098ff8312b02f7e9d41a202548e2b9/src/renderer/getStyleColumnLayout.ts#L4-L26

import type { NavItem } from './NavItemComponent.js'
import { assert } from './utils/assert.js'

function determineNavItemsColumnLayout(navItems: NavItem[]): undefined {
  const columnLayouts = getColumnEntries(navItems)
  columnLayouts.forEach((columnEntries) => {
    for (let numberOfColumns = columnEntries.length; numberOfColumns >= 1; numberOfColumns--) {
      const columnMapping = determineColumnLayout(
        columnEntries.map((columnEntry) => columnEntry.numberOfEntries),
        numberOfColumns,
      )
      columnEntries.forEach((columnEntry, i) => {
        columnEntry.navItemLeader.isPotentialColumn ??= {}
        const mapping = columnMapping[i]
        if (mapping !== undefined) {
          columnEntry.navItemLeader.isPotentialColumn[numberOfColumns] = mapping
        }
      })
    }
  })
}

function getColumnEntries(navItems: NavItem[]) {
  type NavItemWithLength = NavItem & { numberOfHeadings: number | null }
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

  type ColumnEntry = { navItemLeader: NavItem; numberOfEntries: number }
  const columnLayouts: ColumnEntry[][] = []
  let columnEntries: ColumnEntry[] = []
  let isFullWidthCategory: boolean | undefined
  navItemsWithLength.forEach((navItem, i) => {
    let isFullWidthCategoryBegin = false
    if (navItem.level === 1) {
      const isFullWidthCategoryPrevious = isFullWidthCategory
      isFullWidthCategory = !!navItem.menuModalFullWidth
      if (isFullWidthCategory) isFullWidthCategoryBegin = true
      if (
        isFullWidthCategoryPrevious !== undefined &&
        (isFullWidthCategoryPrevious !== isFullWidthCategory || (isFullWidthCategory && columnEntries.length > 0))
      ) {
        columnLayouts.push(columnEntries)
        columnEntries = []
      }
    }
    const navItemPrevious = navItemsWithLength[i - 1]
    const navItemNext = navItemsWithLength[i + 1]
    const navItemOriginal = navItems[i]
    if (
      !isFullWidthCategory
        ? navItem.level === 1
        : (navItem.level === 4 && navItemPrevious!.level !== 1) || isFullWidthCategoryBegin
    ) {
      if (isFullWidthCategory) {
        assert(navItem.level === 4 || (navItem.level === 1 && isFullWidthCategoryBegin))
      } else {
        assert(navItem.level === 1)
      }
      let { numberOfHeadings } = navItem
      assert(numberOfHeadings !== null)
      if (isFullWidthCategoryBegin) {
        assert(navItem.level === 1)
        // If followed by a level-4 heading, use its count instead
        if (navItemNext && navItemNext.level === 4) {
          assert(navItemNext.numberOfHeadings)
          numberOfHeadings = navItemNext.numberOfHeadings
        }
      }
      if (navItemOriginal) {
        columnEntries.push({ navItemLeader: navItemOriginal, numberOfEntries: numberOfHeadings })
      }
    }
  })
  assert(columnEntries!)
  columnLayouts.push(columnEntries)
  return columnLayouts
}

function determineColumnLayout(columnsUnmerged: number[], numberOfColumns: number): number[] {
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
    if (!column1 || !column2) continue
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
