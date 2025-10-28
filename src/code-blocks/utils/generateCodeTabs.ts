export { generateCodeTabs }

import type { Code } from 'mdast'
import type { MdxJsxAttribute, MdxJsxFlowElement } from 'mdast-util-mdx-jsx'

type CodeTab = {
  value: string
  code: Code
}

function generateCodeTabs(tabs: CodeTab[], defaultValue?: string, persistId?: string): MdxJsxFlowElement {
  const attributes: MdxJsxAttribute[] = []
  const children: MdxJsxFlowElement[] = []

  attributes.push({
    type: 'mdxJsxAttribute',
    name: 'items',
    value: {
      type: 'mdxJsxAttributeValueExpression',
      value: tabs.map((tab) => tab.value).join(', '),
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
                elements: tabs.map((tab) => ({
                  type: 'Literal',
                  value: tab.value,
                })),
              },
            },
          ],
        },
      },
    },
  })

  if (defaultValue) {
    attributes.push({
      type: 'mdxJsxAttribute',
      name: 'defaultValue',
      value: defaultValue,
    })
  }

  if (persistId) {
    attributes.push({
      type: 'mdxJsxAttribute',
      name: 'persistId',
      value: persistId,
    })
  }

  for (const tab of tabs) {
    children.push({
      type: 'mdxJsxFlowElement',
      name: 'CodeTabPanel',
      attributes: [{ type: 'mdxJsxAttribute', name: 'value', value: tab.value }],
      children: [tab.code],
    })
  }

  return {
    type: 'mdxJsxFlowElement',
    name: 'CodeTabs',
    attributes,
    children,
  }
}
