export { initPressKit }

function initPressKit() {
  // Right click navigation header => show /press
  navigationHeaderRightClickInterceptor()
}

function navigationHeaderRightClickInterceptor() {
  const navHeader = document.getElementById('navigation-header')!
  if (!navHeader.classList.contains('press-kit')) return
  if (window.location.pathname === '/press') return
  const navHeaderImg = document.querySelector('#navigation-header-logo img') as HTMLElement
  navHeaderImg.oncontextmenu = (ev) => {
    ev.preventDefault()
    window.location.href = '/press'
  }
}
