export { Consulting, Consultants }

import React from 'react'
import iconPeople from '../icons/people.svg'
import { usePageContext } from '../renderer/usePageContext'
import { SupporterSection, SectionDescription, CallToAction } from './Supporters'
import { Maintainer } from './Contributors'
import { maintainers } from '../data/maintainersList'
import { Link } from './Link'
const consultingPageHref = '/consulting'

function Consulting() {
  const pageContext = usePageContext()
  const { projectInfo } = pageContext.config
  const { projectName } = projectInfo
  return (
    <SupporterSection>
      <CallToAction iconUrl={iconPeople} text="Consulting" href={consultingPageHref} />
      <div></div>
      <SectionDescription>
        For questions and issues related to {projectName}, open a{' '}
        <a href={projectInfo.githubDiscussions || projectInfo.githubIssues}>GitHub Discussion</a>. For advanced help or
        for help not directly related to {projectName}, the {projectName} team offers{' '}
        <Link href={consultingPageHref} noBreadcrumb>
          consulting
        </Link>
        .
      </SectionDescription>
    </SupporterSection>
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
