export { useCopy }
export { CopyAnnouncement }
export { CopyStatusIcon }

import React, { useEffect, useRef, useState } from 'react'

type CopyStatus = 'idle' | 'copied' | 'failed'

// Copies to the clipboard. The outcome (`status`) shows for 2s: long enough to be seen once the eye comes back.
function useCopy() {
  const [status, setStatus] = useState<CopyStatus>('idle')
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timeout.current), [])
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setStatus('copied')
    } catch (err) {
      console.error(err)
      setStatus('failed')
    }
    clearTimeout(timeout.current)
    timeout.current = setTimeout(() => setStatus('idle'), 2000)
  }
  return { status, copy }
}

// For screen readers (the buttons show the outcome with an icon)
function CopyAnnouncement({ status }: { status: CopyStatus }) {
  return (
    <span className="sr-only" aria-live="polite">
      {status === 'copied' ? 'Copied' : status === 'failed' ? 'Copy failed' : ''}
    </span>
  )
}

// The copy icon, then the outcome: a check or a cross (sized by the button's CSS)
function CopyStatusIcon({ status }: { status: CopyStatus }) {
  return (
    <svg
      // The outcome icon blends in (button.css)
      key={status}
      data-status={status}
      viewBox="0 0 24 24"
      fill="none"
      stroke={
        status === 'copied'
          ? 'var(--dp-color-success)'
          : status === 'failed'
            ? 'var(--dp-color-danger)'
            : 'currentColor'
      }
      strokeWidth={status === 'copied' ? 3 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {status === 'copied' ? (
        <path d="M20 6 9 17l-5-5" />
      ) : status === 'failed' ? (
        <path d="M18 6 6 18M6 6l12 12" />
      ) : (
        <>
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </>
      )}
    </svg>
  )
}
