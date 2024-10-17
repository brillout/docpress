// TODO/refactor: rename file
// TODO/refactor: rename functions
export { toggleMenu }
export { closeMenu }

const menuModalShow = 'menu-modal-show'
function toggleMenu() {
  document.body.classList.toggle(menuModalShow)
}
function closeMenu() {
  document.body.classList.remove(menuModalShow)
}
