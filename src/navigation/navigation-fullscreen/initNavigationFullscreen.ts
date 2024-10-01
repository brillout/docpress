export { initNavigationFullscreen }
export { initNavigationFullscreenOnce }
export { hideNavigationFullScreen }

import { assert } from '../../utils/client'

let scrollPositionBeforeToggle: number

function initNavigationFullscreenOnce() {
  scrollPositionBeforeToggle = 0
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

  const widthAvailable = getViewportWidth()
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
function getViewportWidth(): number {
  // `window.innerWidth` inlcudes scrollbar width: https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth#usage_notes
  return document.documentElement.clientWidth
}

function mergeColumns<T>(columns: { element: T; elementHeight: number }[][], maxNumberOfColumns: number) {
  assert(columns.length > 0)
  assert(maxNumberOfColumns > 0)
  if (columns.length <= maxNumberOfColumns) {
    return columns
  }

  let mergeCandidate = {
    i: -1,
    mergeHeight: Infinity,
  }
  for (let i = 0; i <= columns.length - 2; i++) {
    const column1 = columns[i + 0]
    const column2 = columns[i + 1]
    const column1Height = sum(column1.map((c) => c.elementHeight))
    const column2Height = sum(column2.map((c) => c.elementHeight))
    const mergeHeight = column1Height + column2Height
    if (mergeCandidate.mergeHeight > mergeHeight) {
      mergeCandidate = {
        i,
        mergeHeight,
      }
    }
  }

  {
    const { i } = mergeCandidate
    assert(-1 < i && i < columns.length - 1, { i, columnsLength: columns.length, maxNumberOfColumns })
    columns[i] = [...columns[i], ...columns[i + 1]]
    columns.splice(i + 1, 1)
  }

  mergeColumns(columns, maxNumberOfColumns)
}

function sum(arr: number[]): number {
  let total = 0
  arr.forEach((n) => (total += n))
  return total
}
