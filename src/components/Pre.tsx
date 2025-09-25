export { Pre }

import React, { ComponentPropsWithoutRef, useState } from 'react'
import { assert } from '../utils/assert'
/* Importing it here chokes the tests. I don't know why.
import './Pre.css'
//*/

function Pre({ children, ...props }: ComponentPropsWithoutRef<'pre'> & { 'hide-menu'?: string }) {
  return (
    <pre {...props}>
      {!props['hide-menu'] && <CopyButton />}
      {children}
    </pre>
  )
}

function CopyButton() {
  const [isSuccess, setIsSuccess] = useState(null as null | boolean)
  const onCopy = (success: boolean) => {
    setIsSuccess(success)
    setTimeout(() => {
      setIsSuccess(null)
    }, 900)
  }
  const tooltip = isSuccess === null ? 'Copy to clipboard' : isSuccess ? 'Copied' : 'Failed'
  const icon =
    isSuccess === null ? (
      // Copy icon
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
    ) : isSuccess ? (
      // Green checkmark
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="#28a745" strokeWidth="3">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ) : (
      '❌'
    )
  return (
    <button
      className="copy-button raised"
      aria-label={tooltip}
      data-label-position="top"
      type="button"
      onClick={onClick}
    >
      {icon}
    </button>
  )
  async function onClick(e: React.MouseEvent<HTMLButtonElement>) {
    let success: boolean
    const preEl = e.currentTarget.parentElement!
    let text = preEl.textContent || ''
    text = removeTrailingWhitespaces(text)
    try {
      await navigator.clipboard.writeText(text)
      success = true
    } catch (error) {
      success = false
      assert(success === false, error)
    }
    onCopy(success)
  }
}
function removeTrailingWhitespaces(text: string) {
  return text
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
}
