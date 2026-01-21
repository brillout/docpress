export { generateChoiceGroup }
export type { CodeChoice }

import type { BlockContent, DefinitionContent } from 'mdast'
import type { MdxJsxAttribute, MdxJsxFlowElement } from 'mdast-util-mdx-jsx'

type CodeChoice = {
  value: string
  children: (BlockContent | DefinitionContent)[]
}

function generateChoiceGroup(codeChoices: CodeChoice[]): MdxJsxFlowElement {
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
                elements: codeChoices.map((choice) => ({
                  type: 'Literal',
                  value: choice.value,
                })),
              },
            },
          ],
        },
      },
    },
  })

  for (const codeChoice of codeChoices) {
    const classNames = ['choice']
    if (findHasJsDropdown(codeChoice.children[0])) classNames.push('has-js-dropdown')

    children.push({
      type: 'mdxJsxFlowElement',
      name: 'div',
      attributes: [
        { type: 'mdxJsxAttribute', name: 'data-id', value: codeChoice.value },
        { type: 'mdxJsxAttribute', name: 'className', value: classNames.join(' ') },
      ],
      children: codeChoice.children.every((node) => node.type === 'containerDirective')
        ? codeChoice.children.flatMap((node) => [...node.children])
        : codeChoice.children,
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
    currentNode.data?.filter === 'code-lang' &&
    currentNode.attributes.every((attribute) => attribute.type !== 'mdxJsxAttribute' || attribute.name !== 'hide')
  )
}
