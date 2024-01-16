export { Consulting, ConsultingText, Consultants }

import React from 'react'
import iconPeople from '../icons/people.svg'
import { usePageContext } from '../renderer/usePageContext'
import { SupporterSection, SectionDescription, CallToAction } from './Supporters'
import { Maintainer } from './Contributors'
import { maintainers } from './maintainersList'
import { Link } from './Link'
const consultingPageHref = '/consutling'

function Consulting() {
  return (
    <SupporterSection>
      <CallToAction iconUrl={iconPeople} text="Consulting" href={consultingPageHref} />
      <div></div>
      <SectionDescription>
        <ConsultingText />
      </SectionDescription>
    </SupporterSection>
  )
}

function ConsultingText() {
  const pageContext = usePageContext()
  const { projectInfo } = pageContext.config
  const projectName = projectInfo.projectNameJsx || projectInfo.projectName
  return (
    <>
      For questions and issues related to {projectName}, open a{' '}
      <a href={projectInfo.githubDiscussions || projectInfo.githubIssues}>GitHub Discussion</a>. For advanced help or
      for help not directly related to {projectName}, the {projectName} team offers{' '}
      <Link href={consultingPageHref} noBreadcrumb>
        consulting
      </Link>
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
