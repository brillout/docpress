export { Collapsible }

import React, { useEffect, useRef, useState } from 'react'
import { cls } from '../utils/cls'
import './Collapsible.css'

function Collapsible({
  head,
  children,
  disabled = false,
  collapsedInit,
  marginBottomOnExpand,
}: {
  head: (onClick: () => void) => React.ReactNode
  children: React.ReactNode
  disabled: boolean
  collapsedInit: boolean
  marginBottomOnExpand?: number
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
      <div className={cls(!disabled && (showContent ? 'expanded' : 'collapsed'))}>{head(onClick)}</div>
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
