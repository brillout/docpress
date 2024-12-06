export { usePageContext }
export { PageContextProvider }

import React, { useContext } from 'react'
import type { PageContextResolved } from '../config/resolvePageContext'
import type { PageContext } from 'vike/types'
import { getGlobalObject } from '../utils/getGlobalObject'

const globalObject = getGlobalObject('usePageContext.ts', {
  Context: React.createContext<PageContextResolved>(undefined as any),
  Context2: React.createContext<PageContext>(undefined as any),
})

function PageContextProvider({
  pageContext,
  children,
}: {
  pageContext: PageContextResolved
  children: React.ReactNode
}) {
  const { Context } = globalObject
  return <Context.Provider value={pageContext}>{children}</Context.Provider>
}

function usePageContext(): PageContextResolved {
  const { Context } = globalObject
  const pageContext = useContext(Context)
  return pageContext
}

export { PageContextProvider2 }
// TODO/refactor: rename to usePageContext and remove old implementation
export { usePageContext2 }

function usePageContext2(): PageContext {
  const pageContext = useContext(globalObject.Context2)
  return pageContext
}
function PageContextProvider2({
  pageContext,
  children,
}: {
  pageContext: PageContext
  children: React.ReactNode
}) {
  const { Context2 } = globalObject
  return <Context2.Provider value={pageContext}>{children}</Context2.Provider>
}
