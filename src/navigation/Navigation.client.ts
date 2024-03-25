import { initNavigationFullscreen } from './navigation-fullscreen/initNavigationFullscreen'

// Fullscreen navigation
initNavigationFullscreen()

// Right click navigation header => show /press
presskitNavigationHeaderRightClickInterceptor()

// Mobile navigation toggle
activateMobileShowNavigationToggle()
activateMobileNavigationMask()
autoHideNavigationOverlayOnLinkClick()



function activateMobileShowNavigationToggle() {
  const toggle = document.getElementById('mobile-show-navigation-toggle')!
  toggle.onclick = onMobileShowNavigationToggle
}
function activateMobileNavigationMask() {
  const navigationMask = document.getElementById('navigation-mask')!
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

function presskitNavigationHeaderRightClickInterceptor() {
  const navHeader = document.getElementById('navigation-header')!
  if (!navHeader.classList.contains('press-kit')) return
  if (window.location.pathname === '/press') return
  navHeader.oncontextmenu = (ev) => {
    ev.preventDefault()
    window.location.href = '/press'
  }
}
