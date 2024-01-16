export { Consulting, ConsultingText, Consultants }

import React from 'react'
import { usePageContext } from '../renderer/usePageContext'
import { SupporterSection, SectionDescription } from './Supporters'
import { Maintainer } from './Contributors'
import { maintainers } from './maintainersList'
import { Link } from './Link'

function Consulting({ consultingPageHref }: { consultingPageHref?: string }) {
  return (
    <SupporterSection>
      <SectionDescription>
        <ConsultingText {...{ consultingPageHref }} />
      </SectionDescription>
    </SupporterSection>
  )
}

function ConsultingText({ consultingPageHref }: { consultingPageHref?: string }) {
  const pageContext = usePageContext()
  const { projectInfo } = pageContext.config
  return (
    <>
      For concrete issues related to {projectInfo.projectNameJsx || projectInfo.projectName}, open a{' '}
      <a href={projectInfo.githubDiscussions || projectInfo.githubIssues}>GitHub Discussion</a>. If you have more than
      just a few questions, some of us offer{' '}
      {consultingPageHref ? <Link href={consultingPageHref}>consulting</Link> : 'consulting'} services.
    </>
  )
}

function Consultants() {
  return (
    <SupporterSection>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end' }}>
        {maintainers
          .filter((maintainer) => {
            return !!maintainer.consultingUrl
          })
          .map((maintainer, i) => (
            <Maintainer maintainer={maintainer} key={i} />
          ))}
      </div>
    </SupporterSection>
  )
}
