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
import { assert } from '../utils/assert.js'
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
type CustomIcon = React.JSX.Element | string
function NoteWithCustomIcon(props: Props & { icon: CustomIcon }) {
  const { icon } = props
  if (!icon) throw new Error(`<NoteWithCustomIcon icon={/*...*/}> property 'icon' is \`${icon}\` which is forbidden`)
  return <NoteGeneric {...props} />
}

type NoteType = 'danger' | 'warning' | 'construction' | 'contribution' | 'advanced'
function NoteGeneric({
  type,
  icon,
  children,
  style,
}: Props & {
  icon?: null | CustomIcon
  type?: NoteType
}) {
  assert(icon === null || icon || type, { icon, type })

  const className = [
    'callout',
    type ? `callout-${type} type-${type}` : 'callout-info',
    icon === null && 'callout-no-icon',
  ]
    .filter(Boolean)
    .join(' ')
  const iconResolved = icon === undefined ? calloutIcons[type!] : icon
  return (
    <blockquote className={className} style={style}>
      {iconResolved && (
        <span className="callout-icon" aria-hidden="true">
          {iconResolved}
        </span>
      )}
      <div className="blockquote-content">{children}</div>
    </blockquote>
  )
}

const svgProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  width: 18,
  height: 18,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const
const calloutIcons: Record<NoteType, React.JSX.Element> = {
  warning: (
    <svg {...svgProps}>
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  ),
  danger: (
    <svg {...svgProps}>
      <path d="M7.9 2h8.2L22 7.9v8.2L16.1 22H7.9L2 16.1V7.9Z" />
      <path d="m15 9-6 6M9 9l6 6" />
    </svg>
  ),
  construction: (
    <svg {...svgProps}>
      <rect x="2" y="6" width="20" height="8" rx="1" />
      <path d="m7 6-4 8M13 6l-4 8M19 6l-4 8M5 14v5M19 14v5" />
    </svg>
  ),
  contribution: (
    <svg {...svgProps}>
      <path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z" />
    </svg>
  ),
  advanced: (
    <svg {...svgProps}>
      <path d="M9 18h6M10 22h4M15.1 14c.2-1 .7-1.7 1.4-2.5A4.6 4.6 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    </svg>
  ),
}
