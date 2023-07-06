import { initNavigationFullscreen } from './navigation-fullscreen/initNavigationFullscreen'

activateNavigationMask()
activateMenuToggle()
initNavigationFullscreen()
autoHideNavigationOverlayOnLinkClick()

function activateMenuToggle() {
  const menuToggle = document.getElementById('menu-toggle')!
  menuToggle.onclick = navigationOverlayToggle
}

function activateNavigationMask() {
  const navigationMask = document.getElementById('navigation-mask')!
  navigationMask.onclick = navigationOverlayToggle
}

function autoHideNavigationOverlayOnLinkClick() {
  document.addEventListener('click', (ev: any) => {
    const el = ev.target
    if (!el || !('classList' in el)) return
    if (!el.classList.contains('nav-item')) return
    navigationOverlayHide()
  })
}

function navigationOverlayToggle() {
  document.body.classList.toggle('show-menu')
}
function navigationOverlayHide() {
  document.body.classList.remove('show-menu')
}
