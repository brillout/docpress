export { FileRemoved }

import React from 'react'

function FileRemoved({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={
        // Styling for .diff-entire-file-removed is defined in src/css/code/diff.css
        'diff-entire-file-removed'
      }
    >
      {children}
    </div>
  )
}
