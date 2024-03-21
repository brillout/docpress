export { FileRemoved }

import React from 'react'

function FileRemoved({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={
        // Styling for .diff-file-removed is defined in src/css/code/diff.css
        'diff-file-removed'
      }
    >
      {children}
    </div>
  )
}
