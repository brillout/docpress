export { generateCodeGroup }
export type { CodeChoice }

import type { BlockContent, DefinitionContent } from 'mdast'
import type { MdxJsxAttribute, MdxJsxFlowElement } from 'mdast-util-mdx-jsx'

type CodeChoice = {
  value: string
  children: (BlockContent | DefinitionContent)[]
}

function generateCodeGroup(codeChoices: CodeChoice[]): MdxJsxFlowElement {
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
    const classNames = ['code-choice']
    if (findHasJsToggle(codeChoice.children[0])) {
      classNames.push('has-toggle')
    }

    children.push({
      type: 'mdxJsxFlowElement',
      name: 'div',
      attributes: [
        { type: 'mdxJsxAttribute', name: 'id', value: codeChoice.value },
        { type: 'mdxJsxAttribute', name: 'className', value: classNames.join(' ') },
      ],
      children: codeChoice.children.every((node) => node.type === 'containerDirective')
        ? codeChoice.children.flatMap((node) => [...node.children])
        : codeChoice.children,
    })
  }

  return {
    type: 'mdxJsxFlowElement',
    name: 'CodeGroup',
    attributes,
    children,
  }
}

function findHasJsToggle(node: BlockContent | DefinitionContent) {
  if (node.type === 'containerDirective' && node.name === 'Choice') {
    return (
      node.children[0].type === 'mdxJsxFlowElement' &&
      node.children[0].name === 'CodeSnippets' &&
      node.children[0].attributes.every(
        (attribute) => attribute.type !== 'mdxJsxAttribute' || attribute.name !== 'hideToggle',
      )
    )
  }
  return (
    node.type === 'mdxJsxFlowElement' &&
    node.name === 'CodeSnippets' &&
    node.attributes.every((attribute) => attribute.type !== 'mdxJsxAttribute' || attribute.name !== 'hideToggle')
  )
}
