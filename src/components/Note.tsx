import React from 'react'
import { assert } from '../utils'

export { Note }

function Note({ type, icon, children }: { icon: JSX.Element | string; type?: 'error' | 'warning'; children: JSX.Element }) {
  assert(type === undefined || ['error', 'warning'].includes(type))
  if (!icon) {
    if (type === 'error') {
      icon = ':no_entry:'
    }
    if (type === 'warning') {
      icon = ':warning:'
    }
  }
  return (
    <blockquote className={type}>
      <div style={{ marginBottom: 20 }} />
      {icon} {children}
      <div style={{ marginTop: 20 }} />
    </blockquote>
  )
}
