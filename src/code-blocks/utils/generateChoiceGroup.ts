export { generateChoiceGroup }
export type { ChoiceNode }

import type { BlockContent, DefinitionContent } from 'mdast'
import type { MdxJsxAttribute, MdxJsxFlowElement } from 'mdast-util-mdx-jsx'

type ChoiceNode = {
  choiceValue: string
  children: (BlockContent | DefinitionContent)[]
}

function generateChoiceGroup(choiceNodes: ChoiceNode[]): MdxJsxFlowElement {
  const attributes: MdxJsxAttribute[] = []
  const children: MdxJsxFlowElement[] = []

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
                elements: choiceNodes.map((choiceNode) => ({
                  type: 'Literal',
                  value: choiceNode.choiceValue,
                })),
              },
            },
          ],
        },
      },
    },
  })

  for (const choiceNode of choiceNodes) {
    const classNames = ['choice']
    if (findHasJsDropdown(choiceNode.children[0])) classNames.push('has-js-dropdown')

    children.push({
      type: 'mdxJsxFlowElement',
      name: 'div',
      attributes: [
        { type: 'mdxJsxAttribute', name: 'data-choice-value', value: choiceNode.choiceValue },
        { type: 'mdxJsxAttribute', name: 'className', value: classNames.join(' ') },
      ],
      children: choiceNode.children.every((node) => node.type === 'containerDirective')
        ? choiceNode.children.flatMap((node) => [...node.children])
        : choiceNode.children,
    })
  }

  return {
    type: 'mdxJsxFlowElement',
    name: 'ChoiceGroup',
    attributes,
    children,
  }
}

function findHasJsDropdown(node: BlockContent | DefinitionContent) {
  let currentNode = node
  if (node.type === 'containerDirective' && node.name === 'Choice') currentNode = node.children[0]
  return (
    currentNode.type === 'mdxJsxFlowElement' &&
    currentNode.data?.filter === 'codeLang' &&
    currentNode.attributes.every((attribute) => attribute.type !== 'mdxJsxAttribute' || attribute.name !== 'hide')
  )
}
