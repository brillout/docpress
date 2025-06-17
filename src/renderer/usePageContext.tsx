export { PageContextProvider }
export { usePageContext }
// TODO/refactor: rename to usePageContext and remove old implementation
export { usePageContext2 }

import React, { useContext } from 'react'
import type { PageContextResolved } from '../config/resolvePageContext'
import type { PageContext } from 'vike/types'
import { getGlobalObject } from '../utils/getGlobalObject'

const globalObject = getGlobalObject('usePageContext.ts', {
  Context2: React.createContext<PageContext>(undefined as any),
})

function usePageContext(): PageContextResolved {
  const { Context2 } = globalObject
  const pageContext = useContext(Context2)
  return pageContext.pageContextResolved
}

function usePageContext2(): PageContext {
  const pageContext = useContext(globalObject.Context2)
  return pageContext
}
function PageContextProvider({
  pageContext,
  children,
}: {
  pageContext: PageContext
  children: React.ReactNode
}) {
  const { Context2 } = globalObject
  return <Context2.Provider value={pageContext}>{children}</Context2.Provider>
}
