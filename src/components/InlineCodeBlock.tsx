export { InlineCodeBlock }

import React from 'react'
import './InlineCodeBlock.css'

function InlineCodeBlock({ children }: { children: React.ReactNode }) {
  return <div className="inline-code-block">{children}</div>
}
