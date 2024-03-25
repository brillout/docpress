export { initMobileNavigation }

function initMobileNavigation() {
  activateMobileShowNavigationToggle()
  activateMobileNavigationMask()
  autoHideNavigationOverlayOnLinkClick()
}

function activateMobileShowNavigationToggle() {
  const toggle = document.getElementById('mobile-show-navigation-toggle')!
  toggle.onclick = toggleNavigation
}
function activateMobileNavigationMask() {
  const navigationMask = document.getElementById('mobile-navigation-mask')!
  navigationMask.onclick = toggleNavigation
}

function autoHideNavigationOverlayOnLinkClick() {
  document.addEventListener('click', (ev: any) => {
    const el = ev.target
    if (!el || !('classList' in el)) return
    if (!el.classList.contains('nav-item')) return
    hideNavigation()
  })
}

function toggleNavigation() {
  document.body.classList.toggle('mobile-show-navigation')
}
function hideNavigation() {
  document.body.classList.remove('mobile-show-navigation')
}
