export { FileRemoved }
export { FileAdded }

import React from 'react'

// Styling defined in src/css/code/diff.css
const classRemoved = [
  //
  'diff-entire-file',
  'diff-entire-file-removed',
].join(' ')
const classAdded = [
  //
  'diff-entire-file',
  'diff-entire-file-added',
].join(' ')

function FileRemoved({ children }: { children: React.ReactNode }) {
  return <div className={classRemoved}> {children} </div>
}
function FileAdded({ children }: { children: React.ReactNode }) {
  return <div className={classAdded}> {children} </div>
}
