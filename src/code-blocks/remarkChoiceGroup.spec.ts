import { describe, it, expect } from 'vitest'
import type { Root } from 'mdast'
import type { MdxJsxAttribute, MdxJsxFlowElement } from 'mdast-util-mdx-jsx'
import type { VFile } from '@mdx-js/mdx/internal-create-format-aware-processors'
import { visit } from 'unist-util-visit'
import type { ChoiceGroup } from './types.js'
import { remarkChoiceGroup } from './remarkChoiceGroup.js'

// A minimal built-in choice group, as produced by `generateChoiceGroupCode()` for an auto-generated
// JS/TS toggle (e.g. a type-annotated `ts` block turned into a toggle by `remarkDetype`).
const choiceGroup: ChoiceGroup = {
  name: 'codeLang',
  choices: [
    { name: 'JavaScript', icon: 'https://example.com/js.svg' },
    { name: 'TypeScript', icon: 'https://example.com/ts.svg' },
  ],
  default: 'JavaScript',
  emptyChoices: [],
  hidden: false,
  lvl: 0,
  isBuiltIn: true,
}

function customSelectsContainer(): MdxJsxFlowElement {
  return {
    type: 'mdxJsxFlowElement',
    name: 'CustomSelectsContainer',
    attributes: [],
    children: [
      {
        type: 'mdxJsxFlowElement',
        name: 'ChoiceGroup',
        attributes: [],
        children: [],
        data: { customDataChoiceGroup: choiceGroup },
      },
    ],
  }
}

function jsxElement(name: string, children: MdxJsxFlowElement[]): MdxJsxFlowElement {
  return { type: 'mdxJsxFlowElement', name, attributes: [], children }
}

async function runPlugin(tree: Root) {
  // `remarkChoiceGroup` is typed as a unified `Plugin` (its signature expects a `Processor` `this`), but it
  // ignores `this` at runtime, so we call it as a plain function. `file` is only read while transforming
  // `code` nodes (there are none in these trees), so a stub is fine.
  const transform = (remarkChoiceGroup as () => (tree: Root, file: VFile) => Promise<void>)()
  await transform(tree, { path: 'test.mdx' } as VFile)
}

function findContainer(tree: Root): MdxJsxFlowElement | undefined {
  let container: MdxJsxFlowElement | undefined
  visit(tree, 'mdxJsxFlowElement', (node) => {
    if (node.name === 'CustomSelectsContainer') {
      container = node
      return false
    }
  })
  return container
}

function hasChoiceGroupAll(container: MdxJsxFlowElement | undefined) {
  return !!container?.attributes.some(
    (attr): attr is MdxJsxAttribute => attr.type === 'mdxJsxAttribute' && attr.name === 'choiceGroupAll',
  )
}

describe('remarkChoiceGroup: inject `choiceGroupAll`', () => {
  it('injects `choiceGroupAll` on a top-level `CustomSelectsContainer`', async () => {
    const tree: Root = { type: 'root', children: [customSelectsContainer()] }

    await runPlugin(tree)

    expect(hasChoiceGroupAll(findContainer(tree))).toBe(true)
  })

  it('injects `choiceGroupAll` on a `CustomSelectsContainer` nested inside another JSX element', async () => {
    // Regression test: a JS/TS (or `npm`) toggle nested in react-tabs `<Tabs>`/`<TabPanel>` (or a `<div>`).
    // The final `visit()` pass must descend into non-container JSX elements to reach the nested container;
    // otherwise `choiceGroupAll` stays `undefined` and `ChoiceGroup` crashes during SSR/pre-render.
    const tree: Root = {
      type: 'root',
      children: [jsxElement('Tabs', [jsxElement('TabPanel', [customSelectsContainer()])])],
    }

    await runPlugin(tree)

    expect(hasChoiceGroupAll(findContainer(tree))).toBe(true)
  })
})
