export { Pre }
export { isPlainText }

import React from 'react'
import { cls } from '../../utils/cls.js'
import { useCopy, CopyAnnouncement, CopyStatusIcon } from '../../utils/useCopy.js'
import { usePageContext } from '../../renderer/usePageContext.js'
import { classAdded, classRemoved } from '../../components/FileRemoved.js'
import './Pre.css'

type AdditionalProps = {
  'data-language'?: string
  'hide-menu'?: string
  'file-added'?: string
  'file-removed'?: string
}

function Pre({ children, ...props }: React.ComponentPropsWithoutRef<'pre'> & AdditionalProps) {
  const { className, ...rest } = props
  const language = props['data-language']
  const languageLabel = language ? getLanguageLabel(language) : null
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
        <CopyStatusIcon status={status} />
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
function isPlainText(language: string) {
  return language === 'plaintext' || language === 'text' || language === 'txt'
}
function getLanguageLabel(language: string): string | null {
  if (isPlainText(language)) return null
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
