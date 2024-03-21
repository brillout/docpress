export { RemovedFile }

import React from 'react'

function RemovedFile({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={
        // Styling for .diff-removed-file is defined in src/css/code/diff.css
        'diff-removed-file'
      }
    >
      {children}
    </div>
  )
}
