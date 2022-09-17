import { activateNavigationColumnLayout } from './navigationColumnLayout'

activateNavigationMask()
activateMenuToggle()
activateNavigationColumnLayout()

function activateMenuToggle() {
  const menuToggle = document.getElementById('menu-toggle')!
  menuToggle.onclick = toggleNavigation
}

function activateNavigationMask() {
  const navigationMask = document.getElementById('navigation-mask')!
  navigationMask.onclick = toggleNavigation
}

function toggleNavigation() {
  document.body.classList.toggle('show-menu')
}
