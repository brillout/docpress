export { getCSSForResponsiveFullcreenNavItems }

import assert from 'assert'
import { type NavItemGrouped } from '../navigation/Navigation'

function getCSSForResponsiveFullcreenNavItems(navItemsGrouped: NavItemGrouped[]) {
  const columnWidthMin = 300
  const columnWidthMax = 350
  const columnsUnmerged = navItemsGrouped.map((navItem) => navItem.navItemChilds.length)
  let CSS = '\n'
  for (let numberOfColumns = navItemsGrouped.length; numberOfColumns >= 1; numberOfColumns--) {
    let CSS_block: string[] = []
    CSS_block.push(
      ...[
        //
        `  html.navigation-fullscreen #navigation-content-main {`,
        `    max-width: ${columnWidthMax * numberOfColumns}px;`,
        `    grid-template-columns: repeat(${numberOfColumns}, auto);`,
        `  }`,
      ],
    )
    const columnsIdMap = determineColumns(columnsUnmerged, numberOfColumns)
    columnsIdMap.forEach((columnGroupedId, columnUngroupedId) => {
      CSS_block.push(
        ...[
          //
          `  .nav-items-group:nth-child(${columnUngroupedId + 1}) {`,
          `    grid-column: ${columnGroupedId + 1};`,
          `  }`,
        ],
      )
    })
    const noMediaQuery = numberOfColumns === navItemsGrouped.length
    if (!noMediaQuery) {
      const maxWidth = (numberOfColumns + 1) * columnWidthMin - 1
      CSS_block = [
        //
        `@media screen and (max-width: ${maxWidth}px) {`,
        ...CSS_block,
        `}`,
      ]
    }
    CSS += CSS_block.join('\n') + '\n'
  }
  return CSS
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
