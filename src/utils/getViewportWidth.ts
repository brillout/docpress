export function getViewportWidth(): number {
  // `window.innerWidth` inlcudes scrollbar width: https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth#usage_notes
  return document.documentElement.clientWidth
}
