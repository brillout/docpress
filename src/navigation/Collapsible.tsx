export { Collapsible }

import React, { useRef, useState } from 'react'
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
  const [isAnimating, setIsAnimating] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const onClick = () => {
    if (!disabled) {
      setIsAnimating(true)
      if (!collapsed) {
        // If expanding, set height to current scroll height before animation
        contentRef.current!.style.height = `${contentRef.current!.scrollHeight}px`
        // Force a reflow
        contentRef.current!.offsetHeight
      }
      setCollapsed((prev) => !prev)
    }
  }

  const onTransitionEnd = () => {
    setIsAnimating(false)
  }

  const showContent = disabled ? true : !collapsed

  return (
    <div
      className={cls(['collapsible', !disabled && (showContent ? 'collapsible-expanded' : 'collapsible-collapsed')])}
    >
      {head(onClick)}
      <div
        ref={contentRef}
        onTransitionEnd={onTransitionEnd}
        style={{
          height: !showContent ? 0 : isAnimating ? contentRef.current!.scrollHeight : 'auto',
          overflow: 'hidden',
          transition: 'none 0.3s ease',
          transitionProperty: 'height, margin-bottom',
          marginBottom: (showContent && marginBottomOnExpand) || undefined,
        }}
        aria-expanded={showContent}
      >
        {children}
      </div>
    </div>
  )
}
