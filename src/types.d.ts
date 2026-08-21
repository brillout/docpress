/// <reference types="vite/client" />

declare module '*.mdx' {
  const value: (props?: any) => React.JSX.Element
  export default value
  export const headings: { level: number; title: string; id: string }[]
}

// DocPress ships its TypeScript sources (it's `noExternal`), so the user's TypeScript
// setup type checks DocPress's source code — including its `import '@docsearch/css'`.
// The `@docsearch/css` package only contains CSS files and ships no type declarations,
// which makes TypeScript 7 emit:
//   TS2882: Cannot find module or type declarations for side-effect import of '@docsearch/css'.
declare module '@docsearch/css'
