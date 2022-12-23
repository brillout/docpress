import { assert } from './utils/client'

installSectionUrlHashs()
/* Let browser restore previous scroll
jumpToSection()
*/

function installSectionUrlHashs() {
  const pageContainer = document.querySelector('.doc-page #page-container')
  if (!pageContainer) {
    assert(window.location.pathname === '/')
    return
  }
  const navigationEl = document.getElementById('navigation-content')
  assert(navigationEl)
  const docSections = Array.from(document.querySelectorAll('h2'))
  docSections.forEach((docSection) => {
    if (!docSection.id) return
    const urlHash = '#' + docSection.id
    assertNavLink(navigationEl, urlHash)
    docSection.onclick = () => {
      window.location.hash = urlHash
      // The browser doesn't jump if hash doesn't change
      jumpToSection()
    }
  })
}

function assertNavLink(navigationEl: HTMLElement, urlHash: string) {
  const parentNavLinkMatch = Array.from(navigationEl.querySelectorAll(`a[href="${window.location.pathname}"]`))
  assert(parentNavLinkMatch.length <= 1)
  if (parentNavLinkMatch.length === 0) return
  const navLinks: HTMLElement[] = Array.from(navigationEl.querySelectorAll(`a[href="${urlHash}"]`))
  assert(navLinks.length === 1, { urlHash })
}

function jumpToSection() {
  const { hash } = window.location
  if (hash === '' || hash === '#') {
    return
  }
  assert(hash.startsWith('#'))
  const target = document.getElementById(hash.slice(1))
  if (!target) {
    return
  }
  target.scrollIntoView()
}
