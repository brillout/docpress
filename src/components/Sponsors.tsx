export { Sponsors }
export type { Sponsor }

import React from 'react'
import iconHeart from '../icons/heart.svg'
import { usePageContext } from '../renderer/usePageContext'
import { assert, Emoji } from '../utils/server'
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
    <div style={{ textAlign: 'center', marginTop: 19 }}>
      <a
        className="button"
        href={`https://github.com/sponsors/${sponsorGithubAccount}`}
        style={{
          color: 'inherit',
          display: 'inline-flex',
          alignItems: 'center',
          padding: '5px 10px',
          marginBottom: 10
        }}
      >
        <img src={iconHeart} height={22} /> <span style={{ marginLeft: 7, fontSize: '1.07em' }}>Sponsor</span>
      </a>
      <div></div>
      <div style={{ maxWidth: 400, display: 'inline-block', marginTop: 12, marginBottom: 12 }}>
        {projectInfo.projectNameJsx || projectInfo.projectName} is free and open source, made possible by wonderful
        sponsors.
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-evenly', alignItems: 'end' }}>
        {sponsorsCompanies.map((sponsor, i) => (
          <SponsorDiv sponsor={sponsor} key={i} />
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'end',
          margin: '17px auto',
          maxWidth: 700
        }}
      >
        {sponsorsIndividuals.map((sponsor, i) => (
          <SponsorDiv sponsor={sponsor} key={i} />
        ))}
      </div>
    </div>
  )
}

function SponsorDiv({ sponsor }: { sponsor: Sponsor }) {
  let imgSrc: string
  let imgAlt: string | undefined
  let width: number
  let height: number
  let website: string
  let padding: number
  let marginHeight: number
  let marginWidth: number
  let backgroundColor = '#f0f0f0'
  let label: null | JSX.Element = null
  if (isIndividual(sponsor)) {
    website = `https://github.com/${sponsor.username}`
    imgSrc = `https://github.com/${sponsor.username}.png?size=30`
    width = 30
    height = 30
    padding = 0
    marginHeight = 5
    marginWidth = 5
    backgroundColor = 'none'
  } else {
    imgSrc = sponsor.companyLogo
    website = sponsor.website
    const size = getSize(sponsor)
    width = size.width
    height = size.height
    padding = size.padding
    imgAlt = sponsor.companyName
    marginHeight = 20
    marginWidth = 10
    label = <Label sponsor={sponsor} />
  }
  return (
    <a
      href={website}
      style={{
        margin: `${marginHeight}px ${marginWidth}px`
      }}
    >
      {label}
      <div
        style={{
          backgroundColor,
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
        <img
          style={{ width: `calc(100% - ${padding}px)`, height: height - padding, zIndex: 2, objectFit: 'contain' }}
          src={imgSrc}
          alt={imgAlt}
        />
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
