export { Collapsible }

import React, { useId, useRef, useState } from 'react'
import { cls } from '../utils/cls.js'
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
  const id = useId()
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
      {disabled ? (
        head(onClick)
      ) : (
        <button
          type="button"
          className="collapsible-head"
          aria-expanded={showContent}
          aria-controls={id}
          onClick={onClick}
        >
          {head(() => {})}
        </button>
      )}
      <div
        id={id}
        ref={contentRef}
        onTransitionEnd={onTransitionEnd}
        style={{
          height: !showContent ? 0 : isAnimating ? contentRef.current!.scrollHeight : 'auto',
          // Clipped only while collapsed or animating (focus rings of the items aren't cut)
          overflow: !showContent || isAnimating ? 'hidden' : undefined,
          // Collapsed: out of the tab order, once the animation is done
          visibility: !showContent && !isAnimating ? 'hidden' : undefined,
          // Like the left navigation's groups
          transition: 'none var(--dp-duration-reveal) var(--dp-ease-out)',
          transitionProperty: 'height, margin-bottom',
          marginBottom: (showContent && marginBottomOnExpand) || undefined,
        }}
      >
        {children}
      </div>
    </div>
  )
}
