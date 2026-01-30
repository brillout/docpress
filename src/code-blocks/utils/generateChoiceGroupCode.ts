export { generateChoiceGroupCode }
export type { ChoiceNode }

import type { BlockContent, DefinitionContent, Parent } from 'mdast'
import type { MdxJsxAttribute, MdxJsxFlowElement } from 'mdast-util-mdx-jsx'

type ChoiceNode = {
  choiceValue: string
  children: (BlockContent | DefinitionContent)[]
}

function generateChoiceGroupCode(choiceNodes: ChoiceNode[], parent?: Parent): MdxJsxFlowElement {
  const attributes: MdxJsxAttribute[] = []
  const children: MdxJsxFlowElement[] = []

  const elements = choiceNodes.map((choiceNode) => ({
    type: 'Literal',
    value: choiceNode.choiceValue,
  }))

  attributes.push({
    type: 'mdxJsxAttribute',
    name: 'choices',
    value: {
      type: 'mdxJsxAttributeValueExpression',
      value: '',
      data: {
        estree: {
          type: 'Program',
          sourceType: 'module',
          comments: [],
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'ArrayExpression',
                // @ts-ignore: Missing properties in type definition
                elements,
              },
            },
          ],
        },
      },
    },
  })

  let initLvl: number

  switch (parent?.type) {
    case 'root':
      initLvl = 0
      break
    case 'mdxJsxFlowElement':
      initLvl = 1
      break

    default:
      initLvl = 0
      break
  }

  attributes.push({ type: 'mdxJsxAttribute', name: 'lvl', value: `${initLvl}` })

  for (const choiceNode of choiceNodes) {
    const choiceChildren: (BlockContent | DefinitionContent)[] = []
    if (choiceNode.children.every((node) => node.type === 'containerDirective')) {
      choiceChildren.push(...choiceNode.children.flatMap((node) => [...node.children]))
    } else {
      choiceChildren.push(...choiceNode.children)
    }
    for (const child of choiceChildren) increaseLvl(child)

    children.push({
      type: 'mdxJsxFlowElement',
      name: 'div',
      attributes: [
        { type: 'mdxJsxAttribute', name: 'data-choice-value', value: choiceNode.choiceValue },
        { type: 'mdxJsxAttribute', name: 'className', value: 'choice' },
      ],
      children: choiceChildren,
    })
  }

  return {
    type: 'mdxJsxFlowElement',
    name: 'ChoiceGroup',
    attributes,
    children,
  }
}

function increaseLvl(node: BlockContent | DefinitionContent) {
  if (node.type === 'mdxJsxFlowElement' && node.name === 'ChoiceGroup') {
    const attribute = node.attributes.find(
      (attribute) => attribute.type === 'mdxJsxAttribute' && attribute.name === 'lvl',
    )
    const lvlValue = attribute?.value
    if (lvlValue) attribute.value = `${Number(lvlValue) + 1}`
  }
}
