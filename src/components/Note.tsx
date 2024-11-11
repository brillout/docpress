export { Warning }
export { Advanced }
export { Construction }
export { Contribution }
export { Danger }
export { NoteWithoutIcon }
export { NoteWithCustomIcon }
/* Use markdown instead:
 * ```diff
 * - <Note>Some note</Note>
 * + > Some note
 * ```
export { Note }
*/

import React from 'react'
import { assert } from '../utils/assert'
import './Note.css'

type Props = {
  children: React.ReactNode
  style?: React.CSSProperties
}
function Warning(props: Props) {
  return <NoteGeneric type="warning" {...props} />
}
function Advanced(props: Props) {
  return <NoteGeneric type="advanced" {...props} />
}
function Construction(props: Props) {
  return <NoteGeneric type="construction" {...props} />
}
function Contribution(props: Props) {
  return <NoteGeneric type="contribution" {...props} />
}
function Danger(props: Props) {
  return <NoteGeneric type="danger" {...props} />
}
function NoteWithoutIcon(props: Props) {
  return <NoteGeneric icon={null} {...props} />
}
type CustomIcon = JSX.Element | string
function NoteWithCustomIcon(props: Props & { icon: CustomIcon }) {
  const { icon } = props
  if (!icon) throw new Error(`<NoteWithCustomIcon icon={/*...*/}> property 'icon' is \`${icon}\` which is forbidden`)
  return <NoteGeneric {...props} />
}

function NoteGeneric({
  type,
  icon,
  iconMargin,
  children,
  style,
}: Props & {
  icon?: null | CustomIcon
  iconMargin?: null | number
  type?: 'danger' | 'warning' | 'construction' | 'contribution' | 'advanced'
}) {
  assert(icon === null || icon || type, { icon, type })
  iconMargin ??= 2

  let className = 'custom-icon'
  if (type) {
    className = `${className} type-${type}`
  }
  if (!icon && type) {
    let classColor = ''
    if (type === 'danger') {
      icon = '⛔'
      classColor = 'note-color-red'
    }
    if (type === 'warning') {
      icon = '⚠️'
      classColor = 'note-color-yellow'
    }
    if (type === 'construction') {
      icon = '🚧'
      classColor = 'note-color-yellow'
    }
    if (type === 'contribution') {
      icon = '💚'
      classColor = 'note-color-green'
    }
    if (type === 'advanced') {
      icon = '🧠'
      classColor = 'note-color-pink'
    }
    assert(icon)
    assert(classColor)
    className = `${className} ${classColor}`
  }
  return (
    <blockquote className={className} style={style}>
      <div style={{ marginBottom: 20 }} />
      {icon && (
        <>
          <span style={{ fontFamily: 'emoji' }}>{icon}</span>
          <span style={{ width: iconMargin ?? undefined, display: 'inline-block' }}></span>{' '}
        </>
      )}
      <div className="blockquote-content">{children}</div>
      <div style={{ marginTop: 20 }} />
    </blockquote>
  )
}
