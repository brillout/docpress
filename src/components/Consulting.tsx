export { Consulting, ConsultingText, Consultants }

import React from 'react'
import iconPeople from '../icons/people.svg'
import { usePageContext } from '../renderer/usePageContext'
import { SupporterSection, SectionDescription, CallToAction } from './Supporters'
import { Maintainer } from './Contributors'
import { maintainers } from './maintainersList'
import { Link } from './Link'

function Consulting({ consultingPageHref }: { consultingPageHref: string }) {
  return (
    <SupporterSection>
      <CallToAction iconUrl={iconPeople} text="Consulting" href={consultingPageHref} />
      <div></div>
      <SectionDescription>
        <ConsultingText {...{ consultingPageHref }} />
      </SectionDescription>
    </SupporterSection>
  )
}

function ConsultingText({ consultingPageHref }: { consultingPageHref?: string }) {
  const pageContext = usePageContext()
  const { projectInfo } = pageContext.config
  const projectName = projectInfo.projectNameJsx || projectInfo.projectName
  return (
    <>
      For issues related to {projectName}, open a{' '}
      <a href={projectInfo.githubDiscussions || projectInfo.githubIssues}>GitHub Discussion</a>. For advanced help, the{' '}
      {projectName} team offers{' '}
      {consultingPageHref ? (
        <Link href={consultingPageHref} noBreadcrumb>
          consulting
        </Link>
      ) : (
        'consulting'
      )}
      .
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
