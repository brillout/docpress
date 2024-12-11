export { TopNavigation }

import { iconSeedling } from '@brillout/docpress'
import React from 'react'

function TopNavigation() {
  return (
    <a
      className="colorize-on-hover"
      href="/features"
      style={{
        color: 'inherit',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        padding: '0 var(--padding-side)',
      }}
    >
      <img
        src={iconSeedling}
        width={21}
        style={{ marginRight: 'calc(var(--icon-text-padding) - 1px)', position: 'relative', top: -1 }}
        className="decolorize-7 desktop-fade"
      />
      Get Started
    </a>
  )
}
