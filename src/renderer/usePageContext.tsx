export { PageContextProvider }
export { usePageContext2 }
export { usePageContextLegacy }

import React, { useContext } from 'react'
import type { PageContextResolved } from '../config/resolvePageContext'
import type { PageContext } from 'vike/types'
import { getGlobalObject } from '../utils/getGlobalObject'

const globalObject = getGlobalObject('usePageContext.ts', {
  Ctx: React.createContext<PageContext>(undefined as any),
})

function usePageContextLegacy(): PageContextResolved {
  const { Ctx } = globalObject
  const pageContext = useContext(Ctx)
  return pageContext.pageContextResolved
}

function usePageContext2(): PageContext {
  const pageContext = useContext(globalObject.Ctx)
  return pageContext
}
function PageContextProvider({
  pageContext,
  children,
}: {
  pageContext: PageContext
  children: React.ReactNode
}) {
  const { Ctx } = globalObject
  return <Ctx.Provider value={pageContext}>{children}</Ctx.Provider>
}
