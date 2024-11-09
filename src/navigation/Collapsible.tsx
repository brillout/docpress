export { Collapsible }
export { CollapsibleProvider }

import React, { useContext, useEffect, useRef, useState } from 'react'

type CollapsibleKey = object
type CollapsibleStates = WeakMap<CollapsibleKey, boolean>
const Context = React.createContext<CollapsibleStates>(undefined as any)

function Collapsible({
  head,
  children,
  disabled = false,
  collapsedInit,
<<<<<<< Updated upstream
  marginBottomOnExpand,
=======
  key
>>>>>>> Stashed changes
}: {
  head: (onClick: () => void) => React.ReactNode
  children: React.ReactNode
  disabled: boolean
  collapsedInit: boolean
<<<<<<< Updated upstream
  marginBottomOnExpand?: number
=======
  key: CollapsibleKey
>>>>>>> Stashed changes
}) {
  const collapsibleStates = useCollapsibleStates()
  const [collapsed, setCollapsedLocal] = useState(collapsedInit)
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined)
  const contentRef = useRef<HTMLDivElement>(null)

  const onClick = () => {
    if (!disabled) {
      setCollapsedLocal(!collapsed)
      setCollapsedShared(key, !collapsed)
    }
  }

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [children])

  const showContent = disabled ? true : !collapsed

  return (
    <>
      {head(onClick)}
      <div
        ref={contentRef}
        style={{
          height: showContent ? contentHeight : 0,
          overflow: 'hidden',
          transition: 'none 0.3s ease',
          transitionProperty: 'height, margin-bottom',
          marginBottom: (showContent && marginBottomOnExpand) || undefined,
        }}
        aria-expanded={showContent}
      >
        {children}
      </div>
    </>
  )
}

function useCollapsibleStates() {
  const collapsibleStates = useContext(Context)
  return collapsibleStates
}
function CollapsibleProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsibleStates, setCollapsibleStates] = useState(new WeakMap())
  return <Context.Provider value={isPreviousCollapsed, setCollapsibleState}}>{children}</Context.Provider>
}

