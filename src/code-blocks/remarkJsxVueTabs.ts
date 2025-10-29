export { remarkJsxVueTabs }

import type { Root, Code } from 'mdast'
import { visit } from 'unist-util-visit'
import { generateCodeTabs } from './utils/generateCodeTabs.js'

/**
 * Remark plugin that combines adjacent TSX/JSX and Vue code blocks into tabbed code blocks.
 *
 * Replaces a TSX/JSX block immediately followed by a Vue block with a single
 * <CodeTabs> component containing <CodeTabPanel> children for each language.
 */
function remarkJsxVueTabs() {
  return function (tree: Root) {
    visit(tree, 'code', (node, index, parent) => {
      if (!parent || typeof index === 'undefined') return
      const nextNode = parent.children[index + 1]
      // Skip if this isn't TSX or has no next node after it
      if (!['jsx', 'tsx'].includes(node.lang || '') || !nextNode) return
      if (nextNode.type === 'code' && nextNode.lang === 'vue') {
        const jsxCode = node
        const vueCode = nextNode

        const tabs = [
          { value: 'jsx', code: jsxCode },
          { value: 'vue', code: vueCode },
        ]
        const codeTabs = generateCodeTabs(tabs, 'jsx', 'jsx-or-vue')
        parent.children.splice(index, 2, codeTabs)
      }
    })
  }
}
