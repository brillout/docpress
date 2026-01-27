export { PageContextProvider }
export { usePageContext }
export { usePageContextLegacy }

import React, { useContext } from 'react'
import type { PageContext } from 'vike/types'
import { getGlobalObject } from '../utils/getGlobalObject.js'

const globalObject = getGlobalObject('usePageContext.ts', {
  Ctx: React.createContext<PageContext>(undefined as any),
})

function usePageContextLegacy() {
  const { Ctx } = globalObject
  const pageContext = useContext(Ctx)
  return pageContext.resolved
}

function usePageContext(): PageContext {
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
