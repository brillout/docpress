export { useCopy }
export { CopyAnnouncement }

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
