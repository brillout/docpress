export { MenuToggle }
export { menuLinkStyle }

import React from 'react'
import { coseMenuModalOnMouseLeave, openMenuModal, toggleMenuModal } from './MenuModal/toggleMenuModal'
import { Style } from './utils/Style'
import { css } from './utils/css'

const menuLinkStyle: React.CSSProperties = {
  height: '100%',
  padding: '0 var(--padding-side)',
  justifyContent: 'center',
}

type PropsDiv = React.HTMLProps<HTMLDivElement>
let onMouseIgnore: ReturnType<typeof setTimeout> | undefined
function MenuToggle({ menuId, ...props }: PropsDiv & { menuId: number }) {
  return (
    <div
      {...props}
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        ...menuLinkStyle,
        ...props.style,
      }}
      className={[`colorize-on-hover menu-toggle menu-toggle-${menuId}`, props.className].filter(Boolean).join(' ')}
      onClick={(ev) => {
        ev.preventDefault()
        toggleMenuModal(menuId)
      }}
      onMouseEnter={() => {
        if (onMouseIgnore) return
        openMenuModal(menuId)
      }}
      onMouseLeave={() => {
        if (onMouseIgnore) return
        coseMenuModalOnMouseLeave(menuId)
      }}
      onTouchStart={() => {
        onMouseIgnore = setTimeout(() => {
          onMouseIgnore = undefined
        }, 1000)
      }}
    >
      <Style>{getAnimation()}</Style>
      {props.children}
      <CaretIcon
        style={{
          width: 11,
          marginLeft: 10,
          flexShrink: 0,
          color: '#888',
        }}
      />
    </div>
  )

  function getAnimation() {
    return css`
.menu-toggle {
  position: relative;
  overflow: hidden;
  z-index: 0;
  @media (hover: hover) and (pointer: fine) {
    .link-hover-animation &:hover::before {
      top: 0;
    }
    html.menu-modal-show & {
      cursor: default !important;
    }
  }
  &::before {
    position: absolute;
    content: '';
    height: 100%;
    width: 100%;
    top: var(--nav-head-height);
    background-color: var(--active-color);
    transition-property: top !important;
    transition: top 0.4s ease !important;
    z-index: -1;
  }
  & .caret-icon-left,
  & .caret-icon-right {
    transition: transform .4s cubic-bezier(.4,0, .2, 1);
  }
  & .caret-icon-left {
    transform-origin: 25% 50%;
  }
  & .caret-icon-right {
    transform-origin: 75% 50%;
  }
}
    `
  }
}
function CaretIcon({ style }: { style: React.CSSProperties }) {
  return (
    // - Inspired by stripe.com
    // - Alternative caret SVGs: https://gist.github.com/brillout/dbf05e1fb79a34169cc2d0d5eaf58c01
    // - The rounded caret (`caret.svg`) doesn't look nice when flipped:
    // -   https://github.com/brillout/docpress/commit/0ff937d8caf5fc439887ef495e2d2a700234dfb1
    // - https://github.com/brillout/docpress/pull/39
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 9.24 5.858"
      style={{
        overflow: 'visible',
        ...style,
      }}
      className="caret-icon"
    >
      <g className="caret-icon-left">
        <path
          fill="currentColor"
          d="m4.001 5.24.619.618 1.237-1.237-.618-.619L4 5.241zm-4-4 4 4L5.24 4.001l-4-4L0 1.241z"
        ></path>
      </g>
      <g className="caret-icon-right">
        <path fill="currentColor" d="m5.239 5.239-.619.618L3.383 4.62l.618-.619L5.24 5.24Zm4-4-4 4L4 4l4-4z"></path>
      </g>
    </svg>
  )
}
