import React from 'react'
import { usePageContext } from '../renderer/usePageContext'

export { TextContactUs }

function TextContactUs() {
  const pageContext = usePageContext()
  const { projectInfo } = pageContext.config
  return (
    <>
      <a href={projectInfo.discordInvite}>Join our Discord</a> or{' '}
      <a href={projectInfo.githubIssues}>open a GitHub ticket</a>.
    </>
  )
}
