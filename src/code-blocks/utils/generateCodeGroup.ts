export { generateCodeGroup }
export type { CodeChoice }

import type { BlockContent, DefinitionContent } from 'mdast'
import type { MdxJsxAttribute, MdxJsxFlowElement } from 'mdast-util-mdx-jsx'
import type { Program } from '@mdx-js/mdx/internal-create-format-aware-processors'

type CodeChoice = {
  value: string
  children: (BlockContent | DefinitionContent)[]
}

function generateCodeGroup(codeChoices: CodeChoice[], defaultValue?: string, persistId?: string): MdxJsxFlowElement {
  const attributes: MdxJsxAttribute[] = []
  const children: MdxJsxFlowElement[] = []

  attributes.push({
    type: 'mdxJsxAttribute',
    name: 'group',
    value: {
      type: 'mdxJsxAttributeValueExpression',
      value: '',
      data: {
        estree: {
          type: 'Program',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'ObjectExpression',
                properties: [
                  {
                    type: 'Property',
                    key: {
                      type: 'Identifier',
                      name: 'choices',
                    },
                    value: {
                      type: 'ArrayExpression',
                      elements: codeChoices.map((codeChoice) => ({
                        type: 'Literal',
                        value: codeChoice.value,
                      })),
                    },
                    kind: 'init',
                  },
                  {
                    type: 'Property',
                    key: {
                      type: 'Identifier',
                      name: 'defaultChoice',
                    },
                    value: {
                      type: 'Literal',
                      value: defaultValue || null,
                    },
                    kind: 'init',
                  },
                  {
                    type: 'Property',
                    key: {
                      type: 'Identifier',
                      name: 'persistId',
                    },
                    value: {
                      type: 'Literal',
                      value: persistId || null,
                    },
                    kind: 'init',
                  },
                ],
              },
            },
          ],
        } as Program,
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
  if (node.type === 'containerDirective' && node.name === 'CodeGroup') {
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
