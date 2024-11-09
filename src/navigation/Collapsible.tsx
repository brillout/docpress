export { Collapsible }

import React, { useEffect, useRef, useState } from 'react'

function Collapsible({
  head,
  children,
  disabled = false,
  collapsedInit,
}: {
  head: (onClick: () => void) => React.ReactNode
  children: React.ReactNode
  disabled: boolean
  collapsedInit: boolean
}) {
  const [collapsed, setCollapsed] = useState(collapsedInit)
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined)
  const contentRef = useRef<HTMLDivElement>(null)

  const onClick = () => {
    if (!disabled) {
      setCollapsed((prev) => !prev)
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
          marginBottom: showContent ? 0 : -40,
        }}
        aria-expanded={showContent}
      >
        {children}
      </div>
    </>
  )
}
