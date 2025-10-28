export { installSectionUrlHashs }

import { assert } from './utils/client'

// TO-DO/eventually: use React instead of manually installing click handlers?
function installSectionUrlHashs() {
  {
    const isLandingPage = window.location.pathname === '/'
    const isDocPage = !!document.querySelector('.doc-page')
    assert(isLandingPage !== isDocPage)
    if (!isDocPage) return
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
  const navigationContainerEl = document.querySelector('#nav-left')
  if (!navigationContainerEl) return
  const navigationEl = navigationContainerEl.querySelector('.navigation-content')!
  {
    const { pathname } = window.location
    const parentNavLinkMatch = Array.from(navigationEl.querySelectorAll(`a[href="${pathname}"]`))
    assert(parentNavLinkMatch.length === 1, { parentNavLinkMatch, pathname })
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
