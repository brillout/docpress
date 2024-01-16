export { Sponsors }
export type { Sponsor }

import React from 'react'
import iconHeart from '../icons/heart.svg'
import { usePageContext } from '../renderer/usePageContext'
import { assert, Emoji } from '../utils/server'
import { Supporter, SupporterSection, SectionDescription, Individuals, SupporterImg, CallToAction } from './Supporters'
import medalGold from './Sponsors/medalGold.svg'
import medalSilver from './Sponsors/medalSilver.svg'
import medalBronze from './Sponsors/medalBronze.svg'
import labelBgImg from './Sponsors/label.svg'
import { sponsorsList } from './Sponsors/sponsorsList'

type Plan = 'indie' | 'bronze' | 'silver' | 'gold' | 'platinum'

type SponsorCompany = {
  companyName: string
  companyLogo: string
  website: string
  plan: Plan
  divSize?: Partial<DivSize>
  github: string
}
type SponsorIndividual = {
  username: string
}
type Sponsor = SponsorCompany | SponsorIndividual

type DivSize = {
  width: number
  height: number
  padding: number
}

function Sponsors() {
  const pageContext = usePageContext()
  const { projectInfo } = pageContext.config
  const sponsorGithubAccount = pageContext.config.sponsorGithubAccount || 'brillout'
  const sponsorsCompanies = sponsorsList.filter(isCompany)
  const sponsorsIndividuals = sponsorsList.filter(isIndividual)
  return (
    <SupporterSection>
      <CallToAction iconUrl={iconHeart} text="Sponsor" href={`https://github.com/sponsors/${sponsorGithubAccount}`} />
      <div></div>
      <SectionDescription>
        {projectInfo.projectNameJsx || projectInfo.projectName} is free and open source, made possible by wonderful
        sponsors.
      </SectionDescription>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-evenly', alignItems: 'end' }}>
        {sponsorsCompanies.map((sponsor, i) => (
          <SponsorDiv sponsor={sponsor} key={i} />
        ))}
      </div>
      <Individuals>
        {sponsorsIndividuals.map((sponsor, i) => (
          <SponsorDiv sponsor={sponsor} key={i} />
        ))}
      </Individuals>
    </SupporterSection>
  )
}

function SponsorDiv({ sponsor }: { sponsor: Sponsor }) {
  if (isIndividual(sponsor)) {
    return <Supporter username={sponsor.username} />
  }
  return <CompanyDiv sponsor={sponsor} />
}

function CompanyDiv({ sponsor }: { sponsor: Sponsor }) {
  assert(isCompany(sponsor))
  const imgSrc = sponsor.companyLogo
  const imgAlt = sponsor.companyName
  const { width, height, padding } = getSize(sponsor)
  const marginHeight = 20
  const marginWidth = 10
  return (
    <a
      href={sponsor.website}
      style={{
        margin: `${marginHeight}px ${marginWidth}px`
      }}
    >
      <Label sponsor={sponsor} />
      <div
        style={{
          backgroundColor: '#f0f0f0',
          borderRadius: 7,
          overflow: 'hidden',
          width,
          maxWidth: `calc(100vw - 2 * var(--main-view-padding) - 2 * ${marginWidth}px)`,
          height,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <SupporterImg {...{ imgSrc, imgAlt, width, height, padding }} />
      </div>
    </a>
  )
}

function Label({ sponsor }: { sponsor: Sponsor }) {
  assert(isCompany(sponsor))
  const labelBg = getLabelBg(sponsor)
  const labelIcon = getLabelIcon(sponsor)
  const labelText = getLabelText(sponsor)
  return (
    <div
      style={{
        top: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        paddingBottom: 1
      }}
    >
      {labelBg}
      {labelIcon}
      {labelText}
    </div>
  )
}

function getLabelBg(sponsor: SponsorCompany) {
  const height = sponsor.plan === 'platinum' ? 32 : 24
  return <img src={labelBgImg} style={{ height, position: 'absolute', bottom: 0, zIndex: -1 }} />
}

function getLabelText(sponsor: SponsorCompany) {
  if (sponsor.plan === 'platinum') {
    return <></>
  }
  let letterSpacing: number | undefined = undefined
  if (['bronze', 'silver', 'gold', 'indie'].includes(sponsor.plan)) {
    letterSpacing = 1
  }
  /*
  if (sponsor.plan === 'indie') {
    letterSpacing = 2
  }
  */
  return (
    <>
      {' '}
      <span
        style={{
          zIndex: 1,
          fontSize: '0.82em',
          position: 'relative',
          top: 0,
          fontWeight: 500,
          color: '#666',
          letterSpacing
        }}
      >
        {capitalizeFirstLetter(sponsor.plan)}
      </span>
    </>
  )
}

function getLabelIcon(sponsor: SponsorCompany) {
  let medalSrc: string
  if (sponsor.plan === 'platinum') {
    return <Emoji name="trophy" style={{ fontSize: '1.3em' }} />
  } else if (sponsor.plan === 'indie') {
    return <Emoji name="ribbon" style={{ fontSize: '0.9em' /*, position: 'relative', top: -1*/ }} />
  } else if (sponsor.plan === 'gold') {
    medalSrc = medalGold
  } else if (sponsor.plan === 'silver') {
    medalSrc = medalSilver
  } else if (sponsor.plan === 'bronze') {
    medalSrc = medalBronze
  } else {
    assert(false)
  }
  return <img src={medalSrc} style={{ height: 15, zIndex: 1, marginRight: 5 }} />
}

function getSize(sponsor: SponsorCompany): DivSize {
  const { plan } = sponsor
  let divSize: DivSize | undefined
  if (plan === 'platinum') {
    divSize = { width: 500, height: 180, padding: 100 }
  }
  if (plan === 'gold') {
    divSize = { width: 400, height: 150, padding: 95 }
  }
  if (plan === 'silver') {
    divSize = { width: 300, height: 100, padding: 45 }
  }
  if (plan === 'bronze') {
    divSize = { width: 200, height: 70, padding: 30 }
  }
  if (plan === 'indie') {
    divSize = { width: 140, height: 50, padding: 20 }
  }
  assert(divSize)
  if (sponsor.divSize) {
    Object.assign(divSize, sponsor.divSize)
  }
  return divSize
}

function capitalizeFirstLetter(word: string): string {
  return word[0].toUpperCase() + word.slice(1)
}

function isCompany(sponsor: Sponsor): sponsor is SponsorCompany {
  return !isIndividual(sponsor)
}
function isIndividual(sponsor: Sponsor): sponsor is SponsorIndividual {
  return 'username' in sponsor
}
