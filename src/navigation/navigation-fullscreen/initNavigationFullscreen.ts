export { initNavigationFullscreen }
export { initNavigationFullscreenOnce }
export { hideNavigationFullScreen }

import { assert } from '../../utils/client'

let scrollPositionBeforeToggle: number

function initNavigationFullscreenOnce() {
  scrollPositionBeforeToggle = 0 // Initial scroll of fullscreen navigation is 0
  initKeyBindings()
}
function initKeyBindings() {
  document.addEventListener(
    // We don't use keydown to not interfere with user pressing `<Esc>` for closing the browser's `<Ctrl-F>` search diablog, see https://stackoverflow.com/questions/66595035/how-to-detect-escape-key-if-search-bar-of-browser-is-open
    'keydown',
    (ev) => {
      if (document.body.classList.contains('DocSearch--active')) return
      if (ev.key === 'Escape') toggleNavExpend()
    },
    false,
  )
  initTopNavigation()
}
function initNavigationFullscreen() {
  document.getElementById('navigation-fullscreen-button')!.onclick = toggleNavExpend
  document.getElementById('navigation-fullscreen-close')!.onclick = toggleNavExpend
}

function toggleNavExpend() {
  assert(scrollPositionBeforeToggle !== undefined)
  const navContainer = document.getElementById('navigation-container')!
  const scrollPos = navContainer.scrollTop
  document.documentElement.classList.toggle('navigation-fullscreen')
  navContainer.scrollTop = scrollPositionBeforeToggle
  scrollPositionBeforeToggle = scrollPos
}
function hideNavigationFullScreen() {
  if (!document.documentElement.classList.contains('navigation-fullscreen')) return
  toggleNavExpend()
}

function determineColumns(columnsUnmerged: number[], maxNumberOfColumns: number): number[] {
  const columnsMergingInit: ColumnMerging[] = columnsUnmerged.map((i, columnHeight) => ({
    columnIdsMerged: [i],
    heightTotal: columnHeight,
  }))
  const columnsMerged = mergeColumnsTODO(columnsMergingInit, maxNumberOfColumns)
  const columnsIdMap: number[] = new Array(columnsUnmerged.length)
  columnsMerged.forEach((columnMerged, columnMergedId) => {
    columnMerged.columnIdsMerged.forEach((i, columnId) => {
      columnsIdMap[columnId] = columnMergedId
    })
  })
  return columnsIdMap
}
type ColumnMerging = { columnIdsMerged: number[]; heightTotal: number }
function mergeColumnsTODO(columnsMerging: ColumnMerging[], maxNumberOfColumns: number): ColumnMerging[] {
  if (columnsMerging.length < maxNumberOfColumns) return columnsMerging

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
  const columnMergingMod = [...columnsMerging.slice(0, i), mergeCandidate, ...columnsMerging.slice(i + 2)]

  assert(columnMergingMod.length === columnsMerging.length - 1)
  mergeColumnsTODO(columnMergingMod, maxNumberOfColumns)

  return columnsMerging
}

function initTopNavigation() {
  document.addEventListener('click', (ev) => {
    const linkTag = findLinkTag(ev.target as HTMLElement)
    if (!linkTag) return
    if (linkTag.id !== 'doclink') return
    toggleNavExpend()
  })
}
function findLinkTag(target: HTMLElement): null | HTMLElement {
  while (target.tagName !== 'A') {
    const { parentNode } = target
    if (!parentNode) {
      return null
    }
    target = parentNode as HTMLElement
  }
  return target
}
