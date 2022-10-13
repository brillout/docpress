import React from 'react'
import iconHeart from '../icons/heart.svg'
import { usePageContext } from '../renderer/usePageContext'
import { assert } from '../utils'
import ccoliLogo from './Sponsors/companyLogos/ccoli.svg'
import contraLogo from './Sponsors/companyLogos/contra.svg'
import mfqsLogo from './Sponsors/companyLogos/mfqs.svg'
import medalGold from './Sponsors/medalGold.svg'
import medalSilver from './Sponsors/medalSilver.svg'
import medalBronze from './Sponsors/medalBronze.svg'
import labelBgImg from './Sponsors/label.svg'
import { Emoji } from '../utils/Emoji'

export { Sponsors }

type Plan = 'FREE_SLOT' | 'bronze' | 'silver' | 'gold' | 'platinum'

type SponsorCompany = {
  companyName: string
  companyLogo: string
  website: string
  plan: Plan
}
type SponsorIndividual = {
  username: string
}
type Sponsor = SponsorCompany | SponsorIndividual

const sponsors: Sponsor[] = [
  {
    companyName: 'Contra',
    companyLogo: contraLogo,
    plan: 'gold',
    website: 'https://contra.com'
  },
  {
    companyName: 'ccoli',
    companyLogo: ccoliLogo,
    plan: 'silver',
    website: 'https://ccoli.co'
  },
  {
    companyName: 'My Favorite Quilt Store',
    companyLogo: mfqsLogo,
    plan: 'bronze',
    website: 'https://myfavoritequiltstore.com'
  },
  {
    username: 'spacedawwwg'
  },
  {
    username: 'codthing'
  },
  {
    username: 'Junaidhkn'
  },
  {
    username: 'zgfdev'
  }
]

function Sponsors() {
  const pageContext = usePageContext()
  const { projectInfo } = pageContext.config
  return (
    <div style={{ textAlign: 'center', marginTop: 19 }}>
      <a
        className="button"
        href="https://github.com/sponsors/brillout"
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
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'end' }}>
        {sponsors.map((sponsor, i) => (
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
  let backgroundColor = '#f0f0f0'
  let label: null | JSX.Element = null
  if ('username' in sponsor) {
    website = `https://github.com/${sponsor.username}`
    imgSrc = `https://github.com/${sponsor.username}.png?size=30`
    width = 30
    height = 30
    padding = 0
    backgroundColor = 'none'
  } else {
    imgSrc = sponsor.companyLogo
    website = sponsor.website
    const size = getSize(sponsor.plan)
    width = size.width
    height = size.height
    padding = size.padding
    imgAlt = sponsor.companyName
    label = <Label sponsor={sponsor} />
  }
  const marginWidth = 5
  return (
    <a
      href={website}
      style={{
        margin: `10px ${marginWidth}px`
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
          style={{ width: `calc(100% - ${padding}px)`, height: height - padding, zIndex: 2 }}
          src={imgSrc}
          alt={imgAlt}
        />
      </div>
    </a>
  )
}

function Label({ sponsor }: { sponsor: Sponsor }) {
  assert(!('username' in sponsor))
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
  const letterSpacing = ['bronze', 'silver', 'gold'].includes(sponsor.plan) ? 1 : undefined
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

function getSize(plan: Plan) {
  if (plan === 'platinum') {
    assert(false)
  }
  if (plan === 'gold') {
    return { width: 400, height: 150, padding: 95 }
  }
  if (plan === 'silver') {
    return { width: 300, height: 100, padding: 45 }
  }
  if (plan === 'bronze') {
    return { width: 200, height: 70, padding: 30 }
  }
  if (plan === 'FREE_SLOT') {
    return { width: 150, height: 40, padding: 15 }
  }
  assert(false)
}

function capitalizeFirstLetter(word: string): string {
  return word[0].toUpperCase() + word.slice(1)
}
