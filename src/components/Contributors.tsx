export { Contributors }

import React from 'react'
import { usePageContext } from '../renderer/usePageContext'
import { Supporter, SupporterSection, SectionDescription, Individuals, SupporterImg } from './Supporters'
import { maintainers } from './maintainersList'
import { contributors } from 'vike-contributors' // sorted by number of contributions

function Contributors() {
  const pageContext = usePageContext()
  const { projectInfo } = pageContext.config
  return (
    <SupporterSection>
      <SectionDescription>
        {projectInfo.projectNameJsx || projectInfo.projectName} is built and maintained by passionate contributors.
      </SectionDescription>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-evenly', alignItems: 'end' }}>
        {maintainers.map((maintainer, i) => (
          <Maintainer maintainer={maintainer} key={i} />
        ))}
      </div>
      <Individuals>
        {contributors
          .filter((contributor) => {
            return (
              !contributor.login.includes('[bot]') && !maintainers.map((m) => m.username).includes(contributor.login)
            )
          })
          .map((contributor, i) => (
            <Supporter username={contributor.login} avatarUrl={contributor.avatarUrl} key={i} />
          ))}
      </Individuals>
    </SupporterSection>
  )
}

function Maintainer({ maintainer }: { maintainer: (typeof maintainers)[0] }) {
  const marginHeight = 20
  const marginWidth = 10
  const imgSize = 50
  const githubUrl = `https://github.com/${maintainer.username}`
  return (
    <div
      style={{
        borderRadius: 7,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#e0e0e0',
        overflow: 'hidden',
        width: 430,
        maxWidth: `calc(100vw - 2 * var(--main-view-padding) - 2 * ${marginWidth}px)`,
        margin: `${marginHeight}px ${marginWidth}px`,
        display: 'flex',
        padding: 20,
        gap: 20,
        textAlign: 'left'
      }}
    >
      <a href={githubUrl}>
        <div style={{ width: imgSize, height: imgSize, borderRadius: imgSize / 2, overflow: 'hidden' }}>
          <SupporterImg
            username={maintainer.username}
            avatarUrl={getAvatarUrl(maintainer)}
            imgAlt={maintainer.firstName}
            width={imgSize}
            height={imgSize}
          />
        </div>
      </a>
      <div>
        <b>{maintainer.firstName}</b> ·{' '}
        <a href={githubUrl}>
          <i style={{ fontSize: '.9em', color: '#505050' }}>{maintainer.username}</i>
        </a>
        {maintainer.consultingUrl ? (
          <>
            {' '}
            ·{' '}
            <a href={maintainer.consultingUrl}>
              <b
                style={{
                  fontSize: '.7em',
                  color: 'white',
                  backgroundColor: '#305090',
                  padding: '1px 5px 2px 5px',
                  verticalAlign: 'text-top',
                  borderRadius: 3
                }}
              >
                consulting
              </b>
            </a>
          </>
        ) : null}
        <ul style={{ fontSize: '.8em', paddingLeft: 15, marginTop: 5, marginBottom: 0 }}>
          {maintainer.roles.map((role, i) => (
            <li key={i}>{role}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function getAvatarUrl(maintainer: (typeof maintainers)[0]) {
  for (const contributor of contributors) {
    if (maintainer.username === contributor.login) {
      return contributor.avatarUrl
    }
  }
  throw new Error(`Maintainer ${maintainer.username} not found in contributors' list.`)
}
