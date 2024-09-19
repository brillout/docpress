// `usePageContext` allows us to access `pageContext` in any React component.
// More infos: https://vike.dev/pageContext-anywhere

import React, { useContext } from 'react'
import type { PageContextResolved } from '../config/resolvePageContext'
import type { PageContext } from 'vike/types'

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

export { PageContextProvider2 }
export { usePageContext2 }

const Context2 = React.createContext<PageContext>(undefined as any)
function usePageContext2(): PageContext {
  const pageContext = useContext(Context2)
  return pageContext
}
function PageContextProvider2({
  pageContext,
  children,
}: {
  pageContext: PageContext
  children: React.ReactNode
}) {
  return <Context2.Provider value={pageContext}>{children}</Context2.Provider>
}
