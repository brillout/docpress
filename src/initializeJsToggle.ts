export const initializeJsToggle_SSR = `initializeJsToggle();${initializeJsToggle.toString()};`

function initializeJsToggle() {
  const codeLangSelected = localStorage.getItem('docpress:code-lang') ?? 'js'
  if (codeLangSelected === 'js') {
    const inputs = document.querySelectorAll('.code-lang-toggle')
    // @ts-ignore
    for (const input of inputs) input.checked = false
  }
}
