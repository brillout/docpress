export { HorizontalLine }

import React from 'react'
import { cls } from '../utils/cls.js'

function HorizontalLine({ primary }: { primary?: true }) {
  return (
    <div className={cls(primary && 'primary')} style={{ textAlign: 'center' }}>
      <hr
        style={{
          display: 'inline-block',
          margin: 0,
          border: 0,
          // Same as `.doc-page h2::after`
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          maxWidth: 500,
          width: '80%',
        }}
      />
    </div>
  )
}
