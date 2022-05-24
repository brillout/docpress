import React from 'react'
import './P.css'

export { P }

function P(props: React.HTMLProps<HTMLDivElement>) {
  return <div {...props} className={'paragraph'} />
}
