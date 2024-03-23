/// <reference types="vite/client" />

declare module '*.mdx' {
  const value: () => JSX.Element
  export default value
  export const headings: { level: number; title: string; id: string }[]
}
