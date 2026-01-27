export { generateChoiceGroupCode }
export type { ChoiceNode }

import type { BlockContent, DefinitionContent } from 'mdast'
import type { MdxJsxAttribute, MdxJsxFlowElement } from 'mdast-util-mdx-jsx'

type ChoiceNode = {
  choiceValue: string
  children: (BlockContent | DefinitionContent)[]
}

function generateChoiceGroupCode(choiceNodes: ChoiceNode[]): MdxJsxFlowElement {
  const attributes: MdxJsxAttribute[] = []
  const children: MdxJsxFlowElement[] = []

  const elements = choiceNodes.map((choiceNode) => {
    const firstChild = choiceNode.children[0]
    return {
      type: 'Literal',
      value: firstChild && findVisibleJsDropdown(firstChild)
        ? `${choiceNode.choiceValue}:jsDropdown`
        : choiceNode.choiceValue,
    }
  })

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

  for (const choiceNode of choiceNodes) {
    children.push({
      type: 'mdxJsxFlowElement',
      name: 'div',
      attributes: [
        { type: 'mdxJsxAttribute', name: 'data-choice-value', value: choiceNode.choiceValue },
        { type: 'mdxJsxAttribute', name: 'className', value: 'choice' },
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

function findVisibleJsDropdown(node: BlockContent | DefinitionContent) {
  let currentNode = node
  if (node.type === 'containerDirective' && node.name === 'Choice') {
    const firstChild = node.children[0]
    if (firstChild) currentNode = firstChild
  }
  return (
    currentNode.type === 'mdxJsxFlowElement' &&
    currentNode.data?.customDataFilter === 'codeLang' &&
    currentNode.attributes.every((attribute) => attribute.type !== 'mdxJsxAttribute' || attribute.name !== 'hide')
  )
}
