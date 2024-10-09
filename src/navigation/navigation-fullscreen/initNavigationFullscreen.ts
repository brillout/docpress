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
  window.addEventListener('resize', updateColumnWidth, { passive: true })
  initTopNavigation()
}
function initNavigationFullscreen() {
  document.getElementById('navigation-fullscreen-button')!.onclick = toggleNavExpend
  document.getElementById('navigation-fullscreen-close')!.onclick = toggleNavExpend
  updateColumnWidth()
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

function updateColumnWidth() {
  const navMinWidth = 299
  const navH1Groups = Array.from(document.querySelectorAll('#navigation-content-main .nav-items-group'))
  const numberOfColumnsMax = navH1Groups.length

  // `window.innerWidth` inlcudes scrollbar width: https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth#usage_notes
  const widthAvailable = document.documentElement.clientWidth
  const numberOfColumns = Math.max(1, Math.min(numberOfColumnsMax, Math.floor(widthAvailable / navMinWidth)))

  let columns = navH1Groups.map((navH1Group) => {
    const column = [
      {
        element: navH1Group,
        elementHeight: navH1Group.children.length,
      },
    ]
    return column
  })

  mergeColumns(columns, numberOfColumns)

  const navContent = document.getElementById('navigation-content-main')!

  Array.from(navContent.children).forEach((child) => {
    assert(child.className === 'nav-column')
  })
  navContent.innerHTML = ''

  columns.forEach((column) => {
    const columnEl = document.createElement('div')
    columnEl.className = 'nav-column'
    column.forEach(({ element }) => {
      columnEl.appendChild(element)
    })
    navContent.appendChild(columnEl)
  })

  const navItemMaxWidth = 350
  navContent.style.maxWidth = `${numberOfColumns * navItemMaxWidth}px`
}

function mergeColumns<T>(columns: { element: T; elementHeight: number }[][], maxNumberOfColumns: number) {
  assert(columns.length > 0)
  assert(maxNumberOfColumns > 0)
  if (columns.length <= maxNumberOfColumns) {
    return columns
  }
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
