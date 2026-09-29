export { Pre }

import React from 'react'
import { cls } from '../../utils/cls.js'
import { useCopy, CopyAnnouncement } from '../../utils/useCopy.js'
import { usePageContext } from '../../renderer/usePageContext.js'
import './Pre.css'

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

type AdditionalProps = {
  'hide-menu'?: string
  'file-added'?: string
  'file-removed'?: string
}

function Pre({ children, ...props }: React.ComponentPropsWithoutRef<'pre'> & AdditionalProps) {
  const { className, ...rest } = props
  const language = (props as Record<string, unknown>)['data-language']
  const languageLabel = typeof language === 'string' ? getLanguageLabel(language) : null
  // The language header is doc pages' chrome: on a landing page, a code block keeps the site's layout
  const { isLandingPage } = usePageContext().resolved

  return (
    <pre
      className={cls([className, props['file-added'] && classAdded, props['file-removed'] && classRemoved])}
      {...rest}
    >
      {languageLabel && !isLandingPage && (
        <div className="code-block-header">
          <span className="code-block-language">{languageLabel}</span>
        </div>
      )}
      {children}
      {!props['hide-menu'] && <CopyButton />}
    </pre>
  )
}

function CopyButton() {
  const { status, copy } = useCopy()
  const tooltip = status === 'idle' ? 'Copy to clipboard' : status === 'copied' ? 'Copied' : 'Failed'
  const icon =
    status === 'idle' ? (
      // Copy icon
      <svg key="copy" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
    ) : status === 'copied' ? (
      // Green checkmark
      <svg
        key="copied"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        stroke="var(--dp-color-success)"
        strokeWidth="3"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ) : (
      // Cross, like "Copy page"
      <svg
        key="failed"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        stroke="var(--dp-color-danger)"
        strokeWidth="2"
      >
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
    )
  return (
    <>
      <button
        className="copy-button scale-on-press"
        aria-label={tooltip}
        data-label-position="top-left"
        type="button"
        onClick={(ev) => {
          // Only the code, not the header
          const code = ev.currentTarget.parentElement!.querySelector('code')?.textContent || ''
          copy(removeTrailingWhitespaces(code))
        }}
      >
        {icon}
      </button>
      <CopyAnnouncement status={status} />
    </>
  )
}
const languageLabels: Record<string, string> = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  jsx: 'JSX',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  tsx: 'TSX',
  vue: 'Vue',
  svelte: 'Svelte',
  json: 'JSON',
  jsonc: 'JSON',
  html: 'HTML',
  css: 'CSS',
  md: 'Markdown',
  mdx: 'MDX',
  toml: 'TOML',
  sh: 'Shell',
  shell: 'Shell',
  bash: 'Shell',
  zsh: 'Shell',
  diff: 'Diff',
  sql: 'SQL',
  graphql: 'GraphQL',
  dockerfile: 'Dockerfile',
}
function getLanguageLabel(language: string): string | null {
  if (language === 'plaintext' || language === 'text' || language === 'txt') return null
  // Mostly used to list files (a common convention in docs), which aren't YAML
  if (language === 'yaml' || language === 'yml') return null
  return languageLabels[language] ?? language
}

function removeTrailingWhitespaces(text: string) {
  return text
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
}
