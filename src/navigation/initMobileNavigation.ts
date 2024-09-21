export { initMobileNavigation }
export { hideMobileNavigation }

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

function toggleNavigation() {
  document.body.classList.toggle('mobile-show-navigation')
}
function hideMobileNavigation() {
  document.body.classList.remove('mobile-show-navigation')
}
