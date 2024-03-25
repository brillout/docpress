export { initMobileNavigation }

function initMobileNavigation() {
  activateMobileShowNavigationToggle()
  activateMobileNavigationMask()
  autoHideNavigationOverlayOnLinkClick()
}

function activateMobileShowNavigationToggle() {
  const toggle = document.getElementById('mobile-show-navigation-toggle')!
  toggle.onclick = onMobileShowNavigationToggle
}
function activateMobileNavigationMask() {
  const navigationMask = document.getElementById('mobile-navigation-mask')!
  navigationMask.onclick = onMobileShowNavigationToggle
}

function autoHideNavigationOverlayOnLinkClick() {
  document.addEventListener('click', (ev: any) => {
    const el = ev.target
    if (!el || !('classList' in el)) return
    if (!el.classList.contains('nav-item')) return
    onMobileShowNavigationHide()
  })
}

function onMobileShowNavigationToggle() {
  document.body.classList.toggle('mobile-show-navigation')
}
function onMobileShowNavigationHide() {
  document.body.classList.remove('mobile-show-navigation')
}
