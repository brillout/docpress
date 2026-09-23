export { remarkChoiceGroup }

import type { Root } from 'mdast'
import type { Plugin, Transformer } from 'unified'
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx'
import type { ChoiceNode } from './utils/generateChoiceGroupCode.js'
import type { ChoiceGroup, ChoiceGroupWithParent, ParentChoiceGroup } from './types.js'
import { visit } from 'unist-util-visit'
import { parseMetaString } from './rehypeMetaToProps.js'
import { generateChoiceGroupCode, expressionToAttribute } from './utils/generateChoiceGroupCode.js'
import { remarkPkgManager } from './remarkPkgManager.js'
import { remarkDetype } from './remarkDetype.js'

const remarkChoiceGroup: Plugin<[], Root> = (): Transformer<Root> => {
  return async (tree, file) => {
    visit(tree, (node) => {
      if (node.type === 'code') {
        if (!node.meta) return
        const meta = parseMetaString(node.meta, ['choice'])
        const { choice } = meta.props
        node.meta = meta.rest

        if (choice) {
          const filter = ['jsx', 'tsx', 'vue'].includes(node.lang ?? '') ? 'code-component' : `code-${node.lang}`
          node.data ??= { customDataChoice: choice, customDataFilter: filter }
        }
      }
      if (node.type === 'containerDirective' && node.name === 'Choice') {
        if (!node.attributes) return
        const { id: choice } = node.attributes
        if (choice) {
          node.data ??= { customDataChoice: choice, customDataFilter: node.type }
          node.attributes = {}
        }
      }
    })

    visit(tree, (node) => {
      if (!('children' in node) || node.data?.customDataIsVisited) return 'skip'

      let start = -1
      let end = 0

      const process = () => {
        if (start === -1 || start === end) return
        const nodes = node.children.slice(start, end) as ChoiceNode['children']
        const choiceNodesFiltered = filterChoices(nodes)
        const replacements: MdxJsxFlowElement[] = []

        for (const choiceNodes of choiceNodesFiltered) {
          const replacement = generateChoiceGroupCode(choiceNodes, node)
          replacement.data ??= {}
          replacement.data.customDataIsVisited = true
          replacements.push(replacement)
        }

        node.children.splice(start, end - start, ...replacements)

        end = start
        start = -1
      }

      for (; end < node.children.length; end++) {
        const child = node.children[end]!

        if (!['code', 'containerDirective'].includes(child.type)) {
          process()
          continue
        }

        if (!child.data?.customDataChoice) {
          process()
          continue
        }

        if (start === -1) start = end
      }

      process()
    })

    await remarkDetype.call(this)(tree, file)
    remarkPkgManager.call(this)(tree, file)

    const absentChoicesAll = getAbsentChoices(tree)

    visit(tree, 'mdxJsxFlowElement', (node) => {
      const choiceGroup = node.name === 'ChoiceGroup' && node.data?.customDataChoiceGroup
      if (!choiceGroup) return
      const absentChoices = absentChoicesAll[choiceGroup.name]!
      node.attributes.push(expressionToAttribute('choiceGroup', { ...choiceGroup, absentChoices }))
    })

    visit(tree, 'mdxJsxFlowElement', (node) => {
      // Descend into non-container nodes so that a `ChoiceGroupContainer` nested inside another JSX
      // element (e.g. react-tabs `<Tabs>`/`<TabPanel>`, or a `<div>`) still gets visited and its
      // `choiceGroupAll` attribute injected. (Returning 'skip' here would stop the descent.)
      if (node.name !== 'ChoiceGroupContainer') return

      const choiceGroupAll: ChoiceGroupWithParent[] = []

      visit(node, 'mdxJsxFlowElement', (child) => {
        // A nested container renders its own dropdowns: e.g. a code block inside a choice of a hidden group (a
        // `:::Choice` toggled by `<Tabs>`), or inside a blockquote. Don't collect its groups here — it gets its own
        // `choiceGroupAll` attribute when the outer traversal reaches it.
        if (child !== node && child.name === 'ChoiceGroupContainer') return 'skip'
        if (child.name !== 'ChoiceGroup') return

        const choiceGroup = child.data?.customDataChoiceGroup
        const parentChoiceGroup = child.data?.customDataParentChoiceGroup

        if (!choiceGroup) return

        const existing = choiceGroupAll.find((g) => g.name === choiceGroup.name)

        // first occurrence
        if (!existing) {
          choiceGroupAll.push({
            ...choiceGroup,
            absentChoices: absentChoicesAll[choiceGroup.name]!,
            ...(parentChoiceGroup && {
              parentChoiceGroup: {
                name: parentChoiceGroup.name,
                default: parentChoiceGroup.default,
                choices: !choiceGroup.hidden ? [parentChoiceGroup.choice] : [],
                absentChoices: absentChoicesAll[parentChoiceGroup.name]!,
              },
            }),
          })

          return
        }

        // merge parent choices
        if (parentChoiceGroup && existing.parentChoiceGroup && !choiceGroup.hidden) {
          existing.parentChoiceGroup.choices = [
            ...new Set([...existing.parentChoiceGroup.choices, parentChoiceGroup.choice]),
          ]
        }
      })

      node.attributes.push(expressionToAttribute('choiceGroupAll', choiceGroupAll))

      // Don't return 'skip': nested containers need their own `choiceGroupAll` attribute.
    })
  }
}

// The choices that no group of the page has content for. A choice is displayed by all groups of the page, including
// the groups that don't have content for it (they then display nothing): only a choice absent from the page falls back
// to another choice, see getAvailableChoice().
function getAbsentChoices(tree: Root) {
  const absentChoicesAll: Record<string, string[]> = {}
  visit(tree, 'mdxJsxFlowElement', (node) => {
    const choiceGroup = node.name === 'ChoiceGroup' && node.data?.customDataChoiceGroup
    if (!choiceGroup) return
    const { name, emptyChoices } = choiceGroup
    absentChoicesAll[name] = (absentChoicesAll[name] ?? emptyChoices).filter((choice) => emptyChoices.includes(choice))
  })
  return absentChoicesAll
}

function filterChoices(nodes: ChoiceNode['children']) {
  const filteredChoices = new Set<ChoiceNode[]>()
  const filters = [...new Set(nodes.flat().map((node) => node.data!.customDataFilter!))]

  filters.map((filter) => {
    const nodesByChoice = new Map<string, ChoiceNode['children']>()
    nodes
      .filter((node) => node.data!.customDataFilter! === filter)
      .map((node) => {
        const choice = node.data!.customDataChoice!
        const nodes = nodesByChoice.get(choice) ?? []
        nodes.push(node)
        nodesByChoice.set(choice, nodes)
      })

    const choiceNodes = [...nodesByChoice].map(([name, nodes]) => ({ choiceValue: name, children: nodes }))
    filteredChoices.add(choiceNodes)
  })

  return [...filteredChoices]
}

declare module 'mdast' {
  export interface Data {
    customDataIsVisited?: boolean
    customDataChoice?: string
    customDataFilter?: string
    customDataChoiceGroup?: Omit<ChoiceGroup, 'absentChoices'>
    customDataParentChoiceGroup?: Omit<ParentChoiceGroup, 'absentChoices'> & {
      choice: string
      lvl: number
    }
  }
}
