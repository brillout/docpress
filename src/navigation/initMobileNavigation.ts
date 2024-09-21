export { initMobileNavigation }

hideNavigationOnLinkClick()

function initMobileNavigation() {
  activateMobileShowNavigationToggle()
  activateMobileNavigationMask()
}

function activateMobileShowNavigationToggle() {
  const toggle = document.getElementById('mobile-show-navigation-toggle')!
  toggle.onclick = toggleNavigation
}
function activateMobileNavigationMask() {
  const navigationMask = document.getElementById('mobile-navigation-mask')!
  navigationMask.onclick = toggleNavigation
}

function hideNavigationOnLinkClick() {
  document.addEventListener('click', (ev) => {
    const linkTag = findLinkTag(ev.target as HTMLElement)
    if (!linkTag) return
    hideNavigation()
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

function toggleNavigation() {
  document.body.classList.toggle('mobile-show-navigation')
}
function hideNavigation() {
  document.body.classList.remove('mobile-show-navigation')
}
