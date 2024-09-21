export { installSectionUrlHashs }

import { assert } from './utils/client'

function installSectionUrlHashs() {
  const pageContainer = document.querySelector('.doc-page .page-container')
  if (!pageContainer) {
    assert(window.location.pathname === '/')
    return
  }
  const headings = [...Array.from(document.querySelectorAll('h2')), ...Array.from(document.querySelectorAll('h3'))]
  headings.forEach((heading) => {
    if (!heading.id) return
    const urlHash = '#' + heading.id
    assertNavLink(urlHash, heading)
    heading.onclick = () => {
      window.location.hash = urlHash
      // The browser doesn't jump if hash doesn't change
      jumpToSection()
    }
  })

  /* Let browser restore previous scroll
  jumpToSection()
  */
}

function assertNavLink(urlHash: string, heading: HTMLHeadingElement) {
  const navigationEl = document.querySelector('#navigation-body')!
  {
    const { pathname } = window.location
    const parentNavLinkMatch = Array.from(navigationEl.querySelectorAll(`a[href="${pathname}"]`))
    assert(parentNavLinkMatch.length === 1)
  }
  {
    const navLinks: HTMLElement[] = Array.from(navigationEl.querySelectorAll(`a[href="${urlHash}"]`))
    const { tagName } = heading
    assert(tagName.startsWith('H'))
    const lengthExpected = tagName === 'H2' ? 1 : 0
    assert(navLinks.length === lengthExpected, { urlHash })
  }
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
