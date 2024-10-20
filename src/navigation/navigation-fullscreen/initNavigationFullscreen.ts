// TODO/refactor: rename file
// TODO/refactor: rename functions
export { toggleMenu }
export { closeMenu }

const menuModalShow = 'menu-modal-show'
function toggleMenu() {
  document.documentElement.classList.toggle(menuModalShow)
}
function closeMenu() {
  document.documentElement.classList.remove(menuModalShow)
}
