// `usePageContext` allows us to access `pageContext` in any React component.
// More infos: https://vike.dev/pageContext-anywhere

import React, { useContext } from 'react'
import type { PageContextResolved } from '../config/resolvePageContext'

export { PageContextProvider }
export { usePageContext }

const Context = React.createContext<PageContextResolved>(undefined as any)

function PageContextProvider({
  pageContext,
  children,
}: {
  pageContext: PageContextResolved
  children: React.ReactNode
}) {
  return <Context.Provider value={pageContext}>{children}</Context.Provider>
}

function usePageContext(): PageContextResolved {
  const pageContext = useContext(Context)
  return pageContext
}
